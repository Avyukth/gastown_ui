# Dark Mode Contrast Testing Procedure

## Overview
This document provides step-by-step procedures to verify dark mode colors meet WCAG AA accessibility standards for contrast ratios.

---

## Prerequisites
- **Tools**:
  - WAVE Browser Extension (WebAIM) - free
  - axe DevTools - free from Deque
  - Optional: Contrast Ratio Calculator
- **Browsers**: Chrome, Firefox, Safari
- **Testing Environment**: Local development server running (`npm run dev`)

---

## Part 1: Setup Dark Mode

### Enable Dark Mode in Browser

#### Chrome DevTools
1. Open Chrome DevTools (F12 or Cmd + Option + I)
2. Click three dots menu (⋯) > More tools > Rendering
3. Under "Emulate CSS media feature prefers-color-scheme", select **dark**

#### Firefox DevTools
1. Open Firefox DevTools (F12)
2. Inspector > Settings > Colors
3. Check "Emulate CSS media feature prefers-color-scheme"
4. Select **dark**

#### Safari
1. Safari > Settings > Accessibility
2. Check "Prefer dark appearance"

#### System Dark Mode (Best)
- **macOS**: System Preferences > General > Appearance > Dark
- **Windows**: Settings > Personalization > Colors > Dark
- Application will automatically detect and apply dark mode

---

## Part 2: Contrast Testing with WAVE

### Install WAVE Extension
1. Go to: https://wave.webaim.org/extension/
2. Click "Add to Chrome" or "Add to Firefox"
3. Extension icon appears in toolbar

### Test Procedure

#### Step 1: Navigate to Page
1. Open Gastown application
2. Enable dark mode (see Part 1)
3. Navigate to a page (e.g., Dashboard)

#### Step 2: Run WAVE
1. Click WAVE icon in toolbar
2. Wait for analysis to complete (5-10 seconds)
3. Results appear in panel on left side

#### Step 3: Review Contrast Errors
1. Look for "Contrast" section in results
2. Note any elements with low contrast:
   - Red indicators = Errors
   - Yellow indicators = Warnings
3. Click on error to highlight element in page

#### Step 4: Check Specific Elements
1. Hover over error to see contrast ratio
2. Inspect element to see colors:
   - Text color (foreground)
   - Background color
   - Calculated ratio: X:1

#### Step 5: Document Results
1. Create matrix (see below) with:
   - Element type (button, text, link, etc.)
   - Location (page/section)
   - Text color
   - Background color
   - Contrast ratio
   - Pass/Fail (WCAG AA requires 4.5:1 for text, 3:1 for large text)

---

## Part 3: Contrast Testing with axe DevTools

### Install axe DevTools
1. Go to: https://www.deque.com/axe/devtools/
2. Add to Chrome or Firefox
3. Icon appears in DevTools panel

### Test Procedure

#### Step 1: Open Page in Dark Mode
1. Enable dark mode (see Part 1)
2. Navigate to test page

#### Step 2: Open axe DevTools
1. Open DevTools (F12)
2. Find "axe DevTools" tab
3. Click "Scan NEW"

#### Step 3: Review Results
1. Look for "Contrast (foreground and background colors)" violations
2. Each violation shows:
   - Element affected
   - Current contrast ratio
   - Foreground color (hex)
   - Background color (hex)
   - Recommended contrast ratio (4.5:1 or 3:1)

#### Step 4: Check Failing Elements
1. Click on failing element
2. Inspect in DOM to verify colors
3. Calculate ratio manually if needed
4. Document in test matrix

#### Step 5: View Detailed Report
1. Click "View Details" for full report
2. Export as PDF if needed
3. Screenshot for documentation

---

## Color Reference Table

### Expected Dark Mode Colors

These are the target colors for dark mode to ensure good contrast:

| Element | Role | Light Text Color | Dark Background | Contrast Ratio |
|---------|------|------------------|-----------------|-----------------|
| Body Text | foreground | #E5E7EB (gray-200) | #0F172A (slate-950) | ~17:1 ✓ |
| Muted Text | muted-foreground | #9CA3AF (gray-400) | #0F172A (slate-950) | ~6:1 ✓ |
| Heading | foreground | #F3F4F6 (gray-100) | #0F172A (slate-950) | ~18:1 ✓ |
| Primary Button | button text | #FFFFFF | #F97316 (orange-500) | ~5:1 ✓ |
| Link | link | #3B82F6 (blue-500) | #0F172A (slate-950) | ~9:1 ✓ |
| Success Badge | success-bg | #FFFFFF | #22C55E (green-500) | ~5.5:1 ✓ |
| Error Badge | error-bg | #FFFFFF | #EF4444 (red-500) | ~5.5:1 ✓ |
| Warning Badge | warning-bg | #FFFFFF | #F59E0B (amber-500) | ~5.5:1 ✓ |
| Info Badge | info-bg | #FFFFFF | #3B82F6 (blue-500) | ~5.5:1 ✓ |

**Target**: Minimum 4.5:1 for normal text, 3:1 for large text (18pt+)

---

## Test Matrix: Elements to Check

| Page | Element | Text Color | BG Color | Ratio | Pass | Note |
|------|---------|-----------|----------|-------|------|------|
| Dashboard | Heading "Dashboard" | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | H1 element |
| Dashboard | Body text | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | Description |
| Dashboard | Primary button | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | "Create Agent" |
| Dashboard | Secondary button | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | "Action" button |
| Dashboard | Muted text | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | "Offline" label |
| Dashboard | Status badge (green) | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | Success indicator |
| Dashboard | Status badge (red) | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | Error indicator |
| Mail | Link text | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | "View full" link |
| Mail | Form label | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | Input labels |
| Mail | Form input text | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | User-entered text |
| Work | Code block | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | Monospace text |
| Work | Border color | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | Card border |
| Agents | Card shadow | N/A | N/A | N/A | ✓ | Decorative |
| Agents | Hover state | ✓/✗ | ✓/✗ | X:1 | ✓/✗ | Lightened bg |

