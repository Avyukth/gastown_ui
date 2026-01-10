# Phase 6: Secondary Pages & State Management Enhancement

**Status**: Planning  
**Target Completion**: January 11-13, 2026  
**Focus**: Secondary page enhancements, error/empty/loading states, dark mode verification, accessibility compliance

---

## Overview

Phase 6 focuses on enhancing secondary content pages (Queue, Convoys, Workflows, etc.) with consistent state management patterns, comprehensive error handling, empty states, and loading states. This phase ensures all pages follow the established design patterns from Phases 1-5.

---

## Current Situation

### Phases Completed
- ✅ Phase 1: Foundation & Navigation
- ✅ Phase 2: Mobile/Desktop UX (10 tasks)
- ✅ Phase 3: Design System (icons, titles, colors)
- ✅ Phase 4: Dashboard & Cards
- ✅ Phase 5: Form & Content Pages

### Progress
- **71% of roadmap complete** (5 of 7+ phases)
- **0 TypeScript errors**
- **100% build success**
- **Production-ready code quality**

### What's Missing
- Secondary pages lack consistent error/empty/loading states
- Some pages need responsive improvements
- Dark mode needs verification across all pages
- WCAG AA compliance needs verification on all pages
- Queue, Convoys, Workflows pages need enhancements

---

## 6.1 Secondary Pages State Management

**Priority**: High  
**Current Status**: Not yet implemented

### Overview

Secondary pages need consistent implementation of three states:
1. **Loading State** - Data being fetched
2. **Empty State** - No data to display
3. **Error State** - Failed to fetch data

### Pages to Enhance

| Page | Route | Current State | Enhancement Needed |
|------|-------|---------------|-------------------|
| Queue | `/queue` | Basic list | Add error/empty/loading states |
| Convoys | `/convoys` | Basic list | Add error/empty/loading states |
| Workflows | `/workflows` | Basic list | Add error/empty/loading states |
| Rigs | `/rigs` | Basic list | Add error/empty/loading states |
| Alerts | `/alerts` | Basic list | Add error/empty/loading states |
| Health | `/health` | Dashboard | Add loading states |
| Activity | `/activity` | Log view | Add loading states |
| Watchdog | `/watchdog` | Dashboard | Add loading states |

### Pattern Implementation

**Loading State Pattern**:
```svelte
{#if isLoading}
  <SkeletonCard type="queue" count={5} />
{:else if error}
  <ErrorState
    title="Failed to load items"
    message={error}
    onRetry={handleRetry}
    showRetryButton={true}
  />
{:else if items.length === 0}
  <EmptyState
    title="No items"
    description="Create your first item to get started"
  />
{:else}
  <!-- Content here -->
{/if}
```

**Server-Side Error Handling**:
```typescript
export const load: PageServerLoad = async () => {
  try {
    const result = await fetchData();
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};
```

### Implementation Steps

1. Identify all secondary pages that need state management
2. Add loading, error, empty states to each page
3. Implement server-side error handling
4. Add retry functionality to error states
5. Test on all viewports
6. Verify dark mode colors

### Acceptance Criteria

- [ ] All secondary pages have loading states
- [ ] All secondary pages have error states
- [ ] All secondary pages have empty states
- [ ] Error states show specific error messages
- [ ] Retry buttons work properly
- [ ] Loading states use consistent SkeletonCard
- [ ] Dark mode colors correct for all states
- [ ] No TypeScript errors
- [ ] Responsive on 320px, 375px, 768px, 1024px+

---

## 6.2 Dark Mode Complete Verification

**Priority**: High  
**Current Status**: Partially verified (main pages done)

### Scope

Verify dark mode colors and contrast on all pages, including:
- Secondary pages (Queue, Convoys, etc.)
- Error states across all pages
- Empty states across all pages
- Loading states (SkeletonCard variants)
- All status colors in dark mode

### Verification Checklist

- [ ] All text meets 4.5:1 contrast ratio in dark mode
- [ ] All status indicators visible in dark mode
  - Success (green) readable
  - Error (red) readable
  - Warning (amber) readable
  - Info (blue) readable
- [ ] Badge colors correct in dark mode
- [ ] Card backgrounds appropriate in dark mode
- [ ] Borders visible in dark mode
- [ ] Icons color-coded correctly in dark mode
- [ ] Form inputs readable in dark mode
- [ ] Buttons have proper contrast in dark mode

### Testing Approach

1. Enable system dark mode
2. Visit each page and verify colors
3. Use axe DevTools for WCAG AA verification
4. Check WAVE for contrast errors
5. Document any needed fixes

### Acceptance Criteria

- [ ] All pages tested in dark mode
- [ ] 0 contrast violations (4.5:1+)
- [ ] All status colors distinguishable
- [ ] All icons visible and appropriately colored
- [ ] No color-dependent information
- [ ] All interactive elements clearly visible

---

## 6.3 WCAG AA Accessibility Verification

**Priority**: High  
**Current Status**: Partially verified (main pages done)

### Scope

Complete WCAG AA 2.1 Level AA accessibility verification across all pages:
- Keyboard navigation
- Screen reader support
- Color contrast
- Focus management
- Semantic HTML
- ARIA labels

