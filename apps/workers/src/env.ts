/**
 * Cloudflare Workers Environment Bindings
 */

import { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

export interface Env {
  // D1 Database
  DB: D1Database;

  // KV Namespace for caching
  CACHE: KVNamespace;

  // R2 Bucket for assets
  ASSETS: R2Bucket;

  // Environment variables
  ENVIRONMENT: string;
  API_VERSION: string;

  // Authentication
  JWT_SECRET: string;
  PASSWORD_SALT: string;

  // OAuth Providers
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}
