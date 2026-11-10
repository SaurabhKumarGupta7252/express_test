import { Router } from 'express';
import { getImageContent, listImages, uploadImage } from './images.controller.js';
import { parseImageUpload } from './images.upload.js';
import { requireAuth } from '../../middleware/require-auth.js';

const imagesRouter = Router();

imagesRouter.use(requireAuth);
imagesRouter.get('/', listImages);
imagesRouter.post('/', parseImageUpload, uploadImage);
imagesRouter.get('/:id/content', getImageContent);

export default imagesRouter;
