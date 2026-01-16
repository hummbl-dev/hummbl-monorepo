/**
 * OpenAPI Schema Definitions for HUMMBL Workers API
 */

import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';

// Common schemas
export const ErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string().describe('Error code for programmatic handling'),
    message: z.string().describe('Human-readable error message'),
    details: z.unknown().optional().describe('Additional error details (validation errors, etc.)')
  })
}).openapi({
  description: 'Standard error response format'
});

export const SuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    ok: z.literal(true),
    value: dataSchema
  }).openapi({
    description: 'Standard success response format'
  });

// Authentication schemas
export const UserSchema = z.object({
  id: z.string().uuid().describe('Unique user identifier'),
  email: z.string().email().describe('User email address'),
  name: z.string().describe('User display name'),
  avatar_url: z.string().url().nullable().describe('User avatar URL'),
  provider: z.enum(['google', 'github', 'email']).describe('Authentication provider'),
  provider_id: z.string().describe('Provider-specific user ID'),
  email_verified: z.boolean().optional().describe('Whether email is verified'),
  created_at: z.string().datetime().optional().describe('Account creation timestamp'),
  updated_at: z.string().datetime().optional().describe('Last update timestamp')
}).openapi({
  example: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'user@example.com',
    name: 'John Doe',
    avatar_url: 'https://avatars.githubusercontent.com/u/12345',
    provider: 'github',
    provider_id: '12345',
    email_verified: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
});

export const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string().describe('JWT access token'),
  refreshToken: z.string().describe('Refresh token for obtaining new access tokens'),
  expiresIn: z.number().optional().describe('Token expiration time in seconds')
}).openapi({
  example: {
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      name: 'John Doe',
      avatar_url: 'https://avatars.githubusercontent.com/u/12345',
      provider: 'github',
      provider_id: '12345',
      email_verified: true
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refreshToken: 'refresh-token-uuid',
    expiresIn: 86400
  }
});

// Mental Model schemas
export const TransformationTypeSchema = z.enum(['P', 'IN', 'CO', 'DE', 'RE', 'SY']).openapi({
  description: 'Transformation type: P=Perspective, IN=Input, CO=Connection, DE=Decision, RE=Reflection, SY=System',
  example: 'P'
});

export const MentalModelSchema = z.object({
  code: z.string().regex(/^[A-Z]{1,2}\d{1,2}$/).describe('Unique model code (e.g., P1, SY12)'),
  name: z.string().describe('Model name'),
  transformation: TransformationTypeSchema,
  description: z.string().describe('Detailed description of the model'),
  example: z.string().optional().describe('Practical example of model usage'),
  tags: z.string().describe('Comma-separated tags'),
  difficulty: z.string().describe('Difficulty level (Beginner, Intermediate, Advanced)'),
  relatedModels: z.string().describe('Comma-separated related model codes'),
  version: z.string().describe('Model version'),
  createdAt: z.string().datetime().describe('Creation timestamp'),
  updatedAt: z.string().datetime().describe('Last update timestamp')
}).openapi({
  example: {
    code: 'P1',
    name: 'First Principles',
    transformation: 'P',
    description: 'Breaking down complex problems into fundamental truths and building up from there.',
    example: 'Elon Musk analyzing rocket costs by examining raw material prices rather than industry benchmarks.',
    tags: 'problem-solving,analysis,reasoning',
    difficulty: 'Intermediate',
    relatedModels: 'P2,DE3',
    version: '1.0',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
});

export const ModelRelationshipSchema = z.object({
  id: z.number().describe('Relationship ID'),
  source_code: z.string().describe('Source model code'),
  target_code: z.string().describe('Target model code'),
  relationship_type: z.string().describe('Type of relationship'),
  confidence: z.number().min(0).max(1).describe('Confidence score of the relationship'),
  evidence: z.string().optional().describe('Evidence or reasoning for the relationship'),
  created_at: z.string().datetime().describe('Relationship creation timestamp')
}).openapi({
  example: {
    id: 1,
    source_code: 'P1',
    target_code: 'P2',
    relationship_type: 'similar',
    confidence: 0.85,
    evidence: 'Both models focus on analytical problem-solving approaches',
    created_at: '2024-01-15T10:00:00Z'
  }
});

// Transformation schemas
export const TransformationSchema = z.object({
  code: TransformationTypeSchema,
  name: z.string().describe('Transformation name'),
  description: z.string().describe('Transformation description'),
  color: z.string().describe('UI color code for the transformation'),
  icon: z.string().describe('Icon identifier for the transformation'),
  models: z.array(MentalModelSchema).optional().describe('Models belonging to this transformation'),
  modelCount: z.number().optional().describe('Number of models in this transformation')
}).openapi({
  example: {
    code: 'P',
    name: 'Perspective',
    description: 'Models for changing viewpoints and reframing problems',
    color: '#FF6B6B',
    icon: 'perspective',
    modelCount: 15
  }
});

// User-related schemas
export const UserProgressSchema = z.object({
  model_id: z.string().describe('Completed model code'),
  completed_at: z.string().datetime().describe('Completion timestamp')
}).openapi({
  example: {
    model_id: 'P1',
    completed_at: '2024-01-15T10:00:00Z'
  }
});

export const UserFavoriteSchema = z.object({
  model_id: z.string().describe('Favorited model code'),
  created_at: z.string().datetime().describe('Favorite creation timestamp')
}).openapi({
  example: {
    model_id: 'P1',
    created_at: '2024-01-15T10:00:00Z'
  }
});

export const UserProfileSchema = z.object({
  user: UserSchema,
  stats: z.object({
    completedModels: z.number().describe('Number of completed models'),
    favoriteModels: z.number().describe('Number of favorite models')
  })
}).openapi({
  example: {
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      name: 'John Doe',
      avatar_url: 'https://avatars.githubusercontent.com/u/12345',
      provider: 'github',
      provider_id: '12345'
    },
    stats: {
      completedModels: 12,
      favoriteModels: 5
    }
  }
});

