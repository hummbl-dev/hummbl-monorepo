// Authentication Routes
// OAuth2 integration with Supabase and external providers

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const router = Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface OAuthRequest {
  provider: 'google' | 'github' | 'discord';
  code: string;
  redirectUri: string;
}

// POST /api/auth/login - Email/password login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required',
      });
    }

    if (!supabase) {
      logger.warn('Supabase not configured, using mock authentication');

      // Mock authentication for development
      if (email === 'demo@hummbl.io' && password === 'demo123') {
        const token = jwt.sign(
          {
            sub: 'demo-user-id',
            email: email,
            role: 'user',
            name: 'Demo User',
          },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );

        return res.json({
          user: {
            id: 'demo-user-id',
            email: email,
            name: 'Demo User',
            role: 'user',
          },
          token: token,
          expiresIn: 86400, // 24 hours
        });
      }

      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Use Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn('Supabase login failed', {
        email,
        error: error.message,
      });

      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'user',
        name: data.user.user_metadata?.name || data.user.email,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    logger.info('User logged in successfully', {
      userId: data.user.id,
      email: data.user.email,
    });

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email,
        role: data.user.user_metadata?.role || 'user',
      },
      token: token,
      expiresIn: 86400, // 24 hours
    });
  } catch (error) {
    logger.error('Login error', error as Error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'An unexpected error occurred',
    });
  }
});

// POST /api/auth/register - User registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name }: RegisterRequest = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Missing information',
        message: 'Email, password, and name are required',
      });
    }

    if (!supabase) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Registration is not available in development mode',
      });
    }

    // Register with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          role: 'user',
        },
      },
    });

    if (error) {
      logger.warn('Supabase registration failed', {
        email,
        error: error.message,
      });

      return res.status(400).json({
        error: 'Registration failed',
        message: error.message,
      });
    }

    logger.info('User registered successfully', {
      userId: data.user?.id,
      email: email,
    });

    res.json({
      message: 'Registration successful',
      user: {
        id: data.user?.id,
        email: email,
        name: name,
        role: 'user',
      },
      requiresVerification: !data.session, // True if email verification is required
    });
  } catch (error) {
    logger.error('Registration error', error as Error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An unexpected error occurred',
    });
  }
});

// POST /api/auth/oauth - OAuth2 callback handler
router.post('/oauth', async (req: Request, res: Response) => {
  try {
    const { provider, code, redirectUri }: OAuthRequest = req.body;

    if (!provider || !code) {
      return res.status(400).json({
        error: 'Missing OAuth data',
        message: 'Provider and authorization code are required',
      });
    }

    if (!supabase) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'OAuth is not available in development mode',
      });
    }

    // Exchange code for session with Supabase
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.warn('OAuth exchange failed', {
        provider,
        error: error.message,
      });

      return res.status(400).json({
        error: 'OAuth failed',
        message: error.message,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'user',
        name: data.user.user_metadata?.name || data.user.email,
        provider: provider,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    logger.info('OAuth login successful', {
      userId: data.user.id,
      email: data.user.email,
      provider: provider,
    });

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email,
        role: data.user.user_metadata?.role || 'user',
        provider: provider,
      },
      token: token,
      expiresIn: 86400, // 24 hours
    });
  } catch (error) {
    logger.error('OAuth error', error as Error);
    res.status(500).json({
      error: 'OAuth failed',
      message: 'An unexpected error occurred',
    });
  }
});

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Missing refresh token',
      });
    }

    if (!supabase) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Token refresh is not available in development mode',
      });
    }

    // Refresh session with Supabase
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: error.message,
      });
    }

    // Generate new JWT token
    const token = jwt.sign(
      {
        sub: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'user',
        name: data.user.user_metadata?.name || data.user.email,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      token: token,
      expiresIn: 86400, // 24 hours
    });
  } catch (error) {
    logger.error('Token refresh error', error as Error);
    res.status(500).json({
      error: 'Token refresh failed',
    });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    res.json({
      user: {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        provider: decoded.provider,
      },
    });
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
    });
  }
});

export default router;
