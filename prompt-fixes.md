# Ralph: Critical Fixes Execution Plan

**Objective**: Implement all critical fixes from UI review gaps  
**Branch**: feat/ui-critical-fixes  
**Mode**: Sequential execution (one fix after another)  
**Target**: Production-ready error handling, validation, and testing documentation

---

## What Ralph Will Do

1. **Phase 1 (1 hour)**: Wire ErrorState to Mail, Agents, Work pages
2. **Phase 2 (2 hours)**: Add form validation to Work page (3 forms)
3. **Phase 3 (1.5 hours)**: Complete SkeletonLoader and EmptyState coverage
4. **Phase 4 (2 hours)**: Create testing documentation

**Sequential execution**: Each story completed, tested, committed before next

---

## Phase 1: Error State Integration (1 hour)

### Story FIX-001: Integrate ErrorState to Mail Page

**What to do**:
1. Open `src/routes/mail/+page.svelte`
2. Wrap `fetchMail()` in try-catch block
3. Store error state: `let error: Error | null = null`
4. Import ErrorState: `import ErrorState from '$lib/components/ErrorState.svelte'`
5. Conditionally render:
   ```svelte
   {#if error}
     <ErrorState 
       title="Failed to Load Mail"
       message="Could not fetch your messages"
       onRetry={() => {
         error = null;
         // Re-fetch mail
       }}
     />
   {:else if loading}
     <SkeletonLoader />
   {:else if mails.length === 0}
     <EmptyState preset="no-data" />
   {:else}
     <!-- Mail list -->
   {/if}
   ```

**Verification**:
- Type check: `bun run check` (must pass)
- Visual: Navigate to Mail page, confirm normal display
- Test error: DevTools Network > Offline mode > Refresh > ErrorState appears
- Test retry: Click retry button > Mail loads

**Commit**: `feat(error-handling): Integrate ErrorState to Mail page (FIX-001)`

---

### Story FIX-002: Integrate ErrorState to Agents Page

**What to do**:
1. Same pattern as FIX-001 but for `src/routes/agents/+page.svelte`
2. Wrap agent data fetch in try-catch
3. Add error state variable
4. Render ErrorState on error

**Verification**:
- Type check: `bun run check`
- Test: Offline mode > Refresh > ErrorState appears
- Test retry: Works correctly

**Commit**: `feat(error-handling): Integrate ErrorState to Agents page (FIX-002)`

---

### Story FIX-003: Integrate ErrorState to Work Page

**What to do**:
1. Open `src/routes/work/+page.svelte`
2. Add two error states:
   - `loadError`: For initial data load failures
   - `submitError`: For form submission failures
3. Wrap data fetch in try-catch (loadError)
4. Wrap each form submit in try-catch (submitError)
5. Render ErrorState for each error condition

**Verification**:
- Type check: `bun run check`
- Test load error: Offline > Refresh > ErrorState appears
- Test submit error: Try submit with bad data > ErrorState appears
- Test retry: Both work correctly

**Commit**: `feat(error-handling): Integrate ErrorState to Work page (FIX-003)`

---

## Phase 2: Form Validation & Feedback (2 hours)

### Story FIX-004: Add Validation to Issue Creation Form

**What to do**:
1. Import Zod: `import { z } from 'zod'`
2. Define schema:
   ```typescript
   const issueSchema = z.object({
     title: z.string().min(3, "Title must be at least 3 characters"),
     type: z.enum(["task", "bug", "feature", "epic"]),
     priority: z.enum(["low", "medium", "high", "critical"]),
     description: z.string().optional()
   });
   ```
3. Add validation state: `let validationErrors = {}`
4. On form submit:
   ```typescript
   const result = issueSchema.safeParse(formData);
   if (!result.success) {
     validationErrors = result.error.flatten().fieldErrors;
     return; // Don't submit
   }
   // Submit valid data
   ```
5. Display errors:
   ```svelte
   {#if validationErrors.title}
     <p class="text-red-500 text-sm">{validationErrors.title[0]}</p>
   {/if}
   ```

**Verification**:
- Type check: `bun run check`
- Try submit empty form > Validation errors appear
- Fill form correctly > No errors, submit works
- Try invalid email > Shows error

**Commit**: `feat(validation): Add validation to issue creation form (FIX-004)`

---

### Story FIX-005: Add Validation to Convoy Form

**What to do**:
1. Same pattern as FIX-004
2. Schema: name required (min 3 chars), agents selected
3. Show validation errors inline
4. Disable submit until valid

