import { LoggerService } from '@nestjs/common';
import winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from "dotenv";

dotenv.config();

export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');

    // Ensure logs directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Base transports for all environments
    const transports: winston.transport[] = [
      new winston.transports.DailyRotateFile({
        filename: path.join(logDir, 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      }) as any,
      new winston.transports.DailyRotateFile({
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      }) as any,
    ];

    // Add console transport only in development
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: winston?.format?.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        })
      );
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston?.format?.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports,
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
