import express from 'express';
import { loginAdmin, changePassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/change-password', changePassword);

export default router;
