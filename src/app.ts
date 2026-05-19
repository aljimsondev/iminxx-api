import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { generalLimiter } from './middleware/rate-limiter';
import customerRoutes from './routes/customer.route';
import customerRoutesV2 from './routes/customer.route-v2';
import discountRoutes from './routes/discount.route';
import productRoutes from './routes/product.route';
import webhookRoutes from './routes/webhook.route';

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ['https://iminxx-test.myshopify.com', 'https://iminxx.com'],
  }),
);
app.use(bodyParser.json());
app.use(cookieParser());

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Health check endpoint (no rate limiting)
app.get('/ping', (req, res) => {
  res.json({ status: 'pong' });
});

app.use('/api/discount', discountRoutes);
app.use('/api/product', productRoutes);
app.use('/api/customer', customerRoutes);

app.use('/api/webhook', webhookRoutes);

// ── v2 ───────────────────────────────────────────
app.use('/api/v2/customer', customerRoutesV2);

export default app;
