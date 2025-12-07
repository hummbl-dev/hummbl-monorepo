-- HUMMBL Base120 Decomposition Models (DE1-DE20) - Production Schema

-- DE1: First Principles Breakdown
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE1',
  'First Principles Breakdown',
  'DE',
  'Break complex problems down to their most fundamental, irreducible truths.',
  'Break down "car" into metal, glass, rubber, electronics, then further into atoms and physics.',
  'fundamental,irreducible,truths',
  'advanced',
  'P17,DE3',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE2: Component Analysis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE2',
  'Component Analysis',
  'DE',
  'Identify and analyze individual components of a system to understand the whole.',
  'Analyze a smartphone by examining screen, battery, processor, camera, and software separately.',
  'components,individual,system',
  'intermediate',
  'DE9,DE1',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE3: Root Cause Analysis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE3',
  'Root Cause Analysis',
  'DE',
  'Identify the fundamental causes of problems rather than treating symptoms.',
  'Machine keeps breaking. Don''t just fix it—find why it breaks: poor maintenance, wrong parts, bad design?',
  'fundamental,causes,symptoms',
  'intermediate',
  'P4,DE5',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE4: Decision Tree Analysis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE4',
  'Decision Tree Analysis',
  'DE',
  'Break down decisions into branching paths with probabilities and outcomes.',
  'Should we launch product? Map market success/failure paths with probabilities and financial impacts.',
  'branching,probabilities,outcomes',
  'intermediate',
  'DE10,RE6',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE5: Work Breakdown Structure
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE5',
  'Work Breakdown Structure',
  'DE',
  'Decompose large projects into smaller, manageable tasks and subtasks.',
  'Build a house: Foundation, framing, electrical, plumbing, finishing—each broken into subtasks.',
  'projects,manageable,tasks',
  'intermediate',
  'DE10,DE4',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE6: Fault Tree Analysis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE6',
  'Fault Tree Analysis',
  'DE',
  'Work backward from system failures to identify all possible causes.',
  'Power plant failure: Work backward to equipment failure, human error, natural disasters, etc.',
  'backward,failures,causes',
  'advanced',
  'DE3,IN1',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE7: Problem Decomposition
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE7',
  'Problem Decomposition',
  'DE',
  'Break large, complex problems into smaller, solvable subproblems.',
  'Climate change: Break into energy, transportation, agriculture, policy—solve each separately.',
  'complex,solvable,subproblems',
  'intermediate',
  'DE5,DE10',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE8: Value Stream Mapping
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE8',
  'Value Stream Mapping',
  'DE',
  'Break down processes into value-adding and non-value-adding steps.',
  'Map coffee shop process: Order → Take payment → Make coffee → Serve. Identify waiting time as waste.',
  'processes,value,waste',
  'intermediate',
  'DE9,DE5',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE9: System Architecture Decomposition
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE9',
  'System Architecture Decomposition',
  'DE',
  'Break complex systems into layers, modules, and interfaces.',
  'Web app: Presentation layer, business logic layer, data layer—each with distinct responsibilities.',
  'layers,modules,interfaces',
  'advanced',
  'DE2,CO8',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE10: Cost Breakdown Analysis
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE10',
  'Cost Breakdown Analysis',
  'DE',
  'Decompose total costs into individual components to understand spending.',
  'Product cost: Materials $5, Labor $3, Overhead $2, Profit $2 = $12 total.',
  'costs,components,spending',
  'intermediate',
  'DE11,DE5',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE11: Risk Decomposition
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE11',
  'Risk Decomposition',
  'DE',
  'Break down complex risks into individual risk factors and their relationships.',
  'Project risk: Technical risk + market risk + financial risk + team risk = total risk.',
  'risks,factors,relationships',
  'advanced',
  'DE12,IN7',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE12: Skill Decomposition
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE12',
  'Skill Decomposition',
  'DE',
  'Break complex skills into fundamental subskills and practice elements.',
  'Playing piano: Hand position + rhythm + reading music + theory + practice.',
  'skills,fundamental,subskills',
  'intermediate',
  'DE13,RE1',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE13: Data Decomposition
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE13',
  'Data Decomposition',
  'DE',
  'Break down complex data sets into meaningful segments and patterns.',
  'Sales data: Break down by region, product, time, customer segment to find patterns.',
  'data,segments,patterns',
  'intermediate',
  'DE14,DE2',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE14: Process Mining
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE14',
  'Process Mining',
  'DE',
  'Decompose actual process flows from event logs to discover how work really happens.',
  'Analyze customer service logs to find actual resolution paths vs. ideal processes.',
  'processes,flows,actual',
  'advanced',
  'DE8,DE9',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE15: Competitive Decomposition
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE15',
  'Competitive Decomposition',
  'DE',
  'Break down competitors into strengths, weaknesses, strategies, and components.',
  'Competitor analysis: Product features + pricing + marketing + distribution + customer service.',
  'competitors,strengths,weaknesses',
  'intermediate',
  'DE16,IN6',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE16: Molecular Thinking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE16',
  'Molecular Thinking',
  'DE',
  'Break problems down to their smallest meaningful components for fundamental understanding.',
  'Break down communication into words, then sounds, then phonemes, then neural patterns.',
  'smallest,meaningful,fundamental',
  'advanced',
  'DE1,DE17',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE17: Hierarchical Decomposition
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE17',
  'Hierarchical Decomposition',
  'DE',
  'Break systems into nested levels of abstraction from general to specific.',
  'Biology: Kingdom → Phylum → Class → Order → Family → Genus → Species.',
  'nested,abstraction,levels',
  'intermediate',
  'DE18,DE9',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE18: Functional Decomposition
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE18',
  'Functional Decomposition',
  'DE',
  'Break systems down by their functions rather than their physical components.',
  'Car functions: Propulsion, steering, braking, climate control, entertainment—regardless of physical parts.',
  'functions,physical,components',
  'intermediate',
  'DE19,DE9',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE19: Temporal Decomposition
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE19',
  'Temporal Decomposition',
  'DE',
  'Break processes or problems down by time phases and sequences.',
  'Product launch: Pre-launch → Launch → Post-launch → Growth → Maturity phases.',
  'time,phases,sequences',
  'intermediate',
  'DE20,DE5',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- DE20: Problem Space Decomposition
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'DE20',
  'Problem Space Decomposition',
  'DE',
  'Break down complex problem domains into manageable subdomains.',
  'Healthcare: Break into prevention, diagnosis, treatment, recovery, and research subdomains.',
  'domains,subdomains,manageable',
  'advanced',
  'DE7,DE10',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);
