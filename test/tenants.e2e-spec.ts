import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import * as request from 'supertest';
import { createTestApp } from '../src/utils/test-factory';
import { db, pool } from '../src/database/client';
import { tenants, users, roles, userRoles, tenantLocations } from '../src/database/schema';
import jwt from 'jsonwebtoken';
import { oauthConfig } from '../src/config/oauth.config';
import { hashPassword, StatusCode } from '../src/utils/auth';
import { eq } from 'drizzle-orm';

enum RoleName {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

describe('TenantsController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let adminUser: any;

  beforeAll(async () => {
    app = await createTestApp();
    
    // Setup admin user and token
    const [adminRole] = await db.insert(roles)
      .values({ name: 'admin' })
      .returning();

    [adminUser] = await db.insert(users)
      .values({
        username: 'admin',
        email: 'admin@test.com',
        password: await hashPassword('admin123'),
        isVerified: true
      })
      .returning();

    await db.insert(userRoles)
      .values({ userId: adminUser.userId, roleId: adminRole.roleId });

    adminToken = jwt.sign(
      { userId: adminUser.userId, roles: ['admin'] },
      oauthConfig.jwt.secret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await db.delete(tenants);
    await db.delete(userRoles);
    await db.delete(users);
    await db.delete(roles);
    await pool.end();
    await app.close();
  });

  describe('POST /api/tenants', () => {
    it('should create a new tenant with full details', async () => {
      const tenantData = {
        name: 'Full Details Tenant',
        legalName: 'Full Details LLC',
        description: 'A complete tenant setup',
        registrationNumber: 'REG123',
        industry: 'Technology',
        contact: {
          email: 'contact@fulldetails.com',
          phone: '+1234567890',
          website: 'www.fulldetails.com'
        },
        settings: {
          logo: 'logo.png',
          primaryColor: '#FF0000',
          secondaryColor: '#00FF00',
          timezone: 'UTC',
          locale: 'en-US',
          currency: 'USD'
        }
      };

      const response = await request(app.getHttpServer())
        .post('/api/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tenantData)
        .expect(StatusCode.CREATED);

      expect(response.body.tenant).toMatchObject({
        name: tenantData.name,
        legalName: tenantData.legalName,
        industry: tenantData.industry
      });
      expect(response.body.tenant.contact.email).toBe(tenantData.contact.email);
    });

    it('should reject duplicate tenant names', async () => {
      const tenantData = { name: 'Duplicate Name' };
      await db.insert(tenants).values(tenantData);

      await request(app.getHttpServer())
        .post('/api/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tenantData)
        .expect(StatusCode.CONFLICT);
    });

    it('should require manager role or higher', async () => {
      const userToken = jwt.sign(
        { userId: adminUser.userId, roles: [RoleName.USER] },
        oauthConfig.jwt.secret
      );

      await request(app.getHttpServer())
        .post('/api/tenants')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test Tenant' })
        .expect(StatusCode.FORBIDDEN);
    });
  });

  describe('Tenant Settings Management', () => {
    it('should get tenant settings with defaults', async () => {
      const [tenant] = await db.insert(tenants)
        .values({ name: 'Settings Test' })
        .returning();

      const response = await request(app.getHttpServer())
        .get(`/api/tenants/${tenant.tenantId}/settings`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      expect(response.body).toMatchObject({
        timezone: 'UTC',
        locale: 'en',
        currency: 'USD'
      });
    });

    it('should validate settings data', async () => {
      const [tenant] = await db.insert(tenants)
        .values({ name: 'Settings Validation' })
        .returning();

      const invalidSettings = {
        primaryColor: 'not-a-color',
        timezone: 'invalid-timezone'
      };

      await request(app.getHttpServer())
        .put(`/api/tenants/${tenant.tenantId}/settings`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSettings)
        .expect(StatusCode.BAD_REQUEST);
    });
  });

  describe('Tenant Location Management', () => {
    it('should get all tenant locations', async () => {
      const [tenant] = await db.insert(tenants)
        .values({ name: 'Locations Test' })
        .returning();

      await db.insert(tenantLocations).values([
        {
          tenantId: tenant.tenantId,
          name: 'Location 1',
          addressLine1: 'Street 1',
          city: 'City 1',
          country: 'Country 1'
        },
        {
          tenantId: tenant.tenantId,
          name: 'Location 2',
          addressLine1: 'Street 2',
          city: 'City 2',
          country: 'Country 2'
        }
      ]);

      const response = await request(app.getHttpServer())
        .get(`/api/tenants/${tenant.tenantId}/locations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      expect(response.body).toHaveLength(2);
    });

    it('should delete tenant location', async () => {
      const [tenant] = await db.insert(tenants)
        .values({ name: 'Delete Location Test' })
        .returning();

      const [location] = await db.insert(tenantLocations)
        .values({
          tenantId: tenant.tenantId,
          name: 'To Delete',
          addressLine1: 'Delete Street',
          city: 'Delete City',
          country: 'Delete Country'
        })
        .returning();

      await request(app.getHttpServer())
        .delete(`/api/tenants/${tenant.tenantId}/locations/${location.locationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      const deletedLocation = await db.query.tenantLocations.findFirst({
        where: eq(tenantLocations.locationId, location.locationId)
      });

      expect(deletedLocation).toBeUndefined();
    });
  });

  describe('GET /api/tenants', () => {
    beforeEach(async () => {
      await db.delete(tenants);
      await db.insert(tenants).values([
        { name: 'Tenant 1' },
        { name: 'Tenant 2' },
        { name: 'Tenant 3' }
      ]);
    });

    it('should paginate results', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tenants')
        .query({ page: 1, limit: 2 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      expect(response.body.data.length).toBe(2);
      expect(response.body.metadata.totalPages).toBe(2);
    });

    it('should filter deleted tenants', async () => {
      const [tenant] = await db.insert(tenants)
        .values({ name: 'Deleted Tenant', isDeleted: true })
        .returning();

      const response = await request(app.getHttpServer())
        .get('/api/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      expect(response.body.data.find(t => t.tenantId === tenant.tenantId)).toBeUndefined();
    });
  });

  describe('PUT /api/tenants/:tenantId/locations/:locationId', () => {
    it('should update tenant location', async () => {
      const [tenant] = await db.insert(tenants)
        .values({ name: 'Test Tenant' })
        .returning();

      const [location] = await db.insert(tenantLocations)
        .values({
          tenantId: tenant.tenantId,
          name: 'Old Office',
          addressLine1: 'Old Street',
          city: 'Old City',
          country: 'USA'
        })
        .returning();

      const updateData = {
        name: 'New Office',
        addressLine1: 'New Street',
        city: 'New City',
        country: 'USA'
      };

      await request(app.getHttpServer())
        .put(`/api/tenants/${tenant.tenantId}/locations/${location.locationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(StatusCode.ACCEPTED);
    });

    it('should validate location data', async () => {
      const [tenant] = await db.insert(tenants)
        .values({ name: 'Test Tenant' })
        .returning();

      const [location] = await db.insert(tenantLocations)
        .values({
          tenantId: tenant.tenantId,
          addressLine1: 'Street',
          city: 'City',
          country: 'USA'
        })
        .returning();

      const invalidData = {
        addressLine1: '',
        city: '',
        country: ''
      };

      await request(app.getHttpServer())
        .put(`/api/tenants/${tenant.tenantId}/locations/${location.locationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(StatusCode.BAD_REQUEST);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent tenant', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(app.getHttpServer())
        .get(`/api/tenants/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.NOT_FOUND);
    });

    it('should validate UUID format', async () => {
      await request(app.getHttpServer())
        .get('/api/tenants/invalid-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.BAD_REQUEST);
    });

    it('should handle concurrent tenant updates', async () => {
      const [tenant] = await db.insert(tenants)
        .values({ name: 'Concurrent Test' })
        .returning();

      await Promise.all([
        request(app.getHttpServer())
          .put(`/api/tenants/${tenant.tenantId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Updated 1' }),
        request(app.getHttpServer())
          .put(`/api/tenants/${tenant.tenantId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Updated 2' })
      ]);

      const updatedTenant = await db.query.tenants.findFirst({
        where: eq(tenants.tenantId, tenant.tenantId)
      });

      expect(['Updated 1', 'Updated 2']).toContain(updatedTenant?.name);
    });
  });
});
