/**
 * User Routes
 * User progress, favorites, and profile management
 */

import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import type { Env } from '../env';

type Variables = {
  userId: string;
};

const userRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware to verify JWT
userRouter.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set('userId', payload.userId as string);
    return await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Get user progress
userRouter.get('/progress', async c => {
  try {
    const userId = c.get('userId');

    const progress = await c.env.DB.prepare(
      `
      SELECT model_id, completed_at
      FROM user_progress
      WHERE user_id = ?
      ORDER BY completed_at DESC
    `
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
    const { modelId } = await c.req.json();

    if (!modelId) {
      return c.json({ error: 'Model ID required' }, 400);
    }

    // Check if already completed
    const existing = await c.env.DB.prepare(
      'SELECT id FROM user_progress WHERE user_id = ? AND model_id = ?'
    )
      .bind(userId, modelId)
      .first();

    if (existing) {
      return c.json({ error: 'Model already completed' }, 409);
    }

    // Add to progress
    const progressId = crypto.randomUUID();
    await c.env.DB.prepare(
      `
      INSERT INTO user_progress (id, user_id, model_id)
      VALUES (?, ?, ?)
    `
    )
      .bind(progressId, userId, modelId)
      .run();

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
    const modelId = c.req.param('modelId');

    const result = await c.env.DB.prepare(
      'DELETE FROM user_progress WHERE user_id = ? AND model_id = ?'
    )
      .bind(userId, modelId)
      .run();

    if (result.meta.changes === 0) {
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

    const favorites = await c.env.DB.prepare(
      `
      SELECT model_id, created_at
      FROM user_favorites
      WHERE user_id = ?
      ORDER BY created_at DESC
    `
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
    const { modelId } = await c.req.json();

    if (!modelId) {
      return c.json({ error: 'Model ID required' }, 400);
    }

    // Check if already favorited
    const existing = await c.env.DB.prepare(
      'SELECT id FROM user_favorites WHERE user_id = ? AND model_id = ?'
    )
      .bind(userId, modelId)
      .first();

    if (existing) {
      return c.json({ error: 'Model already favorited' }, 409);
    }

    // Add to favorites
    const favoriteId = crypto.randomUUID();
    await c.env.DB.prepare(
      `
      INSERT INTO user_favorites (id, user_id, model_id)
      VALUES (?, ?, ?)
    `
    )
      .bind(favoriteId, userId, modelId)
      .run();

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
    const modelId = c.req.param('modelId');

    const result = await c.env.DB.prepare(
      'DELETE FROM user_favorites WHERE user_id = ? AND model_id = ?'
    )
      .bind(userId, modelId)
      .run();

    if (result.meta.changes === 0) {
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

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, avatar_url, provider, created_at FROM users WHERE id = ?'
    )
      .bind(userId)
      .first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get stats
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

    return c.json({
      user,
      stats: {
        completedModels: progressCount?.count || 0,
        favoriteModels: favoritesCount?.count || 0,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

export { userRouter };
