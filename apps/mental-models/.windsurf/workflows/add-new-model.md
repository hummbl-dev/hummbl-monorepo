# Add New Model Workflow

This workflow guides you through adding a new mental model to the HUMMBL system.

## Prerequisites
- Model ledger CSV updated with new model entry
- Bibliography sources verified
- Model definition written and reviewed

## Step-by-Step Process

### 1. Create Model Data File

```bash
# Location: /public/models/
# Format: {CODE}.json (e.g., P1.json, IN7.json)
```

**Template:**
```json
{
  "code": "P1",
  "name": "First Principles Thinking",
  "transformation": "P",
  "tier": 1,
  "category": {
    "primary": "Problem Solving",
    "secondary": "Critical Thinking",
    "tertiary": "Decision Making"
  },
  "definition": "Break down complex problems into fundamental truths, then reason up from there. Challenge assumptions, identify core components, and rebuild understanding from the ground up.",
  "examples": [
    {
      "title": "Elon Musk's Battery Cost Analysis",
      "description": "Instead of accepting battery pack prices, Musk broke down costs to raw materials and reimagined manufacturing.",
      "domain": "Business",
      "transformationApplied": ["P", "DE"]
    }
  ],
  "bibliography": [
    {
      "authors": ["Aristotle"],
      "title": "Physics",
      "year": -350,
      "source": "Classic text on fundamental principles",
      "url": "https://example.com/aristotle-physics"
    }
  ],
  "metadata": {
    "lastUpdated": "2025-10-23T00:00:00Z",
    "published": true,
    "version": "1.0.0"
  }
}
```

### 2. Validate Model Data

```bash
# Run validation script (when available)
pnpm validate-model P1

# Manual checks:
# ✅ Code matches pattern: (P|IN|CO|DE|RE|SY)(1-20)
# ✅ Transformation matches code prefix
# ✅ Tier is 1-4
# ✅ All required fields present
# ✅ At least one example
# ✅ At least one bibliography reference
# ✅ Definition is 100-300 characters
```

### 3. Create Model Page Component

```bash
# Location: /src/pages/models/
# Format: {Code}Page.tsx (e.g., P1Page.tsx)
```

**Template:**
```typescript
import { FC } from 'react';
import { ModelLayout } from '@/components/layouts/ModelLayout';
import { TransformationBadge } from '@/components/domain/TransformationBadge';
import { ExampleCard } from '@/components/domain/ExampleCard';
import { BibliographyList } from '@/components/domain/BibliographyList';
import p1Model from '@/public/models/P1.json';

export const P1Page: FC = () => {
  return (
    <ModelLayout model={p1Model}>
      {/* Header Section */}
      <div className="model-header">
        <h1>
          <span className="model-code">{p1Model.code}</span>
          {p1Model.name}
        </h1>
        <TransformationBadge code={p1Model.transformation} showName />
      </div>

      {/* Definition Section */}
      <section className="model-definition">
        <h2>Definition</h2>
        <p>{p1Model.definition}</p>
      </section>

      {/* Examples Section */}
      <section className="model-examples">
        <h2>Examples</h2>
        {p1Model.examples.map((example, index) => (
          <ExampleCard key={index} example={example} />
        ))}
      </section>

      {/* Bibliography Section */}
      <section className="model-bibliography">
        <h2>References</h2>
        <BibliographyList references={p1Model.bibliography} />
      </section>

      {/* Related Models Section */}
      <section className="related-models">
        <h2>Related Models</h2>
        {/* TODO: Implement related model suggestions */}
      </section>
    </ModelLayout>
  );
};
```

### 4. Add Route Configuration

```typescript
// File: /src/App.tsx or router config

import { P1Page } from '@/pages/models/P1Page';

// Add to routes array
const routes = [
  // ... existing routes
  {
    path: '/models/P1',
    element: <P1Page />,
    meta: {
      title: 'P1 - First Principles Thinking | HUMMBL',
      description: 'Break down complex problems into fundamental truths...'
    }
  }
];
```

### 5. Update Navigation

