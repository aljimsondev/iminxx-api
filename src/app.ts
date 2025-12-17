import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import discountRoutes from './routes/discount.route';

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use('/api/discount', discountRoutes);

export default app;
