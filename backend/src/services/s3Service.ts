import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { env } from '../config/env.js';
import { s3Client, s3Enabled } from '../config/s3.js';
import { ApiError } from '../utils/ApiError.js';

function publicObjectUrl(key: string): string {
  return `https://${env.awsS3Bucket}.s3.${env.awsRegion}.amazonaws.com/${key}`;
}

function sanitizeFilename(filename: string): string {
  return path
    .basename(filename)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .toLowerCase();
}

export async function uploadImageBuffer(params: {
  buffer: Buffer;
  contentType: string;
  originalName: string;
  folder?: string;
}): Promise<{ url: string; key: string }> {
  if (!s3Enabled || !s3Client) {
    throw new ApiError(503, 'AWS S3 is not configured');
  }

  const folder = params.folder || 'products';
  const key = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}-${sanitizeFilename(params.originalName)}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.awsS3Bucket,
      Key: key,
      Body: params.buffer,
      ContentType: params.contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return { url: publicObjectUrl(key), key };
}

export async function uploadManyImages(
  files: Express.Multer.File[],
  folder = 'products'
): Promise<string[]> {
  const uploads = await Promise.all(
    files.map((file) =>
      uploadImageBuffer({
        buffer: file.buffer,
        contentType: file.mimetype,
        originalName: file.originalname,
        folder,
      })
    )
  );
  return uploads.map((u) => u.url);
}
