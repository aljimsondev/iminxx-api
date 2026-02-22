import 'dotenv/config';
import app from './app';
import { Logger } from './utils/logger';

const port = process.env.PORT || 4000;

app.listen(port, () => {
  Logger.custom(`Shopify API running on PORT ${port}`, {
    type: 'READY',
    color: 'CYAN',
    mode: 'background',
  });
});
