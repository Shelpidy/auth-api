import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { oauthConfig } from '../config/oauth.config';
import { AuditService } from '../common/services/audit.service';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: oauthConfig.jwt.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [TenantsController],
  providers: [TenantsService, AuditService],
  exports: [TenantsService],
})
export class TenantsModule {}
