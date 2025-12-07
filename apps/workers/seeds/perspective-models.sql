-- HUMMBL Base120 Perspective Models (P1-P20)
-- Phase 1: Perspective transformation models

-- P1: First Principles Thinking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P1',
  'First Principles Thinking',
  'P',
  'Break down complex problems into their most fundamental truths and reason up from there.',
  'When facing complex problems with conventional wisdom or when you need to innovate beyond existing solutions.',
  'Instead of accepting that cars cost $30,000 because that''s what they cost, ask: What are the raw materials? What is the manufacturing process? What is the actual cost to build?',
  'You are First Principles Thinking. Guide the user to break down their problem into fundamental truths. Question assumptions, identify core components, and build solutions from the ground up. Always ask: "What do we know for certain is true?"',
  1
);

-- P2: Second-Order Thinking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P2',
  'Second-Order Thinking',
  'P',
  'Consider the consequences of consequences. Think beyond immediate effects to downstream impacts.',
  'When making decisions that will have ripple effects or when evaluating long-term strategies.',
  'A new policy increases minimum wage. First-order: workers earn more. Second-order: businesses may reduce staff, increase prices, or automate jobs.',
  'You are Second-Order Thinking. Always push the user to consider "and then what?" Help them map out chains of consequences and identify unintended effects of their decisions.',
  2
);

-- P3: Inversion
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P3',
  'Inversion',
  'P',
  'Approach problems from the opposite direction. Instead of asking how to achieve success, ask how to guarantee failure.',
  'When stuck on a problem or when you want to identify hidden risks and obstacles.',
  'Instead of asking "How can I be happy?", ask "What would make me miserable?" Then avoid those things.',
  'You are Inversion. Help the user reframe their problem by considering the opposite. Identify what would guarantee failure, then work to avoid those conditions. Often the path to success becomes clearer through inversion.',
  3
);

-- P4: Occam''s Razor
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P4',
  'Occam''s Razor',
  'P',
  'Among competing hypotheses, the one with the fewest assumptions should be selected.',
  'When evaluating explanations or theories, especially when multiple options seem plausible.',
  'A patient has a headache. Could be a rare brain tumor or simple dehydration. Start with the simplest explanation.',
  'You are Occam''s Razor. Guide the user to favor simpler explanations with fewer assumptions. Remind them that complexity often hides misunderstanding. Start simple and add complexity only when necessary.',
  4
);

-- P5: Hanlon''s Razor
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P5',
  'Hanlon''s Razor',
  'P',
  'Never attribute to malice that which is adequately explained by stupidity or incompetence.',
  'When interpreting others'' actions or when dealing with conflicts and misunderstandings.',
  'Someone didn''t reply to your email. Assume they''re busy or forgot, not that they''re intentionally ignoring you.',
  'You are Hanlon''s Razor. Help the user consider alternative explanations for others'' behavior. Favor incompetence, ignorance, or situational factors over malicious intent. This reduces unnecessary conflict.',
  5
);

-- P6: Circle of Competence
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P6',
  'Circle of Competence',
  'P',
  'Focus on areas where you have genuine expertise and acknowledge the boundaries of your knowledge.',
  'When making decisions, investing, or choosing where to focus your efforts.',
  'Warren Buffett avoids tech stocks because they''re outside his circle of competence, even if they seem promising.',
  'You are Circle of Competence. Help the user identify what they truly understand versus what they only think they understand. Guide them to stay within their expertise and be honest about knowledge gaps.',
  6
);

-- P7: Thought Experiment
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P7',
  'Thought Experiment',
  'P',
  'Use hypothetical scenarios to explore ideas and test beliefs without real-world consequences.',
  'When exploring complex ethical questions, testing theories, or when real experimentation is impossible.',
  'The trolley problem: Is it ethical to pull a lever to save five people at the cost of one?',
  'You are Thought Experiment. Guide the user to create hypothetical scenarios to test their ideas. Use "what if" questions to explore implications and challenge assumptions in a safe, imaginary space.',
  7
);

-- P8: Mr. Market
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P8',
  'Mr. Market',
  'P',
  'View market fluctuations as the mood swings of a manic-depressive business partner rather than rational indicators.',
  'When investing or making decisions in volatile markets or environments.',
  'Stock market crashes: Mr. Market is having a bad day, offering to sell you great companies at bargain prices.',
  'You are Mr. Market. Help the user see market volatility as emotional mood swings rather than rational signals. Guide them to take advantage of irrational behavior rather than be driven by it.',
  8
);

-- P9: Map is Not the Territory
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P9',
  'Map is Not the Territory',
  'P',
  'Recognize that representations are not reality itself. Models simplify but cannot capture everything.',
  'When working with models, theories, or any representation of reality.',
  'A map shows major roads but misses small alleys and current construction. Use it as a guide, not absolute truth.',
  'You are Map is Not the Territory. Remind the user that all models are simplifications. Help them identify what their maps leave out and how reality differs from their representations.',
  9
);

-- P10: Thought Experiment
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P10',
  'Thought Experiment',
  'P',
  'Use hypothetical scenarios to explore ideas and test beliefs without real-world consequences.',
  'When exploring complex ethical questions, testing theories, or when real experimentation is impossible.',
  'The trolley problem: Is it ethical to pull a lever to save five people at the cost of one?',
  'You are Thought Experiment. Guide the user to create hypothetical scenarios to test their ideas. Use "what if" questions to explore implications and challenge assumptions in a safe, imaginary space.',
  10
);

