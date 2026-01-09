# 🚀 Launch Ralph - Gas Town UI Improvements

## Quick Start

```bash
cd /Users/amrit/Documents/Projects/Rust/mouchak/gastown_exp
./scripts/ralph/ralph.sh 20
```

That's it! Ralph will autonomously implement 32 UI improvements over 18-20 iterations.

---

## What Happens Next

Ralph will:

1. **Read** the next user story from `prd.json`
2. **Check** AGENTS.md for discovered patterns and conventions
3. **Review** progress.txt to learn from previous iterations
4. **Implement** the required changes in the codebase
5. **Test** by running `npm run check` (TypeScript compilation)
6. **Verify** visually using the dev-browser skill
7. **Commit** changes with a descriptive message
8. **Update** prd.json (marks story as `passes: true`)
9. **Document** learnings in progress.txt
10. **Repeat** for next story until all 32 are complete

---

## Monitoring Progress

### View Next Tasks
```bash
cat prd.json | jq '.userStories[] | select(.passes == false) | {id, title, priority}' | head -10
```

### View Completed Tasks
```bash
cat prd.json | jq '.userStories[] | select(.passes == true) | {id, title}'
```

### Check Recent Commits
```bash
git log --oneline -10
```

### View Latest Learnings
```bash
tail -50 progress.txt
```

### Overall Progress
```bash
echo "Completed: $(cat prd.json | jq '.userStories[] | select(.passes == true) | .id' | wc -l) / 32"
```

---

## Project Structure

```
gastown_exp/
├── prd.json                    # 32 user stories with acceptance criteria
├── prompt.md                   # Instructions for Ralph each iteration
├── progress.txt                # Knowledge base & learnings
├── README_RALPH.md             # Full documentation
├── LAUNCH.md                   # This file
├── IMPROVEMENT.md              # Original 1845-line design spec
├── AGENTS.md                   # Updated continuously with patterns
├── scripts/
│   └── ralph/
│       ├── ralph.sh            # The autonomous loop (executable)
│       ├── prompt.md           # Ralph's instructions
│       └── prompt.md.template  # Original template for reference
└── [other project files]
```

---

## The 4 Phases

### Phase 1: Critical Foundation (3-4 iterations)
- Fix floating search button position on mobile
- Hide sidebar on mobile, implement drawer
- Increase bottom nav touch targets
- Loading states & skeleton loaders
- Responsive layout bug fixes

### Phase 2: Design System (4 iterations)
- Icon system overhaul (Lucide)
- Page title standardization
- Color system enhancement
- Typography scale implementation
- Remove background dot patterns

### Phase 3: Component Improvements (8 iterations)
- Agent cards enhancement
- Work page form layout
- CTA button enhancement
- Issue type selection
- Workflow progress visualization
- Stats cards with sparklines
- Agents page card redesign
- Mail split-view layout
- Unread indicators
- Error states
- Empty states
- Compose button visibility

### Phase 4: Polish & Testing (5 iterations)
- Bottom nav "More" menu slide-up
- Touch target sizing audit
- Terminology consistency
- Haptic feedback for mobile
- Gesture support (swipe, pull-to-refresh)
- Keyboard navigation testing
- Dark mode verification
- Performance verification
- Cross-browser testing
- AGENTS.md documentation updates

---

## Manual Controls

### Pause/Resume
Ralph automatically saves progress. Use Ctrl+C to stop, then run again:
```bash
./scripts/ralph/ralph.sh 20  # Resumes where it left off
```

### Check Status Without Running
```bash
# See which stories are done
cat prd.json | jq '.userStories | map({id, passes}) | group_by(.passes) | map({completed: .[0].passes, count: length})'

# Get summary
cat prd.json | jq '{totalStories: (.userStories | length), completedCount: (.userStories | map(select(.passes == true)) | length)}'
```

### View Specific Story
```bash
cat prd.json | jq '.userStories[] | select(.id == "UI-001")'
```

### Check Build Status
```bash
npm run check  # TypeScript check
npm run test   # Run tests
```

---

## Expected Outcomes

After ralph completes all 32 stories:

✅ **Mobile Responsive**
- Floating search button positioned correctly
- Sidebar transforms to drawer on mobile
- Bottom nav touch targets properly sized
- All content responsive at 375px, 768px, 1920px+

✅ **Design System**
- Unified icon system (Lucide, 20px, 1.5px stroke)
- Consistent page titles (Title Case, proper sizing)
- Color system applied globally (orange CTA, green success, red error, blue info)
- Typography scale implemented and used

✅ **Components**
- Agent cards with visual hierarchy and role colors
- Work form with proper layout and required field indicators
- CTA buttons with hover/active/loading/disabled states
- Workflow progress with circular indicators
- Stats cards with sparklines
- Mail split-view on desktop
- Empty states on all pages
- Error states with retry buttons

✅ **Mobile UX**
- Gesture support (swipe, pull-to-refresh)
- Haptic feedback on actions
- "More" menu as slide-up sheet
- Touch targets ≥44x44px everywhere

✅ **Quality**
- Full keyboard navigation support
- Screen reader friendly
- WCAG AA contrast compliance
- Cross-browser tested (Chrome, Safari, Firefox, mobile)
- Performance verified (load time <3s)
- All changes documented in AGENTS.md

---

## Troubleshooting

### Ralph Seems Stuck
- Check `progress.txt` for iteration notes
- Run `npm run check` to see any TypeScript errors
- Review latest git commits to see what was done

### Build Fails
- Ralph will skip to next story if quality gates fail
- Run `npm run check` manually to debug
- Check console for specific error messages

### Want to Review Changes
```bash
git log --oneline -20  # See recent commits
git diff HEAD~5 HEAD   # See changes from last 5 commits
git status             # See current changes
```

### Stop Ralph Early
```bash
Ctrl+C  # Safe to interrupt, progress is saved
```

### Resume Later
```bash
./scripts/ralph/ralph.sh 20  # Picks up where it left off
```

---

## Key Documentation

- **README_RALPH.md** - Complete overview and phases
- **prompt.md** - Ralph's instructions (used each iteration)
- **progress.txt** - Growing knowledge base of patterns and learnings
- **IMPROVEMENT.md** - Original 1845-line requirements document
- **AGENTS.md** - Updated with discovered patterns (auto-maintained)

---

## Questions?

Refer to:
- `prompt.md` - Ralph's instructions
- `README_RALPH.md` - Full documentation
- `IMPROVEMENT.md` - Original requirements
- `progress.txt` - Previous iteration learnings

---

**Status**: ✅ Ready to launch

**Run this now**:
```bash
cd /Users/amrit/Documents/Projects/Rust/mouchak/gastown_exp
./scripts/ralph/ralph.sh 20
```

Ralph will handle the rest! 🎉
