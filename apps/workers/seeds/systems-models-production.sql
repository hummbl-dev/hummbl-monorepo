-- HUMMBL Base120 Systems Models (SY1-SY20) - Production Schema

-- SY1: Systems Thinking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY1',
  'Systems Thinking',
  'SY',
  'Understand how components interact within larger systems, focusing on relationships rather than parts.',
  'Traffic jam: Not just cars, but timing, roads, behavior, weather—all interacting.',
  'systems,relationships,interactions',
  'advanced',
  'SY2,CO9',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY2: Second-Order Effects
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY2',
  'Second-Order Effects',
  'SY',
  'Consider indirect and delayed consequences of actions within systems.',
  'Rent control: First-order helps tenants, second-order reduces housing supply, hurting tenants.',
  'consequences,indirect,delayed',
  'intermediate',
  'P16,SY5',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY3: Bottleneck Analysis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY3',
  'Bottleneck Analysis',
  'SY',
  'Identify the component that limits overall system performance.',
  'Factory output limited by slowest machine. Fix that, another becomes bottleneck.',
  'bottleneck,limits,performance',
  'intermediate',
  'DE8,SY4',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY4: Leverage Points
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY4',
  'Leverage Points',
  'SY',
  'Find places in systems where small changes create large impacts.',
  'Thermostat: Small temperature change controls entire building climate—high leverage.',
  'leverage,small,large',
  'advanced',
  'SY3,CO2',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY5: Feedback Loops
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY5',
  'Feedback Loops',
  'SY',
  'Identify circular causality where outputs become inputs, creating stability or growth.',
  'Population: More births → more people → more births (reinforcing) vs. predator-prey balance.',
  'feedback,circular,stability',
  'intermediate',
  'CO6,RE14',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY6: Emergent Properties
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY6',
  'Emergent Properties',
  'SY',
  'Properties of systems that arise from component interactions but aren''t present in components.',
  'Consciousness emerges from neurons interacting, though no single neuron is conscious.',
  'emergent,interactions,properties',
  'advanced',
  'CO7,CO1',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY7: Resilience Thinking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY7',
  'Resilience Thinking',
  'SY',
  'Design systems that can absorb shocks and maintain function.',
  'Forest ecosystem: Survives fires, droughts, pests through diversity and redundancy.',
  'resilience,shocks,maintain',
  'advanced',
  'IN2,IN18',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY8: System Archetypes
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY8',
  'System Archetypes',
  'SY',
  'Recognize common patterns of system behavior that recur across different domains.',
  'Tragedy of the commons: Individual rational actions lead to collective disaster.',
  'patterns,common,behavior',
  'intermediate',
  'SY1,DE15',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY9: Boundary Management
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY9',
  'Boundary Management',
  'SY',
  'Define and manage system boundaries to control interactions and influences.',
  'Cell membrane: Controls what enters/leaves, maintaining internal environment.',
  'boundaries,control,interactions',
  'intermediate',
  'SY1,DE9',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY10: Network Theory
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY10',
  'Network Theory',
  'SY',
  'Understand systems as networks of nodes and connections with varying importance.',
  'Internet: Some nodes (hubs) have many connections, making them critical to network function.',
  'networks,nodes,connections',
  'advanced',
  'CO3,SY19',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY11: Complexity Science
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY11',
  'Complexity Science',
  'SY',
  'Study how simple rules create complex, adaptive behavior in systems.',
  'Ant colonies: Simple individual rules create complex collective behavior.',
  'complexity,rules,adaptive',
  'advanced',
  'SY6,CO7',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY12: Cybernetics
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY12',
  'Cybernetics',
  'SY',
  'Study of control and communication in systems, both natural and artificial.',
  'Thermostat: Measures temperature, compares to goal, adjusts heating—control loop.',
  'control,communication,systems',
  'advanced',
  'SY5,RE13',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY13: Ecosystem Thinking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY13',
  'Ecosystem Thinking',
  'SY',
  'View systems as ecosystems with interdependent parts and energy flows.',
  'Business ecosystem: Companies, customers, suppliers all depend on each other.',
  'ecosystems,interdependent,flows',
  'advanced',
  'CO9,CO10',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY14: Socio-Technical Systems
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY14',
  'Socio-Technical Systems',
  'SY',
  'Understand how social and technical components interact to create system behavior.',
  'Social media: Technical platform + human behavior creates emergent social dynamics.',
  'social,technical,interact',
  'advanced',
  'SY1,P19',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY15: System Dynamics
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY15',
  'System Dynamics',
  'SY',
  'Model how system behavior changes over time through stocks, flows, and feedback.',
  'Climate change: CO2 stock, emission flows, temperature feedbacks over decades.',
  'dynamics,time,stocks',
  'advanced',
  'SY5,DE19',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY16: Adaptive Systems
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY16',
  'Adaptive Systems',
  'SY',
  'Systems that change their structure and behavior based on experience.',
  'Immune system: Adapts to recognize new pathogens, remembers them for future.',
  'adaptive,change,experience',
  'advanced',
  'RE13,SY7',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY17: Multi-Scale Analysis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY17',
  'Multi-Scale Analysis',
  'SY',
  'Analyze systems at multiple scales to understand cross-level interactions.',
  'Economics: Individual decisions → market behavior → national economy → global trade.',
  'scales,multiple,interactions',
  'advanced',
  'DE17,SY1',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY18: Phase Transitions
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY18',
  'Phase Transitions',
  'SY',
  'Points where systems undergo sudden, dramatic changes in behavior.',
  'Water to ice: Small temperature change creates sudden transformation from liquid to solid.',
  'transitions,sudden,dramatic',
  'advanced',
  'CO5,SY4',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY19: Self-Organization
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY19',
  'Self-Organization',
  'SY',
  'Systems that spontaneously create order without central control.',
  'Flocking birds: No leader, but coordinated patterns emerge from simple rules.',
  'spontaneous,order,control',
  'advanced',
  'RE5,SY11',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- SY20: Metasystem Transitions
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'SY20',
  'Metasystem Transitions',
  'SY',
  'Evolution creates systems that control lower-level systems, creating new levels of complexity.',
  'Life: Chemistry → cells → organisms → societies → global civilization.',
  'evolution,control,complexity',
  'advanced',
  'SY17,SY19',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);
