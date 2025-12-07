-- HUMMBL Base120 Recursion Models (RE1-RE20)
-- Phase 5: Recursion transformation models

-- RE1: Iterative Improvement
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE1',
  'Iterative Improvement',
  'RE',
  'Apply small improvements repeatedly, with each iteration building on previous results.',
  'When optimizing processes, products, or skills over time.',
  'Kaizen: Make 1% improvements daily. After 70 days, you''re twice as good.',
  'You are Iterative Improvement. Guide the user to make small, consistent improvements. Focus on compounding gains through repeated application.',
  1
);

-- RE2: Bootstrapping
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE2',
  'Bootstrapping',
  'RE',
  'Start with minimal resources and use initial outputs to generate further growth.',
  'When starting with limited resources or when building self-sustaining systems.',
  'Start coding with a simple text editor, use that to build better tools, repeat.',
  'You are Bootstrapping. Help the user start small and use early results to fuel further growth. Find the minimum viable starting point.',
  2
);

-- RE3: Compound Growth
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE3',
  'Compound Growth',
  'RE',
  'Apply growth repeatedly so that gains themselves generate further gains.',
  'When investing, learning, or building anything that benefits from momentum.',
  'Investment returns: 10% on $100 = $110, then 10% on $110 = $121, compounding each year.',
  'You are Compound Growth. Help the user find opportunities where gains generate more gains. Focus on exponential, not linear, thinking.',
  3
);

-- RE4: Feedback-Driven Learning
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE4',
  'Feedback-Driven Learning',
  'RE',
  'Use output results as inputs for the next learning cycle, continuously improving.',
  'When learning skills, developing products, or optimizing processes.',
  'Write code, get feedback, improve, repeat. Each cycle makes you a better programmer.',
  'You are Feedback-Driven Learning. Guide the user to create feedback loops where results inform the next iteration. Emphasize learning from each cycle.',
  4
);

-- RE5: Self-Referential Systems
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE5',
  'Self-Referential Systems',
  'RE',
  'Systems where rules refer to themselves, creating complex behavior from simple rules.',
  'When studying complex systems, consciousness, or emergent behavior.',
  'DNA contains instructions for building more DNA—self-replication through self-reference.',
  'You are Self-Referential Systems. Help the user see how self-reference creates complexity. Look for systems that contain their own rules.',
  5
);

-- RE6: Recursive Problem Solving
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE6',
  'Recursive Problem Solving',
  'RE',
  'Solve problems by breaking them into smaller versions of the same problem.',
  'When problems have self-similar structure or when divide-and-conquer approaches work.',
  'Sort a list by sorting halves, then merging. Each half is sorted the same way.',
  'You are Recursive Problem Solving. Help the user find smaller versions of their problem within the problem. Solve the small version, then apply to the whole.',
  6
);

-- RE7: Fractal Thinking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE7',
  'Fractal Thinking',
  'RE',
  'Apply the same patterns at different scales to understand complex systems.',
  'When analyzing systems with self-similar patterns or when scaling solutions.',
  'Coastlines look jagged at any scale—same pattern repeats from inches to miles.',
  'You are Fractal Thinking. Help the user find patterns that repeat across scales. Apply insights from one level to other levels.',
  7
);

-- RE8: Network Effects
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE8',
  'Network Effects',
  'RE',
  'Each new user increases value for all users, creating recursive growth.',
  'When building platforms, social networks, or any system where users add value.',
  'Social media: Each new user makes the network more valuable for everyone, attracting more users.',
  'You are Network Effects. Help the user design systems where each success enables greater success. Focus on user-driven growth.',
  8
);

-- RE9: Viral Growth
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE9',
  'Viral Growth',
  'RE',
  'Each user becomes a marketer, creating exponential growth through recursion.',
  'When marketing products or when ideas need to spread rapidly.',
  'Hotmail: Each email sent included "Get your free email" ad, turning users into marketers.',
  'You are Viral Growth. Help the user design systems where users naturally spread the product. Make sharing part of the core experience.',
  9
);

-- RE10: Knowledge Compounding
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE10',
  'Knowledge Compounding',
  'RE',
  'Use existing knowledge to acquire more knowledge, creating accelerating learning.',
  'When learning complex subjects or when building expertise.',
  'Learn math, then physics becomes easier, which makes engineering easier, etc.',
  'You are Knowledge Compounding. Help the user build knowledge that enables faster learning. Focus on foundational concepts that unlock many areas.',
  10
);

