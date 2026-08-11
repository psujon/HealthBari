import express from 'express';
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} from '../controllers/couponController.js';

const router = express.Router();

// Public / Storefront Validation
router.post('/validate', validateCoupon);

// Admin Coupon Management
router.get('/', getAllCoupons);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;
