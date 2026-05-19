import express from 'express';
import {
  createAccessToken,
  getCustomerBithdate,
  resetPasswordByURL,
  sendPasswordResetLink,
  setWishlistedItem,
  signup,
  syncWishlistedItem,
  update,
  updateAddress,
  updatePassword,
} from '../controller/customer.controller';
import { signupV2 } from '../controller/customer.controller-v2';
import { verifyCustomerAccessToken } from '../middleware/verify-customer-token';
const router = express.Router();

router.post('/update/:customer_id', verifyCustomerAccessToken, update);
router.post(
  '/update/:customer_id/address/:address_id',
  verifyCustomerAccessToken,
  updateAddress,
);
router.get('/:customer_id/birthdate', getCustomerBithdate);
router.post('/:customer_id/wishlist/set', setWishlistedItem);
router.post('/:customer_id/wishlist', syncWishlistedItem);
router.post('/signup', signup);
router.post('/reset-link', sendPasswordResetLink);
router.post('/reset/password', resetPasswordByURL);
router.post(
  '/update/:customer_id/password',
  verifyCustomerAccessToken,
  updatePassword,
);
router.post('/create/access-token', createAccessToken);

// ── v2 ───────────────────────────────────────────
router.post('/v2/signup', signupV2);

export default router;
