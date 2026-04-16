import type { Request, Response, NextFunction } from 'express';

export function requireClientType(expectedClientTypes: string[]) {
  const allowed = expectedClientTypes.map((value) => value.trim().toLowerCase());

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientType = req.header('X-Client-Type');

    if (!clientType) {
      res.sendStatus(400);
      return;
    }

    const normalized = clientType.trim().toLowerCase();

    if (!allowed.includes(normalized)) {
      res.sendStatus(400);
      return;
    }

    next();
  };
}
