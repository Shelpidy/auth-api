import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { DatabaseService } from '../../database/db.service';

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(private dbService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenant_id;

    if (tenantId) {
      await this.dbService.setTenantContext(tenantId);
    }
    return true;
  }
}
