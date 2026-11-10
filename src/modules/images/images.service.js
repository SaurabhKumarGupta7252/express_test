import { v2 as cloudinary } from 'cloudinary';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { images } from '../../db/schema.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function assertCloudinaryConfigured() {
  const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    .filter((key) => !process.env[key]);

  if (missing.length) {
    const error = new Error(`Cloudinary is not configured. Set ${missing.join(', ')}.`);
    error.statusCode = 503;
    throw error;
  }
}

export async function createImageUpload(userId, file) {
  assertCloudinaryConfigured();

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: process.env.CLOUDINARY_FOLDER || 'health-api',
      resource_type: 'image',
      type: 'authenticated',
    }, (error, uploaded) => {
      if (error) return reject(error);
      resolve(uploaded);
    });

    stream.end(file.buffer);
  });

  try {
    const [image] = await db.insert(images).values({
      userId,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    }).returning({
      id: images.id,
      format: images.format,
      bytes: images.bytes,
      createdAt: images.createdAt,
    });
    return image;
  } catch (error) {
    await cloudinary.uploader.destroy(result.public_id, {
      resource_type: 'image',
      type: 'authenticated',
      invalidate: true,
    }).catch(() => {});
    throw error;
  }
}

export async function listImagesForUser(userId) {
  return db.select({
    id: images.id,
    format: images.format,
    bytes: images.bytes,
    createdAt: images.createdAt,
  }).from(images).where(eq(images.userId, userId)).orderBy(desc(images.createdAt));
}

export async function getImageContentForUser(userId, imageId) {
  const [image] = await db.select({
    publicId: images.publicId,
    format: images.format,
  }).from(images).where(and(eq(images.id, imageId), eq(images.userId, userId))).limit(1);

  if (!image) {
    const error = new Error('Image not found.');
    error.statusCode = 404;
    throw error;
  }

  assertCloudinaryConfigured();
  const expiresAt = Math.floor(Date.now() / 1000) + 60;
  const signedDownloadUrl = cloudinary.utils.private_download_url(
    image.publicId,
    image.format,
    { resource_type: 'image', type: 'authenticated', expires_at: expiresAt },
  );
  const response = await fetch(signedDownloadUrl);

  if (!response.ok) {
    const error = new Error('Unable to retrieve image from storage.');
    error.statusCode = 502;
    throw error;
  }

  return {
    body: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type') || `image/${image.format}`,
  };
}
