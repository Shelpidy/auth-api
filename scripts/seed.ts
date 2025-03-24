// import { drizzle } from 'drizzle-orm/node-postgres';
// import { Pool } from 'pg';
import * as schema from '../src/database/schema';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { db } from "../src/database/client";

dotenv.config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// const db = drizzle(pool, { schema });

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  try {
    // Create default tenant
    const tenant_nano_id = nanoid();
    const [tenant] = await db.insert(schema.tenants)
      .values({
        tenant_nano_id,
        account_type: 'school',
        short_name: 'Demo School',
        long_name: 'Demo International School',
        legal_name: 'Demo International School Ltd',
        education_category: 'K-12',
        education_lowest_grade_level: 'Grade 1',
        education_highest_grade_level: 'Grade 12',
        account_owner_name: 'John Doe',
        account_owner_email: 'admin@example.com',
        account_owner_phone: '+1234567890',
        subscription_name: 'basic',
        created_by: 'system',
      })
      .returning();

    // Create tenant contact
    await db.insert(schema.tenant_contacts)
      .values({
        tenant_contact_nano_id: nanoid(),
        tenant_nano_id: tenant.tenant_nano_id,
        tenant_email: 'info@demo.com',
        created_by: 'system',
      });

    // Create tenant settings
    await db.insert(schema.tenant_settings)
      .values({
        tenant_setting_nano_id: nanoid(),
        tenant_nano_id: tenant.tenant_nano_id,
        created_by: 'system',
      });

    // Create roles
    const adminRoleNanoId = nanoid();
    const userRoleNanoId = nanoid();
    
    await db.insert(schema.roles)
      .values([
        { role_nano_id: adminRoleNanoId, name: 'admin' },
        { role_nano_id: userRoleNanoId, name: 'user' },
      ]);

    // Create admin user
    const adminNanoId = nanoid();
    const [admin] = await db.insert(schema.users)
      .values({
        user_nano_id: adminNanoId,
        tenant_nano_id: tenant.tenant_nano_id,
        username: 'admin',
        email: 'admin@example.com',
        password: await hashPassword('admin123'),
        is_verified: true,
        created_by: 'system',
      })
      .returning();

    // Create admin profile
    await db.insert(schema.user_profiles)
      .values({
        user_profile_nano_id: nanoid(),
        user_nano_id: admin.user_nano_id,
        full_name: 'Admin User',
        first_name: 'Admin',
        last_name: 'User',
        created_by: 'system',
      });

    // Create admin auth
    await db.insert(schema.user_auths)
      .values({
        user_auth_nano_id: nanoid(),
        user_nano_id: admin.user_nano_id,
        created_by: 'system',
      });

    // Assign admin role
    await db.insert(schema.user_roles)
      .values({
        user_nano_id: admin.user_nano_id,
        role_nano_id: adminRoleNanoId,
      });

    // Create regular user
    const userNanoId = nanoid();
    const [user] = await db.insert(schema.users)
      .values({
        user_nano_id: userNanoId,
        tenant_nano_id: tenant.tenant_nano_id,
        username: 'user',
        email: 'user@example.com',
        password: await hashPassword('user123'),
        is_verified: true,
        created_by: 'system',
      })
      .returning();

    // Create user profile
    await db.insert(schema.user_profiles)
      .values({
        user_profile_nano_id: nanoid(),
        user_nano_id: user.user_nano_id,
        full_name: 'Regular User',
        first_name: 'Regular',
        last_name: 'User',
        created_by: 'system',
      });

    // Create user auth
    await db.insert(schema.user_auths)
      .values({
        user_auth_nano_id: nanoid(),
        user_nano_id: user.user_nano_id,
        created_by: 'system',
      });

    // Assign user role
    await db.insert(schema.user_roles)
      .values({
        user_nano_id: user.user_nano_id,
        role_nano_id: userRoleNanoId,
      });

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
