import type { Request, Response } from 'express';

export function getStatus(_req: Request, res: Response): void {
  res.status(200).type('text/plain').send('OK');
}
