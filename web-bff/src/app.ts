import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { registerStatusRoutes } from './routes/statusRoutes.js';
import { registerBookRoutes } from './routes/bookRoutes.js';
import { registerCustomerRoutes } from './routes/customerRoutes.js';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

registerStatusRoutes(app);
registerBookRoutes(app);
registerCustomerRoutes(app);

const PORT = Number(process.env.PORT ?? 8080);

app.listen(PORT, () => {
  console.log(`Web BFF is running on port ${PORT}`);
});