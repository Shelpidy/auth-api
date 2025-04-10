import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { nanoid } from 'nanoid';
import * as schema from '../../database/schema';

@Injectable()
export class AuditService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
  ) {}
  
    async logChange(params: {
      tenant_id: string;
      table_name: string;
      record_id: string;
      action: 'CREATE' | 'UPDATE' | 'DELETE';
      old_data?: any;
      new_data: any;
      changed_by: string;
      change_by_login_ip?: string;
    }) {
      const {
        tenant_id,
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_by,
        change_by_login_ip
      } = params;
  
      await this.db.insert(schema.audit_logs).values({
        audit_log_id: `tpe${nanoid(19)}`,
        tenant_id,
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        change_by_login_ip,
        created_by: changed_by,
        modified_by: changed_by,
      });
    }

}
