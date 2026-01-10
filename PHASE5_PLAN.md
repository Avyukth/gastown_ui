# Phase 5: Form & Content Pages Enhancement

**Status**: Planning  
**Target Completion**: January 10-11, 2026  
**Focus**: Work page form optimization, issue type selection improvements, agent detail page enhancements

---

## Overview

Phase 5 enhances the form-heavy pages (Work, Agent Detail) with improved layouts, better visual feedback, and streamlined user interactions. Building on Phase 4's dashboard improvements, this phase optimizes content pages for clarity and usability.

---

## 5.1 Work Page Form Optimization

**Priority**: High  
**Current Status**: Analyzed - forms work but need layout improvements

### Current State

The work page (`src/routes/work/+page.svelte`) has three forms:
1. **Create Issue** - Simple form with title, type selector, priority dropdown
2. **Create Convoy** - Form with name input and issue multi-select
3. **Sling Work** - Form with issue and rig dropdowns

**Current Issues**:
- Forms span full width (excessive on desktop)
- No visual grouping or hierarchy
- Required field indicators present but not prominent
- Section headers lack consistent styling

### Objectives

1. Optimize form container width and centering
2. Improve form section spacing and hierarchy
3. Enhance required field indicators
4. Improve dropdown styling with icons
5. Better visual feedback for form states

### Proposed Enhancements

#### 5.1.1 Form Container Width
```css
/* Optimize form width for readability */
section {
  max-width: 640px;  /* 640px optimal for forms */
  margin-left: auto;
  margin-right: auto;
}
```

**Rationale**: 640px is optimal line length for form readability (60-80 chars)
**Impact**: Better visual hierarchy and easier scanning

#### 5.1.2 Form Section Spacing
```
Current:  space-y-3 (12px gaps)
Proposed: space-y-4 (16px gaps) for sections
          space-y-2 (8px gaps) within sections
```

**Changes**:
- Increase spacing between form sections (Create Issue, Create Convoy, Sling Work)
- Maintain tighter spacing within individual forms
- Add 24px margin between sections

#### 5.1.3 Required Field Indicators
```svelte
<!-- Current -->
<span class="text-destructive">*</span>

<!-- Proposed - more prominent -->
<span class="text-destructive font-semibold">*</span>
<span class="text-xs text-muted-foreground ml-2">(required)</span>
```

**Changes**:
- Make asterisks bolder (font-semibold)
- Add optional "(required)" text in muted gray
- Update label styling for consistency

#### 5.1.4 Dropdown Enhancement
```svelte
<!-- Current -->
<select class="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg">
  <option>Select...</option>
</select>
<ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" />

<!-- Proposed - better visual distinction -->
<select class="w-full px-3 py-2 bg-input border border-border rounded-lg
               focus:ring-2 focus:ring-ring focus:border-ring
               appearance-none pr-10">
  <option>Select...</option>
</select>
```

**Changes**:
- Use `bg-input` instead of `bg-muted/50` for better distinction from text inputs
- Improve focus state with ring and border color change
- Ensure proper touch target size (44px+ height on mobile)

### Implementation Steps

1. Update form section max-width to 640px
2. Refactor spacing: space-y-4 between sections, space-y-2 within
3. Update required field indicators with font-semibold and optional text
4. Enhance dropdown styling with focus states
5. Test form layout on all viewports

### Acceptance Criteria

- [ ] Form sections max-width 640px centered
- [ ] 24px spacing between sections (Create Issue, Create Convoy, Sling Work)
- [ ] 16px spacing between form groups within sections
- [ ] Required field indicators bold with optional text
- [ ] Dropdowns have clear focus state
- [ ] Dropdowns have 44px+ touch targets
- [ ] Forms responsive at 320px, 375px, 768px viewports
- [ ] No horizontal scroll at any viewport
- [ ] Dark mode colors correct
- [ ] No TypeScript errors

---

## 5.2 Issue Type Selection Enhancement

**Priority**: High  
**Current Status**: Analyzed - component exists and works well

### Current State

The `IssueTypeSelector` component (`src/lib/components/IssueTypeSelector.svelte`) is well-designed with:
- Radio button group with icons
- Descriptions for each type
- Hover states with background color
- Selected state with left border

**Current Strengths**:
- ✅ Hover feedback (background-color)
- ✅ Selected state with 3px left border
- ✅ Icons color-coded by type
- ✅ Descriptions present
- ✅ Card-grouped with subtle border

**Areas for Enhancement**:
- Icon colors could be more distinct
- Selected state could have slightly more emphasis
- Mobile touch targets could be larger

### Objectives

1. Enhance visual distinction between types
2. Improve icon color coding
3. Better selected state emphasis
4. Optimize mobile touch targets

### Proposed Enhancements

