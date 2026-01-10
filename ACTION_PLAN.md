# Code Health Action Plan
## Gas Town UI - SvelteKit/TypeScript Frontend

**Created:** 2026-01-10
**Target:** Complete P0-P2 items for production readiness

---

## Priority Summary

| Priority | Items | Status |
|----------|-------|--------|
| P0 - Critical | 2 | Pending |
| P1 - High | 4 | Pending |
| P2 - Medium | 3 | Pending |

---

## P0 - Critical (Do Now)

### P0-1: Security Audit - @html Usage Review

**Status:** Verified - FALSE POSITIVE

**Finding:** Initial audit flagged 15 `@html` usages in `seance/+page.svelte` as XSS risk.

**Verification Result:** All `@html` usages render **static SVG icon paths** defined as constants in the component script. No user-supplied content is passed to `@html`.

```typescript
// seance/+page.svelte - Lines 25-43
const icons: Record<string, string> = {
  ghost: '<path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12..."/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  // ... all static SVG paths
};
```

**Conclusion:** No action required. This is a safe pattern for inline SVG icons.

**Files Affected:**
- `src/routes/seance/+page.svelte` (15 usages - all safe)
- `src/routes/activity/+page.svelte` (1 usage - safe, uses iconSvgs constant)

---

### P0-2: Implement Production Authentication

**Status:** TODO - Mock implementation in place

**Current State:** Demo authentication that accepts any email with password "demo".

**Files:**
- `src/routes/api/auth/login/+server.ts:30`
- `src/routes/api/auth/refresh/+server.ts:29`

**Acceptance Criteria:**
- [ ] Replace mock `authenticateUser()` function with real auth backend call
- [ ] Implement proper JWT token generation/validation
- [ ] Add rate limiting for login attempts
- [ ] Add brute force protection
- [ ] Configure secure cookie settings for production
- [ ] Add CSRF protection
- [ ] Write integration tests for auth flow

**Implementation Notes:**
```typescript
// Current mock implementation to replace:
async function authenticateUser(credentials: LoginCredentials) {
  // TODO: Replace with actual authentication logic
  if (credentials.password === 'demo') { ... }
}
```

**Decision Required:** Choose auth provider (JWT self-hosted, OAuth provider, Auth0, Clerk, etc.)

---

## P1 - High (This Sprint)

### P1-1: Fix svelte-check Warnings (12 total)

**Status:** Verified - 12 warnings in 9 files

**Breakdown:**

| Warning Type | Count | Files |
|--------------|-------|-------|
| `state_referenced_locally` | 3 | Announcer, SplitView, MobileDashboard |
| `a11y_no_noninteractive_tabindex` | 3 | AgentCard, SplitView, SwipeableItem |
| `a11y_no_noninteractive_element_interactions` | 4 | Sidebar, SplitView, SwipeableItem, PullToRefresh |
| `svelte_component_deprecated` | 1 | ThemeToggle |
| `a11y_interactive_supports_focus` | 1 | SheetNav |

**Detailed Tasks:**

#### P1-1a: Fix `state_referenced_locally` (3 warnings)

**File:** `src/lib/components/Announcer.svelte:25`
```svelte
<!-- Before -->
let region = $state(document.getElementById(`announcer-${politeness}`));

<!-- After: Use $derived -->
let region = $derived(document.getElementById(`announcer-${politeness}`));
```

**File:** `src/lib/components/SplitView.svelte:36`
```svelte
<!-- Before -->
let width = $state(listWidth);

<!-- After: Use $derived or closure -->
let width = $derived(listWidth);
```

**File:** `src/lib/components/MobileDashboard.svelte:101`
```svelte
<!-- Before -->
let activeTab = $state(initialTab as 'agents' | 'flows' | 'queue' | 'logs');

<!-- After: Use $effect for initialization -->
let activeTab = $state<'agents' | 'flows' | 'queue' | 'logs'>('agents');
$effect(() => {
  if (initialTab) activeTab = initialTab;
});
```

**Acceptance Criteria:**
- [ ] All 3 `state_referenced_locally` warnings resolved
- [ ] Component behavior unchanged
- [ ] No new warnings introduced

---

#### P1-1b: Fix `a11y_no_noninteractive_tabindex` (3 warnings)

**File:** `src/lib/components/AgentCard.svelte:278`
```svelte
<!-- Before -->
<article tabindex={0} on:click={handleClick}>

<!-- After: Use button when interactive -->
{#if expandable}
  <button class={styles.card()} on:click={handleClick}>
    <!-- content -->
  </button>
{:else}
  <article class={styles.card()}>
    <!-- content -->
  </article>
{/if}
```

