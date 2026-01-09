# Critical Fixes - Quick Start Guide

**Objective**: Fix identified gaps from UI review (14 stories)  
**Time Estimate**: 6-8 hours autonomous execution  
**Branch**: feat/ui-critical-fixes  
**What Ralph Will Do**: Sequential story execution, committed per story

---

## TL;DR - What's Wrong & What We're Fixing

### Problems Identified
1. ❌ ErrorState component created but NOT wired to any pages
2. ❌ Forms have no validation (accept any input)
3. ❌ Loading states incomplete (only 3/13 pages have skeletons)
4. ❌ Empty states incomplete (only 3-4 pages have them)
5. ❌ Testing claims unverified (no actual test results)

### What We're Fixing
1. ✅ Wire ErrorState to Mail, Agents, Work (3 pages)
2. ✅ Add validation to issue, convoy, sling forms
3. ✅ Add skeletons to Workflows, Queue pages
4. ✅ Add empty states to Rigs, Convoys, Health, Crew
5. ✅ Create testing procedures (documentation)

---

## Ralph Execution Plan

### Phase 1: Error Handling (1 hour)
```
FIX-001: ErrorState to Mail page
FIX-002: ErrorState to Agents page  
FIX-003: ErrorState to Work page
```
**What Ralph does**:
- Wrap data fetch in try-catch
- Import ErrorState component
- Conditionally render ErrorState on error
- Test: Offline mode shows error, retry works
- Commit each story

### Phase 2: Form Validation (2 hours)
```
FIX-004: Validate issue creation form
FIX-005: Validate convoy creation form
FIX-006: Validate sling work form
```
**What Ralph does**:
- Import Zod validation library
- Define validation schema
- Add validation on submit
- Show inline error messages
- Disable submit until valid
- Test: Try empty form → errors appear
- Commit each story

### Phase 3: Loading States (1.5 hours)
```
FIX-007: Add skeletons to Workflows page
FIX-008: Add skeletons to Queue page
FIX-009: Expand EmptyState to 4 more pages
```
**What Ralph does**:
- Add SkeletonCard component to loading sections
- Add EmptyState to Rigs, Convoys, Health, Crew
- Test: Throttled network shows skeletons
- Commit each story

### Phase 4: Testing Documentation (2 hours)
```
FIX-010: Keyboard navigation testing procedure
FIX-011: Dark mode contrast testing procedure
FIX-012: Performance testing procedure
FIX-013: Cross-browser testing procedure
FIX-014: Update AGENTS.md with all patterns
```
**What Ralph does**:
- Create detailed testing docs (4 files)
- Document procedures, not execute them
- Create test matrices and checklists
- Update AGENTS.md with discovered patterns
- Commit each story
- Push all to git

---

## How to Run Ralph

**Option 1: Use Ralph Skill** (if available)
```bash
cd /Users/amrit/Documents/Projects/Rust/mouchak/gastown_exp
# Ralph will autonomously execute all 14 stories sequentially
```

**Option 2: Manual execution** (if Ralph not available)
```bash
# Create and checkout branch
git checkout -b feat/ui-critical-fixes

# Then manually implement each story from prompt-fixes.md
# (14 stories, each one commit + test + push)

# Finally
git push origin feat/ui-critical-fixes
```

---

## Files Ralph Will Create/Modify

### New Files
- ✅ KEYBOARD_TESTING.md (FIX-010)
- ✅ DARK_MODE_TESTING.md (FIX-011)
- ✅ PERFORMANCE_TESTING.md (FIX-012)
- ✅ BROWSER_TESTING.md (FIX-013)

### Modified Files
- ✅ src/routes/mail/+page.svelte (FIX-001, FIX-004)
- ✅ src/routes/agents/+page.svelte (FIX-002)
- ✅ src/routes/work/+page.svelte (FIX-003, FIX-005, FIX-006)
- ✅ Workflows page (FIX-007)
- ✅ Queue page (FIX-008)
- ✅ Rigs, Convoys, Health, Crew pages (FIX-009)
- ✅ AGENTS.md (FIX-014)

---

## Testing During Execution

Ralph will test each story by:
1. Running `bun run check` (TypeScript validation)
2. Performing manual visual verification
3. Testing error scenarios (offline mode, bad inputs)
4. Verifying commits are clean

**Human verification needed after**:
- Run automated accessibility tests (axe, jest-axe)
- Run Lighthouse performance audit
- Test on actual iOS/Android devices
- Test with screen readers

---

## Progress Tracking

