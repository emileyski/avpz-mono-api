export type AuthConfig = {
  googleId: string;
  googleSecret: string;
  applicationUrl: string;
  secret: string;
  expires: string;
  refreshSecret: string;
  refreshExpires: string;
};

export type DatabaseConfig = {
  url: string;
};

export type AllConfigType = {
  database: DatabaseConfig;
  auth: AuthConfig;
};
