-- HUMMBL Base120 Recursion Models (RE1-RE20) - Production Schema

-- RE1: Iterative Improvement
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE1',
  'Iterative Improvement',
  'RE',
  'Apply small improvements repeatedly, with each iteration building on previous results.',
  'Kaizen: Make 1% improvements daily. After 70 days, you''re twice as good.',
  'improvement,repeated,compounding',
  'beginner',
  'RE3,DE12',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE2: Bootstrapping
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE2',
  'Bootstrapping',
  'RE',
  'Start with minimal resources and use initial outputs to generate further growth.',
  'Start coding with a simple text editor, use that to build better tools, repeat.',
  'minimal,resources,growth',
  'intermediate',
  'RE1,CO3',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE3: Compound Growth
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE3',
  'Compound Growth',
  'RE',
  'Apply growth repeatedly so that gains themselves generate further gains.',
  'Investment returns: 10% on $100 = $110, then 10% on $110 = $121, compounding each year.',
  'growth,compounding,exponential',
  'intermediate',
  'RE1,CO2',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE4: Feedback-Driven Learning
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE4',
  'Feedback-Driven Learning',
  'RE',
  'Use output results as inputs for the next learning cycle, continuously improving.',
  'Write code, get feedback, improve, repeat. Each cycle makes you a better programmer.',
  'feedback,learning,cycles',
  'intermediate',
  'RE18,CO6',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE5: Self-Referential Systems
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE5',
  'Self-Referential Systems',
  'RE',
  'Systems where rules refer to themselves, creating complex behavior from simple rules.',
  'DNA contains instructions for building more DNA—self-replication through self-reference.',
  'self-reference,complex,rules',
  'advanced',
  'RE6,SY19',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE6: Recursive Problem Solving
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE6',
  'Recursive Problem Solving',
  'RE',
  'Solve problems by breaking them into smaller versions of the same problem.',
  'Sort a list by sorting halves, then merging. Each half is sorted the same way.',
  'recursive,smaller,versions',
  'advanced',
  'RE12,DE4',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE7: Fractal Thinking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE7',
  'Fractal Thinking',
  'RE',
  'Apply the same patterns at different scales to understand complex systems.',
  'Coastlines look jagged at any scale—same pattern repeats from inches to miles.',
  'patterns,scales,fractal',
  'advanced',
  'RE5,DE17',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE8: Network Effects
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE8',
  'Network Effects',
  'RE',
  'Each new user increases value for all users, creating recursive growth.',
  'Social media: Each new user makes the network more valuable for everyone, attracting more users.',
  'network,recursive,growth',
  'intermediate',
  'CO3,RE3',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE9: Viral Growth
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE9',
  'Viral Growth',
  'RE',
  'Each user becomes a marketer, creating exponential growth through recursion.',
  'Hotmail: Each email sent included "Get your free email" ad, turning users into marketers.',
  'viral,exponential,marketing',
  'intermediate',
  'RE8,CO4',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE10: Knowledge Compounding
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE10',
  'Knowledge Compounding',
  'RE',
  'Use existing knowledge to acquire more knowledge, creating accelerating learning.',
  'Learn math, then physics becomes easier, which makes engineering easier, etc.',
  'knowledge,compounding,learning',
  'intermediate',
  'RE18,RE4',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE11: Habit Stacking
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE11',
  'Habit Stacking',
  'RE',
  'Build new habits by linking them to existing ones, creating recursive behavior chains.',
  'After brushing teeth (existing habit), meditate for 5 minutes (new habit).',
  'habits,chaining,recursive',
  'beginner',
  'RE1,RE4',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE12: Recursive Algorithms
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE12',
  'Recursive Algorithms',
  'RE',
  'Solve problems by calling the same function on smaller inputs until reaching base cases.',
  'Calculate factorial: n! = n × (n-1)! until reaching 1! = 1.',
  'algorithms,recursive,base',
  'advanced',
  'RE6,DE6',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE13: Self-Improving Systems
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE13',
  'Self-Improving Systems',
  'RE',
  'Systems that use their own performance to improve their future performance.',
  'Machine learning: Uses prediction errors to improve future predictions.',
  'self-improving,performance,learning',
  'advanced',
  'RE4,SY16',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE14: Cascading Effects
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE14',
  'Cascading Effects',
  'RE',
  'Small actions trigger chains of reactions that amplify through the system.',
  'Small price change affects demand, which affects supply, which affects employment, etc.',
  'cascading,chains,amplify',
  'intermediate',
  'CO2,SY2',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE15: Recursive Definitions
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE15',
  'Recursive Definitions',
  'RE',
  'Define concepts in terms of themselves, creating precise but circular definitions.',
  'Ancestor is defined as parent or parent''s ancestor, recursively.',
  'definitions,circular,precise',
  'advanced',
  'RE5,DE20',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE16: Self-Fulfilling Prophecies
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE16',
  'Self-Fulfilling Prophecies',
  'RE',
  'Beliefs influence actions that make the beliefs come true.',
  'Believe you''ll succeed → work harder → succeed. Belief creates reality.',
  'beliefs,reality,circular',
  'intermediate',
  'P20,SY8',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE17: Recursive Optimization
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE17',
  'Recursive Optimization',
  'RE',
  'Repeatedly optimize solutions, using each optimization to find the next.',
  'Gradient descent: Take small steps downhill, recalculating direction each time.',
  'optimization,repeated,solutions',
  'advanced',
  'RE1,DE3',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE18: Meta-Learning
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE18',
  'Meta-Learning',
  'RE',
  'Learn how to learn, using learning experiences to improve future learning.',
  'Study how you study best, then apply those insights to learn more efficiently.',
  'meta-learning,improve,future',
  'intermediate',
  'RE10,RE4',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE19: Self-Replication
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE19',
  'Self-Replication',
  'RE',
  'Systems that create copies of themselves, achieving exponential growth.',
  'Viruses replicate by hijacking cells to make more viruses, exponentially.',
  'replication,exponential,growth',
  'advanced',
  'RE5,RE3',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);

-- RE20: Infinite Loops
INSERT INTO mental_models (
  code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt
) VALUES (
  'RE20',
  'Infinite Loops',
  'RE',
  'Processes that continue indefinitely, creating perpetual motion or growth.',
  'Renewable energy: Sun powers plants, which grow, fueling more growth—potentially infinite.',
  'infinite,perpetual,loops',
  'advanced',
  'RE19,SY7',
  '1.0.0',
  '2025-12-06T23:00:00Z',
  '2025-12-06T23:00:00Z'
);