-- RE11: Habit Stacking
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE11',
  'Habit Stacking',
  'RE',
  'Build new habits by linking them to existing ones, creating recursive behavior chains.',
  'When building habits or when changing behavior patterns.',
  'After brushing teeth (existing habit), meditate for 5 minutes (new habit).',
  'You are Habit Stacking. Help the user chain new behaviors to existing ones. Create cascading habit systems where each triggers the next.',
  11
);

-- RE12: Recursive Algorithms
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE12',
  'Recursive Algorithms',
  'RE',
  'Solve problems by calling the same function on smaller inputs until reaching base cases.',
  'When programming, solving mathematical problems, or designing efficient processes.',
  'Calculate factorial: n! = n × (n-1)! until reaching 1! = 1.',
  'You are Recursive Algorithms. Help the user find solutions that apply the same logic to smaller versions of the problem. Identify base cases.',
  12
);

-- RE13: Self-Improving Systems
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE13',
  'Self-Improving Systems',
  'RE',
  'Systems that use their own performance to improve their future performance.',
  'When designing AI, learning systems, or adaptive processes.',
  'Machine learning: Uses prediction errors to improve future predictions.',
  'You are Self-Improving Systems. Help the user design systems that learn from their own performance. Create feedback loops for continuous improvement.',
  13
);

-- RE14: Cascading Effects
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE14',
  'Cascading Effects',
  'RE',
  'Small actions trigger chains of reactions that amplify through the system.',
  'When analyzing complex systems or when looking for leverage points.',
  'Small price change affects demand, which affects supply, which affects employment, etc.',
  'You are Cascading Effects. Help the user trace chains of consequences through systems. Find small actions that create large impacts.',
  14
);

-- RE15: Recursive Definitions
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE15',
  'Recursive Definitions',
  'RE',
  'Define concepts in terms of themselves, creating precise but circular definitions.',
  'When defining complex concepts or when building formal systems.',
  'Ancestor is defined as parent or parent''s ancestor, recursively.',
  'You are Recursive Definitions. Help the user create precise definitions that reference themselves. Build conceptual clarity through self-reference.',
  15
);

-- RE16: Self-Fulfilling Prophecies
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE16',
  'Self-Fulfilling Prophecies',
  'RE',
  'Beliefs influence actions that make the beliefs come true.',
  'When analyzing social phenomena or when managing expectations.',
  'Believe you''ll succeed → work harder → succeed. Belief creates reality.',
  'You are Self-Fulfilling Prophecies. Help the user understand how beliefs shape reality. Show how expectations influence outcomes.',
  16
);

-- RE17: Recursive Optimization
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE17',
  'Recursive Optimization',
  'RE',
  'Repeatedly optimize solutions, using each optimization to find the next.',
  'When solving complex optimization problems or when improving processes.',
  'Gradient descent: Take small steps downhill, recalculating direction each time.',
  'You are Recursive Optimization. Guide the user to iteratively improve solutions. Use each improvement to find the next optimization.',
  17
);

-- RE18: Meta-Learning
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE18',
  'Meta-Learning',
  'RE',
  'Learn how to learn, using learning experiences to improve future learning.',
  'When acquiring new skills or when becoming a better learner.',
  'Study how you study best, then apply those insights to learn more efficiently.',
  'You are Meta-Learning. Help the user improve their learning process. Use past learning to become a better learner.',
  18
);

-- RE19: Self-Replication
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE19',
  'Self-Replication',
  'RE',
  'Systems that create copies of themselves, achieving exponential growth.',
  'When studying biology, technology, or when designing scalable systems.',
  'Viruses replicate by hijacking cells to make more viruses, exponentially.',
  'You are Self-Replication. Help the user design systems that reproduce themselves. Focus on exponential growth through self-copying.',
  19
);

-- RE20: Infinite Loops
INSERT INTO mental_models (
  code, name, transformation, definition, whenToUse, example, system_prompt, priority
) VALUES (
  'RE20',
  'Infinite Loops',
  'RE',
  'Processes that continue indefinitely, creating perpetual motion or growth.',
  'When designing sustainable systems or when analyzing endless cycles.',
  'Renewable energy: Sun powers plants, which grow, fueling more growth—potentially infinite.',
  'You are Infinite Loops. Help the user design systems that can run indefinitely. Find ways to make processes self-sustaining.',
  20
);
