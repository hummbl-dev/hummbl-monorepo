-- HUMMBL Base120 Inversion Models (IN1-IN20) - Production Schema

-- IN1: Pre-Mortem Analysis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN1',
  'Pre-Mortem Analysis',
  'IN',
  'Imagine your project has failed completely, then work backward to identify what went wrong.',
  'Before launching a new product, imagine it''s a total flop. What caused it? Poor marketing? Technical issues? Bad timing?',
  'failure,planning,backward',
  'intermediate',
  'P15,IN2,DE3',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN2: Stress Testing
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN2',
  'Stress Testing',
  'IN',
  'Subject plans and systems to extreme conditions to identify breaking points and weaknesses.',
  'Test your business model: What happens if sales drop 50%? Or if your main supplier disappears?',
  'extreme,pressure,testing',
  'advanced',
  'IN1,SY7',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN3: Red Teaming
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN3',
  'Red Teaming',
  'IN',
  'Actively work against your own plans to find vulnerabilities and weaknesses.',
  'Form a team to actively find flaws in your new security system before attackers do.',
  'adversarial,security,weakness',
  'advanced',
  'IN4,IN16',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN4: Devil''s Advocate
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN4',
  'Devil''s Advocate',
  'IN',
  'Deliberately argue against prevailing opinions to test their strength and reveal blind spots.',
  'Everyone wants to launch the product immediately. You argue: "What if we wait? What risks are we ignoring?"',
  'opposition,challenging,groupthink',
  'intermediate',
  'P19,IN3',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN5: Failure Mode Analysis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN5',
  'Failure Mode Analysis',
  'IN',
  'Systematically identify all possible ways something can fail and their consequences.',
  'For a car braking system: Identify all failure modes (fluid leak, pad wear, sensor failure) and their effects.',
  'failure,analysis,systematic',
  'advanced',
  'DE3,IN1',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN6: Contrarian Thinking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN6',
  'Contrarian Thinking',
  'IN',
  'Deliberately oppose conventional wisdom to find opportunities others miss.',
  'Everyone says real estate is the best investment. You ask: What if it''s a bubble? What are they missing?',
  'opposition,unpopular,wisdom',
  'intermediate',
  'P5,IN4',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN7: Risk Paradox
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN7',
  'Risk Paradox',
  'IN',
  'The biggest risks often come from avoiding smaller risks, creating hidden vulnerabilities.',
  'Avoiding all investment risk by keeping cash creates inflation risk - the bigger danger.',
  'risk,paradox,hidden',
  'advanced',
  'SY2,IN18',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN8: Negative Space
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN8',
  'Negative Space',
  'IN',
  'Focus on what''s missing, not present, to reveal hidden patterns and opportunities.',
  'Everyone focuses on what features to add to a product. You ask: What should we remove? What are we not seeing?',
  'absence,missing,hidden',
  'intermediate',
  'DE10,P20',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN9: Anti-Goals
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN9',
  'Anti-Goals',
  'IN',
  'Define what you definitely don''t want to achieve to clarify what you do want.',
  'Instead of "I want to be successful," define "I definitely don''t want to be stressed, poor, or unfulfilled."',
  'negative,avoidance,clarity',
  'beginner',
  'P20,IN17',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN10: Reverse Brainstorming
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN10',
  'Reverse Brainstorming',
  'IN',
  'Brainstorm ways to cause a problem rather than solve it, then invert the solutions.',
  'Instead of "How to improve customer service?" ask "How to make customer service terrible?" Then do the opposite.',
  'reverse,brainstorming,inversion',
  'intermediate',
  'P3,CO14',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN11: Dark Side Analysis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN11',
  'Dark Side Analysis',
  'IN',
  'Explore the unethical or malicious versions of your ideas to understand their vulnerabilities.',
  'Design a social platform, then imagine how it could be used for manipulation, addiction, or surveillance.',
  'unethical,malicious,vulnerabilities',
  'advanced',
  'IN16,SY7',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN12: Failure Simulation
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN12',
  'Failure Simulation',
  'IN',
  'Actively simulate failure scenarios to identify weaknesses before they occur.',
  'Simulate a server crash during peak traffic to test recovery procedures.',
  'simulation,failure,preparation',
  'advanced',
  'IN1,IN2',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN13: Opposition Research
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN13',
  'Opposition Research',
  'IN',
  'Research opposing viewpoints as thoroughly as your own to strengthen your position.',
  'Study climate change denial: denial arguments in depth to better defend climate science.',
  'opposing,research,strength',
  'intermediate',
  'P19,IN4',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN14: Reverse Engineering
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN14',
  'Reverse Engineering',
  'IN',
  'Deconstruct successful systems to understand their weaknesses and how to improve them.',
  'Take apart a successful app to understand its vulnerabilities and how to build a better alternative.',
  'deconstruct,successful,improve',
  'intermediate',
  'DE1,CO12',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN15: Anti-Patterns
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN15',
  'Anti-Patterns',
  'IN',
  'Study common mistakes and poor solutions to avoid them in your own work.',
  'Study failed startups to understand what not to do in your own business.',
  'mistakes,anti-patterns,avoidance',
  'intermediate',
  'DE3,IN19',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN16: Sabotage Thinking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN16',
  'Sabotage Thinking',
  'IN',
  'Imagine how you could sabotage your own project to identify hidden vulnerabilities.',
  'How could someone sabotage your supply chain? Then build protections against those scenarios.',
  'sabotage,vulnerabilities,protection',
  'advanced',
  'IN3,IN11',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN17: Inverse Prioritization
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN17',
  'Inverse Prioritization',
  'IN',
  'Identify what to avoid doing rather than what to do, focusing on preventing damage.',
  'Instead of "what should I prioritize?", ask "what should I definitely not do?"',
  'avoidance,prioritization,prevention',
  'beginner',
  'IN9,DE5',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN18: Worst-Case Scenario Planning
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN18',
  'Worst-Case Scenario Planning',
  'IN',
  'Plan for the absolute worst outcomes to build resilience and contingency plans.',
  'Plan for complete market collapse, natural disaster, or total system failure.',
  'worst-case,resilience,planning',
  'advanced',
  'IN2,SY7',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN19: Inverse Benchmarking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN19',
  'Inverse Benchmarking',
  'IN',
  'Study worst practices and failures to understand what to avoid.',
  'Study failed companies to understand what practices to avoid.',
  'worst-practices,failures,avoidance',
  'intermediate',
  'IN15,DE3',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- IN20: Deconstruction Analysis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'IN20',
  'Deconstruction Analysis',
  'IN',
  'Break down arguments or systems to find logical fallacies and structural weaknesses.',
  'Deconstruct a political argument to find logical fallacies and unsupported assumptions.',
  'deconstruction,fallacies,weakness',
  'advanced',
  'DE1,P4',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);
