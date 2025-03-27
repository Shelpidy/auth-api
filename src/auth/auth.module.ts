import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from '../mail/mail.module';
import { DatabaseModule } from '../database/database.module';
import { oauthConfig } from '../config/oauth.config';
import { GoogleStrategy } from './strategies/google.strategy';
// import { MicrosoftStrategy } from './strategies/microsoft.strategy';
// import './config/passport.config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ManagerGuard } from './guards/manager.gaurd';
import { TenantsService } from 'src/tenants/tenants.service';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: oauthConfig.jwt.secret,
      signOptions: { expiresIn: '336h' },
    }),
    MailModule,
    TenantsModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    // MicrosoftStrategy,
    JwtAuthGuard,
    AdminGuard,
    ManagerGuard,
  ],
  exports: [AuthService, JwtAuthGuard, AdminGuard, ManagerGuard],
})
export class AuthModule {}
