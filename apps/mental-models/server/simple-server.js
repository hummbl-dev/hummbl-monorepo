// Simple Node.js server for HUMMBL Backend (JavaScript version for quick testing)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://hummbl.io', 'https://www.hummbl.io']
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mock API proxy endpoint
app.post('/api/proxy', (req, res) => {
  const { provider, model, messages } = req.body;

  console.log(`[PROXY] ${provider}/${model} - ${messages?.length || 0} messages`);

  // Mock response
  res.json({
    id: 'mock-response-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: `Mock response from ${provider}/${model}. This is a test response from the HUMMBL backend proxy.`,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 50,
      completion_tokens: 20,
      total_tokens: 70,
    },
  });
});

// Mock auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  console.log(`[AUTH] Login attempt: ${email}`);

  if (email === 'demo@hummbl.io' && password === 'demo123') {
    res.json({
      user: {
        id: 'demo-user-id',
        email: email,
        name: 'Demo User',
        role: 'user',
      },
      token: 'mock-jwt-token-' + Date.now(),
      expiresIn: 86400,
    });
  } else {
    res.status(401).json({
      error: 'Invalid credentials',
    });
  }
});

// Mock telemetry endpoint
app.post('/api/telemetry/event', (req, res) => {
  const event = req.body;

  console.log(`[TELEMETRY] ${event.event} - Task: ${event.taskId}`);

  res.json({
    success: true,
    message: 'Telemetry event recorded',
  });
});

// Get available models
app.get('/api/proxy/models', (req, res) => {
  res.json({
    models: {
      openai: ['gpt-4', 'gpt-3.5-turbo'],
      anthropic: ['claude-3-sonnet-20240229'],
      cascade: ['cascade-execution', 'cascade-reasoning', 'cascade-creative'],
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HUMMBL Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API Proxy: http://localhost:${PORT}/api/proxy`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/login`);
  console.log(`📈 Telemetry: http://localhost:${PORT}/api/telemetry/event`);
});

module.exports = app;
