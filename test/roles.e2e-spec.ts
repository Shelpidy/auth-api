import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import * as request from 'supertest';
import { createTestApp } from '../src/utils/test-factory';
import { db, pool } from '../src/database/client';
import { roles, users, userRoles } from '../src/database/schema';
import jwt from 'jsonwebtoken';
import { oauthConfig } from '../src/config/oauth.config';
import { hashPassword } from '../src/utils/auth';
import { StatusCode } from '../src/utils/auth';
import { eq } from 'drizzle-orm';

enum RoleName {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

describe('RolesController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let adminUser: any;

  beforeAll(async () => {
    app = await createTestApp();
    
    // Setup initial roles from enum
    await db.insert(roles).values(
      Object.values(RoleName).map(name => ({ name }))
    );

    // Get super admin role for main test user
    const [superAdminRole] = await db.query.roles.findMany({
      where: eq(roles.name, RoleName.SUPER_ADMIN)
    });

    [adminUser] = await db.insert(users)
      .values({
        username: 'admin',
        email: 'admin@test.com',
        password: await hashPassword('admin123'),
        isVerified: true
      })
      .returning();

    await db.insert(userRoles)
      .values({ userId: adminUser.userId, roleId: superAdminRole.roleId });

    adminToken = jwt.sign(
      { userId: adminUser.userId, roles: [RoleName.SUPER_ADMIN] },
      oauthConfig.jwt.secret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await db.delete(userRoles);
    await db.delete(roles);
    await db.delete(users);
    await pool.end();
    await app.close();
  });

  describe('POST /api/roles', () => {
    it('should create a new custom role', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'custom-role' })
        .expect(StatusCode.CREATED);

      expect(response.body).toHaveProperty('role');
      expect(response.body.role.name).toBe('custom-role');
    });

    it('should prevent creating duplicate system roles', async () => {
      for (const roleName of Object.values(RoleName)) {
        await request(app.getHttpServer())
          .post('/api/roles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: roleName })
          .expect(StatusCode.CONFLICT);
      }
    });

    it('should validate role name', async () => {
      await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '' })
        .expect(StatusCode.BAD_REQUEST);
    });
  });

  describe('GET /api/roles', () => {
    it('should return all system roles', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(Object.keys(RoleName).length);
      expect(response.body.map(r => r.name)).toEqual(
        expect.arrayContaining(Object.values(RoleName))
      );
    });

    it('should reject invalid role names', async () => {
      await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'invalid-role' })
        .expect(StatusCode.BAD_REQUEST);
    });
  });

  describe('GET /api/roles/:roleId', () => {
    it('should return role by id', async () => {
      const [role] = await db.insert(roles)
        .values({ name: 'test-role' })
        .returning();

      const response = await request(app.getHttpServer())
        .get(`/api/roles/${role.roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      expect(response.body.name).toBe('test-role');
    });

    it('should return 404 for non-existent role', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      await request(app.getHttpServer())
        .get(`/api/roles/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.NOT_FOUND);
    });
  });

  describe('PATCH /api/roles/:roleId', () => {
    it('should update role name', async () => {
      const [role] = await db.insert(roles)
        .values({ name: 'old-name' })
        .returning();

      const response = await request(app.getHttpServer())
        .patch(`/api/roles/${role.roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'new-name' })
        .expect(StatusCode.ACCEPTED);

      expect(response.body.name).toBe('new-name');
    });

    it('should prevent updating system roles', async () => {
      for (const roleName of Object.values(RoleName)) {
        const [role] = await db.query.roles.findMany({
          where: eq(roles.name, roleName)
        });

        await request(app.getHttpServer())
          .patch(`/api/roles/${role.roleId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: `new-${roleName}` })
          .expect(StatusCode.FORBIDDEN);
      }
    });

    it('should allow updating custom roles', async () => {
      const [role] = await db.insert(roles)
        .values({ name: 'custom-role' })
        .returning();

      const response = await request(app.getHttpServer())
        .patch(`/api/roles/${role.roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'updated-custom-role' })
        .expect(StatusCode.ACCEPTED);

      expect(response.body.name).toBe('updated-custom-role');
    });

    it('should prevent updating to invalid role name', async () => {
      const [role] = await db.query.roles.findMany({
        where: eq(roles.name, RoleName.MANAGER)
      });

      await request(app.getHttpServer())
        .patch(`/api/roles/${role.roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'invalid-role' })
        .expect(StatusCode.BAD_REQUEST);
    });
  });

  describe('DELETE /api/roles/:roleId', () => {
    it('should delete role', async () => {
      const [role] = await db.insert(roles)
        .values({ name: 'to-delete' })
        .returning();

      await request(app.getHttpServer())
        .delete(`/api/roles/${role.roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);

      const deletedRole = await db.query.roles.findFirst({
        where: eq(roles.roleId, role.roleId)
      });
      expect(deletedRole).toBeUndefined();
    });

    it('should prevent deleting system roles', async () => {
      for (const roleName of Object.values(RoleName)) {
        const [role] = await db.query.roles.findMany({
          where: eq(roles.name, roleName)
        });

        await request(app.getHttpServer())
          .delete(`/api/roles/${role.roleId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(StatusCode.FORBIDDEN);
      }
    });

    it('should allow deleting custom roles', async () => {
      const [role] = await db.insert(roles)
        .values({ name: 'deletable-role' })
        .returning();

      await request(app.getHttpServer())
        .delete(`/api/roles/${role.roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.OK);
    });

    it('should return 404 for non-existent role', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      await request(app.getHttpServer())
        .delete(`/api/roles/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.NOT_FOUND);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/api/roles/invalid-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(StatusCode.BAD_REQUEST);
    });

    it('should require admin token', async () => {
      const userToken = jwt.sign(
        { userId: adminUser.userId, roles: ['user'] },
        oauthConfig.jwt.secret
      );

      await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(StatusCode.FORBIDDEN);
    });
  });

  describe('Role Authorization', () => {
    it('should allow super-admin access to all endpoints', async () => {
      // Super admin has access (already tested in other cases)
    });

    it('should restrict admin access appropriately', async () => {
      const adminOnlyToken = jwt.sign(
        { userId: adminUser.userId, roles: [RoleName.ADMIN] },
        oauthConfig.jwt.secret
      );

      await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminOnlyToken}`)
        .send({ name: 'test-role' })
        .expect(StatusCode.FORBIDDEN);
    });

    it('should restrict manager access', async () => {
      const managerToken = jwt.sign(
        { userId: adminUser.userId, roles: [RoleName.MANAGER] },
        oauthConfig.jwt.secret
      );

      await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(StatusCode.FORBIDDEN);
    });

    it('should restrict user access', async () => {
      const userToken = jwt.sign(
        { userId: adminUser.userId, roles: [RoleName.USER] },
        oauthConfig.jwt.secret
      );

      await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(StatusCode.FORBIDDEN);
    });
  });

  describe('Role Hierarchy Tests', () => {
    it('should respect role hierarchy permissions', async () => {
      // Test access for each role level
      const roleHierarchy = [
        RoleName.USER,
        RoleName.MANAGER,
        RoleName.ADMIN,
        RoleName.SUPER_ADMIN
      ];

      for (let i = 0; i < roleHierarchy.length; i++) {
        const currentRole = roleHierarchy[i];
        const token = jwt.sign(
          { userId: adminUser.userId, roles: [currentRole] },
          oauthConfig.jwt.secret
        );

        const response = await request(app.getHttpServer())
          .get('/api/roles')
          .set('Authorization', `Bearer ${token}`);

        if (currentRole === RoleName.SUPER_ADMIN) {
          expect(response.status).toBe(StatusCode.OK);
        } else {
          expect(response.status).toBe(StatusCode.FORBIDDEN);
        }
      }
    });

    it('should validate role assignment hierarchy', async () => {
      // Only SUPER_ADMIN can assign ADMIN roles
      const adminRoleId = (await db.query.roles.findFirst({
        where: eq(roles.name, RoleName.ADMIN)
      }))?.roleId;

      const adminToken = jwt.sign(
        { userId: adminUser.userId, roles: [RoleName.ADMIN] },
        oauthConfig.jwt.secret
      );

      await request(app.getHttpServer())
        .post(`/api/users/${adminUser.userId}/roles`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ roleId: adminRoleId })
        .expect(StatusCode.FORBIDDEN);
    });
  });
});
