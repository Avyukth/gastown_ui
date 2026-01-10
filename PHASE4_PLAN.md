# Phase 4: Dashboard & Cards Enhancement

**Status**: Planning  
**Target Completion**: January 10, 2026  
**Focus**: Agent cards, workflow progress visualization, system stats improvement

---

## Overview

Phase 4 enhances the Dashboard page with improved visual design for agent cards, workflow status indicators, and system statistics. Building on Phase 3's design system work, this phase implements the component-level improvements outlined in IMPROVEMENT.md sections 2.1-2.3.

---

## 4.1 Agent Card Redesign

**Priority**: High  
**Current Status**: Implemented (review for enhancements)

### Objectives
1. Improve visual hierarchy with clearer primary/secondary information
2. Add role-specific visual indicators
3. Implement proper status indicators with animations
4. Enhance hover state with elevation

### Current Implementation Analysis

**File**: `src/lib/components/AgentCard.svelte`

The AgentCard component currently displays:
- Agent name
- Task description
- Status badge
- Progress indicator
- Meta information

### Proposed Enhancements

#### 1.1 Visual Hierarchy
```
Current:     All text appears equally weighted
Desired:     
  - Agent name: 16px semi-bold (primary)
  - Role: 12px muted (secondary, with icon)
  - Task: 14px regular (secondary)
  - Status: 12px + badge (tertiary)
```

