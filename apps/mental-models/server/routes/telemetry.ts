// Telemetry Routes
// Model routing data collection and analytics

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/authGuard';
import path from 'path';

const router = Router();

interface TelemetryEvent {
  taskId: string;
  userId?: string;
  sessionId?: string;
  event: 'task_classified' | 'model_selected' | 'request_completed' | 'error_occurred';
  timestamp: string;
  data: {
    // Task classification data
    input?: string;
    taskType?: string;
    confidence?: number;

    // Model selection data
    selectedModel?: string;
    modelClass?: 'execution' | 'reasoning' | 'creative';
    routingReason?: string;

    // Performance data
    latency?: number;
    tokensUsed?: number;
    cost?: number;

    // Error data
    error?: string;
    errorCode?: string;

    // Context data
    userAgent?: string;
    platform?: string;
    features?: string[];
  };
}

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'data', 'telemetry.db');
let db: Database.Database;

try {
  // Ensure data directory exists
  const fs = require('fs');
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);

  // Create telemetry table
  db.exec(`
    CREATE TABLE IF NOT EXISTS telemetry_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      user_id TEXT,
      session_id TEXT,
      event TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_task_id ON telemetry_events(task_id);
    CREATE INDEX IF NOT EXISTS idx_user_id ON telemetry_events(user_id);
    CREATE INDEX IF NOT EXISTS idx_event ON telemetry_events(event);
    CREATE INDEX IF NOT EXISTS idx_timestamp ON telemetry_events(timestamp);
  `);

  logger.info('Telemetry database initialized', { dbPath });
} catch (error) {
  logger.error('Failed to initialize telemetry database', error as Error);
}

