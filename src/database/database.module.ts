import { Module, Global } from '@nestjs/common';
import { db } from './client';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useValue: db,
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule {}
