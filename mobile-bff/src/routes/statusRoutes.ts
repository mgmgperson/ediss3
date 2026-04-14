import type { Router } from 'express';
import { getStatus } from '../controllers/statusController.js';

export function registerStatusRoutes(app: Router): void {
  app.get('/status', getStatus);
}