Ralph will update `progress.txt` after each story:
```
Iteration N: FIX-XXX - [Title]
**Status**: ✅ COMPLETE

**What was implemented**:
- [Details of what was done]

**Verification**:
- [Testing results]

**Acceptance criteria met**:
- ✅ [Criterion 1]
- ✅ [Criterion 2]
...

**Next up**: FIX-XXX+1
```

---

## After Ralph Completes

### Immediate (5 minutes)
1. ✅ Verify all commits in git history
2. ✅ Verify branch is feat/ui-critical-fixes
3. ✅ Verify all changes pushed to remote

### Soon (1 hour)
1. ⚠️ Run testing procedures (use new docs)
2. ⚠️ Run Lighthouse audit
3. ⚠️ Test on actual devices

### Before Merge (2 hours)
1. ⚠️ Address any test failures
2. ⚠️ Create PR with test results
3. ⚠️ Get code review
4. ⚠️ Merge to main

---

## Success Metrics

**Code Quality**:
- ✅ 0 TypeScript errors (bun run check passes)
- ✅ All forms have validation
- ✅ All error states integrated
- ✅ All loading states complete
- ✅ All empty states complete

**Documentation**:
- ✅ Testing procedures documented
- ✅ AGENTS.md updated with patterns
- ✅ 4 new testing docs created

**Git**:
- ✅ 14 commits (one per story)
- ✅ All changes pushed
- ✅ Clean commit history

---

## Quick Reference: Story Order

```
Phase 1 (Error Handling) - 30 min
├─ FIX-001: Mail ErrorState
├─ FIX-002: Agents ErrorState
└─ FIX-003: Work ErrorState

Phase 2 (Form Validation) - 1.5 hours
├─ FIX-004: Issue validation
├─ FIX-005: Convoy validation
└─ FIX-006: Sling validation

Phase 3 (Loading States) - 1 hour
├─ FIX-007: Workflows skeletons
├─ FIX-008: Queue skeletons
└─ FIX-009: Empty states expansion

Phase 4 (Testing Docs) - 1.5 hours
├─ FIX-010: Keyboard nav testing
├─ FIX-011: Dark mode testing
├─ FIX-012: Performance testing
├─ FIX-013: Browser testing
└─ FIX-014: Update AGENTS.md

Total: 6-8 hours → Production ready
```

---

## Files to Reference

| File | Purpose |
|------|---------|
| `prd-fixes.json` | All 14 stories with acceptance criteria |
| `prompt-fixes.md` | Detailed implementation guide for Ralph |
| `START_FIXES.md` | This file (quick reference) |
| `progress.txt` | Ralph updates after each story |

---

## When Ralph Gets Stuck

Ralph may ask about:
1. **"Where is the ErrorState component?"** → `src/lib/components/ApiError.svelte` or `ErrorState.svelte`
2. **"What data does Mail page fetch?"** → Check `src/routes/mail/+page.svelte` for fetch calls
3. **"Where are form submit handlers?"** → Look in each page's `<script>` section
4. **"What validation library?"** → Use Zod (already in dependencies)

**Important**: All components exist, Ralph just needs to wire them.

---

## Expected Output

After Ralph completes:

### Visible Changes
- ✅ All pages have proper error handling
- ✅ All forms show validation errors
- ✅ All loading states have skeletons
- ✅ All possible-empty pages have empty states
- ✅ 4 new testing documentation files

### Git History
```
feat(error-handling): Integrate ErrorState to Mail page (FIX-001)
feat(error-handling): Integrate ErrorState to Agents page (FIX-002)
feat(error-handling): Integrate ErrorState to Work page (FIX-003)
feat(validation): Add validation to issue form (FIX-004)
feat(validation): Add validation to convoy form (FIX-005)
feat(validation): Add validation to sling form (FIX-006)
feat(loading-states): Add skeletons to Workflows (FIX-007)
feat(loading-states): Add skeletons to Queue (FIX-008)
feat(empty-states): Expand EmptyState coverage (FIX-009)
docs(testing): Add keyboard testing procedure (FIX-010)
docs(testing): Add dark mode testing procedure (FIX-011)
docs(testing): Add performance testing procedure (FIX-012)
docs(testing): Add browser testing procedure (FIX-013)
docs(patterns): Update AGENTS.md patterns (FIX-014)
```

---

## Questions?

- **How long will this take?** 6-8 hours of autonomous execution
- **Will forms work correctly?** Yes, validation prevents bad submissions
- **Will testing actually happen?** No, Ralph documents procedures. Humans run tests.
- **Will the app still work?** Yes, all changes are additive (no breaking changes)
- **Can Ralph run tests?** No, Ralph creates documentation. Humans use it to test.

---

*Ready to start? Ralph will execute sequentially, one story per commit, pushing everything to git.*
