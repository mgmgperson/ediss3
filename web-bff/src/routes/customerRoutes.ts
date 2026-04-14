import type { Router } from 'express';
import { proxyCustomers, proxyCustomersWithPath } from '../controllers/customerProxyController.js';
import { requireClientType } from '../middleware/requireClientType.js';
import { requireJwt } from '../middleware/requireJwt.js';

export function registerCustomerRoutes(app: Router): void {
  app.use('/customers', requireClientType('Web'));
  app.use('/customers', requireJwt());
  
  app.all('/customers', proxyCustomers);
  app.all('/customers/*splat', proxyCustomersWithPath);
}
