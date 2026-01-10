# Phase 7 Testing & Verification Procedures

**Date**: January 10, 2026  
**Focus**: Performance optimization, bundle analysis, Core Web Vitals, advanced features

---

## Testing Methodology

This document outlines comprehensive testing procedures for Phase 7, verifying that all performance optimizations and advanced features meet quality standards.

---

## 7.1 Performance Testing

### Bundle Analysis Testing

#### Objective
Understand current bundle composition and track optimization progress

#### Tools
- `npm run analyze` - Visualize bundle with rollup-plugin-visualizer
- Chrome DevTools Network tab
- Lighthouse
- WebPageTest

#### Procedure

**Step 1: Generate Bundle Analysis**
```bash
npm run analyze
# Opens visualization in browser
# Shows:
# - Total bundle size
# - Per-file/per-module sizes
# - Dependencies and their sizes
# - Duplicate dependencies
```

**Step 2: Baseline Measurements**

Before optimization:
```
Metrics to Record:
- Main bundle size (unminified, minified, gzipped)
- CSS bundle size
- JS bundle size
- Number of dependencies
- Duplicate dependencies count
```

Create baseline.json:
```json
{
  "timestamp": "2026-01-10",
  "bundles": {
    "main_js": "150KB (gzipped)",
    "main_css": "85KB (gzipped)",
    "total": "235KB (gzipped)"
  }
}
```

**Step 3: Identify Optimization Opportunities**

In bundle visualization:
- [ ] Identify bundles >100KB (should be split)
- [ ] Look for duplicate dependencies
- [ ] Find unused code paths
- [ ] Check for duplicate CSS
- [ ] Review third-party library sizes

**Step 4: Track Post-Optimization**

After implementing optimizations:
```bash
npm run analyze
# Compare with baseline
# Expected: 30-40% reduction
```

#### Acceptance Criteria
- [ ] Bundle analysis generated
- [ ] Baseline measurements recorded
- [ ] Opportunities documented
- [ ] Post-optimization analysis shows ≥30% reduction

---

### Core Web Vitals Testing

#### Objective
Measure Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS)

#### Tools
- Google Lighthouse
- Chrome DevTools Performance tab
- WebPageTest (free tool)
- Actual device testing

#### LCP Testing (Largest Contentful Paint)

**Target**: <2.5s

**Procedure**:

1. **Lighthouse Audit**
   ```bash
   # Open DevTools (F12)
   # Lighthouse tab
   # Generate report
   # Check "Largest Contentful Paint" metric
   ```

2. **Mobile Simulation**
   ```
   - Set throttling to "Slow 4G"
   - Set CPU throttle to "4x slowdown"
   - Run audit on each page
   ```

3. **Real Device Testing**
   - Test on actual mobile device (iPhone/Android)
   - Visit site on 3G/4G connection
   - Measure using browser DevTools
   - Record screenshots at key moments

4. **Per-Page Testing**
   - [ ] Dashboard: LCP <2.5s
   - [ ] Mail: LCP <2.5s
   - [ ] Agents: LCP <2.5s
   - [ ] Work: LCP <2.5s
   - [ ] [All 19 pages] LCP <2.5s

**Record Results**:
```
Page: Dashboard
LCP: 1.8s (✅ PASS)
Viewport: 375px (mobile)
Network: Slow 4G
Device: Simulated iPhone 12
```

#### FID Testing (First Input Delay)

**Target**: <100ms

**Procedure**:

1. **Interactive Testing**
   - Open page in Chrome
   - Open DevTools > Performance tab
   - Record interaction: click button, type in input, navigate
   - Check "Event Timing" in performance graph
   - FID = time before first input processed

2. **Common Interactions to Test**
   - [ ] Click navigation item
   - [ ] Click button
   - [ ] Type in search/form input
   - [ ] Click modal close button
   - [ ] Toggle sidebar

3. **Mobile Testing**
   - Test on actual device
   - Simulate slow CPU
   - Measure interaction response time

**Record Results**:
```
Page: Work
Interaction: Click "Create Issue" button
FID: 45ms (✅ PASS)
Device: iPhone 12
Network: 4G
```

#### CLS Testing (Cumulative Layout Shift)

**Target**: <0.1

**Procedure**:

1. **Lighthouse Audit**
   - Run Lighthouse report
   - Check CLS score
   - Review "Cumulative Layout Shift" metric

