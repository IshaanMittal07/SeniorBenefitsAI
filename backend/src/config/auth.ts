import dotenv from 'dotenv';

dotenv.config();

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiration: '24h',
  cognitoUserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
  cognitoClientId: process.env.AWS_COGNITO_CLIENT_ID,
  awsRegion: process.env.AWS_REGION || 'us-east-1',
};

export const appConfig = {
  port: parseInt(process.env.PORT || '3000'),
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  apiTimeout: parseInt(process.env.API_TIMEOUT || '30000'),
};

export const llmConfig = {
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000,
};

export const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  s3Bucket: process.env.AWS_S3_BUCKET,
};
