CREATE TABLE IF NOT EXISTS mental_models (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  transformation TEXT NOT NULL,
  definition TEXT NOT NULL,
  whenToUse TEXT NOT NULL,
  example TEXT NOT NULL,
  systemPrompt TEXT NOT NULL,
  priority INTEGER NOT NULL,
  tags TEXT,
  difficulty TEXT,
  relatedModels TEXT,
  version TEXT DEFAULT '1.0.0',
  createdAt TEXT,
  updatedAt TEXT
);
