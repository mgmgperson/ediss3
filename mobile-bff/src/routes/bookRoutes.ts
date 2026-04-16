import type { Router } from 'express';
import { proxyBooks, proxyBooksWithPath } from '../controllers/bookProxyController.js';
import { requireClientType } from '../middleware/requireClientType.js';
import { requireJwt } from '../middleware/requireJwt.js';

export function registerBookRoutes(app: Router): void {
  app.use('/books', requireJwt());
  app.use('/books', requireClientType(['iOS', 'Android', 'Web']));

  app.all('/books', proxyBooks);
  app.all('/books/*splat', proxyBooksWithPath);
}