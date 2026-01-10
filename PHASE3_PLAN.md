# Phase 3: Design System Overhaul

**Status**: Starting  
**Target Completion**: January 9-10, 2026  
**Focus**: Global design consistency across icons, typography, and colors

---

## Overview

Phase 3 continues from Phase 2's mobile/desktop UX work and focuses on establishing a cohesive design system. This phase ensures visual consistency, improves information hierarchy, and enhances the overall aesthetic of Gas Town UI.

---

## 3.1 Icon System Consistency

**Priority**: High  
**Status**: Planning

### Changes Required

| Location | Current Icon | Recommended | Issue | Status |
|----------|--------------|-------------|-------|--------|
| GlobalSearch.svelte, Work route | `Target` | `Briefcase` | Inconsistent with +layout.svelte | NEEDS FIX |
| +layout.svelte, Work | `Briefcase` | `Briefcase` | ✅ Correct | OK |
| +layout.svelte, Workflows | `GitBranch` | `GitBranch` | ✅ Process flow icon | OK |
| +layout.svelte, Rigs | `Server` | `Server` | ✅ Project containers | OK |
| +layout.svelte, Dogs | `Shield` | `Shield` | ✅ Security theme | OK |

### Implementation Steps

1. **Update GlobalSearch.svelte**: Change Work icon from `Target` to `Briefcase`
2. **Verify all icon sizes**: 20px with 2px stroke weight (currently ~18-20px)
3. **Test icon consistency**: Verify across all pages (dashboard, agents, mail, etc.)
4. **Dark mode verification**: Ensure icons are visible in both light/dark modes

### Acceptance Criteria

