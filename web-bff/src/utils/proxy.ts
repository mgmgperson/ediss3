import type { Request, Response } from 'express';

export async function proxyRequest(
  req: Request,
  res: Response,
  baseUrl: string,
  pathPrefix: string
): Promise<void> {
  try {
    if (!baseUrl) {
      res.sendStatus(500);
      return;
    }

    // Build the target URL
    let targetUrl = `${baseUrl}${pathPrefix}`;
    
    // Append query string if present
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
    if (contentType?.includes('application/json')) {
      res.type('application/json').send(text);
    } else {
      res.send(text);
    }
  } catch (error) {
    console.error(`Proxy error for ${pathPrefix}:`, error);
    res.sendStatus(500);
  }
}
