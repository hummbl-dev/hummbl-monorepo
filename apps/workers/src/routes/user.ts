/**
 * User Routes
 * User progress, favorites, and profile management
 */

import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import type { Env } from '../env';

declare const crypto: {
  randomUUID: () => string;
};

type Variables = {
  userId: string;
};

const userRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware to verify JWT
userRouter.use('*', async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const token = authHeader.substring(7);
    if (!token || token.length === 0 || token.length > 1000) {
      return c.json({ error: 'Invalid token format' }, 401);
    }

    let payload;
    try {
      payload = await verify(token, c.env.JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error);
      return c.json({ error: 'Invalid token' }, 401);
    }

    if (
      !payload ||
      !payload.userId ||
      typeof payload.userId !== 'string' ||
      payload.userId.length === 0 ||
      payload.userId.length > 100 ||
      !/^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/.test(
        payload.userId
      )
    ) {
      return c.json({ error: 'Invalid token payload' }, 401);
    }

    c.set('userId', payload.userId);
    return await next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
});

// Get user progress
userRouter.get('/progress', async c => {
  try {
    const userId = c.get('userId');

    // Validate userId format
    if (
      !userId ||
      typeof userId !== 'string' ||
      userId.length !== 36 ||
      !/^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/.test(userId)
    ) {
      return c.json({ error: 'Invalid user ID' }, 400);
    }

    const progress = await c.env.DB.prepare(
      'SELECT model_id, completed_at FROM user_progress WHERE user_id = ? ORDER BY completed_at DESC'
    )
      .bind(userId)
      .all();

    return c.json({ progress: progress.results });
  } catch (error) {
    console.error('Get progress error:', error);
    return c.json({ error: 'Failed to get progress' }, 500);
  }
});

// Add model to progress
userRouter.post('/progress', async c => {
  try {
    const userId = c.get('userId');

    let requestData;
    try {
      requestData = await c.req.json();
    } catch (error) {
      console.error('JSON parsing error in add progress:', error);
      return c.json({ error: 'Invalid request format' }, 400);
    }

    const { modelId } = requestData;

    if (
      !modelId ||
      typeof modelId !== 'string' ||
      modelId.length === 0 ||
      modelId.length > 20 ||
      !/^[A-Z0-9]+$/.test(modelId)
    ) {
      return c.json({ error: 'Invalid model ID format' }, 400);
    }

    // Verify model exists
    let modelExists;
    try {
      modelExists = await c.env.DB.prepare('SELECT code FROM mental_models WHERE code = ?')
        .bind(modelId)
        .first();
    } catch (error) {
      console.error('Database error checking model existence:', error);
      return c.json({ error: 'Failed to validate model' }, 500);
    }

    if (!modelExists) {
      return c.json({ error: 'Model not found' }, 404);
    }

    // Check if already completed
    let existing;
    try {
      existing = await c.env.DB.prepare(
        'SELECT id FROM user_progress WHERE user_id = ? AND model_id = ?'
      )
        .bind(userId, modelId)
        .first();
    } catch (error) {
      console.error('Database error checking existing progress:', error);
      return c.json({ error: 'Failed to check progress' }, 500);
    }

    if (existing) {
      return c.json({ error: 'Model already completed' }, 409);
    }

    // Add to progress
    const progressId = crypto.randomUUID();
    try {
      const result = await c.env.DB.prepare(
        'INSERT INTO user_progress (id, user_id, model_id) VALUES (?, ?, ?)'
      )
        .bind(progressId, userId, modelId)
        .run();

      if (!result || !result.success) {
        throw new Error('Insert failed');
      }
    } catch (error) {
      console.error('Database error adding progress:', error);
      return c.json({ error: 'Failed to add progress' }, 500);
    }

    return c.json({ success: true, progressId });
  } catch (error) {
    console.error('Add progress error:', error);
    return c.json({ error: 'Failed to add progress' }, 500);
  }
});