- [ ] All navigation icons use `Briefcase` for Work (consistency)
- [ ] All sidebar icons are 20px size with 2px stroke
- [ ] Active state uses primary color (#F97316)
- [ ] Inactive state uses muted gray
- [ ] Hover transitions are smooth (200ms)
- [ ] All icons have proper aria-labels
- [ ] No TypeScript errors
- [ ] Zero regressions

---

## 3.2 Page Title Standardization

**Priority**: Medium  
**Status**: Planning

### Current Issues

- Inconsistent title casing: "GASTOWN", "Mail Inbox", "WORKFLOWS"
- Some pages lack subtitles or descriptions
- Title sizing varies across pages

### Implementation Steps

1. **Audit all page titles**: Mail, Agents, Work, Dashboard, etc.
2. **Apply Title Case**: "Mail Inbox", "Work Items", "Agent Dashboard"
3. **Standardize font sizes**: 
   - Desktop: 24px semi-bold
   - Mobile: 20px semi-bold
4. **Add subtitles where missing**: Message counts, status indicators
5. **Verify responsive behavior**: Titles don't wrap on narrow screens

### Acceptance Criteria

- [ ] All page titles use Title Case
- [ ] Desktop titles are 24px, mobile titles are 20px
- [ ] All pages have descriptive subtitle/helper text
- [ ] Subtitles are muted gray (text-muted-foreground)
- [ ] No horizontal overflow on any viewport
- [ ] Consistent left alignment across all pages
- [ ] Zero TypeScript errors

---

## 3.3 Color System Enhancement

**Priority**: Medium  
**Status**: Planning

### Current Issues

- CTA buttons appear washed out (using lighter orange variants)
- Unread indicators too subtle
- Status colors not consistently applied
- Background patterns distract from content

### Implementation Steps

1. **Primary CTA Buttons**: 
   - Update all primary buttons to use #F97316 (full orange)
   - Verify hover states darken 10%
   - Verify active states darken 15%
   
2. **Unread Indicators**:
   - Use bold 8px blue dot (current: okay)
   - Ensure semi-bold text weight for unread
   - Test visibility in dark mode

3. **Status Colors**:
   - Success: #22C55E (green)
   - Warning: #F59E0B (amber)
   - Error: #EF4444 (red)
   - Info: #3B82F6 (blue)
   
4. **Background Patterns**:
   - Reduce GridPattern opacity to <5%
   - Or remove entirely on content-heavy pages

### Acceptance Criteria

- [ ] Primary buttons use #F97316 background
- [ ] Hover states are 10% darker (tested visually)
- [ ] Active states are 15% darker (tested visually)
- [ ] Unread indicators use bold dot + semi-bold text
- [ ] Status colors are consistently applied across all pages
- [ ] GridPattern opacity is <5% or removed
- [ ] High contrast in dark mode (4.5:1 minimum)
- [ ] Zero TypeScript errors

---

## Task Breakdown

### Design Tasks (No code changes, verification only)

- [ ] **gt-mol-1b1-design**: Design - Icon System Consistency (verify icons match spec)
- [ ] **gt-mol-1b2-design**: Design - Page Title Standardization (audit current titles)
- [ ] **gt-mol-1b3-design**: Design - Color System Enhancement (verify color usage)

### Implementation Tasks

- [ ] **gt-mol-1b1-impl**: Implement - Icon System Consistency (GlobalSearch.svelte)
- [ ] **gt-mol-1b2-impl**: Implement - Page Title Standardization (all pages)
- [ ] **gt-mol-1b3-impl**: Implement - Color System Enhancement (buttons, status colors)

### Testing Tasks

- [ ] **gt-mol-1b1-test**: Test - Icon System Consistency
- [ ] **gt-mol-1b2-test**: Test - Page Title Standardization
- [ ] **gt-mol-1b3-test**: Test - Color System Enhancement

---

## Implementation Notes

### Icon System (GlobalSearch.svelte)

**File**: `src/lib/components/GlobalSearch.svelte` line 89

Change:
```typescript
{ path: '/work', label: 'Work', icon: Target },
```

To:
```typescript
{ path: '/work', label: 'Work', icon: Briefcase },
```

**Verification**:
- GlobalSearch component renders correctly
- Icon appears in command palette
- Dark mode visibility is maintained

### Page Titles

**Files to audit/update**:
- `src/routes/+layout.svelte` (Announcer messages)
- `src/routes/mail/+page.svelte` (Mail Inbox header)
- `src/routes/agents/+page.svelte` (Agents title)
- `src/routes/work/+page.svelte` (Work Items/Issues title)
- Other page headers

**Pattern to follow**:
```svelte
<h1 class="text-2xl md:text-2xl font-semibold">Page Title</h1>
<p class="text-sm text-muted-foreground">Descriptive subtitle</p>
```

### Color System

**Files to update**:
- Component CSS classes
- Tailwind theme configuration (if needed)
- Inline styles for dynamic colors

**Testing approach**:
1. Visual regression testing
2. Dark mode verification
3. Contrast ratio checking (4.5:1 minimum for WCAG AA)

---

## Dependencies

All required dependencies are already installed:
- `lucide-svelte` (for icons)
- `tailwind-variants` (for styling)
- `@tailwindcss/forms` (for form elements)

No new dependencies needed.

---

## Quality Gates

Before marking Phase 3 complete:

- [ ] Zero TypeScript errors
- [ ] All builds succeed
- [ ] No console errors in browser DevTools
- [ ] Lighthouse score ≥90 on all pages
- [ ] Keyboard navigation works on all pages
- [ ] Dark mode contrast passes WCAG AA
- [ ] Mobile responsive at 320px, 375px, 768px, 1024px+
- [ ] All tests pass
- [ ] Code committed and pushed to main

---

## Next Steps (Phase 4)

After Phase 3 completion:
- **Phase 4**: Dashboard & Cards Enhancement
  - Agent card redesign with visual hierarchy
  - Workflow progress visualization
  - System stats card improvements
  
- **Phase 5**: Form & Content Pages
  - Work page form optimization
  - Issue type selection improvements
  - Agent detail page enhancements

---

## Team Notes

- Phase 2 completion saves significant time by already having proper mobile/desktop layouts
- Many features (BottomNav, Mail Split-View, Loading States) were pre-built and only needed verification
- Continue maintaining zero TypeScript error count
- Follow established patterns for mobile-first design and accessibility
- All changes should be backwards compatible
