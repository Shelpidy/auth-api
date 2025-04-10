import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { oauthConfig } from '../../config/oauth.config';

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
    profile: Profile,
    done: (error: any, user?: any) => void,
  ) {
    const { name, emails, photos } = profile;
    
    // Match schema fields
    const user = {
      email: emails?.[0]?.value,
      display_name: profile.displayName,
      username: emails?.[0]?.value.split('@')[0] || profile.displayName.toLowerCase().replace(/\s+/g, ''),
      full_name: profile.displayName,
      first_name: name?.givenName,
      last_name: name?.familyName,
      photo: photos?.[0]?.value,
      accessToken,
      is_verified: true,
      language_code: 'en',
      timezone: 'UTC',
      status: 'active',
      provider: 'google',
      // These will be set in auth.service
      user_id: undefined,
      tenant_id: undefined,
      created_by: emails?.[0]?.value,
      modified_by: emails?.[0]?.value,
      created_on: new Date(),
      modified_on: new Date()
    };

    done(null, user);
  }
}
