import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  user:  process.env.POSTGRES_USER,
  password:  process.env.POSTGRES_PASSWORD,
  database:  process.env.POSTGRES_DB,
  host:process.env.POSTGRES_HOST,
  port: Number( process.env.POSTGRES_PORT,
  ),
});

export const db = drizzle(pool, { schema });
