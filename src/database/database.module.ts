import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { DatabaseService } from './db.service';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

dotenv.config();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
});

const db = drizzle(pool, { schema });

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useValue: db,
    },
    {
      provide: 'DATABASE_POOL',
      useValue: pool,
    },
    DatabaseService,
  ],
  exports: ['DATABASE_CONNECTION', 'DATABASE_POOL', DatabaseService],
})
export class DatabaseModule {}
