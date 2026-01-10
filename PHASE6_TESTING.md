# Phase 6 Testing & Verification

**Date**: January 10, 2026  
**Focus**: Dark Mode Verification, WCAG AA Compliance, Responsive Design

---

## Testing Methodology

This document outlines comprehensive testing procedures for Phase 6, verifying that all pages meet quality standards for dark mode, accessibility, and responsive design.

---

## 6.2 Dark Mode Verification Testing

### Pages to Test
1. Dashboard (/)
2. Mail (/mail)
3. Agents (/agents)
4. Agent Detail (/agents/[id])
5. Work (/work)
6. Queue (/queue)
7. Convoys (/convoys)
8. Workflows (/workflows)
9. Rigs (/rigs)
10. Escalations (/escalations)
11. Health (/health)
12. Activity (/activity)
13. Watchdog (/watchdog)
14. Crew (/crew)
15. Dogs (/dogs)
16. Seance (/seance)
17. Stats (/stats)
18. Logs (/logs)
19. Settings (/settings)

### Dark Mode Testing Checklist

#### Color Contrast
- [ ] All body text: 4.5:1 minimum contrast ratio
- [ ] All UI components: 3:1 minimum contrast ratio
- [ ] All links: 4.5:1 minimum contrast ratio
- [ ] All form labels: 4.5:1 minimum contrast ratio
- [ ] All button text: 4.5:1 minimum contrast ratio
- [ ] All status colors visible in dark mode

**Testing Tools**:
- WAVE (Firefox/Chrome extension)
- axe DevTools (Firefox/Chrome extension)
- macOS built-in contrast checker

#### Status Colors in Dark Mode
```
Status Colors to Verify:
- Success (green): #22C55E -> dark variant
- Warning (amber): #F59E0B -> dark variant
- Error (red): #EF4444 -> dark variant
- Info (blue): #3B82F6 -> dark variant
- Neutral/Muted: #6B7280 -> dark variant
```

