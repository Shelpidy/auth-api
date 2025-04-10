import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from '../mail/mail.module';
import { DatabaseModule } from '../database/database.module';
import { oauthConfig } from '../config/oauth.config';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
// import { AppleOAuthStrategy } from './strategies/apple.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ManagerGuard } from './guards/manager.gaurd';
import { TenantsModule } from 'src/tenants/tenants.module';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { MailService } from 'src/mail/mail.service';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    MailModule,
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: oauthConfig.jwt.secret,
      signOptions: { expiresIn: '336h' },
    }),
    MailModule,
    SmsModule,
    TenantsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    FacebookStrategy,
    MicrosoftStrategy,
    // AppleOAuthStrategy,
    JwtAuthGuard,
    AdminGuard,
    ManagerGuard,
    SuperAdminGuard,
  ],
  exports: [AuthService, JwtAuthGuard, AdminGuard, ManagerGuard,SuperAdminGuard,AuthService],
})
export class AuthModule {}
