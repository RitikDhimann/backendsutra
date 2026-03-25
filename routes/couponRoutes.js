import express from 'express';
import { createCoupon, getCoupons, deleteCoupon, verifyCoupon } from '../controllers/coupon.js';

const router = express.Router();

router.post('/', createCoupon);
router.get('/', getCoupons);
router.delete('/:id', deleteCoupon);
router.post('/verify', verifyCoupon);

export default router;
