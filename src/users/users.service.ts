import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { and, eq, sql } from 'drizzle-orm';
import { UserUpdateDto, UserLocationDto, CreateUserPaymentDto, UpdateUserPaymentDto} from './dto/user.dto';
import { nanoid } from 'nanoid';
import { AuditService } from '../common/services/audit.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
    private auditService: AuditService
  ) {}

  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [users, count] = await Promise.all([
      this.db.query.users.findMany({
        limit,
        offset,
        where: eq(schema.users.deleted, false),
        columns: {
          user_nano_id: true,
          display_name: true,
          username: true,
          email: true,
          photo: true,
          is_verified: true,
          status: true,
          created_on: true,
        },
        with: {
          user_profile: true,
          user_auth: {
            columns: {
              last_login_at: true,
              last_login_ip: true,
            },
          },
          tenant: true,
          user_roles: {
            with: {
              role: true,
            },
          },
          user_location: true,
        },
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(schema.users),
    ]);

    const totalItems = Number(count[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return {
      data: users,
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

  async findOne(user_nano_id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.user_nano_id, user_nano_id),
      columns: {
        user_nano_id: true,
        photo: true,
        display_name: true,
        username: true,
        email: true,
        is_verified: true,
        status: true,
        created_on: true,
      },
      with: {
        user_profile: true,
        user_auth: {
          columns: {
            last_login_at: true,
            last_login_ip: true,
          },
        },
        user_location: true,
        tenant: true,
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

    return user;
  }

  async update(user_nano_id: string, updateDto: UserUpdateDto) {
    const { user: userData, profile: profileData } = updateDto;

    return await this.db.transaction(async (tx) => {
      // Check if phone exists for another user
      if (profileData?.primary_phone) {
        const existingPhone = await tx.query.user_profiles.findFirst({
          where: and(
            eq(schema.user_profiles.primary_phone, profileData.primary_phone),
            sql`${schema.user_profiles.user_nano_id} != ${user_nano_id}`
          )
        });

        if (existingPhone) {
          throw new ConflictException('Phone number already exists');
        }
      }

      let user;
      if (userData) {
        [user] = await tx
          .update(schema.users)
          .set({
            ...userData
          })
          .where(eq(schema.users.user_nano_id, user_nano_id))
          .returning();

        if (!user) {
          throw new NotFoundException('User not found');
        }
      }

      let profile;
      if (profileData) {
        // Convert date string to proper format if present
        const formattedProfile = {
          ...profileData,
          date_of_birth: profileData.date_of_birth ? new Date(profileData.date_of_birth).toISOString() : undefined
        };

        [profile] = await tx
          .update(schema.user_profiles)
          .set(formattedProfile)
          .where(eq(schema.user_profiles.user_nano_id, user_nano_id))
          .returning();
      }

      let safeUser;
      if(user) {
        const {password, ...rest} = user;
        safeUser = rest;
      }

      return { 
        message: 'User updated successfully',
        user: { ...safeUser, profile }
      };
    });
  }

  async remove(user_nano_id: string) {
    const [deletedUser] = await this.db
      .delete(schema.users)
      .where(eq(schema.users.user_nano_id, user_nano_id))
      .returning();

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  async assignRole(user_nano_id: string, role_nano_id: string) {
    await this.db
      .insert(schema.user_roles)
      .values({ 
        user_nano_id, 
        role_nano_id
      })
      .onConflictDoNothing();

    return { message: 'Role assigned successfully' };
  }

  async removeRole(user_nano_id: string, role_nano_id: string) {
    const result = await this.db
      .delete(schema.user_roles)
      .where(and(
        eq(schema.user_roles.user_nano_id, user_nano_id),
        eq(schema.user_roles.role_nano_id, role_nano_id)
      ))
      .returning();

    if (!result.length) {
      throw new NotFoundException('Role assignment not found');
    }

    return { message: 'Role removed successfully' };
  }

  async addLocation(user_nano_id: string, locationDto: UserLocationDto) {
    const user_location_nano_id = nanoid();
    const [location] = await this.db
      .insert(schema.user_locations)
      .values({
        ...locationDto,
        user_nano_id,
        user_location_nano_id,
        user_location_id: await this.getNextLocationId(),
        created_by: user_nano_id,
        created_on: new Date()
      })
      .returning();

    return {
      message: 'Location added successfully',
      location,
    };
  }

  private async getNextLocationId(): Promise<number> {
    const result = await this.db
      .select({ max: sql<number>`COALESCE(MAX(user_location_id), 0)` })
      .from(schema.user_locations);
    return (result[0].max || 0) + 1;
  }

  private async getNextUserId(): Promise<number> {
    const result = await this.db
      .select({ max: sql<number>`COALESCE(MAX(user_id), 0)` })
      .from(schema.users);
    return (result[0].max || 0) + 1;
  }

  private async getNextProfileId(): Promise<number> {
    const result = await this.db
      .select({ max: sql<number>`COALESCE(MAX(user_profile_id), 0)` })
      .from(schema.user_profiles);
    return (result[0].max || 0) + 1;
  }

  async getLocations(user_nano_id: string) {
    const locations = await this.db.query.user_locations.findMany({
      where: eq(schema.user_locations.user_nano_id, user_nano_id),
    });

    return locations;
  }

  async updateLocation(user_nano_id: string, location_nano_id: string, locationDto: UserLocationDto) {
    const [location] = await this.db
      .update(schema.user_locations)
      .set({
        ...locationDto
      })
      .where(and(
        eq(schema.user_locations.user_nano_id, user_nano_id),
        eq(schema.user_locations.user_location_nano_id, location_nano_id)
      ))
      .returning();

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return {
      message: 'Location updated successfully',
      location,
    };
  }

  async assignTenant(user_nano_id: string, tenant_nano_id: string) {
    const [updatedUser] = await this.db
      .update(schema.users)
      .set({ tenant_nano_id })
      .where(eq(schema.users.user_nano_id, user_nano_id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Tenant assigned successfully',
      user: updatedUser,
    };
  }

  async getUsersByRole(role_id: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const [usersWithRole, count] = await Promise.all([
      this.db.query.user_roles.findMany({
        limit,
        offset,
        where: eq(schema.user_roles.role_nano_id, role_id),
        with: {
          user: {
            columns: {
              user_nano_id: true,
              display_name: true,
              username: true,
              email: true,
              photo: true,
            },
          },
        },
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.user_roles)
        .where(eq(schema.user_roles.role_nano_id, role_id)),
    ]);

    const totalItems = Number(count[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return {
      data: usersWithRole.map((ur) => ur.user),
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

  async removeLocation(user_nano_id: string, location_nano_id: string) {
    const [deletedLocation] = await this.db
      .delete(schema.user_locations)
      .where(and(
        eq(schema.user_locations.user_nano_id, user_nano_id),
        eq(schema.user_locations.user_location_nano_id, location_nano_id)
      ))
      .returning();

    if (!deletedLocation) {
      throw new NotFoundException('Location not found');
    }

    return { message: 'Location removed successfully' };
  }

  async searchUsers(query: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const searchPattern = `%${query}%`;

    const [users, count] = await Promise.all([
      this.db.query.users.findMany({
        limit,
        offset,
        where: sql`
          ${schema.users.username} ILIKE ${searchPattern} OR
          ${schema.users.email} ILIKE ${searchPattern}
        `,
        with: {
          user_profile: true,
          user_roles: {
            with: {
              role: true,
            },
          },
        },
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.users)
        .where(sql`
          ${schema.users.username} ILIKE ${searchPattern} OR
          ${schema.users.email} ILIKE ${searchPattern}
        `),
    ]);

    const totalItems = Number(count[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;

    return {
      data: users,
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

  async getUserRoles(user_nano_id: string) {
    const userRoles = await this.db.query.user_roles.findMany({
      where: eq(schema.user_roles.user_nano_id, user_nano_id),
      with: {
        role: true,
      },
    });

    return userRoles.map(ur => ur.role);
  }

  // User Payments
  async createPayment(user_nano_id: string, dto: CreateUserPaymentDto, creator_full_name: string) {
    const user_payment_nano_id = nanoid();

    const [payment] = await this.db.insert(schema.user_payments)
      .values({
        user_payment_nano_id,
        ...dto,
        user_nano_id,
        created_by: creator_full_name,
        created_on: new Date()
      })
      .returning();

    await this.auditService.logChange({
      table_name: 'user_payments',
      record_id: payment.user_payment_nano_id,
      action: 'CREATE',
      new_data: payment,
      changed_by: creator_full_name
    });

    return payment;
  }

  async getUserPayments(user_nano_id: string) {
    return this.db.query.user_payments.findMany({
      where: eq(schema.user_payments.user_nano_id, user_nano_id)
    });
  }

  async updatePayment(user_payment_nano_id: string, dto: UpdateUserPaymentDto, updater_full_name: string) {
    const [payment] = await this.db.update(schema.user_payments)
      .set({
        ...dto,
        created_by: updater_full_name
      })
      .where(eq(schema.user_payments.user_payment_nano_id, user_payment_nano_id))
      .returning();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    await this.auditService.logChange({
      table_name: 'user_payments',
      record_id: payment.user_payment_nano_id,
      action: 'UPDATE',
      new_data: payment,
      changed_by: updater_full_name
    });

    return payment;
  }

  // User Settings
  // async createSetting(user_nano_id: string, dto: CreateUserSettingDto, creator_full_name: string) {
  //   const user_setting_nano_id = nanoid();

  //   const [setting] = await this.db.insert(schema.user_settings)
  //     .values({
  //       user_setting_nano_id,
  //       ...dto
  //     })
  //     .returning();

  //   await this.auditService.logChange({
  //     table_name: 'user_settings',
  //     record_id: setting.user_setting_nano_id,
  //     action: 'CREATE',
  //     new_data: setting,
  //     changed_by: creator_full_name
  //   });

  //   return setting;
  // }

  // async getUserSettings(user_nano_id: string) {
  //   return this.db.query.user_settings.findMany({
  //     where: eq(schema.user_settings.user_setting_nano_id, user_nano_id)
  //   });
  // }

  // async updateSetting(user_setting_nano_id: string, dto: UpdateUserSettingDto, updater_full_name: string) {
  //   const [setting] = await this.db.update(schema.user_settings)
  //     .set({
  //       ...dto
  //     })
  //     .where(eq(schema.user_settings.user_setting_nano_id, user_setting_nano_id))
  //     .returning();

  //   if (!setting) {
  //     throw new NotFoundException('Setting not found');
  //   }

  //   await this.auditService.logChange({
  //     table_name: 'user_settings',
  //     record_id: setting.user_setting_nano_id,
  //     action: 'UPDATE',
  //     new_data: setting,
  //     changed_by: updater_full_name
  //   });

  //   return setting;
  // }
  
}
