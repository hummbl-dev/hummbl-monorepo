# Content Expansion Strategy

## Overview

This document outlines the strategy for scaling HUMMBL's content library from its current state to 200+ mental models and 20+ narratives.

---

## 📊 Current State

**Mental Models:** ~120  
**Narratives:** 6  
**Categories Covered:** Psychology, Economics, Business, Science, Systems Thinking

---

## 🎯 Expansion Goals

### Phase 1 (P5.3 - Current)

- **Mental Models:** 120 → 200 (+80 models)
- **Narratives:** 6 → 20 (+14 narratives)
- **New Categories:** Technology, Philosophy, Leadership, Decision-Making

### Phase 2 (Future)

- **Mental Models:** 200 → 500
- **Narratives:** 20 → 50
- **Interactive Elements:** Case studies, exercises, quizzes

---

## 🧠 Mental Model Expansion (+80 Models)

### New Categories & Distribution

**Technology & Innovation (15 models)**

1. Network Effects
2. Platform Economics
3. Moore's Law
4. Innovator's Dilemma
5. Technology Adoption Curve
6. API-First Thinking
7. Abstraction Layers
8. Version Control Thinking
9. Agile Methodology
10. Continuous Integration
11. Technical Debt
12. Minimum Viable Product (MVP)
13. Fail Fast Principle
14. A/B Testing Mindset
15. Data-Driven Decision Making

**Philosophy & Ethics (12 models)** 16. Occam's Razor 17. Hanlon's Razor 18. Chesterton's Fence 19. The Veil of Ignorance 20. Trolley Problem Framework 21. Utilitarianism 22. Deontological Ethics 23. Virtue Ethics 24. Social Contract Theory 25. Categorical Imperative 26. Moral Relativism 27. Ethical Egoism

**Leadership & Management (15 models)** 28. Servant Leadership 29. Situational Leadership 30. Transformational Leadership 31. Delegation Matrix 32. Eisenhower Matrix 33. OKRs (Objectives & Key Results) 34. SMART Goals 35. Radical Candor 36. Feedback Loops 37. One-on-One Framework 38. Skip-Level Meetings 39. Blameless Post-Mortems 40. Growth Mindset 41. Fixed vs Growth Mindset 42. Psychological Safety

**Decision-Making (15 models)** 43. OODA Loop (Observe, Orient, Decide, Act) 44. Pre-Mortem Analysis 45. Second-Order Thinking 46. Inversion 47. Regret Minimization Framework 48. Expected Value Calculation 49. Opportunity Cost 50. Sunk Cost Fallacy 51. Reversible vs Irreversible Decisions 52. Decision Trees 53. Bayesian Thinking 54. Probabilistic Thinking 55. Mental Simulation 56. Scenario Planning 57. Red Team/Blue Team

**Communication (10 models)** 58. Active Listening 59. Nonviolent Communication 60. Socratic Method 61. Elevator Pitch 62. Storytelling Framework 63. Pyramid Principle 64. Argument Mapping 65. Steelman vs Strawman 66. Crucial Conversations 67. Difficult Conversations Framework

**Productivity & Learning (13 models)** 68. Deep Work 69. Flow State 70. Pomodoro Technique 71. Time Blocking 72. Pareto Principle (80/20 Rule) 73. Parkinson's Law 74. Eat the Frog 75. Getting Things Done (GTD) 76. Zettelkasten Method 77. Spaced Repetition 78. Feynman Technique 79. Deliberate Practice 80. Learning Transfer

---

## 📖 Narrative Expansion (+14 Narratives)

### New Narrative Topics

**Technology Narratives (3)**

1. **"The Rise of AI: From Symbolic Systems to Neural Networks"**
   - Category: Technology
   - Tags: AI, Machine Learning, History
   - Evidence: High
2. **"Cryptocurrency and the Decentralization Movement"**
   - Category: Technology/Economics
   - Tags: Blockchain, Finance, Innovation
   - Evidence: Medium

3. **"The Open Source Revolution"**
   - Category: Technology/Business
   - Tags: Software, Collaboration, Community
   - Evidence: High

**Business & Economics (4)** 4. **"The Gig Economy: Flexibility vs Security"**

- Category: Economics
- Tags: Labor, Platform Economy, Future of Work
- Evidence: Medium

5. **"Subscription Models: The Shift from Ownership to Access"**
   - Category: Business
   - Tags: Business Models, Consumer Behavior
   - Evidence: High

6. **"The Attention Economy"**
   - Category: Business/Psychology
   - Tags: Media, Advertising, Cognitive Science
   - Evidence: High

