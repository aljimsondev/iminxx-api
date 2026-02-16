import express from 'express';
import {
  getCustomerBithdate,
  setWishlistedItem,
  signup,
  syncWishlistedItem,
  update,
  updateAddress,
} from '../controller/customer.controller';
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

export default router;
