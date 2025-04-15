import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { eq, and, sql } from 'drizzle-orm';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { nanoid } from 'nanoid';
import { AuditService } from '../common/services/audit.service';
import { ICurrentUser } from 'src/common/interfaces/current-user.interface';
import { DatabaseService } from 'src/database/db.service';

@Injectable()
export class RolesService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
    private auditService: AuditService,
    private databaseService: DatabaseService,
  ) {}

  private async checkRoleConflicts(params: {
    name: string;
    tenant_id: string;
    role_id?: string; // For updates
  }) {
    const { name, tenant_id, role_id } = params;

    // Check if role with same name exists for the tenant
    const existingRole = await this.db.query.roles.findFirst({
      where: role_id
        ? sql`${schema.roles.name} = ${name} 
            AND ${schema.roles.tenant_id} = ${tenant_id} 
            AND ${schema.roles.role_id} != ${role_id}`
        : and(
            eq(schema.roles.name, name),
            eq(schema.roles.tenant_id, tenant_id)
          ),
    });

    if (existingRole) {
      throw new ConflictException(`Role "${name}" already exists for this tenant`);
    }
  }

  async findAll(currentUser: ICurrentUser) {
    const tenantId = currentUser.tenant_id;
    if (tenantId) {
      // Apply tenant context before querying
        await this.db.execute(sql`SELECT set_config('app.tenant_id', ${tenantId}, false)`);
        return this.db.query.roles.findMany();
      
    } else {
      // No tenant context, return all roles (use for super-admin or global admins)
      return this.db.query.roles.findMany();
    }
  }

  async findOne(role_id: string, currentUser: ICurrentUser) {
    const tenantId = currentUser.tenant_id;
    if (tenantId) {
      // Apply tenant context before querying
      return this.databaseService.withTenantContext(tenantId, async () => {

        return this.db.query.roles.findFirst({
          where: eq(schema.roles.role_id, role_id),
        });
      });
    } else {
      // No tenant context, return role globally

      return this.db.query.roles.findFirst({
        where: eq(schema.roles.role_id, role_id),
      });
    }
  }

  async create(createRoleDto: CreateRoleDto, currentUser: ICurrentUser) {
    console.log('currentUser', currentUser);
    // Check for role name conflicts within tenant
    await this.checkRoleConflicts({
      name: createRoleDto.name,
      tenant_id: currentUser.tenant_id,
    });

    // Check if super-admin role is only created by super-admin
    if (createRoleDto.name.includes('super-admin') && !currentUser.roles.includes("super-admin")) {
      throw new ConflictException('Role name is not allowed by this user');
    } else if (createRoleDto.name.includes('super-admin') && currentUser.tenant_id) {
      throw new ConflictException('Role name is not allowed by this user');
    }

    const role_id = `tpe${nanoid(19)}`;
    const [role] = await this.db.insert(schema.roles)
      .values({
        role_id,
        name: createRoleDto.name,
        created_by: currentUser.full_name,
        modified_by: currentUser.full_name,
        tenant_id: currentUser.tenant_id,
      })
      .returning();

    // Log the change via AuditService
    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'roles',
      record_id: role_id,
      action: 'CREATE',
      new_data: role,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip,
    });

    return {
      message: 'Role created successfully',
      data: role,
    };
  }

  async updateRole(role_id: string, updateRoleDto: UpdateRoleDto, currentUser: ICurrentUser) {
    const existingRole = await this.findOne(role_id, currentUser);

    // Check for conflicts if name is being updated
    if (updateRoleDto.name) {
      await this.checkRoleConflicts({
        name: updateRoleDto.name,
        tenant_id: currentUser.tenant_id,
        role_id,
      });
    }

    const [updatedRole] = await this.db.update(schema.roles)
      .set({
        name: updateRoleDto.name,
        modified_by: currentUser.full_name,
        modified_on: new Date(),
      })
      .where(eq(schema.roles.role_id, role_id))
      .returning();

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'roles',
      record_id: role_id,
      action: 'UPDATE',
      old_data: existingRole,
      new_data: updatedRole,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip,
    });

    return {
      message: 'Role updated successfully',
      data: updatedRole,
    };
  }

  async remove(id: string, currentUser: ICurrentUser) {
    const existingRole = await this.findOne(id, currentUser);

    const [deletedRole] = await this.db.delete(schema.roles)
      .where(eq(schema.roles.role_id, id))
      .returning();

    if (!deletedRole) {
      throw new NotFoundException('Role not found');
    }

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'roles',
      record_id: id,
      action: 'DELETE',
      old_data: existingRole,
      new_data: null,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip,
    });

    return { message: 'Role deleted successfully' };
  }

  async assignUserToRole(params: {
    user_id: string;
    role_id: string;
    tenant_id?: string;
    currentUser: ICurrentUser;
  }) {
    const user_role_id = `tpe${nanoid(19)}`;
    const [userRole] = await this.db.insert(schema.user_roles)
      .values({
        user_role_id,
        user_id: params.user_id,
        role_id: params.role_id,
        tenant_id: params.tenant_id,
        created_by: params.currentUser.full_name,
        modified_by: params.currentUser.full_name,
      })
      .returning();

    await this.auditService.logChange({
      tenant_id: params.currentUser.tenant_id,
      table_name: 'user_roles',
      record_id: userRole.user_role_id || "",
      action: 'CREATE',
      new_data: userRole,
      changed_by: params.currentUser.full_name,
      change_by_login_ip: params.currentUser.ip,
    });

    return {
      message: 'Role assigned successfully',
      data: userRole,
    };
  }

  async removeUserRole(user_id: string, role_id: string, currentUser: ICurrentUser) {
    const [userRole] = await this.db.delete(schema.user_roles)
      .where(and(
        eq(schema.user_roles.user_id, user_id),
        eq(schema.user_roles.role_id, role_id),
      ))
      .returning();

    if (!userRole) {
      throw new NotFoundException('Role assignment not found');
    }

    await this.auditService.logChange({
      table_name: 'user_roles',
      record_id: userRole.user_role_id || "",
      action: 'DELETE',
      old_data: userRole,
      new_data: null,
      changed_by: currentUser.full_name,
      tenant_id: currentUser.tenant_id,
      change_by_login_ip: currentUser.ip,
    });

    return { message: 'Role removed successfully' };
  }
}
