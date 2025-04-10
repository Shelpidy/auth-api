import { Injectable, Scope, OnModuleDestroy, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

@Injectable({ scope: Scope.REQUEST })
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private currentTenantId: string | null = null;

  constructor(private db: NodePgDatabase<typeof schema>) {}

  async setTenantContext(tenantId: string | null) {
    try {
      if (tenantId) {
        await this.db.execute(sql`SET app.tenant_id = ${tenantId}`);
        this.currentTenantId = tenantId;
      } else {
        await this.clearTenantContext();
      }
    } catch (error) {
      this.logger.error(`Failed to set tenant context: ${error.message}`);
      throw new HttpException('Failed to set tenant context', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async withTenantContext<T>(tenantId: string, callback: () => Promise<T>): Promise<T> {
    const previousTenantId = this.currentTenantId;
    try {
      await this.setTenantContext(tenantId);
      return await callback();
    } finally {
      await this.setTenantContext(previousTenantId);
    }
  }

  async clearTenantContext() {
    await this.db.execute(sql`RESET app.tenant_id`);
    this.currentTenantId = null;
  }

  getCurrentTenantId(): string | null {
    return this.currentTenantId;
  }

  // Automatically clear context when request ends
  async onModuleDestroy() {
    await this.clearTenantContext();
  }
}
