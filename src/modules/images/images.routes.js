import { Router } from 'express';
import { uploadImage } from './images.controller.js';
import { parseImageUpload } from './images.upload.js';

const imagesRouter = Router();

imagesRouter.post('/', parseImageUpload, uploadImage);

export default imagesRouter;