### Testing Checklist

**Keyboard Navigation**:
- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] No keyboard traps
- [ ] Focus indicator visible on all focusable elements
- [ ] Enter/Space activate buttons and links
- [ ] Escape closes modals and dropdowns

**Screen Reader Support**:
- [ ] Page titles announced correctly
- [ ] Form labels associated with inputs
- [ ] Icon buttons have aria-labels
- [ ] Status indicators have aria-live regions
- [ ] Error messages announced
- [ ] Loading states announced

**Color & Contrast**:
- [ ] All text meets 4.5:1 contrast (normal)
- [ ] All UI components meet 3:1 contrast
- [ ] No information conveyed by color alone
- [ ] Links distinguishable from text

**Focus Management**:
- [ ] Focus visible on all interactive elements (2px ring minimum)
- [ ] Focus outline has at least 3:1 contrast
- [ ] Focus not hidden by other elements
- [ ] Modal dialog traps focus properly

**Semantic HTML**:
- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Lists use semantic list elements
- [ ] Buttons are `<button>` elements
- [ ] Links are `<a>` elements
- [ ] Form controls properly labeled

**ARIA Labels**:
- [ ] Icon-only buttons have aria-label
- [ ] Status indicators have aria-live="polite"
- [ ] Dialogs have aria-modal="true"
- [ ] Loading indicators have aria-busy
- [ ] Required fields have aria-required="true"

### Testing Tools

- **VoiceOver** (macOS built-in)
- **NVDA** (Windows free screen reader)
- **axe DevTools** (Chrome/Firefox extension)
- **WAVE** (Firefox/Chrome extension)
- **Keyboard-only navigation** (disable mouse)

### Acceptance Criteria

- [ ] Zero axe violations
- [ ] Zero WAVE contrast errors
- [ ] Full keyboard navigation
- [ ] Screen reader properly announces content
- [ ] Focus management correct
- [ ] Semantic HTML throughout
- [ ] ARIA labels complete

---

## 6.4 Responsive Design Verification

**Priority**: Medium  
**Current Status**: Partially verified

### Scope

Verify responsive design on all pages across viewports:
- 320px (iPhone SE)
- 375px (iPhone 12)
- 768px (iPad)
- 1024px (iPad Pro)
- 1440px+ (Desktop)

### Testing Checklist

**Mobile (320px, 375px)**:
- [ ] No horizontal scroll
- [ ] Touch targets 44px+ minimum
- [ ] Text readable without zoom
- [ ] Images scale properly
- [ ] Navigation accessible
- [ ] Forms easy to complete

**Tablet (768px)**:
- [ ] Layout adapts to tablet size
- [ ] Sidebar behavior correct (if present)
- [ ] Content width optimal
- [ ] Touch targets adequate

**Desktop (1024px+)**:
- [ ] Multi-column layouts work
- [ ] Sidebar fully visible (if applicable)
- [ ] Optimal line length (60-80 chars)
- [ ] Whitespace balanced

### Acceptance Criteria

- [ ] All pages tested on 5+ viewports
- [ ] No horizontal scroll at any viewport
- [ ] Touch targets 44px+ on mobile
- [ ] Text readable without zoom
- [ ] Images scale correctly
- [ ] Layout adapts smoothly
- [ ] Navigation works on all sizes

---

## 6.5 Page-Specific Enhancements

**Priority**: Medium  
**Current Status**: Not started

### Queue Page (`/queue`)

**Current State**: Lists merge queue items

**Enhancements Needed**:
- [ ] Add loading skeleton with queue items
- [ ] Add error state for failed to fetch
- [ ] Add empty state when queue is empty
- [ ] Show item count in title
- [ ] Add status badges (pending, running, completed)
- [ ] Add refresh functionality
- [ ] Add filtering/sorting options

### Convoys Page (`/convoys`)

**Current State**: Lists convoys

**Enhancements Needed**:
- [ ] Add loading skeleton with convoy cards
- [ ] Add error state for failed to fetch
- [ ] Add empty state when no convoys
- [ ] Show convoy count in title
- [ ] Add status indicators per convoy
- [ ] Add create convoy button (FAB or top button)
- [ ] Add convoy detail navigation

### Workflows Page (`/workflows`)

**Current State**: Lists workflows

**Enhancements Needed**:
- [ ] Add loading skeleton with workflow cards
- [ ] Add error state for failed to fetch
- [ ] Add empty state when no workflows
- [ ] Show workflow count in title
- [ ] Add status progress bars
- [ ] Add workflow filtering
- [ ] Add detail navigation

### Health Page (`/health`)

**Current State**: Dashboard view

**Enhancements Needed**:
- [ ] Add loading state while fetching metrics
- [ ] Show health status (Healthy/Degraded/Critical)
- [ ] Add refresh button
- [ ] Improve card layout
- [ ] Add color-coded status indicators

### Activity Page (`/activity`)

**Current State**: Activity log view

