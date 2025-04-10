import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { oauthConfig } from '../../config/oauth.config';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor() {
    super({
      clientID: oauthConfig.microsoft.clientID,
      clientSecret: oauthConfig.microsoft.clientSecret,
      callbackURL: oauthConfig.microsoft.callbackURL,
      // Update scopes to include required 'openid'
      scope: ['openid', 'profile', 'email', 'user.read'],
      tenant: 'common',
      authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const { emails, displayName, name } = profile;
    const user = {
      email: emails[0].value,
      full_name: displayName,
      first_name: name?.givenName,
      last_name: name?.familyName,
      accessToken,
      provider: 'microsoft'
    };

    done(null, user);
  }
}
