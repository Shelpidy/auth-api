import * as schema from '../src/database/schema';
import { nanoid as nd } from 'nanoid';
import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

const db = drizzle(pool, { schema });

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

const nanoid = ()=> {
  const id = nd(19);
  return id
}
async function main() {
  try {
    // Create account type
    const [accountType] = await db.insert(schema.tenant_account_types)
      .values({
        tenant_account_type_id: 'tpe' + nanoid(),
        name: 'Educational Institution',
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();


    // Create tenant
    const [tenant] = await db.insert(schema.tenants)
      .values({
        tenant_id: 'tpe' + nanoid(),
        tenant_account_type_id: accountType.tenant_account_type_id,
        tenant_name: 'Demo Institution',
        tenant_owner_name: 'John Doe',
        tenant_owner_email: 'john.doe@demo.edu',
        tenant_owner_phone: '+23276543210',
        tenant_user_id: 'tpe' + nanoid(), // Will be updated after user creation
        status: true,
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    // Create tenant data
    const [tenantData] = await db.insert(schema.tenant_data)
      .values({
        tenant_data_id: 'tpe' + nanoid(),
        tenant_id: tenant.tenant_id,
        long_name: 'Demo International Institution',
        legal_name: 'Demo International Institution Ltd',
        education_category: 'Higher Education',
        education_lowest_grade_level: 'Year 1',
        education_highest_grade_level: 'Year 4',
        date_founded: new Date('2023-01-01').toISOString(),
        description: 'A premier educational institution',
        website: 'https://demo.edu',
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    // Create contacts for tenant
    const [contactEmail] = await db.insert(schema.contacts_email)
      .values({
        contact_email_id: 'tpe' + nanoid(),
        tenant_id: tenant.tenant_id,
        email_type: 'Primary',
        email_name: 'Main Contact',
        tenant_main_email: 'contact@demo.edu',
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    const [contactPhone] = await db.insert(schema.contacts_phone)
      .values({
        contact_phone_id: 'tpe' + nanoid(),
        tenant_id: tenant.tenant_id,
        phone_type: 'Office',
        phone_name: 'Main Office',
        tenant_main_phone: '+23276123456',
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    const [contactAddress] = await db.insert(schema.contacts_address)
      .values({
        contact_address_id: 'tpe' + nanoid(),
        tenant_id: tenant.tenant_id,
        address_type: 'Main Campus',
        address_name: 'Main Office',
        address_country: 'Sierra Leone',
        address_state: 'Western Area',
        address_city: 'Freetown',
        address_address_line1: '123 Education Street',
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    const [contactSocial] = await db.insert(schema.contacts_social)
      .values({
        contact_social_id: 'tpe' + nanoid(),
        tenant_id: tenant.tenant_id,
        social_type: 'Website',
        social_name: 'Official Website',
        social_link: 'https://demo.edu',
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    // Create main contact record
    await db.insert(schema.contacts)
      .values({
        contact_id: 'tpe' + nanoid(),
        tenant_id: tenant.tenant_id,
        contact_type: 'Institution',
        Contact_name: 'Main Office',
        contact_email_id: contactEmail.contact_email_id,
        contact_phone_id: contactPhone.contact_phone_id,
        contact_address_id: contactAddress.contact_address_id,
        contact_social_id: contactSocial.contact_social_id,
        is_primary_contact: true,
        created_by: 'system',
        modified_by: 'system'
      });

    // Create user type
    const [userType] = await db.insert(schema.user_types)
      .values({
        user_type_id: 'tpe' + nanoid(),
        user_type_name: 'Administrator',
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    // Create admin user
    const [adminUser] = await db.insert(schema.users)
      .values({
        user_id: 'tpe' + nanoid(),
        tenant_id: tenant.tenant_id,
        user_type_id: userType.user_type_id,
        username: 'admin',
        email: 'admin@example.com',
        primary_phone: '+23276987654',
        password: await hashPassword('admin@123'),
        is_verified: true,
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    // Update tenant with admin user id
    await db.update(schema.tenants)
      .set({ tenant_user_id: adminUser.user_id })
      .where(eq(schema.tenants.tenant_id, tenant.tenant_id));

    // Create user data for admin
    await db.insert(schema.user_data)
      .values({
        user_data_id: 'tpe' + nanoid(),
        user_id: adminUser.user_id,
        tenant_id: tenant.tenant_id,
        full_name: 'System Administrator',
        first_name: 'System',
        last_name: 'Administrator',
        created_by: 'system',
        modified_by: 'system'
      });

    // Create user auth record
    await db.insert(schema.user_auths)
      .values({
        user_auth_id: 'tpe' + nanoid(),
        user_id: adminUser.user_id,
        tenant_id: tenant.tenant_id,
        created_by: 'system',
        modified_by: 'system'
      });

    // Create roles
    const [adminRole] = await db.insert(schema.roles)
      .values({
        role_id: 'tpe' + nanoid(),
        tenant_id: tenant.tenant_id,
        name: 'admin',
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();
    

    // Assign role to admin user
    await db.insert(schema.user_roles)
      .values({
        user_role_id: 'tpe' + nanoid(),
        role_id: adminRole.role_id,
        user_id: adminUser.user_id,
        tenant_id: tenant.tenant_id,
        created_by: 'system',
        modified_by: 'system'
      });

    // Create super admin role
    const role_id = `tpe${nanoid()}`;
    const [superAdminRole] = await db
      .insert(schema.roles)
      .values({
        role_id,
        name: 'super-admin',
        created_by: 'system',
        modified_by: 'system',
      })
      .returning();

    // Create tenant super admin user
    const tenantSuperAdminId = `tpe${nanoid()}`;
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    
    const [tenantSuperAdmin] = await db
      .insert(schema.users)
      .values({
        user_id: tenantSuperAdminId,
        email: 'tenant.admin@example.com',
        password: hashedPassword,
        display_name: 'Tenant Super Admin',
        tenant_id: 'your_tenant_id', // Replace with actual tenant ID
        created_by: 'system',
        modified_by: 'system',
      })
      .returning();

    // Create non-tenant super admin user
    const globalSuperAdminId = `tpe${nanoid()}`;
    const [globalSuperAdmin] = await db
      .insert(schema.users)
      .values({
        user_id: globalSuperAdminId,
        email: 'superadmin@example.com',
        password: hashedPassword,
        display_name: 'Global Super Admin',
        tenant_id: null, // No tenant association
        created_by: 'system',
        modified_by: 'system',
      })
      .returning();

    // Assign role to tenant super admin
    await db.insert(schema.user_roles).values({
      user_role_id: `tpe${nanoid()}`,
      user_id: tenantSuperAdminId,
      role_id: role_id,
      created_by: 'system',
      modified_by: 'system',
    });

    // Assign role to global super admin
    await db.insert(schema.user_roles).values({
      user_role_id: `tpe${nanoid()}`,
      user_id: globalSuperAdminId,
      role_id: role_id,
      tenant_id: null, // No tenant association
      created_by: 'system',
      modified_by: 'system',
    });

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
