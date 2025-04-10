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
  CreateEmailSettingsDto,
  CreateSmsSettingsDto,
  UpdateEmailSettingsDto,
  UpdateSmsSettingsDto,
  CreateContactDto,
  CreateTenantSettingsDto,
  UpdateTenantSettingsDto
} from './dto/tenant.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { ICurrentUser } from '../common/interfaces/current-user.interface';
import { MailService } from '../mail/mail.service';
import { AuditService } from 'src/common/services/audit.service';

@Injectable()
export class TenantsService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
    private auditService: AuditService,
    private mailService: MailService,
  ) {}

  private async checkTenantConflicts(params: {
    tenant_name?: string;
    tenant_owner_email?: string;
    tenant_owner_phone?: string;
    tenant_id?: string;
    tenant_data?: {
      long_name?: string;
      legal_name?: string;
      government_registration_id?: string;
    };
    contact?: {
      email?: { tenant_main_email: string };
      phone?: { tenant_main_phone: string };
      address?: { 
        address_line1: string;
        address_postal_code?: string; // Make postal code optional here
      };
    };
    settings?: {
      custom_primary_domain_name?: string;
      custom_staff_domain_name?: string;
      custom_lecturer_domain_name?: string;
      custom_student_domain_name?: string;
      custom_crm_domain_name?: string;
    };
  }) {
    const { tenant_id } = params;

    // Base tenant conflicts
    if (params.tenant_name) {
      const existingName = await this.db.query.tenants.findFirst({
        where: tenant_id
          ? and(
              eq(schema.tenants.tenant_name, params.tenant_name),
              sql`${schema.tenants.tenant_id} != ${tenant_id}`
            )
          : eq(schema.tenants.tenant_name, params.tenant_name)
      });
      if (existingName) {
        throw new ConflictException('Tenant name already exists');
      }
    }

    if (params.tenant_owner_email) {
      const existingEmail = await this.db.query.tenants.findFirst({
        where: tenant_id
          ? and(
              eq(schema.tenants.tenant_owner_email, params.tenant_owner_email),
              sql`${schema.tenants.tenant_id} != ${tenant_id}`
            )
          : eq(schema.tenants.tenant_owner_email, params.tenant_owner_email)
      });
      if (existingEmail) {
        throw new ConflictException('Tenant owner email already exists');
      }
    }

    if (params.tenant_owner_phone) {
      const existingPhone = await this.db.query.tenants.findFirst({
        where: tenant_id
          ? and(
              eq(schema.tenants.tenant_owner_phone, params.tenant_owner_phone),
              sql`${schema.tenants.tenant_id} != ${tenant_id}`
            )
          : eq(schema.tenants.tenant_owner_phone, params.tenant_owner_phone)
      });
      if (existingPhone) {
        throw new ConflictException('Tenant owner phone already exists');
      }
    }

    // Tenant data conflicts
    if (params.tenant_data) {
      if (params.tenant_data.government_registration_id) {
        const existingReg = await this.db.query.tenant_data.findFirst({
          where: tenant_id
            ? and(
                eq(schema.tenant_data.government_registration_id, params.tenant_data.government_registration_id),
                sql`${schema.tenant_data.tenant_id} != ${tenant_id}`
              )
            : eq(schema.tenant_data.government_registration_id, params.tenant_data.government_registration_id)
        });
        if (existingReg) {
          throw new ConflictException('Government registration ID already exists');
        }
      }

      if (params.tenant_data.long_name) {
        const existingLongName = await this.db.query.tenant_data.findFirst({
          where: tenant_id
            ? and(
                eq(schema.tenant_data.long_name, params.tenant_data.long_name),
                sql`${schema.tenant_data.tenant_id} != ${tenant_id}`
              )
            : eq(schema.tenant_data.long_name, params.tenant_data.long_name)
        });
        if (existingLongName) {
          throw new ConflictException('Institution long name already exists');
        }
      }

      if (params.tenant_data.legal_name) {
        const existingLegalName = await this.db.query.tenant_data.findFirst({
          where: tenant_id
            ? and(
                eq(schema.tenant_data.legal_name, params.tenant_data.legal_name),
                sql`${schema.tenant_data.tenant_id} != ${tenant_id}`
              )
            : eq(schema.tenant_data.legal_name, params.tenant_data.legal_name)
        });
        if (existingLegalName) {
          throw new ConflictException('Legal name already exists');
        }
      }
    }

    // Contact conflicts
    if (params.contact) {
      if (params.contact.email?.tenant_main_email) {
        const existingEmail = await this.db.query.contacts_email.findFirst({
          where: tenant_id
            ? and(
                eq(schema.contacts_email.tenant_main_email, params.contact.email.tenant_main_email),
                sql`${schema.contacts_email.tenant_id} != ${tenant_id}`
              )
            : eq(schema.contacts_email.tenant_main_email, params.contact.email.tenant_main_email)
        });
        if (existingEmail) {
          throw new ConflictException('Contact email already exists');
        }
      }

      if (params.contact.phone?.tenant_main_phone) {
        const existingPhone = await this.db.query.contacts_phone.findFirst({
          where: tenant_id
            ? and(
                eq(schema.contacts_phone.tenant_main_phone, params.contact.phone.tenant_main_phone),
                sql`${schema.contacts_phone.tenant_id} != ${tenant_id}`
              )
            : eq(schema.contacts_phone.tenant_main_phone, params.contact.phone.tenant_main_phone)
        });
        if (existingPhone) {
          throw new ConflictException('Contact phone already exists');
        }
      }
    }

    // Settings conflicts
    if (params.settings) {
      const domainChecks = [
        { field: 'custom_primary_domain_name', value: params.settings.custom_primary_domain_name },
        { field: 'custom_staff_domain_name', value: params.settings.custom_staff_domain_name },
        { field: 'custom_lecturer_domain_name', value: params.settings.custom_lecturer_domain_name },
        { field: 'custom_student_domain_name', value: params.settings.custom_student_domain_name },
        { field: 'custom_crm_domain_name', value: params.settings.custom_crm_domain_name }
      ];

      for (const check of domainChecks) {
        if (check.value) {
          const existingDomain = await this.db.query.tenant_settings.findFirst({
            where: tenant_id
              ? and(
                  eq(schema.tenant_settings[check.field], check.value),
                  sql`${schema.tenant_settings.tenant_id} != ${tenant_id}`
                )
              : eq(schema.tenant_settings[check.field], check.value)
          });
          if (existingDomain) {
            throw new ConflictException(`Domain ${check.value} already exists`);
          }
        }
      }
    }
  }

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
      audit_log_id: nanoid(),
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

  async createTenant(dto: CreateTenantDto, currentUser: ICurrentUser): Promise<ApiResponse<any>> {
    // Check conflicts before transaction
    await this.checkTenantConflicts({
      tenant_name: dto.tenant_name,
      tenant_owner_email: dto.tenant_owner_email,
      tenant_owner_phone: dto.tenant_owner_phone,
      tenant_data: dto.tenant_data,
      contact: dto.contact && {
        email: dto.contact.email && { 
          tenant_main_email: dto.contact.email.tenant_main_email 
        },
        phone: dto.contact.phone && { 
          tenant_main_phone: dto.contact.phone.tenant_main_phone 
        },
        address: dto.contact.address && { 
          address_line1: dto.contact.address.address_address_line1,
          address_postal_code: dto.contact.address.address_postal_code || undefined
        }
      }
    });

    const tenant = await this.db.transaction(async (tx) => {
      const tenant_id = `tpe${nanoid(19)}`;
      const tenant_data_id = `tpe${nanoid(19)}`;
      
      // Create base tenant
      const [tenant] = await tx.insert(schema.tenants).values({
        tenant_id,
        ...dto,
        created_by: currentUser.full_name,
        modified_by: currentUser.full_name
      }).returning();

      // Create tenant data if provided
      if (dto.tenant_data) {
        await tx.insert(schema.tenant_data).values({
          tenant_data_id,
          tenant_id,
          ...dto.tenant_data,
          created_by: currentUser.full_name,
          modified_by: currentUser.full_name
        });
      }

      // Create contact if provided
      if (dto.contact) {
        const contact_id = `tpe${nanoid(19)}`;
        const email_id = `tpe${nanoid(19)}`;
        const phone_id = `tpe${nanoid(19)}`;
        const address_id = `tpe${nanoid(19)}`;
        const social_id = `tpe${nanoid(19)}`;

        const [contact] = await tx.insert(schema.contacts).values({
          contact_id,
          tenant_id,
          contact_email_id: email_id,
          contact_phone_id: phone_id,
          contact_address_id: address_id,
          contact_social_id: social_id,
          ...dto.contact,
          created_by: currentUser.full_name,
          modified_by: currentUser.full_name
        }).returning();

        // Insert contact email
        await tx.insert(schema.contacts_email).values({
          contact_email_id: email_id,
          contact_id,
          tenant_id,
          ...dto.contact.email,
          created_by: currentUser.full_name,
          modified_by: currentUser.full_name
        });

        // Insert contact phone
        await tx.insert(schema.contacts_phone).values({
          contact_phone_id: phone_id,
          contact_id,
          tenant_id,
          ...dto.contact.phone,
          created_by: currentUser.full_name,
          modified_by: currentUser.full_name
        });

        // Insert contact address
        await tx.insert(schema.contacts_address).values({
          contact_address_id: address_id,
          contact_id,
          tenant_id,
          address_type: dto.contact.address.address_type,
          address_name: dto.contact.address.address_name,
          address_country: dto.contact.address.address_country,
          address_state: dto.contact.address.address_state,
          address_region: dto.contact.address.address_region,
          address_district: dto.contact.address.address_district,
          address_address_line1: dto.contact.address.address_address_line1,
          address_address_line2: dto.contact.address.address_address_line2,
          address_city: dto.contact.address.address_city,
          address_postal_code: dto.contact.address.address_postal_code,
          address_latitude: dto.contact.address.address_latitude,
          address_longitude: dto.contact.address.address_longitude,
          created_by: currentUser.full_name,
          modified_by: currentUser.full_name
        });

        // Insert contact social
        await tx.insert(schema.contacts_social).values({
          contact_social_id: social_id,
          contact_id,
          tenant_id,
          ...dto.contact.social,
          created_by: currentUser.full_name,
          modified_by: currentUser.full_name
        });
      }

      // Log audit
      await this.auditService.logChange({
        tenant_id,
        table_name: 'tenants',
        record_id: tenant_id,
        action: 'CREATE',
        new_data: tenant,
        changed_by: currentUser.full_name,
        change_by_login_ip: currentUser.ip
      });

      return tenant;
    });

    return {
      message: 'Tenant created successfully',
      data: tenant
    };
  }

  async updateContact(
    tenant_id: string,
    contact_id: string,
    dto: CreateContactDto,
    currentUser: ICurrentUser
  ): Promise<ApiResponse<any>> {
    const contact = await this.db.transaction(async (tx) => {
      const [contact] = await tx
        .update(schema.contacts)
        .set({
          ...dto,
          modified_by: currentUser.full_name,
          modified_on: new Date()
        })
        .where(and(
          eq(schema.contacts.tenant_id, tenant_id),
          eq(schema.contacts.contact_id, contact_id)
        ))
        .returning();

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }

      // Update email
      await tx
        .update(schema.contacts_email)
        .set({
          ...dto.email,
          modified_by: currentUser.full_name,
          modified_on: new Date()
        })
        .where(eq(schema.contacts_email.contact_id, contact_id));

      // Update phone
      await tx
        .update(schema.contacts_phone)
        .set({
          ...dto.phone,
          modified_by: currentUser.full_name,
          modified_on: new Date()
        })
        .where(eq(schema.contacts_phone.contact_id, contact_id));

      // Update address
      await tx
        .update(schema.contacts_address)
        .set({
          ...dto.address,
          modified_by: currentUser.full_name,
          modified_on: new Date()
        })
        .where(eq(schema.contacts_address.contact_id, contact_id));

      // Update social
      await tx
        .update(schema.contacts_social)
        .set({
          ...dto.social,
          modified_by: currentUser.full_name,
          modified_on: new Date()
        })
        .where(eq(schema.contacts_social.contact_id, contact_id));

      await this.auditService.logChange({
        tenant_id: currentUser.tenant_id,
        table_name: 'contacts',
        record_id: contact_id,
        action: 'UPDATE',
        new_data: contact,
        changed_by: currentUser.full_name,
        change_by_login_ip: currentUser.ip
      });

      return contact;
    });

    return {
      message: 'Contact updated successfully',
      data: contact
    };
  }

  async getTenant(tenant_id: string) {
    const tenant = await this.db.query.tenants.findFirst({
      where: eq(schema.tenants.tenant_id, tenant_id),
      with: {
        tenant_settings:true,
        tenant_data: true,
        tenant_subscription: true,
        tenant_account_type: true,
        tenant_contacts:{
          with: {
            email: true,
            phone: true,
            address: true,
            social: true
          }
        }
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async updateTenant(tenant_id: string, dto: UpdateTenantDto, currentUser: ICurrentUser): Promise<ApiResponse<any>> {
    // Check conflicts before transaction
    await this.checkTenantConflicts({
      tenant_id,
      tenant_name: dto.tenant_name,
      tenant_owner_email: dto.tenant_owner_email,
      tenant_owner_phone: dto.tenant_owner_phone,
      tenant_data: dto.tenant_data,
      contact: dto.contact && {
        email: dto.contact.email && { 
          tenant_main_email: dto.contact.email.tenant_main_email 
        },
        phone: dto.contact.phone && { 
          tenant_main_phone: dto.contact.phone.tenant_main_phone 
        },
        address: dto.contact.address && { 
          address_line1: dto.contact.address.address_address_line1,
          address_postal_code: dto.contact.address.address_postal_code || undefined
        }
      }
    });

    const result = await this.db.transaction(async (tx) => {
      // Update base tenant
      const [tenant] = await tx
        .update(schema.tenants)
        .set({
          tenant_account_type_id: dto.tenant_account_type_id,
          tenant_name: dto.tenant_name,
          tenant_owner_name: dto.tenant_owner_name,
          tenant_owner_email: dto.tenant_owner_email,
          tenant_owner_phone: dto.tenant_owner_phone,
          tenant_subscription_id: dto.tenant_subscription_id,
          tenant_user_id: dto.tenant_user_id,
          status: dto.status,
          welcome_email_sent: dto.welcome_email_sent,
          account_is_suspended: dto.account_is_suspended,
          account_is_expired: dto.account_is_expired,
          account_subscription_paid: dto.account_subscription_paid,
          modified_by: currentUser.full_name,
          modified_on: new Date()
        })
        .where(eq(schema.tenants.tenant_id, tenant_id))
        .returning();

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      // Update tenant data if provided
      let tenantData;
      if (dto.tenant_data) {
        [tenantData] = await tx
          .update(schema.tenant_data)
          .set({
            ...dto.tenant_data,
            modified_by: currentUser.full_name,
            modified_on: new Date()
          })
          .where(eq(schema.tenant_data.tenant_id, tenant_id))
          .returning();
        
        if (!tenantData) {
          // If tenant data doesn't exist, create it
          [tenantData] = await tx.insert(schema.tenant_data).values({
            tenant_data_id: `tpe${nanoid(19)}`,
            tenant_id,
            ...dto.tenant_data,
            created_by: currentUser.full_name,
            modified_by: currentUser.full_name
          }).returning();
        }
      }

      // Log audit for tenant update
      await this.auditService.logChange({
        tenant_id,
        table_name: 'tenants',
        record_id: tenant_id,
        action: 'UPDATE',
        old_data: tenant,
        new_data: { ...tenant, tenant_data: tenantData },
        changed_by: currentUser.full_name,
        change_by_login_ip: currentUser.ip
      });

      return {
        ...tenant,
        tenant_data: tenantData
      };
    });

    return {
      message: 'Tenant updated successfully',
      data: result
    };
  }

  async deleteTenant(tenant_id: string, currentUser: ICurrentUser) {
    const [tenant] = await this.db
      .delete(schema.tenants)
      .where(eq(schema.tenants.tenant_id, tenant_id))
      .returning();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.auditService.logChange({
      tenant_id,
      table_name: 'tenants',
      record_id: tenant_id,
      action: 'DELETE',
      old_data: tenant,
      new_data: null,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return { message: 'Tenant deleted successfully' };
  }

  async createEmailSettings(
    tenant_id: string, 
    dto: CreateEmailSettingsDto, 
    currentUser: ICurrentUser
  ): Promise<ApiResponse<any>> {
    const [settings] = await this.db.insert(schema.email_settings).values({
      email_setting_id: `tpe${nanoid(19)}`,
      ...dto,
      tenant_id,
      created_by: currentUser.full_name,
      modified_by: currentUser.full_name
    }).returning();

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'email_settings',
      record_id: settings.email_setting_id || "",
      action: 'CREATE',
      new_data: settings,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return {
      message: 'Email settings created successfully',
      data: settings
    };
  }

  async getEmailSettings(tenant_id: string) {
    const settings = await this.db.query.email_settings.findFirst({
      where: eq(schema.email_settings.tenant_id, tenant_id)
    });
    
    if (!settings) {
      throw new NotFoundException('Email settings not found');
    }
    
    return settings;
  }

  async updateEmailSettings(
    tenant_id: string, 
    dto: UpdateEmailSettingsDto, 
    currentUser: ICurrentUser
  ): Promise<ApiResponse<any>> {
    const [settings] = await this.db
      .update(schema.email_settings)
      .set({
        ...dto,
        modified_by: currentUser.full_name,
        modified_on: new Date()
      })
      .where(eq(schema.email_settings.tenant_id, tenant_id))
      .returning();

    if (!settings) {
      throw new NotFoundException('Email settings not found');
    }

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'email_settings',
      record_id: settings.email_setting_id || "",
      action: 'UPDATE',
      old_data: null,
      new_data: settings,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return {
      message: 'Email settings updated successfully',
      data: settings
    };
  }

  async deleteEmailSettings(tenant_id: string, currentUser: ICurrentUser) {
    const [settings] = await this.db
      .delete(schema.email_settings)
      .where(eq(schema.email_settings.tenant_id, tenant_id))
      .returning();

    if (!settings) {
      throw new NotFoundException('Email settings not found');
    }

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'email_settings',
      record_id: settings.email_setting_id || "",
      action: 'DELETE',
      old_data: settings,
      new_data: null,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return { message: 'Email settings deleted successfully' };
  }

  async createSmsSettings(
    tenant_id: string, 
    dto: CreateSmsSettingsDto, 
    currentUser: ICurrentUser
  ): Promise<ApiResponse<any>> {
    const [settings] = await this.db.insert(schema.sms_settings).values({
      sms_setting_id: `tpe${nanoid(19)}`,
      ...dto,
      tenant_id,
      created_by: currentUser.full_name,
      modified_by: currentUser.full_name
    }).returning();

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'sms_settings',
      record_id: settings.sms_setting_id || "",
      action: 'CREATE',
      new_data: settings,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return {
      message: 'SMS settings created successfully',
      data: settings
    };
  }

  async getSmsSettings(tenant_id: string) {
    const settings = await this.db.query.sms_settings.findFirst({
      where: eq(schema.sms_settings.tenant_id, tenant_id)
    });
    
    if (!settings) {
      throw new NotFoundException('SMS settings not found');
    }
    
    return settings;
  }

  async updateSmsSettings(
    tenant_id: string, 
    dto: UpdateSmsSettingsDto, 
    currentUser: ICurrentUser
  ): Promise<ApiResponse<any>> {
    const [settings] = await this.db
      .update(schema.sms_settings)
      .set({
        ...dto,
        modified_by: currentUser.full_name,
        modified_on: new Date()
      })
      .where(eq(schema.sms_settings.tenant_id, tenant_id))
      .returning();

    if (!settings) {
      throw new NotFoundException('SMS settings not found');
    }

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'sms_settings',
      record_id: settings.sms_setting_id || "",
      action: 'UPDATE',
      old_data: null,
      new_data: settings,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return {
      message: 'SMS settings updated successfully',
      data: settings
    };
  }

  async deleteSmsSettings(tenant_id: string, currentUser: ICurrentUser) {
    const [settings] = await this.db
      .delete(schema.sms_settings)
      .where(eq(schema.sms_settings.tenant_id, tenant_id))
      .returning();

    if (!settings) {
      throw new NotFoundException('SMS settings not found');
    }

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'sms_settings',
      record_id: settings.sms_setting_id || "",
      action: 'DELETE',
      old_data: settings,
      new_data: null,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return { message: 'SMS settings deleted successfully' };
  }

  async createContact(tenant_id: string, dto: CreateContactDto, currentUser: ICurrentUser): Promise<ApiResponse<any>> {
    // Check contact conflicts
    await this.checkTenantConflicts({
      tenant_id,
      contact: {
        email: { tenant_main_email: dto.email.tenant_main_email },
        phone: { tenant_main_phone: dto.phone.tenant_main_phone }
      }
    });

    const contact = await this.db.transaction(async (tx) => {
      // Generate all required IDs first
      const contact_id = `tpe${nanoid(19)}`;
      const contact_email_id = `tpe${nanoid(19)}`;
      const contact_phone_id = `tpe${nanoid(19)}`;
      const contact_address_id = `tpe${nanoid(19)}`;
      const contact_social_id = `tpe${nanoid(19)}`;
      
      // Create contact with required IDs
      const [contact] = await tx.insert(schema.contacts).values({
        contact_id,
        tenant_id,
        contact_email_id,
        contact_phone_id,
        contact_address_id,
        contact_social_id,
        ...dto,
        Status: dto.Status,
        comment: dto.comment,
        created_by: currentUser.full_name,
        modified_by: currentUser.full_name
      }).returning();

      // Create email record
      await tx.insert(schema.contacts_email).values({
        contact_email_id,
        contact_id,
        tenant_id,
        email_type: dto.email.email_type,
        email_name: dto.email.email_name,
        tenant_main_email: dto.email.tenant_main_email,
        created_by: currentUser.full_name,
        modified_by: currentUser.full_name,
        
      });

      // Create phone record
      await tx.insert(schema.contacts_phone).values({
        contact_phone_id,
        contact_id,
        tenant_id,
        phone_type: dto.phone.phone_type,
        phone_name: dto.phone.phone_name,
        tenant_main_phone: dto.phone.tenant_main_phone,
        created_by: currentUser.full_name,
        modified_by: currentUser.full_name,
      });

      // Create address record with correct field mapping
      await tx.insert(schema.contacts_address).values({
        contact_address_id,
        contact_id,
        tenant_id,
        address_type: dto.address.address_type,
        address_name: dto.address.address_name,
        address_country: dto.address.address_country,
        address_state: dto.address.address_state,
        address_region: dto.address.address_region,
        address_district: dto.address.address_district,
        address_address_line1: dto.address.address_address_line1,
        address_address_line2: dto.address.address_address_line2,
        address_city: dto.address.address_city,
        address_postal_code: dto.address.address_postal_code,
        address_latitude: dto.address.address_latitude,
        address_longitude: dto.address.address_longitude,
        created_by: currentUser.full_name,
        modified_by: currentUser.full_name,
      });

      // Create social record
      await tx.insert(schema.contacts_social).values({
        contact_social_id,
        contact_id,
        tenant_id,
        social_type: dto.social.social_type,
        social_name: dto.social.social_name,
        social_link: dto.social.social_link,
        created_by: currentUser.full_name,
        modified_by: currentUser.full_name
      });

      await this.auditService.logChange({
        tenant_id,
        table_name: 'contacts',
        record_id: contact_id,
        action: 'CREATE',
        new_data: contact,
        changed_by: currentUser.full_name
      });

      return contact;
    });

    return {
      message: 'Contact created successfully',
      data: contact
    };
  }

  async updateTenantStatus(
    tenant_id: string, 
    status: boolean, 
    currentUser: ICurrentUser
  ): Promise<ApiResponse<any>> {
    const [tenant] = await this.db
      .update(schema.tenants)
      .set({
        status,
        modified_by: currentUser.full_name,
        modified_on: new Date()
      })
      .where(eq(schema.tenants.tenant_id, tenant_id))
      .returning();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'tenants',
      record_id: tenant_id,
      action: 'UPDATE',
      old_data: { status: !status },
      new_data: { status },
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return {
      message: 'Tenant status updated successfully',
      data: tenant
    };
  }

  async updateTenantSuspension(
    tenant_id: string, 
    suspended: boolean, 
    currentUser: ICurrentUser
  ): Promise<ApiResponse<any>> {
    const [tenant] = await this.db
      .update(schema.tenants)
      .set({
        account_is_suspended: suspended,
        modified_by: currentUser.full_name,
        modified_on: new Date()
      })
      .where(eq(schema.tenants.tenant_id, tenant_id))
      .returning();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.auditService.logChange({
      tenant_id: currentUser.tenant_id,
      table_name: 'tenants',
      record_id: tenant_id,
      action: 'UPDATE',
      old_data: { account_is_suspended: !suspended },
      new_data: { account_is_suspended: suspended },
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return {
      message: 'Tenant suspension status updated successfully',
      data: tenant
    };
  }

  async getContact(contact_id: string) {
    const contact = await this.db.query.contacts.findFirst({
      where: eq(schema.contacts.contact_id, contact_id),
      with: {
        email: true,
        phone: true,
        address: true,
        social: true
      }
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async deleteContact(contact_id: string, currentUser: ICurrentUser) {
    return this.db.transaction(async (tx) => {
      const [contact] = await tx
        .delete(schema.contacts)
        .where(eq(schema.contacts.contact_id, contact_id))
        .returning();

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }

      // Delete related records
      await tx.delete(schema.contacts_email)
        .where(eq(schema.contacts_email.contact_id, contact_id));
      await tx.delete(schema.contacts_phone)
        .where(eq(schema.contacts_phone.contact_id, contact_id));
      await tx.delete(schema.contacts_address)
        .where(eq(schema.contacts_address.contact_id, contact_id));
      await tx.delete(schema.contacts_social)
        .where(eq(schema.contacts_social.contact_id, contact_id));

      await this.auditService.logChange({
        tenant_id: currentUser.tenant_id,
        table_name: 'contacts',
        record_id: contact_id,
        action: 'DELETE',
        old_data: contact,
        new_data: null,
        changed_by: currentUser.full_name,
        change_by_login_ip: currentUser.ip
      });

      return { message: 'Contact deleted successfully' };
    });
  }

  async getAllTenants(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [tenants, count] = await Promise.all([
      this.db.query.tenants.findMany({
        limit,
        offset,
        with: {
          tenant_data: true,
          tenant_subscription: true
        },
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(schema.tenants),
    ]);

    const totalItems = Number(count[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: tenants,
      metadata: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findByDomain(domain: string) {
    const tenant = await this.db.query.tenants.findFirst({
      where: eq(schema.tenants.domain, domain),
      with: {
        tenant_data: true,
        tenant_settings: true,
        tenant_contacts:{
          with:{
            email: true,
            phone: true,
            address: true,
            social: true
          }
        },
        tenant_subscription: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found for this domain');
    }

    return tenant;
  }

  async sendWelcomeEmail(tenant_id: string) {
    const tenant = await this.getTenant(tenant_id);
    
    if (tenant.welcome_email_sent) {
      return { message: 'Welcome email already sent' };
    }

    // Get tenant email settings
    const emailSettings = await this.db.query.email_settings.findFirst({
      where: eq(schema.email_settings.tenant_id, tenant_id),
    });

    // Send welcome email with context
    await this.mailService.sendWelcomeEmail(
      tenant.tenant_owner_email,
      {
        tenant_name: tenant.tenant_name,
        owner_name: tenant.tenant_owner_name,
      },
      emailSettings || undefined,
      {
        tenant_id: tenant_id,
        sender_name: 'system',
        send_user_id: "",
        recipent_user_id: tenant.tenant_user_id,
        change_by_login_ip: ""
      }
    );

    // Update welcome_email_sent status
    const [updatedTenant] = await this.db
      .update(schema.tenants)
      .set({ 
        welcome_email_sent: true,
        modified_on: new Date(),
        modified_by: 'system'
      })
      .where(eq(schema.tenants.tenant_id, tenant_id))
      .returning();

    return {
      message: 'Welcome email sent successfully',
      data: updatedTenant
    };
  }

  async createTenantSettings(
    dto: CreateTenantSettingsDto, 
    currentUser: ICurrentUser
  ): Promise<ApiResponse<any>> {
    const [settings] = await this.db.insert(schema.tenant_settings).values({
      tenant_setting_id: `tpe${nanoid(19)}`,
      ...dto
    }).returning();

    await this.auditService.logChange({
      tenant_id: dto.tenant_id,
      table_name: 'tenant_settings',
      record_id: settings.tenant_setting_id,
      action: 'CREATE',
      new_data: settings,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return {
      message: 'Tenant settings created successfully',
      data: settings
    };
  }

  async getTenantSettings(tenant_id: string) {
    const settings = await this.db.query.tenant_settings.findFirst({
      where: eq(schema.tenant_settings.tenant_id, tenant_id)
    });

    if (!settings) {
      throw new NotFoundException('Tenant settings not found');
    }

    return settings;
  }

  async updateTenantSettings(
    tenant_id: string,
    dto: UpdateTenantSettingsDto,
    currentUser: ICurrentUser
  ): Promise<ApiResponse<any>> {
    const [settings] = await this.db
      .update(schema.tenant_settings)
      .set({
        ...dto
      })
      .where(eq(schema.tenant_settings.tenant_id, tenant_id))
      .returning();

    if (!settings) {
      throw new NotFoundException('Tenant settings not found');
    }

    await this.auditService.logChange({
      tenant_id,
      table_name: 'tenant_settings',
      record_id: settings.tenant_setting_id,
      action: 'UPDATE',
      new_data: settings,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return {
      message: 'Tenant settings updated successfully',
      data: settings
    };
  }

  async deleteTenantSettings(tenant_id: string, currentUser: ICurrentUser) {
    const [settings] = await this.db
      .delete(schema.tenant_settings)
      .where(eq(schema.tenant_settings.tenant_id, tenant_id))
      .returning();

    if (!settings) {
      throw new NotFoundException('Tenant settings not found');
    }

    await this.auditService.logChange({
      tenant_id,
      table_name: 'tenant_settings',
      record_id: settings.tenant_setting_id,
      action: 'DELETE',
      old_data: settings,
      new_data: null,
      changed_by: currentUser.full_name,
      change_by_login_ip: currentUser.ip
    });

    return { message: 'Tenant settings deleted successfully' };
  }
}
