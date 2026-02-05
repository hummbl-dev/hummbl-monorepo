# HUMMBL Production Codebase - Agent Guidelines

**Version:** 1.0.0  
**Last Updated:** 2026-01-20  
**Codebase:** `/Users/others/Documents/GitHub/hummbl-io` (Production)  
**Live Site:** <https://hummbl.io>

---

## 🏗️ Architecture Overview

### Tech Stack (Non-Negotiable)

- **Frontend:** React 19 + Vite + TypeScript (strict mode)
- **Package Manager:** pnpm (required via `preinstall` script)
- **Styling:** CSS Modules (no TailwindCSS in production)
- **Authentication:** Supabase Auth
- **Analytics:** Sentry (error tracking) + Plausible (privacy-focused)
- **Testing:** Vitest (unit) + Jest (e2e) + Testing Library
- **Deployment:** Cloudflare Pages (frontend)

### Project Structure

```text
src/
├── components/          # React components (named exports)
│   ├── mental-models/   # Core mental model components
│   ├── chat/           # OpenAI chat integration
│   ├── auth/           # Authentication components
│   └── common/         # Shared UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks (prefixed with 'use')
├── services/           # API services and business logic
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── pages/              # Route-level components
└── store/              # State management
```

---

## 📋 TypeScript Strict Mode Rules

### Core Principles

- **Never use `any` type** - Use `unknown` with type guards
- **Explicit interfaces for all objects** - No implicit object types
- **Functional components only** - No class components
- **Named exports only** - No default exports for components

### Required Type Patterns

```typescript
// ✅ Correct: Interface for component props
interface ModelCardProps {
  model: MentalModel;
  onSelect: (model: MentalModel) => void;
}

// ✅ Correct: Functional component with explicit typing
const ModelCard: React.FC<ModelCardProps> = ({ model, onSelect }) => {
  return <div>{model.name}</div>;
};

export { ModelCard };

// ✅ Correct: Result type for error handling
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// ❌ Forbidden: Any type, implicit returns, class components
const BadComponent = (props: any) => {
  return <div>{props.something}</div>; // Type error
};
```

### Core Type Definitions

```typescript
// Located in src/types/
interface MentalModel {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  tags: string[];
  transformation?: string;
  complexity?: string;
  // ... see src/types/mental-model.ts for full definition
}

type TransformationType = 'P' | 'IN' | 'CO' | 'DE' | 'RE' | 'SY';
type ViewType = 'narratives' | 'mental-models' | 'chat' | 'settings';
```

---

## ⚛️ React 19 Best Practices

### Component Architecture

- **Components < 20 lines** when possible - Break down complex components
- **Early returns** for conditional rendering
- **Proper dependency arrays** in hooks
- **Loading and error states** for async operations

### Hook Patterns

```typescript
// ✅ Correct: Custom hook with proper typing
interface UseMentalModelFiltersReturn {
  searchTerm: string;
  selectedTransformations: string[];
  setSearchTerm: (term: string) => void;
  setSelectedTransformations: (transformations: string[]) => void;
  filteredModels: MentalModel[];
}

const useMentalModelFilters = (models: MentalModel[]): UseMentalModelFiltersReturn => {
  // Implementation
};
```

### State Management

- **Local state** for UI-specific state
- **Context API** for global state (auth, user preferences)
- **Custom hooks** for complex state logic
- **LocalStorage** for user preferences persistence

---

## 🔌 API Integration Patterns

### Service Layer Structure

```typescript
// ✅ Correct: Service with proper error handling
interface FetchMentalModelsResult {
  models: MentalModel[];
  total: number;
}

export const fetchMentalModels = async (
  options?: FetchOptions
): Promise<Result<FetchMentalModelsResult, Error>> => {
  try {
    const response = await apiClient.get('/api/mental-models', options);
    return { ok: true, value: response.data };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
};
```

### OpenAI Integration

- **Streaming responses** via `openaiStreamingService.ts`
- **Context building** via `contextualPromptBuilder.ts`
- **Rate limiting** and error handling
- **Conversation storage** via `chatStorageService.ts`

### Supabase Auth

- **Session management** via `AuthContext`
- **Protected routes** with auth guards
- **User profile** synchronization

---

## 🧪 Testing Requirements

### Unit Testing (Vitest)

- **Component testing** with Testing Library
- **Hook testing** with `@testing-library/react`
- **Service testing** with mocked API calls
- **Coverage target:** 80%+

### E2E Testing (Jest)

- **Critical user journeys** only
- **Authentication flows**
- **Mental model search and filtering**
- **Chat functionality**

### Test File Structure

```text
src/
├── components/
│   └── mental-models/
│       ├── ModelCard.tsx
│       └── __tests__/
│           ├── ModelCard.test.tsx
│           └── ModelCard.test-utils.tsx
└── services/
    └── __tests__/
        └── mentalModelsService.test.ts
```

