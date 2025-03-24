import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLogger } from '../config/logger.config';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = new Date();
    const { method, originalUrl, ip, query, body } = req;

    res.on('finish', () => {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const logData = {
        timestamp: startTime,
        method,
        url: originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.headers['user-agent'],
        ip,
        query,
        body: method !== 'GET' ? this.sanitizeBody(body) : undefined,
      };

      if (res.statusCode >= 500) {
        this.logger.error('Server Error', JSON.stringify(logData));
      } else if (res.statusCode >= 400) {
        this.logger.warn('Client Error', JSON.stringify(logData));
      } else {
        this.logger.log('Request processed', JSON.stringify(logData));
      }
    });

    next();
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    const sensitiveFields = ['password', 'token', 'authorization', 'credit_card'];
    const sanitized = { ...body };
    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });
    return sanitized;
  }
}
