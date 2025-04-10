import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// Single SQL statement for RLS setup
const setupRls = sql`
  -- Create RLS function in public schema
  CREATE OR REPLACE FUNCTION public.get_tenant_id()
  RETURNS VARCHAR AS $$
  BEGIN
    RETURN NULLIF(current_setting('app.tenant_id', TRUE), '');
  END;
  $$ LANGUAGE plpgsql;

  -- Enable RLS on tables
  ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies
  DROP POLICY IF EXISTS tenant_isolation_policy ON public.users;
  DROP POLICY IF EXISTS tenant_isolation_policy ON public.roles;
  DROP POLICY IF EXISTS tenant_isolation_policy ON public.contacts;

  -- Create new policies
  CREATE POLICY tenant_isolation_policy ON public.users
    FOR ALL
    USING (tenant_id = public.get_tenant_id() OR public.get_tenant_id() IS NULL);

  CREATE POLICY tenant_isolation_policy ON public.roles
    FOR ALL
    USING (tenant_id = public.get_tenant_id() OR public.get_tenant_id() IS NULL);

  CREATE POLICY tenant_isolation_policy ON public.contacts
    FOR ALL
    USING (tenant_id = public.get_tenant_id() OR public.get_tenant_id() IS NULL);
`;

async function applyRLS() {
  const db = drizzle(pool);

  try {
    console.log('Applying RLS configuration...');
    await db.execute(setupRls);
    console.log('RLS configuration applied successfully');
  } catch (error) {
    console.error('Failed to apply RLS configuration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

applyRLS();
