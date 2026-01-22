# HUMMBL Context Engineering Documentation

**AI-optimized context for Windsurf Cascade IDE**

## Overview

This directory contains **context engineering documents** designed to help Windsurf's Cascade AI agent understand the HUMMBL codebase, patterns, and development workflows. These documents serve as "external memory" for AI agents, reducing the need for repeated explanations and improving code generation quality.

## What is Context Engineering?

Context engineering is the practice of creating structured documentation that AI coding assistants can consume to understand:
- Project architecture and patterns
- Coding standards and conventions  
- Common workflows and procedures
- Domain-specific knowledge
- Decision history and rationale

**Goal**: Enable Cascade to make better decisions by providing rich, structured context about the HUMMBL project.

## Document Structure

### 📁 `.windsurf/` Directory

This is Windsurf's standard location for project-specific AI context.

#### `rules/global.md`
**Purpose**: Coding standards and conventions  
**When Cascade Uses It**: Every time it generates or modifies code  
**Key Content**:
- TypeScript patterns and type safety rules
- React component conventions
- File organization standards
- Error handling patterns
- Performance requirements
- Git commit message format
- Mental model application in code

**Example Use Case**: When asked to create a new component, Cascade references this to ensure it follows HUMMBL's naming conventions, type safety rules, and transformation-first thinking.

#### `workflows/`
**Purpose**: Step-by-step procedures for common tasks  
**When Cascade Uses It**: When executing multi-step operations  
**Files**:
- `deploy-feature.md` - Complete deployment cycle
- `add-new-model.md` - Adding new mental models to the system

**Example Use Case**: When asked to "add model P2", Cascade follows the workflow to create the JSON file, page component, route config, and all necessary updates.

### 📄 Root Documentation

#### `ARCHITECTURE.md`
**Purpose**: System design and technical architecture  
**When Cascade Uses It**: When making architectural decisions or adding features  
**Key Content**:
- High-level system overview
- Domain model (Base120 structure)
- Technology stack details
- Directory structure
- Data flow patterns
- Scalability considerations
- Extension points

**Example Use Case**: When asked to "design the API layer", Cascade references this to understand existing patterns and make consistent architectural choices.

#### `PATTERNS.md`
**Purpose**: Proven code patterns used throughout the project  
**When Cascade Uses It**: When writing specific types of code  
**Key Content**:
- Model data handling patterns
- Transformation logic patterns
- Component composition patterns
- Utility function patterns
- Type definition patterns
- Error handling patterns
- Anti-patterns to avoid

**Example Use Case**: When asked to "add search functionality", Cascade references the search utility patterns to implement consistent filtering and ranking logic.

#### `PROJECT_CONTEXT.md`
**Purpose**: Quick reference "cheat sheet" for the project  
**When Cascade Uses It**: First-time understanding or quick lookups  
**Key Content**:
- Project identity and mission
- Current status and priorities
- Tech stack summary
- Key files and their purposes
- Development workflow
- Important conventions
- Common questions

**Example Use Case**: When starting a new session, Cascade reads this to quickly understand what HUMMBL is, what's built, what's in progress, and what conventions to follow.

## How Cascade Uses These Documents

### 1. Initial Context Loading
When you open the HUMMBL project in Windsurf:
```
Cascade reads:
├── PROJECT_CONTEXT.md       # "What is this project?"
├── ARCHITECTURE.md          # "How is it structured?"
└── .windsurf/rules/global.md # "What are the standards?"
```

### 2. Task-Specific Context
When you ask Cascade to perform a task:
```
"Add a new model P2"
└─> Cascade reads: .windsurf/workflows/add-new-model.md
    └─> Follows step-by-step procedure
    └─> References PATTERNS.md for code structure
    └─> Applies rules from global.md
```

### 3. Code Generation
When Cascade generates code:
```
Cascade considers:
├── global.md rules          # Naming, types, structure
├── PATTERNS.md examples     # Proven implementations
├── ARCHITECTURE.md design   # System integration
└── Project history          # Past decisions
```

## Benefits for Development

