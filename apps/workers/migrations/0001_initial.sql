-- Initial schema for HUMMBL Base120 mental models
-- Creates the core models table with system_prompt support

CREATE TABLE IF NOT EXISTS models (
  code TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  definition TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 3,
  transformation TEXT NOT NULL CHECK(transformation IN ('P', 'IN', 'CO', 'DE', 'RE', 'SY')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for transformation-based queries
CREATE INDEX IF NOT EXISTS idx_models_transformation ON models(transformation);

-- Index for priority-based sorting
CREATE INDEX IF NOT EXISTS idx_models_priority ON models(priority);