2. **Manual Testing**
   - Load page and watch for layout changes
   - Scroll through entire page
   - Check if content shifts unexpectedly
   - Common issues:
     - Images loading and pushing content down
     - Ads or injected content
     - Font loading
     - Sidebar/navigation appearing

3. **Per-Page Testing**
   - [ ] Dashboard: No unexpected shifts
   - [ ] Mail: No shifts during content load
   - [ ] Forms: No shifts on input interaction
   - [ ] Modals: No shifts on open/close
   - [ ] [All 19 pages] CLS <0.1

**Record Results**:
```
Page: Dashboard
CLS: 0.08 (✅ PASS)
Issues: None observed
```

#### Overall Lighthouse Score

**Target**: ≥90 on all pages

**Procedure**:

1. **Run Full Audit**
   ```
   - Open DevTools > Lighthouse
   - Select "Mobile" device
   - Generate report
   - Note: Performance, Accessibility, Best Practices, SEO
   ```

2. **Desktop Audit**
   ```
   - Run again with "Desktop" device
   - Compare with mobile
   ```

3. **Per-Page Audit**
   - [ ] Dashboard: ≥90
   - [ ] Mail: ≥90
   - [ ] Agents: ≥90
   - [ ] Work: ≥90
   - [ ] [All 19 pages]: ≥90

**Record Results**:
```
Page: Dashboard
Performance: 92 ✅
Accessibility: 98 ✅
Best Practices: 95 ✅
SEO: 100 ✅
Overall: 96 ✅
```

---

## 7.2 Code Splitting Testing

### Route-Based Code Splitting

#### Objective
Verify that route bundles are generated and lazy-loaded correctly

#### Procedure

1. **Check Bundle Files**
   ```bash
   # Build and check output
   npm run build
   # Look in build/ directory for:
   # - _app.* (main app bundle)
   # - _page.*.js (per-route bundles)
   ```

2. **Verify Network Requests**
   ```
   - Open DevTools > Network tab
   - Navigate between pages
   - Each route should load its own chunk
   - Chunks should load only when needed
   ```

3. **Test Each Route**
   - [ ] / (Dashboard): Loads _page.*.js
   - [ ] /mail: Loads mail route bundle
   - [ ] /agents: Loads agents route bundle
   - [ ] /work: Loads work route bundle
   - [ ] [All routes]: Load their bundles

4. **Performance Check**
   - Initial page load: <2.5s
   - Route navigation: <500ms
   - No duplicate chunks loaded

#### Acceptance Criteria
- [ ] Route bundles generated
- [ ] Each route loads its own chunk
- [ ] No duplicate chunks
- [ ] Navigation performance acceptable

---

### Component Lazy Loading

#### Objective
Verify heavy components are lazy-loaded

#### Components to Test
- WorkflowModal
- MailSplitView (if split into components)
- ActivityFeed (if heavy)

#### Procedure

1. **Check Component Loading**
   ```
   - Open DevTools > Performance tab
   - Navigate to page with lazy component
   - Don't interact with component yet
   - Verify component bundle NOT loaded
   - Interact with component (click button to open modal)
   - Verify component bundle NOW loaded
   ```

2. **Test Loading State**
   - [ ] Loading skeleton shows while component loads
   - [ ] Component appears smoothly
   - [ ] No layout shift when component loads
   - [ ] Functionality works correctly

3. **Per-Component Testing**
   - [ ] Workflows modal lazy loads
   - [ ] Mail components lazy load (if applicable)
   - [ ] Activity components lazy load (if applicable)

#### Acceptance Criteria
- [ ] Heavy components lazy-loaded
- [ ] Loading states visible
- [ ] No performance regression
- [ ] Functionality maintained

---

## 7.3 Animation Testing

### Page Transition Animations

#### Objective
Verify page transitions are smooth and perform well

#### Procedure

1. **Visual Testing**
   ```
   - Navigate between pages
   - Observe transition smoothness
   - Check fade-in/fade-out timing
   - Verify no jank or stuttering
   ```

2. **Performance Testing**
   ```
   - DevTools > Performance tab
   - Record navigation between pages
   - Check frame rate (should be 60fps)
   - Look for dropped frames
   ```

