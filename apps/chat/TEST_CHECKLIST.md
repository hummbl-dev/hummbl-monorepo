# HUMMBL Base120 - Test Checklist

## 1. Search & Filter Interactions

### Search Functionality

- [ ] CMD+K shortcut focuses search input
- [ ] Search works in names, descriptions, and tags
- [ ] Search results update in real-time
- [ ] Search placeholder text is helpful
- [ ] Search with special characters (symbols, numbers)
- [ ] Empty search shows all models
- [ ] Search with no results shows proper empty state

### Transformation Filters

- [ ] "All" button shows all transformations
- [ ] Individual transformation buttons (P, IN, CO, DE, RE, SY) work correctly
- [ ] Filter shows correct count (20 models each)
- [ ] Filter colors match transformation theme
- [ ] Multiple transformation filters cannot be selected (radio behavior)
- [ ] Clear button removes transformation filter

### Difficulty Filters

- [ ] "All" button shows all difficulties
- [ ] Individual difficulty buttons (Beginner, Intermediate, Advanced) work correctly
- [ ] Difficulty counts match expected distribution
- [ ] Multiple difficulty filters cannot be selected (radio behavior)
- [ ] Clear button removes difficulty filter

### Combined Filtering

- [ ] Search + Transformation filter works together
- [ ] Search + Difficulty filter works together
- [ ] Transformation + Difficulty filters work together
- [ ] All three filters work together simultaneously
- [ ] Active filters summary shows correct state
- [ ] "Clear All" removes all filters at once

## 2. Navigation & Routing

### Model Cards

- [ ] Model cards link to correct `/model/:id` routes
- [ ] Route navigation is smooth (no full page reload)
- [ ] Browser back button works correctly
- [ ] Browser forward button works correctly
- [ ] Direct URL access to `/model/:id` works

### "OPEN SESSION" Functionality

- [ ] Clicking "OPEN SESSION" copies model system_prompt to clipboard
- [ ] Toast notification shows success message
- [ ] Clipboard error handling works (if clipboard unavailable)
- [ ] Copy action doesn't trigger navigation

### Framework Overview

- [ ] Clicking transformation cards filters to that transformation
- [ ] Smooth scroll to models section after selection
- [ ] Overview hides when filters are active

## 3. Responsive Design

### Breakpoint Testing

- [ ] **Mobile (< 768px)**: Grid collapses to 1 column
- [ ] **Tablet (768px - 1023px)**: Grid shows 2 columns
- [ ] **Desktop (1024px - 1439px)**: Grid shows 2-3 columns
- [ ] **Large Desktop (≥ 1440px)**: Grid shows 3 columns

### Touch Interactions

- [ ] Hover states work on touch devices (tap to show)
- [ ] Filter buttons are touch-friendly size
- [ ] Search input works on mobile keyboards
- [ ] Navigation links work with touch

### Layout Integrity

- [ ] No horizontal scrolling on any viewport
- [ ] Text remains readable at all sizes
- [ ] Buttons and inputs maintain proper spacing
- [ ] Framework Overview grid adapts properly

## 4. Data Integrity

### Model Counts

- [ ] Total shows 120 models
- [ ] Each transformation shows exactly 20 models
- [ ] Perspective: 3 Beginner + 12 Intermediate + 5 Advanced = 20
- [ ] Inversion: 2 Beginner + 14 Intermediate + 4 Advanced = 20
- [ ] Composition: 2 Beginner + 13 Intermediate + 5 Advanced = 20
- [ ] Decomposition: 3 Beginner + 16 Intermediate + 1 Advanced = 20
- [ ] Recursion: 3 Beginner + 12 Intermediate + 5 Advanced = 20
- [ ] Systems: 3 Beginner + 16 Intermediate + 1 Advanced = 20

### Model Data

- [ ] All model IDs follow pattern (P1-P20, IN1-IN20, etc.)
- [ ] Model names display correctly
- [ ] Descriptions display without truncation issues
- [ ] Tags display properly (max 3 shown with count)
- [ ] Difficulty badges show correct colors
- [ ] Transformation codes match ID prefixes
- [ ] Base-level numbers display correctly

### API Integration

- [ ] Models load from API correctly
- [ ] Fallback to local data works if API fails
- [ ] Loading states show during API calls
- [ ] Error handling works for API failures

## 5. Performance

### Load Performance

- [ ] Initial page load < 3 seconds
- [ ] First contentful paint < 1.5 seconds
- [ ] Models render without noticeable lag
- [ ] Filters apply instantly (< 100ms)

### Interaction Performance

- [ ] Search responds in real-time (< 50ms)
- [ ] Hover previews appear smoothly
- [ ] Filter transitions are smooth
- [ ] No layout shifts during loading

### Memory Usage

- [ ] No memory leaks during navigation
- [ ] Hover previews clean up properly
- [ ] Filter state management is efficient

## 6. Edge Cases & Error Handling

### Empty States

- [ ] "No matching patterns" message appears
- [ ] Clear filters button appears in empty state
- [ ] Helpful messaging guides users
- [ ] Empty state maintains layout integrity

### Special Characters

- [ ] Search with symbols (@, #, $, etc.)
- [ ] Search with numbers
- [ ] Search with mixed case
- [ ] Search with unicode characters
- [ ] Search with very long queries

### Concurrent Operations

- [ ] Rapid filter switching works
- [ ] Search while filters are active
- [ ] Multiple hover previews don't conflict
- [ ] Navigation during loading states

## 7. Accessibility

### Keyboard Navigation

- [ ] Tab order is logical
- [ ] All interactive elements are focusable
- [ ] Focus indicators are visible
- [ ] Enter/Space keys activate buttons
- [ ] Escape key clears filters

### Screen Readers

- [ ] All images have alt text
- [ ] Buttons have descriptive labels
- [ ] Form inputs have proper labels
- [ ] Semantic HTML structure
- [ ] ARIA labels where needed

### Visual Accessibility

- [ ] Color contrast meets WCAG standards
- [ ] Text remains readable when enlarged
- [ ] Focus indicators are visible
- [ ] Color alone doesn't convey information

## 8. Cross-Browser Compatibility

### Major Browsers

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Feature Support

- [ ] CSS Grid works correctly
- [ ] CSS custom properties work
- [ ] Clipboard API works (with fallback)
- [ ] Fetch API works

## 9. Security

### Content Security

- [ ] No XSS vulnerabilities in search
- [ ] User input is properly sanitized
- [ ] External links are safe
- [ ] Clipboard access is appropriate

## 10. User Experience

### Onboarding

- [ ] Framework Overview is intuitive
- [ ] Filter controls are discoverable
- [ ] Search functionality is obvious
- [ ] Navigation is predictable

### Feedback

- [ ] Loading states provide feedback
- [ ] Success messages are clear
- [ ] Error messages are helpful
- [ ] Hover states provide context

### Delight

- [ ] Transitions are smooth
- [ ] Micro-interactions feel polished
- [ ] Color scheme is cohesive
- [ ] Typography is readable

---

## Test Priority

### High Priority (Must Pass)

- All data integrity tests
- Basic search and filter functionality
- Navigation and routing
- Responsive design breakpoints

### Medium Priority (Should Pass)

- Performance benchmarks
- Edge cases and error handling
- Accessibility requirements
- Cross-browser compatibility

### Low Priority (Nice to Have)

- Advanced interaction patterns
- Security hardening
- Performance optimization
- UX polish items
