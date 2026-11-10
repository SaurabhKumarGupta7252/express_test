import { createImageUpload } from './images.service.js';

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Attach an image using the "image" form field.' });
  }

  const image = await createImageUpload(req.file);
  res.status(201).json({
    message: 'Image uploaded successfully.',
    data: {
      url: image.url,
      publicId: image.publicId,
      format: image.format,
      bytes: image.bytes,
    },
  });
}
