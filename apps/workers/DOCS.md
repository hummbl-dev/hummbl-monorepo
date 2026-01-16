# HUMMBL Workers API Documentation

A comprehensive OpenAPI-documented REST API for the Base120 mental models system, built with Hono and Cloudflare Workers.

## 🚀 Quick Start

### Development

```bash
# Start development server with OpenAPI documentation
pnpm dev:docs

# Visit the interactive documentation
open http://localhost:8787/docs
```

### Available Documentation Endpoints

- **Swagger UI**: `/docs` - Interactive API documentation with try-it-out functionality
- **ReDoc**: `/redoc` - Clean, responsive API documentation
- **OpenAPI JSON**: `/openapi.json` - Complete OpenAPI 3.1 specification
- **OpenAPI YAML**: `/schema.yaml` - YAML format specification
- **API Info**: `/v1/base120-info` - Base120 system information
- **Rate Limit Info**: `/v1/rate-limit-info` - Rate limiting details
- **OAuth Info**: `/v1/auth/oauth-info` - OAuth flow documentation

## 📋 API Overview

### Base URL

- **Production**: `https://api.hummbl.dev`
- **Staging**: `https://staging-api.hummbl.dev`
- **Development**: `http://localhost:8787`

### Authentication

The API uses JWT-based authentication with OAuth2 support:

```bash
# Login with email/password
curl -X POST "https://api.hummbl.dev/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use the token in subsequent requests
curl -X GET "https://api.hummbl.dev/v1/user/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Supported OAuth Providers:**
- Google OAuth 2.0
- GitHub OAuth 2.0

### Rate Limiting

- **Global Limit**: 100 requests per minute per IP
- **Auth Endpoints**: 10 requests per minute per IP
- Rate limit headers are included in all responses

## 🧠 Base120 Mental Models

The API provides access to 120+ mental models organized by transformation types:

| Type | Name | Description | Example Models |
|------|------|-------------|----------------|
| **P** | Perspective | Changing viewpoints and reframing | First Principles, Inversion |
| **IN** | Input | Gathering and processing information | SWOT Analysis, Five Whys |
| **CO** | Connection | Finding relationships and patterns | Network Effects, Systems Thinking |
| **DE** | Decision | Making choices and judgments | Decision Trees, Expected Value |
| **RE** | Reflection | Self-awareness and learning | Growth Mindset, Feedback Loops |
| **SY** | System | Understanding complex systems | Leverage Points, Emergence |

## 📚 API Endpoints

### Health & Info
- `GET /` - API information
- `GET /health` - Health check
- `GET /v1/base120-info` - Base120 system overview

### Authentication
- `POST /v1/auth/login` - Email/password login
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/google` - Google OAuth login
- `POST /v1/auth/github` - GitHub OAuth login
- `GET /v1/auth/verify` - Verify JWT token
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Logout

### Mental Models
- `GET /v1/models` - List models with filtering
- `GET /v1/models/{code}` - Get specific model
- `GET /v1/models/{code}/relationships` - Get model relationships
- `POST /v1/models/recommend` - Get recommendations for a problem

### Transformations
- `GET /v1/transformations` - List all transformation types
- `GET /v1/transformations/{type}` - Get transformation with models

### User Management (Authentication Required)
- `GET /v1/user/profile` - User profile and stats
- `GET /v1/user/progress` - Completed models
- `POST /v1/user/progress` - Mark model as completed
- `DELETE /v1/user/progress/{modelId}` - Remove from progress
- `GET /v1/user/favorites` - Favorite models
- `POST /v1/user/favorites` - Add to favorites
- `DELETE /v1/user/favorites/{modelId}` - Remove from favorites

### Analytics
- `GET /v1/analytics/stats` - Usage statistics
- `GET /v1/analytics/health` - Analytics service health

## 🔧 Development Workflow

### Documentation Scripts

```bash
# Validate documentation consistency
pnpm docs:validate

# Start development server with docs
pnpm docs:dev

# Preview documentation endpoints
pnpm docs:preview
```

### Adding New Endpoints

1. **Define Schema** in `src/openapi/schemas.ts`:
```typescript
export const NewFeatureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().describe('Feature name')
}).openapi({
  example: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Example Feature'
  }
});
```

2. **Create Route Definition** in `src/openapi/routes.ts`:
```typescript
export const getNewFeatureRoute = createRoute({
  method: 'get',
  path: '/v1/features/{id}',
  tags: ['Features'],
  summary: 'Get Feature',
  description: 'Retrieve a specific feature by ID',
  request: {
    params: z.object({
      id: z.string().uuid()
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(NewFeatureSchema)
        }
      },
      description: 'Feature details'
    }
  }
});
```

