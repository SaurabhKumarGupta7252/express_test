import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype?.startsWith('image/')) {
      const error = new Error('Only image files are allowed.');
      error.statusCode = 400;
      return callback(error);
    }
    callback(null, true);
  },
});

export const parseImageUpload = upload.single('image');
