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
  password_hash?: string;
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

// Constant-time string comparison to prevent timing attacks
const constantTimeEquals = (a: string, b: string): boolean => {
  const maxLen = Math.max(a.length, b.length);
  const aPadded = a.padEnd(maxLen, '\0');
  const bPadded = b.padEnd(maxLen, '\0');
  let result = 0;
  for (let i = 0; i < maxLen; i++) {
    result |= aPadded.charCodeAt(i) ^ bPadded.charCodeAt(i);
  }
  return result === 0 && a.length === b.length;
};

// Password hashing utility function
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
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );

  const hashArray = Array.from(new Uint8Array(hashedPassword));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Helper function to generate tokens
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

  // Generate access token with expiration
  const accessToken = await sign(
    {
      userId,
      email,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY,
    },
    c.env.JWT_SECRET
  );

  // Validate access token
  if (!accessToken || typeof accessToken !== 'string' || accessToken.length < 10) {
    throw new Error('Invalid access token generated');
  }

  // Generate refresh token
  const refreshToken = crypto.randomUUID();
  if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.length < 10) {
    throw new Error('Invalid refresh token generated');
  }

  // Store refresh token in KV with expiration
  try {
    await c.env.CACHE.put(`refresh_token:${refreshToken}`, userId, {
      expirationTtl: REFRESH_TOKEN_EXPIRY,
    });
  } catch (error) {
    throw new Error('Failed to store refresh token');
  }

  return { accessToken, refreshToken };
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

    if (
      !token ||
      typeof token !== 'string' ||
      token.length < 10 ||
      token.length > 2048 ||
      !/^[A-Za-z0-9._/+=\-]+$/.test(token)
    ) {
      return c.json({ error: 'Invalid Google token format' }, 400);
    }

    // Verify Google token
    const googleResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${encodeURIComponent(token)}`
    );
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
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(googleUser.email)
    ) {
      return c.json({ error: 'Invalid Google user data' }, 400);
    }

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
    let requestData;
    try {
      requestData = await c.req.json();
    } catch (error) {
      console.error('JSON parsing error during GitHub auth:', error);
      return c.json({ error: 'Invalid request format' }, 400);
    }

    const { code } = requestData;

    if (
      !code ||
      typeof code !== 'string' ||
      code.length < 10 ||
      code.length > 1000 ||
      !/^[A-Za-z0-9_-]+$/.test(code)
    ) {
      return c.json({ error: 'Invalid authorization code format' }, 400);
    }

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
      tokenData.access_token.length > 255 ||
      !/^[A-Za-z0-9._-]+$/.test(tokenData.access_token)
    ) {
      return c.json({ error: 'Invalid GitHub access token' }, 400);
    }

    // Get user info with timeout and validation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let userResponse;
    try {
      userResponse = await fetch('https://api.github.com/user', {
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
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(githubUser.email))) ||
      (githubUser.name &&
        (typeof githubUser.name !== 'string' ||
          githubUser.name.length > 100 ||
          githubUser.name.length === 0 ||
          !/^[a-zA-Z0-9\s\-_.@]+$/.test(githubUser.name))) ||
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
          githubUser.email || `${githubUser.id}@example.com`,
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
      const userId = crypto.randomUUID();
      if (!userId || typeof userId !== 'string' || userId.length !== 36) {
        console.error('Invalid UUID generated for GitHub user');
        return c.json({ error: 'Authentication failed' }, 500);
      }

      const userEmail = githubUser.email || `${githubUser.id}@example.com`;
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    // Enhanced password strength validation
    if (password.length < 8 || password.length > 128) {
      return c.json({ error: 'Password must be between 8 and 128 characters' }, 400);
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return c.json(
        { error: 'Password must contain lowercase, uppercase, and numeric characters' },
        400
      );
    }
    if (
      /^(..)\1+$/.test(password) ||
      /012|123|234|345|456|567|678|789|890|abc|bcd|cde|def/.test(password.toLowerCase())
    ) {
      return c.json({ error: 'Password cannot contain sequential or repeated patterns' }, 400);
    }
    if (/password|123456|qwerty|admin|login|user/i.test(password)) {
      return c.json({ error: 'Password cannot contain common words' }, 400);
    }
    if (password.toLowerCase().includes(sanitizedEmail.split('@')[0].toLowerCase())) {
      return c.json({ error: 'Password cannot contain parts of your email' }, 400);
    }

    // Enhanced name validation
    if (sanitizedName.length === 0 || sanitizedName.length > 100) {
      return c.json({ error: 'Name must be between 1 and 100 characters' }, 400);
    }
    if (!/^[a-zA-Z0-9\s\-_.]+$/.test(sanitizedName)) {
      return c.json(
        {
          error:
            'Name can only contain letters, numbers, spaces, hyphens, underscores, and periods',
        },
        400
      );
    }
    if (/^[\s\-_.]+$/.test(sanitizedName) || /\s{2,}/.test(sanitizedName)) {
      return c.json(
        { error: 'Name cannot be only special characters or contain multiple consecutive spaces' },
        400
      );
    }
    if (/admin|root|system|null|undefined|test/i.test(sanitizedName)) {
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

    // Hash password using PBKDF2 for better security
    let hashedPasswordStr;
    try {
      if (
        !c.env.PASSWORD_SALT ||
        typeof c.env.PASSWORD_SALT !== 'string' ||
        c.env.PASSWORD_SALT.length < 16
      ) {
        throw new Error('Invalid password salt configuration');
      }
      hashedPasswordStr = await hashPassword(password, c.env.PASSWORD_SALT);
      if (!hashedPasswordStr || hashedPasswordStr.length !== 64) {
        throw new Error('Invalid password hash generated');
      }
    } catch (error) {
      console.error('Password hashing error during registration:', error);
      return c.json({ error: 'Registration failed' }, 500);
    }

    // Create user
    let userId, verificationToken;
    try {
      userId = crypto.randomUUID();
      verificationToken = crypto.randomUUID();
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
          id, email, name, provider, provider_id, password_hash,
          email_verified, email_verification_token, email_verification_expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          userId,
          sanitizedEmail,
          sanitizedName,
          'email',
          userId,
          hashedPasswordStr,
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

    // Hash password using PBKDF2 for comparison
    let hashedPasswordStr;
    try {
      if (
        !c.env.PASSWORD_SALT ||
        typeof c.env.PASSWORD_SALT !== 'string' ||
        c.env.PASSWORD_SALT.length < 16
      ) {
        throw new Error('Invalid password salt configuration');
      }
      hashedPasswordStr = await hashPassword(password, c.env.PASSWORD_SALT);
    } catch (error) {
      console.error('Password hashing error during login:', error);
      return c.json({ error: 'Login failed' }, 500);
    }

    // Find user with timing attack protection
    let user;
    try {
      user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ? AND provider = ?')
        .bind(sanitizedEmail, 'email')
        .first();
    } catch (error) {
      console.error('Database error during login:', error);
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
      console.error('Token generation error during login:', error);
      return c.json({ error: 'Token generation failed' }, 500);
    }

    // Validate and sanitize response data
    const responseUser = {
      id: user.id,
      email: user.email,
      name: (user.name || '').replace(/[<>"'&]/g, ''),
      avatar_url: user.avatar_url || null,
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

    if (token.length < 10 || token.length > 1000 || !/^[A-Za-z0-9._-]+$/.test(token)) {
      return c.json({ error: 'Invalid token' }, 401);
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
      !payload.userId ||
      !payload.email ||
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      payload.userId.length === 0 ||
      payload.userId.length > 100 ||
      payload.email.length === 0 ||
      payload.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)
    ) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    let user;
    try {
      if (
        !/^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/.test(
          payload.userId
        )
      ) {
        throw new Error('Invalid user ID format');
      }
      user = await c.env.DB.prepare(
        'SELECT id, email, name, avatar_url, provider FROM users WHERE id = ?'
      )
        .bind(payload.userId)
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
      name: typeof user.name === 'string' ? user.name.substring(0, 100) : '',
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

    if (
      !token ||
      typeof token !== 'string' ||
      token.length < 10 ||
      token.length > 100 ||
      !/^[A-Za-z0-9-]+$/.test(token)
    ) {
      return c.json({ error: 'Invalid verification token' }, 400);
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

      if (!result || !result.success || result.changes === 0) {
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

    // Verify refresh token
    let userId;
    try {
      if (!/^[A-Za-z0-9._\-]+$/.test(refreshToken)) {
        throw new Error('Invalid refresh token format');
      }
      userId = await c.env.CACHE.get(`refresh_token:${refreshToken}`);
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
      if (!/^[A-Za-z0-9-]+$/.test(userId)) {
        throw new Error('Invalid user ID format');
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
      name: typeof user.name === 'string' ? user.name.substring(0, 100) : '',
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
    } catch (error) {
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
