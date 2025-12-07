/**
 * Authentication Routes
 * Google OAuth, GitHub OAuth, and Email/Password authentication
 */

import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { Env } from '../env';
import '../types.d.ts';

declare const crypto: {
  randomUUID: () => string;
  subtle: {
    digest: (algorithm: string, data: Uint8Array) => Promise<ArrayBuffer>;
  };
};

// Token expiration times (in seconds)
const ACCESS_TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60; // 1 minute in seconds
const RATE_LIMIT_MAX_REQUESTS = 10; // Max requests per window

declare const TextEncoder: {
  new (): {
    encode(input?: string): Uint8Array;
  };
};

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'google' | 'github' | 'email';
  provider_id: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface GitHubUser {
  id: number;
  email: string;
  name: string;
  avatar_url: string;
}

interface GitHubTokenResponse {
  access_token: string;
}

const authRouter = new Hono<{ Bindings: Env }>();

// Rate limiting middleware
authRouter.use('*', async (c, next) => {
  interface RateLimitData {
    count: number;
    resetAt: number;
  }

  try {
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const key = `rate_limit:${ip}`;

    // Get current count and reset time
    const cacheData = await c.env.CACHE.get<RateLimitData>(key, 'json');
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const resetTime = Math.ceil((now + 1) / RATE_LIMIT_WINDOW) * RATE_LIMIT_WINDOW;

    let count = 0;
    if (cacheData && cacheData.resetAt > now) {
      count = cacheData.count;
    }

    // Check if rate limit exceeded
    if (count >= RATE_LIMIT_MAX_REQUESTS) {
      c.status(429);
      c.header('Retry-After', (resetTime - now).toString());
      return c.json({ error: 'Too many requests, please try again later' });
    }

    // Increment counter
    await c.env.CACHE.put(
      key,
      JSON.stringify({
        count: count + 1,
        resetAt: resetTime,
      } as RateLimitData),
      { expirationTtl: RATE_LIMIT_WINDOW }
    );

    // Continue to next middleware
    return await next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Allow the request to continue if there's an error with rate limiting
    return await next();
  }
});