**Verification**:
- Type check
- Test validation on convoy name field
- Test form validation works

**Commit**: `feat(validation): Add validation to convoy creation form (FIX-005)`

---

### Story FIX-006: Add Validation to Sling Work Form

**What to do**:
1. Same validation pattern
2. Schema depends on form fields
3. Show errors, disable submit until valid

**Verification**:
- Type check
- Test each field validation

**Commit**: `feat(validation): Add validation to sling work form (FIX-006)`

---

## Phase 3: Complete Loading States (1.5 hours)

### Story FIX-007: Add SkeletonLoaders to Workflows Page

**What to do**:
1. Find Workflows page (likely in DashboardLayout.svelte or routes)
2. Add loading state: `let loading = true`
3. Wrap data fetch in try-catch with loading flag
4. Conditionally render:
   ```svelte
   {#if loading}
     <SkeletonCard type="stat" count={4} />
   {:else}
     <!-- Workflows list -->
   {/if}
   ```

**Verification**:
- Type check
- Navigate to Workflows with Network throttled
- Skeletons appear briefly

**Commit**: `feat(loading-states): Add skeletons to Workflows page (FIX-007)`

---

### Story FIX-008: Add SkeletonLoaders to Queue Page

**What to do**:
1. Same pattern for Queue page
2. Show 5-6 queue item skeletons

**Verification**:
- Type check
- Test with throttled network

**Commit**: `feat(loading-states): Add skeletons to Queue page (FIX-008)`

---

### Story FIX-009: Expand EmptyState Coverage

**What to do**:
1. Find pages: Rigs, Convoys, Health, Crew
2. For each, add EmptyState:
   ```svelte
   {#if items.length === 0}
     <EmptyState 
       title="No rigs configured"
       description="Create your first rig to get started"
       preset="no-data"
     />
   {/if}
   ```

**Verification**:
- Type check
- Navigate to each page when empty
- Appropriate empty state displays

**Commit**: `feat(empty-states): Expand EmptyState coverage (FIX-009)`

---

## Phase 4: Testing Documentation (2 hours)

### Story FIX-010: Create Keyboard Navigation Testing Docs

**What to do**:
1. Create file: `KEYBOARD_TESTING.md`
2. Document procedure:
   - Open each page
   - Press Tab repeatedly (trace focus order)
   - Verify all interactive elements are reachable
   - Verify focus rings visible
   - Verify can Tab out of all modals/dropdowns
3. Create test matrix (page × test result)
4. Document screen reader testing:
   - Use VoiceOver (Mac) or NVDA (Windows)
   - Verify landmarks announced
   - Verify headings announced
   - Verify form labels announced

**Content**:
```markdown
# Keyboard Navigation Testing Procedure

## Test Steps
1. Open browser DevTools
2. Close DevTools (prevents focus jumps)
3. Press Tab and trace focus
4. Expected: Focus visible ring, logical left→right, top→bottom order

## Pages to Test
- Dashboard
- Mail
- Agents
- Work
- Rigs
- Convoys
- Workflows
- Queue
- Escalations

## Results
[Table with page × test result]
```

**Commit**: `docs(testing): Add keyboard navigation testing procedure (FIX-010)`

---

### Story FIX-011: Create Dark Mode Testing Docs

**What to do**:
1. Create file: `DARK_MODE_TESTING.md`
2. Document procedure:
   - Toggle dark mode in browser
   - Use WAVE or axe DevTools to check contrast
   - Document contrast ratios found
   - List any failures (need fixing)

**Content**:
```markdown
# Dark Mode Testing Procedure

## Tools Needed
- WAVE Browser Extension (WebAIM)
- axe DevTools Browser Extension
- Browser DevTools

## Testing Procedure
1. Toggle dark mode
2. Open WAVE > Check for contrast errors
3. Record contrast ratios for key elements
4. Identify any WCAG AA failures

## Results
[Table with element × contrast ratio × status]
```

**Commit**: `docs(testing): Add dark mode testing procedure (FIX-011)`

---

### Story FIX-012: Create Performance Testing Docs

**What to do**:
1. Create file: `PERFORMANCE_TESTING.md`
2. Document Lighthouse audit procedure
3. Document Core Web Vitals measurement
4. Create 3G throttle testing checklist

