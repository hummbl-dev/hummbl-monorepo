-- HUMMBL Base120 Remaining Inversion Models (IN11-IN20)
-- Adding the missing models to complete the Inversion transformation

-- IN11: Dark Side Analysis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN11',
  'Dark Side Analysis',
  'IN',
  'Explore the unethical or malicious versions of your ideas to understand their vulnerabilities.',
  'When developing security strategies, policies, or when you need to anticipate worst-case scenarios.',
  'Design a social platform, then imagine how it could be used for manipulation, addiction, or surveillance.',
  'You are Dark Side Analysis. Guide the user to explore how their ideas could be used maliciously. Use this understanding to build safeguards and ethical considerations.',
  11
);

-- IN12: Failure Simulation
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN12',
  'Failure Simulation',
  'IN',
  'Actively simulate failure scenarios to identify weaknesses before they occur.',
  'When testing systems, plans, or when you need to prepare for contingencies.',
  'Simulate a server crash during peak traffic to test recovery procedures.',
  'You are Failure Simulation. Help the user actively simulate failure scenarios. Use these simulations to build resilience and recovery strategies.',
  12
);

-- IN13: Opposition Research
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN13',
  'Opposition Research',
  'IN',
  'Research opposing viewpoints as thoroughly as your own to strengthen your position.',
  'When preparing for debates, negotiations, or when you need to understand counterarguments.',
  'Study climate change denial arguments in depth to better defend climate science.',
  'You are Opposition Research. Guide the user to thoroughly research opposing viewpoints. Use this understanding to anticipate and counter arguments.',
  13
);

-- IN14: Reverse Engineering
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN14',
  'Reverse Engineering',
  'IN',
  'Deconstruct successful systems to understand their weaknesses and how to improve them.',
  'When analyzing competitors, studying successes, or when you want to innovate.',
  'Take apart a successful app to understand its vulnerabilities and how to build a better alternative.',
  'You are Reverse Engineering. Help the user deconstruct successful systems to find weaknesses and opportunities for improvement.',
  14
);

-- IN15: Anti-Patterns
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN15',
  'Anti-Patterns',
  'IN',
  'Study common mistakes and poor solutions to avoid them in your own work.',
  'When designing systems, writing code, or when you want to avoid known pitfalls.',
  'Study failed startups to understand what not to do in your own business.',
  'You are Anti-Patterns. Help the user identify and avoid common mistakes. Use knowledge of failures to build better solutions.',
  15
);

-- IN16: Sabotage Thinking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN16',
  'Sabotage Thinking',
  'IN',
  'Imagine how you could sabotage your own project to identify hidden vulnerabilities.',
  'When testing security, planning for disruptions, or when you need to anticipate attacks.',
  'How could someone sabotage your supply chain? Then build protections against those scenarios.',
  'You are Sabotage Thinking. Guide the user to imagine how their project could be sabotaged. Use this to identify and fix vulnerabilities.',
  16
);

-- IN17: Inverse Prioritization
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN17',
  'Inverse Prioritization',
  'IN',
  'Identify what to avoid doing rather than what to do, focusing on preventing damage.',
  'When overwhelmed with options or when preventing mistakes is more important than finding perfect solutions.',
  'Instead of "what should I prioritize?", ask "what should I definitely not do?"',
  'You are Inverse Prioritization. Help the user identify what to avoid. Sometimes knowing what not to do is more important than knowing what to do.',
  17
);

-- IN18: Worst-Case Scenario Planning
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN18',
  'Worst-Case Scenario Planning',
  'IN',
  'Plan for the absolute worst outcomes to build resilience and contingency plans.',
  'When risk management is critical or when you need to prepare for extreme events.',
  'Plan for complete market collapse, natural disaster, or total system failure.',
  'You are Worst-Case Scenario Planning. Help the user prepare for the worst possible outcomes. Build resilience through extreme scenario planning.',
  18
);

-- IN19: Inverse Benchmarking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN19',
  'Inverse Benchmarking',
  'IN',
  'Study worst practices and failures to understand what to avoid.',
  'When trying to avoid mistakes or when you want to learn from others'' failures.',
  'Study failed companies to understand what practices to avoid.',
  'You are Inverse Benchmarking. Help the user learn from failures and worst practices. Use negative examples to guide better decisions.',
  19
);

-- IN20: Deconstruction Analysis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN20',
  'Deconstruction Analysis',
  'IN',
  'Break down arguments or systems to find logical fallacies and structural weaknesses.',
  'When evaluating arguments, analyzing systems, or when you need to find flaws.',
  'Deconstruct a political argument to find logical fallacies and unsupported assumptions.',
  'You are Deconstruction Analysis. Guide the user to break down arguments and systems to find hidden weaknesses and logical flaws.',
  20
);
