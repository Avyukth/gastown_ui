# Design: Mobile Horizontal Stats Scroll

**Issue:** gt-mol-rij
**Author:** furiosa (polecat)
**Date:** 2026-01-08

## Problem Statement

On mobile viewports, the stats cards are displayed in a 2-column grid (`grid-cols-2`). This layout:
- Cramps the rich content (label, value, trend, sparkline)
- Makes it hard to read values at a glance
- Doesn't feel native to mobile UX patterns

## Proposed Solution

Convert the stats section to a horizontally scrollable strip on mobile, with snap points for each card.

## Current Implementation

**DashboardLayout.svelte:123**
```svelte
<div class="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-1 gap-4">
  {@render stats()}
</div>
```

**StatsCard.svelte** - Desktop-optimized cards with hover effects, no mobile-specific sizing.

## Target Implementation

### DashboardLayout Changes

Replace the stats container classes:

```svelte
<div class="
  flex gap-4 overflow-x-auto snap-x snap-mandatory
  pb-2 -mx-4 px-4 scrollbar-none
  xl:grid xl:grid-cols-1 xl:overflow-visible xl:snap-none xl:mx-0 xl:px-0
">
  {@render stats()}
</div>
```

| Class | Purpose |
|-------|---------|
| `flex` | Horizontal layout |
| `gap-4` | Consistent spacing |
| `overflow-x-auto` | Enable horizontal scroll |
| `snap-x snap-mandatory` | Scroll snapping |
| `pb-2` | Space for any overflow indicators |
| `-mx-4 px-4` | Full-bleed scroll to container edges |
| `scrollbar-none` | Hide scrollbar (matches SwipeableTabs) |
| `xl:grid xl:grid-cols-1` | Desktop: vertical stack |
| `xl:overflow-visible xl:snap-none` | Desktop: no scroll |
| `xl:mx-0 xl:px-0` | Desktop: reset margins |

### StatsCard Changes

Add mobile-specific sizing:

```svelte
<!-- In container class -->
'min-w-[280px] flex-shrink-0 snap-center',
'xl:min-w-0 xl:flex-shrink xl:snap-align-none'
```

| Class | Purpose |
|-------|---------|
| `min-w-[280px]` | Fixed card width for readability |
| `flex-shrink-0` | Prevent shrinking in flex container |
| `snap-center` | Snap to card center |
| `xl:min-w-0` | Desktop: auto width |
| `xl:flex-shrink` | Desktop: allow shrinking |

## Visual Behavior

```
Mobile (< xl):
┌─────────────────────────────────┐
│  [Stats 1] [Stats 2] [Stats 3] │→ scroll
└─────────────────────────────────┘
     ← swipe to reveal more →

Desktop (xl+):
┌─────────────┐
│ [Stats 1]   │
├─────────────┤
│ [Stats 2]   │
├─────────────┤
│ [Stats 3]   │
└─────────────┘
```

## Edge Cases

1. **1-2 cards**: Display without scroll (cards won't fill width)
2. **Momentum scroll**: Native browser behavior
3. **Keyboard nav**: Tab focuses each card, arrow keys scroll container
4. **RTL**: `snap-x` works natively with RTL
5. **Hover effects**: Removed on mobile via `hover:` prefix (touch-only)

## Accessibility

- Cards remain focusable and tabbable
- Container scrollable via keyboard (arrow keys when focused)
- Screen readers announce card content normally
- No ARIA changes needed (native scroll semantics)

## Testing Checklist

- [ ] Touch scroll works smoothly
- [ ] Cards snap to boundaries
- [ ] Works with varying card counts (1, 2, 3, 4+)
- [ ] Desktop layout unchanged
- [ ] Keyboard navigation works
- [ ] No horizontal scrollbar visible
- [ ] Content readable at 280px width

## Files to Modify

1. `src/lib/components/DashboardLayout.svelte` - Stats container classes
2. `src/lib/components/StatsCard.svelte` - Add mobile sizing variant

## Alternative Considered

**MobileStatsCarousel component**: Dedicated wrapper for mobile stats. Rejected because:
- Adds component complexity
- DashboardLayout already handles responsive layout
- CSS-only solution is simpler and follows existing patterns (SwipeableTabs)

## Decision

Proceed with CSS-only approach in DashboardLayout + StatsCard modifications.