3. **Implement Handler** in your route file:
```typescript
app.openapi(getNewFeatureRoute, async (c) => {
  const { id } = c.req.valid('param');
  // Implementation here
  return c.json({ ok: true, value: feature });
});
```

4. **Add Examples** in `src/openapi/examples.ts`:
```typescript
export const FEATURE_EXAMPLES = {
  getFeature: {
    response: {
      ok: true,
      value: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Example Feature'
      }
    }
  }
};
```

### Validation

The validation script checks:
- ✅ Schema consistency and examples
- ✅ Route coverage (documented vs implemented)
- ✅ Security requirements
- ✅ Example completeness

## 📖 Usage Examples

### JavaScript/TypeScript

```javascript
// Authentication
const loginResponse = await fetch('https://api.hummbl.dev/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { value: { token } } = await loginResponse.json();

// Fetch models
const modelsResponse = await fetch('https://api.hummbl.dev/v1/models?transformation=P', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { value: { models } } = await modelsResponse.json();
```

### cURL

```bash
# Get model recommendations
curl -X POST "https://api.hummbl.dev/v1/models/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "I need to make a difficult business decision with limited information."
  }'

# Get user profile (authenticated)
curl -X GET "https://api.hummbl.dev/v1/user/profile" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Python

```python
import requests

# Login
response = requests.post('https://api.hummbl.dev/v1/auth/login', json={
    'email': 'user@example.com',
    'password': 'password'
})
token = response.json()['value']['token']

# Get transformations
headers = {'Authorization': f'Bearer {token}'}
transformations = requests.get(
    'https://api.hummbl.dev/v1/transformations',
    headers=headers
).json()
```

## 🛡️ Security

### Authentication Security
- JWT tokens with HS256 signing
- 24-hour access token expiration
- 7-day refresh token expiration
- Secure token storage in Cloudflare KV
- CSRF protection on POST endpoints

### Input Validation
- Comprehensive Zod schema validation
- SQL injection prevention with parameterized queries
- XSS protection with input sanitization
- Rate limiting to prevent abuse

### OAuth Security
- State parameter validation
- Secure token exchange flows
- Provider token verification
- Scope-limited access

## 🚦 Error Handling

All errors follow a consistent format:

```json
{
  "ok": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable message",
    "details": {
      "additional": "context"
    }
  }
}
```

**Common Error Codes:**
- `invalid_request` - Request validation failed
- `invalid_credentials` - Authentication failed
- `authentication_required` - Valid token required
- `not_found` - Resource not found
- `rate_limit_exceeded` - Too many requests
- `internal_error` - Server error

## 📊 Analytics & Monitoring

The API tracks:
- Request patterns and popular endpoints
- Model access frequencies
- Search query trends
- User engagement metrics
- System performance data

Access analytics via `GET /v1/analytics/stats` or view in the dashboard.

## 🔄 Versioning

The API uses URL versioning (`/v1/`). Breaking changes will be introduced in new versions while maintaining backward compatibility for existing versions.

## 📞 Support

- **Documentation**: Visit `/docs` for interactive API exploration
- **Issues**: Report problems via GitHub Issues
- **Email**: support@hummbl.dev

## 🏗️ Architecture

```
├── src/
│   ├── openapi/
│   │   ├── config.ts      # OpenAPI configuration
│   │   ├── schemas.ts     # Zod schemas with OpenAPI decorators
│   │   ├── routes.ts      # Route definitions
│   │   └── examples.ts    # Usage examples
│   ├── routes/            # Route implementations
│   ├── middleware/        # Custom middleware
│   ├── lib/              # Utilities and helpers
│   ├── index.ts          # Standard API entry point
│   └── index-openapi.ts  # OpenAPI-documented entry point
├── scripts/
│   └── validate-docs.ts  # Documentation validation
└── DOCS.md               # This file
```

The API is built with:
- **Hono** - Fast web framework for Cloudflare Workers
- **Zod** - Runtime type validation and schema definition
- **@hono/zod-openapi** - OpenAPI integration for Hono
- **@hono/swagger-ui** - Interactive documentation UI
- **Cloudflare Workers** - Edge computing platform

---

**Last Updated**: January 2025
**API Version**: 1.0.0
**OpenAPI Version**: 3.1.0