import * as dotenv from 'dotenv';

dotenv.config();

export const oauthConfig = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
    callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
  },
  microsoft: {
    clientID: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    callbackURL: `${process.env.BASE_URL}/auth/microsoft/callback`,
  },
  // apple: {
  //   clientID: process.env.APPLE_CLIENT_ID || '',
  //   teamID: process.env.APPLE_TEAM_ID || '',
  //   keyID: process.env.APPLE_KEY_ID || '',
  //   privateKeyPath: process.env.APPLE_PRIVATE_KEY_PATH || '',
  //   callbackURL: `${process.env.BASE_URL}/auth/apple/callback`,
  // },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: '24h',
  },
};
