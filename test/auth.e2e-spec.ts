import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import * as request from 'supertest';
import { createTestApp } from '../src/utils/test-factory';
import { db, pool } from '../src/database/client';
import { users, userAuth, roles, userRoles } from '../src/database/schema';
import { hashPassword, StatusCode } from '../src/utils/auth';
import jwt from 'jsonwebtoken';
import { oauthConfig } from '../src/config/oauth.config';
import { eq } from 'drizzle-orm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();

    // Clear existing data
    await db.delete(userRoles);
    await db.delete(users);
    await db.delete(roles);

    // Create roles
    await db.insert(roles).values([
      { name: 'admin' },
      { name: 'user' }
    ]);
  });

  afterAll(async () => {
    await db.delete(userRoles);
    await db.delete(users);
    await db.delete(roles);
    await pool.end();
    await app.close();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        profile: {
          fullName: 'New User',
          firstName: 'New',
          lastName: 'User',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);

      // Verify OTP creation
      const userAuthRecord = await db.query.userAuth.findFirst({
        where: eq(userAuth.userId, response.body.user.userId),
      });
      expect(userAuthRecord?.otp).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const userData = {
        username: 'duplicate',
        email: 'user@example.com', // Already exists
        password: 'password123',
        profile: {
          fullName: 'Duplicate User',
          firstName: 'Duplicate',
          lastName: 'User',
        },
      };

      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(userData)
        .expect(StatusCode.CONFLICT);
    });

    it('should reject invalid email format', async () => {
      const userData = {
        username: 'invalid',
        email: 'not-an-email',
        password: 'password123',
        profile: {
          fullName: 'Invalid User',
          firstName: 'Invalid',
          lastName: 'User',
        },
      };

      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(userData)
        .expect(StatusCode.BAD_REQUEST);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should handle non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send({
          email: 'nonexistent@example.com',
          otp: '123456',
        })
        .expect(StatusCode.NOT_FOUND);
    });
  });

  describe('POST /api/auth/signin', () => {
    it('should handle non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(StatusCode.NOT_FOUND);
    });

    it('should reject unverified users', async () => {
      const [user] = await db.insert(users).values({
        username: 'unverified',
        email: 'unverified@example.com',
        password: await hashPassword('password123'),
        isVerified: false,
      }).returning();

      await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: 'unverified@example.com',
          password: 'password123',
        })
        .expect(StatusCode.FORBIDDEN);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset OTP', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'user@example.com' })
        .expect(StatusCode.OK)
        .expect(res => {
          expect(res.body.message).toBe('Password reset instructions sent');
        });
    });

    it('should handle non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(StatusCode.NOT_FOUND);
    });
  });

  // describe('OAuth Authentication', () => {
  //   it('should redirect to Google OAuth', () => {
  //     return request(app.getHttpServer())
  //       .get('/api/auth/google')
  //       .expect(StatusCode.FOUND)
  //       .expect('Location', /accounts\.google\.com/);
  //   });

  //   it('should handle Google OAuth callback', async () => {
  //     const mockUser = {
  //       userId: '123',
  //       email: 'google@example.com',
  //       isVerified: true
  //     };

  //     // Mock passport authenticate
  //     jest.spyOn(require('passport'), 'authenticate')
  //       .mockImplementation(() => (req, res, next) => {
  //         req.user = mockUser;
  //         next();
  //       });

  //     const response = await request(app.getHttpServer())
  //       .get('/api/auth/google/callback')
  //       .expect(StatusCode.OK);

  //     expect(response.body).toHaveProperty('token');
  //     expect(response.body.user.email).toBe(mockUser.email);
  //   });
  // });

  describe('Password Reset Flow', () => {
    it('should verify reset password token', async () => {
      const [user] = await db.insert(users).values({
        username: 'resetuser',
        email: 'reset@example.com',
        password: await hashPassword('oldpass123'),
        isVerified: true
      }).returning();

      const otp = '123456';
      await db.insert(userAuth).values({
        userId: user.userId,
        otp,
        otpExpiry: new Date(Date.now() + 3600000)
      });

      await request(app.getHttpServer())
        .post('/api/auth/verify-reset-token')
        .send({
          email: 'reset@example.com',
          otp
        })
        .expect(StatusCode.OK);
    });

    it('should complete password reset', async () => {
      const [user] = await db.insert(users).values({
        username: 'resetuser2',
        email: 'reset2@example.com',
        password: await hashPassword('oldpass123'),
        isVerified: true
      }).returning();

      const otp = '123456';
      await db.insert(userAuth).values({
        userId: user.userId,
        otp,
        otpExpiry: new Date(Date.now() + 3600000)
      });

      await request(app.getHttpServer())
        .patch('/api/auth/reset-password')
        .send({
          email: 'reset2@example.com',
          otp,
          newPassword: 'newpass123'
        })
        .expect(StatusCode.ACCEPTED);
    });
  });

  describe('Session Management', () => {
    it('should refresh token', async () => {
      const [user] = await db.insert(users).values({
        username: 'refreshuser',
        email: 'refresh@example.com',
        password: await hashPassword('pass123'),
        isVerified: true
      }).returning();

      const token = jwt.sign(
        { userId: user.userId, roles: ['user'] },
        oauthConfig.jwt.secret,
        { expiresIn: '1h' }
      );

      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .expect(StatusCode.OK);

      expect(response.body).toHaveProperty('token');
      expect(response.body.token).not.toBe(token);
    });

    it('should handle logout', async () => {
      const [user] = await db.insert(users).values({
        username: 'logoutuser',
        email: 'logout@example.com',
        password: await hashPassword('pass123'),
        isVerified: true
      }).returning();

      const token = jwt.sign(
        { userId: user.userId, roles: ['user'] },
        oauthConfig.jwt.secret,
        { expiresIn: '1h' }
      );

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(StatusCode.OK);

      // Verify token is invalidated
      await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(StatusCode.UNAUTHORIZED);
    });
  });
});
