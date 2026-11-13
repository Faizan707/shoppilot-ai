import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';

export const s3Enabled = Boolean(
  env.awsAccessKeyId && env.awsSecretAccessKey && env.awsS3Bucket && env.awsRegion
);

export const s3Client = s3Enabled
  ? new S3Client({
      region: env.awsRegion,
      credentials: {
        accessKeyId: env.awsAccessKeyId,
        secretAccessKey: env.awsSecretAccessKey,
      },
    })
  : null;
