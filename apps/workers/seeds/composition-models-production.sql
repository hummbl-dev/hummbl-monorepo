-- HUMMBL Base120 Composition Models (CO1-CO20) - Production Schema

-- CO1: Synergy
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO1',
  'Synergy',
  'CO',
  'The whole is greater than the sum of its parts. Combine elements to create emergent value.',
  'Apple combined hardware, software, and services to create an ecosystem more valuable than any single part.',
  'emergence,combination,value',
  'intermediate',
  'CO2,SY6',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO2: Lollapalooza Effect
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO2',
  'Lollapalooza Effect',
  'CO',
  'Multiple factors acting together create an extreme result far beyond their individual impacts.',
  'Google''s success: Search quality + business model + timing + network effects created unprecedented dominance.',
  'extreme,multiple,factors',
  'advanced',
  'CO1,CO11',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO3: Network Effects
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO3',
  'Network Effects',
  'CO',
  'The value of a product or service increases as more people use it.',
  'Facebook becomes more valuable as more friends join. Each new user makes the service better for everyone.',
  'network,value,growth',
  'intermediate',
  'CO4,RE8',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO4: Critical Mass
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO4',
  'Critical Mass',
  'CO',
  'The point at which a system becomes self-sustaining and grows exponentially.',
  'A social movement needs enough supporters to become self-propagating without constant promotion.',
  'threshold,self-sustaining,growth',
  'intermediate',
  'CO3,CO5',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO5: Tipping Point
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO5',
  'Tipping Point',
  'CO',
  'The moment when small changes accumulate to create a major transformation.',
  'A viral video slowly gains views, then suddenly explodes when it crosses the tipping point of sharing.',
  'transformation,accumulation,moment',
  'intermediate',
  'CO4,SY18',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO6: Feedback Loops
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO6',
  'Feedback Loops',
  'CO',
  'Systems where outputs become inputs, creating cycles of amplification or regulation.',
  'Success breeds more success: Winning companies attract better talent, leading to more success.',
  'cycles,amplification,regulation',
  'intermediate',
  'SY5,RE6',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO7: Emergence
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO7',
  'Emergence',
  'CO',
  'Complex systems exhibit properties not present in their individual components.',
  'Ant colonies exhibit intelligent behavior despite individual ants having minimal intelligence.',
  'complex,properties,components',
  'advanced',
  'SY6,CO1',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO8: Modular Design
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO8',
  'Modular Design',
  'CO',
  'Build systems from interchangeable components that can be combined in various ways.',
  'LEGO bricks can create infinite designs from simple, standardized components.',
  'interchangeable,components,flexible',
  'intermediate',
  'DE9,CO12',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO9: Ecosystem Thinking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO9',
  'Ecosystem Thinking',
  'CO',
  'Consider how elements interact within a larger system, not just their individual properties.',
  'A startup isn''t just a company—it''s part of an ecosystem of customers, competitors, partners, and regulators.',
  'interactions,system,larger',
  'advanced',
  'SY13,CO10',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO10: Symbiosis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO10',
  'Symbiosis',
  'CO',
  'Different entities cooperate for mutual benefit, creating relationships where all parties gain.',
  'Riders and drivers in ride-sharing create mutual value that neither could achieve alone.',
  'cooperation,mutual,benefit',
  'intermediate',
  'CO9,CO19',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO11: Convergence
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO11',
  'Convergence',
  'CO',
  'Multiple independent trends or technologies combine to create new opportunities.',
  'Mobile internet + GPS + sensors + cloud computing created the app economy.',
  'trends,technologies,opportunities',
  'advanced',
  'CO2,CO18',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO12: Integration
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO12',
  'Integration',
  'CO',
  'Combine separate systems or components into a unified, cohesive whole.',
  'Integrate CRM, email, and social media into a single customer communication platform.',
  'unified,cohesive,systems',
  'intermediate',
  'CO8,CO15',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO13: Cross-Pollination
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO13',
  'Cross-Pollination',
  'CO',
  'Transfer ideas, methods, or solutions from one domain to solve problems in another.',
  'Apply biological evolution concepts to business strategy development.',
  'transfer,domains,solutions',
  'intermediate',
  'P18,CO14',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO14: Synthesis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO14',
  'Synthesis',
  'CO',
  'Combine opposing or different ideas to create new, more comprehensive understanding.',
  'Combine efficiency and sustainability to create "lean green" business models.',
  'opposing,comprehensive,understanding',
  'advanced',
  'CO13,P19',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO15: Orchestration
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO15',
  'Orchestration',
  'CO',
  'Coordinate multiple independent elements to work together harmoniously.',
  'Orchestrate marketing, sales, and product teams for perfect product launch timing.',
  'coordinate,harmoniously,elements',
  'advanced',
  'CO12,CO20',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO16: Hybridization
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO16',
  'Hybridization',
  'CO',
  'Combine different approaches or systems to create hybrid solutions with combined benefits.',
  'Combine online and offline retail to create omnichannel shopping experience.',
  'hybrid,approaches,benefits',
  'intermediate',
  'CO17,CO12',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO17: Fusion
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO17',
  'Fusion',
  'CO',
  'Merge elements so completely they become something new, losing their original identities.',
  'Smartphones fused phone, camera, computer, and GPS into a new category.',
  'merge,new,identities',
  'advanced',
  'CO16,CO20',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO18: Confluence
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO18',
  'Confluence',
  'CO',
  'Multiple streams or influences flow together to create amplified effects.',
  'Market demand + technological readiness + capital availability create investment confluence.',
  'streams,amplified,flow',
  'intermediate',
  'CO11,CO5',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO19: Amalgamation
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO19',
  'Amalgamation',
  'CO',
  'Blend diverse elements into a unified whole while preserving individual characteristics.',
  'Amalgamate different company cultures while preserving unique strengths of each.',
  'blend,diverse,preserve',
  'advanced',
  'CO10,CO16',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- CO20: Constellation
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'CO20',
  'Constellation',
  'CO',
  'Arrange multiple elements in a pattern where each enhances the others'' value.',
  'Create a portfolio of products that each support and enhance the others.',
  'pattern,enhance,arrange',
  'advanced',
  'CO15,CO17',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);