7. **"Remote Work Revolution"**
   - Category: Business/Society
   - Tags: Distributed Teams, Productivity, Culture
   - Evidence: High

**Psychology & Society (4)** 8. **"Social Media and Mental Health"**

- Category: Psychology
- Tags: Technology, Well-being, Youth
- Evidence: High

9. **"The Loneliness Epidemic"**
   - Category: Psychology/Society
   - Tags: Connection, Community, Health
   - Evidence: High

10. **"Polarization in the Digital Age"**
    - Category: Society
    - Tags: Politics, Media, Echo Chambers
    - Evidence: High

11. **"The Science of Habit Formation"**
    - Category: Psychology
    - Tags: Behavior Change, Neuroscience
    - Evidence: High

**Science & Environment (3)** 12. **"Climate Change: Scientific Consensus and Action"** - Category: Science/Environment - Tags: Climate, Policy, Sustainability - Evidence: High

13. **"The Microbiome Revolution"**
    - Category: Science/Health
    - Tags: Biology, Nutrition, Medicine
    - Evidence: Medium

14. **"CRISPR and Gene Editing Ethics"**
    - Category: Science/Ethics
    - Tags: Genetics, Bioethics, Innovation
    - Evidence: High

---

## 🔄 Import Pipeline Usage

```typescript
import { getImportPipeline } from './utils/contentImportPipeline';

// Import new content
const pipeline = getImportPipeline();

// From file
const result = await pipeline.importFromFile(file, 'mentalModels');

// Batch import
const batchResult = await pipeline.batchImport(files, 'narratives');

// Merge with existing
const merged = pipeline.mergeContent(existing, imported, 'replace');
```

---

## 📋 Content Template

### Mental Model Template

```json
{
  "id": "mm_unique_id",
  "name": "Model Name",
  "category": "Category",
  "description": "Brief description of the mental model",
  "definition": "Formal definition",
  "keyPrinciples": ["Principle 1", "Principle 2"],
  "applications": ["Application area 1", "Application area 2"],
  "examples": [
    {
      "context": "Example context",
      "application": "How the model applies"
    }
  ],
  "tags": ["tag1", "tag2"],
  "difficulty": "Beginner|Intermediate|Advanced",
  "relatedModels": ["mm_id1", "mm_id2"],
  "sources": [
    {
      "title": "Source title",
      "author": "Author name",
      "url": "https://..."
    }
  ]
}
```

### Narrative Template

```json
{
  "narrative_id": "N_unique",
  "title": "Narrative Title",
  "summary": "Brief summary",
  "full_text": "Complete narrative content...",
  "category": "Category",
  "tags": ["tag1", "tag2"],
  "evidence_quality": "High|Medium|Low|Preliminary",
  "confidence_level": 0.8,
  "key_claims": ["Claim 1", "Claim 2"],
  "sources": [
    {
      "citation": "Full citation",
      "url": "https://...",
      "credibility": "High|Medium|Low"
    }
  ],
  "related_models": ["mm_id1", "mm_id2"],
  "domain": ["domain1", "domain2"],
  "impact_score": 0.85
}
```

---

## ✅ Validation Checklist

Before importing content:

- [ ] All required fields present
- [ ] Enums match allowed values
- [ ] IDs are unique
- [ ] Arrays are properly formatted
- [ ] URLs are valid
- [ ] Cross-references exist
- [ ] Evidence quality justified
- [ ] Sources cited properly

---

## 🚀 Deployment Process

1. **Create Content:** Use templates above
2. **Validate:** Run through import pipeline
3. **Test:** Verify in dev environment
4. **Review:** Content quality check
5. **Deploy:** Add to `/public/data/`
6. **Index:** Update search indices
7. **Monitor:** Check analytics for usage

---

## 📈 Success Metrics

- Import success rate > 95%
- Content discoverability (search CTR)
- User engagement per model/narrative
- Time spent on content
- Bookmark/share rates
- User feedback scores

---

## 🔄 Continuous Improvement

**Monthly:**

- Review analytics
- Identify low-engagement content
- Add requested topics
- Update evidence quality

**Quarterly:**

- Major content expansion
- Category restructuring
- Cross-linking optimization
- Source updates

---

## 🎓 Content Guidelines

### Mental Models

- Clear, jargon-free definitions
- Real-world examples
- Practical applications
- Visual aids when possible
- Progressive difficulty levels

### Narratives

- Evidence-based claims
- Multiple perspectives
- Current, relevant topics
- Balanced viewpoints
- Actionable insights

---

**Target:** 200 mental models, 20 narratives by end of P5.3  
**Status:** Infrastructure ready, templates defined  
**Next:** Batch content creation & validation