// Remove model from progress
userRouter.delete('/progress/:modelId', async c => {
  try {
    const userId = c.get('userId');
    const rawModelId = c.req.param('modelId');

    if (
      !rawModelId ||
      typeof rawModelId !== 'string' ||
      rawModelId.length === 0 ||
      rawModelId.length > 20 ||
      !/^[A-Z0-9]+$/.test(rawModelId)
    ) {
      return c.json({ error: 'Invalid model ID format' }, 400);
    }

    let result;
    try {
      result = await c.env.DB.prepare(
        'DELETE FROM user_progress WHERE user_id = ? AND model_id = ?'
      )
        .bind(userId, rawModelId)
        .run();
    } catch (error) {
      console.error('Database error removing progress:', error);
      return c.json({ error: 'Failed to remove progress' }, 500);
    }

    if (!result || result.meta.changes === 0) {
      return c.json({ error: 'Progress not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Remove progress error:', error);
    return c.json({ error: 'Failed to remove progress' }, 500);
  }
});

// Get user favorites
userRouter.get('/favorites', async c => {
  try {
    const userId = c.get('userId');

    // Validate userId format
    if (
      !userId ||
      typeof userId !== 'string' ||
      userId.length !== 36 ||
      !/^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/.test(userId)
    ) {
      return c.json({ error: 'Invalid user ID' }, 400);
    }

    const favorites = await c.env.DB.prepare(
      'SELECT model_id, created_at FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC'
    )
      .bind(userId)
      .all();

    return c.json({ favorites: favorites.results });
  } catch (error) {
    console.error('Get favorites error:', error);
    return c.json({ error: 'Failed to get favorites' }, 500);
  }
});

// Add model to favorites
userRouter.post('/favorites', async c => {
  try {
    const userId = c.get('userId');

    let requestData;
    try {
      requestData = await c.req.json();
    } catch (error) {
      console.error('JSON parsing error in add favorite:', error);
      return c.json({ error: 'Invalid request format' }, 400);
    }

    const { modelId } = requestData;

    if (
      !modelId ||
      typeof modelId !== 'string' ||
      modelId.length === 0 ||
      modelId.length > 20 ||
      !/^[A-Z0-9]+$/.test(modelId)
    ) {
      return c.json({ error: 'Invalid model ID format' }, 400);
    }

    // Verify model exists
    let modelExists;
    try {
      modelExists = await c.env.DB.prepare('SELECT code FROM mental_models WHERE code = ?')
        .bind(modelId)
        .first();
    } catch (error) {
      console.error('Database error checking model existence:', error);
      return c.json({ error: 'Failed to validate model' }, 500);
    }

    if (!modelExists) {
      return c.json({ error: 'Model not found' }, 404);
    }

    // Check if already favorited
    let existing;
    try {
      existing = await c.env.DB.prepare(
        'SELECT id FROM user_favorites WHERE user_id = ? AND model_id = ?'
      )
        .bind(userId, modelId)
        .first();
    } catch (error) {
      console.error('Database error checking existing favorite:', error);
      return c.json({ error: 'Failed to check favorites' }, 500);
    }

    if (existing) {
      return c.json({ error: 'Model already favorited' }, 409);
    }

    // Add to favorites
    const favoriteId = crypto.randomUUID();
    try {
      const result = await c.env.DB.prepare(
        'INSERT INTO user_favorites (id, user_id, model_id) VALUES (?, ?, ?)'
      )
        .bind(favoriteId, userId, modelId)
        .run();

      if (!result || !result.success) {
        throw new Error('Insert failed');
      }
    } catch (error) {
      console.error('Database error adding favorite:', error);
      return c.json({ error: 'Failed to add favorite' }, 500);
    }

    return c.json({ success: true, favoriteId });
  } catch (error) {
    console.error('Add favorite error:', error);
    return c.json({ error: 'Failed to add favorite' }, 500);
  }
});

// Remove model from favorites
userRouter.delete('/favorites/:modelId', async c => {
  try {
    const userId = c.get('userId');
    const rawModelId = c.req.param('modelId');

    if (
      !rawModelId ||
      typeof rawModelId !== 'string' ||
      rawModelId.length === 0 ||
      rawModelId.length > 20 ||
      !/^[A-Z0-9]+$/.test(rawModelId)
    ) {
      return c.json({ error: 'Invalid model ID format' }, 400);
    }

    let result;
    try {
      result = await c.env.DB.prepare(
        'DELETE FROM user_favorites WHERE user_id = ? AND model_id = ?'
      )
        .bind(userId, rawModelId)
        .run();
    } catch (error) {
      console.error('Database error removing favorite:', error);
      return c.json({ error: 'Failed to remove favorite' }, 500);
    }

    if (!result || result.meta.changes === 0) {
      return c.json({ error: 'Favorite not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return c.json({ error: 'Failed to remove favorite' }, 500);
  }
});

// Get user profile
userRouter.get('/profile', async c => {
  try {
    const userId = c.get('userId');

    // Validate userId format
    if (
      !userId ||
      typeof userId !== 'string' ||
      userId.length !== 36 ||
      !/^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/.test(userId)
    ) {
      return c.json({ error: 'Invalid user ID' }, 400);
    }

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, avatar_url, provider, created_at FROM users WHERE id = ?'
    )
      .bind(userId)
      .first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get stats with validated queries
    const progressCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM user_progress WHERE user_id = ?'
    )
      .bind(userId)
      .first();

    const favoritesCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?'
    )
      .bind(userId)
      .first();

    // Sanitize response data
    const sanitizedUser = {
      id: user.id,
      email: typeof user.email === 'string' ? user.email.substring(0, 254) : '',
      name: typeof user.name === 'string' ? user.name.substring(0, 100) : '',
      avatar_url: typeof user.avatar_url === 'string' ? user.avatar_url.substring(0, 500) : null,
      provider: user.provider,
      created_at: user.created_at,
    };

    return c.json({
      user: sanitizedUser,
      stats: {
        completedModels: Math.max(0, Number(progressCount?.count) || 0),
        favoriteModels: Math.max(0, Number(favoritesCount?.count) || 0),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

export { userRouter };
