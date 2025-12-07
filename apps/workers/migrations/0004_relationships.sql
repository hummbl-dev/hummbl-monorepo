-- Add model relationships table for knowledge graph
-- Tracks connections between mental models

CREATE TABLE IF NOT EXISTS model_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_code TEXT NOT NULL,
  target_code TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 5 CHECK(confidence >= 1 AND confidence <= 10),
  evidence TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_code) REFERENCES mental_models(code),
  FOREIGN KEY (target_code) REFERENCES mental_models(code),
  UNIQUE(source_code, target_code, relationship_type)
);

-- Index for efficient lookup of model relationships
CREATE INDEX IF NOT EXISTS idx_relationships_source ON model_relationships(source_code);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON model_relationships(target_code);
CREATE INDEX IF NOT EXISTS idx_relationships_confidence ON model_relationships(confidence DESC);
