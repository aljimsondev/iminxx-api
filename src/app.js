const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const discountRoutes = require('./routes/discount.route');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use('/api/discount', discountRoutes);

module.exports = app;