// Analytics schemas
export const AnalyticsStatsSchema = z.object({
  timeframe: z.string().describe('Statistics timeframe'),
  totalRequests: z.number().describe('Total number of API requests'),
  topModels: z.array(z.object({
    id: z.string().describe('Model code'),
    count: z.number().describe('Access count')
  })).describe('Most accessed models'),
  topQueries: z.array(z.object({
    query: z.string().describe('Search query'),
    count: z.number().describe('Query count')
  })).describe('Most popular search queries'),
  topEndpoints: z.array(z.object({
    endpoint: z.string().describe('API endpoint'),
    count: z.number().describe('Request count')
  })).describe('Most accessed endpoints'),
  uniqueModelsAccessed: z.number().describe('Number of unique models accessed'),
  uniqueSearchQueries: z.number().describe('Number of unique search queries')
}).openapi({
  example: {
    timeframe: '24 hours',
    totalRequests: 1250,
    topModels: [
      { id: 'P1', count: 45 },
      { id: 'CO3', count: 38 }
    ],
    topQueries: [
      { query: 'decision making', count: 25 },
      { query: 'problem solving', count: 18 }
    ],
    topEndpoints: [
      { endpoint: '/v1/models', count: 567 },
      { endpoint: '/v1/transformations', count: 234 }
    ],
    uniqueModelsAccessed: 89,
    uniqueSearchQueries: 156
  }
});

// Request/Response schemas for specific endpoints
export const ModelFilterQuerySchema = z.object({
  transformation: TransformationTypeSchema.optional(),
  search: z.string().min(2).max(100).optional().describe('Search term for model names and descriptions'),
  base_level: z.coerce.number().int().min(1).max(5).optional().describe('Base difficulty level filter')
});

export const RecommendRequestSchema = z.object({
  problem: z.string()
    .min(10, 'Problem description must be at least 10 characters')
    .max(1000, 'Problem description too long')
    .describe('Description of the problem you need help with')
}).openapi({
  example: {
    problem: 'I need to make a difficult business decision about whether to pivot our product strategy, but I have limited information and high uncertainty.'
  }
});

export const RecommendResponseSchema = z.object({
  problem: z.string().describe('Original problem description'),
  recommendations: z.array(z.object({
    code: z.string().describe('Model code'),
    name: z.string().describe('Model name'),
    transformation: TransformationTypeSchema,
    description: z.string().describe('Model description')
  })).describe('Recommended models for the problem'),
  count: z.number().describe('Number of recommendations')
}).openapi({
  example: {
    problem: 'I need to make a difficult business decision...',
    recommendations: [
      {
        code: 'DE1',
        name: 'Decision Trees',
        transformation: 'DE',
        description: 'Structured approach to decision making under uncertainty'
      }
    ],
    count: 1
  }
});

// Authentication request schemas
export const LoginRequestSchema = z.object({
  email: z.string().email().describe('User email address'),
  password: z.string().min(8).describe('User password')
}).openapi({
  example: {
    email: 'user@example.com',
    password: 'securepassword123'
  }
});

export const RegisterRequestSchema = z.object({
  email: z.string().email().describe('User email address'),
  password: z.string().min(8).describe('User password (minimum 8 characters)'),
  name: z.string().min(1).max(100).describe('User display name')
}).openapi({
  example: {
    email: 'user@example.com',
    password: 'securepassword123',
    name: 'John Doe'
  }
});

export const GoogleAuthRequestSchema = z.object({
  token: z.string().describe('Google OAuth access token')
}).openapi({
  example: {
    token: 'ya29.a0AfH6SMB...'
  }
});

export const GitHubAuthRequestSchema = z.object({
  code: z.string().describe('GitHub OAuth authorization code')
}).openapi({
  example: {
    code: 'github_auth_code_123'
  }
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().describe('Refresh token obtained from authentication')
}).openapi({
  example: {
    refreshToken: 'refresh-token-uuid-12345'
  }
});

// User action schemas
export const AddProgressRequestSchema = z.object({
  modelId: z.string().regex(/^[A-Z0-9]+$/).describe('Model code to mark as completed')
}).openapi({
  example: {
    modelId: 'P1'
  }
});

export const AddFavoriteRequestSchema = z.object({
  modelId: z.string().regex(/^[A-Z0-9]+$/).describe('Model code to add to favorites')
}).openapi({
  example: {
    modelId: 'P1'
  }
});

// Health check schema
export const HealthResponseSchema = z.object({
  status: z.string().describe('API status'),
  timestamp: z.string().datetime().describe('Current timestamp'),
  uptime: z.number().describe('API uptime in seconds'),
  version: z.string().describe('API version'),
  analytics: z.object({
    requestsTracked: z.number().describe('Number of tracked requests'),
    modelsTracked: z.number().describe('Number of tracked models'),
    queriesTracked: z.number().describe('Number of tracked queries')
  }).optional()
}).openapi({
  example: {
    status: 'healthy',
    timestamp: '2024-01-15T10:00:00Z',
    uptime: 3600,
    version: '1.0.0',
    analytics: {
      requestsTracked: 1000,
      modelsTracked: 120,
      queriesTracked: 250
    }
  }
});