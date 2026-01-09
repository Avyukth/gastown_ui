# Ralph Autonomous Implementation - Gas Town UI Improvements

## 🎯 Mission
Implement 32 UI/UX improvements from IMPROVEMENT.md autonomously using ralph agent loop.

## 📊 Project Stats
- **Total Stories**: 32
- **Completed**: 0
- **Estimated Duration**: 18-20 iterations (~2-3 weeks autonomous development)
- **Phase Breakdown**:
  - Phase 1 (Critical): 4 stories - Mobile responsive fixes
  - Phase 2 (Design System): 4 stories - Icons, colors, typography
  - Phase 3 (Components): 8 stories - Cards, forms, buttons, etc.
  - Phase 4 (Polish): 12 stories - Gestures, accessibility, testing, dark mode
  - Continuous: Documentation updates

## 🚀 Execution Plan

### Phase 1: Critical Foundation (Iterations 1-3)
1. **UI-001**: Fix floating search button position
2. **UI-002**: Hide sidebar on mobile, implement drawer
3. **UI-003**: Increase bottom nav touch targets
4. **UI-020**: Loading states & skeleton loaders
5. **UI-023**: Fix responsive layout/content overflow

### Phase 2: Design System (Iterations 4-7)
6. **UI-004**: Icon system overhaul (Lucide)
7. **UI-005**: Page title standardization
8. **UI-006**: Color system enhancement
9. **UI-007**: Typography scale
10. **UI-017**: Remove dot patterns

### Phase 3: Component Building (Iterations 8-15)
11. **UI-008**: Agent cards enhancement
12. **UI-009**: Work form layout
13. **UI-010**: CTA button enhancement
14. **UI-011**: Issue type selection
15. **UI-012**: Workflow progress visualization
16. **UI-013**: Stats cards with sparklines
17. **UI-014**: Agents page card redesign
18. **UI-015**: Mail split-view layout
19. **UI-016**: Unread indicators
20. **UI-021**: Error states
21. **UI-022**: Empty states
22. **UI-027**: Compose button visibility

### Phase 4: Polish & Testing (Iterations 16-20)
23. **UI-018**: Bottom nav "More" menu
24. **UI-019**: Touch target sizing audit
25. **UI-024**: Terminology consistency
26. **UI-025**: Haptic feedback
27. **UI-026**: Gesture support
28. **UI-028**: Keyboard navigation testing
29. **UI-029**: Dark mode verification
30. **UI-030**: Performance verification
31. **UI-031**: Cross-browser testing
32. **UI-032**: AGENTS.md documentation

## 📁 Files

### Configuration
- `prd.json` - Full task list with acceptance criteria
- `prompt.md` - Ralph instructions for each iteration
- `progress.txt` - Knowledge base & learnings
- `scripts/ralph/ralph.sh` - The autonomous loop

### Reference
- `IMPROVEMENT.md` - Original design requirements (1845 lines)
- `AGENTS.md` - Discovered patterns (updated continuously)
- `README_RALPH.md` - This file

## 🎛️ Controls

### Start Ralph Loop
```bash
# Run up to 20 iterations
./scripts/ralph/ralph.sh 20

# Or run with custom iteration limit
./scripts/ralph/ralph.sh 15
```

### Monitor Progress
```bash
# View current task status
cat prd.json | jq '.userStories[] | {id, title, passes}' | grep -A2 'passes'

# View completed stories
cat prd.json | jq '.userStories[] | select(.passes == true) | {id, title}'

# View next tasks
cat prd.json | jq '.userStories[] | select(.passes == false) | {id, title, priority}' | head -20

# Check learnings
tail -50 progress.txt
```

### Manual Inspection
```bash
# Check git commits
git log --oneline -10

# Review specific story
cat prd.json | jq '.userStories[] | select(.id == "UI-001")'

# Check build status
npm run check
npm run test
```

## ✅ Quality Gates

Each iteration must:
- ✅ Pass `npm run check` (0 TypeScript errors)
- ✅ Pass `npm run test` (if tests exist)
- ✅ Verify visually with dev-browser skill
- ✅ Update prd.json (mark `passes: true`)
- ✅ Commit changes with descriptive message
- ✅ Document in progress.txt

## 🔍 Key Patterns Documented

### Icons (Lucide)
- All icons 20px, 1.5px stroke
- Work: briefcase-list, Workflows: git-branch, Dogs: shield, Rigs: server
- Active: #F97316 orange, Inactive: #6B7280 gray

### Colors
- CTA: #F97316, Success: #22C55E, Error: #EF4444, Info: #3B82F6
- All color choices use Tailwind utilities (text-orange-500, etc.)

### Responsive
- Mobile-first: base styles for mobile, md: for tablet, lg: for desktop
- Breakpoints: mobile ≤375px, tablet 376-768px, desktop ≥769px

### Accessibility
- Touch targets ≥44x44px, contrast ≥4.5:1, keyboard nav, aria-labels
- Screen reader friendly with landmarks and semantic HTML

## 📈 Expected Outcomes

After all iterations:
- ✅ Mobile-responsive layout working perfectly
- ✅ Icon system unified and consistent
- ✅ Color system enhanced and applied globally
- ✅ Typography scale implemented
- ✅ All major components redesigned with visual polish
- ✅ Full accessibility support (keyboard, screen reader, touch)
- ✅ Mobile UX with gestures and haptics
- ✅ Comprehensive test coverage
- ✅ Cross-browser compatibility verified
- ✅ Performance benchmarks met
- ✅ AGENTS.md fully updated for future maintenance

## 🎓 Learning Mechanism

Each iteration:
1. Ralph reads prd.json for next story
2. Checks AGENTS.md for patterns
3. Reads progress.txt for learnings
4. Implements changes
5. Tests thoroughly
6. Commits with clear message
7. Updates prd.json and progress.txt

This creates a feedback loop where each iteration builds on previous discoveries.

## 🛑 Stopping Conditions

Ralph will stop when:
- All user stories have `passes: true`
- Output contains `<promise>COMPLETE</promise>`
- Manual stop: `Ctrl+C`

---

**Status**: Ready to launch ✅
**Next Step**: Run `./scripts/ralph/ralph.sh 20` to begin autonomous implementation
**Estimated Timeline**: 2-3 weeks for full completion
