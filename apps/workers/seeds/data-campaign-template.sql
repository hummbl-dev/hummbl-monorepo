-- HUMMBL Base120 Data Entry Campaign Template
-- Use this template for adding mental models to the database
-- Follow the exact structure for consistency

-- Template Structure:
-- code: [TRANSFORMATION][NUMBER] (e.g., P1, IN12, DE7)
-- name: [Model Name] - descriptive and memorable
-- transformation: [P|IN|CO|DE|RE|SY] - must match transformation code
-- definition: [Core definition] - concise, actionable
-- whenToUse: [Usage context] - when to apply this model
-- example: [Example scenario] - practical application
-- system_prompt: [Agent prompt] - detailed instructions for AI
-- priority: [1-20] - within transformation (lower = higher priority)

-- Example Entry (DE7 - already completed):
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE7',
  'Pareto Decomposition (80/20)',
  'DE',
  'Identify the vital few drivers producing the majority of impact.',
  'When resources are limited and maximum leverage needed',
  'Focus on 20% of customers generating 80% of revenue',
  'You are Pareto Decomposition. Diagnose the 80/20 leverage points by ranking inputs by impact, eliminating low-yield activities, and returning only the few interventions that dominate outcomes.',
  7
);

-- Data Entry Campaign Plan:
-- Phase 1: P1-P20 (Perspective models)
-- Phase 2: IN1-IN20 (Inversion models)
-- Phase 3: CO1-CO20 (Composition models)
-- Phase 4: DE1-DE20 (Decomposition models) - DE7 complete
-- Phase 5: RE1-RE20 (Recursion models)
-- Phase 6: SY1-SY20 (Systems models)

-- Quality Checklist for Each Entry:
-- [ ] Code follows [TRANSFORMATION][NUMBER] format
-- [ ] Transformation code matches first letter of code
-- [ ] Name is descriptive and memorable
-- [ ] Definition is concise and actionable
-- [ ] whenToUse provides clear context
-- [ ] example is practical and specific
-- [ ] system_prompt is detailed for AI application
-- [ ] priority is unique within transformation (1-20)
-- [ ] No SQL syntax errors
-- [ ] Consistent formatting with existing entries

-- Usage Instructions:
-- 1. Copy this template for each new model
-- 2. Fill in all fields completely
-- 3. Run: npx wrangler d1 execute hummbl-models --local --file=seeds/[new-file].sql
-- 4. Verify: SELECT * FROM mental_models WHERE code='[CODE]';
-- 5. Test via API: curl http://localhost:8787/v1/models/[CODE]
