// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-microsoft';
// import { oauthConfig } from '../../config/oauth.config';
// import { db } from '../../database/client';
// import { users, userProfiles, userAuth, userRoles, roles } from '../../database/schema';
// import { eq } from 'drizzle-orm';

// @Injectable()
// export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
//   constructor() {
//     super({
//       clientID: oauthConfig.microsoft.clientID,
//       clientSecret: oauthConfig.microsoft.clientSecret,
//       callbackURL: oauthConfig.microsoft.callbackURL,
//       scope: ['user.read'],
//     });
//   }

//   async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
//     try {
//       let user = await db.query.users.findFirst({
//         where: eq(users.email, profile.emails?.[0]?.value || ""),
//         with: {
//           userRoles: {
//             with: {
//               role: true,
//             },
//           },
//         },
//       });

//       if (!user) {
//         user = await db.transaction(async (tx) => {
//           const [newUser] = await tx
//             .insert(users)
//             .values({
//               email: profile.emails?.[0]?.value || "",
//               username: profile.username || 
//                 profile.displayName.toLowerCase().replace(/\s+/g, ""),
//               password: "", // OAuth users don't need password
//               photo: profile._json?.avatar_url,
//               isVerified: true, // OAuth users are pre-verified
//             })
//             .returning();

//           await Promise.all([
//             tx.insert(userProfiles).values({
//               userId: newUser.userId,
//               fullName: profile.displayName,
//               firstName: profile.name?.givenName || "",
//               lastName: profile.name?.familyName || "",
//               middleName: profile.name?.middleName,
//             }),
//             tx.insert(userAuth).values({
//               userId: newUser.userId,
//               otp: null,
//               otpExpiry: null,
//               lastLoginAt: new Date(),
//             })
//           ]);

//           const defaultRole = await tx.query.roles.findFirst({
//             where: eq(roles.name, "user"),
//           });

//           if (defaultRole) {
//             await tx.insert(userRoles).values({
//               userId: newUser.userId,
//               roleId: defaultRole.roleId,
//             });
//           }

//                 // Fetch the complete user data after creation
//          let newuser = await db.query.users.findFirst({
//             where: eq(users.userId, user?.userId || ""),
//             with: {
//               userRoles: {
//                 with: {
//                   role: true,
//                 },
//               },
//               profile: true,
//               auth: true,
//             },
//           });

//           return newuser;
//         });
//       }

//     //@ts-ignore
//     const { password:_, ...userWithoutPassword } = user;

//       return {
//         ...userWithoutPassword,
//         accessToken,
//       };
//     } catch (error) {
//       console.error("OAuth Error:", error);
//       throw error;
//     }
//   }
// }
