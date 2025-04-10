import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import { config } from "./src/config/config";
dotenv.config();

const isTest = process.env.NODE_ENV === "test";

export default {
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: undefined, // Remove this line to create tables in public first
  dbCredentials: {
    port: isTest
      ? (config.getEnv("POSTGRES_TEST_PORT", 5430) as number)
      : (config.getEnv("POSTGRES_PORT", 5432) as number),
    password: isTest
      ? (config.getEnv("POSTGRES_TEST_PASSWORD", "postgres") as string)
      : (config.getEnv("POSTGRES_PASSWORD", "") as string),
    host: isTest
      ? (config.getEnv("POSTGRES_TEST_HOST", "0.0.0.0") as string)
      : (config.getEnv("POSTGRES_HOST", "") as string),
    database: isTest
      ? (config.getEnv("POSTGRES_TEST_DB", "testdb") as string)
      : (config.getEnv("POSTGRES_DB", "") as string),
    user: isTest
      ? (config.getEnv("POSTGRES_TEST_USER", "postgres") as string)
      : (config.getEnv("POSTGRES_USER", "") as string),
    ssl: false,
  },
} satisfies Config;
