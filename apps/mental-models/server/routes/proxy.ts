// AI Model Proxy Routes
// Secure proxy for OpenAI, Anthropic, and other AI providers

import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import { logger } from '../utils/logger';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authGuard';

const router = Router();

interface ProxyRequest {
  provider: 'openai' | 'anthropic' | 'cascade';
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  taskId?: string;
}

// Rate limiting per user/IP
const userRateLimits = new Map<string, { count: number; resetTime: number }>();

const checkUserRateLimit = (userId: string | undefined, ip: string | undefined): boolean => {
  const key = userId || ip || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = userId ? 50 : 10; // Higher limit for authenticated users

  const current = userRateLimits.get(key);
  if (!current || now > current.resetTime) {
    userRateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
};

// POST /api/proxy - Main AI model proxy endpoint
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now();

  try {
    const {
      provider,
      model,
      messages,
      temperature = 0.7,
      max_tokens = 1000,
      stream = false,
      taskId,
    }: ProxyRequest = req.body;

    // Validate request
    if (!provider || !model || !messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'provider, model, and messages are required',
      });
    }

    // Check rate limits
    if (!checkUserRateLimit(req.user?.id, req.ip)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
      });
    }

    // Log the request
    logger.apiRequest('POST', '/api/proxy', {
      provider,
      model,
      userId: req.user?.id,
      taskId,
      messageCount: messages.length,
    });

    let response;
    let apiUrl: string;
    let headers: Record<string, string>;

    // Configure provider-specific settings
    switch (provider) {
      case 'openai':
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        headers = {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        };
        break;

      case 'anthropic':
        apiUrl = 'https://api.anthropic.com/v1/messages';
        headers = {
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        };
        break;

      case 'cascade':
        // For Cascade, we'll use OpenAI as the underlying provider
        // but with specific model routing logic
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        headers = {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        };
        break;

      default:
        return res.status(400).json({
          error: 'Unsupported provider',
          message: `Provider '${provider}' is not supported`,
        });
    }

    // Check if API key is configured
    const apiKey =
      provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY;

    if (!apiKey) {
      logger.error(`${provider.toUpperCase()} API key not configured`);
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'AI service is temporarily unavailable',
      });
    }

    // Prepare request body based on provider
    let requestBody: any;

    if (provider === 'anthropic') {
      // Convert OpenAI format to Anthropic format
      requestBody = {
        model: model,
        max_tokens: Math.min(max_tokens, 4000),
        messages: messages.map((msg) => ({
          role: msg.role === 'system' ? 'user' : msg.role,
          content: msg.content,
        })),
      };
    } else {
      // OpenAI format (also used for Cascade)
      requestBody = {
        model: model,
        messages: messages,
        temperature: Math.min(Math.max(temperature, 0), 2),
        max_tokens: Math.min(max_tokens, 4000),
        stream: stream,
      };
    }

    // Make request to AI provider
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`${provider.toUpperCase()} API error`, {
        status: response.status,
        error: errorText,
        model: model,
        taskId: taskId,
      });

      return res.status(503).json({
        error: 'AI service error',
        message: 'The AI service is temporarily unavailable',
      });
    }

    // Handle streaming response
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      response.body?.pipe(res);
      return;
    }

    // Handle regular response
    const data = await response.json();

    // Log successful request
    const responseData = data as any;
    logger.telemetry('AI_REQUEST_COMPLETED', {
      provider,
      model,
      taskId,
      latency,
      userId: req.user?.id,
      tokensUsed: responseData.usage?.total_tokens || 0,
    });

    res.json(responseData);
  } catch (error) {
    const latency = Date.now() - startTime;

    logger.error('Proxy request failed', {
      error: error as Error,
      latency,
      taskId: req.body.taskId,
    });

    res.status(500).json({
      error: 'Proxy error',
      message: 'Failed to process AI request',
    });
  }
});

// GET /api/proxy/models - List available models
router.get('/models', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const models = {
    openai: ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
    anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    cascade: ['cascade-execution', 'cascade-reasoning', 'cascade-creative'],
  };

  res.json({
    models,
    timestamp: new Date().toISOString(),
  });
});

export default router;
