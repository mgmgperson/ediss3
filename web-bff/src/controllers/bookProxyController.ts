import type { Request, Response } from 'express';
import { proxyRequest } from '../utils/proxy.js';

export async function proxyBooks(req: Request, res: Response): Promise<void> {
  const baseUrl = process.env.BOOK_SERVICE_BASE_URL;
  await proxyRequest(req, res, baseUrl || '', '/books');
}

export async function proxyBooksWithPath(req: Request, res: Response): Promise<void> {
  const baseUrl = process.env.BOOK_SERVICE_BASE_URL;
  const extraPath = req.params.splat;
  const pathSuffix = Array.isArray(extraPath) ? extraPath.join('/') : extraPath;
  const pathPrefix = `/books/${pathSuffix}`;
  
  await proxyRequest(req, res, baseUrl || '', pathPrefix);
}
