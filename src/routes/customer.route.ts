import express from 'express';
import { getCustomerBithdate, update } from '../controller/customer.controller';
import { verifyCustomerAccessToken } from '../middleware/verify-customer-token';
const router = express.Router();

router.post('/update/:customer_id', verifyCustomerAccessToken, update);
router.get('/get/:customer_id/birthdate', getCustomerBithdate);
export default router;