#### 5.2.1 Icon Color Coding
```typescript
const issueTypeColors = {
  task: 'text-blue-500',      // Task = blue (work)
  bug: 'text-red-500',        // Bug = red (error)
  feature: 'text-green-500',  // Feature = green (new/growth)
  epic: 'text-purple-500'     // Epic = purple (large/important)
};
```

**Changes**:
- Update icon styles to use type-specific colors
- Apply colors to both regular and selected states
- Ensure colors meet 4.5:1 contrast ratio

#### 5.2.2 Enhanced Selected State
```css
/* Current */
.itemSelected {
  background-color: #F3F4F6;  /* muted/30 */
  border-left: 3px #F97316;   /* primary orange */
}

/* Proposed */
.itemSelected {
  background-color: #FFF7ED;  /* primary/5 - light orange tint */
  border-left: 4px #F97316;   /* slightly thicker */
  box-shadow: inset 0 0 0 1px #FECACA;  /* subtle inner glow */
}
```

**Changes**:
- Change background to light orange tint
- Increase left border thickness to 4px
- Add subtle inner shadow for depth

#### 5.2.3 Mobile Touch Targets
```css
/* Current padding: p-3 (12px) = ~48px height */
/* Proposed: Ensure minimum 56px on mobile */

@media (max-width: 768px) {
  .item {
    padding: 16px 12px;  /* 56px+ total height */
    gap: 12px;  /* Increased from 12px to improve touch */
  }
}
```

**Changes**:
- Increase padding on mobile to 16px vertical
- Ensure gap between icon and text is 12px
- Total touch target: 56px+ (exceeds 44px requirement)

### Implementation Steps

1. Add icon color mapping by issue type
2. Update selected state styling with orange tint and border
3. Enhance mobile padding for touch targets
4. Test color contrast compliance (4.5:1+)
5. Verify dark mode colors

### Acceptance Criteria

- [ ] Icons have type-specific colors (blue/red/green/purple)
- [ ] Icon colors meet 4.5:1 contrast ratio
- [ ] Selected state has light orange background
- [ ] Selected state left border is 4px
- [ ] Selected state has subtle visual emphasis
- [ ] Mobile touch targets 56px+ height
- [ ] Hover state smooth transition (200ms)
- [ ] Dark mode colors correct
- [ ] Accessibility labels present
- [ ] No TypeScript errors

---

## 5.3 Agent Detail Page Enhancement

**Priority**: Medium  
**Current Status**: Not yet implemented (navigation ready)

### Current State

The agents list page (`src/routes/agents/+page.svelte`) has a handler to navigate to `/agents/{id}`:
```typescript
function handleInspect(agentId: string) {
  goto(`/agents/${agentId}`);
}
```

However, the agent detail page doesn't exist yet.

### Objectives

1. Create agent detail page layout
2. Display comprehensive agent information
3. Add agent action controls (inspect, reboot, logs)
4. Show agent metrics and history
5. Provide navigation back to agents list

### Proposed Structure

#### 5.3.1 Detail Page Layout
```
┌─────────────────────────────────────────┐
│ Header (Back + Title)                   │
├─────────────────────────────────────────┤
│ Agent Hero Card                         │
│ - Large icon/avatar                     │
│ - Status badge                          │
│ - Role badge                            │
├─────────────────────────────────────────┤
│ Quick Stats (Grid)                      │
│ - Uptime, Efficiency, Last Seen, Errors│
├─────────────────────────────────────────┤
│ Details Section                         │
│ - Name, Role, Status                    │
│ - Task description                      │
│ - Metadata                              │
├─────────────────────────────────────────┤
│ Actions (Buttons)                       │
│ - Inspect, Reboot, View Logs            │
├─────────────────────────────────────────┤
│ Metrics/History (if available)          │
│ - Performance graph                     │
│ - Event log                             │
└─────────────────────────────────────────┘
```

#### 5.3.2 Hero Card Component
```svelte
<!-- Large agent display with status -->
<div class="agent-hero">
  <div class="agent-icon">
    <!-- Status icon with color coding -->
  </div>
  <div class="agent-info">
    <h1>{agent.name}</h1>
    <p class="role">{agent.role}</p>
    <p class="status">{agent.status}</p>
  </div>
</div>
```

#### 5.3.3 Quick Stats Grid
```svelte
<!-- 2x2 or 3x2 grid of key metrics -->
<div class="stats-grid">
  <div class="stat"><span class="label">Uptime</span><span class="value">{uptime}</span></div>
  <div class="stat"><span class="label">Efficiency</span><span class="value">{efficiency}%</span></div>
  <div class="stat"><span class="label">Last Seen</span><span class="value">{lastSeen}</span></div>
  <div class="stat"><span class="label">Errors</span><span class="value">{errors}</span></div>
</div>
```

#### 5.3.4 Action Buttons
```svelte
<!-- Primary actions at bottom -->
<div class="actions">
  <button primary>Inspect Agent</button>
  <button secondary>View Logs</button>
  <button danger>Reboot</button>
</div>
```

