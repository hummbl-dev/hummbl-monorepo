/**
 * OpenAPI Examples and Documentation Content
 */

export const API_EXAMPLES = {
  // Authentication Examples
  auth: {
    login: {
      request: {
        email: 'user@example.com',
        password: 'SecurePassword123!'
      },
      response: {
        ok: true,
        value: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            name: 'John Doe',
            avatar_url: 'https://avatars.githubusercontent.com/u/12345',
            provider: 'email',
            provider_id: '123e4567-e89b-12d3-a456-426614174000',
            email_verified: true
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDUzMjQ4MDAsImV4cCI6MTcwNTQxMTIwMCwiaXNzIjoiaHVtbWJsLWF1dGgiLCJhdWQiOiJodW1tYmwtd2ViIiwidHlwZSI6ImFjY2VzcyJ9.signature',
          refreshToken: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          expiresIn: 86400
        }
      }
    },
    register: {
      request: {
        email: 'newuser@example.com',
        password: 'StrongPassword123!',
        name: 'Jane Smith'
      },
      response: {
        ok: true,
        value: {
          user: {
            id: '456e7890-f12b-34d5-a678-901234567890',
            email: 'newuser@example.com',
            name: 'Jane Smith',
            avatar_url: null,
            provider: 'email',
            provider_id: '456e7890-f12b-34d5-a678-901234567890',
            email_verified: false
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
          message: 'Registration successful. Please check your email to verify your account.'
        }
      }
    }
  },

  // Models Examples
  models: {
    list: {
      response: {
        ok: true,
        value: {
          models: [
            {
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
            },
            {
              code: 'CO1',
              name: 'Network Effects',
              transformation: 'CO',
              description: 'Understanding how products or services become more valuable as more people use them.',
              example: 'Social media platforms like Facebook become more valuable as more friends join.',
              tags: 'systems,networks,exponential-growth',
              difficulty: 'Beginner',
              relatedModels: 'CO2,SY1',
              version: '1.0',
              createdAt: '2024-01-15T10:00:00Z',
              updatedAt: '2024-01-15T10:00:00Z'
            }
          ],
          count: 2,
          transformation: null,
          search: null
        }
      }
    },
    getModel: {
      response: {
        ok: true,
        value: {
          model: {
            code: 'P1',
            name: 'First Principles',
            transformation: 'P',
            description: 'Breaking down complex problems into fundamental truths and building up from there. This mental model encourages questioning assumptions and rebuilding understanding from the ground up.',
            example: 'Elon Musk analyzing rocket costs by examining raw material prices rather than industry benchmarks. Instead of accepting the high cost of rockets, he broke down the cost of materials (aluminum, titanium, carbon fiber, etc.) and realized rockets should cost a fraction of their market price.',
            tags: 'problem-solving,analysis,reasoning,innovation',
            difficulty: 'Intermediate',
            relatedModels: 'P2,DE3,IN1',
            version: '1.0',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          }
        }
      }
    },
    recommend: {
      request: {
        problem: 'I need to make a difficult business decision about whether to pivot our product strategy, but I have limited information and high uncertainty about market conditions.'
      },
      response: {
        ok: true,
        value: {
          problem: 'I need to make a difficult business decision about whether to pivot our product strategy, but I have limited information and high uncertainty about market conditions.',
          recommendations: [
            {
              code: 'DE1',
              name: 'Decision Trees',
              transformation: 'DE',
              description: 'Structured approach to decision making under uncertainty using branching scenarios'
            },
            {
              code: 'DE5',
              name: 'Expected Value',
              transformation: 'DE',
              description: 'Calculate the average outcome of different choices weighted by their probabilities'
            },
            {
              code: 'IN3',
              name: 'Information Theory',
              transformation: 'IN',
              description: 'Framework for evaluating the value of additional information before making decisions'
            }
          ],
          count: 3
        }
      }
    }
  },

  // Transformations Examples
  transformations: {
    list: {
      response: {
        ok: true,
        value: {
          transformations: {
            P: {
              code: 'P',
              name: 'Perspective',
              description: 'Models for changing viewpoints and reframing problems',
              color: '#FF6B6B',
              icon: 'perspective'
            },
            IN: {
              code: 'IN',
              name: 'Input',
              description: 'Models for gathering and processing information',
              color: '#4ECDC4',
              icon: 'input'
            },
            CO: {
              code: 'CO',
              name: 'Connection',
              description: 'Models for finding relationships and patterns',
              color: '#45B7D1',
              icon: 'connection'
            },
            DE: {
              code: 'DE',
              name: 'Decision',
              description: 'Models for making choices and judgments',
              color: '#FFA07A',
              icon: 'decision'
            },
            RE: {
              code: 'RE',
              name: 'Reflection',
              description: 'Models for self-awareness and learning',
              color: '#98D8C8',
              icon: 'reflection'
            },
            SY: {
              code: 'SY',
              name: 'System',
              description: 'Models for understanding complex systems',
              color: '#F7DC6F',
              icon: 'system'
            }
          },
          count: 6
        }
      }
    }
  },

  // User Examples
  user: {
    profile: {
      response: {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          name: 'John Doe',
          avatar_url: 'https://avatars.githubusercontent.com/u/12345',
          provider: 'github',
          provider_id: '12345',
          created_at: '2024-01-15T10:00:00Z'
        },
        stats: {
          completedModels: 15,
          favoriteModels: 8
        }
      }
    },
    progress: {
      response: {
        progress: [
          {
            model_id: 'P1',
            completed_at: '2024-01-20T14:30:00Z'
          },
          {
            model_id: 'CO3',
            completed_at: '2024-01-18T09:15:00Z'
          },
          {
            model_id: 'DE2',
            completed_at: '2024-01-16T16:45:00Z'
          }
        ]
      }
    }
  },

  // Error Examples
  errors: {
    validation: {
      code: 'invalid_request',
      message: 'Request validation failed',
      details: {
        fieldErrors: {
          email: ['Invalid email format'],
          password: ['Password must be at least 8 characters']
        }
      }
    },
    authentication: {
      code: 'invalid_credentials',
      message: 'Invalid email or password',
      details: null
    },
    authorization: {
      code: 'authentication_required',
      message: 'Valid authentication token required',
      details: null
    },
    notFound: {
      code: 'not_found',
      message: 'Model P999 not found',
      details: {
        code: 'P999'
      }
    },
    rateLimit: {
      code: 'rate_limit_exceeded',
      message: 'Too many requests, please try again later',
      details: {
        retryAfter: 60,
        limit: 100,
        windowSeconds: 60
      }
    },
    serverError: {
      code: 'internal_error',
      message: 'Internal server error occurred',
      details: null
    }
  }
};

