import { v2 as cloudinary } from 'cloudinary';

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

export async function createImageUpload(file) {
  assertCloudinaryConfigured();

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: process.env.CLOUDINARY_FOLDER || 'health-api',
      resource_type: 'image',
    }, (error, uploaded) => {
      if (error) return reject(error);
      resolve(uploaded);
    });

    stream.end(file.buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    bytes: result.bytes,
  };
}