### Implementation Steps

1. Create `src/routes/agents/[id]/+page.svelte`
2. Create `src/routes/agents/[id]/+page.server.ts` for data fetching
3. Create agent detail layout component
4. Add hero card section
5. Add quick stats grid
6. Add action buttons with handlers
7. Add error and loading states
8. Add back navigation

### Acceptance Criteria

- [ ] Page loads agent data by ID
- [ ] Hero card displays agent info prominently
- [ ] Quick stats grid shows key metrics
- [ ] Action buttons present (Inspect, Reboot, Logs)
- [ ] Back button navigates to agents list
- [ ] Error state shows if agent not found
- [ ] Loading state with skeleton cards
- [ ] Responsive on all viewports
- [ ] Dark mode fully supported
- [ ] Keyboard navigation works
- [ ] No TypeScript errors

---

## Task Breakdown

### Design Tasks (No code changes)
- [ ] **gt-mol-2a1**: Design - Work Form Layout (verify spacing and width)
- [ ] **gt-mol-2a2**: Design - Issue Type Selection (verify icon colors)
- [ ] **gt-mol-2a3**: Design - Agent Detail Page (verify layout structure)

### Implementation Tasks
- [ ] **gt-mol-2a1-impl**: Implement - Work Form Layout (max-width, spacing, required indicators)
- [ ] **gt-mol-2a2-impl**: Implement - Issue Type Selection (icon colors, selected state)
- [ ] **gt-mol-2a3-impl**: Implement - Agent Detail Page (create page, layout, components)

### Testing Tasks
- [ ] **gt-mol-2a1-test**: Test - Work Form Layout (responsiveness, spacing, validation)
- [ ] **gt-mol-2a2-test**: Test - Issue Type Selection (visual, colors, contrast)
- [ ] **gt-mol-2a3-test**: Test - Agent Detail Page (navigation, loading, errors)

---

## Implementation Notes

### File Structure

```
src/routes/
├── work/
│   ├── +page.svelte          (Update: form layout)
│   └── +page.server.ts
├── agents/
│   ├── +page.svelte          (No changes)
│   ├── +page.server.ts
│   └── [id]/
│       ├── +page.svelte      (New: detail page)
│       └── +page.server.ts   (New: data fetching)

src/lib/components/
├── IssueTypeSelector.svelte   (Update: icon colors, selected state)
└── AgentDetailHero.svelte     (New: hero card component)
```

### Key Components to Create/Update

1. **IssueTypeSelector.svelte** - Update icon colors and selected state
2. **AgentDetailHero.svelte** - New hero card for agent display
3. **Work Page** - Update form layout and spacing
4. **Agent Detail Page** - New page for agent information

### CSS Utilities

```css
/* Form containers */
.form-section {
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
  padding: 24px;
}

/* Form spacing */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 16px; /* space-y-4 */
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px; /* space-y-2 */
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: var(--muted);
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--foreground);
}
```

---

## Dependencies

All required dependencies already installed:
- `lucide-svelte` (icons)
- `zod` (form validation)
- `tailwind-css` (styling)
- No new dependencies needed

---

## Quality Gates

Before marking Phase 5 complete:

- [ ] Zero TypeScript errors
- [ ] All builds succeed
- [ ] No console errors
- [ ] Lighthouse score ≥90 on all pages
- [ ] Keyboard navigation works
- [ ] Dark mode colors correct
- [ ] Mobile responsive (320px, 375px, 768px, 1024px+)
- [ ] WCAG AA accessibility
- [ ] All tests pass
- [ ] Code committed and pushed

---

## Success Criteria

Phase 5 is complete when:
1. ✅ Work page forms have 640px max-width with centered layout
2. ✅ Form sections have proper spacing (24px between, 16px within)
3. ✅ Required field indicators are prominent and clear
4. ✅ Issue type selector has type-specific icon colors
5. ✅ Selected state in issue selector has visual emphasis
6. ✅ Agent detail page exists and shows comprehensive info
7. ✅ Agent detail page has hero card, stats grid, and actions
8. ✅ All changes are responsive on mobile/tablet/desktop
9. ✅ Dark mode fully supported
10. ✅ Zero TypeScript errors
11. ✅ Zero regressions from Phase 4
12. ✅ All tests passing
13. ✅ Changes committed and pushed

---

## Timeline Estimate

- Design review: 0.5 hours
- Work form implementation: 1 hour
- Issue type selector: 0.5 hours
- Agent detail page: 2 hours
- Testing & fixes: 1.5 hours
- Documentation: 0.5 hours

**Total: 6 hours**

---

## Next Steps (Phase 6)

After Phase 5 completion:
- **Phase 6**: Advanced Features & Polish
  - Animation enhancements
  - Advanced filtering on pages
  - Performance optimizations
  - User feedback integration

---

*Phase 5 Planning Document - January 10, 2026*
