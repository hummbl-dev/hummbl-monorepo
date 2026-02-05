// Authentication middleware for HUMMBL Backend
// Validates JWT tokens and API keys

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authGuard = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Check for API key first (for service-to-service communication)
    const apiKey = req.headers['x-api-key'] as string;
    if (apiKey && apiKey === process.env.INTERNAL_API_KEY) {
      logger.debug('Request authenticated via API key');
      return next();
    }

    // Check for JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header', {
        path: req.path,
        ip: req.ip,
      });
      return res.status(401).json({
        error: 'Authorization required',
        message: 'Please provide a valid Bearer token or API key',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json({
        error: 'Server configuration error',
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;

    // Attach user info to request
    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };

    logger.debug('Request authenticated via JWT', {
      userId: req.user.id,
      email: req.user.email,
      path: req.path,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', {
        error: error.message,
        path: req.path,
        ip: req.ip,
      });
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
      });
    }

    logger.error('Authentication error', error as Error);
    return res.status(500).json({
      error: 'Authentication failed',
    });
  }
};

// Optional auth middleware (doesn't block if no token provided)
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continue without authentication
  }

  // Use the same logic as authGuard but don't block on failure
  try {
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (jwtSecret) {
      const decoded = jwt.verify(token, jwtSecret) as any;
      req.user = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role || 'user',
      };
    }
  } catch (error) {
    // Log but don't block
    logger.debug('Optional auth failed', { error: (error as Error).message });
  }

  next();
};
