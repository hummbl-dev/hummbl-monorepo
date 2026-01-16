// @ts-nocheck
/**
 * User Routes with Circuit Breaker Protection
 * User progress, favorites, and profile management
 */

import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import type { Env } from '../env';
import { createLogger, logError } from '@hummbl/core';
import { createProtectedDatabase, ProtectedDatabase } from '../lib/db-wrapper';
import type { DbOperationContext } from '../lib/db-wrapper';

// Create logger instance for user routes
const logger = createLogger('user-routes');

declare const crypto: {
  randomUUID: () => string;
};

type Variables = {
  userId: string;
};

const userRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// Create protected database wrapper
const getProtectedDb = (env: Env) => createProtectedDatabase(env.DB);

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
      payload = await verify(token, c.env.JWT_SECRET, 'HS256');
    } catch (error) {
      logError(error, { context: 'user-jwt-verification', timestamp: new Date().toISOString() });
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
    logError(error, { context: 'user-auth-middleware', timestamp: new Date().toISOString() });
    return c.json({ error: 'Authentication failed' }, 401);
  }
});

// Get user progress
userRouter.get('/progress', async c => {
  try {
    const userId = c.get('userId');

    try {
      const protectedDb = getProtectedDb(c.env);
      const context: DbOperationContext = {
        operation: 'read',
        table: 'user_progress',
        query: 'SELECT model_id, completed_at FROM user_progress WHERE user_id = ?',
      };

      const progress = await protectedDb
        .prepare(
          `
        SELECT model_id, completed_at
        FROM user_progress
        WHERE user_id = ?
        ORDER BY completed_at DESC
      `,
          context
        )
        .bind(userId)
        .all();

      return c.json({ progress: progress.results });
    } catch (error) {
      // Handle circuit breaker errors with fallback
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        logger.warn('Circuit breaker active for progress', {
          context: 'user-progress-circuit-breaker',
          state: error.circuitState,
          userId: userId.substring(0, 8) + '...',
          timestamp: new Date().toISOString(),
        });
        return c.json({ progress: [] }); // Empty fallback
      }
      throw error;
    }
  } catch (error) {
    logError(error, { context: 'user-get-progress', timestamp: new Date().toISOString() });
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
      logError(error, {
        context: 'user-progress-json-parsing',
        timestamp: new Date().toISOString(),
      });
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
      const protectedDb = getProtectedDb(c.env);
      modelExists = await protectedDb
        .prepare('SELECT code FROM mental_models WHERE code = ?', {
          operation: 'read',
          table: 'mental_models',
        })
        .bind(modelId)
        .first();
    } catch (error) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        logger.warn('Circuit breaker active for model validation', {
          context: 'user-model-validation-circuit-breaker',
          state: error.circuitState,
          modelId,
          timestamp: new Date().toISOString(),
        });
        return c.json({ error: 'Service temporarily unavailable' }, 503);
      }
      logError(error, { context: 'user-model-validation-db', timestamp: new Date().toISOString() });
      return c.json({ error: 'Failed to validate model' }, 500);
    }

    if (!modelExists) {
      return c.json({ error: 'Model not found' }, 404);
    }

    // Check if already completed
    let existing;
    try {
      const protectedDb = getProtectedDb(c.env);
      existing = await protectedDb
        .prepare('SELECT id FROM user_progress WHERE user_id = ? AND model_id = ?', {
          operation: 'read',
          table: 'user_progress',
        })
        .bind(userId, modelId)
        .first();
    } catch (error) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        return c.json({ error: 'Service temporarily unavailable' }, 503);
      }
      logError(error, { context: 'user-progress-check-db', timestamp: new Date().toISOString() });
      return c.json({ error: 'Failed to check progress' }, 500);
    }

    if (existing) {
      return c.json({ error: 'Model already completed' }, 409);
    }

    // Add to progress
    const progressId = crypto.randomUUID();
    try {
      const protectedDb = getProtectedDb(c.env);
      const result = await protectedDb
        .prepare('INSERT INTO user_progress (id, user_id, model_id) VALUES (?, ?, ?)', {
          operation: 'write',
          table: 'user_progress',
        })
        .bind(progressId, userId, modelId)
        .run();

      if (!result || !result.success) {
        throw new Error('Insert failed');
      }
    } catch (error) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        return c.json({ error: 'Write operations temporarily unavailable' }, 503);
      }
      logError(error, { context: 'user-progress-add-db', timestamp: new Date().toISOString() });
      return c.json({ error: 'Failed to add progress' }, 500);
    }

    return c.json({ success: true, progressId });
  } catch (error) {
    logError(error, { context: 'user-add-progress', timestamp: new Date().toISOString() });
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
      const protectedDb = getProtectedDb(c.env);
      result = await protectedDb
        .prepare('DELETE FROM user_progress WHERE user_id = ? AND model_id = ?', {
          operation: 'write',
          table: 'user_progress',
        })
        .bind(userId, rawModelId)
        .run();
    } catch (error) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        return c.json({ error: 'Write operations temporarily unavailable' }, 503);
      }
      logError(error, { context: 'user-progress-delete-db', timestamp: new Date().toISOString() });
      return c.json({ error: 'Failed to remove progress' }, 500);
    }

    if (!result || result.meta.changes === 0) {
      return c.json({ error: 'Progress not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    logError(error, { context: 'user-remove-progress', timestamp: new Date().toISOString() });
    return c.json({ error: 'Failed to remove progress' }, 500);
  }
});

