import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import * as request from 'supertest';
import { createTestApp } from '../src/utils/test-factory';
import { db, pool } from '../src/database/client';
import { users, userRoles, roles, userProfiles, userLocations } from '../src/database/schema';
import { hashPassword, StatusCode } from '../src/utils/auth';
import jwt from 'jsonwebtoken';
import { oauthConfig } from '../src/config/oauth.config';
import { and, eq } from 'drizzle-orm';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let regularUser: any;
  let adminUser: any;

  beforeAll(async () => {
    app = await createTestApp();

    // Setup test data and tokens
    const [adminRole, userRole] = await db.insert(roles)
      .values([
        { name: 'admin' },
        { name: 'user' }
      ])
      .returning();

    [adminUser] = await db.insert(users)
      .values({
        username: 'admin',
        email: 'admin@test.com',
        password: await hashPassword('admin123'),
        isVerified: true
      })
      .returning();

    [regularUser] = await db.insert(users)
      .values({
        username: 'user',
        email: 'user@test.com',
        password: await hashPassword('user123'),
        isVerified: true
      })
      .returning();

    await db.insert(userRoles).values([
      { userId: adminUser.userId, roleId: adminRole.roleId },
      { userId: regularUser.userId, roleId: userRole.roleId }
    ]);

    adminToken = jwt.sign(
      { userId: adminUser.userId, roles: ['admin'] },
      oauthConfig.jwt.secret
    );

    userToken = jwt.sign(
      { userId: regularUser.userId, roles: ['user'] },
      oauthConfig.jwt.secret
    );
  });

  afterAll(async () => {
    await db.delete(userRoles);
    await db.delete(users);
    await db.delete(roles);
    await pool.end();
    await app.close();
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      await db.insert(userProfiles).values([
        {
          userId: adminUser.userId,
          fullName: 'Admin User',
          firstName: 'Admin',
          lastName: 'User'
        },
        {
          userId: regularUser.userId,
          fullName: 'Regular User',
          firstName: 'Regular',
          lastName: 'User'
        }
      ]);
    });

    it('should return all users for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should paginate results', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      expect(response.body.data.length).toBe(1);
      expect(response.body.metadata.currentPage).toBe(1);
      expect(response.body.metadata.totalPages).toBeGreaterThanOrEqual(2);
    });

    it('should filter by search term', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users?search=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      expect(response.body.data[0].username).toContain('admin');
    });

    it('should return 403 for non-admin users', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(StatusCode.FORBIDDEN);
    });
  });

  describe('User Profile Management', () => {
    it('should update user profile', async () => {
      const updateData = {
        profile: {
          fullName: 'Updated Name',
          firstName: 'Updated',
          lastName: 'Name'
        }
      };

      await request(app.getHttpServer())
        .put(`/api/users/${regularUser.userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(StatusCode.ACCEPTED);

      const updatedProfile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, regularUser.userId)
      });

      expect(updatedProfile?.fullName).toBe(updateData.profile.fullName);
    });

    it('should get user profile', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${regularUser.userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(StatusCode.OK);

      expect(response.body.email).toBe(regularUser.email);
    });

    it('should prevent updating other user profiles', async () => {
      await request(app.getHttpServer())
        .put(`/api/users/${adminUser.userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          profile: {
            fullName: 'Hacker',
            firstName: 'Hack',
            lastName: 'Er'
          }
        })
        .expect(StatusCode.FORBIDDEN);
    });

    it('should validate profile data', async () => {
      await request(app.getHttpServer())
        .put(`/api/users/${regularUser.userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          profile: {
            fullName: '',
            firstName: '',
            lastName: ''
          }
        })
        .expect(StatusCode.BAD_REQUEST);
    });
  });

  describe('User Location Management', () => {
    it('should add user location', async () => {
      const locationData = {
        addressLine1: '123 Test St',
        city: 'Test City',
        country: 'Test Country'
      };

      const response = await request(app.getHttpServer())
        .post(`/api/users/${regularUser.userId}/locations`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(locationData)
        .expect(StatusCode.CREATED);

      expect(response.body.location).toMatchObject(locationData);
    });

    it('should get user locations', async () => {
      await db.insert(userLocations).values({
        userId: regularUser.userId,
        addressLine1: '123 Test St',
        city: 'Test City',
        country: 'Test Country'
      });

      const response = await request(app.getHttpServer())
        .get(`/api/users/${regularUser.userId}/locations`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(StatusCode.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('addressLine1');
    });

    it('should update location', async () => {
      const [location] = await db.insert(userLocations).values({
        userId: regularUser.userId,
        addressLine1: '123 Old St',
        city: 'Old City',
        country: 'Old Country'
      }).returning();

      const updateData = {
        addressLine1: '456 New St',
        city: 'New City',
        country: 'New Country'
      };

      await request(app.getHttpServer())
        .put(`/api/users/${regularUser.userId}/locations/${location.locationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(StatusCode.ACCEPTED);

      const updatedLocation = await db.query.userLocations.findFirst({
        where: eq(userLocations.locationId, location.locationId)
      });

      expect(updatedLocation?.addressLine1).toBe(updateData.addressLine1);
    });

    it('should delete location', async () => {
      const [location] = await db.insert(userLocations).values({
        userId: regularUser.userId,
        addressLine1: '123 Delete St',
        city: 'Delete City',
        country: 'Delete Country'
      }).returning();

      await request(app.getHttpServer())
        .delete(`/api/users/${regularUser.userId}/locations/${location.locationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(StatusCode.OK);

      const deletedLocation = await db.query.userLocations.findFirst({
        where: eq(userLocations.locationId, location.locationId)
      });

      expect(deletedLocation).toBeUndefined();
    });
  });

  describe('Role Management', () => {
    it('should assign role to user', async () => {
      const [role] = await db.insert(roles)
        .values({ name: 'manager' })
        .returning();

      await request(app.getHttpServer())
        .post(`/api/users/${regularUser.userId}/roles`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ roleId: role.roleId })
        .expect(StatusCode.CREATED);

      const userRole = await db.query.userRoles.findFirst({
        where: and(
          eq(userRoles.userId, regularUser.userId),
          eq(userRoles.roleId, role.roleId)
        )
      });

      expect(userRole).toBeDefined();
    });

    it('should remove role from user', async () => {
      const [role] = await db.insert(roles)
        .values({ name: 'temp-role' })
        .returning();

      await db.insert(userRoles)
        .values({ userId: regularUser.userId, roleId: role.roleId });

      await request(app.getHttpServer())
        .delete(`/api/users/${regularUser.userId}/roles/${role.roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      const userRole = await db.query.userRoles.findFirst({
        where: and(
          eq(userRoles.userId, regularUser.userId),
          eq(userRoles.roleId, role.roleId)
        )
      });

      expect(userRole).toBeUndefined();
    });

    it('should prevent removing required roles', async () => {
      const [userRole] = await db.query.roles.findMany({
        where: eq(roles.name, 'user')
      });

      await request(app.getHttpServer())
        .delete(`/api/users/${regularUser.userId}/roles/${userRole.roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.FORBIDDEN);
    });

    it('should get user roles', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${regularUser.userId}/roles`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('name');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/api/users/invalid-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.BAD_REQUEST);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      await request(app.getHttpServer())
        .get(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.NOT_FOUND);
    });

    it('should handle concurrent profile updates', async () => {
      const updateData = {
        profile: {
          fullName: 'Concurrent Update',
          firstName: 'Concurrent',
          lastName: 'Update'
        }
      };

      await Promise.all([
        request(app.getHttpServer())
          .put(`/api/users/${regularUser.userId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData),
        request(app.getHttpServer())
          .put(`/api/users/${regularUser.userId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData)
      ]);

      const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, regularUser.userId)
      });

      expect(profile?.fullName).toBe(updateData.profile.fullName);
    });
  });
});