export const CURL_EXAMPLES = {
  // Authentication
  loginCurl: `curl -X POST "https://api.hummbl.dev/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -H "X-CSRF-Token: your-csrf-token" \\
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'`,

  registerCurl: `curl -X POST "https://api.hummbl.dev/v1/auth/register" \\
  -H "Content-Type: application/json" \\
  -H "X-CSRF-Token: your-csrf-token" \\
  -d '{
    "email": "newuser@example.com",
    "password": "StrongPassword123!",
    "name": "Jane Smith"
  }'`,

  // Models
  getModelsCurl: `curl -X GET "https://api.hummbl.dev/v1/models?transformation=P&search=decision" \\
  -H "Accept: application/json"`,

  getModelCurl: `curl -X GET "https://api.hummbl.dev/v1/models/P1" \\
  -H "Accept: application/json"`,

  recommendCurl: `curl -X POST "https://api.hummbl.dev/v1/models/recommend" \\
  -H "Content-Type: application/json" \\
  -d '{
    "problem": "I need to make a difficult business decision with limited information."
  }'`,

  // User (requires authentication)
  getProfileCurl: `curl -X GET "https://api.hummbl.dev/v1/user/profile" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -H "Accept: application/json"`,

  addProgressCurl: `curl -X POST "https://api.hummbl.dev/v1/user/progress" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "modelId": "P1"
  }'`
};

export const JAVASCRIPT_EXAMPLES = {
  // Authentication with fetch
  login: `// Login with email and password
const response = await fetch('https://api.hummbl.dev/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': 'your-csrf-token'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
});

const result = await response.json();
if (result.ok) {
  // Store tokens
  localStorage.setItem('accessToken', result.value.token);
  localStorage.setItem('refreshToken', result.value.refreshToken);
  console.log('Login successful:', result.value.user);
} else {
  console.error('Login failed:', result.error);
}`,

  // Fetching models
  getModels: `// Get all models with optional filtering
const params = new URLSearchParams({
  transformation: 'P',
  search: 'decision'
});

const response = await fetch(\`https://api.hummbl.dev/v1/models?\${params}\`);
const result = await response.json();

if (result.ok) {
  console.log(\`Found \${result.value.count} models:\`, result.value.models);
} else {
  console.error('Failed to fetch models:', result.error);
}`,

  // Authenticated request
  getUserProfile: `// Get user profile (requires authentication)
const token = localStorage.getItem('accessToken');

const response = await fetch('https://api.hummbl.dev/v1/user/profile', {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Accept': 'application/json'
  }
});

const result = await response.json();
if (result.ok) {
  console.log('User profile:', result.user);
} else {
  console.error('Failed to get profile:', result.error);
}`,

  // Error handling with token refresh
  withTokenRefresh: `// Helper function to make authenticated requests with token refresh
async function apiRequest(url, options = {}) {
  let token = localStorage.getItem('accessToken');

  // First attempt
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': \`Bearer \${token}\`
    }
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    const refreshResponse = await fetch('https://api.hummbl.dev/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    const refreshResult = await refreshResponse.json();
    if (refreshResult.ok) {
      // Update stored tokens
      localStorage.setItem('accessToken', refreshResult.value.token);
      localStorage.setItem('refreshToken', refreshResult.value.refreshToken);

      // Retry original request
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': \`Bearer \${refreshResult.value.token}\`
        }
      });
    }
  }

  return response;
}`
};

export const RATE_LIMITING_INFO = {
  overview: 'The HUMMBL API implements rate limiting to ensure fair usage and system stability.',
  limits: {
    global: {
      description: 'Applied to all API endpoints',
      window: '60 seconds',
      requests: 100,
      scope: 'per IP address'
    },
    authentication: {
      description: 'Applied to authentication endpoints (/v1/auth/*)',
      window: '60 seconds',
      requests: 10,
      scope: 'per IP address'
    }
  },
  headers: {
    'X-RateLimit-Limit': 'Maximum number of requests allowed in the current window',
    'X-RateLimit-Remaining': 'Number of requests remaining in the current window',
    'X-RateLimit-Reset': 'Unix timestamp when the current window resets',
    'Retry-After': 'Number of seconds to wait before retrying (included in 429 responses)'
  },
  bestPractices: [
    'Implement exponential backoff when receiving 429 responses',
    'Cache API responses when possible to reduce the number of requests',
    'Monitor rate limit headers to avoid hitting limits',
    'Use appropriate User-Agent headers for better identification',
    'Consider implementing request queuing in your application'
  ]
};