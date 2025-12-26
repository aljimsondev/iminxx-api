import express from 'express';
import { getProductDetails } from '../controller/product.controller';
const router = express.Router();

router.get('/bundle/details/:product_id', getProductDetails);

export default router;
