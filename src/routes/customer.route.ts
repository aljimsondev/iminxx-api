import express from 'express';
import { getCustomerBithdate, update } from '../controller/customer.controller';
const router = express.Router();

router.post('/update/:customer_id', update);
router.get('/get/:customer_id/birthdate', getCustomerBithdate);
export default router;