**Content**:
```markdown
# Performance Testing Procedure

## Lighthouse Audit
1. Open DevTools > Lighthouse
2. Run audit on each main page
3. Record: Performance score, LCP, CLS, FID
4. Target: Performance ≥90, LCP <2.5s

## Core Web Vitals
- LCP (Largest Contentful Paint): <2.5s
- CLS (Cumulative Layout Shift): <0.1
- FID (First Input Delay): <100ms

## 3G Throttle Test
1. DevTools > Network > Add custom throttle (3G Fast)
2. Refresh page
3. Measure load time
4. Target: <3s

## Results
[Table with page × metric × result]
```

**Commit**: `docs(testing): Add performance testing procedure (FIX-012)`

---

### Story FIX-013: Create Browser Testing Docs

**What to do**:
1. Create file: `BROWSER_TESTING.md`
2. Create test matrix: browsers × pages × test result
3. Document procedure for each browser

**Content**:
```markdown
# Cross-Browser Testing Procedure

## Browsers to Test
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- iOS Safari (latest)
- Android Chrome (latest)

## Test Matrix
| Page | Chrome | Safari | Firefox | iOS Safari | Android Chrome |
|------|--------|--------|---------|------------|----------------|
| Dashboard | ✅ | ? | ? | ? | ? |
| Mail | ✅ | ? | ? | ? | ? |
...

## Procedure per Browser
1. Open app
2. Test navigation (all pages accessible)
3. Test forms (can submit)
4. Check console for errors
5. Verify visual design consistent

## Known Issues
[Document any compatibility problems found]
```

**Commit**: `docs(testing): Add cross-browser testing procedure (FIX-013)`

---

### Story FIX-014: Update AGENTS.md with All Patterns

**What to do**:
1. Open `AGENTS.md`
2. Add new section: "Critical Fixes Phase - Patterns Discovered"
3. Document:
   - Error state integration pattern (when/where to use)
   - Form validation pattern (schema example)
   - Loading state pattern (when to use SkeletonLoader)
   - Empty state pattern (comprehensive coverage list)
4. Add "Testing Procedures" section linking to new test docs
5. Add "Known Issues" section documenting any remaining gaps
6. Add "Component Wiring Checklist" for future implementations

**Content**:
```markdown
## Error State Integration Pattern

When data fetch fails:
```svelte
{#if error}
  <ErrorState onRetry={handleRetry} />
{/if}
```

## Form Validation Pattern

Use Zod schema + validation errors display:
```typescript
const schema = z.object({
  title: z.string().min(3)
});
```

## Testing Procedures

- Keyboard Navigation: See KEYBOARD_TESTING.md
- Dark Mode: See DARK_MODE_TESTING.md
- Performance: See PERFORMANCE_TESTING.md
- Cross-Browser: See BROWSER_TESTING.md
```

**Commit**: `docs(patterns): Update AGENTS.md with critical fixes patterns (FIX-014)`

---

## Execution Strategy for Ralph

**Sequential flow**:
1. Do FIX-001, test, commit
2. Do FIX-002, test, commit
3. Do FIX-003, test, commit
4. Do FIX-004, test, commit
5. Do FIX-005, test, commit
6. Do FIX-006, test, commit
7. Do FIX-007, test, commit
8. Do FIX-008, test, commit
9. Do FIX-009, test, commit
10. Do FIX-010, test, commit
11. Do FIX-011, test, commit
12. Do FIX-012, test, commit
13. Do FIX-013, test, commit
14. Do FIX-014, test, commit, push

**After each story**:
- Run `bun run check` (must pass)
- Visual verification on device
- Commit with proper message
- Update progress.txt

**Final step**:
- `git push` to feat/ui-critical-fixes branch
- All changes committed and pushed

---

## Success Criteria

✅ All 14 stories completed  
✅ All commits in git history  
✅ `bun run check` passes (0 TypeScript errors)  
✅ ErrorState integrated to 3 pages  
✅ Form validation on 3 forms  
✅ Loading states completed on 2 pages  
✅ EmptyStates on 4 additional pages  
✅ Testing documentation complete (4 docs)  
✅ AGENTS.md updated  
✅ All changes pushed to git

---

## Known Constraints

- Ralph cannot run actual device testing (keyboard, screen reader)
- Ralph cannot run automated tools (WAVE, axe, Lighthouse)
- Ralph will create testing documentation, not run tests
- Ralph will verify code compiles, not actual runtime behavior on devices

**What Ralph WILL accomplish**:
- All code changes implemented and committed
- All testing procedures documented
- All patterns added to AGENTS.md
- All changes pushed to git
- Production-ready code foundations

**Next human steps** (after Ralph completes):
- Run testing procedures documented
- Verify on actual devices
- Run Lighthouse and other tools
- Merge to main after confirmation
