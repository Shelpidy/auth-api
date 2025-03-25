import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

export const pool = new Pool({
  user: isTest ? process.env.POSTGRES_TEST_USER : process.env.POSTGRES_USER,
  password: isTest
    ? process.env.POSTGRES_TEST_PASSWORD
    : process.env.POSTGRES_PASSWORD,
  database: isTest ? process.env.POSTGRES_TEST_DB : process.env.POSTGRES_DB,
  host: isTest ? process.env.POSTGRES_TEST_HOST : process.env.POSTGRES_HOST,
  port: Number(
    isTest ? process.env.POSTGRES_TEST_PORT : process.env.POSTGRES_PORT,
  ),
});

export const db = drizzle(pool, { schema });
