/**
 * One-time helper: opens public GetObject for objects under products/*
 * Run: npx tsx src/utils/configureS3PublicRead.ts
 */
import {
  DeletePublicAccessBlockCommand,
  PutBucketPolicyCommand,
  PutPublicAccessBlockCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const bucket = process.env.AWS_S3_BUCKET!;
const region = process.env.AWS_REGION || 'ap-southeast-2';

const client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const policy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicReadProductImages',
      Effect: 'Allow',
      Principal: '*',
      Action: ['s3:GetObject'],
      Resource: [`arn:aws:s3:::${bucket}/products/*`],
    },
  ],
};

async function main() {
  try {
    await client.send(
      new PutPublicAccessBlockCommand({
        Bucket: bucket,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      })
    );
  } catch {
    // older accounts may not need this; continue
    await client.send(new DeletePublicAccessBlockCommand({ Bucket: bucket })).catch(() => undefined);
  }

  await client.send(
    new PutBucketPolicyCommand({
      Bucket: bucket,
      Policy: JSON.stringify(policy),
    })
  );

  console.log(`Public read enabled for s3://${bucket}/products/*`);
}

main().catch((error) => {
  console.error('Could not configure bucket policy:', error);
  process.exit(1);
});
