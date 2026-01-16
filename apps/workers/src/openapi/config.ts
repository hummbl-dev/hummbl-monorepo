/**
 * OpenAPI Configuration for HUMMBL Workers API
 */

import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import type { Env } from '../env';

export const createOpenAPIApp = () => {
  const app = new OpenAPIHono<{ Bindings: Env }>();

  // OpenAPI document configuration
  app.doc('/openapi.json', {
    openapi: '3.1.0',
    info: {
      title: 'HUMMBL Workers API',
      version: '1.0.0',
      description: `
# HUMMBL Workers API

REST API for Base120 mental models and transformations. This API provides access to a comprehensive collection of mental models organized by transformation types, along with user management, analytics, and authentication features.

## Features

- **Mental Models**: Browse and search through 120+ curated mental models
- **Transformations**: Access models organized by 6 transformation types (P, IN, CO, DE, RE, SY)
- **User Management**: User profiles, progress tracking, and favorites
- **Authentication**: JWT-based auth with Google/GitHub OAuth support
- **Analytics**: Usage statistics and model recommendations
- **Rate Limiting**: Built-in rate limiting for API protection

## Base120 Mental Models

The Base120 system organizes mental models into six transformation categories:

- **P** (Perspective): Models for changing viewpoints and framing
- **IN** (Input): Models for gathering and processing information
- **CO** (Connection): Models for finding relationships and patterns
- **DE** (Decision): Models for making choices and judgments
- **RE** (Reflection): Models for self-awareness and learning
- **SY** (System): Models for understanding complex systems

Each model includes practical examples, difficulty ratings, and related model suggestions.
      `.trim(),
      contact: {
        name: 'HUMMBL Support',
        email: 'support@hummbl.dev',
        url: 'https://hummbl.dev/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      termsOfService: 'https://hummbl.dev/terms',
    },
    servers: [
      {
        url: 'https://api.hummbl.dev',
        description: 'Production API',
      },
      {
        url: 'https://staging-api.hummbl.dev',
        description: 'Staging API',
      },
      {
        url: 'http://localhost:8787',
        description: 'Local development',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'API health and status endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication and token management',
      },
      {
        name: 'Models',
        description: 'Mental models CRUD operations and search',
      },
      {
        name: 'Transformations',
        description: 'Transformation types and related models',
      },
      {
        name: 'User',
        description: 'User profile, progress, and favorites management',
      },
      {
        name: 'Analytics',
        description: 'Usage analytics and statistics',
      },
    ],
    security: [
      {
        BearerAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from authentication endpoints',
        },
      },
    },
  });

  return app;
};

export const setupSwaggerUI = (app: OpenAPIHono<{ Bindings: Env }>) => {
  // Swagger UI endpoint
  app.get('/docs', swaggerUI({ url: '/openapi.json' }));

  // Alternative ReDoc endpoint
  app.get('/redoc', c => {
    return c.html(`
<!DOCTYPE html>
<html>
  <head>
    <title>HUMMBL API Documentation - ReDoc</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
      body { margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <redoc spec-url='/openapi.json'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0/bundles/redoc.standalone.js"></script>
  </body>
</html>
    `);
  });

  // JSON Schema endpoint for direct download
  app.get('/schema.json', async c => {
    const openApiDoc = app.getOpenAPIDocument({
      openapi: '3.1.0',
      info: { title: 'HUMMBL Workers API', version: '1.0.0' },
    });
    return c.json(openApiDoc);
  });

  // YAML Schema endpoint
  app.get('/schema.yaml', async c => {
    const openApiDoc = app.getOpenAPIDocument({
      openapi: '3.1.0',
      info: { title: 'HUMMBL Workers API', version: '1.0.0' },
    });

    // Simple JSON to YAML conversion for basic OpenAPI structure
    const yamlContent = `
openapi: "${openApiDoc.openapi}"
info:
  title: "${openApiDoc.info.title}"
  version: "${openApiDoc.info.version}"
  description: |
${
  openApiDoc.info.description
    ?.split('\n')
    .map(line => `    ${line}`)
    .join('\n') || ''
}
  contact:
    name: "${openApiDoc.info.contact?.name || ''}"
    email: "${openApiDoc.info.contact?.email || ''}"
    url: "${openApiDoc.info.contact?.url || ''}"
  license:
    name: "${openApiDoc.info.license?.name || ''}"
    url: "${openApiDoc.info.license?.url || ''}"
servers:
${openApiDoc.servers?.map(server => `  - url: "${server.url}"\n    description: "${server.description}"`).join('\n') || ''}
paths:
  # Full OpenAPI paths would be generated here
  # Download /openapi.json for complete schema
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: "JWT token obtained from authentication endpoints"
    `.trim();

    c.header('Content-Type', 'application/yaml');
    return c.text(yamlContent);
  });
};
