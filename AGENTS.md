# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Project Structure

```
gastown-ui/                          # Town root
├── .beads/                          # Town-level beads (mayor mail, HQ coordination)
├── AGENTS.md                        # This file
├── CLAUDE.md                        # Mayor context
│
└── gastown-ui/                      # Rig: SvelteKit UI project
    ├── .repo.git/                   # Bare git repository (shared by all worktrees)
    │
    ├── mayor/
    │   ├── rig/                     # Mayor's reference clone (READ-ONLY)
    │   │   └── .beads/              # Rig beads database (source of truth)
    │   └── state.json
    │
    ├── polecats/                    # Worker worktrees
    │   ├── furiosa/                 # Polecat worktree
    │   │   └── .beads/redirect      # → ../../mayor/rig/.beads
    │   └── nux/                     # Polecat worktree
    │       └── .beads/redirect      # → ../../mayor/rig/.beads
    │
    ├── refinery/
    │   └── rig/                     # Merge queue processor worktree (on main)
    │       └── .beads/redirect      # → ../../mayor/rig/.beads
    │
    ├── crew/                        # Human-managed worktrees
    │   └── amrit/
    │
    └── witness/                     # Polecat lifecycle monitor
        └── state.json
```

### Key Concepts

| Component | Purpose |
|-----------|---------|
| **Town** | Workspace root containing all rigs |
| **Rig** | Project container (one per repo) |
| **Polecat** | Worker agent with isolated git worktree |
| **Refinery** | Merge queue processor (rebases, tests, merges) |
| **Witness** | Monitors polecat lifecycle |
| **Beads** | Issue tracking, shared via redirect to mayor/rig/.beads |

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

---

## Critical Fixes Phase - Patterns & Discoveries

### Form Validation Pattern

**When**: All user forms need to validate input before submission

**Pattern**:
```typescript
import { z } from 'zod';

// 1. Define validation schema
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(['task', 'bug', 'feature', 'epic']),
  priority: z.number().min(0).max(4)
});

// 2. In form handler, validate BEFORE submission
async function handleSubmit(e: Event) {
  e.preventDefault();
  errors = {};
  
  const result = formSchema.safeParse({
    title: formTitle,
    type: selectedType,
    priority: selectedPriority
  });
  
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    errors = Object.fromEntries(
      Object.entries(fieldErrors).map(([key, msgs]) => [key, msgs?.[0] || ''])
    );
    hapticError();
    return; // Don't submit
  }
  
  // Continue with submission
}

// 3. Display errors inline
{#if errors.title}
  <p class="text-sm text-destructive">{errors.title}</p>
{/if}

// 4. Disable submit until valid
<button disabled={formTitle.length < 3}>Submit</button>
```

**Applied To**:
- Work page: Issue creation, Convoy creation, Sling work forms

**Key Points**:
- Use Zod for client-side validation (npm install zod)
- Validate on submit, not on blur
- Show specific error messages per field
- Disable submit button while invalid
- Clear errors on successful submission

---

### Error State Integration Pattern

**When**: Any page that fetches data asynchronously

**Pattern**:
```svelte
<script>
  let error: Error | null = null;
  let loading = true;
  
  async function fetchData() {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Failed to fetch');
      data = await res.json();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      loading = false;
    }
  }
  
  function handleRetry() {
    error = null;
    fetchData();
  }
  
  onMount(() => {
    fetchData();
  });
</script>

{#if loading}
  <SkeletonCard type="mail" count={5} />
{:else if error}
  <ErrorState
    title="Failed to load"
    message={error}
    onRetry={handleRetry}
    showRetryButton={true}
  />
{:else if data.length === 0}
  <EmptyState title="No data" description="Create your first item" />
{:else}
  <!-- Content here -->
{/if}
```

**Applied To**:
- Mail page
- Agents page
- Work page
- Any async data fetch

**Key Points**:
- Always have loading, error, empty, and content states
- Error state should show specific error message
- Retry button re-fetches data
- Clear error on successful retry
- Use haptic feedback for errors

---

### Testing Procedures

**Created Documentation**:
1. **KEYBOARD_TESTING.md** - Tab order, focus, screen readers (VoiceOver, NVDA)
2. **DARK_MODE_TESTING.md** - Contrast ratios, WAVE, axe DevTools
3. **PERFORMANCE_TESTING.md** - Lighthouse, Core Web Vitals, 3G throttle
4. **BROWSER_TESTING.md** - Chrome, Firefox, Safari, iOS, Android

**Use These For**:
- Pre-launch verification
- Weekly/monthly monitoring
- Regression detection
- Accessibility compliance

**Success Criteria**:
- Lighthouse ≥90 on all pages
- LCP <2.5s on 3G
- Zero console errors
- Keyboard nav works on all pages
- 4.5:1 contrast in dark mode
- Works on Chrome, Firefox, Safari, iOS, Android

---

### Known Patterns & Gotchas

**Safe Area Insets (iOS)**:
- Use `env(safe-area-inset-bottom)` for bottom nav padding
- Apply to: BottomNav, floating buttons
- Formula: `padding-bottom: calc(height + env(safe-area-inset-bottom))`

**100vh Issue (Mobile Safari)**:
- 100vh includes address bar, causes overflow
- Use `100dvh` (dynamic viewport height) instead
- Or use `height: 100%` with full-height parent

**Select Dropdown Styling (Safari iOS)**:
- Cannot be styled on iOS Safari
- Accept default native styling
- Consider custom component for critical dropdowns

**Focus Management**:
- Always provide visible focus ring (2px ring-offset)
- Use Tailwind: `focus:ring-2 focus:ring-accent`
- Test with keyboard (Tab key)
- Verify with keyboard-only mode (disconnect mouse)

**Dark Mode Support**:
- Use CSS custom properties (--color-*)
- Test with: System dark mode, browser dark mode toggle
- Minimum contrast: 4.5:1 for all text

---

## Dependencies Added

```json
{
  "dependencies": {
    "zod": "^3.22.0"  // Client-side form validation
  }
}
```

Install with: `npm install zod --legacy-peer-deps`

---

## File Locations

| Purpose | Location |
|---------|----------|
| Form validation | `/src/routes/work/+page.svelte` (schemas at top of script) |
| Error state pattern | Mail, Agents, Work pages |
| Empty state component | `$lib/components/EmptyState.svelte` |
| Skeleton loaders | `$lib/components/SkeletonCard.svelte` |
| Keyboard testing | `KEYBOARD_TESTING.md` |
| Dark mode testing | `DARK_MODE_TESTING.md` |
| Performance testing | `PERFORMANCE_TESTING.md` |
| Browser testing | `BROWSER_TESTING.md` |

