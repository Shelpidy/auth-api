import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { CustomLogger } from './config/logger.config';
import { RolesModule } from './roles/roles.module';
import { SmsModule } from './sms/sms.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    MailModule,
    UsersModule,
    TenantsModule,
    RolesModule,
    SmsModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService, CustomLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
