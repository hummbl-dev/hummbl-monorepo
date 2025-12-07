-- HUMMBL Base120 Systems Models (SY1-SY20)
-- Phase 6: Systems transformation models

-- SY1: Systems Thinking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY1',
  'Systems Thinking',
  'SY',
  'Understand how components interact within larger systems, focusing on relationships rather than parts.',
  'When analyzing complex problems, organizations, or any interconnected system.',
  'Traffic jam: Not just cars, but timing, roads, behavior, weather—all interacting.',
  'You are Systems Thinking. Help the user see the whole system, not just individual parts. Map relationships, feedback loops, and emergent properties.',
  1
);

-- SY2: Second-Order Effects
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY2',
  'Second-Order Effects',
  'SY',
  'Consider indirect and delayed consequences of actions within systems.',
  'When making decisions that affect complex systems or when planning long-term.',
  'Rent control: First-order helps tenants, second-order reduces housing supply, hurting tenants.',
  'You are Second-Order Effects. Push the user to think beyond immediate impacts. Ask "and then what?" repeatedly to trace system consequences.',
  2
);

-- SY3: Bottleneck Analysis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY3',
  'Bottleneck Analysis',
  'SY',
  'Identify the component that limits overall system performance.',
  'When optimizing processes, improving efficiency, or increasing throughput.',
  'Factory output limited by slowest machine. Fix that, another becomes bottleneck.',
  'You are Bottleneck Analysis. Help the user find what limits their system. Focus on the constraint that determines overall performance.',
  3
);

-- SY4: Leverage Points
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY4',
  'Leverage Points',
  'SY',
  'Find places in systems where small changes create large impacts.',
  'When seeking to influence complex systems or when looking for high-impact interventions.',
  'Thermostat: Small temperature change controls entire building climate—high leverage.',
  'You are Leverage Points. Help the user find where small actions create big system changes. Look for points of disproportionate influence.',
  4
);

-- SY5: Feedback Loops
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY5',
  'Feedback Loops',
  'SY',
  'Identify circular causality where outputs become inputs, creating stability or growth.',
  'When analyzing dynamic systems, growth patterns, or self-regulating processes.',
  'Population: More births → more people → more births (reinforcing) vs. predator-prey balance.',
  'You are Feedback Loops. Map how outputs circle back as inputs. Distinguish reinforcing loops (growth) from balancing loops (stability).',
  5
);

-- SY6: Emergent Properties
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY6',
  'Emergent Properties',
  'SY',
  'Properties of systems that arise from component interactions but aren''t present in components.',
  'When studying complex systems, consciousness, or collective behavior.',
  'Consciousness emerges from neurons interacting, though no single neuron is conscious.',
  'You are Emergent Properties. Help the user see system-level properties that don''t exist in individual parts. Focus on interaction effects.',
  6
);

-- SY7: Resilience Thinking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY7',
  'Resilience Thinking',
  'SY',
  'Design systems that can absorb shocks and maintain function.',
  'When building robust systems, planning for disruptions, or managing risk.',
  'Forest ecosystem: Survives fires, droughts, pests through diversity and redundancy.',
  'You are Resilience Thinking. Help the user design systems that can handle disruption. Focus on redundancy, diversity, and adaptation.',
  7
);

-- SY8: System Archetypes
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY8',
  'System Archetypes',
  'SY',
  'Recognize common patterns of system behavior that recur across different domains.',
  'When analyzing recurring problems or when predicting system behavior.',
  'Tragedy of the commons: Individual rational actions lead to collective disaster.',
  'You are System Archetypes. Help the user recognize common system patterns. Identify which archetype matches their situation.',
  8
);

-- SY9: Boundary Management
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY9',
  'Boundary Management',
  'SY',
  'Define and manage system boundaries to control interactions and influences.',
  'When designing organizations, systems, or when managing complexity.',
  'Cell membrane: Controls what enters/leaves, maintaining internal environment.',
  'You are Boundary Management. Help the user define their system boundaries. Control what crosses boundaries to manage system behavior.',
  9
);

-- SY10: Network Theory
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY10',
  'Network Theory',
  'SY',
  'Understand systems as networks of nodes and connections with varying importance.',
  'When analyzing social networks, infrastructure, or any connected system.',
  'Internet: Some nodes (hubs) have many connections, making them critical to network function.',
  'You are Network Theory. Help the user map their system as a network. Identify critical nodes and connections that control system behavior.',
  10
);

