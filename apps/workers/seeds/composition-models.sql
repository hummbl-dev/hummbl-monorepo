-- HUMMBL Base120 Composition Models (CO1-CO20)
-- Phase 3: Composition transformation models

-- CO1: Synergy
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO1',
  'Synergy',
  'CO',
  'The whole is greater than the sum of its parts. Combine elements to create emergent value.',
  'When combining teams, technologies, or ideas to create something greater than individual components.',
  'Apple combined hardware, software, and services to create an ecosystem more valuable than any single part.',
  'You are Synergy. Help the user find combinations where 1+1=3. Look for complementary strengths and emergent properties when elements interact.',
  1
);

-- CO2: Lollapalooza Effect
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO2',
  'Lollapalooza Effect',
  'CO',
  'Multiple factors acting together create an extreme result far beyond their individual impacts.',
  'When analyzing extreme successes or failures that seem disproportionate to their causes.',
  'Google''s success: Search quality + business model + timing + network effects created unprecedented dominance.',
  'You are Lollapalooza Effect. Help the user identify when multiple factors combine to create extreme outcomes. Look for the convergence of forces that multiply each other.',
  2
);

-- CO3: Network Effects
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO3',
  'Network Effects',
  'CO',
  'The value of a product or service increases as more people use it.',
  'When evaluating platforms, social systems, or any product where users add value.',
  'Facebook becomes more valuable as more friends join. Each new user makes the service better for everyone.',
  'You are Network Effects. Help the user understand how user growth creates value. Identify ways to build and leverage networks where each participant benefits from others'' participation.',
  3
);

-- CO4: Critical Mass
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO4',
  'Critical Mass',
  'CO',
  'The point at which a system becomes self-sustaining and grows exponentially.',
  'When launching new initiatives, building communities, or starting chain reactions.',
  'A social movement needs enough supporters to become self-propagating without constant promotion.',
  'You are Critical Mass. Help the user determine the threshold needed for their initiative to become self-sustaining. Calculate what resources, users, or momentum are required.',
  4
);

-- CO5: Tipping Point
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO5',
  'Tipping Point',
  'CO',
  'The moment when small changes accumulate to create a major transformation.',
  'When analyzing gradual changes that suddenly become dramatic or when planning interventions.',
  'A viral video slowly gains views, then suddenly explodes when it crosses the tipping point of sharing.',
  'You are Tipping Point. Help the user identify the point where small changes will create big effects. Look for the accumulation point that triggers transformation.',
  5
);

-- CO6: Feedback Loops
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO6',
  'Feedback Loops',
  'CO',
  'Systems where outputs become inputs, creating cycles of amplification or regulation.',
  'When analyzing dynamic systems, growth patterns, or self-regulating processes.',
  'Success breeds more success: Winning companies attract better talent, leading to more success.',
  'You are Feedback Loops. Help the user identify circular causality in their systems. Distinguish reinforcing loops (growth) from balancing loops (stability).',
  6
);

-- CO7: Emergence
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO7',
  'Emergence',
  'CO',
  'Complex systems exhibit properties not present in their individual components.',
  'When studying complex systems, consciousness, or collective intelligence.',
  'Ant colonies exhibit intelligent behavior despite individual ants having minimal intelligence.',
  'You are Emergence. Help the user see how simple rules and components can create complex, intelligent behavior. Look for patterns that arise from interaction, not design.',
  7
);

-- CO8: Modular Design
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO8',
  'Modular Design',
  'CO',
  'Build systems from interchangeable components that can be combined in various ways.',
  'When designing flexible systems, products, or organizations that need to adapt and scale.',
  'LEGO bricks can create infinite designs from simple, standardized components.',
  'You are Modular Design. Help the user break their system into interchangeable parts. Focus on standard interfaces and combinatorial possibilities.',
  8
);

-- CO9: Ecosystem Thinking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO9',
  'Ecosystem Thinking',
  'CO',
  'Consider how elements interact within a larger system, not just their individual properties.',
  'When analyzing markets, organizations, or any complex adaptive system.',
  'A startup isn''t just a company—it''s part of an ecosystem of customers, competitors, partners, and regulators.',
  'You are Ecosystem Thinking. Help the user map the relationships and dependencies in their system. Consider how changes affect the entire ecosystem, not just individual parts.',
  9
);

-- CO10: Symbiosis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'CO10',
  'Symbiosis',
  'CO',
  'Different entities cooperate for mutual benefit, creating relationships where all parties gain.',
  'When forming partnerships, collaborations, or integrated systems.',
  'Riders and drivers in ride-sharing create mutual value that neither could achieve alone.',
  'You are Symbiosis. Help the user find mutually beneficial relationships. Look for complementary needs and capabilities that can be combined for shared success.',
  10
);
