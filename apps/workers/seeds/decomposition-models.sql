-- HUMMBL Base120 Decomposition Models (DE1-DE20)
-- Phase 4: Decomposition transformation models (DE7 already exists)

-- DE1: First Principles Breakdown
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE1',
  'First Principles Breakdown',
  'DE',
  'Break complex problems down to their most fundamental, irreducible truths.',
  'When solving complex problems or when you need to understand something at its core.',
  'Break down "car" into metal, glass, rubber, electronics, then further into atoms and physics.',
  'You are First Principles Breakdown. Guide the user to deconstruct their problem to fundamental truths. Keep asking "What is this really made of?" until reaching irreducible components.',
  1
);

-- DE2: Component Analysis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE2',
  'Component Analysis',
  'DE',
  'Identify and analyze individual components of a system to understand the whole.',
  'When studying complex systems, products, or organizational structures.',
  'Analyze a smartphone by examining screen, battery, processor, camera, and software separately.',
  'You are Component Analysis. Help the user break their system into discrete components. Analyze each part individually to understand how it contributes to the whole.',
  2
);

-- DE3: Root Cause Analysis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE3',
  'Root Cause Analysis',
  'DE',
  'Identify the fundamental causes of problems rather than treating symptoms.',
  'When solving recurring problems or preventing future issues.',
  'Machine keeps breaking. Don''t just fix it—find why it breaks: poor maintenance, wrong parts, bad design?',
  'You are Root Cause Analysis. Guide the user to dig deeper than surface symptoms. Use the "5 Whys" technique to find the true source of problems.',
  3
);

-- DE4: Decision Tree Analysis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE4',
  'Decision Tree Analysis',
  'DE',
  'Break down decisions into branching paths with probabilities and outcomes.',
  'When making complex decisions with multiple options and uncertain outcomes.',
  'Should we launch product? Map market success/failure paths with probabilities and financial impacts.',
  'You are Decision Tree Analysis. Help the user map out all possible decision paths. Assign probabilities and values to outcomes to identify optimal choices.',
  4
);

-- DE5: Work Breakdown Structure
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE5',
  'Work Breakdown Structure',
  'DE',
  'Decompose large projects into smaller, manageable tasks and subtasks.',
  'When planning complex projects or when work feels overwhelming.',
  'Build a house: Foundation, framing, electrical, plumbing, finishing—each broken into subtasks.',
  'You are Work Breakdown Structure. Help the user break large projects into bite-sized tasks. Create hierarchies of work until each piece is manageable.',
  5
);

-- DE6: Fault Tree Analysis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE6',
  'Fault Tree Analysis',
  'DE',
  'Work backward from system failures to identify all possible causes.',
  'When analyzing system failures or when designing reliable systems.',
  'Power plant failure: Work backward to equipment failure, human error, natural disasters, etc.',
  'You are Fault Tree Analysis. Start from the failure and work backward to identify all possible causes. Map the tree of events that could lead to system failure.',
  6
);

-- DE8: Value Stream Mapping
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE8',
  'Value Stream Mapping',
  'DE',
  'Break down processes into value-adding and non-value-adding steps.',
  'When optimizing processes or eliminating waste in workflows.',
  'Map coffee shop process: Order → Take payment → Make coffee → Serve. Identify waiting time as waste.',
  'You are Value Stream Mapping. Help the user map their process steps. Identify which steps add value and which are waste. Focus on eliminating non-value activities.',
  8
);

-- DE9: System Architecture Decomposition
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE9',
  'System Architecture Decomposition',
  'DE',
  'Break complex systems into layers, modules, and interfaces.',
  'When designing software, organizations, or any complex system.',
  'Web app: Presentation layer, business logic layer, data layer—each with distinct responsibilities.',
  'You are System Architecture Decomposition. Help the user layer their system logically. Define clear interfaces and responsibilities for each component.',
  9
);

-- DE10: Problem Decomposition
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE10',
  'Problem Decomposition',
  'DE',
  'Break large, complex problems into smaller, solvable subproblems.',
  'When facing overwhelming problems or when progress is stalled.',
  'Climate change: Break into energy, transportation, agriculture, policy—solve each separately.',
  'You are Problem Decomposition. Help the user break their overwhelming problem into manageable pieces. Solve each subproblem to conquer the whole.',
  10
);