**Enhancements Needed**:
- [ ] Add loading state while fetching logs
- [ ] Add empty state when no activity
- [ ] Add error state for failed to fetch
- [ ] Add filters (type, date range)
- [ ] Add time formatting consistency
- [ ] Add pagination or virtual scrolling

---

## Task Breakdown

### 6.1 Secondary Pages State Management
- [ ] **gt-mol-6a1-impl**: Implement - Queue page states
- [ ] **gt-mol-6a2-impl**: Implement - Convoys page states
- [ ] **gt-mol-6a3-impl**: Implement - Workflows page states
- [ ] **gt-mol-6a4-impl**: Implement - Rigs page states
- [ ] **gt-mol-6a5-impl**: Implement - Alerts page states
- [ ] **gt-mol-6a6-impl**: Implement - Health page states
- [ ] **gt-mol-6a7-impl**: Implement - Activity page states
- [ ] **gt-mol-6a8-impl**: Implement - Watchdog page states

### 6.2 Dark Mode Verification
- [ ] **gt-mol-6b1-test**: Test - Dark mode colors verification
- [ ] **gt-mol-6b2-test**: Test - Contrast ratios all pages
- [ ] **gt-mol-6b3-test**: Test - Status colors in dark mode
- [ ] **gt-mol-6b4-test**: Test - Dark mode accessibility

### 6.3 WCAG AA Verification
- [ ] **gt-mol-6c1-test**: Test - Keyboard navigation all pages
- [ ] **gt-mol-6c2-test**: Test - Screen reader support
- [ ] **gt-mol-6c3-test**: Test - Color contrast (WAVE/axe)
- [ ] **gt-mol-6c4-test**: Test - Semantic HTML
- [ ] **gt-mol-6c5-test**: Test - ARIA labels complete

### 6.4 Responsive Design Verification
- [ ] **gt-mol-6d1-test**: Test - Responsive 320px/375px/768px
- [ ] **gt-mol-6d2-test**: Test - Responsive 1024px/1440px
- [ ] **gt-mol-6d3-test**: Test - Touch targets mobile
- [ ] **gt-mol-6d4-test**: Test - Text scaling and zoom

### 6.5 Page-Specific Enhancements
- [ ] **gt-mol-6e1-impl**: Enhance - Queue page
- [ ] **gt-mol-6e2-impl**: Enhance - Convoys page
- [ ] **gt-mol-6e3-impl**: Enhance - Workflows page
- [ ] **gt-mol-6e4-impl**: Enhance - Health page
- [ ] **gt-mol-6e5-impl**: Enhance - Activity page

---

## File Structure

No new files needed. Modifications to existing pages:

```
src/routes/
├── queue/
│   └── +page.svelte              (Add states)
├── convoys/
│   └── +page.svelte              (Add states)
├── workflows/
│   └── +page.svelte              (Add states)
├── rigs/
│   └── +page.svelte              (Add states)
├── alerts/
│   └── +page.svelte              (Add states)
├── health/
│   └── +page.svelte              (Add loading state)
├── activity/
│   └── +page.svelte              (Add states)
├── watchdog/
│   └── +page.svelte              (Add loading state)
└── settings/
    └── +page.svelte              (Verify/enhance if needed)
```

---

## Dependencies

All required dependencies already installed:
- `lucide-svelte` (icons)
- `zod` (validation)
- `tailwind-css` (styling)
- No new dependencies needed

---

## Quality Gates

Before marking Phase 6 complete:

- [ ] Zero TypeScript errors
- [ ] All builds succeed
- [ ] No console errors
- [ ] Lighthouse score ≥90 on all pages
- [ ] Keyboard navigation works on all pages
- [ ] Dark mode colors correct on all pages
- [ ] Mobile responsive (320px, 375px, 768px, 1024px+)
- [ ] WCAG AA accessibility on all pages
- [ ] All tests pass
- [ ] Code committed and pushed

---

## Success Criteria

Phase 6 is complete when:
1. ✅ All secondary pages have error/empty/loading states
2. ✅ All pages have dark mode verification (0 contrast issues)
3. ✅ All pages pass WCAG AA accessibility checks
4. ✅ All pages responsive on 5+ viewports
5. ✅ All pages tested with keyboard navigation
6. ✅ All pages tested with screen readers
7. ✅ Queue, Convoys, Workflows pages enhanced
8. ✅ Health, Activity, Watchdog pages have loading states
9. ✅ Zero TypeScript errors
10. ✅ Zero regressions from Phase 5
11. ✅ All tests passing
12. ✅ Changes committed and pushed

---

## Timeline Estimate

- State management implementation: 3 hours
- Dark mode verification: 1.5 hours
- WCAG AA verification: 1.5 hours
- Responsive design verification: 1 hour
- Page-specific enhancements: 2 hours
- Testing & fixes: 1.5 hours
- Documentation: 1 hour

**Total: 12 hours**

---

## Next Steps (Phase 7)

After Phase 6 completion:
- **Phase 7**: Performance Optimization & Advanced Features
  - Bundle optimization
  - Code splitting
  - Lazy loading
  - Advanced animations
  - User preferences persistence

---

*Phase 6 Planning Document - January 10, 2026*