#### 1.2 Role-Specific Left Border
Add 4px left border with role-based colors:
- Coordinator (Mayor): Blue (#3B82F6)
- Health-check (Health): Green (#22C55E)
- Witness: Purple (#8B5CF6)
- Refinery: Orange (#F97316)
- Crew: Gray (#6B7280)

#### 1.3 Status Indicator Animation
```svelte
{#if status === 'running'}
  <span class="relative inline-block w-2 h-2 bg-success rounded-full animate-pulse" />
{:else if status === 'idle'}
  <span class="w-2 h-2 bg-muted rounded-full" />
{/if}
```

#### 1.4 Hover State Enhancement
- Subtle elevation increase: `hover:shadow-md`
- Background color change: `hover:bg-muted/40`
- Smooth transition: `transition-all duration-200`

### Implementation Steps

1. **Identify role from agent metadata**
   - Extract role from `agent.meta.role` or name patterns
   - Map role to color code

2. **Update AgentCard component**
   - Add left border with role color
   - Enhance visual hierarchy with typography adjustments
   - Add status pulse animation
   - Improve hover state

3. **Test across viewports**
   - Desktop (1024px): Cards display in grid
   - Tablet (768px): Cards display in 2 columns
   - Mobile (375px): Cards stack single column

### Acceptance Criteria
- [ ] Agent name is primary text (16px semi-bold)
- [ ] Role displayed with icon (12px muted)
- [ ] Left border color matches role
- [ ] Running agents show pulse animation
- [ ] Idle agents show static gray dot
- [ ] Hover state shows elevation increase
- [ ] Cards don't overflow on any viewport
- [ ] Animation respects prefers-reduced-motion
- [ ] No TypeScript errors
- [ ] Dark mode verified

---

## 4.2 Workflow Progress Visualization

**Priority**: High  
**Current Status**: Partially implemented (CircularProgress exists)

### Objectives
1. Display circular progress indicator for running workflows
2. Show distinct status badges for pending/completed
3. Add hover tooltip with workflow details
4. Make workflow items clickable

### Current Implementation

The dashboard already uses `CircularProgress` component for workflows:
```svelte
<CircularProgress 
  progress={workflow.progress}
  diameter={24}
  status={workflow.status}
  icon={workflow.status === 'pending' ? Clock : workflow.status === 'completed' ? CheckCircle : undefined}
/>
```

### Proposed Enhancements

#### 2.1 Circular Progress Ring
- Size: 32px diameter (currently 24px)
- Colors:
  - Running: Brand orange (#F97316)
  - Completed: Success green (#22C55E)
  - Pending: Warning amber (#F59E0B)
- Stroke width: 3px

#### 2.2 Status Icons
- Pending: Clock icon with yellow dot
- Running: Spinner animation (animated)
- Completed: Checkmark icon with green dot

#### 2.3 Hover Tooltip
```svelte
<Tooltip>
  <TooltipTrigger>{workflow.name}</TooltipTrigger>
  <TooltipContent>
    <div class="space-y-1">
      <p class="font-semibold">{workflow.name}</p>
      <p class="text-sm">Progress: {workflow.progress}%</p>
      <p class="text-sm">Status: {workflow.status}</p>
    </div>
  </TooltipContent>
</Tooltip>
```

#### 2.4 Click Handler
```svelte
<div onclick={() => goto(`/workflows/${workflow.id}`)}>
  {/* content */}
</div>
```

### Implementation Steps

1. **Enhance CircularProgress component**
   - Increase size to 32px
   - Add animated spinner for running state
   - Update color mapping

2. **Add workflow tooltips**
   - Display on hover (desktop) or tap (mobile)
   - Show progress percentage and status

3. **Add navigation**
   - Workflows become clickable
   - Navigate to workflow detail page
   - Show cursor change on hover

4. **Test animations**
   - Verify spinner rotates smoothly
   - Verify pulse animation is visible
   - Verify animations stop on reduced motion

### Acceptance Criteria
- [ ] Circular progress rings are 32px diameter
- [ ] Progress ring uses correct colors (orange/green/amber)
- [ ] Pending workflows show clock icon
- [ ] Running workflows show animated spinner
- [ ] Completed workflows show checkmark
- [ ] Hover tooltip displays workflow details
- [ ] Click navigates to workflow detail
- [ ] Animations respect prefers-reduced-motion
- [ ] Mobile touch targets are 44px+
- [ ] No TypeScript errors
- [ ] Dark mode verified

---

## 4.3 System Stats Cards Improvement

**Priority**: Medium  
**Current Status**: Implemented (StatsCard exists)

### Objectives
1. Enhance visual design of stats cards
2. Add sparkline graphs for 7-day trends
3. Improve percentage change display
4. Make cards clickable

### Current Implementation

StatsCard displays:
- Label
- Value (large number)
- Icon
- Trend indicator
- Trend value
- Comparison text
- Sparkline data (array of 7 values)

### Proposed Enhancements

#### 3.1 Card Layout
```
┌─────────────────────┐
│ Label         Icon  │
│ Value         ▲12%  │  <- Icon before value for RTL support
│ 7-day trend graph   │
│ vs. yesterday       │
└─────────────────────┘
```

#### 3.2 Icon Display
- Position: Top right
- Size: 24px
- Color: Matches stat type (orange for active, green for success, etc.)

#### 3.3 Sparkline Graph
- Width: 100% of card minus padding
- Height: 32px
- Colors:
  - Up trend: Green (#22C55E)
  - Down trend: Red (#EF4444)
  - Neutral: Gray (#6B7280)
- Points rendered as small circles

#### 3.4 Percentage Change
```
Up trend:    ▲ +12% from yesterday
Down trend:  ▼ -3% from yesterday
Neutral:     → no change from yesterday
```

#### 3.5 Clickable Cards
```svelte
<div onclick={() => goto(getDetailRoute(label))}>
  {/* card content */}
</div>
```

### Implementation Steps

1. **Review StatsCard component**
   - Check current sparkline implementation
   - Verify layout matches design

2. **Enhance sparkline rendering**
   - Ensure proper scaling
   - Add color based on trend
   - Smooth curve rendering

3. **Add card click handlers**
   - Active Agents → /agents
   - Tasks Running → /work
   - Polecats → /queue
   - Completed Today → /activity

4. **Test responsiveness**
   - Desktop: 4 cards in row
   - Tablet: 2 cards per row
   - Mobile: 1 card per row

### Acceptance Criteria
- [ ] Card layout is clean and organized
- [ ] Icon is visible and properly sized
- [ ] Value is prominently displayed
- [ ] Sparkline graph is visible and colored correctly
- [ ] Trend percentage is clear (↑ or ↓)
- [ ] Comparison text is visible
- [ ] Cards are clickable with hover state
- [ ] Cards responsive on all viewports
- [ ] No TypeScript errors
- [ ] Dark mode verified

---

## Task Breakdown

### Design Tasks (No code changes, design verification)
- [ ] **gt-mol-1c1**: Design - Agent Card Visual Hierarchy (verify role colors)
- [ ] **gt-mol-1c2**: Design - Workflow Progress Visualization (verify icon/status)
- [ ] **gt-mol-1c3**: Design - System Stats Cards (verify sparkline rendering)

### Implementation Tasks
- [ ] **gt-mol-1c1-impl**: Implement - Agent Card Enhancements (left border, colors)
- [ ] **gt-mol-1c2-impl**: Implement - Workflow Progress (circular progress, tooltip, click)
- [ ] **gt-mol-1c3-impl**: Implement - Stats Card Enhancement (sparkline colors, click)

### Testing Tasks
- [ ] **gt-mol-1c1-test**: Test - Agent Card Enhancements (visual, animation, responsive)
- [ ] **gt-mol-1c2-test**: Test - Workflow Progress (rendering, animation, interaction)
- [ ] **gt-mol-1c3-test**: Test - Stats Cards (layout, colors, click navigation)

---

## Implementation Notes

### Agent Card Enhancements

**File**: `src/lib/components/AgentCard.svelte`

**Role Color Mapping**:
```typescript
const roleColors: Record<string, string> = {
  'coordinator': 'border-blue-500',      // Mayor
  'health': 'border-green-500',          // Health monitor
  'witness': 'border-purple-500',        // Witness
  'refinery': 'border-orange-500',       // Refinery
  'crew': 'border-gray-500',             // Crew member
  'default': 'border-muted'
};
```

**Status Animation**:
```svelte
{#if status === 'running'}
  <div class="w-2 h-2 bg-success rounded-full animate-pulse" />
{:else}
  <div class="w-2 h-2 bg-muted rounded-full" />
{/if}
```

### Workflow Progress

**File**: `src/routes/+page.svelte` (dashboard)

**Click Navigation**:
```svelte
<div onclick={() => goto(`/workflows/${workflow.id}`)}>
```

### Stats Card

**File**: `src/lib/components/StatsCard.svelte`

**Sparkline Rendering** (already exists, may need color enhancement):
```svelte
<svg class="w-full h-8 mt-2">
  {/* sparkline rendering */}
</svg>
```

---

## Dependencies

All required dependencies are already installed:
- `lucide-svelte` (icons)
- `svelte` (animations)
- No new dependencies needed

---

## Quality Gates

Before marking Phase 4 complete:

- [ ] Zero TypeScript errors
- [ ] All builds succeed
- [ ] No console errors
- [ ] Lighthouse score ≥90 on dashboard
- [ ] Keyboard navigation works
- [ ] Dark mode colors correct
- [ ] Mobile responsive (320px, 375px, 768px, 1024px+)
- [ ] All tests pass
- [ ] Code committed and pushed

---

## Next Steps (Phase 5)

After Phase 4 completion:
- **Phase 5**: Form & Content Pages
  - Work page form optimization
  - Issue type selection improvements
  - Agent detail page enhancements

---

## Timeline Estimate

- Design review: 1 hour
- Agent Card implementation: 1.5 hours
- Workflow Progress: 1 hour
- Stats Card enhancement: 1 hour
- Testing & fixes: 1.5 hours
- Documentation: 1 hour

**Total: 7 hours**

---

## Success Criteria

Phase 4 is complete when:
1. ✅ Agent cards show role-based left border colors
2. ✅ Agent cards have enhanced visual hierarchy
3. ✅ Workflow progress indicators are properly styled
4. ✅ Workflow items are clickable with tooltip
5. ✅ Stats cards display sparklines with correct colors
6. ✅ Stats cards are clickable
7. ✅ All changes responsive on mobile/tablet/desktop
8. ✅ Dark mode fully supported
9. ✅ Zero TypeScript errors
10. ✅ Zero regressions
11. ✅ All tests passing
12. ✅ Changes committed and pushed