---

## 🎨 Component Guidelines

### CSS Modules

- **Scoped styling** with `.module.css` files
- **BEM-like naming** for class names
- **Responsive design** with mobile-first approach
- **Accessibility** with semantic HTML and ARIA labels

### Component Patterns

```typescript
// ✅ Correct: Component with proper structure
interface ModelCardProps {
  model: MentalModel;
  onSelect: (model: MentalModel) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onSelect }) => {
  const handleClick = () => onSelect(model);

  return (
    <div
      data-testid="model-card"
      onClick={handleClick}
      className={styles.modelCard}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <h3 className={styles.modelName}>{model.name}</h3>
      <p className={styles.modelDescription}>{model.description}</p>
    </div>
  );
};

export { ModelCard };
```

---

## 📊 Performance & Analytics

### Performance Monitoring

- **Sentry** for error tracking and performance
- **Performance hooks** (`usePerformanceMonitor`)
- **Lazy loading** for heavy components
- **Code splitting** by route

### Analytics Implementation

- **Plausible** for privacy-focused analytics
- **Custom events** for user interactions
- **Performance metrics** collection
- **Error boundary** tracking

---

## 🔒 Security & Accessibility

### Security

- **Input validation** for all user inputs
- **XSS prevention** with React's built-in protection
- **Authentication** with Supabase security
- **API rate limiting** on backend

### Accessibility (a11y)

- **Semantic HTML** elements
- **ARIA labels** for interactive elements
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Color contrast** compliance (WCAG 2.1 AA)

---

## 🚀 Development Workflow

### Local Development

```bash
# Install dependencies (pnpm required)
pnpm install

# Start development server
pnpm dev

# Type checking
pnpm typecheck

# Linting and formatting
pnpm lint
pnpm format

# Testing
pnpm test
pnpm test:coverage
```

### Git Hooks

- **Husky** for pre-commit hooks
- **lint-staged** for automated formatting
- **Type checking** before commits
- **Test execution** on CI/CD

### Code Quality

- **ESLint** with TypeScript rules
- **Prettier** for code formatting
- **Strict TypeScript** mode enabled
- **No console.log** in production code

---

## 📝 Mental Model Integration

### Base120 Framework

- **120 mental models** organized by transformation type
- **Code system:** P1-P20, IN1-IN20, CO1-CO20, DE1-DE20, RE1-RE20, SY1-SY20
- **Search functionality** with semantic search
- **Filtering** by transformation, complexity, tags

### Data Structure

```typescript
// Each mental model includes:
interface MentalModel {
  code: string; // e.g., "P4"
  name: string; // e.g., "Stakeholder Mapping"
  description: string; // Clear definition
  examples: string[]; // Practical applications
  methods: Method[]; // Implementation methods
  relationships: Relationship[]; // Related models
  citations: Citation[]; // Academic sources
}
```

---

## 🎯 Agent-Specific Instructions

### When Modifying Code

1. **Always use TypeScript strict mode** - No `any` types
2. **Follow existing patterns** - Check similar components first
3. **Add proper error handling** - Use Result type pattern
4. **Include accessibility** - ARIA labels, keyboard navigation
5. **Write tests** - Unit tests for new functionality
6. **Update types** - Keep interfaces in sync

### When Adding Features

1. **Create new types** in `src/types/` if needed
2. **Use existing services** - Don't duplicate API logic
3. **Follow naming conventions** - PascalCase for components, camelCase for functions
4. **Add loading states** - Improve user experience
5. **Consider mobile** - Responsive design required

### When Debugging

1. **Check TypeScript errors** first - They often reveal root causes
2. **Use React DevTools** - Inspect component state and props
3. **Check network tab** - Verify API calls
4. **Review console** - Look for warnings/errors
5. **Test accessibility** - Use screen reader tools

---

## 📚 Reference Documentation

- **Development Guide:** See `docs/DEVELOPMENT.md`
- **API Specification:** See `API_INTEGRATION_SPEC.md`
- **Testing Guide:** See `TESTING_GUIDE.md`
- **Component Stories:** Storybook for component visualization
- **Model Reference:** See `MODELS_REFERENCE.md`

---

## 🚨 Red Flags (Never Do)

- ❌ **Use `any` type** - Always use explicit types
- ❌ **Default exports** - Use named exports only
- ❌ **Class components** - Functional components only
- ❌ **Console.log in production** - Use proper logging
- ❌ **Skip accessibility** - a11y is mandatory
- ❌ **Ignore TypeScript errors** - Fix them immediately
- ❌ **Break existing tests** - Update tests with code changes
- ❌ **Hardcode values** - Use constants and environment variables
- ❌ **Skip code reviews** - Ensure peer review for all changes

---

**This document serves as the authoritative guide for all agents
working on the HUMMBL production codebase. Follow these rules
strictly to maintain code quality, performance, and consistency.**
