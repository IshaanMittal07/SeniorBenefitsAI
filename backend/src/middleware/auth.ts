import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

/**
 * Middleware to verify JWT token
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const decoded = jwt.verify(token, authConfig.jwtSecret) as any;
    req.userId = decoded.userId || decoded.sub;
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Extract token from request headers
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = jwt.verify(token, authConfig.jwtSecret) as any;
      req.userId = decoded.userId || decoded.sub;
      req.user = decoded;
    }

    next();
  } catch (error) {
    console.warn('Optional auth token validation failed:', error);
    next();
  }
}

/**
 * Error handler middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: 'Validation failed', details: err.message });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}

/**
 * Not found middleware
 */
export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}