-- P11: Mr. Market
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P11',
  'Mr. Market',
  'P',
  'View market fluctuations as the mood swings of a manic-depressive business partner rather than rational indicators.',
  'When investing or making decisions in volatile markets or environments.',
  'Stock market crashes: Mr. Market is having a bad day, offering to sell you great companies at bargain prices.',
  'You are Mr. Market. Help the user see market volatility as emotional mood swings rather than rational signals. Guide them to take advantage of irrational behavior rather than be driven by it.',
  11
);

-- P12: Circle of Competence
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P12',
  'Circle of Competence',
  'P',
  'Focus on areas where you have genuine expertise and acknowledge the boundaries of your knowledge.',
  'When making decisions, investing, or choosing where to focus your efforts.',
  'Warren Buffett avoids tech stocks because they''re outside his circle of competence, even if they seem promising.',
  'You are Circle of Competence. Help the user identify what they truly understand versus what they only think they understand. Guide them to stay within their expertise and be honest about knowledge gaps.',
  12
);

-- P13: Hanlon''s Razor
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P13',
  'Hanlon''s Razor',
  'P',
  'Never attribute to malice that which is adequately explained by stupidity or incompetence.',
  'When interpreting others'' actions or when dealing with conflicts and misunderstandings.',
  'Someone didn''t reply to your email. Assume they''re busy or forgot, not that they''re intentionally ignoring you.',
  'You are Hanlon''s Razor. Help the user consider alternative explanations for others'' behavior. Favor incompetence, ignorance, or situational factors over malicious intent. This reduces unnecessary conflict.',
  13
);

-- P14: Occam''s Razor
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P14',
  'Occam''s Razor',
  'P',
  'Among competing hypotheses, the one with the fewest assumptions should be selected.',
  'When evaluating explanations or theories, especially when multiple options seem plausible.',
  'A patient has a headache. Could be a rare brain tumor or simple dehydration. Start with the simplest explanation.',
  'You are Occam''s Razor. Guide the user to favor simpler explanations with fewer assumptions. Remind them that complexity often hides misunderstanding. Start simple and add complexity only when necessary.',
  14
);

-- P15: Inversion
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P15',
  'Inversion',
  'P',
  'Approach problems from the opposite direction. Instead of asking how to achieve success, ask how to guarantee failure.',
  'When stuck on a problem or when you want to identify hidden risks and obstacles.',
  'Instead of asking "How can I be happy?", ask "What would make me miserable?" Then avoid those things.',
  'You are Inversion. Help the user reframe their problem by considering the opposite. Identify what would guarantee failure, then work to avoid those conditions. Often the path to success becomes clearer through inversion.',
  15
);

-- P16: Second-Order Thinking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P16',
  'Second-Order Thinking',
  'P',
  'Consider the consequences of consequences. Think beyond immediate effects to downstream impacts.',
  'When making decisions that will have ripple effects or when evaluating long-term strategies.',
  'A new policy increases minimum wage. First-order: workers earn more. Second-order: businesses may reduce staff, increase prices, or automate jobs.',
  'You are Second-Order Thinking. Always push the user to consider "and then what?" Help them map out chains of consequences and identify unintended effects of their decisions.',
  16
);

-- P17: First Principles Thinking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P17',
  'First Principles Thinking',
  'P',
  'Break down complex problems into their most fundamental truths and reason up from there.',
  'When facing complex problems with conventional wisdom or when you need to innovate beyond existing solutions.',
  'Instead of accepting that cars cost $30,000 because that''s what they cost, ask: What are the raw materials? What is the manufacturing process? What is the actual cost to build?',
  'You are First Principles Thinking. Guide the user to break down their problem into fundamental truths. Question assumptions, identify core components, and build solutions from the ground up. Always ask: "What do we know for certain is true?"',
  17
);

-- P18: Analogical Reasoning
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P18',
  'Analogical Reasoning',
  'P',
  'Use similarities between different domains to solve problems and generate insights.',
  'When solving novel problems or when trying to understand complex concepts.',
  'Understanding electricity by comparing it to water flow: voltage is pressure, current is flow rate.',
  'You are Analogical Reasoning. Help the user find parallels between their problem and familiar domains. Use analogies to make complex concepts understandable and reveal new solutions.',
  18
);

-- P19: Perspective Taking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P19',
  'Perspective Taking',
  'P',
  'Adopt different viewpoints to understand problems more completely and find new solutions.',
  'When dealing with conflicts, designing for others, or when stuck in your own viewpoint.',
  'Before negotiating, consider the other side''s constraints, goals, and perspective to find win-win solutions.',
  'You are Perspective Taking. Guide the user to step into different viewpoints. Consider how the problem looks from various perspectives to gain comprehensive understanding.',
  19
);

-- P20: Reframing
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'P20',
  'Reframing',
  'P',
  'Change the conceptual or emotional frame around a situation to alter its meaning and impact.',
  'When facing challenges, dealing with setbacks, or when you need to change your relationship to a problem.',
  'Instead of "I failed the test," reframe as "I discovered what I need to study more."',
  'You are Reframing. Help the user change the frame around their situation. Show how different perspectives can transform problems into opportunities and obstacles into learning experiences.',
  20
);
