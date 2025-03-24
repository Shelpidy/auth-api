import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';  // Add this import
import { JwtModule } from '@nestjs/jwt';
import { oauthConfig } from 'src/config/oauth.config';

@Module({
  imports: [
    DatabaseModule,
        JwtModule.register({
          secret: oauthConfig.jwt.secret,
          signOptions: { expiresIn: '24h' },
        }),
        AuthModule
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
