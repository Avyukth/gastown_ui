# Phase 3 Testing Plan - Design System Verification

**Focus**: Icon System, Page Titles, and Color System  
**Date**: January 9, 2026  
**Status**: Ready for Execution

---

## Test Environment Setup

### Prerequisites
- Dev server running on `http://localhost:5173`
- Browser DevTools open (Chrome/Firefox)
- Dark mode toggle available
- Mobile device or viewport simulator

### Setup Steps
```bash
# Start dev server
npm run dev

# Open in browser
http://localhost:5173

# Open DevTools
F12 or Cmd+Option+I
```

---

## 3.1 Icon System Testing

### 3.1.1 Icon Rendering Test

**Objective**: Verify all icons render correctly and consistently

#### Test Case: GlobalSearch Icon Update
**File**: `src/lib/components/GlobalSearch.svelte`

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Open GlobalSearch by pressing `Cmd/Ctrl+K` | Modal opens | [ ] |
| 2 | Type to search for "work" | Work route appears in results | [ ] |
| 3 | Check Work icon | Icon should be `Briefcase` (not `Target`) | [ ] |
| 4 | Compare with Work icon in sidebar | Both should use `Briefcase` | [ ] |
| 5 | Close GlobalSearch (ESC) | Modal closes | [ ] |

#### Test Case: Navigation Icons Consistency

| Page | Icon | Visual Check | Dark Mode | Status |
|------|------|-------------|-----------|--------|
| Dashboard | Home | House outline visible | Visible in dark | [ ] |
| Work | Briefcase | Case icon visible | Visible in dark | [ ] |
| Agents | Bot | Robot head visible | Visible in dark | [ ] |
| Mail | Mail | Envelope icon visible | Visible in dark | [ ] |
| Queue | ClipboardList | Checklist icon visible | Visible in dark | [ ] |
| Convoys | Truck | Truck icon visible | Visible in dark | [ ] |
| Workflows | GitBranch | Branch icon visible | Visible in dark | [ ] |
| Rigs | Server | Server icon visible | Visible in dark | [ ] |
| Escalations | Bell | Bell icon visible | Visible in dark | [ ] |
| Health | HeartPulse | Pulse icon visible | Visible in dark | [ ] |
| Activity | BarChart3 | Chart icon visible | Visible in dark | [ ] |
| Watchdog | Eye | Eye icon visible | Visible in dark | [ ] |
| Crew | Users | People icon visible | Visible in dark | [ ] |
| Dogs | Shield | Shield icon visible | Visible in dark | [ ] |
| Settings | Settings | Gear icon visible | Visible in dark | [ ] |
| Logs | ScrollText | Document icon visible | Visible in dark | [ ] |

#### Test Case: Icon Size and Stroke Consistency

**Objective**: Verify all icons use consistent sizing (20px) and stroke weight (2px)

```javascript
// Run in browser console
document.querySelectorAll('[class*="nav-icon"] svg').forEach((svg, i) => {
  const width = svg.getAttribute('width');
  const height = svg.getAttribute('height');
  const stroke = svg.getAttribute('stroke-width');
  console.log(`Icon ${i}: ${width}x${height}, stroke: ${stroke}`);
});
```

**Expected Output**: All icons should be 20x20 with stroke-width attribute

| Viewport | Test | Expected | Actual | Status |
|----------|------|----------|--------|--------|
| Desktop (1024px) | Icon size | 20px | - | [ ] |
| Desktop (1024px) | Stroke weight | 2px | - | [ ] |
| Tablet (768px) | Icon size | 20px | - | [ ] |
| Tablet (768px) | Stroke weight | 2px | - | [ ] |
| Mobile (375px) | Icon size | 20px | - | [ ] |
| Mobile (375px) | Stroke weight | 2px | - | [ ] |

### 3.1.2 Icon Interaction Test

