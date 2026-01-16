/**
 * OpenAPI Route Definitions for HUMMBL Workers API
 */

import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import {
  ErrorSchema,
  SuccessResponseSchema,
  UserSchema,
  AuthResponseSchema,
  MentalModelSchema,
  TransformationSchema,
  ModelRelationshipSchema,
  UserProgressSchema,
  UserFavoriteSchema,
  UserProfileSchema,
  AnalyticsStatsSchema,
  HealthResponseSchema,
  ModelFilterQuerySchema,
  RecommendRequestSchema,
  RecommendResponseSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
  GoogleAuthRequestSchema,
  GitHubAuthRequestSchema,
  RefreshTokenRequestSchema,
  AddProgressRequestSchema,
  AddFavoriteRequestSchema
} from './schemas';

// Health and Info Routes
export const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Health Check',
  description: 'Check the API health status and get basic information',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HealthResponseSchema
        }
      },
      description: 'API is healthy'
    }
  }
});

export const rootRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Health'],
  summary: 'API Information',
  description: 'Get basic API information and version',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
            version: z.string(),
            environment: z.string(),
            status: z.string()
          })
        }
      },
      description: 'API information'
    }
  }
});

// Authentication Routes
export const loginRoute = createRoute({
  method: 'post',
  path: '/v1/auth/login',
  tags: ['Authentication'],
  summary: 'Email/Password Login',
  description: 'Authenticate user with email and password',
  requestBody: {
    content: {
      'application/json': {
        schema: LoginRequestSchema
      }
    },
    description: 'Login credentials'
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(AuthResponseSchema)
        }
      },
      description: 'Login successful'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid credentials'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid request format'
    },
    429: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Too many requests'
    }
  }
});

export const registerRoute = createRoute({
  method: 'post',
  path: '/v1/auth/register',
  tags: ['Authentication'],
  summary: 'Email/Password Registration',
  description: 'Register a new user account with email and password',
  requestBody: {
    content: {
      'application/json': {
        schema: RegisterRequestSchema
      }
    },
    description: 'Registration details'
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(AuthResponseSchema.extend({
            message: z.string().describe('Registration success message')
          }))
        }
      },
      description: 'Registration successful'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid request or validation error'
    },
    409: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'User already exists'
    },
    429: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Too many requests'
    }
  }
});

export const googleAuthRoute = createRoute({
  method: 'post',
  path: '/v1/auth/google',
  tags: ['Authentication'],
  summary: 'Google OAuth Authentication',
  description: 'Authenticate user with Google OAuth token',
  requestBody: {
    content: {
      'application/json': {
        schema: GoogleAuthRequestSchema
      }
    },
    description: 'Google OAuth token'
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(AuthResponseSchema)
        }
      },
      description: 'Google authentication successful'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid token or request'
    },
    429: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Too many requests'
    }
  }
});

export const githubAuthRoute = createRoute({
  method: 'post',
  path: '/v1/auth/github',
  tags: ['Authentication'],
  summary: 'GitHub OAuth Authentication',
  description: 'Authenticate user with GitHub OAuth authorization code',
  requestBody: {
    content: {
      'application/json': {
        schema: GitHubAuthRequestSchema
      }
    },
    description: 'GitHub OAuth authorization code'
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(AuthResponseSchema)
        }
      },
      description: 'GitHub authentication successful'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid authorization code or request'
    },
    429: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Too many requests'
    }
  }
});

export const verifyTokenRoute = createRoute({
  method: 'get',
  path: '/v1/auth/verify',
  tags: ['Authentication'],
  summary: 'Verify JWT Token',
  description: 'Verify and get user information from JWT token',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            user: UserSchema
          }))
        }
      },
      description: 'Token is valid'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid or expired token'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'User not found'
    }
  }
});

export const refreshTokenRoute = createRoute({
  method: 'post',
  path: '/v1/auth/refresh',
  tags: ['Authentication'],
  summary: 'Refresh Access Token',
  description: 'Get new access token using refresh token',
  requestBody: {
    content: {
      'application/json': {
        schema: RefreshTokenRequestSchema
      }
    },
    description: 'Refresh token'
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(AuthResponseSchema)
        }
      },
      description: 'Token refreshed successfully'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid or expired refresh token'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'User not found'
    }
  }
});

// Models Routes
export const getModelsRoute = createRoute({
  method: 'get',
  path: '/v1/models',
  tags: ['Models'],
  summary: 'List Mental Models',
  description: 'Get a list of mental models with optional filtering by transformation type or search query',
  request: {
    query: ModelFilterQuerySchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            models: z.array(MentalModelSchema),
            count: z.number(),
            transformation: z.string().nullable(),
            search: z.string().nullable()
          }))
        }
      },
      description: 'List of mental models'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid query parameters'
    }
  }
});

