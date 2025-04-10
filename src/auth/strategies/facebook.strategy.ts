import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { oauthConfig } from 'src/config/oauth.config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: oauthConfig.facebook.appId,
      clientSecret: oauthConfig.facebook.appSecret,
      callbackURL:oauthConfig.facebook.callbackURL,
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ) {
    const { name, emails, photos } = profile;
    const user = {
      email: emails?.[0]?.value,
      full_name: name.familyName ? `${name.givenName} ${name.familyName}` : name.givenName,
      first_name: name.givenName,
      last_name: name.familyName,
      photo: photos?.[0]?.value,
      accessToken,
      provider: 'facebook'
    };

    done(null, user);
  }
}
