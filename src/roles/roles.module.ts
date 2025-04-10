import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { CommonModule } from '../common/common.module';
import { JwtModule } from '@nestjs/jwt';
import { oauthConfig } from '../config/oauth.config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    DatabaseModule, 
    CommonModule,
    AuthModule,
    JwtModule.register({
      secret: oauthConfig.jwt.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService]
})
export class RolesModule {}
