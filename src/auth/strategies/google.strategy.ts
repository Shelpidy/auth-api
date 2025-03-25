import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { oauthConfig } from '../../config/oauth.config';
import { db } from '../../database/client';
import {
  users,
  user_profiles,
  user_auths,
  user_roles,
  roles,
} from '../../database/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: oauthConfig.google.clientID,
      clientSecret: oauthConfig.google.clientSecret,
      callbackURL: oauthConfig.google.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    try {
      let user = await db.query.users.findFirst({
        where: eq(users.email, profile.emails?.[0]?.value || ''),
        with: {
          user_roles: {
            with: {
              role: true,
            },
          },
          user_profile: true,
          user_auth: true,
        },
      });

      if (!user) {
        // Create new user with transaction
        user = await db.transaction(async (tx) => {
          // Create base user
          const [newUser] = await tx
            .insert(users)
            .values({
              user_nano_id: nanoid(),
              email: profile.emails?.[0]?.value || '',
              username:
                profile.username ||
                profile.displayName.toLowerCase().replace(/\s+/g, ''),
              password: '', // OAuth users don't need password
              photo: profile.photos?.[0]?.value,
              is_verified: true, // OAuth users are pre-verified
            })
            .returning();

          // Create user profile
          const [newUserProfile] = await tx
            .insert(user_profiles)
            .values({
              user_nano_id: newUser.user_nano_id,
              full_name: profile.displayName,
              first_name: profile.name?.givenName || '',
              last_name: profile.name?.familyName || '',
              middle_name: profile.name?.middleName,
            })
            .returning();

          // Initialize auth record
          await tx.insert(user_auths).values({
            user_auth_nano_id: nanoid(),
            user_nano_id: newUser.user_nano_id,
            otp: null,
            otp_expiry: null,
            last_login_at: new Date(),
          });

          // Assign default role
          const defaultRole = await tx.query.roles.findFirst({
            where: eq(roles.name, 'authenticated'),
          });

          let userRole: any = null;
          if (defaultRole) {
            [userRole] = await tx
              .insert(user_roles)
              .values({
                user_nano_id: newUser.user_nano_id,
                role_nano_id: defaultRole.role_nano_id,
              })
              .returning();
          }

          // Fetch the complete user data after creation
          let newuser = await db.query.users.findFirst({
            where: eq(users.user_nano_id, user?.user_nano_id || ''),
            with: {
              user_roles: {
                with: {
                  role: true,
                },
              },
              user_profile: true,
              user_auth: true,
            },
          });

          return newuser;
        });
      }

      // Clean up sensitive data and structure the response
      // @ts-ignore
      const { password: _, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        accessToken,
      };
    } catch (error) {
      console.error('OAuth Error:', error);
      throw error;
    }
  }
}
