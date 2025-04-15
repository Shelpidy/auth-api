import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { eq, sql, and } from 'drizzle-orm';
import {
  UserUpdateDto,
  CreateUserDto,
  CreateUserTypeDto,
  UpdateUserTypeDto,
  CreateUserSettingDto, 
  UpdateUserSettingDto
} from './dto/user.dto';
import { nanoid } from 'nanoid';
import { AuditService } from '../common/services/audit.service';
import { ICurrentUser } from '../common/interfaces/current-user.interface';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
    private auditService: AuditService,
    private authService: AuthService,
  ) {}

  private excludePassword<T extends { password?: string }>(user: T): Omit<T, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(page: number, limit: number,currentUser:ICurrentUser) {
    const offset = (page - 1) * limit;
    const tenantId = currentUser.tenant_id || "";
   
    console.log("Tenant ID:", tenantId);
    return await this.db.transaction(async (tx) => {
      await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, false)`);
    
      const [users, count] = await Promise.all([
        tx.query.users.findMany({
          limit,
          offset,
          where: eq(schema.users.is_deleted, false),
        }),
        tx.select({ count: sql<number>`count(*)` }).from(schema.users),
      ]);

      const totalItems = Number(count[0].count);
      const totalPages = Math.ceil(totalItems / limit);
      const currentPage = Math.floor(offset / limit) + 1;
  
      return {
        data: users.map(user => this.excludePassword(user)),
        metadata: {
          currentPage,
          limit,
          totalItems,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
      };
    });
    

  }

  async findOne(user_id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.user_id, user_id),
      with: {
        user_data: true,
        user_auth: true,
        user_roles: {
          with: {
            role: true,
          },
        },
        
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.excludePassword(user);
  }

  async createUser(dto: CreateUserDto, currentUser: ICurrentUser) {
    // Check for conflicts first
    await this.authService.checkUserConflicts({
      email: dto.email,
      primary_phone: dto.primary_phone,
      username: dto.username,
    });

    const user_id = `tpe${nanoid(19)}`;
    const user_data_id = `tpe${nanoid(19)}`;
    const user_auth_id = `tpe${nanoid(19)}`;
    const user_role_id = `tpe${nanoid(19)}`;
    const now = new Date();

    return await this.db.transaction(async (tx) => {
      // Create base user with ALL required fields
      const {user_data,...userPayload} = dto;
      const [baseUser] = await tx
        .insert(schema.users)
        .values({
          user_id,
          ...userPayload,
          created_by: currentUser.full_name,
          modified_by: currentUser.full_name,
          created_on: new Date(),
          modified_on: new Date()
        })
        .returning();

      // Create user_data with ALL required fields
      const [userData] = await tx
        .insert(schema.user_data)
        .values({
          ...user_data,
          user_data_id,
          user_id,
          tenant_id: dto.tenant_id,
          created_on: new Date(),
          modified_on: new Date(),
          created_by: currentUser.full_name,
          modified_by: currentUser.full_name // Add this required field
        }).returning();

            await tx.insert(schema.user_auths).values({
              user_auth_id,
              user_id,
              tenant_id: baseUser.tenant_id,
              otp:null,
              otp_expiry: null,
              created_by: currentUser.full_name,
              modified_by: currentUser.full_name,
              created_on: now,
              modified_on: now,
            });
      
            // Assign default authenticated role
            const [authenticatedRole] = await tx
              .select()
              .from(schema.roles)
              .where(eq(schema.roles.name, 'authenticated'))
              .limit(1);
      
            if (authenticatedRole) {
              await tx.insert(schema.user_roles).values({
                user_role_id,
                role_id: authenticatedRole.role_id,
                user_id: baseUser.user_id,
                tenant_id: baseUser.tenant_id,
                created_by: currentUser.full_name,
                modified_by: currentUser.full_name,
                created_on: now,
                modified_on: now,
              });
            }

      // Explicitly construct the combined user object with the correct type
      const user = {
        ...baseUser,
        user_data: userData
      };

      await this.auditService.logChange({
        tenant_id: currentUser.tenant_id,
        table_name: 'users',
        record_id: user_id,
        action: 'CREATE',
        new_data: user,
        changed_by: currentUser.full_name,
        change_by_login_ip: currentUser.ip
      });

      return {
        message: 'User created successfully',
        data: user
      };
    });
  }

  async update(user_id: string, updateDto: UserUpdateDto, currentUser: ICurrentUser) {
    return await this.db.transaction(async (tx) => {
      const existingUser = await tx.query.users.findFirst({
        where: eq(schema.users.user_id, user_id),
        with: {
          user_data: true
        }
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      const { user: userUpdates, user_data: userDataUpdates } = updateDto;

      // Update base user if provided
      let updatedUser = existingUser;
      if (userUpdates) {
        const [baseUser] = await tx
          .update(schema.users)
          .set({
            ...userUpdates,
            modified_by: currentUser.full_name,
            modified_on: new Date(),
            status: userUpdates.status || existingUser.status,
            tenant_id: userUpdates.tenant_id || existingUser.tenant_id,
            user_type_id: userUpdates.user_type_id || existingUser.user_type_id
          })
          .where(eq(schema.users.user_id, user_id))
          .returning();
        
        updatedUser = {
          ...baseUser,
          user_data: existingUser.user_data // Preserve existing user_data
        };
      }

      // Update or create user_data if provided
      if (userDataUpdates) {
        const formattedUserData = {
          first_name: userDataUpdates.first_name || '',
          last_name: userDataUpdates.last_name || '',
          ...userDataUpdates,
          demographic_date_of_birth: userDataUpdates.demographic_date_of_birth 
            ? new Date(userDataUpdates.demographic_date_of_birth).toISOString()
            : null,
          modified_by: currentUser.full_name,
          modified_on: new Date()
        };

        if (existingUser.user_data) {
          [updatedUser.user_data] = await tx
            .update(schema.user_data)
            .set(formattedUserData)
            .where(eq(schema.user_data.user_id, user_id))
            .returning();
        } else {
          [updatedUser.user_data] = await tx
            .insert(schema.user_data)
            .values({
              user_data_id: `tpe${nanoid(19)}`,
              user_id,
              tenant_id: existingUser.tenant_id,
              full_name: `${formattedUserData.first_name} ${formattedUserData.middle_name || ''} ${formattedUserData.last_name}`.trim(),
              ...formattedUserData,
              created_by: currentUser.full_name,
              created_on: new Date(),
            })
            .returning();
        }
      }

      const { password, ...safeUser } = updatedUser;
      const result = {
        ...safeUser,
        user_data: updatedUser.user_data || null
      };

      await this.auditService.logChange({
        tenant_id: currentUser.tenant_id,
        table_name: 'users',
        record_id: user_id,
        action: 'UPDATE',
        old_data: existingUser,
        new_data: result,
        changed_by: currentUser.full_name,
        change_by_login_ip: currentUser.ip
      });

      return {
        message: 'User updated successfully',
        data: result
      };
    });
  }

  async remove(user_id: string, currentUser: ICurrentUser) {
    const existingUser = await this.db.query.users.findFirst({
      where: eq(schema.users.user_id, user_id),
    });

    const [deletedUser] = await this.db
      .delete(schema.users)
      .where(eq(schema.users.user_id, user_id))
      .returning();

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'users',
      record_id: user_id,
      action: 'DELETE',
      old_data: existingUser,
      new_data: deletedUser,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return { message: 'User deleted successfully' };
  }

  async getUserRoles(user_id: string) {
    const userRoles = await this.db.query.user_roles.findMany({
      where: eq(schema.user_roles.user_id, user_id),
      with: {
        role: true,
      },
    });

    return userRoles.map(ur => (ur.role));
  }

  async getUserPayments(user_id: string) {
    return this.db.query.user_payments.findMany({
      where: eq(schema.user_payments.user_id, user_id),
    });
  }

  async createUserType(dto: CreateUserTypeDto, currentUser: ICurrentUser) {
    const type_id = `tpe${nanoid(19)}`;

    const [userType] = await this.db
      .insert(schema.user_types)
      .values({
        user_type_id: type_id,
        user_type_name: dto.user_type_name,
        created_by: currentUser.full_name,
        modified_by: currentUser.full_name,
        created_on: new Date(),
        modified_on: new Date()
      })
      .returning();

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'user_types',
      record_id: type_id,
      action: 'CREATE',
      new_data: userType,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return {
      message: 'User type created successfully',
      data: userType
    };
  }

  async getUserTypes(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [types, count] = await Promise.all([
      this.db.query.user_types.findMany({
        limit,
        offset,
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(schema.user_types),
    ]);

    const totalItems = Number(count[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return {
      data: types,
      metadata: {
        currentPage,
        limit,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }

  async getUserType(type_id: string) {
    const userType = await this.db.query.user_types.findFirst({
      where: eq(schema.user_types.user_type_id, type_id),
    });

    if (!userType) {
      throw new NotFoundException('User type not found');
    }

    return userType;
  }

  async updateUserType(type_id: string, dto: UpdateUserTypeDto, updater: any) {
    const existingType = await this.getUserType(type_id);

    const [updatedType] = await this.db
      .update(schema.user_types)
      .set({
        user_type_name: dto.user_type_name,
        modified_by: updater.full_name,
        modified_on: new Date(),
      })
      .where(eq(schema.user_types.user_type_id, type_id))
      .returning();

    await this.auditService.logChange({
      tenant_id: updater.tenant_id,
      table_name: 'user_types',
      record_id: type_id,
      action: 'UPDATE',
      old_data: existingType,
      new_data: updatedType,
      changed_by: updater.full_name,
      change_by_login_ip: updater.ip
    });

    return {
      message: 'User type updated successfully',
      data: updatedType
    };
  }

  async deleteUserType(type_id: string, user: any) {
    const existingType = await this.getUserType(type_id);

    // Check if type is being used by any users
    const usersWithType = await this.db.query.users.findFirst({
      where: eq(schema.users.user_type_id, type_id),
    });

    if (usersWithType) {
      throw new ConflictException('Cannot delete user type that is being used by users');
    }

    const [deletedType] = await this.db
      .delete(schema.user_types)
      .where(eq(schema.user_types.user_type_id, type_id))
      .returning();

    await this.auditService.logChange({
      tenant_id: user.tenant_id,
      table_name: 'user_types',
      record_id: type_id,
      action: 'DELETE',
      old_data: existingType,
      new_data: null,
      changed_by: user.full_name,
      change_by_login_ip: user.ip
    });

    return {
      message: 'User type deleted successfully',
      data: deletedType
    };
  }

  async findByUserType(userTypeId: string) {
    const users = await this.db.query.users.findMany({
      where: eq(schema.users.user_type_id, userTypeId),
      with: {
        user_type: true,
        user_roles: {
          with: {
            role: true
          }
        }
      }
    });

    if (!users.length) {
      throw new NotFoundException(`No users found with user type ID ${userTypeId}`);
    }

    return users.map(user => this.excludePassword(user));
  }

  async findByRole(roleName: string) {
    const users = await this.db.query.users.findMany({
      with: {
        user_roles: {
          with: {
            role: true
          }
        },
        user_type: true,
        user_data: true
      },
      where: sql`EXISTS (
        SELECT 1 FROM ${schema.user_roles} ur
        INNER JOIN ${schema.roles} r ON ur.role_id = r.role_id
        WHERE ur.user_id = ${schema.users.user_id}
        AND r.name = ${roleName}
      )`
    });

    if (!users.length) {
      throw new NotFoundException(`No users found with role ${roleName}`);
    }

    // Remove sensitive data before returning
    return users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
  }

  async createUserSetting(user_id: string, dto: CreateUserSettingDto, currentUser: ICurrentUser) {
    const setting = await this.db.transaction(async (tx) => {
      const [setting] = await tx.insert(schema.user_settings).values({
        user_setting_id: `tpe${nanoid(19)}`,
        user_id,
        tenant_id: currentUser.tenant_id,
        ...dto,
        created_by: currentUser.full_name,
        modified_by: currentUser.full_name
      }).returning();

      await this.auditService.logChange({
        tenant_id: currentUser.tenant_id,
        table_name: 'user_settings',
        record_id: setting.user_setting_id,
        action: 'CREATE',
        new_data: setting,
        changed_by: currentUser.full_name,
        change_by_login_ip: currentUser.ip
      });

      return setting;
    });

    return {
      message: 'User setting created successfully',
      data: setting
    };
  }

  async getUserSettings(user_id: string) {
    const settings = await this.db.query.user_settings.findMany({
      where: eq(schema.user_settings.user_id, user_id)
    });
    
    return settings;
  }

  async updateUserSetting(
    user_id: string,
    setting_id: string,
    dto: UpdateUserSettingDto,
    currentUser: ICurrentUser
  ) {
    const setting = await this.db.transaction(async (tx) => {
      const [oldSetting] = await tx
        .select()
        .from(schema.user_settings)
        .where(and(
          eq(schema.user_settings.user_id, user_id),
          eq(schema.user_settings.user_setting_id, setting_id)
        ));

      if (!oldSetting) {
        throw new NotFoundException('Setting not found');
      }

      const [setting] = await tx
        .update(schema.user_settings)
        .set({
          ...dto,
          modified_by: currentUser.full_name,
          modified_on: new Date()
        })
        .where(and(
          eq(schema.user_settings.user_id, user_id),
          eq(schema.user_settings.user_setting_id, setting_id)
        ))
        .returning();

      await this.auditService.logChange({
        tenant_id: currentUser.tenant_id,
        table_name: 'user_settings',
        record_id: setting_id,
        action: 'UPDATE',
        old_data: oldSetting,
        new_data: setting,
        changed_by: currentUser.full_name,
        change_by_login_ip: currentUser.ip
      });

      return setting;
    });

    return {
      message: 'User setting updated successfully',
      data: setting
    };
  }

  async deleteUserSetting(user_id: string, setting_id: string, currentUser: ICurrentUser) {
    const [setting] = await this.db
      .delete(schema.user_settings)
      .where(and(
        eq(schema.user_settings.user_id, user_id),
        eq(schema.user_settings.user_setting_id, setting_id)
      ))
      .returning();

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'user_settings',
      record_id: setting_id,
      action: 'DELETE',
      old_data: setting,
      new_data: null,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return { message: 'User setting deleted successfully' };
  }
}
