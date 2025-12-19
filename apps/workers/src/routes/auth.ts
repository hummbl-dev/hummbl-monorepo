/**
 * Authentication Routes
 * Google OAuth, GitHub OAuth, and Email/Password authentication
 */

import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { Env } from '../env';
import '../types.d.ts';

// Cloudflare Workers crypto polyfills
declare const crypto: {
  getRandomValues: (array: Uint8Array) => Uint8Array;
  randomUUID: () => string;
  subtle: {
    importKey: (
      format: string,
      keyData: Uint8Array,
      algorithm: { name: string },
      extractable: boolean,
      keyUsages: string[]
    ) => Promise<CryptoKey>;
    deriveBits: (
      algorithm: {
        name: string;
        salt: Uint8Array;
        iterations: number;
        hash: string;
      },
      baseKey: CryptoKey,
      length: number
    ) => Promise<ArrayBuffer>;
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
  password_hash?: string;
  salt?: string;
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

// CSRF protection middleware for POST requests
authRouter.use('*', async (c, next) => {
  if (c.req.method === 'POST') {
    const origin = c.req.header('Origin');
    const referer = c.req.header('Referer');
    const host = c.req.header('Host');

    // Basic origin validation
    if (!origin && !referer) {
      return c.json({ error: 'Missing origin header' }, 403);
    }

    const allowedOrigins = [
      'https://hummbl.dev',
      'https://www.hummbl.dev',
      'http://localhost:3000',
      'http://localhost:5173',
    ];

    const requestOrigin = origin || (referer ? new URL(referer).origin : null);
    if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
      return c.json({ error: 'Invalid origin' }, 403);
    }
  }
  return await next();
});

// Rate limiting middleware
authRouter.use('*', async (c, next) => {
  interface RateLimitData {
    count: number;
    resetAt: number;
  }

  try {
    const ip =
      c.req.header('CF-Connecting-IP') ||
      c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ||
      c.req.header('X-Real-IP') ||
      'unknown';
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

// Constant-time string comparison to prevent timing attacks
const constantTimeEquals = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

// Generate cryptographically secure random UUID
const generateUUID = (): string => {
  return crypto.randomUUID();
};

// Generate per-user salt
const generateSalt = (): string => {
  const saltBytes = new Uint8Array(32);
  crypto.getRandomValues(saltBytes);
  return Array.from(saltBytes, b => b.toString(16).padStart(2, '0')).join('');
};

// Safe GitHub name validation without regex
const isValidGitHubName = (name: string): boolean => {
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    if (
      !(
        (char >= 48 && char <= 57) || // 0-9
        (char >= 65 && char <= 90) || // A-Z
        (char >= 97 && char <= 122) || // a-z
        char === 32 ||
        char === 45 ||
        char === 95 ||
        char === 46 ||
        char === 64 // space - _ . @
      )
    ) {
      return false;
    }
  }
  return true;
};

// Safe email validation without regex
const isValidEmail = (email: string): boolean => {
  if (email.length < 3 || email.length > 254) return false;

  const atIndex = email.indexOf('@');
  if (atIndex <= 0 || atIndex >= email.length - 1) return false;

  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex + 1);

  if (localPart.length === 0 || domainPart.length === 0) return false;
  if (domainPart.indexOf('.') === -1) return false;

  // Basic character validation
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    if (char === 32 || char < 32 || char > 126) return false; // No spaces or control chars
  }

  return true;
};

// Password hashing utility function with per-user salt
const hashPassword = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const saltData = encoder.encode(salt);

  const key = await crypto.subtle.importKey('raw', passwordData, { name: 'PBKDF2' }, false, [
    'deriveBits',
  ]);

  const hashedPassword = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: 100000, // Cloudflare Workers limit (max 100k)
      hash: 'SHA-512',
    },
    key,
    512 // 512-bit hash
  );

  const hashArray = Array.from(new Uint8Array(hashedPassword));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Helper function to generate tokens with proper JWT claims
