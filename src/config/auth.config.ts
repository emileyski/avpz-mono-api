import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { AuthConfig } from './config.types';
import validateConfig from '../utils/validate-config';

class EnvironmentalVariablesValidator {
  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  APPLICATION_URL: string;

  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsString()
  ACCESS_TOKEN_EXPIRES_IN: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsString()
  REFRESH_TOKEN_EXPIRES_IN: string;
}

export default registerAs<AuthConfig>('auth', (): AuthConfig => {
  validateConfig(process.env, EnvironmentalVariablesValidator);

  return {
    googleId: process.env.GOOGLE_CLIENT_ID,
    googleSecret: process.env.GOOGLE_CLIENT_SECRET,
    githubId: process.env.GITHUB_CLIENT_ID,
    githubSecret: process.env.GITHUB_CLIENT_SECRET,
    applicationUrl: process.env.APPLICATION_URL,
    secret: process.env.ACCESS_TOKEN_SECRET,
    expires: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshExpires: process.env.REFRESH_TOKEN_EXPIRES_IN,
  };
});
