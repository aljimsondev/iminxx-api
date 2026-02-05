import express from 'express';
import {
  getCustomerBithdate,
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
router.get('/get/:customer_id/birthdate', getCustomerBithdate);
export default router;
