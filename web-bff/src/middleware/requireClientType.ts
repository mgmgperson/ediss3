import type { Request, Response, NextFunction } from 'express';

export function requireClientType(expectedClientType: 'Web' | 'iOS' | 'Android') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientType = req.header('X-Client-Type');

    if (!clientType) {
      res.sendStatus(400);
      return;
    }

    if (clientType.trim().toLowerCase() !== expectedClientType.toLowerCase()) {
      res.sendStatus(400);
      return;
    }

    next();
  };
}
