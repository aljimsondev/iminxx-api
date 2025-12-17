import express from 'express';
import { getDiscountDetails } from '../controller/discount.controller';

const router = express.Router();

router.post('/details', getDiscountDetails);

export default router;
