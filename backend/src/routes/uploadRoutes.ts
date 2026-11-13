import { Router } from 'express';
import { uploadProductImages } from '../controllers/uploadController.js';
import { authorize, protect } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';

const router = Router();

router.post(
  '/images',
  protect,
  authorize('admin'),
  uploadImages.array('images', 8),
  uploadProductImages
);

export default router;