import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  getEnv(key: string, fallback: string | number): string | number {
    try {
      return process.env[key] ?? (fallback as string);
    } catch (err) {
      return fallback as string;
    }
  },
};
