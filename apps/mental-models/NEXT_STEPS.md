# Next Development Actions - HUMMBL Project

## 🎯 Overview

Based on current project state and recent work, here are the logical next steps ordered by priority and impact.

---

## 🚦 HIGH PRIORITY (Next 1-2 Sessions)

### 1. **Test and Validate Chat Integration** 🧪
**Status**: Ready to test  
**Impact**: HIGH  
**Effort**: 1-2 hours

**Tasks**:
- [ ] Add OpenAI API key to `.env` file
- [ ] Test chat widget in browser
- [ ] Verify model suggestions appear correctly
- [ ] Test export functionality
- [ ] Verify error handling works
- [ ] Test with actual mental models data

**Why**: We just built all this - need to make sure it works!

**Commands**:
```bash
# Add API key
echo "VITE_OPENAI_API_KEY=your_key_here" >> .env

# Run dev server
pnpm dev

# Test in browser at http://localhost:5173
```

---

### 2. **Implement Narrative Detail Modal** 🔍
**Status**: Missing (noted in NARRATIVES_SELF_AUDIT.md)  
**Impact**: HIGH - Users can't access ~50% of narrative data  
**Effort**: 3-4 hours

**Problem**:
- Narratives have detailed examples, citations, elicitation methods
- Users can only see summary on cards
- Missing modal to view full narrative information

**Tasks**:
- [ ] Create `NarrativeDetailModal.tsx` component
- [ ] Add modal to `NarrativeCard` click handler
- [ ] Display all narrative fields:
  - Full content and summary
  - All examples (scenario, application, outcome)
  - Citations (author, year, title, source)
  - Elicitation methods
  - Relationships and related frameworks
  - Changelog
- [ ] Add close button and animations
- [ ] Make it responsive

**Reference**: `NARRATIVES_SELF_AUDIT.md` lines 91-108

---

### 3. **Add Model Navigation from Suggestions** 🔗
**Status**: Model suggestions exist but don't navigate  
**Impact**: MEDIUM  
**Effort**: 2-3 hours

**Problem**:
- Users can click suggested models
- But they just send a message about the model
- Should navigate to model detail page or show modal

**Tasks**:
- [ ] Create model detail view (modal or page)
- [ ] Pass navigation callback to `ModelSuggestions` component
- [ ] Implement routing to model details
- [ ] Show model definition, examples, tags
- [ ] Add "back to chat" functionality
- [ ] Add bookmark/share options

**Files to modify**:
- `src/components/chat/ModelSuggestions.tsx`
- `src/components/chat/ChatWidget.tsx`
- `src/App.tsx` (for routing)

---

## 🎨 MEDIUM PRIORITY (Next 2-4 Sessions)

### 4. **Fix Remaining TypeScript Errors** 🔧
**Status**: ~612 errors remaining  
**Impact**: MEDIUM (mostly non-critical)  
**Effort**: 4-6 hours

**Breakdown**:
- Model files (co03-co09, etc.) - parameter type mismatches
- Script files - unused variables, missing types
- Component files - minor type issues

**Strategy**:
- [ ] Prioritize model files (most visible)
- [ ] Fix implicit `any` types in components
- [ ] Add proper error type casting
- [ ] Remove truly unused code
- [ ] Leave test/sample code with `@ts-ignore` comments

**Approach**: Batch fix similar errors together

---

### 5. **Add Citation Links** 📚
**Status**: Citations are plain text  
**Impact**: MEDIUM - Academic utility  
**Effort**: 3-4 hours

**Problem**:
- Narratives have citations but they're not clickable
- Users can't access source material
- Missing academic utility

**Tasks**:
- [ ] Create `CitationLink` component
- [ ] Add DOI/Google Scholar link parsing
- [ ] Make citations clickable in narrative modals
- [ ] Add citation preview on hover
- [ ] Add "Copy Citation" button
- [ ] Export to bibliography format

**Files**:
- `src/utils/citationLinks.ts` (already exists!)
- `src/components/narratives/NarrativeDetailModal.tsx`
- Add citation link component

---

### 6. **Implement Search for Narratives** 🔍
**Status**: Only 6 narratives, but no search  
**Impact**: MEDIUM (scalability)  
**Effort**: 3-4 hours

**Problem**:
- Users can browse all narratives but can't search
- Will be a problem when more narratives are added
- Mental models have search, narratives don't

