import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { nanoid } from 'nanoid';
import * as schema from '../database/schema';
import { and, eq, sql } from 'drizzle-orm';
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantSettingsDto,
  TenantLocationDto,
  CreateTenantSubscriptionDto,
  UpdateTenantSubscriptionDto,
} from './dto/tenant.dto';
import { AuditService } from '../common/services/audit.service';

@Injectable()
export class TenantsService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
    private auditService: AuditService,
  ) {}

  private async getNextTenantId(): Promise<number> {
    const result = await this.db
      .select({ max: sql<number>`COALESCE(MAX(tenant_id), 0)` })
      .from(schema.tenants);
    return (result[0].max || 0) + 1;
  }

  private async getNextContactId(): Promise<number> {
    const result = await this.db
      .select({ max: sql<number>`COALESCE(MAX(tenant_contact_id), 0)` })
      .from(schema.tenant_contacts);
    return (result[0].max || 0) + 1;
  }

  private async getNextSettingId(): Promise<number> {
    const result = await this.db
      .select({ max: sql<number>`COALESCE(MAX(tenant_setting_id), 0)` })
      .from(schema.tenant_settings);
    return (result[0].max || 0) + 1;
  }

  private async getNextLocationId(): Promise<number> {
    const result = await this.db
      .select({ max: sql<number>`COALESCE(MAX(tenant_location_id), 0)` })
      .from(schema.tenant_locations);
    return (result[0].max || 0) + 1;
  }

  async create(createTenantDto: CreateTenantDto, creator_user_nano_id: string) {
    try {
      const creator = await this.db.query.users.findFirst({
        where: eq(schema.users.user_nano_id, creator_user_nano_id),
        columns: {
          user_nano_id: true,
        },
        with: {
          user_profile: {
            columns: {
              full_name: true,
            },
          },
        },
      });

      const result = await this.db.transaction(async (tx) => {
        const tenant_nano_id = nanoid();
        const [tenant] = await tx
          .insert(schema.tenants)
          .values({
            ...createTenantDto,
            tenant_nano_id,
            tenant_id: await this.getNextTenantId(),
            created_by:
              creator?.user_profile?.full_name || creator_user_nano_id,
            created_on: new Date(),
          })
          .returning();

        if (createTenantDto.tenant_contact) {
          await tx.insert(schema.tenant_contacts).values({
            ...createTenantDto.tenant_contact,
            tenant_contact_nano_id: nanoid(),
            tenant_nano_id: tenant.tenant_nano_id,
            created_by:
              creator?.user_profile?.full_name || creator_user_nano_id,
            created_on: new Date(),
          });
        }

        if (createTenantDto.tenant_settings) {
          await tx.insert(schema.tenant_settings).values({
            ...createTenantDto.tenant_settings,
            tenant_nano_id: tenant.tenant_nano_id,
            tenant_setting_nano_id: nanoid(),
            created_by:
              creator?.user_profile?.full_name || creator_user_nano_id,
            created_on: new Date(),
          });
        }

        return tenant;
      });

      const createdTenant = await this.findOne(result.tenant_nano_id);
      return {
        message: 'Tenant created successfully',
        tenant: createdTenant,
      };
    } catch (error: any) {
      if (error.message.includes('name')) {
        throw new ConflictException('Tenant name already exists');
      }
      if (error.message.includes('registration')) {
        throw new ConflictException('Registration number must be unique');
      }
      throw error;
    }
  }

  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [tenants, count] = await Promise.all([
      this.db.query.tenants.findMany({
        limit,
        offset,
        with: {
          tenant_contacts: true,
          tenant_settings: true,
          tenant_locations: true,
        },
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(schema.tenants),
    ]);

    const totalItems = Number(count[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return {
      data: tenants,
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

  async findOne(tenant_nano_id: string) {
    const tenant = await this.db.query.tenants.findFirst({
      where: eq(schema.tenants.tenant_nano_id, tenant_nano_id),
      with: {
        tenant_contacts: true,
        tenant_settings: true,
        tenant_locations: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(tenant_nano_id: string, updateTenantDto: UpdateTenantDto) {
    const { contact, ...tenantData } = updateTenantDto;

    try {
      await this.db.transaction(async (tx) => {
        const [tenant] = await tx
          .update(schema.tenants)
          .set({
            ...tenantData,
          })
          .where(eq(schema.tenants.tenant_nano_id, tenant_nano_id))
          .returning();

        if (!tenant) {
          throw new NotFoundException('Tenant not found');
        }

        if (contact) {
          await tx
            .update(schema.tenant_contacts)
            .set(contact)
            .where(eq(schema.tenant_contacts.tenant_nano_id, tenant_nano_id));
        }
      });

      const updatedTenant = await this.findOne(tenant_nano_id);
      return {
        message: 'Tenant updated successfully',
        tenant: updatedTenant,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ConflictException(
        'Tenant update failed due to conflicting data',
      );
    }
  }

  async remove(tenant_nano_id: string) {
    const [updatedTenant] = await this.db
      .delete(schema.tenants)
      .where(eq(schema.tenants.tenant_nano_id, tenant_nano_id))
      .returning();

    if (!updatedTenant) {
      throw new NotFoundException('Tenant not found');
    }

    return { message: 'Tenant deleted successfully' };
  }

  async updateSettings(tenant_nano_id: string, settings: TenantSettingsDto) {
    await this.findOne(tenant_nano_id); // Verify tenant exists

    const [updatedSettings] = await this.db
      .update(schema.tenant_settings)
      .set(settings)
      .where(eq(schema.tenant_settings.tenant_nano_id, tenant_nano_id))
      .returning();

    return {
      message: 'Settings updated successfully',
      settings: updatedSettings,
    };
  }

  async addLocation(tenant_nano_id: string, locationDto: TenantLocationDto) {
    await this.findOne(tenant_nano_id); // Verify tenant exists

    const [location] = await this.db
      .insert(schema.tenant_locations)
      .values({
        ...locationDto,
        tenant_nano_id,
        tenant_location_nano_id: nanoid(),
        created_on: new Date(),
      })
      .returning();

    return {
      message: 'Location added successfully',
      location,
    };
  }

  async getLocations(tenant_nano_id: string) {
    await this.findOne(tenant_nano_id); // Verify tenant exists

    return this.db.query.tenant_locations.findMany({
      where: eq(schema.tenant_locations.tenant_nano_id, tenant_nano_id),
    });
  }

  async updateLocation(
    tenant_nano_id: string,
    location_nano_id: string,
    locationDto: TenantLocationDto,
  ) {
    await this.findOne(tenant_nano_id); // Verify tenant exists

    const [location] = await this.db
      .update(schema.tenant_locations)
      .set({
        ...locationDto,
      })
      .where(
        and(
          eq(schema.tenant_locations.tenant_nano_id, tenant_nano_id),
          eq(schema.tenant_locations.tenant_location_nano_id, location_nano_id),
        ),
      )
      .returning();

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return {
      message: 'Location updated successfully',
      location,
    };
  }

  // Subscription methods
  async createSubscription(
    tenant_nano_id: string,
    dto: CreateTenantSubscriptionDto,
    creator_full_name: string,
  ) {
    const tenant_subscription_nano_id = nanoid();

    const [subscription] = await this.db
      .insert(schema.tenant_subscriptions)
      .values({
        tenant_subscription_nano_id,
        tenant_nano_id,
        subscription_name: dto.subscription_name,
        created_by: creator_full_name,
        created_on: new Date(),
      })
      .returning();

    await this.auditService.logChange({
      table_name: 'tenant_subscriptions',
      record_id: subscription.tenant_subscription_nano_id,
      action: 'CREATE',
      new_data: subscription,
      changed_by: creator_full_name,
    });

    return subscription;
  }

  async getSubscriptions(tenant_nano_id: string) {
    return this.db.query.tenant_subscriptions.findMany({
      where: eq(schema.tenant_subscriptions.tenant_nano_id, tenant_nano_id),
    });
  }

  async updateSubscription(
    subscription_nano_id: string,
    dto: UpdateTenantSubscriptionDto,
    updater_full_name: string,
  ) {
    const [subscription] = await this.db
      .update(schema.tenant_subscriptions)
      .set({
        ...dto,
        created_by: updater_full_name,
      })
      .where(
        eq(
          schema.tenant_subscriptions.tenant_subscription_nano_id,
          subscription_nano_id,
        ),
      )
      .returning();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    await this.auditService.logChange({
      table_name: 'tenant_subscriptions',
      record_id: subscription.tenant_subscription_nano_id,
      action: 'UPDATE',
      new_data: subscription,
      changed_by: updater_full_name,
    });

    return subscription;
  }
}
