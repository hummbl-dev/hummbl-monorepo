# 📋 NARRATIVE DETAIL MODAL - UI SPECIFICATION

**Priority:** P1 - High Impact  
**Estimated Effort:** 6-8 hours  
**Component:** `NarrativeDetailModal.tsx`  
**Goal:** Unlock full narrative data access (currently showing ~40% of available fields)

---

## 🎯 USER STORIES

### **US-1: View Complete Narrative Information**

**As a** researcher/user  
**I want to** click on a narrative card to see full details  
**So that I can** access all narrative data including examples, citations, methods, and relationships

**Acceptance Criteria:**

- ✅ Modal opens on card click
- ✅ Shows all narrative fields (not just summary)
- ✅ Organized in logical sections
- ✅ Closes with X button or ESC key
- ✅ Prevents body scroll when open

### **US-2: Access Academic Citations**

**As a** researcher  
**I want to** see full citation details with authors, years, titles, sources  
**So that I can** validate the academic foundation and find references

**Acceptance Criteria:**

- ✅ Citations formatted academically
- ✅ Author, year, title, source visible
- ✅ Multiple citations listed clearly
- ✅ Copy-friendly format

### **US-3: Understand Elicitation Methods**

**As a** practitioner  
**I want to** see the elicitation methods with durations and difficulty levels  
**So that I can** apply these techniques in my work

**Acceptance Criteria:**

- ✅ Method name, duration, difficulty shown
- ✅ Visual difficulty indicators
- ✅ Multiple methods listed
- ✅ Clear, actionable information

### **US-4: View Practical Examples**

**As a** user learning the framework  
**I want to** see real-world examples with scenarios, applications, and outcomes  
**So that I can** understand how to apply this narrative

**Acceptance Criteria:**

- ✅ Scenario, application, outcome for each example
- ✅ Clear visual separation between examples
- ✅ Easy to scan and read
- ✅ Multiple examples if available

### **US-5: Explore Relationships**

**As a** researcher  
**I want to** see how this narrative relates to other narratives  
**So that I can** understand the cognitive framework's structure

**Acceptance Criteria:**

- ✅ Relationship type, target, description visible
- ✅ Visual indicators for relationship types
- ✅ Clickable to navigate to related narratives (future)
- ✅ Clear hierarchy

---

## 🎨 UI DESIGN SPECIFICATION

### **Layout: Full-Screen Overlay Modal**

```
┌─────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐ │
│ │ [×]                                             │ │
│ │                                                 │ │
│ │  NAR-HUMMBL-PERSPECTIVE          [A] [perspective] │
│ │  Perspective / Identity                         │ │
│ │  ─────────────────────────────────────────────  │ │
│ │                                                 │ │
│ │  📊 Metrics                                     │ │
│ │  [88%] Confidence  [2] Signals  [2] Relations  │ │
│ │                                                 │ │
│ │  ───────────────────────────────────────────── │ │
│ │  [Overview] [Examples] [Citations] [Methods]    │ │
│ │  ───────────────────────────────────────────── │ │
│ │                                                 │ │
│ │  Summary:                                       │ │
│ │  Frame Semantics and construction grammar      │ │
│ │  support framing and perspective elicitation... │ │
│ │                                                 │ │
│ │  Complexity:                                    │ │
│ │  • Cognitive Load: Medium                       │ │
│ │  • Time to Elicit: 20-30 minutes               │ │
│ │  • Expertise Required: Intermediate             │ │
│ │                                                 │ │
│ │  Domains:                                       │ │
│ │  [linguistics] [cognitive-science] [semiotics]  │ │
│ │                                                 │ │
│ │  Tags:                                          │ │
│ │  [cognitive] [linguistic] [frame-semantics]     │ │
│ │                                                 │ │
│ │  Related Frameworks:                            │ │
│ │  • Construction Grammar                         │ │
│ │  • Conceptual Metaphor Theory                   │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
      ↑ Scrollable content area
```

### **Component Structure**

```tsx
<NarrativeDetailModal
  narrative={selectedNarrative}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
/>
```

### **Tabs Structure**

#### **Tab 1: Overview** (Default)

- Summary
- Complexity (cognitive load, time, expertise)
- Confidence, signals, relations metrics
- Domains
- Tags
- Related frameworks

#### **Tab 2: Examples**

- Multiple example cards
- Each showing:
  - 🎯 Scenario
  - ⚙️ Application
  - ✅ Outcome

#### **Tab 3: Citations**

- Academic reference list
- Each showing:
  - 👤 Author
  - 📅 Year
  - 📄 Title
  - 📚 Source