**File:** `src/lib/components/SplitView.svelte:116`
- Add `role="slider"` and required ARIA attributes for resize handle
- Or use a button element for the resize handle

**File:** `src/lib/components/SwipeableItem.svelte:211`
- This is intentional for swipe gesture handling
- Add `role="listitem"` or suppress with `<!-- svelte-ignore -->`

**Acceptance Criteria:**
- [ ] Interactive elements use semantic HTML (button, a) or proper ARIA roles
- [ ] Keyboard navigation works correctly
- [ ] Screen readers announce elements properly

---

#### P1-1c: Fix Non-interactive Element Interactions (4 warnings)

These are touch/gesture handlers that require mouse/touch events on divs:

**Files:**
- `src/lib/components/Sidebar.svelte:278` - nav click handler
- `src/lib/components/SplitView.svelte:116` - resize handler
- `src/lib/components/SwipeableItem.svelte:211` - swipe handler
- `src/lib/components/PullToRefresh.svelte:177` - pull handler

**Solution:** These are intentional for touch gestures. Add proper ARIA or suppress:
```svelte
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div on:touchstart={handleTouch} role="none">
```

**Acceptance Criteria:**
- [ ] Touch/swipe functionality preserved
- [ ] Warnings either fixed with proper roles or intentionally suppressed with comment

---

#### P1-1d: Fix Deprecated svelte:component

**File:** `src/lib/components/ThemeToggle.svelte:66`
```svelte
<!-- Before -->
<svelte:component this={Icon} />

<!-- After: Direct component usage (Svelte 5) -->
{@const IconComponent = Icon}
<IconComponent />
```

**Acceptance Criteria:**
- [ ] No deprecated syntax warnings
- [ ] Component works correctly

---

#### P1-1e: Fix Dialog Role Missing Tabindex

**File:** `src/lib/components/SheetNav.svelte:120`
```svelte
<!-- Before -->
<div role="dialog">

<!-- After -->
<div role="dialog" tabindex="-1">
```

**Acceptance Criteria:**
- [ ] Dialog element has tabindex
- [ ] Focus management works correctly

---

### P1-2: Remove Debug Console Statements

**Status:** Verified - 10 debug `console.log` statements to remove

**Files to Clean:**

| File | Lines | Action |
|------|-------|--------|
| `src/hooks.client.ts` | 74-77, 80 | Remove debug output |
| `src/lib/auth/store.svelte.ts` | 357 | Remove debug log |
| `src/lib/components/CommandPalette.svelte` | 343, 346, 353 | Remove debug logs |
| `src/routes/escalations/[id]/+page.svelte` | 85 | Remove debug log |
| `src/routes/agents/+page.svelte` | 77 | Remove debug log |
| `src/routes/agents/[id]/+page.svelte` | 52, 57, 62 | Remove debug logs |

**Note:** Keep all `console.error` and `console.warn` statements - they're legitimate error handling.

**Acceptance Criteria:**
- [ ] All `console.log` debug statements removed
- [ ] `console.error` and `console.warn` for error handling preserved
- [ ] No runtime errors after removal
- [ ] Build succeeds with no console output in production

**Verification:**
```bash
rg "console\.log" src --type ts --type svelte | wc -l
# Should be 0 after cleanup
```

---

### P1-3: Create Shared Date/Time Utilities

**Status:** Verified - 18 duplicate functions across 12 files

**Current Duplication:**

| Function | Occurrences | Files |
|----------|-------------|-------|
| `formatDate()` | 5 | convoys, seance, activity, issues |
| `formatTime()` | 6 | dogs, seance, activity, mail, logs, watchdog |
| `formatTimestamp()` | 2 | escalations (both pages) |
| `formatRelativeTime()` | 4 | dogs, escalations, issues |
| `formatTimeSince()` | 1 | watchdog server |

**Implementation:**

Create `src/lib/utils/date.ts`:

```typescript
/**
 * Date/Time formatting utilities
 * Replaces 18 duplicate functions across 12 files
 */

/**
 * Format ISO string as localized time (e.g., "2:30:45 PM")
 */
export function formatTime(isoString: string | null): string {
  if (!isoString) return 'Never';
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Format ISO string as relative date (e.g., "Today", "Yesterday", "Jan 5")
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Format ISO string as relative time (e.g., "5m ago", "2h ago", "3d ago")
 */
export function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return 'Unknown';

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format ISO string as full timestamp (e.g., "Jan 5, 2:30 PM")
 */
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format duration in minutes to human readable (e.g., "2h 30m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
```

