import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-github2';
import { AllConfigType } from '../../config/config.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService<AllConfigType>) {
    super({
      clientID: configService.getOrThrow('auth.githubId', { infer: true }),
      clientSecret: configService.getOrThrow('auth.githubSecret', {
        infer: true,
      }),
      //TODO: вынести в .env
      callbackURL: `http://localhost:3000/api/auth/github/callback`,
      scope: ['profile', 'user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // console.log(profile);
    const { displayName, username, emails, photos } = profile;
    // console.log(profile);
    const user = {
      email: emails[0].value,
      name: displayName,
      picture: photos[0].value,
      nickname: `${username}_${Math.random().toString(36).substring(2, 6)}`,
    };
    done(null, user);
  }
}
