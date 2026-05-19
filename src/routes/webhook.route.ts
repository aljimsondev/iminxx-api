import express from 'express';
import { customerUpdateWebhook } from '../controller/webhook.controller';
const router = express.Router();

router.post('/customer/update/', customerUpdateWebhook);

export default router;
