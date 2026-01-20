# HUMMBL Migration Tickets

**Created:** 2026-01-20  
**Status:** Active  
**Source:** `hummbl-io` → `hummbl-monorepo`  
**Priority:** High-Priority Features First

---

## 🎯 Migration Overview

### **Strategic Approach**

1. **Audit existing implementations** in both repositories
2. **Identify gaps** and unique features
3. **Create detailed migration tickets** for each feature
4. **Implement in priority order** based on impact and complexity
5. **Test thoroughly** before production deployment

---

## 🚀 Ticket #1: Advanced Chat System Migration

**Priority:** **CRITICAL**  
**Estimated Effort:** 2-3 weeks  
**Dependencies:** Chat storage, context builder, streaming service

### **Feature Description**

Migrate the advanced chat system from `hummbl-io` to `hummbl-monorepo` with:

- Real-time streaming responses
- Conversation history with persistence
- Context-aware prompt building with mental models
- Advanced error handling and retry logic
- Multiple conversation management
- Chat settings and customization

### **Source Analysis (`hummbl-io`)**

#### **Components to Migrate:**

- `ChatWidget.tsx` - Main chat interface (309 lines)
- `ChatWindow.tsx` - Chat conversation display
- `ConversationHistory.tsx` - History management
- `ChatSettings.tsx` - User preferences
- `ModelSuggestions.tsx` - AI-powered suggestions
- `ChatError.tsx` - Error handling UI

#### **Key Features:**

- Streaming responses with `setStreamingResponse`
- Conversation persistence with `chatStorage.loadConversations()`
- Context building with `getContextualBuilder()`
- Multiple conversations with tabbed interface
- Error boundaries and retry logic

#### **Services to Migrate:**

- `openaiService.ts` - OpenAI API integration (118 lines)
- `openaiStreamingService.ts` - Streaming implementation
- `contextualPromptBuilder.ts` - Context building logic
- `chatStorageService.ts` - LocalStorage management

### **Target Architecture (`hummbl-monorepo`)**

#### **Implementation Location:**

- `apps/web/src/components/chat/` - Chat components
- `packages/core/src/services/` - Shared services
- `packages/core/src/types/` - Type definitions

### **Migration Tasks**

#### **Phase 1: Foundation (Week 1)**

- [ ] **Audit chat components** - Compare implementations
- [ ] **Create shared chat types** - Define interfaces
- [ ] **Migrate ChatWidget** - Core component with streaming
- [ ] **Implement chat storage** - LocalStorage service
- [ ] **Add streaming service** - Real-time responses
- [ ] **Set up context builder** - Mental model integration

#### **Phase 2: Enhancement (Week 2)**

- [ ] **Migrate ChatWindow** - Conversation display
- [ ] **Implement ConversationHistory** - History management
- [ ] **Add ChatSettings** - User preferences
- [ ] **Integrate ModelSuggestions** - AI suggestions
- [ ] **Add error handling** - Robust error management

#### **Phase 3: Integration (Week 3)**

- [ ] **Connect chat to MCP server** - Context integration
- [ ] **Implement conversation analysis** - AI insights
- [ ] **Add multi-conversation support** - Tabbed interface
- [ ] **Test streaming performance** - Real-time optimization

#### **Phase 4: Polish (Week 4)**

- [ ] **Add keyboard shortcuts** - Power user features
- [ ] **Implement chat export** - Data portability
- [ ] **Optimize performance** - Memory and speed
- [ ] **Add accessibility features** - WCAG compliance
- [ ] **Comprehensive testing** - Unit, integration, E2E

### **Acceptance Criteria**

#### **Functional Requirements:**

- ✅ Streaming responses work in real-time
- ✅ Conversations persist across sessions
- ✅ Context building integrates with mental models
- ✅ Error handling gracefully manages failures
- ✅ Multiple conversations manageable with tabs
- ✅ Settings persist user preferences

#### **Performance Requirements:**

- ✅ Initial load < 2 seconds
- ✅ Streaming latency < 500ms
- ✅ Memory usage < 50MB for chat
- ✅ LocalStorage operations < 100ms
- ✅ No memory leaks in extended sessions

#### **Integration Requirements:**

- ✅ Connects to MCP server for context
- ✅ Uses shared packages from `@hummbl/core`
- ✅ Follows monorepo TypeScript strict mode
- ✅ Compatible with existing authentication system

### **Technical Specifications**

#### **File Structure:**

```
apps/web/src/components/chat/
├── ChatWidget.tsx          # Main interface (migrate from hummbl-io)
├── ChatWindow.tsx           # Conversation display
├── ConversationHistory.tsx   # History management
├── ChatSettings.tsx         # User preferences
├── ModelSuggestions.tsx      # AI suggestions
└── ChatError.tsx           # Error handling

packages/core/src/services/
├── chatService.ts            # Unified chat service
├── streamingService.ts        # Streaming implementation
└── chatStorageService.ts      # Persistence layer
```