3. **Accessibility Testing**
   ```
   - Test with prefers-reduced-motion enabled
   - Animations should be disabled
   - Page should still load/work correctly
   ```

4. **Per-Page Testing**
   - [ ] Dashboard → Mail: Transition smooth
   - [ ] Mail → Agents: Transition smooth
   - [ ] Agents → Work: Transition smooth
   - [ ] [All navigation]: Transitions smooth

**Record Results**:
```
Navigation: Dashboard → Mail
Animation: Fade (0.3s)
Frame Rate: 60fps ✅
With reduced-motion: Disabled ✅
```

#### Acceptance Criteria
- [ ] Transitions smooth (60fps)
- [ ] No frame drops
- [ ] Reduced motion respected
- [ ] Performance maintained

---

### Skeleton & Loading Animations

#### Objective
Verify loading state animations are smooth

#### Procedure

1. **Visual Testing**
   ```
   - Navigate to page with loading state
   - Observe skeleton animation
   - Check pulse/shimmer effect
   - Verify content fade-in
   ```

2. **Animation Smoothness**
   ```
   - DevTools > Performance tab
   - Record skeleton animation
   - Frame rate should be 60fps
   - Animation should be smooth
   ```

3. **Per-Component Testing**
   - [ ] Dashboard skeletons: Smooth pulse
   - [ ] Work skeletons: Smooth pulse
   - [ ] Mail skeletons: Smooth pulse
   - [ ] [All SkeletonCard]: Smooth animation

**Record Results**:
```
Component: SkeletonCard (work)
Animation: Pulse with shimmer
Frame Rate: 60fps ✅
Duration: 1.5s per pulse
```

#### Acceptance Criteria
- [ ] Skeleton animations smooth
- [ ] 60fps frame rate
- [ ] No stuttering
- [ ] Content fade-in smooth

---

## 7.4 User Preferences Testing

### Theme Persistence

#### Objective
Verify dark/light mode choice persists across sessions

#### Procedure

1. **Set Theme Preference**
   ```
   - Open app in light mode
   - Change to dark mode (Settings or toggle)
   - Verify page renders in dark mode
   ```

2. **Reload Page**
   ```
   - Reload page (Cmd/Ctrl+R)
   - App should load in dark mode
   - Should NOT flash light mode first
   ```

3. **Close and Reopen**
   ```
   - Close browser completely
   - Reopen and visit site
   - Should remember dark mode preference
   ```

4. **Cross-Page Testing**
   ```
   - Set dark mode
   - Navigate to different page
   - Dark mode should persist
   - Reload on that page should stay dark
   ```

5. **System Preference**
   ```
   - Change OS dark mode setting
   - If 'system' preference selected, app should update
   ```

**Test Matrix**:
| Action | Expected | Status |
|--------|----------|--------|
| Set dark mode, reload | Dark | ✅ |
| Set light mode, reload | Light | ✅ |
| Close/reopen in dark | Dark | ✅ |
| Navigate with dark set | Dark | ✅ |
| System dark on | Dark | ✅ |

#### Acceptance Criteria
- [ ] Theme persists across reloads
- [ ] No flash of wrong theme
- [ ] All pages respect preference
- [ ] System preference detected

---

### Layout Preferences

#### Objective
Verify layout preferences (sidebar, etc.) persist

#### Procedure

1. **Sidebar Collapse**
   ```
   - Click sidebar toggle
   - Sidebar should collapse
   - Reload page
   - Sidebar should stay collapsed
   ```

2. **Cross-Page Persistence**
   ```
   - Collapse sidebar
   - Navigate to different page
   - Sidebar should stay collapsed
   ```

3. **On Various Viewports**
   - [ ] 320px: Sidebar collapse works
   - [ ] 375px: Sidebar collapse works
   - [ ] 768px: Sidebar collapse works
   - [ ] 1024px+: Sidebar collapse works

#### Acceptance Criteria
- [ ] Layout preferences persist
- [ ] Works on all viewports
- [ ] Accessibility maintained

---

## 7.5 Advanced Features Testing

### Search Enhancements

#### Objective
Verify search filters and recent searches work

#### Procedure

1. **Search Filters**
   ```
   - Open search (Cmd/Ctrl+K)
   - Type query
   - Apply filters (by type, date, etc.)
   - Verify results filtered correctly
   - Clear filters
   ```

