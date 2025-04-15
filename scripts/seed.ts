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
    // Create super-admin role first (without tenant association)
    const [superAdminRole] = await db.insert(schema.roles)
      .values({
        role_id: 'tpe' + nanoid(),
        tenant_id: null, // No tenant association
        name: 'super-admin',
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    // Create super admin user
    const [superAdminUser] = await db.insert(schema.users)
      .values({
        user_id: 'tpe' + nanoid(),
        tenant_id: null, // No tenant association
        username: 'superadmin',
        email: 'teaxmarkit@gmail.com',
        primary_phone: '+23276000000',
        password: await hashPassword('teaxmarkit'),
        is_verified: true,
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    // Assign super-admin role
    await db.insert(schema.user_roles)
      .values({
        user_role_id: 'tpe' + nanoid(),
        role_id: superAdminRole.role_id,
        user_id: superAdminUser.user_id,
        tenant_id: null, // No tenant association
        created_by: 'system',
        modified_by: 'system'
      });

    // Create user_auth record for super admin
    await db.insert(schema.user_auths)
      .values({
        user_auth_id: 'tpe' + nanoid(),
        user_id: superAdminUser.user_id,
        tenant_id: null, // No tenant association
        created_by: 'system',
        modified_by: 'system'
      });

    // Create account type
    const [accountType] = await db.insert(schema.tenant_account_types)
      .values({
        tenant_account_type_id: 'tpe' + nanoid(),
        name: 'Educational Institution',
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    // Create first tenant
    const [tenant1] = await db.insert(schema.tenants)
      .values({
        tenant_id: 'tpe' + nanoid(),
        tenant_account_type_id: accountType.tenant_account_type_id,
        tenant_name: 'Demo Institution 1',
        tenant_owner_name: 'John Doe',
        tenant_owner_email: 'john.doe@demo1.edu',
        tenant_owner_phone: '+23276543210',
        tenant_user_id: 'tpe' + nanoid(),
        status: true,
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    // Create second tenant  
    const [tenant2] = await db.insert(schema.tenants)
      .values({
        tenant_id: 'tpe' + nanoid(),
        tenant_account_type_id: accountType.tenant_account_type_id,
        tenant_name: 'Demo Institution 2',
        tenant_owner_name: 'Jane Smith',
        tenant_owner_email: 'jane.smith@demo2.edu', 
        tenant_owner_phone: '+23276543211',
        tenant_user_id: 'tpe' + nanoid(),
        status: true,
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    // Create roles for both tenants
    const createRoles = async (tenantId: string) => {
      const [adminRole] = await db.insert(schema.roles)
        .values({
          role_id: 'tpe' + nanoid(),
          tenant_id: tenantId,
          name: 'admin',
          created_by: 'system',
          modified_by: 'system'
        })
        .returning();

      const [authenticatedRole] = await db.insert(schema.roles)
        .values({
          role_id: 'tpe' + nanoid(),
          tenant_id: tenantId,
          name: 'authenticated',
          created_by: 'system',
          modified_by: 'system'
        })
        .returning();

      return { adminRole, authenticatedRole };
    };

    const tenantRoles = await createRoles(tenant1.tenant_id);

    // Create users for first tenant
    const [tenant1AdminUser] = await db.insert(schema.users)
      .values({
        user_id: 'tpe' + nanoid(),
        tenant_id: tenant1.tenant_id,
        username: 'admin1',
        email: 'admin@demo1.edu',
        primary_phone: '+23276987654',
        password: await hashPassword('admin123'),
        is_verified: true,
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    const [tenant1RegularUser] = await db.insert(schema.users)
      .values({
        user_id: 'tpe' + nanoid(),
        tenant_id: tenant1.tenant_id,
        username: 'user1',
        email: 'user@demo1.edu',
        primary_phone: '+23276987655',
        password: await hashPassword('user123'),
        is_verified: true,
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    // Create users for second tenant
    const [tenant2AdminUser] = await db.insert(schema.users)
      .values({
        user_id: 'tpe' + nanoid(),
        tenant_id: tenant2.tenant_id,
        username: 'admin2',
        email: 'admin@demo2.edu',
        primary_phone: '+23276987656',
        password: await hashPassword('admin123'),
        is_verified: true,
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    const [tenant2RegularUser] = await db.insert(schema.users)
      .values({
        user_id: 'tpe' + nanoid(),
        tenant_id: tenant2.tenant_id,
        username: 'user2', 
        email: 'user@demo2.edu',
        primary_phone: '+23276987657',
        password: await hashPassword('user123'),
        is_verified: true,
        created_by: 'system',
        modified_by: 'system'
      })
      .returning();

    // Assign roles to users
    const assignRole = async (userId: string, roleId: string, tenantId: string) => {
      await db.insert(schema.user_roles)
        .values({
          user_role_id: 'tpe' + nanoid(),
          role_id: roleId,
          user_id: userId,
          tenant_id: tenantId,
          created_by: 'system',
          modified_by: 'system'
        });
    };

    // Assign roles for tenant 1 users
    await assignRole(tenant1AdminUser.user_id, tenantRoles.adminRole.role_id || "", tenant1.tenant_id);
    await assignRole(tenant1RegularUser.user_id, tenantRoles.authenticatedRole.role_id || "", tenant1.tenant_id);

    // Assign roles for tenant 2 users
    await assignRole(tenant2AdminUser.user_id, tenantRoles.adminRole.role_id || "", tenant2.tenant_id);
    await assignRole(tenant2RegularUser.user_id, tenantRoles.authenticatedRole.role_id || "", tenant2.tenant_id);

    // Update tenants with admin user ids
    await db.update(schema.tenants)
      .set({ tenant_user_id: tenant1AdminUser.user_id })
      .where(eq(schema.tenants.tenant_id, tenant1.tenant_id));

    await db.update(schema.tenants)
      .set({ tenant_user_id: tenant2AdminUser.user_id })
      .where(eq(schema.tenants.tenant_id, tenant2.tenant_id));

    // Create user_auth record for tenant1AdminUser
    await db.insert(schema.user_auths)
      .values({
        user_auth_id: 'tpe' + nanoid(),
        user_id: tenant1AdminUser.user_id,
        tenant_id: tenant1.tenant_id,
        created_by: 'system',
        modified_by: 'system'
      });

    // Create user_auth record for tenant1RegularUser
    await db.insert(schema.user_auths)
      .values({
        user_auth_id: 'tpe' + nanoid(),
        user_id: tenant1RegularUser.user_id,
        tenant_id: tenant1.tenant_id,
        created_by: 'system',
        modified_by: 'system'
      });

    // Create user_auth record for tenant2AdminUser
    await db.insert(schema.user_auths)
      .values({
        user_auth_id: 'tpe' + nanoid(),
        user_id: tenant2AdminUser.user_id,
        tenant_id: tenant2.tenant_id,
        created_by: 'system',
        modified_by: 'system'
      });

    // Create user_auth record for tenant2RegularUser
    await db.insert(schema.user_auths)
      .values({
        user_auth_id: 'tpe' + nanoid(),
        user_id: tenant2RegularUser.user_id,
        tenant_id: tenant2.tenant_id,
        created_by: 'system',
        modified_by: 'system'
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
