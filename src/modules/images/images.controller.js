import { createImageUpload, getImageContentForUser, listImagesForUser } from './images.service.js';

export async function listImages(req, res) {
  const images = await listImagesForUser(req.auth.id);
  res.status(200).json({ data: { images } });
}

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Attach an image using the "image" form field.' });
  }

  const image = await createImageUpload(req.auth.id, req.file);
  res.status(201).json({
    message: 'Image uploaded successfully.',
    data: {
      id: image.id,
      url: `/api/v1/images/${image.id}/content`,
      format: image.format,
      bytes: image.bytes,
    },
  });
}

export async function getImageContent(req, res) {
  const imageId = Number(req.params.id);
  if (!Number.isSafeInteger(imageId) || imageId < 1) {
    return res.status(400).json({ error: 'Image id must be a positive integer.' });
  }

  const image = await getImageContentForUser(req.auth.id, imageId);
  res.set({
    'Content-Type': image.contentType,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.status(200).send(image.body);
}
