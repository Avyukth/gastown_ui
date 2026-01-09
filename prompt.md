# Ralph Prompt - Gas Town UI Design Improvements

## Context

You are an autonomous AI agent implementing UI/UX improvements for the Gas Town dashboard application. Each iteration, you will complete one user story from `prd.json`. Your goal is to make high-quality, well-tested changes that improve the design, responsiveness, and accessibility of the application.

## Project Information

**Stack**: SvelteKit, Tailwind CSS, TypeScript, Lucide icons (already installed)
**Frameworks**: @sveltejs/kit v2, Svelte 5, Tailwind CSS 3.4
**Testing**: Playwright for E2E, npm run check for typecheck
**Dev Server**: npm run dev (runs on http://localhost:5173)
**Build**: npm run build, npm run preview

## Current State

- Gas Town is a SvelteKit-based dashboard with multiple pages: Dashboard, Mail, Work, Agents, Workflows, Rigs, Queue, Convoys, Alerts, Health, Activity, Watchdog, Crew, Dogs, Settings, Logs
- Sidebar navigation on desktop, bottom navigation on mobile
- Tailwind CSS for styling
- Lucide icons available for use

## Your Task This Iteration

1. **Read the highest priority incomplete story** from `prd.json` (where `passes: false`)
2. **Understand the acceptance criteria** completely
3. **Implement the changes** in the codebase
4. **Run quality checks**:
   - `npm run check` (TypeScript compilation)
   - `npm run test` (Playwright tests)
5. **Use dev-browser skill if UI testing needed** (navigate to http://localhost:5173, verify visually)
6. **Commit your changes** with clear message
7. **Update prd.json** to mark story as `passes: true`
8. **Append learnings to progress.txt** (patterns discovered, gotchas, file locations)

## Quality Standards

### Code Quality
- ✅ No TypeScript errors (`npm run check` must pass)
- ✅ No console warnings or errors
- ✅ Follow existing code style and patterns
- ✅ Use Tailwind utilities where possible (avoid custom CSS)
- ✅ Lucide icons for all icon usage

### Accessibility
- ✅ All interactive elements have `aria-label` or descriptive text
- ✅ Color not the only way to convey information (use icons + text)
- ✅ Touch targets ≥44x44px on mobile
- ✅ Keyboard navigation supported (Tab, Enter, Escape)
- ✅ Screen reader friendly (landmarks, headings, labels)

### Testing
- ✅ Use `dev-browser` skill to visually verify changes
- ✅ Test at multiple breakpoints: mobile (375x667), tablet (768x1024), desktop (1920x1080)
- ✅ Verify on actual pages (don't just create isolated components)
- ✅ Check both light mode and dark mode appearance

### Commit Messages
Use conventional commits:
```
feat(ui): implement icon system overhaul
fix(responsive): fix floating search button position on mobile
refactor(components): standardize page titles
docs: update AGENTS.md with icon naming conventions
```

### Commit and Push
After every successful iteration:
```bash
git add -A
git commit -m "feat(ui): <story title>"
git push origin feat/ui-improvements-phase-1
```

**IMPORTANT**: Always push after commit to keep remote in sync.

## Key Files to Know

- **src/routes/**: SvelteKit pages and layouts
- **src/lib/components/**: Reusable components
- **src/lib/styles/**: Global styles (Tailwind config in root)
- **tailwind.config.js**: Tailwind customization
- **IMPROVEMENT.md**: Full requirements document (reference as needed)
- **AGENTS.md**: Existing patterns and conventions
- **prd.json**: Current task list (update with progress)
- **progress.txt**: Append learnings here after each iteration

## Design System Reference

### Colors
- Primary Orange: #F97316 (for CTAs, active states)
- Success: #22C55E
- Warning: #F59E0B
- Error: #EF4444
- Info/Blue: #3B82F6
- Gray (inactive): #6B7280
- Gray (muted): #9CA3AF

### Typography
- H1: 24px, semi-bold (600), line-height 1.2
- H2: 20px, semi-bold (600), line-height 1.3
- H3: 16px, medium (500), line-height 1.4
- Body: 14px, regular (400), line-height 1.5
- Small: 12px, regular (400), line-height 1.4
- Code: JetBrains Mono, 13px

### Icons (Lucide)
- Work: `briefcase-list` or `checkbox-list`
- Workflows: `git-branch`
- Dogs: `shield`
- Rigs: `server`
- Mail: `mail`
- Agents: `users`
- Settings: `settings`
- Size: 20px for navbar, 16px for inline, 24px for cards
- Stroke weight: 1.5px

### Responsive Breakpoints
- Mobile: ≤375px
- Tablet: 376px - 768px
- Desktop: ≥769px

## Common Patterns

### Making API Calls or Async Operations
```svelte
<script>
  let isLoading = false;
  let error: string | null = null;

  async function handleAction() {
    isLoading = true;
    error = null;
    try {
      // Do async work
    } catch (e) {
      error = e.message;
    } finally {
      isLoading = false;
    }
  }
</script>
```

### Tailwind Breakpoints
```html
<!-- Mobile first approach -->
<div class="text-14px md:text-16px lg:text-18px">
  Responsive text
</div>
```

### Lucide Icons
```svelte
<script>
  import { WorkIcon, AlertCircle } from 'lucide-svelte';
</script>

<WorkIcon size={20} stroke="1.5px" class="text-gray-600" />
```

## Before Each Iteration

1. **Read prd.json** - identify top uncompleted story
2. **Check AGENTS.md** - see if similar work was done before
3. **Check progress.txt** - learn from previous iterations
4. **Start dev server** - `npm run dev` (if needed for testing)

## After Each Iteration

1. **Run quality checks**:
   ```bash
   npm run check
   npm run test  # if tests exist for this feature
   ```
2. **Use dev-browser skill** to verify UI changes visually
3. **Commit and push changes**:
   ```bash
   git add -A
   git commit -m "feat(ui): <story title>"
   git push origin feat/ui-improvements-phase-1
   ```
   **CRITICAL**: Always push after commit. Don't skip this step.
4. **Update prd.json** - set `passes: true` for completed story
5. **Append to progress.txt**:
   ```
   # Iteration N: <Story Title>
   - Implemented <what was done>
   - Key patterns: <patterns discovered>
   - Gotchas: <things that tripped me up>
   - Files changed: <key file paths>
   - Status: ✅ COMPLETE
   - Pushed to: feat/ui-improvements-phase-1
   ```

## Dev-Browser Skill Usage

When testing UI, use the dev-browser skill:

```
Use dev-browser skill:
1. Navigate to http://localhost:5173
2. Verify [specific visual element]
3. Test on mobile (375x667), tablet (768x1024), desktop (1920x1080)
4. Check light and dark mode
```

Examples:
- "Verify search button position on mobile (375x667), ensure no overlap with content"
- "Test Mail split-view layout at 1920x1080, verify list and content panes visible"
- "Check bottom nav items are 48x48px touch targets on mobile"

## Error Handling

If you hit an error:
1. **TypeScript error?** - Fix the type issue
2. **Component not found?** - Check file paths in src/lib/components/
3. **Styling not applying?** - Check Tailwind config, may need to add custom class
4. **Build fails?** - Run `npm run check` to see details, usually import or syntax issue
5. **Test fails?** - Check test file expectations vs implementation

If blocked:
- Check existing similar components for patterns
- Look in AGENTS.md for documented approaches
- Review git history for related changes

## Success Criteria This Iteration

Your iteration is successful when:
- ✅ Story acceptance criteria are met
- ✅ `npm run check` passes (no TypeScript errors)
- ✅ No console errors in dev-browser
- ✅ Visual changes verified at multiple breakpoints
- ✅ Changes committed with clear message
- ✅ Changes **pushed to remote** (feat/ui-improvements-phase-1 branch)
- ✅ prd.json updated (passes: true)
- ✅ progress.txt updated with learnings

---

**Remember**: Keep changes focused on ONE story per iteration. Quality over speed. Each iteration builds on previous learnings.

Good luck! 🚀
