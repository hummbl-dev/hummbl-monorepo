/**
 * Cloudflare Workers Environment Bindings
 */

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
}
