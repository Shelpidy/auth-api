import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class RolesService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll() {
    return this.db.query.roles.findMany();
  }

  async findOne(role_nano_id: string) {
    const role = await this.db.query.roles.findFirst({
      where: eq(schema.roles.role_nano_id, role_nano_id),
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto, creator_full_name: string) {
    const role_nano_id = nanoid();
    const existingRole = await this.db.query.roles.findFirst({
      where: eq(schema.roles.name, createRoleDto.name),
    });

    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    const [role] = await this.db
      .insert(schema.roles)
      .values({
        role_nano_id,
        name: createRoleDto.name,
      })
      .returning();

    return {
      message: 'Role created successfully',
      role,
    };
  }

  async update(role_nano_id: string, updateRoleDto: UpdateRoleDto) {
    const existingRole = await this.db.query.roles.findFirst({
      where: eq(schema.roles.name, updateRoleDto.name),
    });

    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    const [role] = await this.db
      .update(schema.roles)
      .set(updateRoleDto)
      .where(eq(schema.roles.role_nano_id, role_nano_id))
      .returning();

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      message: 'Role updated successfully',
      role,
    };
  }

  async remove(role_nano_id: string) {
    await this.db
      .delete(schema.user_roles)
      .where(eq(schema.user_roles.role_nano_id, role_nano_id));

    const [role] = await this.db
      .delete(schema.roles)
      .where(eq(schema.roles.role_nano_id, role_nano_id))
      .returning();

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return { message: 'Role deleted successfully' };
  }
}