**Files to Update:**
1. `src/routes/convoys/+page.svelte` - Replace local `formatDate`
2. `src/routes/convoys/[id]/+page.svelte` - Replace local `formatDate`
3. `src/routes/dogs/+page.svelte` - Replace `formatTime`, `formatRelativeTime`
4. `src/routes/escalations/+page.svelte` - Replace `formatTimestamp`
5. `src/routes/escalations/[id]/+page.svelte` - Replace `formatTimestamp`, `formatRelativeTime`
6. `src/routes/seance/+page.svelte` - Replace `formatTime`, `formatDate`
7. `src/routes/activity/+page.svelte` - Replace `formatTime`, `formatDate`
8. `src/routes/mail/+page.svelte` - Replace `formatTime`
9. `src/routes/mail/[id]/+page.svelte` - Replace `formatTime`
10. `src/routes/logs/+page.svelte` - Replace `formatTime`
11. `src/routes/watchdog/+page.svelte` - Replace `formatTime`
12. `src/routes/issues/[id]/+page.svelte` - Replace `formatDate`, `formatRelativeTime`

**Acceptance Criteria:**
- [ ] Create `src/lib/utils/date.ts` with shared functions
- [ ] Export from `src/lib/utils/index.ts`
- [ ] Update all 12 files to import from shared utility
- [ ] Remove local function definitions
- [ ] All date/time formatting works correctly
- [ ] No duplicate functions remain

**Verification:**
```bash
rg "function format(Date|Time|Timestamp|RelativeTime)" src/routes
# Should return 0 results after refactor
```

---

### P1-4: Create Shared Status Utilities

**Status:** Verified - 4 files with duplicate status functions

**Current Duplication:**

| Function | Files |
|----------|-------|
| `getStatusColor()` | watchdog, dogs, seance |
| `getStatusVariant()` | watchdog, seance |
| `getFreshnessColor()` | watchdog |
| `getFreshnessLabel()` | watchdog |

**Implementation:**

Create `src/lib/utils/status.ts`:

```typescript
/**
 * Status color and variant utilities
 * Centralizes status styling logic
 */

export type StatusType = 'running' | 'idle' | 'error' | 'warning' | 'complete' | 'pending';
export type FreshnessType = 'fresh' | 'stale' | 'very-stale' | 'unknown';

/**
 * Get Tailwind text color class for status
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    running: 'text-status-online',
    online: 'text-status-online',
    active: 'text-success',
    healthy: 'text-success',
    completed: 'text-muted-foreground',
    idle: 'text-muted-foreground',
    pending: 'text-status-pending',
    warning: 'text-warning',
    error: 'text-destructive',
    offline: 'text-status-offline',
    crashed: 'text-destructive'
  };
  return colors[status.toLowerCase()] || 'text-foreground';
}

/**
 * Get StatusIndicator variant for status
 */
export function getStatusVariant(status: string): StatusType {
  const variants: Record<string, StatusType> = {
    running: 'running',
    online: 'running',
    active: 'running',
    healthy: 'running',
    completed: 'complete',
    idle: 'idle',
    pending: 'pending',
    warning: 'warning',
    error: 'error',
    offline: 'error',
    crashed: 'error'
  };
  return variants[status.toLowerCase()] || 'idle';
}

/**
 * Get color for freshness level (watchdog/heartbeat)
 */
export function getFreshnessColor(freshness: FreshnessType): string {
  const colors: Record<FreshnessType, string> = {
    fresh: 'text-status-online',
    stale: 'text-status-pending',
    'very-stale': 'text-status-offline',
    unknown: 'text-muted-foreground'
  };
  return colors[freshness];
}

/**
 * Get background/border for freshness level
 */
export function getFreshnessBg(freshness: FreshnessType): string {
  const bgs: Record<FreshnessType, string> = {
    fresh: 'bg-status-online/10 border-status-online/30',
    stale: 'bg-status-pending/10 border-status-pending/30',
    'very-stale': 'bg-status-offline/10 border-status-offline/30',
    unknown: 'bg-muted/50 border-border'
  };
  return bgs[freshness];
}

/**
 * Get human-readable label for freshness
 */
export function getFreshnessLabel(freshness: FreshnessType): string {
  const labels: Record<FreshnessType, string> = {
    fresh: 'Fresh (<5min)',
    stale: 'Stale (5-15min)',
    'very-stale': 'Very Stale (>15min)',
    unknown: 'Unknown'
  };
  return labels[freshness];
}
```

**Acceptance Criteria:**
- [ ] Create `src/lib/utils/status.ts`
- [ ] Export from `src/lib/utils/index.ts`
- [ ] Update watchdog, dogs, seance pages to use shared utilities
- [ ] Remove local function definitions
- [ ] Status styling consistent across all pages