### For You (Human Developer)
- ✅ Less time explaining context
- ✅ More consistent code generation
- ✅ Better first-pass suggestions from Cascade
- ✅ Reduced back-and-forth clarification
- ✅ Knowledge preservation (reduces bus factor)

### For Cascade (AI Agent)
- ✅ Understands project conventions
- ✅ Makes architecture-consistent decisions
- ✅ Follows established patterns
- ✅ Knows what workflows to follow
- ✅ Avoids anti-patterns and common mistakes

### For the Project
- ✅ Maintains consistency as codebase grows
- ✅ Onboards new contributors faster (human or AI)
- ✅ Documents decisions and rationale
- ✅ Reduces technical debt
- ✅ Enables better multi-agent coordination

## Maintenance Strategy

### When to Update

**Update `global.md` when:**
- Adopting new coding standards
- Changing tech stack (e.g., adding Tailwind)
- Establishing new conventions
- Identifying anti-patterns to avoid

**Update `ARCHITECTURE.md` when:**
- Adding major features (API layer, database)
- Restructuring directories
- Changing deployment strategy
- Introducing new design patterns

**Update `PATTERNS.md` when:**
- Creating new reusable patterns
- Discovering better implementations
- Deprecating old approaches
- Adding complex examples

**Update `PROJECT_CONTEXT.md` when:**
- Project status changes significantly
- Priorities shift
- New features complete
- Tech stack evolves

**Add new workflows when:**
- Repeating multi-step procedures
- Onboarding new team members
- Automating common tasks

### Review Cadence

- **Weekly**: Check if new patterns emerged during development
- **Monthly**: Review and update PROJECT_CONTEXT status
- **Quarterly**: Comprehensive review of all documents
- **Per Feature**: Update relevant docs when shipping major features

## Best Practices

### Writing for AI Consumption

**DO:**
- ✅ Use clear, structured headings
- ✅ Include concrete code examples
- ✅ Explain the "why" behind decisions
- ✅ Use consistent terminology
- ✅ Provide both conceptual and implementation details
- ✅ Include anti-patterns (what NOT to do)

**DON'T:**
- ❌ Use vague or ambiguous language
- ❌ Assume implicit context
- ❌ Include outdated information
- ❌ Write documentation that contradicts code
- ❌ Over-optimize for brevity (clarity > conciseness)

### Example: Good vs. Bad Documentation

**Bad (Vague):**
```markdown
## Components
Put components in the components folder.
Use TypeScript.
```

**Good (Clear, Actionable):**
```markdown
## Component Organization

### Directory Structure
- `src/components/common/` - Generic UI (Button, Card, Layout)
- `src/components/domain/` - HUMMBL-specific (ModelCard, TransformationBadge)

### Naming Convention
- Files: PascalCase (ModelCard.tsx)
- Exports: Named exports preferred
- Props: TypeName + "Props" suffix (ModelCardProps)

### Example Component
\`\`\`typescript
interface ModelCardProps {
  model: Model;
  onClick?: () => void;
}

export const ModelCard: FC<ModelCardProps> = ({ model, onClick }) => {
  return (
    <div className="model-card" onClick={onClick}>
      <h3>{model.name}</h3>
    </div>
  );
};
\`\`\`
```

## Integration with Development Workflow

### Standard Development Session

```
1. Open Windsurf IDE
   └─> Cascade loads context documents automatically

2. Ask Cascade to implement feature
   └─> "Add transformation badge component"
   └─> Cascade reads:
       - global.md (conventions)
       - PATTERNS.md (component patterns)
       - ARCHITECTURE.md (where it fits)

3. Cascade generates code following all guidelines
   └─> First pass is production-ready
   └─> Minimal revisions needed

4. Review and iterate
   └─> Point out any issues
   └─> Cascade adjusts based on feedback

5. Update docs if new patterns emerged
   └─> Add to PATTERNS.md for future reference
```

### Multi-Agent Coordination

When working with multiple AI agents (Claude, ChatGPT-5, Cascade):

```
Claude (Lead Dev):
├─> Creates high-level architecture
├─> Documents in ARCHITECTURE.md
└─> Updates PROJECT_CONTEXT.md status

ChatGPT-5 (Validator):
├─> Reviews implementations
├─> Validates against standards
└─> Suggests pattern improvements

Cascade (Implementation):
├─> Reads all context documents
├─> Implements features locally
└─> Follows established patterns
```