const generateTokens = async (c: { env: Env }, userId: string, email: string) => {
  // Validate inputs
  if (
    !userId ||
    !email ||
    typeof userId !== 'string' ||
    typeof email !== 'string' ||
    userId.length === 0 ||
    email.length === 0 ||
    userId.length > 100 ||
    email.length > 254
  ) {
    throw new Error('Invalid user data for token generation');
  }

  if (!c.env.JWT_SECRET || typeof c.env.JWT_SECRET !== 'string' || c.env.JWT_SECRET.length < 32) {
    throw new Error('Invalid JWT secret configuration');
  }

  const now = Math.floor(Date.now() / 1000);
  const accessTokenExpiry = now + ACCESS_TOKEN_EXPIRY;

  // Generate access token with standard JWT claims
  const accessToken = await sign(
    {
      sub: userId, // subject (user ID)
      email,
      iat: now, // issued at
      exp: accessTokenExpiry, // expiration
      iss: 'hummbl-auth', // issuer
      aud: 'hummbl-web', // audience
      type: 'access',
    },
    c.env.JWT_SECRET,
    'HS256'
  );

  // Validate access token
  if (!accessToken || typeof accessToken !== 'string' || accessToken.length < 10) {
    throw new Error('Invalid access token generated');
  }

  // Generate refresh token with rotation
  const refreshToken = crypto.randomUUID();
  if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.length !== 36) {
    throw new Error('Invalid refresh token generated');
  }

  // Store refresh token with metadata for rotation
  try {
    await c.env.CACHE.put(
      `refresh_token:${refreshToken}`,
      JSON.stringify({
        userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date((now + REFRESH_TOKEN_EXPIRY) * 1000).toISOString(),
      }),
      { expirationTtl: REFRESH_TOKEN_EXPIRY }
    );
  } catch (error) {
    console.error('Cache storage error for refresh token:', {
      error: error instanceof Error ? error.message : String(error),
      userId: userId.substring(0, 8) + '...',
      timestamp: new Date().toISOString(),
    });
    throw new Error('Failed to store refresh token');
  }

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY,
  };
};

