import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { nanoid } from 'nanoid';

@Injectable()
export class AuditService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async logChange(params: {
    table_name: string;
    record_id: string;
    action: string;
    old_data?: any;
    new_data?: any;
    changed_by: string;
    changeby_login_ip?: string;
  }) {
    const audit_log_nano_id = nanoid();

    await this.db.insert(schema.audit_logs).values({
      audit_log_nano_id,
      table_name: params.table_name,
      record_id: params.record_id,
      action: params.action,
      old_data: params.old_data,
      new_data: params.new_data,
      changed_by: params.changed_by,
      changeby_login_ip: params.changeby_login_ip,
      changed_on: new Date(),
    });
  }
}