#### **Key Interfaces:**

```typescript
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  streaming?: boolean;
}

interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  settings?: ChatSettings;
}
```

### **Risks & Mitigations**

#### **Technical Risks:**

- **Complex state management** - Multiple conversation states
- **Streaming complexity** - Real-time data flow
- **LocalStorage limits** - Quota and performance
- **Type safety** - Complex chat interactions

#### **Mitigations:**

- Use Zustand for predictable state management
- Implement streaming in phases (basic → advanced)
- Add comprehensive error boundaries
- Optimize LocalStorage usage with batching
- Extensive TypeScript coverage

### **Dependencies**

- Requires completion of Ticket #2 (Enhanced UI Components)
- Blocks Ticket #3 (Analytics & Monitoring)
- Enables Ticket #4 (Authentication System)

---

## 📊 Ticket #2: Enhanced UI Components Migration

**Priority:** **HIGH**  
**Estimated Effort:** 2-3 weeks  
**Dependencies:** Component library, design system

### **Feature Description**

Migrate the enhanced UI components from `hummbl-io` to `hummbl-monorepo` with:

- Narrative system with cards, filters, and detail modals
- Advanced search with semantic weighting
- Model comparison features
- Progress tracking for user learning
- Enhanced ModelCard with preview and interactions

### **Source Analysis (`hummbl-io`)**

#### **Components to Migrate:**

- `NarrativeCard.tsx` - Narrative display (77 lines)
- `NarrativeFilters.tsx` - Search and filtering
- `NarrativeDetailModal.tsx` - Detailed view
- `ModelCard.tsx` - Enhanced model display (159 lines)

#### **Key Features:**

- Card-based layout with hover effects
- Advanced search with relevance scoring
- Modal system with tabbed navigation
- Progress tracking and learning metrics
- Model comparison side-by-side
- Responsive design for mobile

### **Target Architecture (`hummbl-monorepo`)**

#### **Implementation Location:**

- `apps/web/src/components/narratives/` - Narrative components
- `apps/web/src/components/mental-models/` - Model components
- `packages/ui/src/components/` - Shared component library
- `packages/core/src/hooks/` - Custom hooks

### **Migration Tasks**

#### **Phase 1: Foundation (Week 2-3)**

- [ ] **Audit narrative components** - Compare implementations
- [ ] **Create shared UI types** - Component interfaces
- [ ] **Migrate NarrativeCard** - Base component with interactions
- [ ] **Implement NarrativeFilters** - Search and filtering
- [ ] **Add modal system** - Detail views

#### **Phase 2: Enhancement (Week 3-4)**

- [ ] **Migrate NarrativeDetailModal** - Tabbed detail view
- [ ] **Implement advanced search** - Semantic ranking
- [ ] **Add model comparison** - Side-by-side analysis
- [ ] **Create progress tracking** - Learning journey

#### **Phase 3: Integration (Week 4-5)**

- [ ] **Connect to MCP server** - Context integration
- [ ] **Implement recommendations** - AI-powered suggestions
- [ ] **Add export functionality** - Data portability
- [ ] **Responsive design** - Mobile optimization

#### **Phase 4: Polish (Week 5-6)**

- [ ] **Performance optimization** - Lazy loading, code splitting
- [ ] **Accessibility enhancement** - WCAG 2.1 compliance
- [ ] **Animation and micro-interactions** - UX improvements
- [ ] **Comprehensive testing** - All component coverage

### **Acceptance Criteria**

#### **Functional Requirements:**

- ✅ Narrative cards display with rich interactions
- ✅ Advanced search with semantic relevance
- ✅ Modal system with comprehensive information
- ✅ Model comparison and analysis features
- ✅ Progress tracking visualization
- ✅ Mobile-responsive design

#### **Performance Requirements:**

- ✅ Component render < 16ms for 60fps
- ✅ Search results < 100ms
- ✅ Modal transitions < 200ms
- ✅ Memory usage stable under load
- ✅ Bundle size impact < 50KB

#### **Integration Requirements:**

- ✅ Uses shared component library (`@hummbl/ui`)
- ✅ Integrates with mental models system
- ✅ Follows monorepo design patterns
- ✅ TypeScript strict mode compliance

---

**Next Steps:**

1. **Review and approve migration tickets**
2. **Begin with Ticket #1 (Chat System)**
3. **Create additional tickets for remaining features**
4. **Set up iteration and review process**

**This migration plan ensures systematic transfer of advanced features while maintaining code quality and performance standards.**
