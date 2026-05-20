import express from 'express';
import { signupV2 } from '../controller/customer.controller-v2';

const router = express.Router();

router.post('/signup', signupV2);

export default router;
