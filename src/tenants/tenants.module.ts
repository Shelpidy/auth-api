import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { oauthConfig } from '../config/oauth.config';
import { CommonModule } from '../common/common.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MailModule,
    DatabaseModule,
    CommonModule,
    JwtModule.register({
      secret: oauthConfig.jwt.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
