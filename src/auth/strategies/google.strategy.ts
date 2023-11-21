import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AllConfigType } from '../../config/config.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService<AllConfigType>) {
    super({
      clientID: configService.getOrThrow('auth.googleId', { infer: true }),
      clientSecret: configService.getOrThrow('auth.googleSecret', {
        infer: true,
      }),
      callbackURL: `http://localhost:3000/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // console.log(profile);
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
      nickname: `${name.givenName}_${name.familyName}_${Math.random()
        .toString(36)
        .substring(2, 6)}`,

      //   accessToken,
      //   refreshToken,
    };
    done(null, user);
  }
}
