import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL as string,
  nodeEnv: process.env.NODE_ENV || 'development',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  internalServiceSecret: process.env.INTERNAL_SERVICE_SECRET || '',
} as const;