## Examples of Context in Action

### Example 1: Adding a New Model

**Without Context:**
```
You: "Add model P2"
Cascade: "Where should I put the file?"
You: "In /public/models/"
Cascade: "What format?"
You: "JSON with code, name, transformation..."
[10 minutes of back-and-forth]
```

**With Context:**
```
You: "Add model P2"
Cascade: [Reads add-new-model.md workflow]
Cascade: "Creating P2.json in /public/models/ with standard structure,
         creating P2Page.tsx component, updating routes, and navigation.
         Following transformation P conventions per global.md."
[2 minutes, done correctly first try]
```

### Example 2: Refactoring Components

**Without Context:**
```
You: "Refactor ModelCard to be more composable"
Cascade: [Creates class-based component]
You: "No, we use functional components"
Cascade: [Creates component without types]
You: "Add TypeScript types"
[Multiple iterations]
```

**With Context:**
```
You: "Refactor ModelCard to be more composable"
Cascade: [Reads PATTERNS.md component composition section]
Cascade: "Creating functional component with FC type,
         using composition pattern with subcomponents per PATTERNS.md.
         Following strict TypeScript conventions from global.md."
[First pass matches project standards]
```

## Future Enhancements

### Planned Additions

1. **API Design Rules** (`rules/api.md`)
   - Endpoint naming conventions
   - Response format standards
   - Error handling patterns
   - Authentication rules

2. **Testing Workflows** (`workflows/testing.md`)
   - Running test suites
   - Writing new tests
   - Test coverage requirements
   - E2E test procedures

3. **Performance Optimization** (`workflows/optimize.md`)
   - Bundle analysis
   - Code splitting strategies
   - Caching implementations
   - Performance monitoring

4. **Community Guidelines** (`workflows/contributor-onboarding.md`)
   - Pull request process
   - Code review checklist
   - Issue triage
   - Community standards

### Integration Opportunities

- **MCP Servers**: Connect Cascade to external tools (Sentry, Analytics)
- **Custom Rules**: Project-specific linting and validation
- **Automated Updates**: Script to sync docs with code changes
- **Visual Diagrams**: Architecture diagrams for Cascade to reference

## Troubleshooting

### Cascade Not Following Guidelines

**Possible Causes:**
1. Context not loaded (reload Windsurf window)
2. Documents outdated (review and update)
3. Conflicting instructions (check for contradictions)
4. Ambiguous language (clarify in docs)

**Solutions:**
- Explicitly reference docs: "Follow the pattern in PATTERNS.md"
- Update docs to be more specific
- Add examples for complex cases

### Inconsistent Code Generation

**Check:**
- Are all documents up to date?
- Do examples match current code style?
- Are there gaps in coverage?
- Do conventions need clarification?

**Fix:**
- Review and update stale sections
- Add more concrete examples
- Document edge cases
- Clarify ambiguous rules

## Conclusion

These context engineering documents transform Windsurf Cascade from a generic AI assistant into a **HUMMBL-specialized development partner**. By investing time in maintaining these documents, you enable:

- **Faster development** (less explanation overhead)
- **Higher quality** (consistent standards)
- **Better collaboration** (human and AI agents)
- **Knowledge preservation** (project memory)

**Remember**: Good documentation is an investment that compounds over time. Every minute spent maintaining context saves hours in future development sessions.

---

## Quick Reference

| Document | Purpose | Update Frequency |
|----------|---------|-----------------|
| `PROJECT_CONTEXT.md` | Quick overview | Weekly |
| `ARCHITECTURE.md` | System design | Per major feature |
| `PATTERNS.md` | Code patterns | When new patterns emerge |
| `.windsurf/rules/global.md` | Coding standards | Monthly or as needed |
| `.windsurf/workflows/*.md` | Procedures | When processes change |

**Last Updated**: October 23, 2025  
**Maintained By**: Claude Sonnet 4.5 (Lead Development Agent)  
**For**: HUMMBL Project (hummbl.io)