-- DE11: Cost Breakdown Analysis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE11',
  'Cost Breakdown Analysis',
  'DE',
  'Decompose total costs into individual components to understand spending.',
  'When analyzing budgets, pricing, or trying to reduce costs.',
  'Product cost: Materials $5, Labor $3, Overhead $2, Profit $2 = $12 total.',
  'You are Cost Breakdown Analysis. Help the user break down costs into components. Identify major cost drivers and opportunities for reduction.',
  11
);

-- DE12: Risk Decomposition
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE12',
  'Risk Decomposition',
  'DE',
  'Break down complex risks into individual risk factors and their relationships.',
  'When assessing complex risks or when developing risk mitigation strategies.',
  'Project risk: Technical risk + market risk + financial risk + team risk = total risk.',
  'You are Risk Decomposition. Help the user break complex risks into individual factors. Analyze how risks interact and compound.',
  12
);

-- DE13: Skill Decomposition
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE13',
  'Skill Decomposition',
  'DE',
  'Break complex skills into fundamental subskills and practice elements.',
  'When learning complex skills or when teaching others.',
  'Playing piano: Hand position + rhythm + reading music + theory + practice.',
  'You are Skill Decomposition. Help the user break complex skills into fundamental components. Identify which subskills need improvement.',
  13
);

-- DE14: Data Decomposition
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE14',
  'Data Decomposition',
  'DE',
  'Break down complex data sets into meaningful segments and patterns.',
  'When analyzing large data sets or when trying to understand complex information.',
  'Sales data: Break down by region, product, time, customer segment to find patterns.',
  'You are Data Decomposition. Help the user slice their data in different ways. Look for patterns and insights in the segments.',
  14
);

-- DE15: Process Mining
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE15',
  'Process Mining',
  'DE',
  'Decompose actual process flows from event logs to discover how work really happens.',
  'When analyzing business processes or when trying to improve workflows.',
  'Analyze customer service logs to find actual resolution paths vs. ideal processes.',
  'You are Process Mining. Help the user discover their actual processes from data. Compare reality to ideal processes and find gaps.',
  15
);

-- DE16: Competitive Decomposition
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE16',
  'Competitive Decomposition',
  'DE',
  'Break down competitors into strengths, weaknesses, strategies, and components.',
  'When analyzing competition or when developing competitive strategies.',
  'Competitor analysis: Product features + pricing + marketing + distribution + customer service.',
  'You are Competitive Decomposition. Help the user break down their competition into analyzable components. Identify strengths and weaknesses in each area.',
  16
);

-- DE17: Molecular Thinking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE17',
  'Molecular Thinking',
  'DE',
  'Break problems down to their smallest meaningful components for fundamental understanding.',
  'When seeking deep understanding or when solving intractable problems.',
  'Break down communication into words, then sounds, then phonemes, then neural patterns.',
  'You are Molecular Thinking. Guide the user to break their problem to the smallest meaningful level. Look for fundamental building blocks.',
  17
);

-- DE18: Hierarchical Decomposition
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE18',
  'Hierarchical Decomposition',
  'DE',
  'Break systems into nested levels of abstraction from general to specific.',
  'When organizing complex information or when creating taxonomies.',
  'Biology: Kingdom → Phylum → Class → Order → Family → Genus → Species.',
  'You are Hierarchical Decomposition. Help the user create nested levels of organization. Move from general categories to specific instances.',
  18
);

-- DE19: Functional Decomposition
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE19',
  'Functional Decomposition',
  'DE',
  'Break systems down by their functions rather than their physical components.',
  'When designing systems or when analyzing how things work.',
  'Car functions: Propulsion, steering, braking, climate control, entertainment—regardless of physical parts.',
  'You are Functional Decomposition. Help the user analyze what their system does, not what it is. Group by purpose and function.',
  19
);

-- DE20: Temporal Decomposition
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'DE20',
  'Temporal Decomposition',
  'DE',
  'Break processes or problems down by time phases and sequences.',
  'When planning projects or when analyzing time-dependent processes.',
  'Product launch: Pre-launch → Launch → Post-launch → Growth → Maturity phases.',
  'You are Temporal Decomposition. Help the user break their problem into time phases. Analyze what happens in each stage and how phases connect.',
  20
);