---

## Contrast Ratio Calculation (Manual)

If testing manually or using a contrast calculator:

```
Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)

Where:
  L1 = relative luminance of lighter color
  L2 = relative luminance of darker color
```

### Online Calculators
- https://webaim.org/resources/contrastchecker/
- https://www.tpgi.com/color-contrast-checker/
- https://contrast-checker.netlify.app/

### How to Use
1. Enter foreground color (hex or rgb)
2. Enter background color (hex or rgb)
3. Calculator shows: "X:1 ratio"
4. Compare to WCAG requirements:
   - Normal text: 4.5:1 (AA) or 7:1 (AAA)
   - Large text (18pt+): 3:1 (AA) or 4.5:1 (AAA)

---

## Testing Workflow

### Morning: Complete Dark Mode Audit (90 min)
1. **Setup** (10 min):
   - Enable dark mode on system
   - Install WAVE and axe DevTools
   - Open browser DevTools

2. **WAVE Testing** (40 min):
   - Visit each main page (Dashboard, Mail, Work, Agents)
   - Run WAVE on each
   - Document contrast errors
   - Take screenshots of failures

3. **axe DevTools Testing** (40 min):
   - Run axe scan on each page
   - Export reports
   - Cross-reference with WAVE findings

### Afternoon: Detailed Investigation (60 min)
1. **Manual Color Testing** (30 min):
   - Use WebAIM or TPGI calculator
   - Verify problematic colors
   - Calculate exact contrast ratios

2. **Visual Verification** (30 min):
   - Compare expected vs actual colors in dark mode
   - Check for dark-on-dark or light-on-light issues
   - Verify all text is readable

### Documentation: Results Summary

Create summary like:
```
Dark Mode Contrast Testing Results
Date: January 9, 2026

Pages Tested: 5 (Dashboard, Mail, Work, Agents, Health)
Total Elements: 47
Errors Found: 0
Warnings Found: 3
Success Rate: 94%

Tool Results:
- WAVE: 0 contrast errors
- axe DevTools: 0 contrast violations
- Manual verification: All colors readable

Warnings (non-critical):
- Body text (gray-500) on slate-900 bg: 5.3:1 (above 4.5:1 minimum)
- Badge text (small): 4.5:1 (exact minimum, acceptable)
- Hover state text: 6.2:1 (good)

Conclusion: ✅ PASSES WCAG AA dark mode requirements
```

---

## Common Issues in Dark Mode

### Issue 1: Light Gray Text on Dark Gray Background
- **Problem**: Both colors too similar luminance
- **Example**: `#9CA3AF` text on `#1F2937` background
- **Solution**: Use darker text or lighter background
- **Test**: Run WAVE, should flag as error

### Issue 2: Dark-on-Dark
- **Problem**: Very dark foreground on dark background
- **Example**: `#374151` text on `#111827` background
- **Solution**: Lighten text or add background panel
- **Test**: Visually hard to read

### Issue 3: Insufficient Contrast on Hover
- **Problem**: Hover state text becomes less readable
- **Example**: Orange button text becomes darker on hover
- **Solution**: Verify hover state contrast >= 4.5:1
- **Test**: Hover over elements, check contrast

### Issue 4: Badge Text Too Faint
- **Problem**: Status badges (success, error, warning) text hard to read
- **Example**: Green background with dark green text
- **Solution**: Use light text on colored backgrounds
- **Test**: WAVE should pass, but visual check needed

---

## Accessibility Standards Reference

### WCAG 2.1 Level AA (Target)
- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text** (18pt+ or 14pt+ bold): 3:1 minimum
- **Graphical elements**: 3:1 minimum

### WCAG 2.1 Level AAA (Enhanced)
- **Normal text**: 7:1 contrast ratio
- **Large text**: 4.5:1 minimum
- **Graphical elements**: 3:1 minimum

**Target for this project**: WCAG AA (4.5:1 for normal text)

---

## Success Criteria

- ✅ **WAVE**: 0 contrast errors found
- ✅ **axe DevTools**: 0 contrast violations
- ✅ **All text readable**: 4.5:1+ contrast on all pages
- ✅ **Status badges**: 4.5:1+ for all badge text
- ✅ **Links**: 4.5:1+ for link colors
- ✅ **Buttons**: 4.5:1+ for button text on colored backgrounds
- ✅ **Focus indicators**: Visible in dark mode with sufficient contrast
- ✅ **No false positives**: All flagged issues are real contrast problems

---

## Tools & Resources

| Tool | URL | Purpose | Cost |
|------|-----|---------|------|
| WAVE | https://wave.webaim.org/ | Contrast errors, ARIA issues | Free |
| axe DevTools | https://www.deque.com/axe/devtools/ | Comprehensive accessibility | Free |
| WebAIM Calculator | https://webaim.org/resources/contrastchecker/ | Manual contrast verification | Free |
| TPGI Calculator | https://www.tpgi.com/color-contrast-checker/ | Alternative calculator | Free |
| ColorOracle | https://colororacle.org/ | Simulate color blindness | Free |

---

**Last Updated**: January 9, 2026  
**Status**: Ready for testing  
**Estimated Time**: 2-3 hours for complete audit  
**Target**: WCAG 2.1 Level AA compliance
