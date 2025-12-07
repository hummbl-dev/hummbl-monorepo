-- HUMMBL Base120 Perspective Models (P1-P20) - Production Schema
-- Adapted for existing table structure

-- P1: First Principles Thinking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P1',
  'First Principles Thinking',
  'P',
  'Break down complex problems into their most fundamental truths and reason up from there.',
  'Instead of accepting that cars cost $30,000 because that''s what they cost, ask: What are the raw materials? What is the manufacturing process? What is the actual cost to build?',
  'fundamentals,breakdown,reasoning',
  'intermediate',
  'P2,P3,P17',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P2: Second-Order Thinking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P2',
  'Second-Order Thinking',
  'P',
  'Consider the consequences of consequences. Think beyond immediate effects to downstream impacts.',
  'A new policy increases minimum wage. First-order: workers earn more. Second-order: businesses may reduce staff, increase prices, or automate jobs.',
  'consequences,downstream,ripple',
  'intermediate',
  'P16,SY2,SY5',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P3: Inversion
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P3',
  'Inversion',
  'P',
  'Approach problems from the opposite direction. Instead of asking how to achieve success, ask how to guarantee failure.',
  'Instead of asking "How can I be happy?", ask "What would make me miserable?" Then avoid those things.',
  'opposite,reverse,negative',
  'beginner',
  'P15,IN1,IN3',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P4: Occam''s Razor
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P4',
  'Occam''s Razor',
  'P',
  'Among competing hypotheses, the one with the fewest assumptions should be selected.',
  'A patient has a headache. Could be a rare brain tumor or simple dehydration. Start with the simplest explanation.',
  'simplicity,assumptions,parsimony',
  'beginner',
  'P14,DE3',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P5: Hanlon''s Razor
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P5',
  'Hanlon''s Razor',
  'P',
  'Never attribute to malice that which is adequately explained by stupidity or incompetence.',
  'Someone didn''t reply to your email. Assume they''re busy or forgot, not that they''re intentionally ignoring you.',
  'charity,incompetence,malice',
  'beginner',
  'P13,SY7',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P6: Circle of Competence
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P6',
  'Circle of Competence',
  'P',
  'Focus on areas where you have genuine expertise and acknowledge the boundaries of your knowledge.',
  'Warren Buffett avoids tech stocks because they''re outside his circle of competence, even if they seem promising.',
  'expertise,boundaries,knowledge',
  'intermediate',
  'P12,DE1',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P7: Thought Experiment
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P7',
  'Thought Experiment',
  'P',
  'Use hypothetical scenarios to explore ideas and test beliefs without real-world consequences.',
  'The trolley problem: Is it ethical to pull a lever to save five people at the cost of one?',
  'hypothetical,scenarios,testing',
  'intermediate',
  'P10,P18',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P8: Mr. Market
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P8',
  'Mr. Market',
  'P',
  'View market fluctuations as the mood swings of a manic-depressive business partner rather than rational indicators.',
  'Stock market crashes: Mr. Market is having a bad day, offering to sell you great companies at bargain prices.',
  'markets,volatility,emotions',
  'advanced',
  'P11,SY1',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P9: Map is Not the Territory
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P9',
  'Map is Not the Territory',
  'P',
  'Recognize that representations are not reality itself. Models simplify but cannot capture everything.',
  'A map shows major roads but misses small alleys and current construction. Use it as a guide, not absolute truth.',
  'models,representations,reality',
  'intermediate',
  'DE14,SY6',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P10: Thought Experiment
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P10',
  'Thought Experiment',
  'P',
  'Use hypothetical scenarios to explore ideas and test beliefs without real-world consequences.',
  'The trolley problem: Is it ethical to pull a lever to save five people at the cost of one?',
  'hypothetical,scenarios,testing',
  'intermediate',
  'P7,P18',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P11: Mr. Market
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P11',
  'Mr. Market',
  'P',
  'View market fluctuations as the mood swings of a manic-depressive business partner rather than rational indicators.',
  'Stock market crashes: Mr. Market is having a bad day, offering to sell you great companies at bargain prices.',
  'markets,volatility,emotions',
  'advanced',
  'P8,SY1',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P12: Circle of Competence
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P12',
  'Circle of Competence',
  'P',
  'Focus on areas where you have genuine expertise and acknowledge the boundaries of your knowledge.',
  'Warren Buffett avoids tech stocks because they''re outside his circle of competence, even if they seem promising.',
  'expertise,boundaries,knowledge',
  'intermediate',
  'P6,DE1',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P13: Hanlon''s Razor
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P13',
  'Hanlon''s Razor',
  'P',
  'Never attribute to malice that which is adequately explained by stupidity or incompetence.',
  'Someone didn''t reply to your email. Assume they''re busy or forgot, not that they''re intentionally ignoring you.',
  'charity,incompetence,malice',
  'beginner',
  'P5,SY7',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P14: Occam''s Razor
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P14',
  'Occam''s Razor',
  'P',
  'Among competing hypotheses, the one with the fewest assumptions should be selected.',
  'A patient has a headache. Could be a rare brain tumor or simple dehydration. Start with the simplest explanation.',
  'simplicity,assumptions,parsimony',
  'beginner',
  'P4,DE3',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P15: Inversion
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P15',
  'Inversion',
  'P',
  'Approach problems from the opposite direction. Instead of asking how to achieve success, ask how to guarantee failure.',
  'Instead of asking "How can I be happy?", ask "What would make me miserable?" Then avoid those things.',
  'opposite,reverse,negative',
  'beginner',
  'P3,IN1,IN3',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P16: Second-Order Thinking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P16',
  'Second-Order Thinking',
  'P',
  'Consider the consequences of consequences. Think beyond immediate effects to downstream impacts.',
  'A new policy increases minimum wage. First-order: workers earn more. Second-order: businesses may reduce staff, increase prices, or automate jobs.',
  'consequences,downstream,ripple',
  'intermediate',
  'P2,SY2,SY5',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P17: First Principles Thinking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P17',
  'First Principles Thinking',
  'P',
  'Break down complex problems into their most fundamental truths and reason up from there.',
  'Instead of accepting that cars cost $30,000 because that''s what they cost, ask: What are the raw materials? What is the manufacturing process? What is the actual cost to build?',
  'fundamentals,breakdown,reasoning',
  'intermediate',
  'P1,DE1',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P18: Analogical Reasoning
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P18',
  'Analogical Reasoning',
  'P',
  'Use similarities between different domains to solve problems and generate insights.',
  'Understanding electricity by comparing it to water flow: voltage is pressure, current is flow rate.',
  'analogies,similarities,domains',
  'intermediate',
  'P10,CO13',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P19: Perspective Taking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P19',
  'Perspective Taking',
  'P',
  'Adopt different viewpoints to understand problems more completely and find new solutions.',
  'Before negotiating, consider the other side''s constraints, goals, and perspective to find win-win solutions.',
  'viewpoints,empathy,understanding',
  'intermediate',
  'P20,SY13',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- P20: Reframing
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'P20',
  'Reframing',
  'P',
  'Change the conceptual or emotional frame around a situation to alter its meaning and impact.',
  'Instead of "I failed the test," reframe as "I discovered what I need to study more."',
  'frames,meaning,transformation',
  'beginner',
  'P19,IN9',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);