export const getModelRoute = createRoute({
  method: 'get',
  path: '/v1/models/{code}',
  tags: ['Models'],
  summary: 'Get Mental Model',
  description: 'Get detailed information about a specific mental model',
  request: {
    params: z.object({
      code: z.string().regex(/^[A-Z0-9]+$/, 'Invalid model code format').describe('Model code (e.g., P1, SY12)')
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            model: MentalModelSchema
          }))
        }
      },
      description: 'Mental model details'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid model code'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Model not found'
    }
  }
});

export const getModelRelationshipsRoute = createRoute({
  method: 'get',
  path: '/v1/models/{code}/relationships',
  tags: ['Models'],
  summary: 'Get Model Relationships',
  description: 'Get relationships for a specific mental model',
  request: {
    params: z.object({
      code: z.string().regex(/^[A-Z0-9]+$/, 'Invalid model code format').describe('Model code')
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            model: z.string(),
            relationships: z.array(ModelRelationshipSchema),
            count: z.number()
          }))
        }
      },
      description: 'Model relationships'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid model code'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Model not found'
    }
  }
});

export const recommendModelsRoute = createRoute({
  method: 'post',
  path: '/v1/models/recommend',
  tags: ['Models'],
  summary: 'Get Model Recommendations',
  description: 'Get mental model recommendations based on a problem description',
  requestBody: {
    content: {
      'application/json': {
        schema: RecommendRequestSchema
      }
    },
    description: 'Problem description'
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(RecommendResponseSchema)
        }
      },
      description: 'Model recommendations'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid request or problem description'
    }
  }
});

// Transformations Routes
export const getTransformationsRoute = createRoute({
  method: 'get',
  path: '/v1/transformations',
  tags: ['Transformations'],
  summary: 'List Transformation Types',
  description: 'Get all transformation types with their details',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            transformations: z.record(z.string(), TransformationSchema),
            count: z.number()
          }))
        }
      },
      description: 'List of transformation types'
    }
  }
});

export const getTransformationRoute = createRoute({
  method: 'get',
  path: '/v1/transformations/{type}',
  tags: ['Transformations'],
  summary: 'Get Transformation Details',
  description: 'Get detailed information about a transformation type and its models',
  request: {
    params: z.object({
      type: z.enum(['P', 'IN', 'CO', 'DE', 'RE', 'SY']).describe('Transformation type code')
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(TransformationSchema.extend({
            models: z.array(MentalModelSchema),
            modelCount: z.number()
          }))
        }
      },
      description: 'Transformation details with models'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid transformation type'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Transformation not found'
    }
  }
});

// User Routes
export const getUserProgressRoute = createRoute({
  method: 'get',
  path: '/v1/user/progress',
  tags: ['User'],
  summary: 'Get User Progress',
  description: 'Get list of models completed by the authenticated user',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            progress: z.array(UserProgressSchema)
          })
        }
      },
      description: 'User progress data'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Authentication required'
    }
  }
});

export const addProgressRoute = createRoute({
  method: 'post',
  path: '/v1/user/progress',
  tags: ['User'],
  summary: 'Mark Model as Completed',
  description: 'Mark a mental model as completed for the authenticated user',
  security: [{ BearerAuth: [] }],
  requestBody: {
    content: {
      'application/json': {
        schema: AddProgressRequestSchema
      }
    },
    description: 'Model to mark as completed'
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            progressId: z.string()
          })
        }
      },
      description: 'Model marked as completed'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid model ID'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Model not found'
    },
    409: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Model already completed'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Authentication required'
    }
  }
});

export const getUserFavoritesRoute = createRoute({
  method: 'get',
  path: '/v1/user/favorites',
  tags: ['User'],
  summary: 'Get User Favorites',
  description: 'Get list of models favorited by the authenticated user',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            favorites: z.array(UserFavoriteSchema)
          })
        }
      },
      description: 'User favorites data'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Authentication required'
    }
  }
});

export const getUserProfileRoute = createRoute({
  method: 'get',
  path: '/v1/user/profile',
  tags: ['User'],
  summary: 'Get User Profile',
  description: 'Get authenticated user profile and statistics',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserProfileSchema
        }
      },
      description: 'User profile and statistics'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Authentication required'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'User not found'
    }
  }
});

// Analytics Routes
export const getAnalyticsStatsRoute = createRoute({
  method: 'get',
  path: '/v1/analytics/stats',
  tags: ['Analytics'],
  summary: 'Get Usage Analytics',
  description: 'Get API usage statistics and analytics data',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AnalyticsStatsSchema
        }
      },
      description: 'Usage analytics data'
    }
  }
});

export const getAnalyticsHealthRoute = createRoute({
  method: 'get',
  path: '/v1/analytics/health',
  tags: ['Analytics'],
  summary: 'Get Analytics Health',
  description: 'Get analytics service health and tracking status',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HealthResponseSchema
        }
      },
      description: 'Analytics health status'
    }
  }
});