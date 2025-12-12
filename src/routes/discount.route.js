const express = require('express');
const { getDiscountDetails } = require('../controller/discount.controller');

const router = express.Router();

router.post('/details', getDiscountDetails);

module.exports = router;
