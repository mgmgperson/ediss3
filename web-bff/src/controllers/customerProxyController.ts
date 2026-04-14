import type { Request, Response } from 'express';
import { proxyRequest } from '../utils/proxy.js';

export async function proxyCustomers(req: Request, res: Response): Promise<void> {
  const baseUrl = process.env.CUSTOMER_SERVICE_BASE_URL;
  await proxyRequest(req, res, baseUrl || '', '/customers');
}

export async function proxyCustomersWithPath(req: Request, res: Response): Promise<void> {
  const baseUrl = process.env.CUSTOMER_SERVICE_BASE_URL;
  const extraPath = req.params.splat;
  const pathSuffix = Array.isArray(extraPath) ? extraPath.join('/') : extraPath;
  const pathPrefix = `/customers/${pathSuffix}`;
  
  await proxyRequest(req, res, baseUrl || '', pathPrefix);
}