```typescript
// File: /src/components/navigation/ModelNavigation.tsx

// Add to model list
const P_SERIES_MODELS = [
  { code: 'P1', name: 'First Principles Thinking', path: '/models/P1' },
  // ... other models
];
```

### 6. Add to Search Index

```typescript
// File: /src/lib/searchIndex.ts

// This will happen automatically if using dynamic model loading
// Otherwise, manually add to static index:

export const SEARCH_INDEX = [
  {
    code: 'P1',
    name: 'First Principles Thinking',
    transformation: 'P',
    keywords: ['problem solving', 'critical thinking', 'fundamentals'],
    path: '/models/P1'
  },
  // ... other models
];
```

### 7. Test the Model Page

```bash
# Start dev server
pnpm dev

# Open browser
open http://localhost:5173/models/P1

# Manual testing checklist:
# ✅ Page loads without errors
# ✅ All sections render correctly
# ✅ Transformation badge shows correct color
# ✅ Examples display properly
# ✅ Bibliography links work
# ✅ Navigation to/from page works
# ✅ Mobile responsive
# ✅ No console errors
```

### 8. Update Model Ledger

```csv
# File: /docs/HUMMBL_Model_Source_Ledger.csv

Code,Name,Transformation,Primary Category,Secondary Category,Tertiary Category,Last Updated,Published
P1,First Principles Thinking,P,Problem Solving,Critical Thinking,Decision Making,2025-10-23,TRUE
```

### 9. Run Quality Checks

```bash
# Linting
pnpm lint

# Type checking
pnpm type-check

# Build test
pnpm build

# All should pass before committing
```

### 10. Commit and Deploy

```bash
# Create feature branch
git checkout -b feat/add-model-p1

# Stage files
git add public/models/P1.json
git add src/pages/models/P1Page.tsx
git add src/App.tsx
git add docs/HUMMBL_Model_Source_Ledger.csv

# Commit with descriptive message
git commit -m "feat(models): add P1 First Principles Thinking

- Add P1 model data file with examples and bibliography
- Create P1 model page component
- Add route configuration
- Update model ledger
- Verified rendering and navigation

Resolves #[issue-number]"

# Push to remote
git push origin feat/add-model-p1

# Create pull request
# - Review changes
# - Wait for CI checks
# - Merge to main
```

## Automation Opportunities

### Script: Generate Model Scaffold

```bash
# Future automation
pnpm generate-model P2 "Second Order Thinking"

# Would create:
# - public/models/P2.json (template)
# - src/pages/models/P2Page.tsx (from template)
# - Update routes automatically
# - Update navigation automatically
```

### Script: Validate All Models

```bash
# Run comprehensive validation
pnpm validate-all-models

# Checks:
# - JSON schema compliance
# - File naming conventions
# - Required fields present
# - Cross-references valid
# - No duplicate codes
```

## Publishing Checklist

Before marking a model as published:

- [ ] Model data file exists and is valid
- [ ] Page component created and tested
- [ ] Route configured
- [ ] Navigation updated
- [ ] Search index updated
- [ ] Examples are clear and relevant
- [ ] Bibliography is properly formatted
- [ ] All links work
- [ ] Mobile responsive
- [ ] No accessibility issues
- [ ] Model ledger updated
- [ ] Code reviewed (if applicable)
- [ ] Deployed to production

## Common Issues & Solutions

### Issue: Model not showing in navigation

**Solution:**
1. Check navigation component includes model
2. Verify route is registered
3. Clear browser cache
4. Check model `published` flag is `true`

### Issue: Bibliography links broken

**Solution:**
1. Verify DOI format is correct
2. Check URL accessibility
3. Update to archived version if original is down
4. Add wayback machine link as fallback

### Issue: Page styling inconsistent

**Solution:**
1. Use ModelLayout wrapper component
2. Follow existing page component patterns
3. Check CSS class names match design system
4. Test in multiple browsers

## Next Steps

After model is published:
1. Monitor analytics for page visits
2. Gather user feedback
3. Update examples based on real-world usage
4. Add related model suggestions
5. Consider creating video explainer (VEO 3)

---

**Remember:** Quality over speed. A well-documented, thoroughly tested model is more valuable than rushing through the process.