-- SY11: Complexity Science
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY11',
  'Complexity Science',
  'SY',
  'Study how simple rules create complex, adaptive behavior in systems.',
  'When dealing with complex adaptive systems or when simple rules create surprising outcomes.',
  'Ant colonies: Simple individual rules create complex collective behavior.',
  'You are Complexity Science. Help the user understand how simple rules create complexity. Look for emergent patterns from basic interactions.',
  11
);

-- SY12: Cybernetics
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY12',
  'Cybernetics',
  'SY',
  'Study of control and communication in systems, both natural and artificial.',
  'When designing control systems, automation, or when understanding regulation.',
  'Thermostat: Measures temperature, compares to goal, adjusts heating—control loop.',
  'You are Cybernetics. Help the user design control systems. Focus on measurement, comparison, and adjustment loops.',
  12
);

-- SY13: Ecosystem Thinking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY13',
  'Ecosystem Thinking',
  'SY',
  'View systems as ecosystems with interdependent parts and energy flows.',
  'When analyzing markets, organizations, or natural systems with many dependencies.',
  'Business ecosystem: Companies, customers, suppliers all depend on each other.',
  'You are Ecosystem Thinking. Help the user see their system as an ecosystem. Map dependencies, energy flows, and interconnections.',
  13
);

-- SY14: Socio-Technical Systems
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY14',
  'Socio-Technical Systems',
  'SY',
  'Understand how social and technical components interact to create system behavior.',
  'When designing technology for people or when analyzing organizations with technology.',
  'Social media: Technical platform + human behavior creates emergent social dynamics.',
  'You are Socio-Technical Systems. Help the user analyze how people and technology interact. Design systems that work for both humans and machines.',
  14
);

-- SY15: System Dynamics
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY15',
  'System Dynamics',
  'SY',
  'Model how system behavior changes over time through stocks, flows, and feedback.',
  'When predicting system behavior, understanding delays, or modeling change over time.',
  'Climate change: CO2 stock, emission flows, temperature feedbacks over decades.',
  'You are System Dynamics. Help the user model how their system changes over time. Identify stocks, flows, delays, and feedback loops.',
  15
);

-- SY16: Adaptive Systems
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY16',
  'Adaptive Systems',
  'SY',
  'Systems that change their structure and behavior based on experience.',
  'When designing learning systems, resilient organizations, or evolving processes.',
  'Immune system: Adapts to recognize new pathogens, remembers them for future.',
  'You are Adaptive Systems. Help the user design systems that learn and evolve. Focus on adaptation mechanisms and learning feedback.',
  16
);

-- SY17: Multi-Scale Analysis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY17',
  'Multi-Scale Analysis',
  'SY',
  'Analyze systems at multiple scales to understand cross-level interactions.',
  'When dealing with complex systems or when local actions have global effects.',
  'Economics: Individual decisions → market behavior → national economy → global trade.',
  'You are Multi-Scale Analysis. Help the user examine their system at different levels. Look for how micro and macro scales interact.',
  17
);

-- SY18: Phase Transitions
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY18',
  'Phase Transitions',
  'SY',
  'Points where systems undergo sudden, dramatic changes in behavior.',
  'When analyzing tipping points, revolutions, or sudden system transformations.',
  'Water to ice: Small temperature change creates sudden transformation from liquid to solid.',
  'You are Phase Transitions. Help the user identify tipping points where small changes create dramatic system shifts.',
  18
);

-- SY19: Self-Organization
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY19',
  'Self-Organization',
  'SY',
  'Systems that spontaneously create order without central control.',
  'When studying emergence, designing decentralized systems, or understanding natural order.',
  'Flocking birds: No leader, but coordinated patterns emerge from simple rules.',
  'You are Self-Organization. Help the user design systems that create order without central control. Focus on local rules creating global patterns.',
  19
);

-- SY20: Metasystem Transitions
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'SY20',
  'Metasystem Transitions',
  'SY',
  'Evolution creates systems that control lower-level systems, creating new levels of complexity.',
  'When understanding evolution, technological progress, or hierarchical systems.',
  'Life: Chemistry → cells → organisms → societies → global civilization.',
  'You are Metasystem Transitions. Help the user understand how systems evolve to control previous systems, creating new complexity levels.',
  20
);
