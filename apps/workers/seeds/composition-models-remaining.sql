-- HUMMBL Base120 Remaining Composition Models (CO11-CO20)
-- Adding the missing models to complete the Composition transformation

-- CO11: Convergence
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO11',
  'Convergence',
  'CO',
  'Multiple independent trends or technologies combine to create new opportunities.',
  'When analyzing technological trends, market shifts, or when timing innovations.',
  'Mobile internet + GPS + sensors + cloud computing created the app economy.',
  'You are Convergence. Help the user identify how independent trends are converging to create new possibilities. Look for the intersection of multiple developments.',
  11
);

-- CO12: Integration
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO12',
  'Integration',
  'CO',
  'Combine separate systems or components into a unified, cohesive whole.',
  'When merging systems, building platforms, or when creating seamless experiences.',
  'Integrate CRM, email, and social media into a single customer communication platform.',
  'You are Integration. Help the user combine separate elements into unified systems. Focus on creating seamless interfaces and coherent experiences.',
  12
);

-- CO13: Cross-Pollination
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO13',
  'Cross-Pollination',
  'CO',
  'Transfer ideas, methods, or solutions from one domain to solve problems in another.',
  'When seeking innovative solutions or when you need fresh perspectives.',
  'Apply biological evolution concepts to business strategy development.',
  'You are Cross-Pollination. Help the user find solutions by borrowing ideas from different domains. Look for parallels between unrelated fields.',
  13
);

-- CO14: Synthesis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO14',
  'Synthesis',
  'CO',
  'Combine opposing or different ideas to create new, more comprehensive understanding.',
  'When resolving conflicts, integrating perspectives, or when you need higher-level insights.',
  'Combine efficiency and sustainability to create "lean green" business models.',
  'You are Synthesis. Help the user combine different or opposing ideas into higher-level understanding. Find the truth that encompasses multiple viewpoints.',
  14
);

-- CO15: Orchestration
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO15',
  'Orchestration',
  'CO',
  'Coordinate multiple independent elements to work together harmoniously.',
  'When managing complex projects, leading teams, or when coordinating systems.',
  'Orchestrate marketing, sales, and product teams for perfect product launch timing.',
  'You are Orchestration. Help the user coordinate multiple independent elements. Focus on timing, harmony, and coordinated action.',
  15
);

-- CO16: Hybridization
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO16',
  'Hybridization',
  'CO',
  'Combine different approaches or systems to create hybrid solutions with combined benefits.',
  'When traditional approaches are insufficient or when you need the best of multiple worlds.',
  'Combine online and offline retail to create omnichannel shopping experience.',
  'You are Hybridization. Help the user combine different approaches to create hybrid solutions. Focus on capturing the benefits of each component.',
  16
);

-- CO17: Fusion
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO17',
  'Fusion',
  'CO',
  'Merge elements so completely they become something new, losing their original identities.',
  'When creating fundamentally new solutions or when traditional categories don''t fit.',
  'Smartphones fused phone, camera, computer, and GPS into a new category.',
  'You are Fusion. Help the user merge elements so completely they become something entirely new. Focus on transformation rather than combination.',
  17
);

-- CO18: Confluence
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO18',
  'Confluence',
  'CO',
  'Multiple streams or influences flow together to create amplified effects.',
  'When timing is critical or when multiple factors need to align.',
  'Market demand + technological readiness + capital availability create investment confluence.',
  'You are Confluence. Help the user identify when multiple factors are flowing together. Look for the convergence of timing and conditions.',
  18
);

-- CO19: Amalgamation
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO19',
  'Amalgamation',
  'CO',
  'Blend diverse elements into a unified whole while preserving individual characteristics.',
  'When integrating diverse cultures, ideas, or when you need unity with diversity.',
  'Amalgamate different company cultures while preserving unique strengths of each.',
  'You are Amalgamation. Help the user blend diverse elements into unity. Focus on preserving valuable differences while creating coherence.',
  19
);

-- CO20: Constellation
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO20',
  'Constellation',
  'CO',
  'Arrange multiple elements in a pattern where each enhances the others'' value.',
  'When designing ecosystems, portfolios, or when creating mutually reinforcing systems.',
  'Create a portfolio of products that each support and enhance the others.',
  'You are Constellation. Help the user arrange elements in patterns where each supports the others. Focus on creating mutually reinforcing value.',
  20
);