#### Test Case: Active State
- Navigate to different pages
- Verify icon color changes to primary orange (#F97316)
- Verify icon stroke weight increases slightly on active page
- Status: [ ]

#### Test Case: Hover State
- Hover over navigation items (desktop only)
- Verify subtle color transition (200ms)
- Verify no flickering or visual glitches
- Status: [ ]

#### Test Case: Accessibility
- Use keyboard to navigate (Tab key)
- Verify focus ring is visible around each nav item
- Verify icon has proper aria-label
- Test with screen reader (VoiceOver/NVDA)
- Status: [ ]

---

## 3.2 Page Title Testing

### 3.2.1 Title Presence and Casing Test

**Objective**: Verify all pages have properly formatted titles

#### Test Case: Title Casing on Main Pages

| Page | URL | Title | Expected Format | Status |
|------|-----|-------|-----------------|--------|
| Dashboard | / | (visual check) | Title Case | [ ] |
| Work | /work | Work Management | Title Case ✅ | [ ] |
| Agents | /agents | Agents | Title Case ✅ | [ ] |
| Mail | /mail | Mail Inbox | Title Case ✅ | [ ] |
| Queue | /queue | (visual check) | Title Case | [ ] |
| Convoys | /convoys | Convoys | Title Case ✅ | [ ] |
| Workflows | /workflows | (visual check) | Title Case | [ ] |
| Rigs | /rigs | (visual check) | Title Case | [ ] |
| Escalations | /escalations | Escalations | Title Case ✅ | [ ] |
| Health | /health | System Health | Title Case ✅ | [ ] |
| Activity | /activity | Activity Feed | Title Case ✅ | [ ] |
| Watchdog | /watchdog | (visual check) | Title Case | [ ] |
| Crew | /crew | (visual check) | Title Case | [ ] |
| Dogs | /dogs | (visual check) | Title Case | [ ] |
| Settings | /settings | (visual check) | Title Case | [ ] |
| Logs | /logs | (visual check) | Title Case | [ ] |

### 3.2.2 Title Font Size Test

**Objective**: Verify title sizing is consistent

#### Test Case: Desktop Font Sizing (1024px+)

```javascript
// Run in browser console
const h1 = document.querySelector('h1');
const computed = window.getComputedStyle(h1);
console.log(`Font size: ${computed.fontSize}`);
console.log(`Font weight: ${computed.fontWeight}`);
console.log(`Line height: ${computed.lineHeight}`);
```

**Expected**:
- Font size: 24px (text-2xl)
- Font weight: 600 (semi-bold)
- Line height: 1.2x (30.4px)

| Page | Font Size | Weight | Line Height | Status |
|------|-----------|--------|-------------|--------|
| Work | 24px ✅ | 600 ✅ | 1.2x ✅ | [ ] |
| Agents | 24px ✅ | 600 ✅ | 1.2x ✅ | [ ] |
| Mail | 24px ✅ | 600 ✅ | 1.2x ✅ | [ ] |
| Health | 24px ✅ | 600 ✅ | 1.2x ✅ | [ ] |
| Activity | 24px ✅ | 600 ✅ | 1.2x ✅ | [ ] |

#### Test Case: Mobile Font Sizing (375px)

**Expected**: 20px semi-bold (text-xl or text-2xl depending on responsive)

| Page | Font Size | Status |
|------|-----------|--------|
| Work | 20px or 24px | [ ] |
| Agents | 20px or 24px | [ ] |
| Mail | 20px or 24px | [ ] |
| Health | 20px or 24px | [ ] |
| Activity | 20px or 24px | [ ] |

### 3.2.3 Title Overflow Test

**Objective**: Verify titles don't overflow on narrow viewports

#### Test Case: Narrow Viewports (320px)

1. Set viewport width to 320px
2. Navigate to each page
3. Verify title text doesn't overflow
4. Verify no horizontal scrollbar appears
5. Verify text wraps gracefully if needed

| Page | 320px | 375px | 768px | 1024px+ | Status |
|------|-------|-------|-------|---------|--------|
| Work | No overflow | No overflow | No overflow | No overflow | [ ] |
| Agents | No overflow | No overflow | No overflow | No overflow | [ ] |
| Mail | No overflow | No overflow | No overflow | No overflow | [ ] |
| Health | No overflow | No overflow | No overflow | No overflow | [ ] |
| Activity | No overflow | No overflow | No overflow | No overflow | [ ] |

### 3.2.4 Subtitle/Description Test

**Objective**: Verify all pages have descriptive subtitle text

#### Test Case: Subtitle Presence

| Page | Has Subtitle | Subtitle Text | Color | Status |
|------|--------------|---------------|-------|--------|
| Work | ✅ | "Create issues, convoys, and assign work" | Muted | [ ] |
| Agents | ✅ | "All active agents in Gas Town" | Muted | [ ] |
| Mail | ✅ | "{count} messages ({unread} unread)" | Muted | [ ] |
| Health | ✅ | (expected) | Muted | [ ] |
| Activity | ✅ | (expected) | Muted | [ ] |

---

## 3.3 Color System Testing

### 3.3.1 CTA Button Color Test

**Objective**: Verify primary buttons use correct orange (#F97316)

#### Test Case: Button Color Verification

| Page | Button Text | Color | Hex | Status |
|------|------------|-------|-----|--------|
| Mail | Compose | Orange | #F97316 ✅ | [ ] |
| Work | Create Issue | Orange | #F97316 | [ ] |
| Work | Create Convoy | Orange | #F97316 | [ ] |

#### Test Case: Button States

| Button | Normal | Hover | Active | Disabled | Status |
|--------|--------|-------|--------|----------|--------|
| Compose | #F97316 | Darker | Darker | Gray 50% | [ ] |
| Create Issue | #F97316 | Darker | Darker | Gray 50% | [ ] |
| Create Convoy | #F97316 | Darker | Darker | Gray 50% | [ ] |

### 3.3.2 Status Color Test

**Objective**: Verify status colors are consistent

#### Test Case: Message Type Badges

| Message Type | Color | Hex | Page | Status |
|--------------|-------|-----|------|--------|
| ESCALATION | Red | #EF4444 | Mail | [ ] |
| ERROR | Red | #EF4444 | Mail | [ ] |
| HANDOFF | Amber | #F59E0B | Mail | [ ] |
| DONE | Green | #22C55E | Mail | [ ] |
| POLECAT_DONE | Green | #22C55E | Mail | [ ] |
| TEST | Blue | #3B82F6 | Mail | [ ] |

### 3.3.3 Unread Indicator Test

**Objective**: Verify unread indicators are distinct and visible

#### Test Case: Unread Dot Visibility

1. Open Mail page
2. Look for messages with unread dot
3. Verify blue dot is 8px and clearly visible
4. Verify sender name is semi-bold (font-weight: 600)
5. Verify unread message has subtle background highlight

| Viewport | Dot Visible | Bold Text | Highlight | Status |
|----------|-------------|-----------|-----------|--------|
| Desktop | ✅ | ✅ | ✅ | [ ] |
| Tablet | ✅ | ✅ | ✅ | [ ] |
| Mobile | ✅ | ✅ | ✅ | [ ] |

### 3.3.4 Dark Mode Color Test

**Objective**: Verify colors maintain visibility in dark mode

#### Test Case: Dark Mode Contrast

1. Toggle dark mode in browser or system
2. Verify button text remains visible (white on dark orange)
3. Verify status badges remain visible
4. Verify unread indicators remain visible

| Element | Light Mode | Dark Mode | Contrast | Status |
|---------|-----------|-----------|----------|--------|
| Orange Button | Visible | Visible | 4.5:1+ | [ ] |
| Red Status | Visible | Visible | 4.5:1+ | [ ] |
| Green Status | Visible | Visible | 4.5:1+ | [ ] |
| Blue Indicator | Visible | Visible | 4.5:1+ | [ ] |

#### Test Case: Background Pattern in Dark Mode

1. Navigate to Mail page
2. Toggle dark mode
3. Verify GridPattern opacity is not too prominent
4. Verify content is still readable

| Mode | Pattern Visibility | Readability | Status |
|------|-------------------|-------------|--------|
| Light | Low (3%) | Excellent | [ ] |
| Dark | Low (3%) | Excellent | [ ] |

### 3.3.5 Cross-Browser Color Test

**Objective**: Verify colors render consistently across browsers

| Browser | Color Accuracy | Status |
|---------|----------------|--------|
| Chrome | ✅ | [ ] |
| Firefox | ✅ | [ ] |
| Safari | ✅ | [ ] |
| Edge | ✅ | [ ] |

---

## 4. Responsive Testing

### 4.1 Icon Responsive Test

| Viewport | Size | Visibility | Status |
|----------|------|------------|--------|
| 320px | 20px | Clear and distinct | [ ] |
| 375px | 20px | Clear and distinct | [ ] |
| 768px | 20px | Clear and distinct | [ ] |
| 1024px | 20px | Clear and distinct | [ ] |
| 1440px | 20px | Clear and distinct | [ ] |

### 4.2 Title Responsive Test

| Viewport | Size | Overflow | Wrapping | Status |
|----------|------|----------|----------|--------|
| 320px | 20px | No | Graceful | [ ] |
| 375px | 24px | No | None | [ ] |
| 768px | 24px | No | None | [ ] |
| 1024px | 24px | No | None | [ ] |
| 1440px | 24px | No | None | [ ] |

### 4.3 Color Responsive Test

| Viewport | Contrast | Readability | Status |
|----------|----------|-------------|--------|
| 320px | 4.5:1+ | Excellent | [ ] |
| 375px | 4.5:1+ | Excellent | [ ] |
| 768px | 4.5:1+ | Excellent | [ ] |
| 1024px | 4.5:1+ | Excellent | [ ] |
| 1440px | 4.5:1+ | Excellent | [ ] |

---

## 5. Accessibility Testing

### 5.1 Keyboard Navigation

| Test | Expected | Status |
|------|----------|--------|
| Tab through nav items | Focus ring visible on each icon | [ ] |
| Enter on nav item | Navigate to page | [ ] |
| Escape from GlobalSearch | Modal closes | [ ] |
| Tab in GlobalSearch | Focus moves through results | [ ] |

### 5.2 Screen Reader Testing

| Test | Expected | Status |
|------|----------|--------|
| VoiceOver (macOS) | Icons have proper labels | [ ] |
| NVDA (Windows) | Icons have proper labels | [ ] |
| TalkBack (Android) | Icons have proper labels | [ ] |

### 5.3 Color Contrast Testing

| Element | Ratio | WCAG Level | Status |
|---------|-------|-----------|--------|
| Button text | 7:1+ | AAA | [ ] |
| Status badges | 4.5:1+ | AA | [ ] |
| Unread indicator | 7:1+ | AAA | [ ] |

---

## 6. Performance Testing

### 6.1 Load Time Test

| Page | Load Time | Status |
|------|-----------|--------|
| Work | < 2s | [ ] |
| Agents | < 2s | [ ] |
| Mail | < 2s | [ ] |
| Health | < 2s | [ ] |

### 6.2 Rendering Performance

```javascript
// Check frame rate during animations
// Run in console while interacting with nav
window.requestAnimationFrame(function measure() {
  console.log('Frame rendered');
  window.requestAnimationFrame(measure);
});
```

| Interaction | FPS | Smooth | Status |
|-------------|-----|--------|--------|
| Nav icon hover | 60 | ✅ | [ ] |
| Page transition | 60 | ✅ | [ ] |
| Button hover | 60 | ✅ | [ ] |

---

## Summary Checklist

### Phase 3 Testing Complete When:
- [ ] All Icon System tests pass (3.1)
- [ ] All Page Title tests pass (3.2)
- [ ] All Color System tests pass (3.3)
- [ ] All Responsive tests pass (4)
- [ ] All Accessibility tests pass (5)
- [ ] All Performance tests pass (6)
- [ ] Zero regressions detected
- [ ] Zero console errors
- [ ] All browsers tested (Chrome, Firefox, Safari)
- [ ] All viewports tested (320px, 375px, 768px, 1024px+)
- [ ] Dark mode verified
- [ ] Mobile device tested (if available)

---

## Notes

- Phase 3 testing is comprehensive but quick due to most features already being correctly implemented
- The main change (icon inconsistency) was minimal
- Typography and color systems were already optimized
- Testing focus should be on verification rather than debugging

---

## Next Steps

After Phase 3 testing completes:
1. Document any issues found
2. Fix any bugs or inconsistencies
3. Push changes to main
4. Create Phase 4 plan for Dashboard & Cards Enhancement
