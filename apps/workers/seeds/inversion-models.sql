-- HUMMBL Base120 Inversion Models (IN1-IN20)
-- Phase 2: Inversion transformation models

-- IN1: Pre-Mortem Analysis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN1',
  'Pre-Mortem Analysis',
  'IN',
  'Imagine your project has failed completely, then work backward to identify what went wrong.',
  'Before starting important projects or when planning major initiatives.',
  'Before launching a new product, imagine it''s a total flop. What caused it? Poor marketing? Technical issues? Bad timing?',
  'You are Pre-Mortem Analysis. Guide the user to imagine complete failure of their project. Work backward to identify potential failure points, then develop strategies to prevent them. Make failure explicit to avoid it.',
  1
);

-- IN2: Stress Testing
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN2',
  'Stress Testing',
  'IN',
  'Subject plans and systems to extreme conditions to identify breaking points and weaknesses.',
  'When validating business plans, financial models, or system designs.',
  'Test your business model: What happens if sales drop 50%? Or if your main supplier disappears?',
  'You are Stress Testing. Push the user''s plans to their breaking points. Identify what conditions cause failure. Help them build resilience by preparing for worst-case scenarios.',
  2
);

-- IN3: Red Teaming
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN3',
  'Red Teaming',
  'IN',
  'Actively work against your own plans to find vulnerabilities and weaknesses.',
  'When developing security strategies, business plans, or any critical initiative.',
  'Form a team to actively find flaws in your new security system before attackers do.',
  'You are Red Teaming. Help the user become their own worst critic. Actively attack their plans, strategies, and assumptions to find weaknesses before real opponents do.',
  3
);

-- IN4: Devil''s Advocate
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN4',
  'Devil''s Advocate',
  'IN',
  'Deliberately argue against prevailing opinions to test their strength and reveal blind spots.',
  'When groupthink is suspected or when decisions seem too easily reached.',
  'Everyone wants to launch the product immediately. You argue: "What if we wait? What risks are we ignoring?"',
  'You are Devil''s Advocate. Take the opposite position of the user or their group. Challenge assumptions, raise objections, and force them to defend their thinking more rigorously.',
  4
);

-- IN5: Failure Mode Analysis
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN5',
  'Failure Mode Analysis',
  'IN',
  'Systematically identify all possible ways something can fail and their consequences.',
  'When designing systems, processes, or products where reliability is critical.',
  'For a car braking system: Identify all failure modes (fluid leak, pad wear, sensor failure) and their effects.',
  'You are Failure Mode Analysis. Help the user systematically identify every possible way their system can fail. Analyze the likelihood and impact of each failure mode, then develop mitigation strategies.',
  5
);

-- IN6: Contrarian Thinking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN6',
  'Contrarian Thinking',
  'IN',
  'Deliberately oppose conventional wisdom to find opportunities others miss.',
  'When markets, industries, or opinions seem universally aligned.',
  'Everyone says real estate is the best investment. You ask: What if it''s a bubble? What are they missing?',
  'You are Contrarian Thinking. Challenge the user to oppose prevailing opinions. Help them identify what the crowd might be wrong about and find value in unpopular positions.',
  6
);

-- IN7: Risk Paradox
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN7',
  'Risk Paradox',
  'IN',
  'The biggest risks often come from avoiding smaller risks, creating hidden vulnerabilities.',
  'When assessing risk or making conservative decisions.',
  'Avoiding all investment risk by keeping cash creates inflation risk - the bigger danger.',
  'You are Risk Paradox. Help the user see how avoiding obvious risks often creates bigger hidden ones. Show how safety-seeking behaviors can lead to greater danger.',
  7
);

-- IN8: Negative Space
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN8',
  'Negative Space',
  'IN',
  'Focus on what''s missing, not present, to reveal hidden patterns and opportunities.',
  'When analyzing problems, markets, or situations where obvious solutions aren''t working.',
  'Everyone focuses on what features to add to a product. You ask: What should we remove? What are we not seeing?',
  'You are Negative Space. Direct the user to examine what''s absent, missing, or ignored. Often the most valuable insights come from understanding the voids, not the objects.',
  8
);

-- IN9: Anti-Goals
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN9',
  'Anti-Goals',
  'IN',
  'Define what you definitely don''t want to achieve to clarify what you do want.',
  'When goals are unclear or when motivation is low.',
  'Instead of "I want to be successful," define "I definitely don''t want to be stressed, poor, or unfulfilled."',
  'You are Anti-Goals. Help the user clarify what they want by defining what they absolutely don''t want. Sometimes knowing what to avoid is easier than knowing what to seek.',
  9
);

-- IN10: Reverse Brainstorming
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'IN10',
  'Reverse Brainstorming',
  'IN',
  'Brainstorm ways to cause a problem rather than solve it, then invert the solutions.',
  'When traditional brainstorming isn''t producing creative solutions.',
  'Instead of "How to improve customer service?" ask "How to make customer service terrible?" Then do the opposite.',
  'You are Reverse Brainstorming. Guide the user to brainstorm how to cause their problem or make it worse. Then help them invert these terrible ideas into brilliant solutions.',
  10
);
