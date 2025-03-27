import {
  Injectable,
  Inject,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
import {
  SignUpDto,
  SignInDto,
  VerifyOtpDto,
  ResendOtpDto,
  NewPasswordDto,
  ForgotPasswordDto,
} from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { comparePassword, hashPassword } from '../utils/auth';
import { MailService } from '../mail/mail.service';
import { nanoid } from 'nanoid';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
    private mailService: MailService,
    private readonly tenantsService: TenantsService,
  ) {}

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async signUp(signUpDto: SignUpDto) {
    const {
      email,
      username,
      password,
      user_profile,
      user_location,
      tenant_nano_id,
    } = signUpDto;

    // Validate tenant exists if tenant_nano_id is provided
    if (tenant_nano_id) {
      const tenant = await this.tenantsService.findOne(tenant_nano_id);
      if (!tenant) {
        throw new NotFoundException(
          `Tenant with nano_id ${tenant_nano_id} does not exist.`,
        );
      }
    }

    const result = await this.db.transaction(async (tx) => {
      const user_nano_id = nanoid();
      const otp = this.generateOTP();

      const [user] = await tx
        .insert(schema.users)
        .values({
          user_nano_id,
          username,
          email,
          password: await hashPassword(password),
          tenant_nano_id: tenant_nano_id ? tenant_nano_id : null,
          is_verified: false,
          created_by: user_profile.full_name,
          created_on: new Date(),
          // ...other fields will use defaults or be null...
        })
        .returning();

      await tx.insert(schema.user_profiles).values({
        ...user_profile,
        user_profile_nano_id: nanoid(),
        user_nano_id: user_nano_id,
        created_by: user_profile.full_name,
        created_on: new Date(),
      });

      await tx.insert(schema.user_auths).values({
        user_auth_nano_id: nanoid(),
        user_nano_id: user_nano_id,
        otp: otp,
        otp_expiry: new Date(Date.now() + 600000),
        created_by: user_profile.full_name,
        created_on: new Date(),
      });

      if (user_location) {
        await tx.insert(schema.user_locations).values({
          ...user_location,
          user_location_nano_id: nanoid(),
          user_nano_id: user_nano_id,
          created_by: user_profile.full_name,
          created_on: new Date(),
        });
      }

      // Assign default role
      const defaultRole = await tx.query.roles.findFirst({
        where: eq(schema.roles.name, 'authenticated'),
      });

      let userRole: any = null;
      if (defaultRole) {
        [userRole] = await tx
          .insert(schema.user_roles)
          .values({
            user_nano_id: user.user_nano_id,
            role_nano_id: defaultRole.role_nano_id,
          })
          .returning();
      }
      return { user, otp };
    });

    await this.mailService.sendVerificationEmail(email, result.otp);

    // Re-query full user with related profile and locations
    const completeUser = await this.db.query.users.findFirst({
      where: eq(schema.users.user_nano_id, result.user.user_nano_id),
      with: {
        user_profile: true,
        user_location: true,
        user_roles: {
          with: {
            role: true,
          },
        },
      },
    });

    // Remove password before returning
    // @ts-ignore
    const { password: _, ...safeUser } = completeUser;
    return safeUser;
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    let user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
      with: {
        user_profile: true,
        user_location: true,
        tenant: true,
        user_roles: {
          with: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("Email doesn't exist");
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    const token = this.jwtService.sign({
      user_nano_id: user.user_nano_id,
      roles: user.user_roles.map((ur) => ur.role?.name),
    });

    // Update last login details
    const [auth] = await this.db
      .update(schema.user_auths)
      .set({ last_login_at: new Date() })
      .where(eq(schema.user_auths.user_nano_id, user.user_nano_id))
      .returning();

    // Remove sensitive fields
    const { password: _, ...userWithoutPassword } = user;
    return {
      message: 'Sign in successful',
      user: {
        ...userWithoutPassword,
        auth: {
          last_login_at: auth.last_login_at,
          last_login_ip: auth.last_login_ip,
        },
      },
      token,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyOtpDto) {
    const { email, otp } = verifyEmailDto;
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
      with: { user_auth: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_verified) {
      throw new UnauthorizedException('Email is already verified');
    }

    if (
      !user.user_auth?.otp ||
      user.user_auth.otp !== otp ||
      !user.user_auth.otp_expiry ||
      user.user_auth.otp_expiry < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    await this.db.transaction(async (tx) => {
      await tx
        .update(schema.users)
        .set({ is_verified: true })
        .where(eq(schema.users.user_nano_id, user.user_nano_id));

      await tx
        .update(schema.user_auths)
        .set({ otp: null, otp_expiry: null })
        .where(eq(schema.user_auths.user_nano_id, user.user_nano_id));
    });

    return { message: 'Email verified successfully' };
  }

  async resendOtp(resendOtp: ResendOtpDto) {
    const { email } = resendOtp;
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
      with: { user_auth: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_verified) {
      throw new UnauthorizedException('Email is already verified');
    }

    const otp = this.generateOTP();
    const otpExpiry = new Date(Date.now() + 600000);

    await this.db
      .update(schema.user_auths)
      .set({ otp, otp_expiry: otpExpiry })
      .where(eq(schema.user_auths.user_nano_id, user.user_nano_id));

    await this.mailService.sendVerificationEmail(email, otp);

    return { message: 'New verification code sent successfully' };
  }

  async forgotPassword(resetPasswordDto: ForgotPasswordDto) {
    const { email } = resetPasswordDto;
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = this.generateOTP();
    const otpExpiry = new Date(Date.now() + 600000);

    await this.db
      .update(schema.user_auths)
      .set({ otp, otp_expiry: otpExpiry })
      .where(eq(schema.user_auths.user_nano_id, user.user_nano_id));

    await this.mailService.sendPasswordResetEmail(email, otp);

    return { message: 'Password reset instructions sent to your email' };
  }

  async resetPassword(newPasswordDto: NewPasswordDto) {
    const { email, otp, new_password } = newPasswordDto;

    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
      with: { user_auth: true },
    });

    if (
      !user ||
      !user.user_auth?.otp ||
      user.user_auth.otp !== otp ||
      !user.user_auth.otp_expiry ||
      user.user_auth.otp_expiry < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.db.transaction(async (tx) => {
      await tx
        .update(schema.user_auths)
        .set({ otp: null, otp_expiry: null })
        .where(eq(schema.user_auths.user_nano_id, user.user_nano_id));

      await tx
        .update(schema.users)
        .set({ password: await hashPassword(new_password) })
        .where(eq(schema.users.user_nano_id, user.user_nano_id));
    });

    return { message: 'Password reset successful' };
  }

  async oauthCallback(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from authentication provider');
    }

    const user = req.user;
    const token = this.jwtService.sign({
      user_nano_id: user.user_nano_id,
      roles: user.user_roles?.map((ur) => ur.role?.name) || [],
    });

    // Update last login
    await this.db
      .update(schema.user_auths)
      .set({ last_login_at: new Date() })
      .where(eq(schema.user_auths.user_nano_id, user.user_nano_id));

    return {
      message: 'OAuth authentication successful',
      user,
      token,
    };
  }
}
