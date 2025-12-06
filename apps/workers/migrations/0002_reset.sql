PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS mental_models;
CREATE TABLE mental_models (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  transformation TEXT NOT NULL,
  definition TEXT NOT NULL,
  whenToUse TEXT NOT NULL,
  example TEXT,
  priority INTEGER NOT NULL,
  system_prompt TEXT NOT NULL
);
-- optional: seed base rows here or leave to dedicated seed files
