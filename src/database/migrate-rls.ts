import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

// Load environment variables
dotenv.config();

// Setup the PostgreSQL pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// SQL for RLS setup
const setupRls = sql`
  -- Create RLS function in the public schema
  CREATE OR REPLACE FUNCTION public.get_tenant_id()
  RETURNS VARCHAR AS $$ 
  BEGIN
    -- Force strict setting check for tenant_id
    RETURN current_setting('app.current_tenant_id', true);
  END;
  $$ LANGUAGE plpgsql;

  -- Grant execute permission
  GRANT EXECUTE ON FUNCTION public.get_tenant_id() TO PUBLIC;

  -- Enable RLS on all tables with a tenant_id column
  DO $$ 
  DECLARE
    tbl_name text;
  BEGIN
    FOR tbl_name IN 
      SELECT t.tablename 
      FROM pg_tables t
      WHERE t.schemaname = 'public' 
      AND EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema = 'public' 
        AND c.table_name = t.tablename 
        AND c.column_name = 'tenant_id'
      )
    LOOP
      -- Enable RLS (without forcing it)
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
      
      -- Drop existing policy if any
      EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON public.%I', tbl_name);

      -- Create a strict policy that excludes NULL tenant_ids
      EXECUTE format('
        CREATE POLICY tenant_isolation_policy ON public.%I
        FOR ALL
        USING (
          tenant_id IS NOT NULL AND 
          tenant_id = public.get_tenant_id()
        )
      ', tbl_name);
    END LOOP;
  END $$;

  -- Initialize tenant context handling
  SET app.current_tenant_id = '';
`;

// Function to apply RLS setup
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

// Run the RLS setup
applyRLS();
