import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { StatusCode } from '../src/utils/auth';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should return welcome message', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(StatusCode.OK)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Hello World!');
        });
    });
  });

  describe('GET /docs', () => {
    it('should return API documentation', () => {
      return request(app.getHttpServer())
        .get('/docs')
        .expect(StatusCode.OK)
        .expect('Content-Type', /html/);
    });

    it('should handle documentation errors gracefully', () => {
      // Simulate README.md not found
      jest.spyOn(require('fs'), 'readFileSync').mockImplementationOnce(() => {
        throw new Error('File not found');
      });

      return request(app.getHttpServer())
        .get('/docs')
        .expect(StatusCode.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/non-existent')
        .expect(StatusCode.NOT_FOUND);
    });
  });
});
