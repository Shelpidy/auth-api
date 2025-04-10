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
import { eq, sql } from 'drizzle-orm';
import {
  SignUpDto,
  SignInDto,
  VerifyOtpDto,
  ResendOtpDto,
  NewPasswordDto,
  ForgotPasswordDto,
} from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { SmsService } from '../sms/sms.service';
import { nanoid } from 'nanoid';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class AuthService {
  private readonly defaultEmailSettings = {
    email_smtp_server: process.env.SMTP_HOST,
    email_smtp_email: process.env.SMTP_FROM,
    email_smtp_username: process.env.SMTP_USER,
    email_smtp_password: process.env.SMTP_PASS,
    email_smtp_ssl_port: process.env.SMTP_PORT,
    email_smtp_tls_port: process.env.SMTP_PORT,
    email_smtp_is_ssl: true,
    email_smtp_is_tls: true,
    email_smtp_authentication: true,
    email_smtp_full_name: process.env.SMTP_FROM_NAME || 'System',
    is_default: true,
  };

  private readonly defaultSmsSettings = {
    sms_authorization_endpoint: process.env.SMS_API_URL,
    sms_authorization_key: process.env.SMS_API_KEY,
    sms_authorization_sender: process.env.SMS_SENDER,
    sms_authorization_api_key: process.env.SMS_API_KEY,
    is_default: true,
  };

  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
    private mailService: MailService,
    private smsService: SmsService,
    private readonly tenantsService: TenantsService,
  ) {}

  private async logAuditChange(params: {
    table_name: string;
    record_id: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    old_data?: any;
    new_data: any;
    tenant_id: string;
    user_id: string;
    change_by_login_ip?: string;
  }) {
    await this.db.insert(schema.audit_logs).values({
      audit_log_id: `tpe${nanoid(19)}`,
      tenant_id: params.tenant_id,
      table_name: params.table_name,
      record_id: params.record_id,
      action: params.action,
      old_data: params.old_data,
      new_data: params.new_data,
      change_by_login_ip: params.change_by_login_ip,
      created_by: params.user_id,
      modified_by: params.user_id,
      created_on: new Date(),
      modified_on: new Date(),
    });
  }

  async checkUserConflicts(params: {
    email?: string;
    primary_phone?: string;
    username?: string;
    user_id?: string; // For updates
  }) {
    const { email, primary_phone, username, user_id } = params;

    if (email) {
      const existingEmail = await this.db.query.users.findFirst({
        where: user_id
          ? sql`${schema.users.email} = ${email} AND ${schema.users.user_id} != ${user_id}`
          : eq(schema.users.email, email),
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    if (primary_phone) {
      const existingPhone = await this.db.query.users.findFirst({
        where: user_id
          ? sql`${schema.users.primary_phone} = ${primary_phone} AND ${schema.users.user_id} != ${user_id}`
          : eq(schema.users.primary_phone, primary_phone),
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    if (username) {
      const existingUsername = await this.db.query.users.findFirst({
        where: user_id
          ? sql`${schema.users.username} = ${username} AND ${schema.users.user_id} != ${user_id}`
          : eq(schema.users.username, username),
      });
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }
  }

  private async getEmailSettings(tenantId: string) {
    const tenantSettings = await this.db.query.email_settings.findFirst({
      where: eq(schema.email_settings.tenant_id, tenantId),
    });

    return tenantSettings || this.defaultEmailSettings;
  }

  private async getSmsSettings(tenantId: string) {
    const tenantSettings = await this.db.query.sms_settings.findFirst({
      where: eq(schema.sms_settings.tenant_id, tenantId),
    });

    return tenantSettings || this.defaultSmsSettings;
  }

  private excludePassword<T extends { password?: string }>(user: T): Omit<T, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async signUp(signUpDto: SignUpDto) {
    // Check for all possible conflicts
    await this.checkUserConflicts({
      email: signUpDto.email,
      primary_phone: signUpDto.primary_phone,
      username: signUpDto.username,
    });

    if (signUpDto.user_data) {
      await this.validateUserData(signUpDto.user_data);
    }

    const user = await this.db.transaction(async (tx) => {
      const user_id = `tpe${nanoid(19)}`;
      const user_data_id = `tpe${nanoid(19)}`;
      const user_auth_id = `tpe${nanoid(19)}`;
      const user_role_id = `tpe${nanoid(19)}`;
      const now = new Date();

      // Insert user
      const [user] = await tx
        .insert(schema.users)
        .values({
          user_id,
          username: signUpDto.username,
          email: signUpDto.email,
          primary_phone: signUpDto.primary_phone,
          password: await bcrypt.hash(signUpDto.password, 10),
          language_code: signUpDto.language_code || 'en',
          timezone: signUpDto.timezone || 'UTC',
          display_name: signUpDto.display_name,
          nice_name: signUpDto.nice_name,
          photo: signUpDto.photo,
          tenant_id: signUpDto.tenant_id,
          created_by: signUpDto.username,
          modified_by: signUpDto.username,
          created_on: now,
          modified_on: now,
          status: 'active',
          is_verified: false,
        })
        .returning();

      // Insert user_data with all required fields
      await tx.insert(schema.user_data).values({
        user_data_id,
        user_id,
        tenant_id: signUpDto.tenant_id,
        ...signUpDto.user_data,
        created_by: signUpDto.user_data.full_name,
        modified_by: signUpDto.user_data.full_name,
        created_on: now,
        modified_on: now,
      });

      // Insert user_auth
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await tx.insert(schema.user_auths).values({
        user_auth_id,
        user_id,
        tenant_id: signUpDto.tenant_id,
        otp,
        otp_expiry: otpExpiry,
        created_by: signUpDto.username,
        modified_by: signUpDto.username,
        created_on: now,
        modified_on: now,
      });

      // Assign default authenticated role
      const [authenticatedRole] = await tx
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.name, 'authenticated'))
        .limit(1);

      if (authenticatedRole) {
        await tx.insert(schema.user_roles).values({
          user_role_id,
          role_id: authenticatedRole.role_id,
          user_id: user.user_id,
          tenant_id: user.tenant_id,
          created_by: signUpDto.username,
          modified_by: signUpDto.username,
          created_on: now,
          modified_on: now,
        });
      }

      // Get email/SMS settings with fallback to defaults
      const emailSettings = await this.getEmailSettings(signUpDto.tenant_id || '');
      const smsSettings = await this.getSmsSettings(signUpDto.tenant_id || '');

      // Send verification based on contact method
      if (signUpDto.email) {
        await this.mailService.sendOtp(signUpDto.email, otp, emailSettings);
      } else if (signUpDto.primary_phone) {
        await this.smsService.sendOtp(signUpDto.primary_phone, otp, smsSettings);
      }
      return user;
    });

    // Log user creation
    await this.logAuditChange({
      table_name: 'users',
      record_id: user.user_id,
      action: 'CREATE',
      new_data: user,
      tenant_id: signUpDto.tenant_id || '',
      user_id: signUpDto.user_data.full_name,
    });

    return {
      message: 'User registered successfully',
      data: this.excludePassword(user),
    };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.db.query.users.findFirst({
      where: signInDto.email
        ? eq(schema.users.email, signInDto.email)
        : eq(schema.users.primary_phone, signInDto.primary_phone || ''),
      with: {
        user_data: true,
        user_roles: {
          with: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(signInDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate and send 2FA OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    await this.db
      .update(schema.user_auths)
      .set({ otp, otp_expiry: otpExpiry })
      .where(eq(schema.user_auths.user_id, user.user_id));

    // Get email/SMS settings with fallback to defaults
    const emailSettings = await this.getEmailSettings(user.tenant_id || '');
    const smsSettings = await this.getSmsSettings(user.tenant_id || '');

    if (user.email) {
      await this.mailService.sendOtp(user.email, otp, emailSettings);
      return {
        message: `OTP sent to your email ${user.email.replace(/(?<=.{3}).(?=.*@)/g, '*')}`,
        requires_2fa: true,
      };
    } else if (user.primary_phone) {
      await this.smsService.sendOtp(user.primary_phone, otp, smsSettings);
      return {
        message: `OTP sent to your phone ${user.primary_phone.replace(/(?<=.{3}).(?=.{2})/g, '*')}`,
        requires_2fa: true,
      };
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.db.query.users.findFirst({
      where: verifyOtpDto.email
        ? eq(schema.users.email, verifyOtpDto.email)
        : eq(schema.users.primary_phone, verifyOtpDto.primary_phone || ''),
      with: {
        user_data: true,
        user_auth: true,
        user_roles: {
          with: {
            role: true,
          },
        },
      },
    });

    if (
      !user ||
      user.user_auth?.otp !== verifyOtpDto.otp ||
      (user.user_auth?.otp_expiry && new Date() > new Date(user.user_auth?.otp_expiry))
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Clear OTP after successful verification
    await this.db
      .update(schema.user_auths)
      .set({ otp: null, otp_expiry: null })
      .where(eq(schema.user_auths.user_id, user.user_id));

    const payload = {
      user_id: user.user_id,
      email: user.email,
      tenant_id: user.tenant_id, // Add tenant_id to JWT
      roles: user.user_roles.map((ur) => ur?.role?.name),
    };

    return {
      token: this.jwtService.sign(payload),
      message: user.email
        ? `Successfully verified email ${user.email.replace(/(?<=.{3}).(?=.*@)/g, '*')}`
        : `Successfully verified phone ${(user.primary_phone || '').replace(/(?<=.{3}).(?=.{2})/g, '*')}`,
      user: this.excludePassword(user),
    };
  }

  async resendOtp(resendOtp: ResendOtpDto) {
    const { email, primary_phone } = resendOtp;
    const user = await this.db.query.users.findFirst({
      where: email
        ? eq(schema.users.email, email)
        : eq(schema.users.primary_phone, primary_phone || ''),
      with: { user_auth: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 600000);

    await this.db
      .update(schema.user_auths)
      .set({ otp, otp_expiry: otpExpiry })
      .where(eq(schema.user_auths.user_id, user.user_id));

    // Get email/SMS settings with fallback to defaults
    const emailSettings = await this.getEmailSettings(user.tenant_id || '');
    const smsSettings = await this.getSmsSettings(user.tenant_id || '');

    if (email) {
      await this.mailService.sendOtp(email, otp, emailSettings);
    } else if (primary_phone) {
      await this.smsService.sendOtp(primary_phone, otp, smsSettings);
    }

    return { message: 'New verification code sent successfully' };
  }

  async forgotPassword(resetPasswordDto: ForgotPasswordDto) {
    const { email, primary_phone } = resetPasswordDto;
    const user = await this.db.query.users.findFirst({
      where: email
        ? eq(schema.users.email, email)
        : eq(schema.users.primary_phone, primary_phone || ''),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 600000);

    await this.db
      .update(schema.user_auths)
      .set({ otp, otp_expiry: otpExpiry })
      .where(eq(schema.user_auths.user_id, user.user_id));

    // Get email/SMS settings with fallback to defaults
    const emailSettings = await this.getEmailSettings(user.tenant_id || '');
    const smsSettings = await this.getSmsSettings(user.tenant_id || '');

    if (email) {
      await this.mailService.sendOtp(email, otp, emailSettings);
    } else if (primary_phone) {
      await this.smsService.sendOtp(primary_phone, otp, smsSettings);
    }

    return { message: 'Password reset instructions sent to your contact method' };
  }

  async resetPassword(newPasswordDto: NewPasswordDto) {
    const { email, primary_phone, otp, new_password } = newPasswordDto;

    const user = await this.db.query.users.findFirst({
      where: email
        ? eq(schema.users.email, email)
        : eq(schema.users.primary_phone, primary_phone || ''),
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

    if (await bcrypt.compare(new_password, user.password)) {
      throw new ConflictException('New password must be different from current password');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await this.db.transaction(async (tx) => {
      await tx
        .update(schema.user_auths)
        .set({ otp: null, otp_expiry: null })
        .where(eq(schema.user_auths.user_id, user.user_id));

      await tx
        .update(schema.users)
        .set({ password: hashedPassword })
        .where(eq(schema.users.user_id, user.user_id));

      // Log password reset
      await this.logAuditChange({
        table_name: 'users',
        record_id: user.user_id,
        action: 'UPDATE',
        old_data: { password: user.password },
        new_data: { password: hashedPassword },
        tenant_id: user.tenant_id || '',
        user_id: user.user_id,
      });
    });

    return { message: 'Password reset successful' };
  }

  async oauthCallback(req: any) {
    if (!req.user?.email) {
      throw new BadRequestException('Email is required from OAuth provider');
    }

    const { email, full_name, first_name, last_name, photo, provider } = req.user;

    // Check conflicts for OAuth signup
    await this.checkUserConflicts({
      email,
      username: email.split('@')[0],
    });

    const existingUser = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
      with: {
        user_roles: {
          with: { role: true },
        },
      },
    });

    if (existingUser) {
      // Update last login for existing user
      const now = new Date();
      await this.db
        .update(schema.user_auths)
        .set({ last_login_at: now })
        .where(eq(schema.user_auths.user_id, existingUser.user_id));

      const token = this.jwtService.sign({
        sub: existingUser.user_id,
        email: existingUser.email,
        tenant_id: existingUser.tenant_id,
        roles: existingUser.user_roles?.map((ur) => ur.role?.name) || [],
      });

      return {
        message: `Successfully logged in with ${provider}`,
        user: this.excludePassword(existingUser),
        token,
      };
    }

    // Create new user from OAuth with conflict checks
    const newUser = await this.db.transaction(async (tx) => {
      const user_id = `tpe${nanoid(19)}`;
      const user_data_id = `tpe${nanoid(19)}`;
      const user_auth_id = `tpe${nanoid(19)}`;
      const user_role_id = `tpe${nanoid(19)}`;
      const now = new Date();

      const [user] = await tx
        .insert(schema.users)
        .values({
          user_id,
          email,
          username: email.split('@')[0],
          display_name: full_name,
          photo,
          password: await bcrypt.hash(nanoid(), 10),
          is_verified: true,
          created_by: email,
          modified_by: email,
          created_on: now,
          modified_on: now,
          status: 'active',
        })
        .returning();

      await tx.insert(schema.user_data).values({
        user_data_id,
        user_id,
        full_name,
        first_name,
        last_name,
        created_by: email,
        modified_by: email,
        created_on: now,
        modified_on: now,
      });

      await tx.insert(schema.user_auths).values({
        user_auth_id,
        user_id,
        last_login_at: now,
        created_by: email,
        modified_by: email,
        created_on: now,
        modified_on: now,
      });

      // Assign authenticated role
      const [authenticatedRole] = await tx
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.name, 'authenticated'))
        .limit(1);

      if (authenticatedRole) {
        await tx.insert(schema.user_roles).values({
          user_role_id,
          role_id: authenticatedRole.role_id,
          user_id,
          created_by: email,
          modified_by: email,
          created_on: now,
          modified_on: now,
        });
      }

      // Log new user creation
      await this.logAuditChange({
        table_name: 'users',
        record_id: user.user_id,
        action: 'CREATE',
        new_data: user,
        tenant_id: user.tenant_id || '',
        user_id: user.user_id,
      });

      return user;
    });

    return {
      message: `Successfully registered with ${provider}`,
      data: {
        user: this.excludePassword(newUser),
        token: this.jwtService.sign({
          user_id: newUser.user_id,
          email: newUser.email,
          tenant_id: newUser.tenant_id,
          roles: ['authenticated'],
        }),
      },
    };
  }

  private async validateUserData(userData: any) {
    // Check secondary email/phone if provided
    if (userData.secondary_email) {
      const existingSecondaryEmail = await this.db.query.user_data.findFirst({
        where: eq(schema.user_data.secondary_email, userData.secondary_email),
      });
      if (existingSecondaryEmail) {
        throw new ConflictException('Secondary email already exists');
      }
    }

    if (userData.secondary_phone) {
      const existingSecondaryPhone = await this.db.query.user_data.findFirst({
        where: eq(schema.user_data.secondary_phone, userData.secondary_phone),
      });
      if (existingSecondaryPhone) {
        throw new ConflictException('Secondary phone already exists');
      }
    }
  }
}
