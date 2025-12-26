import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { generalLimiter } from './middleware/rate-limiter';
import discountRoutes from './routes/discount.route';
import productRoutes from './routes/product.route';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Health check endpoint (no rate limiting)
app.get('/ping', (req, res) => {
  res.json({ status: 'pong' });
});

app.use('/api/discount', discountRoutes);
app.use('/api/product', productRoutes);

export default app;
