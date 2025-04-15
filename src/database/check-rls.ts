import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Setup PostgreSQL pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// Function to check if RLS is enabled on tables
async function checkRLS() {
  const client = await pool.connect();
  
  try {
    // Check if RLS is enabled and enforced on all tables
    const rlsStatusQuery = `
      SELECT
        t.schemaname,
        t.tablename,
        c.relrowsecurity AS rls_enabled,
        c.relforcerowsecurity AS rls_forced
      FROM
        pg_tables t
      JOIN
        pg_class c ON c.relname = t.tablename
      WHERE
        t.schemaname = 'public';  -- Change this to your schema if needed
    `;
    
    const rlsStatusResult = await client.query(rlsStatusQuery);
    
    console.log('Checking RLS status on tables:');
    rlsStatusResult.rows.forEach(row => {
      console.log(`Table: ${row.schemaname}.${row.tablename}`);
      console.log(`  RLS Enabled: ${row.rls_enabled}`);
      console.log(`  RLS Forced: ${row.rls_forced}`);
      console.log('--------------------------------');
    });

    // Check policies applied to tables with tenant_id column
    const policiesQuery = `
      SELECT
        schemaname,
        tablename,
        policyname,
        cmd,
        qual,
        with_check
      FROM
        pg_policies
      WHERE
        tablename IN (
          SELECT t.tablename
          FROM pg_tables t
          JOIN pg_class c ON c.relname = t.tablename
          WHERE t.schemaname = 'public' 
            AND EXISTS (
              SELECT 1 FROM information_schema.columns c
              WHERE c.table_schema = 'public' 
              AND c.table_name = t.tablename 
              AND c.column_name = 'tenant_id'
            )
        );
    `;
    
    const policiesResult = await client.query(policiesQuery);
    
    console.log('Checking policies applied to tables with tenant_id:');
    if (policiesResult.rows.length === 0) {
      console.log('No policies found for tables with tenant_id.');
    } else {
      policiesResult.rows.forEach(row => {
        console.log(`Table: ${row.schemaname}.${row.tablename}`);
        console.log(`  Policy: ${row.policyname}`);
        console.log(`  Command: ${row.cmd}`);
        console.log(`  Qualifier (Condition): ${row.qual}`);
        console.log(`  With Check: ${row.with_check}`);
        console.log('--------------------------------');
      });
    }
    
  } catch (error) {
    console.error('Error while checking RLS:', error);
  } finally {
    client.release();
  }
}

// Run the RLS check
checkRLS()
  .then(() => {
    console.log('RLS check completed.');
    pool.end();
  })
  .catch((error) => {
    console.error('Error during RLS check:', error);
    pool.end();
  });