Each should be:
- Visible against dark background
- Distinguishable from other colors
- At least 3:1 contrast
- Semantically meaningful (can't rely on color alone)

#### Badge Colors
- [ ] Issue type badges (task/bug/feature/epic) visible
- [ ] Status badges (active/pending/complete) visible
- [ ] Priority badges (P0/P1/P2/P3/P4) visible
- [ ] Role badges (coordinator/health-check/witness) visible
- [ ] Type badges (workflow/convoy/aspect) visible

#### Icon Colors
- [ ] All icons visible in dark mode
- [ ] Type-specific icon colors distinguishable
- [ ] Status icons (running/idle/error) clear
- [ ] Action icons (edit/delete/save) clear

#### Card & Container Colors
- [ ] Card backgrounds appropriate for dark mode
- [ ] Panel glass effect visible
- [ ] Borders visible (not too dark, not too light)
- [ ] Hover states distinguishable
- [ ] Focus rings visible (at least 2px, high contrast)

#### Form Elements
- [ ] Input backgrounds readable
- [ ] Input text readable
- [ ] Placeholder text visible but muted
- [ ] Focus state clear (ring-2 with distinct color)
- [ ] Error states red and readable
- [ ] Success states green and readable
- [ ] Disabled state gray and distinguishable

#### Data Tables & Lists
- [ ] Row alternation visible (if used)
- [ ] Text color sufficient contrast
- [ ] Cell borders visible
- [ ] Hover highlighting visible
- [ ] Selected state clearly marked

#### Progress Indicators
- [ ] Progress bars visible
- [ ] Status dots animate properly
- [ ] Percentage text readable
- [ ] Circular progress markers clear

#### Navigation Elements
- [ ] Sidebar items readable
- [ ] Active nav item highlighted
- [ ] Hover states visible
- [ ] Icons clear
- [ ] Bottom nav items readable on mobile

### Dark Mode Testing Process

**Step 1: Enable System Dark Mode**
- macOS: System Preferences > General > Dark
- Windows: Settings > Personalization > Colors > Dark
- Linux: System Settings > Appearance > Dark

**Step 2: Test Each Page**
```bash
npm run dev
# Visit http://localhost:5173
# Enable dark mode in browser or system
# Check each page visually
```

**Step 3: Run Automated Tools**
- Open browser DevTools
- Install WAVE extension
- Run WAVE scan on each page
- Check for contrast violations (record count)

**Step 4: Use axe DevTools**
- Install axe DevTools extension
- Run scan (Scan ALL OF MY PAGE)
- Filter: Contrast
- Record any violations (should be 0)

**Step 5: Verify Color Contrast Manually**
- Use browser's color picker
- Measure contrast ratio for critical text
- Use online contrast calculator: https://webaim.org/resources/contrastchecker/

### Dark Mode Test Results Template

```
Page: [Page Name]
URL: [URL]
Dark Mode Status: PASS / FAIL

Contrast Checks:
- Body text (4.5:1): PASS/FAIL
- Links (4.5:1): PASS/FAIL
- Buttons (4.5:1): PASS/FAIL
- Form labels (4.5:1): PASS/FAIL
- UI components (3:1): PASS/FAIL

Status Colors:
- Green (success): PASS/FAIL
- Red (error): PASS/FAIL
- Amber (warning): PASS/FAIL
- Blue (info): PASS/FAIL

WAVE Results:
- Errors: [count]
- Contrast errors: [count]

axe Results:
- Critical issues: [count]
- Contrast violations: [count]

Notes:
[Any observations or issues found]
```

---

## 6.3 WCAG AA Accessibility Verification

### Testing Approach

#### Keyboard Navigation Testing

**Test Coverage**:
- [ ] All interactive elements reachable via Tab
- [ ] Logical tab order (left-to-right, top-to-bottom)
- [ ] No keyboard traps (focus can escape from any element)
- [ ] Focus indicator visible on all focusable elements
- [ ] Enter/Space activate buttons and links
- [ ] Escape closes modals and dropdowns

**Testing Process**:
1. Disconnect mouse or use keyboard-only mode
2. Tab through entire page
3. Verify focus order is logical
4. Try to activate buttons/links with Space or Enter
5. Verify focus indicator is visible (ring or outline)
6. Test Escape key on modals/dropdowns

**Keyboard Shortcuts to Test**:
- Tab: Move focus forward
- Shift+Tab: Move focus backward
- Enter: Activate buttons/links
- Space: Activate buttons/links, toggle checkboxes
- Escape: Close modals/dropdowns/menus
- Cmd/Ctrl+K: Global search (if implemented)

#### Screen Reader Testing

**Tools**:
- macOS: VoiceOver (built-in)
- Windows: NVDA (free, https://www.nvaccess.org/)
- Firefox: Built-in screen reader testing

**Test Coverage**:
- [ ] Page title announced
- [ ] Headings announced with level (h1, h2, h3)
- [ ] Form labels associated with inputs
- [ ] Icon buttons have aria-labels
- [ ] Status indicators have aria-live regions
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Links have meaningful text (not "click here")
- [ ] Lists use semantic list elements
- [ ] Landmarks (header, nav, main) used

**VoiceOver Testing on Mac**:
```bash
# Enable VoiceOver
Cmd+F5 (or System Preferences > Accessibility > VoiceOver)

# Navigate page
VO=Control+Option (for quick reference)
VO+U: Rotor (jump to headings, links, etc.)
VO+Right Arrow: Move forward
VO+Left Arrow: Move backward
VO+Space: Activate
```

**NVDA Testing on Windows**:
```bash
# Start NVDA
# Use Insert+H for help
# Use Tab to navigate
# Use Insert+M to toggle mouse mode
```

#### Color Contrast Verification

**Tool**: WAVE or axe DevTools

**Verification**:
- [ ] All text: 4.5:1 contrast ratio minimum
- [ ] UI components: 3:1 contrast ratio minimum
- [ ] No information conveyed by color alone
- [ ] Links distinguishable from regular text (not just color)
- [ ] Form errors clearly indicated (not just red)

**Testing**:
1. Open WAVE in Firefox/Chrome
2. Check each page for contrast violations
3. Document count of violations (should be 0)
4. If violations found, fix or document as known issue

#### Focus Management Testing

**Verification**:
- [ ] Focus visible on all focusable elements
- [ ] Focus outline at least 2px thick
- [ ] Focus outline has at least 3:1 contrast
- [ ] Focus not hidden by other elements
- [ ] Modal dialog traps focus properly
- [ ] Focus returns to trigger element after modal closes

**Focus Indicator Styles** (should be visible):
```css
:focus-visible {
  outline: 2px solid;
  outline-offset: 2px;
  /* Should have high contrast with background */
}
```

#### Semantic HTML Testing

**Verification**:
- [ ] Proper heading hierarchy (h1 → h2 → h3, no skipping)
- [ ] Lists use `<ul>`, `<ol>`, `<li>`
- [ ] Buttons are `<button>` elements (not `<div>` or `<a>`)
- [ ] Links are `<a>` elements (not `<button>` or `<span>`)
- [ ] Form controls use `<input>`, `<textarea>`, `<select>`
- [ ] Form labels use `<label for="...">` with matching id
- [ ] Data tables use `<table>`, `<thead>`, `<tbody>`, `<th>`
- [ ] Navigation uses `<nav>` landmark
- [ ] Main content uses `<main>` landmark
- [ ] Regions have `role="region"` with aria-label

#### ARIA Labels Testing

**Verification**:
- [ ] Icon buttons have `aria-label`
- [ ] Form required fields have `aria-required="true"`
- [ ] Loading indicators have `aria-busy="true"`
- [ ] Status updates have `aria-live="polite"`
- [ ] Dialogs have `aria-modal="true"`
- [ ] Error messages have `aria-live="assertive"`
- [ ] Expandable sections have `aria-expanded`
- [ ] Disabled elements have `aria-disabled="true"` if not native disabled

### WCAG AA Accessibility Checklist

```
Page: [Page Name]
URL: [URL]
Accessibility Status: PASS / FAIL / NEEDS REVIEW

1. Keyboard Navigation
   - All interactive elements reachable: PASS/FAIL
   - Tab order logical: PASS/FAIL
   - No keyboard traps: PASS/FAIL
   - Focus indicator visible: PASS/FAIL
   - Enter/Space work on buttons: PASS/FAIL
   - Escape closes modals: PASS/FAIL

2. Screen Reader Support
   - Page title announced: PASS/FAIL
   - Headings announced: PASS/FAIL
   - Form labels associated: PASS/FAIL
   - Icon buttons labeled: PASS/FAIL
   - Links have meaningful text: PASS/FAIL
   - Lists semantic: PASS/FAIL
   - Landmarks present: PASS/FAIL

3. Color & Contrast
   - Text contrast (4.5:1): PASS/FAIL
   - UI contrast (3:1): PASS/FAIL
   - No color-only info: PASS/FAIL
   - Links distinguishable: PASS/FAIL
   - Focus indicator contrast: PASS/FAIL

4. Semantic HTML
   - Heading hierarchy correct: PASS/FAIL
   - Lists semantic: PASS/FAIL
   - Buttons are buttons: PASS/FAIL
   - Links are links: PASS/FAIL
   - Form labels present: PASS/FAIL

5. ARIA Labels
   - Icon buttons labeled: PASS/FAIL
   - Required fields marked: PASS/FAIL
   - Status updated announced: PASS/FAIL
   - Error messages announced: PASS/FAIL
   - Dialogs marked as modal: PASS/FAIL

Overall Status: WCAG AA PASS / WCAG AA FAIL
Issues Found: [List any issues]
```

---

## 6.4 Responsive Design Verification

### Viewport Sizes to Test

| Size | Device | Orientation | Notes |
|------|--------|-------------|-------|
| 320px | iPhone SE | Portrait | Smallest mobile |
| 375px | iPhone 12 | Portrait | Standard mobile |
| 768px | iPad | Portrait | Tablet |
| 1024px | iPad Pro | Landscape | Large tablet |
| 1440px+ | Desktop | Landscape | Full desktop |

### Responsive Testing Checklist

#### Mobile (320px, 375px)
- [ ] No horizontal scroll at any viewport
- [ ] Text readable without zoom
- [ ] Touch targets 44px+ minimum
- [ ] Images scale proportionally
- [ ] Navigation accessible (sidebar hidden, drawer works)
- [ ] Forms easy to complete (labels above inputs)
- [ ] Buttons stacked vertically if multiple
- [ ] List items full width
- [ ] Tables have horizontal scroll or alternative

#### Tablet (768px)
- [ ] Layout adapts to tablet size
- [ ] Sidebar behavior correct (visible or drawer)
- [ ] Two-column layouts work
- [ ] Touch targets adequate
- [ ] Font sizes readable
- [ ] Images display correctly

#### Desktop (1024px+)
- [ ] Multi-column layouts work
- [ ] Sidebar visible (if applicable)
- [ ] Optimal line length (60-80 chars)
- [ ] Whitespace balanced
- [ ] Hover states work
- [ ] Navigation clear

### Responsive Testing Process

**Using Chrome DevTools**:
1. Open DevTools (Cmd/Ctrl+Shift+I)
2. Click device toggle (Cmd/Ctrl+Shift+M)
3. Select device or custom size
4. Test each page at each size
5. Document any issues

**Manual Testing**:
1. Resize browser window to test sizes
2. Test on actual devices if available
3. Test orientation changes on mobile
4. Test zoom up to 200% (text should reflow, not overflow)

### Responsive Test Results Template

```
Page: [Page Name]
URL: [URL]
Responsive Status: PASS / FAIL

Viewport Testing:
- 320px: PASS/FAIL [notes]
- 375px: PASS/FAIL [notes]
- 768px: PASS/FAIL [notes]
- 1024px: PASS/FAIL [notes]
- 1440px: PASS/FAIL [notes]

Issues Found:
- [Issue 1]
- [Issue 2]
```

---

## Test Execution Plan

### Phase 6.2: Dark Mode Verification
**Duration**: 1.5 hours
**Steps**:
1. Enable system dark mode
2. Visit each of 19 pages
3. Check visual appearance
4. Run WAVE scan (record errors)
5. Run axe scan (record violations)
6. Document results in spreadsheet

### Phase 6.3: WCAG AA Verification
**Duration**: 1.5 hours
**Steps**:
1. Test keyboard navigation on each page
2. Test with VoiceOver (Mac) or NVDA (Windows)
3. Check color contrast with WAVE/axe
4. Verify semantic HTML structure
5. Check ARIA labels
6. Document results

### Phase 6.4: Responsive Design Verification
**Duration**: 1 hour
**Steps**:
1. Test each page at 5 viewport sizes
2. Check for horizontal scroll
3. Verify touch targets
4. Check text readability
5. Document any responsive issues

---

## Success Criteria

### Dark Mode
- [ ] 0 contrast violations on all pages (WAVE/axe)
- [ ] All status colors visible and distinguishable
- [ ] All badges readable
- [ ] All form elements readable
- [ ] All navigation elements visible

### WCAG AA
- [ ] Full keyboard navigation on all pages
- [ ] Screen reader announces all content correctly
- [ ] 0 color contrast violations
- [ ] All semantic HTML correct
- [ ] All ARIA labels present where needed

### Responsive
- [ ] No horizontal scroll on any viewport
- [ ] Touch targets 44px+ on mobile
- [ ] Text readable without zoom
- [ ] Layout adapts correctly at breakpoints
- [ ] Navigation works on all sizes

---

## Test Results Summary

To be completed after testing:

| Page | Dark Mode | WCAG AA | Responsive | Status |
|------|-----------|---------|-----------|--------|
| Dashboard | PASS | PASS | PASS | ✅ |
| Mail | | | | |
| Agents | | | | |
| [etc] | | | | |

---

*Phase 6 Testing Plan - January 10, 2026*