#### **Tab 4: Methods**

- Elicitation method cards
- Each showing:
  - 🔧 Method name
  - ⏱️ Duration
  - 📊 Difficulty (visual indicator)

#### **Tab 5: Relationships** (Optional)

- Relationship cards
- Each showing:
  - 🔗 Type (informs, uses, requires, etc.)
  - 🎯 Target narrative
  - 📝 Description

---

## 🎨 VISUAL DESIGN TOKENS

### **Colors**

```css
--modal-overlay: rgba(0, 0, 0, 0.5) --modal-bg: #ffffff --modal-border: var(--border-light)
  --modal-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) /* Tab colors */
  --tab-active-bg: var(--color-primary) --tab-active-text: #ffffff --tab-inactive-bg: transparent
  --tab-inactive-text: var(--text-secondary);
```

### **Spacing**

```css
--modal-padding: var(--space-8) --modal-gap: var(--space-6) --tab-padding: var(--space-4)
  var(--space-6);
```

### **Animation**

```css
.modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  animation: slideInUp 0.3s ease-out;
}
```

---

## 🔧 TECHNICAL SPECIFICATION

### **File Structure**

```
src/components/narratives/
  ├── NarrativeDetailModal.tsx (main component)
  ├── NarrativeDetailModal.css (styles)
  └── tabs/
      ├── OverviewTab.tsx
      ├── ExamplesTab.tsx
      ├── CitationsTab.tsx
      ├── MethodsTab.tsx
      └── RelationshipsTab.tsx
```

### **Props Interface**

```tsx
interface NarrativeDetailModalProps {
  narrative: Narrative | null;
  isOpen: boolean;
  onClose: () => void;
}
```

### **State Management**

```tsx
const [activeTab, setActiveTab] = useState<
  'overview' | 'examples' | 'citations' | 'methods' | 'relationships'
>('overview');
```

### **Accessibility Requirements**

- ✅ `role="dialog"`
- ✅ `aria-modal="true"`
- ✅ `aria-labelledby` pointing to title
- ✅ Focus trap (focus stays in modal)
- ✅ ESC key closes modal
- ✅ Focus returns to trigger element on close
- ✅ Body scroll locked when open
- ✅ Keyboard navigation through tabs (Arrow keys)

### **Event Handlers**

```tsx
// Close on ESC
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [onClose]);

// Close on overlay click
const handleOverlayClick = (e: React.MouseEvent) => {
  if (e.target === e.currentTarget) onClose();
};

// Prevent body scroll
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => {
    document.body.style.overflow = '';
  };
}, [isOpen]);
```

---

## 📊 DATA FIELDS EXPOSED

### **Currently Hidden (to be shown):**

- ✅ Examples (scenario, application, outcome)
- ✅ Citations (author, year, title, source)
- ✅ Elicitation methods (method, duration, difficulty)
- ✅ Relationships (type, target, description)
- ✅ Related frameworks (array of strings)
- ✅ Changelog (version, date, changes)

### **Already Visible on Card:**

- Title
- ID
- Evidence quality
- Category
- Summary
- Confidence
- Signals count
- Relations count
- Citations count
- Complexity
- Domains
- Tags

---

## ✅ ACCEPTANCE CHECKLIST

### **Functionality**

- [ ] Modal opens on narrative card click
- [ ] Modal closes on X button click
- [ ] Modal closes on ESC key
- [ ] Modal closes on overlay click
- [ ] Tabs switch correctly
- [ ] All data fields visible
- [ ] Smooth animations

### **Accessibility**

- [ ] Keyboard navigation works
- [ ] Focus trap active
- [ ] ARIA labels present
- [ ] Screen reader friendly
- [ ] High contrast text

### **Responsive**

- [ ] Works on mobile (full-screen)
- [ ] Works on tablet
- [ ] Works on desktop
- [ ] Scrollable content

### **Performance**

- [ ] No layout shift
- [ ] Smooth animations (60fps)
- [ ] No memory leaks
- [ ] Efficient re-renders

### **Testing**

- [ ] Unit tests for modal component
- [ ] Integration tests for tabs
- [ ] Accessibility tests (axe)
- [ ] E2E tests for open/close

---

## 🎯 SUCCESS METRICS

**Before:** Users can only see 9 fields (40% of data)  
**After:** Users can see all 22 fields (100% of data)

**Grade Impact:**

- Current: A- (90%)
- With Modal: A (93%)

**User Satisfaction:**

- Can access full academic citations
- Can see practical examples
- Can understand elicitation methods
- Can explore relationships

---

**READY FOR IMPLEMENTATION** ✅