// Helper function to generate tokens
const generateTokens = async (c: { env: Env }, userId: string, email: string) => {
  // Generate access token with expiration
  const accessToken = await sign(
    {
      userId,
      email,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY,
    },
    c.env.JWT_SECRET
  );

  // Generate refresh token
  const refreshToken = crypto.randomUUID();

  // Store refresh token in KV with expiration
  await c.env.CACHE.put(`refresh_token:${refreshToken}`, userId, {
    expirationTtl: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

// Google OAuth
authRouter.post('/google', async c => {
  try {
    const { token } = await c.req.json();

    // Verify Google token
    const googleResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`
    );
    if (!googleResponse.ok) {
      return c.json({ error: 'Invalid Google token' }, 400);
    }

    const googleUser: GoogleUser = await googleResponse.json();

    // Check if user exists in DB
    let user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(googleUser.email)
      .first<User>();

    // Create user if not exists
    if (!user) {
      const userId = crypto.randomUUID();
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, name, avatar_url, provider, provider_id, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          userId,
          googleUser.email,
          googleUser.name,
          googleUser.picture,
          'google',
          googleUser.id,
          true // Google-verified email
        )
        .run();

      user = {
        id: userId,
        email: googleUser.email,
        name: googleUser.name,
        avatar_url: googleUser.picture,
        provider: 'google',
        provider_id: googleUser.id,
        email_verified: true,
      };
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(c, user.id, user.email);

    return c.json({
      user,
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// GitHub OAuth
authRouter.post('/github', async c => {
  try {
    const { code } = await c.req.json();

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: c.env.GITHUB_CLIENT_ID,
        client_secret: c.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData: GitHubTokenResponse = await tokenResponse.json();

    if (!tokenData.access_token) {
      return c.json({ error: 'Failed to authenticate with GitHub' }, 400);
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${tokenData.access_token}`,
        'User-Agent': 'HUMMBL',
      },
    });

    if (!userResponse.ok) {
      return c.json({ error: 'Failed to fetch user info from GitHub' }, 400);
    }

    const githubUser: GitHubUser = await userResponse.json();

    // Check if user exists in DB
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ? OR (provider = ? AND provider_id = ?)'
    )
      .bind(githubUser.email || `${githubUser.id}@github.com`, 'github', githubUser.id.toString())
      .first<User>();

    // Create user if not exists
    if (!user) {
      const userId = crypto.randomUUID();
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, name, avatar_url, provider, provider_id, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          userId,
          githubUser.email || `${githubUser.id}@github.com`,
          githubUser.name || `GitHub User ${githubUser.id}`,
          githubUser.avatar_url,
          'github',
          githubUser.id.toString(),
          !!githubUser.email // Mark as verified if GitHub provided email
        )
        .run();

      user = {
        id: userId,
        email: githubUser.email || `${githubUser.id}@github.com`,
        name: githubUser.name || `GitHub User ${githubUser.id}`,
        avatar_url: githubUser.avatar_url,
        provider: 'github',
        provider_id: githubUser.id.toString(),
        email_verified: !!githubUser.email,
      };
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(c, user.id, user.email);

    return c.json({
      user,
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('GitHub auth error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// Email/Password Registration
authRouter.post('/register', async c => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    // Validate password strength
    if (password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters long' }, 400);
    }

    // Check if user exists
    const existingUser = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existingUser) {
      return c.json(
        {
          error: 'User with this email already exists',
          code: 'EMAIL_EXISTS',
        },
        409
      );
    }

    // Hash password
    const encoder = new TextEncoder();
    const data = encoder.encode(password + c.env.PASSWORD_SALT);
    const hashedPassword = await crypto.subtle.digest('SHA-256', data);
    // Convert ArrayBuffer to hex string (Cloudflare Workers compatible)
    const hashArray = Array.from(new Uint8Array(hashedPassword));
    const hashedPasswordStr = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create user
    const userId = crypto.randomUUID();
    const verificationToken = crypto.randomUUID();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hours from now

    try {
      await c.env.DB.prepare(
        `INSERT INTO users (
          id, email, name, provider, provider_id, 
          email_verified, email_verification_token, email_verification_expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          userId,
          email,
          name,
          'email',
          hashedPasswordStr,
          false,
          verificationToken,
          verificationExpiry.toISOString()
        )
        .run();
    } catch (error: unknown) {
      console.error('Database error during registration:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      return c.json(
        {
          error: 'Failed to create user account',
          details: errorMessage,
          code: 'REGISTRATION_FAILED',
        },
        500
      );
    }

    const user = {
      id: userId,
      email,
      name,
      provider: 'email' as const,
      provider_id: hashedPassword.toString(),
      email_verified: false,
    };

    // Create JWT token
    const jwtToken = await sign({ userId: user.id, email: user.email }, c.env.JWT_SECRET);

    return c.json({
      user,
      token: jwtToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Email/Password Login
authRouter.post('/login', async c => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    // Hash password
    const encoder = new TextEncoder();
    const data = encoder.encode(password + c.env.PASSWORD_SALT);
    const hashedPassword = await crypto.subtle.digest('SHA-256', data);

    // Find user
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ? AND provider = ?')
      .bind(email, 'email')
      .first();

    if (!user || user.provider_id !== hashedPassword.toString()) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Create JWT token
    const jwtToken = await sign({ userId: user.id, email: user.email }, c.env.JWT_SECRET);

    return c.json({
      user,
      token: jwtToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Verify token
authRouter.get('/verify', async c => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.substring(7);
    const payload = await verify(token, c.env.JWT_SECRET);
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, avatar_url, provider FROM users WHERE id = ?'
    )
      .bind(payload.userId as string)
      .first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Email Verification
authRouter.post('/verify-email', async c => {
  try {
    const { token } = await c.req.json();

    if (!token) {
      return c.json({ error: 'Missing verification token' }, 400);
    }

    // Find user by verification token
    const user = await c.env.DB.prepare(
      `
      SELECT * FROM users 
      WHERE email_verification_token = ? 
      AND email_verification_expires_at > datetime('now')
    `
    )
      .bind(token)
      .first();

    if (!user) {
      return c.json({ error: 'Invalid or expired verification token' }, 400);
    }

    // Mark email as verified
    await c.env.DB.prepare(
      `
      UPDATE users 
      SET email_verified = TRUE, 
          email_verification_token = NULL,
          email_verification_expires_at = NULL
      WHERE id = ?
    `
    )
      .bind(user.id)
      .run();

    return c.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return c.json({ error: 'Verification failed' }, 500);
  }
});

// Refresh token endpoint
authRouter.post('/refresh', async c => {
  try {
    const { refreshToken } = await c.req.json();

    if (!refreshToken) {
      return c.json({ error: 'Refresh token is required' }, 400);
    }

    // Verify refresh token
    const userId = await c.env.CACHE.get(`refresh_token:${refreshToken}`);
    if (!userId) {
      return c.json(
        {
          error: 'Invalid or expired refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        },
        401
      );
    }

    // Get user from database
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, avatar_url, provider, email_verified FROM users WHERE id = ?'
    )
      .bind(userId)
      .first<User>();

    if (!user) {
      // Clean up invalid refresh token
      await c.env.CACHE.delete(`refresh_token:${refreshToken}`);
      return c.json({ error: 'User not found' }, 404);
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(
      c,
      user.id,
      user.email
    );

    // Delete old refresh token
    await c.env.CACHE.delete(`refresh_token:${refreshToken}`);

    return c.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        provider: user.provider,
        email_verified: user.email_verified,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return c.json({ error: 'Failed to refresh token' }, 500);
  }
});

// Logout endpoint
authRouter.post('/logout', async c => {
  try {
    const { refreshToken } = await c.req.json();

    if (refreshToken) {
      await c.env.CACHE.delete(`refresh_token:${refreshToken}`);
    }

    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Logout failed' }, 500);
  }
});

export default authRouter;