2. **Recent Searches**
   ```
   - Perform search
   - Close search
   - Open search again
   - Recent searches should appear
   - Click recent search
   - Should re-run search
   ```

3. **Fuzzy Search**
   ```
   - Search for partial matches
   - Typos should still find results
   - Results ranked by relevance
   ```

#### Acceptance Criteria
- [ ] Filters work correctly
- [ ] Recent searches persist
- [ ] Fuzzy search functional
- [ ] Results accurate

---

### Keyboard Shortcuts

#### Objective
Verify keyboard shortcuts work as expected

#### Shortcuts to Test

| Shortcut | Action | Status |
|----------|--------|--------|
| Cmd/Ctrl+K | Open search | ✅ |
| Cmd/Ctrl+J | Jump to inbox | ✅ |
| Cmd/Ctrl+L | Go to work queue | ✅ |
| Cmd/Ctrl+? | Show help | ✅ |
| N | New issue (when on Work page) | ✅ |
| E | Edit (when in context) | ✅ |
| D | Delete (when in context) | ✅ |

#### Procedure

1. **Test Each Shortcut**
   ```
   - Press shortcut key combination
   - Expected action should occur
   - Verify on multiple pages
   ```

2. **Conflict Testing**
   ```
   - Verify shortcuts don't conflict with browser shortcuts
   - Test on Chrome, Firefox, Safari
   ```

3. **Help Display**
   ```
   - Press Cmd/Ctrl+?
   - Help dialog should show
   - All shortcuts listed
   - Can dismiss with Escape
   ```

#### Acceptance Criteria
- [ ] All shortcuts work
- [ ] No browser conflicts
- [ ] Help dialog displays
- [ ] Shortcuts discoverable

---

### Filtering & Sorting

#### Objective
Verify filtering and sorting on list pages

#### Pages to Test
- Work page (filter by type, priority, status)
- Agents page (filter by role, status)
- Activity page (filter by type, date range)

#### Procedure

1. **Filter Application**
   ```
   - Click filter button
   - Select filter option
   - Results should update in real-time
   - Multiple filters should AND together
   ```

2. **Sorting**
   ```
   - Click sort button
   - Select sort order (asc/desc)
   - Results should re-order
   - Arrow indicator shows current sort
   ```

3. **Persistence**
   ```
   - Apply filters
   - Reload page
   - Filters should persist
   - Navigate away and back
   - Filters should still be applied
   ```

4. **Performance**
   ```
   - Apply filters
   - Results should update <200ms
   - No lag or stuttering
   - Sorting should be instant
   ```

**Test Matrix** (Work page):

| Filter | Results | Status |
|--------|---------|--------|
| Type: Task | Shows only tasks | ✅ |
| Priority: P0 | Shows P0 items | ✅ |
| Type: Bug + P0 | Shows bugs AND P0 | ✅ |
| Clear filters | Shows all | ✅ |
| Reload with filter | Filter persists | ✅ |

#### Acceptance Criteria
- [ ] Filters work correctly
- [ ] Results update in real-time
- [ ] Preferences persist
- [ ] Performance acceptable (<200ms)

---

## Test Summary Template

### Per-Feature Testing Results

```
Phase 7 Feature: [Feature Name]
Date: [Date]
Tester: [Name]

Bundle/Performance:
- Bundle size: [size] ✅
- Lighthouse: [score] ✅
- LCP: [time] ✅
- FID: [time] ✅
- CLS: [score] ✅

Functionality:
- Feature works: ✅
- Across all pages: ✅
- On mobile/tablet/desktop: ✅
- With dark mode: ✅
- With reduced motion: ✅

Issues Found:
- [Issue 1]
- [Issue 2]

Fixes Applied:
- [Fix 1]
- [Fix 2]

Final Status: PASS ✅
```

---

## Success Criteria

All testing passes when:
- ✅ Bundle size reduced 30-40%
- ✅ Lighthouse ≥90 on all pages
- ✅ LCP <2.5s on all pages
- ✅ FID <100ms on all interactions
- ✅ CLS <0.1 on all pages
- ✅ Code splitting working
- ✅ Lazy loading working
- ✅ Animations smooth (60fps)
- ✅ Preferences persist
- ✅ Advanced features functional
- ✅ Zero console errors
- ✅ No regressions from Phase 6

---

*Phase 7 Testing & Verification Procedures - January 10, 2026*