// Google OAuth
authRouter.post('/google', async c => {
  try {
    let requestData;
    try {
      requestData = await c.req.json();
    } catch (error) {
      console.error('JSON parsing error during Google auth:', error);
      return c.json({ error: 'Invalid request format' }, 400);
    }

    const { token } = requestData;

    if (!token || typeof token !== 'string' || token.length < 10 || token.length > 2048) {
      return c.json({ error: 'Invalid Google token format' }, 400);
    }

    // Safe character validation without regex
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      if (
        !(
          (char >= 48 && char <= 57) || // 0-9
          (char >= 65 && char <= 90) || // A-Z
          (char >= 97 && char <= 122) || // a-z
          char === 46 ||
          char === 95 ||
          char === 47 ||
          char === 43 ||
          char === 61 ||
          char === 45 // ._/+=-
        )
      ) {
        return c.json({ error: 'Invalid Google token format' }, 400);
      }
    }

    // Verify Google token with timeout and validation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let googleResponse;
    try {
      const googleApiUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
      const url = new URL(googleApiUrl);

      // Validate URL to prevent SSRF
      if (url.hostname !== 'www.googleapis.com' || url.protocol !== 'https:') {
        throw new Error('Invalid Google API URL');
      }

      googleResponse = await fetch(`${googleApiUrl}?access_token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: { 'User-Agent': 'HUMMBL/1.0' },
        signal: controller.signal,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return c.json({ error: 'Request timeout' }, 408);
      }
      console.error('Google API request failed:', error);
      return c.json({ error: 'Failed to verify Google token' }, 400);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!googleResponse.ok) {
      return c.json({ error: 'Invalid Google token' }, 400);
    }

    const googleUser: GoogleUser = await googleResponse.json();

    // Validate Google user data
    if (
      !googleUser.id ||
      !googleUser.email ||
      !googleUser.name ||
      !googleUser.picture ||
      typeof googleUser.id !== 'string' ||
      typeof googleUser.email !== 'string' ||
      typeof googleUser.name !== 'string' ||
      typeof googleUser.picture !== 'string' ||
      googleUser.email.length > 254 ||
      googleUser.name.length > 100 ||
      googleUser.picture.length > 500 ||
      !isValidEmail(googleUser.email)
    ) {
      return c.json({ error: 'Invalid Google user data' }, 400);
    }

    // Check if user exists in DB
    let user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(googleUser.email)
      .first<User>();

    // Create user if not exists
    if (!user) {
      const userId = generateUUID();
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
    let requestData;
    try {
      requestData = await c.req.json();
    } catch (error) {
      console.error('JSON parsing error during GitHub auth:', error);
      return c.json({ error: 'Invalid request format' }, 400);
    }

    const { code } = requestData;

    if (!code || typeof code !== 'string' || code.length < 10 || code.length > 1000) {
      return c.json({ error: 'Invalid authorization code format' }, 400);
    }

    // Safe character validation for authorization code
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      if (
        !(
          (char >= 48 && char <= 57) || // 0-9
          (char >= 65 && char <= 90) || // A-Z
          (char >= 97 && char <= 122) || // a-z
          char === 95 ||
          char === 45 // _ -
        )
      ) {
        return c.json({ error: 'Invalid authorization code format' }, 400);
      }
    }

    // Exchange code for access token with timeout
    const tokenController = new AbortController();
    const tokenTimeoutId = setTimeout(() => tokenController.abort(), 10000); // 10 second timeout

    let tokenResponse;
    try {
      const githubTokenUrl = 'https://github.com/login/oauth/access_token';
      const url = new URL(githubTokenUrl);

      // Validate URL to prevent SSRF
      if (url.hostname !== 'github.com' || url.protocol !== 'https:') {
        throw new Error('Invalid GitHub OAuth URL');
      }

      tokenResponse = await fetch(githubTokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'HUMMBL/1.0',
        },
        body: JSON.stringify({
          client_id: c.env.GITHUB_CLIENT_ID,
          client_secret: c.env.GITHUB_CLIENT_SECRET,
          code,
        }),
        signal: tokenController.signal,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return c.json({ error: 'Request timeout' }, 408);
      }
      console.error('GitHub token request failed:', error);
      return c.json({ error: 'Failed to authenticate with GitHub' }, 400);
    } finally {
      clearTimeout(tokenTimeoutId);
    }

    if (!tokenResponse.ok) {
      return c.json({ error: 'Failed to authenticate with GitHub' }, 400);
    }

    let tokenData: GitHubTokenResponse;
    try {
      tokenData = await tokenResponse.json();
    } catch (error) {
      console.error('GitHub token response parsing error:', error);
      return c.json({ error: 'Failed to authenticate with GitHub' }, 400);
    }

    if (
      !tokenData.access_token ||
      typeof tokenData.access_token !== 'string' ||
      tokenData.access_token.length < 10 ||
      tokenData.access_token.length > 255
    ) {
      return c.json({ error: 'Invalid GitHub access token' }, 400);
    }

    // Safe character validation for GitHub access token
    for (let i = 0; i < tokenData.access_token.length; i++) {
      const char = tokenData.access_token.charCodeAt(i);
      if (
        !(
          (char >= 48 && char <= 57) || // 0-9
          (char >= 65 && char <= 90) || // A-Z
          (char >= 97 && char <= 122) || // a-z
          char === 46 ||
          char === 95 ||
          char === 45 // ._-
        )
      ) {
        return c.json({ error: 'Invalid GitHub access token' }, 400);
      }
    }

    // Get user info with timeout and validation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let userResponse;
    try {
      const githubApiUrl = 'https://api.github.com/user';
      const url = new URL(githubApiUrl);

      // Validate URL to prevent SSRF
      if (url.hostname !== 'api.github.com' || url.protocol !== 'https:') {
        throw new Error('Invalid GitHub API URL');
      }

      userResponse = await fetch(githubApiUrl, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'HUMMBL/1.0',
          Accept: 'application/vnd.github.v3+json',
        },
        signal: controller.signal,
      });
    } catch (error) {
      console.error('GitHub API request failed:', error);
      return c.json({ error: 'Failed to fetch user info from GitHub' }, 400);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!userResponse.ok || userResponse.status !== 200) {
      return c.json({ error: 'Failed to fetch user info from GitHub' }, 400);
    }

    // Check response size to prevent DoS
    const contentLength = userResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10000) {
      return c.json({ error: 'Response too large' }, 400);
    }

    let githubUser: GitHubUser;
    try {
      githubUser = await userResponse.json();
    } catch (error) {
      console.error('GitHub user response parsing error:', error);
      return c.json({ error: 'Failed to fetch user info from GitHub' }, 400);
    }

    // Comprehensive GitHub user data validation
    if (
      !githubUser.id ||
      typeof githubUser.id !== 'number' ||
      githubUser.id <= 0 ||
      githubUser.id > Number.MAX_SAFE_INTEGER ||
      (githubUser.email &&
        (typeof githubUser.email !== 'string' ||
          githubUser.email.length > 254 ||
          githubUser.email.length < 3 ||
          !isValidEmail(githubUser.email))) ||
      (githubUser.name &&
        (typeof githubUser.name !== 'string' ||
          githubUser.name.length > 100 ||
          githubUser.name.length === 0 ||
          !isValidGitHubName(githubUser.name))) ||
      (githubUser.avatar_url &&
        (typeof githubUser.avatar_url !== 'string' ||
          githubUser.avatar_url.length > 500 ||
          !/^https:\/\//.test(githubUser.avatar_url)))
    ) {
      return c.json({ error: 'Invalid GitHub user data' }, 400);
    }

    // Check if user exists in DB
    let user;
    try {
      user = await c.env.DB.prepare(
        'SELECT * FROM users WHERE email = ? OR (provider = ? AND provider_id = ?)'
      )
        .bind(
          githubUser.email || `github-${githubUser.id}@noreply.hummbl.dev`,
          'github',
          githubUser.id.toString()
        )
        .first<User>();
    } catch (error) {
      console.error('Database error during GitHub user lookup:', error);
      return c.json({ error: 'Authentication failed' }, 500);
    }

    // Create user if not exists with comprehensive validation
    if (!user) {
      const userId = generateUUID();
      if (!userId || typeof userId !== 'string' || userId.length !== 36) {
        console.error('Invalid UUID generated for GitHub user');
        return c.json({ error: 'Authentication failed' }, 500);
      }

      const userEmail = githubUser.email || `github-${githubUser.id}@noreply.hummbl.dev`;
      const userName = (githubUser.name && githubUser.name.trim()) || `GitHubUser${githubUser.id}`;
      const avatarUrl =
        githubUser.avatar_url &&
        typeof githubUser.avatar_url === 'string' &&
        githubUser.avatar_url.length <= 500 &&
        /^https:\/\/[a-zA-Z0-9.-]+\.githubusercontent\.com\//.test(githubUser.avatar_url)
          ? githubUser.avatar_url
          : null;

      try {
        const result = await c.env.DB.prepare(
          'INSERT INTO users (id, email, name, avatar_url, provider, provider_id, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))'
        )
          .bind(
            userId,
            userEmail,
            userName.substring(0, 100),
            avatarUrl,
            'github',
            githubUser.id.toString(),
            !!githubUser.email
          )
          .run();

        if (!result || !result.success) {
          throw new Error('Database insertion failed');
        }
      } catch (error) {
        const sanitizedError = String(error)
          .replace(/[\r\n\t]/g, ' ')
          .substring(0, 100);
        console.error('Database error during GitHub user creation:', sanitizedError);
        return c.json({ error: 'Authentication failed' }, 500);
      }

      user = {
        id: userId,
        email: userEmail,
        name: userName.substring(0, 100),
        avatar_url: avatarUrl,
        provider: 'github',
        provider_id: githubUser.id.toString(),
        email_verified: !!githubUser.email,
      };
    } else {
      // Validate existing user data
      if (
        !user.id ||
        !user.email ||
        typeof user.id !== 'string' ||
        typeof user.email !== 'string' ||
        user.id.length === 0 ||
        user.email.length === 0
      ) {
        console.error('Invalid existing user data from database');
        return c.json({ error: 'Authentication failed' }, 500);
      }
    }

    // Generate tokens
    let accessToken, refreshToken;
    try {
      const tokens = await generateTokens(c, user.id, user.email);
      if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
        throw new Error('Invalid tokens generated');
      }
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
    } catch (error) {
      console.error('Token generation error during GitHub auth:', error);
      return c.json({ error: 'Authentication failed' }, 500);
    }

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
    let requestData;
    try {
      requestData = await c.req.json();
    } catch (error) {
      console.error('JSON parsing error during registration:', error);
      return c.json({ error: 'Invalid request format' }, 400);
    }

    const { email, password, name } = requestData;

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate input types and lengths
    if (
      typeof email !== 'string' ||
      email.length > 254 ||
      typeof password !== 'string' ||
      password.length > 128 ||
      typeof name !== 'string' ||
      name.length > 100
    ) {
      return c.json({ error: 'Invalid input format or length' }, 400);
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    // Enhanced password strength validation
    if (password.length < 8 || password.length > 128) {
      return c.json({ error: 'Password must be between 8 and 128 characters' }, 400);
    }

    // Safe character-based validation
    let hasLower = false,
      hasUpper = false,
      hasDigit = false;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      if (char >= 97 && char <= 122) hasLower = true;
      else if (char >= 65 && char <= 90) hasUpper = true;
      else if (char >= 48 && char <= 57) hasDigit = true;
    }
    if (!hasLower || !hasUpper || !hasDigit) {
      return c.json(
        { error: 'Password must contain lowercase, uppercase, and numeric characters' },
        400
      );
    }

    const commonWords = ['password', '123456', 'qwerty', 'admin', 'login', 'user'];
    if (commonWords.some(word => password.toLowerCase().includes(word))) {
      return c.json({ error: 'Password cannot contain common words' }, 400);
    }
    if (password.toLowerCase().includes(sanitizedEmail.split('@')[0].toLowerCase())) {
      return c.json({ error: 'Password cannot contain parts of your email' }, 400);
    }

    // Enhanced name validation
    if (sanitizedName.length === 0 || sanitizedName.length > 100) {
      return c.json({ error: 'Name must be between 1 and 100 characters' }, 400);
    }

    // Safe character validation
    let hasValidChar = false;
    let consecutiveSpaces = 0;
    for (let i = 0; i < sanitizedName.length; i++) {
      const char = sanitizedName.charCodeAt(i);
      if (
        (char >= 48 && char <= 57) || // 0-9
        (char >= 65 && char <= 90) || // A-Z
        (char >= 97 && char <= 122) || // a-z
        char === 32 ||
        char === 45 ||
        char === 95 ||
        char === 46 // space - _ .
      ) {
        if (char >= 48 && char <= 122 && char !== 32) hasValidChar = true;
        consecutiveSpaces = char === 32 ? consecutiveSpaces + 1 : 0;
        if (consecutiveSpaces > 1) {
          return c.json({ error: 'Name cannot contain multiple consecutive spaces' }, 400);
        }
      } else {
        return c.json(
          {
            error:
              'Name can only contain letters, numbers, spaces, hyphens, underscores, and periods',
          },
          400
        );
      }
    }
    if (!hasValidChar) {
      return c.json({ error: 'Name cannot be only special characters' }, 400);
    }
    const reservedWords = ['admin', 'root', 'system', 'null', 'undefined', 'test'];
    if (reservedWords.some(word => sanitizedName.toLowerCase().includes(word))) {
      return c.json({ error: 'Name cannot contain reserved words' }, 400);
    }

    // Check if user exists
    let existingUser;
    try {
      existingUser = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
        .bind(sanitizedEmail)
        .first();
    } catch (error) {
      console.error('Database error during user lookup:', error);
      return c.json({ error: 'Registration failed' }, 500);
    }

    if (existingUser) {
      return c.json(
        {
          error: 'User with this email already exists',
          code: 'EMAIL_EXISTS',
        },
        409
      );
    }

    // Hash password using PBKDF2 with per-user salt
    let hashedPasswordStr;
    let userSalt;
    try {
      userSalt = generateSalt();
      hashedPasswordStr = await hashPassword(password, userSalt);
      if (!hashedPasswordStr || hashedPasswordStr.length !== 128) {
        // SHA-512 produces 128 char hex
        throw new Error('Invalid password hash generated');
      }
    } catch (error) {
      console.error('Password hashing error during registration:', error);
      return c.json({ error: 'Registration failed' }, 500);
    }

    // Create user
    let userId, verificationToken;
    try {
      userId = generateUUID();
      verificationToken = generateUUID();
      if (
        !userId ||
        !verificationToken ||
        typeof userId !== 'string' ||
        typeof verificationToken !== 'string' ||
        userId.length !== 36 ||
        verificationToken.length !== 36
      ) {
        throw new Error('Invalid UUID generated');
      }
    } catch (error) {
      console.error('UUID generation error:', error);
      return c.json({ error: 'Registration failed' }, 500);
    }

    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hours from now

    if (isNaN(verificationExpiry.getTime()) || verificationExpiry <= new Date()) {
      console.error('Invalid verification expiry date');
      return c.json({ error: 'Registration failed' }, 500);
    }

    try {
      // Validate all parameters before database insertion
      if (
        !userId ||
        !sanitizedEmail ||
        !sanitizedName ||
        !hashedPasswordStr ||
        !verificationToken
      ) {
        throw new Error('Missing required parameters for user creation');
      }

      const result = await c.env.DB.prepare(
        `INSERT INTO users (
          id, email, name, provider, provider_id, password_hash, salt,
          email_verified, email_verification_token, email_verification_expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          userId,
          sanitizedEmail,
          sanitizedName,
          'email',
          userId,
          hashedPasswordStr,
          userSalt,
          false,
          verificationToken,
          verificationExpiry.toISOString()
        )
        .run();

      if (!result || !result.success) {
        throw new Error('Database insertion failed');
      }
    } catch (error: unknown) {
      console.error('Database error during registration:', error);
      return c.json(
        {
          error: 'Failed to create user account',
          code: 'REGISTRATION_FAILED',
        },
        500
      );
    }

    const user = {
      id: userId,
      email: sanitizedEmail,
      name: sanitizedName,
      provider: 'email' as const,
      provider_id: userId,
      email_verified: false,
    };

    // Create JWT token
    let jwtToken;
    try {
      if (
        !c.env.JWT_SECRET ||
        typeof c.env.JWT_SECRET !== 'string' ||
        c.env.JWT_SECRET.length < 32
      ) {
        console.error('JWT secret configuration invalid');
        return c.json({ error: 'Token generation failed' }, 500);
      }
      jwtToken = await sign({ userId: user.id, email: user.email }, c.env.JWT_SECRET);
      if (!jwtToken || typeof jwtToken !== 'string' || jwtToken.length < 10) {
        throw new Error('Token generation failed');
      }
    } catch (error) {
      console.error('JWT token generation error during registration:', error);
      return c.json({ error: 'Token generation failed' }, 500);
    }

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
    let requestData;
    try {
      requestData = await c.req.json();
    } catch (error) {
      console.error('JSON parsing error during login:', error);
      return c.json({ error: 'Invalid request format' }, 400);
    }

    const { email, password } = requestData;

    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    // Validate input types and lengths
    if (
      typeof email !== 'string' ||
      email.length > 254 ||
      typeof password !== 'string' ||
      password.length > 128
    ) {
      return c.json({ error: 'Invalid input format or length' }, 400);
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();

    // Generate dummy salt before user lookup for timing attack protection
    const dummySalt = generateSalt();

    // Find user with timing attack protection
    let user;
    try {
      user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ? AND provider = ?')
        .bind(sanitizedEmail, 'email')
        .first<User>();
    } catch (error) {
      console.error('Database error during login:', {
        error: error instanceof Error ? error.message.substring(0, 100) : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      return c.json({ error: 'Login failed' }, 500);
    }

    // Hash password using PBKDF2 with user's salt for comparison
    let hashedPasswordStr;
    try {
      const saltToUse =
        user?.salt && typeof user.salt === 'string' && user.salt.length >= 64
          ? user.salt
          : dummySalt;
      hashedPasswordStr = await hashPassword(password, saltToUse);

      if (!user?.salt || typeof user.salt !== 'string' || user.salt.length < 64) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }
    } catch (error) {
      console.error('Password hashing error during login:', {
        error: error instanceof Error ? error.message.substring(0, 100) : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      return c.json({ error: 'Login failed' }, 500);
    }

    // Always perform hash comparison to prevent timing attacks
    const dummyHash = hashedPasswordStr.replace(/./g, '0');
    const userHash = user?.password_hash || dummyHash;
    // Perform constant-time comparison regardless of user existence
    const hashMatches = constantTimeEquals(userHash, hashedPasswordStr);
    const isValidUser = user && typeof userHash === 'string' && userHash.length > 0 && hashMatches;

    if (!isValidUser) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Validate user data for JWT
    if (!user.id || !user.email || typeof user.id !== 'string' || typeof user.email !== 'string') {
      return c.json({ error: 'Invalid user data' }, 500);
    }

    // Generate tokens
    let accessToken, refreshToken;
    try {
      const tokens = await generateTokens(c, user.id, user.email);
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
    } catch (error) {
      console.error('Token generation error during login:', {
        error: error instanceof Error ? error.message.substring(0, 100) : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      return c.json({ error: 'Token generation failed' }, 500);
    }

    // Validate and sanitize response data
    const responseUser = {
      id: user.id,
      email: user.email,
      name:
        typeof user.name === 'string'
          ? user.name.replace(/[<>"'&\x00-\x1f\x7f-\x9f]/g, '').substring(0, 100)
          : '',
      avatar_url: typeof user.avatar_url === 'string' ? user.avatar_url.substring(0, 500) : null,
      provider: user.provider,
      email_verified: !!user.email_verified,
    };

    return c.json({
      user: responseUser,
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error && error.message.includes('JWT')) {
      return c.json({ error: 'Token generation failed' }, 500);
    }
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Verify token
authRouter.get('/verify', async c => {
  try {
    const authHeader = c.req.header('Authorization');
    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ') ||
      authHeader.length > 1050
    ) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.substring(7);

    if (token.length < 10 || token.length > 1000) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Safe character validation without regex
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      if (
        !(
          (char >= 48 && char <= 57) || // 0-9
          (char >= 65 && char <= 90) || // A-Z
          (char >= 97 && char <= 122) || // a-z
          char === 46 ||
          char === 95 ||
          char === 45 // . _ -
        )
      ) {
        return c.json({ error: 'Invalid token' }, 401);
      }
    }

    let payload;
    try {
      if (
        !c.env.JWT_SECRET ||
        typeof c.env.JWT_SECRET !== 'string' ||
        c.env.JWT_SECRET.length < 32
      ) {
        throw new Error('Invalid JWT secret configuration');
      }
      payload = await verify(token, c.env.JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error);
      return c.json({ error: 'Invalid token' }, 401);
    }

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      payload.sub.length === 0 ||
      payload.sub.length > 100 ||
      payload.email.length === 0 ||
      payload.email.length > 254 ||
      !isValidEmail(payload.email)
    ) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    let user;
    try {
      // Safe UUID validation
      if (
        payload.sub.length !== 36 ||
        payload.sub[8] !== '-' ||
        payload.sub[13] !== '-' ||
        payload.sub[18] !== '-' ||
        payload.sub[23] !== '-'
      ) {
        throw new Error('Invalid user ID format');
      }
      for (let i = 0; i < payload.sub.length; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) continue;
        const char = payload.sub.charCodeAt(i);
        if (
          !(
            (char >= 48 && char <= 57) || // 0-9
            (char >= 65 && char <= 70) || // A-F
            (char >= 97 && char <= 102) // a-f
          )
        ) {
          throw new Error('Invalid user ID format');
        }
      }
      user = await c.env.DB.prepare(
        'SELECT id, email, name, avatar_url, provider FROM users WHERE id = ?'
      )
        .bind(payload.sub)
        .first();
    } catch (error) {
      console.error('Database error during token verification:', error);
      return c.json({ error: 'Invalid token' }, 401);
    }

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Validate user data before returning
    if (
      !user.id ||
      !user.email ||
      typeof user.id !== 'string' ||
      typeof user.email !== 'string' ||
      user.id.length === 0 ||
      user.email.length === 0
    ) {
      return c.json({ error: 'Invalid user data' }, 500);
    }

    // Validate response data
    if (!user.provider || typeof user.provider !== 'string') {
      return c.json({ error: 'Invalid user data' }, 500);
    }

    const responseUser = {
      id: user.id,
      email: user.email,
      name:
        typeof user.name === 'string'
          ? user.name.replace(/[<>"'&\x00-\x1f\x7f-\x9f]/g, '').substring(0, 100)
          : '',
      avatar_url: typeof user.avatar_url === 'string' ? user.avatar_url.substring(0, 500) : null,
      provider: user.provider,
    };

    return c.json({ user: responseUser });
  } catch (error) {
    console.error('Token verification error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Email Verification
authRouter.post('/verify-email', async c => {
  try {
    let requestData;
    try {
      requestData = await c.req.json();
    } catch (error) {
      console.error('JSON parsing error during email verification:', error);
      return c.json({ error: 'Invalid request format' }, 400);
    }

    const { token } = requestData;

    if (!token || typeof token !== 'string' || token.length < 10 || token.length > 100) {
      return c.json({ error: 'Invalid verification token' }, 400);
    }

    // Safe character validation
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      if (
        !(
          (char >= 48 && char <= 57) || // 0-9
          (char >= 65 && char <= 90) || // A-Z
          (char >= 97 && char <= 122) || // a-z
          char === 45 // -
        )
      ) {
        return c.json({ error: 'Invalid verification token' }, 400);
      }
    }

    // Find user by verification token
    let user;
    try {
      user = await c.env.DB.prepare(
        `
        SELECT * FROM users 
        WHERE email_verification_token = ? 
        AND email_verification_expires_at > datetime('now')
      `
      )
        .bind(token)
        .first();
    } catch (error) {
      console.error('Database error during email verification lookup:', error);
      return c.json({ error: 'Verification failed' }, 500);
    }

    if (!user) {
      return c.json({ error: 'Invalid or expired verification token' }, 400);
    }

    // Validate user data
    if (
      !user.id ||
      !user.email_verification_token ||
      typeof user.id !== 'string' ||
      typeof user.email_verification_token !== 'string' ||
      user.id.length === 0 ||
      user.email_verification_token.length === 0
    ) {
      return c.json({ error: 'Invalid user data' }, 500);
    }

    // Mark email as verified
    try {
      const result = await c.env.DB.prepare(
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

      if (!result || !result.success) {
        throw new Error('No rows updated');
      }
    } catch (error) {
      console.error('Database error during email verification:', error);
      return c.json({ error: 'Verification failed' }, 500);
    }

    return c.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return c.json({ error: 'Verification failed' }, 500);
  }
});

// Refresh token endpoint
authRouter.post('/refresh', async c => {
  try {
    let requestData;
    try {
      requestData = await c.req.json();
    } catch (error) {
      console.error('JSON parsing error during refresh:', error);
      return c.json({ error: 'Invalid request format' }, 400);
    }

    const { refreshToken } = requestData;

    if (
      !refreshToken ||
      typeof refreshToken !== 'string' ||
      refreshToken.length === 0 ||
      refreshToken.length > 500 ||
      refreshToken.length < 10
    ) {
      return c.json({ error: 'Invalid refresh token' }, 400);
    }

    // Verify refresh token with proper parsing
    let tokenData;
    let userId;
    try {
      // Safe character validation for refresh token
      for (let i = 0; i < refreshToken.length; i++) {
        const char = refreshToken.charCodeAt(i);
        if (
          !(
            (char >= 48 && char <= 57) || // 0-9
            (char >= 65 && char <= 90) || // A-Z
            (char >= 97 && char <= 122) || // a-z
            char === 46 ||
            char === 95 ||
            char === 45 // ._-
          )
        ) {
          throw new Error('Invalid refresh token format');
        }
      }
      const tokenString = await c.env.CACHE.get(`refresh_token:${refreshToken}`);
      if (!tokenString) {
        throw new Error('Token not found');
      }
      tokenData = JSON.parse(tokenString);
      userId = tokenData.userId;
    } catch (error) {
      console.error('Cache error during refresh token validation:', error);
      return c.json({ error: 'Failed to refresh token' }, 500);
    }

    if (!userId || typeof userId !== 'string' || userId.length === 0 || userId.length > 100) {
      return c.json(
        {
          error: 'Invalid or expired refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        },
        401
      );
    }

    // Get user from database
    let user;
    try {
      // Safe character validation for user ID
      for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i);
        if (
          !(
            (char >= 48 && char <= 57) || // 0-9
            (char >= 65 && char <= 90) || // A-Z
            (char >= 97 && char <= 122) || // a-z
            char === 45 // -
          )
        ) {
          throw new Error('Invalid user ID format');
        }
      }
      user = await c.env.DB.prepare(
        'SELECT id, email, name, avatar_url, provider, email_verified FROM users WHERE id = ?'
      )
        .bind(userId)
        .first<User>();
    } catch (error) {
      console.error('Database error during refresh token validation:', error);
      return c.json({ error: 'Failed to refresh token' }, 500);
    }

    if (!user) {
      // Clean up invalid refresh token
      try {
        await c.env.CACHE.delete(`refresh_token:${refreshToken}`);
      } catch {
        console.error('Cache cleanup error');
      }
      return c.json({ error: 'User not found' }, 404);
    }

    // Validate user data
    if (
      !user.id ||
      !user.email ||
      !user.provider ||
      typeof user.id !== 'string' ||
      typeof user.email !== 'string' ||
      typeof user.provider !== 'string' ||
      user.id.length === 0 ||
      user.email.length === 0 ||
      user.provider.length === 0
    ) {
      return c.json({ error: 'Invalid user data' }, 500);
    }

    // Generate new tokens
    let newAccessToken, newRefreshToken;
    try {
      const tokens = await generateTokens(c, user.id, user.email);
      newAccessToken = tokens.accessToken;
      newRefreshToken = tokens.refreshToken;
    } catch (error) {
      console.error('Token generation error during refresh:', error);
      return c.json({ error: 'Failed to refresh token' }, 500);
    }

    // Delete old refresh token
    try {
      await c.env.CACHE.delete(`refresh_token:${refreshToken}`);
    } catch (error) {
      console.error('Cache delete error during refresh:', error);
    }

    // Validate response data
    const responseUser = {
      id: user.id,
      email: user.email,
      name:
        typeof user.name === 'string'
          ? user.name.replace(/[<>"'&\x00-\x1f\x7f-\x9f]/g, '').substring(0, 100)
          : '',
      avatar_url: typeof user.avatar_url === 'string' ? user.avatar_url.substring(0, 500) : null,
      provider: user.provider,
      email_verified: !!user.email_verified,
    };

    return c.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: responseUser,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return c.json({ error: 'Failed to refresh token' }, 500);
  }
});

// Logout endpoint
authRouter.post('/logout', async c => {
  try {
    let requestData;
    try {
      requestData = await c.req.json();
    } catch {
      // Ignore JSON parsing errors for logout - always succeed
      return c.json({ message: 'Logged out successfully' });
    }

    const { refreshToken } = requestData;

    if (refreshToken && typeof refreshToken === 'string') {
      try {
        await c.env.CACHE.delete(`refresh_token:${refreshToken}`);
      } catch (error) {
        console.error('Cache delete error during logout:', error);
      }
    }

    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    // Always return success for logout to prevent information disclosure
    return c.json({ message: 'Logged out successfully' });
  }
});

export default authRouter;
