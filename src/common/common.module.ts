import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuditService } from './services/audit.service';
import { TenantContextGuard } from './guards/tenant-context.guard';

@Module({
  imports: [DatabaseModule],
  providers: [AuditService,TenantContextGuard],
  exports: [AuditService,TenantContextGuard]
})
export class CommonModule {}