**Tasks**:
- [ ] Add search input to `NarrativeList` component
- [ ] Implement search in `useNarratives` hook
- [ ] Search by title, content, tags, domain
- [ ] Add search filters (by category, evidence quality)
- [ ] Add autocomplete/suggestions
- [ ] Add "No results" state

**Reference**: `NARRATIVES_UX_AUDIT.md` lines 112-124

---

## 🎯 LOW PRIORITY (Future Enhancements)

### 7. **Loading Skeletons** ⏳
**Status**: Basic loading, could be better  
**Impact**: LOW - Polish  
**Effort**: 1-2 hours

**Tasks**:
- [ ] Create skeleton components for narratives
- [ ] Replace simple loading with skeleton UI
- [ ] Add shimmer effect
- [ ] Match card layout

---

### 8. **Flashcard System** 📚
**Status**: Not implemented  
**Impact**: MEDIUM  
**Effort**: 6-8 hours

**Features**:
- Track which models users have reviewed
- Spaced repetition algorithm
- Progress tracking
- Bookmarks

---

### 9. **Analytics Dashboard** 📊
**Status**: Analytics system exists but needs visualization  
**Impact**: MEDIUM  
**Effort**: 4-6 hours

**Tasks**:
- [ ] Create dashboard UI
- [ ] Show user engagement metrics
- [ ] Track popular models
- [ ] Show learning progress

---

### 10. **Comparison View** ⚖️
**Status**: Not implemented  
**Impact**: LOW  
**Effort**: 5-6 hours

**Features**:
- Side-by-side model comparison
- Highlight differences
- Usage recommendations

---

## 🔧 TECHNICAL DEBT

### 11. **Update Deprecated Packages** 📦
**Status**: Several deprecated warnings  
**Impact**: LOW  
**Effort**: 1-2 hours

**Issues**:
- `@types/chokidar`, `@types/commander`, `@types/table` - stubs
- `eslint@8.57.1` - no longer supported
- Various Babel plugins deprecated

**Tasks**:
```bash
# Remove stub type packages
pnpm remove -w @types/chokidar @types/commander @types/table

# Update eslint to v9
pnpm add -D -w eslint@latest

# Update other dependencies
pnpm update --interactive
```

---

### 12. **Remove Unused `.js` Files** 🗑️
**Status**: Many compiled `.js` files in source  
**Impact**: LOW (cleanup)  
**Effort**: 30 minutes

**Issue**: `.gitignore` now excludes them, but old files remain

**Tasks**:
```bash
# Find compiled JS files
find src -name "*.js" -not -path "*/node_modules/*"

# Remove them (careful!)
git clean -f -X "*.js"
```

---

## 📋 Recommended Order

### Session 1-2 (This Week):
1. ✅ Test chat integration
2. ✅ Implement Narrative Detail Modal

### Session 3-4 (Next Week):
3. ✅ Add model navigation from suggestions
4. ✅ Fix high-priority TypeScript errors

### Session 5-6 (Following Week):
5. ✅ Add citation links
6. ✅ Implement narrative search

---

## 🎯 Quick Wins (30-60 minutes each)

1. **Fix inline style in `NarrativeCard.tsx`** (Issue #1 from audit)
   - File: `src/components/narratives/NarrativeCard.tsx:135`
   - Move `opacity: 0.7` to CSS

2. **Remove console.log** (Issue #2 from audit)
   - Remove console.logs from production code

3. **Make stats dynamic** (Issue #3 from audit)
   - Use actual counts instead of hardcoded values

4. **Add loading skeletons**
   - Quick UI improvement

5. **Update deprecated packages**
   - Clean up warnings

---

## 📊 Metrics to Track

- TypeScript errors: 612 → target < 100
- Test coverage: Needs baseline
- Build time: Current ~5s (good)
- Bundle size: Check with `pnpm build`

---

## 🎬 Immediate Next Actions

**RIGHT NOW** (Choose one):

### Option A: Test What We Built
```bash
# 1. Add API key to .env
echo "VITE_OPENAI_API_KEY=sk-test-..." >> .env

# 2. Start dev server
pnpm dev

# 3. Open browser and test chat
```

### Option B: Build Narrative Modal
```bash
# Start building the narrative detail modal
# Most impactful feature from audit
```

### Option C: Fix Quick Issues
```bash
# Fix inline styles and console logs
# 30 minutes, immediate polish
```

---

## 💡 Recommendation

**Start with Option A** (Test What We Built) - We just spent a lot of effort building the chat enhancements. Let's make sure they work before building more!

Then move to **Option B** (Narrative Modal) - This is the highest impact missing feature according to the audits.

