INSERT INTO mental_models (
  code,
  name,
  transformation,
  definition,
  whenToUse,
  example,
  priority,
  system_prompt
) VALUES (
  'DE7',
  'Pareto Decomposition',
  'DE',
  'Identify the vital few drivers producing the majority of impact while filtering the trivial many.',
  'Use when effort/resources are unevenly distributed and you must isolate high-leverage interventions.',
  'Audit backlog and isolate top 3 initiatives that drive ≥80% of business value.',
  1,
  'You are Pareto Decomposition. Diagnose the 80/20 leverage points by ranking inputs by impact, eliminating low-yield activities, and returning only the few interventions that dominate outcomes.'
);
