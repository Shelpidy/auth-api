import {
    Injectable,
    Scope,
    OnModuleDestroy,
    HttpException,
    HttpStatus,
    Logger,
    Inject,
  } from '@nestjs/common';
  import { NodePgDatabase } from 'drizzle-orm/node-postgres';
  import { sql } from 'drizzle-orm';
  import * as schema from './schema';
  
  @Injectable({ scope: Scope.REQUEST })
  export class DatabaseService implements OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);
    private currentTenantId: string | null = null;
  
    constructor(
      @Inject('DATABASE_CONNECTION')
      private readonly db: NodePgDatabase<typeof schema>,
    ) {}
  
    async setTenantContext(tenantId: string | null) {
      try {
        if (tenantId) {
          console.log('SETTING:', tenantId);
          // Fix: Use proper string escaping for SET command
          let sqlQuery = sql `SET app.current_tenant_id = '${tenantId}';`;
          await this.db.execute(sqlQuery);
          this.currentTenantId = tenantId;
          console.log('DONE SETTING:', tenantId);
        } else {
          await this.clearTenantContext();
        }
      } catch (error: any) {
        console.log(error);
        this.logger.error(`Failed to set tenant context: ${error.message}`);
        throw new HttpException(
          'Failed to set tenant context',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    async withTenantContext<T>(
      tenantId: string,
      callback: () => Promise<T>,
    ): Promise<T> {
      const previousTenantId = this.currentTenantId;
      try {
        await this.setTenantContext(tenantId);
        return await callback();
      } finally {
        await this.setTenantContext(previousTenantId);
      }
    }
  
    async clearTenantContext() {
      try {
        // Fix: Use empty string literal directly
        await this.db.execute(sql`SET app.current_tenant_id = '';`);
        this.currentTenantId = null;
        this.logger.debug('Cleared tenant context');
      } catch (error: any) {
        this.logger.error(`Failed to clear tenant context: ${error.message}`);
        throw new HttpException(
          'Failed to clear tenant context',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    getCurrentTenantId(): string | null {
      return this.currentTenantId;
    }
  
    async onModuleDestroy() {
      try {
        await this.clearTenantContext();
      } catch (error: any) {
        this.logger.error(
          `Failed to clear tenant context on destroy: ${error.message}`,
        );
      }
    }
  }
  