---

## P2 - Medium (Next Sprint)

### P2-1: Split CommandPalette.svelte (718 lines)

**Status:** Verified - 718 lines, needs splitting

**Proposed Structure:**
```
src/lib/components/
├── CommandPalette/
│   ├── index.ts              # Re-export
│   ├── CommandPalette.svelte # Main container (150 lines)
│   ├── CommandList.svelte    # List rendering (100 lines)
│   ├── CommandItem.svelte    # Single item (80 lines)
│   ├── CommandSearch.svelte  # Search input (60 lines)
│   ├── commands.ts           # Command definitions (200 lines)
│   └── types.ts              # TypeScript types (30 lines)
```

**Acceptance Criteria:**
- [ ] No single file exceeds 200 lines
- [ ] All command palette functionality preserved
- [ ] Keyboard navigation works
- [ ] Search/filtering works
- [ ] No performance regression
- [ ] Types properly exported

---

### P2-2: Split GlobalSearch.svelte (675 lines)

**Status:** Verified - 675 lines, shares ~40% functionality with CommandPalette

**Proposed Structure:**
```
src/lib/components/
├── SearchModal/
│   ├── index.ts              # Re-export
│   ├── SearchModal.svelte    # Shared modal base
│   ├── SearchInput.svelte    # Search input with keyboard
│   ├── SearchResults.svelte  # Results list
│   └── types.ts              # Shared types
├── GlobalSearch/
│   ├── index.ts
│   ├── GlobalSearch.svelte   # Uses SearchModal
│   └── mockData.ts           # Extract mock data
```

**Acceptance Criteria:**
- [ ] Extract shared modal functionality
- [ ] GlobalSearch uses shared SearchModal
- [ ] CommandPalette can optionally use SearchModal
- [ ] Mock data extracted to separate file
- [ ] No functionality regression

---

### P2-3: Create Debug Logger Utility

**Status:** Recommended for better debugging control

**Implementation:**

Create `src/lib/utils/logger.ts`:

```typescript
/**
 * Debug logger utility
 * Only logs in development mode
 */

const isDev = import.meta.env.DEV;
const isDebug = import.meta.env.VITE_DEBUG === 'true';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  prefix?: string;
  enabled?: boolean;
}

function createLogger(options: LoggerOptions = {}) {
  const { prefix = '[App]', enabled = isDev || isDebug } = options;

  return {
    debug: (...args: unknown[]) => {
      if (enabled) console.log(prefix, ...args);
    },
    info: (...args: unknown[]) => {
      if (enabled) console.info(prefix, ...args);
    },
    warn: (...args: unknown[]) => {
      console.warn(prefix, ...args);
    },
    error: (...args: unknown[]) => {
      console.error(prefix, ...args);
    }
  };
}

// Default logger
export const logger = createLogger();

// Module-specific loggers
export const authLogger = createLogger({ prefix: '[Auth]' });
export const wsLogger = createLogger({ prefix: '[WebSocket]' });
export const syncLogger = createLogger({ prefix: '[Sync]' });
```

**Acceptance Criteria:**
- [ ] Create logger utility
- [ ] Replace remaining `console.log` with `logger.debug`
- [ ] Debug output only in development
- [ ] Production builds have no debug output
- [ ] `VITE_DEBUG=true` enables debug in production for troubleshooting

---

## Verification Checklist

After completing all items, verify:

```bash
# 1. No type errors or warnings
bun run check
# Expected: 0 errors, 0 warnings

# 2. No debug console.log
rg "console\.log" src --type ts --type svelte
# Expected: 0 results (or only intentional ones in logger)

# 3. No duplicate date functions
rg "function format(Date|Time)" src/routes
# Expected: 0 results

# 4. Build succeeds
bun run build
# Expected: Success

# 5. Tests pass
bun test
# Expected: All tests pass
```

---

## Timeline Estimate

| Phase | Items | Effort |
|-------|-------|--------|
| P0 | Auth decision + implementation | Backend team decision |
| P1-1 | svelte-check warnings | 2-3 hours |
| P1-2 | Console cleanup | 30 minutes |
| P1-3 | Date utilities | 2 hours |
| P1-4 | Status utilities | 1 hour |
| P2-1 | CommandPalette split | 4 hours |
| P2-2 | GlobalSearch split | 3 hours |
| P2-3 | Logger utility | 1 hour |

**Total P1:** ~6 hours
**Total P2:** ~8 hours

---

*Generated from CODE_HEALTH_AUDIT.md with codebase verification on 2026-01-10*