// Get user favorites
userRouter.get('/favorites', async c => {
  try {
    const userId = c.get('userId');

    try {
      const protectedDb = getProtectedDb(c.env);
      const favorites = await protectedDb
        .prepare(
          `
        SELECT model_id, created_at
        FROM user_favorites
        WHERE user_id = ?
        ORDER BY created_at DESC
      `,
          {
            operation: 'read',
            table: 'user_favorites',
          }
        )
        .bind(userId)
        .all();

      return c.json({ favorites: favorites.results });
    } catch (error) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        logger.warn('Circuit breaker active for favorites', {
          context: 'user-favorites-circuit-breaker',
          state: error.circuitState,
          userId: userId.substring(0, 8) + '...',
          timestamp: new Date().toISOString(),
        });
        return c.json({ favorites: [] }); // Empty fallback
      }
      throw error;
    }
  } catch (error) {
    logError(error, { context: 'user-get-favorites', timestamp: new Date().toISOString() });
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
      logError(error, {
        context: 'user-favorites-json-parsing',
        timestamp: new Date().toISOString(),
      });
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
      const protectedDb = getProtectedDb(c.env);
      modelExists = await protectedDb
        .prepare('SELECT code FROM mental_models WHERE code = ?', {
          operation: 'read',
          table: 'mental_models',
        })
        .bind(modelId)
        .first();
    } catch (error) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        return c.json({ error: 'Service temporarily unavailable' }, 503);
      }
      logError(error, {
        context: 'user-favorites-model-validation-db',
        timestamp: new Date().toISOString(),
      });
      return c.json({ error: 'Failed to validate model' }, 500);
    }

    if (!modelExists) {
      return c.json({ error: 'Model not found' }, 404);
    }

    // Check if already favorited
    let existing;
    try {
      const protectedDb = getProtectedDb(c.env);
      existing = await protectedDb
        .prepare('SELECT id FROM user_favorites WHERE user_id = ? AND model_id = ?', {
          operation: 'read',
          table: 'user_favorites',
        })
        .bind(userId, modelId)
        .first();
    } catch (error) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        return c.json({ error: 'Service temporarily unavailable' }, 503);
      }
      logError(error, { context: 'user-favorites-check-db', timestamp: new Date().toISOString() });
      return c.json({ error: 'Failed to check favorites' }, 500);
    }

    if (existing) {
      return c.json({ error: 'Model already favorited' }, 409);
    }

    // Add to favorites
    const favoriteId = crypto.randomUUID();
    try {
      const protectedDb = getProtectedDb(c.env);
      const result = await protectedDb
        .prepare('INSERT INTO user_favorites (id, user_id, model_id) VALUES (?, ?, ?)', {
          operation: 'write',
          table: 'user_favorites',
        })
        .bind(favoriteId, userId, modelId)
        .run();

      if (!result || !result.success) {
        throw new Error('Insert failed');
      }
    } catch (error) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        return c.json({ error: 'Write operations temporarily unavailable' }, 503);
      }
      logError(error, { context: 'user-favorites-add-db', timestamp: new Date().toISOString() });
      return c.json({ error: 'Failed to add favorite' }, 500);
    }

    return c.json({ success: true, favoriteId });
  } catch (error) {
    logError(error, { context: 'user-add-favorite', timestamp: new Date().toISOString() });
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
      const protectedDb = getProtectedDb(c.env);
      result = await protectedDb
        .prepare('DELETE FROM user_favorites WHERE user_id = ? AND model_id = ?', {
          operation: 'write',
          table: 'user_favorites',
        })
        .bind(userId, rawModelId)
        .run();
    } catch (error) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        return c.json({ error: 'Write operations temporarily unavailable' }, 503);
      }
      logError(error, { context: 'user-favorites-delete-db', timestamp: new Date().toISOString() });
      return c.json({ error: 'Failed to remove favorite' }, 500);
    }

    if (!result || result.meta.changes === 0) {
      return c.json({ error: 'Favorite not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    logError(error, { context: 'user-remove-favorite', timestamp: new Date().toISOString() });
    return c.json({ error: 'Failed to remove favorite' }, 500);
  }
});

// Get user profile
userRouter.get('/profile', async c => {
  try {
    const userId = c.get('userId');

    try {
      const protectedDb = getProtectedDb(c.env);

      const user = await protectedDb
        .prepare(
          'SELECT id, email, name, avatar_url, provider, created_at FROM users WHERE id = ?',
          {
            operation: 'read',
            table: 'users',
          }
        )
        .bind(userId)
        .first();

      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Get stats
      const progressCount = await protectedDb
        .prepare('SELECT COUNT(*) as count FROM user_progress WHERE user_id = ?', {
          operation: 'read',
          table: 'user_progress',
        })
        .bind(userId)
        .first();

      const favoritesCount = await protectedDb
        .prepare('SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?', {
          operation: 'read',
          table: 'user_favorites',
        })
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
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        logger.warn('Circuit breaker active for profile', {
          context: 'user-profile-circuit-breaker',
          state: error.circuitState,
          userId: userId.substring(0, 8) + '...',
          timestamp: new Date().toISOString(),
        });
        return c.json({
          user: null,
          stats: { completedModels: 0, favoriteModels: 0 },
          message: 'Profile temporarily unavailable',
        });
      }
      throw error;
    }
  } catch (error) {
    logError(error, { context: 'user-get-profile', timestamp: new Date().toISOString() });
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

export { userRouter };
