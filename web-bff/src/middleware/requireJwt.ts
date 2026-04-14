import type { Request, Response, NextFunction } from 'express';
import { decodeAndValidateJwtPayload } from '../utils/jwt.js';

export function requireJwt() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authorization = req.header('Authorization');

    if (!authorization) {
      res.sendStatus(401);
      return;
    }

    if (!authorization.startsWith('Bearer ')) {
      res.sendStatus(401);
      return;
    }

    const token = authorization.substring('Bearer '.length).trim();

    if (!token) {
      res.sendStatus(401);
      return;
    }

    const payload = decodeAndValidateJwtPayload(token);

    if (!payload) {
      res.sendStatus(401);
      return;
    }

    next();
  };
}