import { Router } from 'express';
import { me, updatePassword, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { changePasswordValidator, updateProfileValidator } from '../validators/authValidators.js';

const router = Router();

router.use(protect);
router.get('/profile', me);
router.put('/profile', updateProfileValidator, validate, updateProfile);
router.put('/password', changePasswordValidator, validate, updatePassword);

export default router;
