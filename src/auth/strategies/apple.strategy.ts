// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy as AppleStrategy } from 'passport-apple';
// import { oauthConfig } from '../../config/oauth.config';
// import * as fs from 'fs';

// @Injectable()
// export class AppleOAuthStrategy extends PassportStrategy(AppleStrategy, 'apple') {
//   constructor() {
//     super({
//       clientID: oauthConfig.apple.clientID,
//       teamID: oauthConfig.apple.teamID,
//       keyID: oauthConfig.apple.keyID,
//       privateKeyString: fs.readFileSync(oauthConfig.apple.privateKeyPath, 'utf8'),
//       callbackURL: oauthConfig.apple.callbackURL,
//       passReqToCallback: true,
//       scope: ['email', 'name'],
//     });
//   }

//   async validate(
//     req: any,
//     accessToken: string,
//     refreshToken: string,
//     idToken: string,
//     profile: any,
//     done: Function,
//   ) {
//     const { email } = profile;
//     const { firstName, lastName } = req.body;
    
//     const user = {
//       email,
//       full_name: `${firstName} ${lastName}`.trim(),
//       first_name: firstName,
//       last_name: lastName,
//       accessToken,
//       provider: 'apple'
//     };

//     done(null, user);
//   }
// }