// POST /api/telemetry/event - Record telemetry event
router.post('/event', (req: AuthenticatedRequest, res: Response) => {
  try {
    const event: TelemetryEvent = req.body;

    // Validate required fields
    if (!event.taskId || !event.event || !event.timestamp) {
      return res.status(400).json({
        error: 'Invalid telemetry event',
        message: 'taskId, event, and timestamp are required',
      });
    }

    // Add user ID if authenticated
    if (req.user) {
      event.userId = req.user.id;
    }

    // Store in database
    if (db) {
      const stmt = db.prepare(`
        INSERT INTO telemetry_events (task_id, user_id, session_id, event, timestamp, data)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        event.taskId,
        event.userId || null,
        event.sessionId || null,
        event.event,
        event.timestamp,
        JSON.stringify(event.data)
      );
    }

    // Log the event
    logger.telemetry(event.event, {
      taskId: event.taskId,
      userId: event.userId,
      ...event.data,
    });

    res.json({
      success: true,
      message: 'Telemetry event recorded',
    });
  } catch (error) {
    logger.error('Failed to record telemetry event', error as Error);
    res.status(500).json({
      error: 'Telemetry error',
      message: 'Failed to record event',
    });
  }
});

// POST /api/telemetry/batch - Record multiple telemetry events
router.post('/batch', (req: AuthenticatedRequest, res: Response) => {
  try {
    const events: TelemetryEvent[] = req.body.events;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        error: 'Invalid batch request',
        message: 'events array is required',
      });
    }

    if (events.length > 100) {
      return res.status(400).json({
        error: 'Batch too large',
        message: 'Maximum 100 events per batch',
      });
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each event
    if (db) {
      const stmt = db.prepare(`
        INSERT INTO telemetry_events (task_id, user_id, session_id, event, timestamp, data)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const transaction = db.transaction((events: TelemetryEvent[]) => {
        for (const event of events) {
          try {
            // Add user ID if authenticated
            if (req.user) {
              event.userId = req.user.id;
            }

            stmt.run(
              event.taskId,
              event.userId || null,
              event.sessionId || null,
              event.event,
              event.timestamp,
              JSON.stringify(event.data)
            );

            successCount++;
          } catch (error) {
            errorCount++;
            logger.error('Failed to insert telemetry event', error as Error);
          }
        }
      });

      transaction(events);
    }

    logger.info('Batch telemetry processed', {
      totalEvents: events.length,
      successCount,
      errorCount,
      userId: req.user?.id,
    });

    res.json({
      success: true,
      message: 'Batch telemetry processed',
      results: {
        total: events.length,
        success: successCount,
        errors: errorCount,
      },
    });
  } catch (error) {
    logger.error('Failed to process batch telemetry', error as Error);
    res.status(500).json({
      error: 'Batch telemetry error',
      message: 'Failed to process batch',
    });
  }
});

// GET /api/telemetry/analytics - Get telemetry analytics
router.get('/analytics', (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!db) {
      return res.status(503).json({
        error: 'Database unavailable',
      });
    }

    const { timeframe = '24h', userId } = req.query;

    // Calculate time range
    let hoursBack = 24;
    if (timeframe === '1h') hoursBack = 1;
    else if (timeframe === '6h') hoursBack = 6;
    else if (timeframe === '7d') hoursBack = 24 * 7;
    else if (timeframe === '30d') hoursBack = 24 * 30;

    const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    // Build query conditions
    let whereClause = 'WHERE timestamp >= ?';
    const params: any[] = [startTime];

    if (userId) {
      whereClause += ' AND user_id = ?';
      params.push(userId);
    }

    // Get event counts by type
    const eventCounts = db
      .prepare(
        `
      SELECT event, COUNT(*) as count
      FROM telemetry_events
      ${whereClause}
      GROUP BY event
      ORDER BY count DESC
    `
      )
      .all(params);

    // Get model selection stats
    const modelStats = db
      .prepare(
        `
      SELECT 
        JSON_EXTRACT(data, '$.selectedModel') as model,
        JSON_EXTRACT(data, '$.modelClass') as model_class,
        COUNT(*) as count,
        AVG(CAST(JSON_EXTRACT(data, '$.confidence') AS REAL)) as avg_confidence,
        AVG(CAST(JSON_EXTRACT(data, '$.latency') AS REAL)) as avg_latency
      FROM telemetry_events
      ${whereClause}
      AND event = 'model_selected'
      AND JSON_EXTRACT(data, '$.selectedModel') IS NOT NULL
      GROUP BY model, model_class
      ORDER BY count DESC
    `
      )
      .all(params);

    // Get error rates
    const errorStats = db
      .prepare(
        `
      SELECT 
        JSON_EXTRACT(data, '$.errorCode') as error_code,
        COUNT(*) as count
      FROM telemetry_events
      ${whereClause}
      AND event = 'error_occurred'
      GROUP BY error_code
      ORDER BY count DESC
    `
      )
      .all(params);

    // Get performance metrics
    const performanceStats = db
      .prepare(
        `
      SELECT 
        AVG(CAST(JSON_EXTRACT(data, '$.latency') AS REAL)) as avg_latency,
        MIN(CAST(JSON_EXTRACT(data, '$.latency') AS REAL)) as min_latency,
        MAX(CAST(JSON_EXTRACT(data, '$.latency') AS REAL)) as max_latency,
        AVG(CAST(JSON_EXTRACT(data, '$.tokensUsed') AS REAL)) as avg_tokens,
        SUM(CAST(JSON_EXTRACT(data, '$.cost') AS REAL)) as total_cost
      FROM telemetry_events
      ${whereClause}
      AND event = 'request_completed'
      AND JSON_EXTRACT(data, '$.latency') IS NOT NULL
    `
      )
      .get(params);

    res.json({
      timeframe,
      startTime,
      analytics: {
        eventCounts,
        modelStats,
        errorStats,
        performance: performanceStats,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to generate analytics', error as Error);
    res.status(500).json({
      error: 'Analytics error',
      message: 'Failed to generate analytics',
    });
  }
});

// GET /api/telemetry/tasks/:taskId - Get telemetry for specific task
router.get('/tasks/:taskId', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    if (!db) {
      return res.status(503).json({
        error: 'Database unavailable',
      });
    }

    const events = db
      .prepare(
        `
      SELECT event, timestamp, data, created_at
      FROM telemetry_events
      WHERE task_id = ?
      ORDER BY timestamp ASC
    `
      )
      .all(taskId);

    // Parse JSON data
    const parsedEvents = events.map((event: any) => ({
      ...event,
      data: JSON.parse(event.data),
    }));

    res.json({
      taskId,
      events: parsedEvents,
      eventCount: events.length,
    });
  } catch (error) {
    logger.error('Failed to get task telemetry', error as Error);
    res.status(500).json({
      error: 'Telemetry error',
      message: 'Failed to get task data',
    });
  }
});

export default router;
