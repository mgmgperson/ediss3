import type { Request, Response } from 'express';

async function proxyAndTransformCustomerResponse(
  req: Request,
  res: Response,
  pathPrefix: string
): Promise<void> {
  try {
    const baseUrl = process.env.CUSTOMER_SERVICE_BASE_URL;

    if (!baseUrl) {
      res.sendStatus(500);
      return;
    }

    let targetUrl = `${baseUrl}${pathPrefix}`;
    if (req.url.includes('?')) {
      const queryString = req.url.substring(req.url.indexOf('?'));
      targetUrl += queryString;
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    const text = await response.text();

    res.status(response.status);

    const location = response.headers.get('location');
    if (location) {
      res.setHeader('Location', location);
    }

    const contentType = response.headers.get('content-type');

    if (
      req.method === 'GET' &&
      response.ok &&
      contentType?.includes('application/json')
    ) {
      const parsed = JSON.parse(text);

      delete parsed.address;
      delete parsed.address2;
      delete parsed.city;
      delete parsed.state;
      delete parsed.zipcode;

      res.json(parsed);
      return;
    }

    if (contentType?.includes('application/json')) {
      res.type('application/json').send(text);
    } else {
      res.send(text);
    }
  } catch (error) {
    console.error('Mobile customer proxy error:', error);
    res.sendStatus(500);
  }
}

export async function proxyCustomers(req: Request, res: Response): Promise<void> {
  await proxyAndTransformCustomerResponse(req, res, '/customers');
}

export async function proxyCustomersWithPath(req: Request, res: Response): Promise<void> {
  const extraPath = req.params.splat;
  const pathSuffix = Array.isArray(extraPath) ? extraPath.join('/') : extraPath;
  await proxyAndTransformCustomerResponse(req, res, `/customers/${pathSuffix}`);
}
