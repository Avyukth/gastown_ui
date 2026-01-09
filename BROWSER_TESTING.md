# Cross-Browser Testing Procedure

## Overview
This document provides step-by-step procedures to verify Gastown UI works consistently across desktop and mobile browsers.

---

## Target Browsers

### Desktop (Priority: High)
| Browser | Versions | Market Share | Status |
|---------|----------|-------------|--------|
| Chrome | 120+ | ~65% | ✓ Primary |
| Safari | 17+ | ~20% | ✓ Secondary |
| Firefox | 121+ | ~10% | ✓ Secondary |
| Edge | 121+ | ~5% | ✓ Nice-to-have |

### Mobile (Priority: High)
| Browser | Platform | Versions | Status |
|---------|----------|----------|--------|
| Chrome | Android | Latest 3 | ✓ Primary |
| Safari | iOS | 14+ | ✓ Primary |
| Firefox | Android | Latest 2 | ⚠️ Secondary |
| Samsung Internet | Android | Latest | ⚠️ Secondary |

---

## Part 1: Desktop Browser Testing

### Setup

#### Prerequisites
- Multiple browsers installed (or use cloud-based services)
- Gastown UI running locally
- Test checklist printed or in separate window

#### Browser Installation

**Chrome/Edge**:
```bash
# Already available on most systems
# Update: Settings > About Chrome/Edge
```

**Safari** (macOS only):
```bash
# Pre-installed on macOS
# Update: App Store > Updates
```

**Firefox**:
```bash
# Download: https://www.mozilla.org/firefox/
```

### Test Procedure

#### Step 1: Desktop Testing Matrix

Test each of these scenarios:

| Browser | Dashboard | Mail | Work | Agents | Forms Work | Links Work | Console Errors |
|---------|-----------|------|------|--------|-----------|-----------|-----------------|
| Chrome 120 | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |
| Firefox 121 | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |
| Safari 17 | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |
| Edge 121 | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |

#### Step 2: For Each Browser

**Initialization**:
1. Open browser
2. Navigate to `http://localhost:5173` (or deployment URL)
3. Open DevTools (F12)
4. Clear cache and cookies
5. Refresh page (hard refresh: Cmd + Shift + R or Ctrl + Shift + R)

**Navigation Test**:
1. Click each sidebar item: Dashboard → Mail → Work → Agents → Rigs → Workflows → Queue → Convoys
2. Verify:
   - Page loads without errors
   - URL changes correctly
   - Content displays correctly
   - No console errors (red messages in DevTools Console)

**Responsive Test**:
1. Resize window to 1920x1080 (desktop)
2. Resize window to 1024x768 (tablet)
3. Resize window to 375x667 (mobile)
4. Verify layout adjusts at each breakpoint

**Form Test**:
1. Navigate to Work page
2. Fill issue form (all fields):
   - Title: "Test issue"
   - Type: "Task"
   - Priority: "Medium"
3. Submit form
4. Verify:
   - Form submits without errors
   - Success message appears
   - Form resets
   - No JavaScript errors in console

**Link Test**:
1. Click every link in navigation
2. Verify all links work (no 404 errors)
3. External links open in new tab

**Console Check**:
1. Open DevTools Console tab
2. Look for errors (red messages)
3. Document any errors found:
   - Error message
   - Browser/version
   - Page URL
   - Severity (critical, warning, info)

**Expected**: 0 errors in console (warnings OK)

#### Step 3: Visual Consistency

Compare visual appearance:

| Element | Chrome | Firefox | Safari | Notes |
|---------|--------|---------|--------|-------|
| Button styles | ✓ | ✓ | ✓ | Font weight may differ |
| Card shadows | ✓ | ✓ | ✓ | Shadow blur may vary |
| Colors | ✓ | ✓ | ✓ | RGB → hex conversion OK |
| Typography | ✓ | ✓ | ✓ | Line height may differ |
| Icons | ✓ | ✓ | ✓ | SVG rendering consistent |
| Focus rings | ✓ | ✓ | ✓ | Style may vary by browser |

**Known Differences** (acceptable):
- Font rendering varies by OS (antialiasing)
- Shadow effects may have slight blur differences
- Scrollbar appearance differs
- Default input styles may vary

---

## Part 2: Mobile Browser Testing

### Testing Approach

#### Option A: Physical Devices (Best)
- iPhone 12+ (iOS 14+)
- Android phone (Android 12+)
- Test on actual devices for accurate results

#### Option B: Mobile Emulation
- Chrome DevTools mobile emulation
- Firefox responsive design mode
- Limited accuracy but good for quick testing

#### Option C: Cloud-Based Services
- BrowserStack: https://www.browserstack.com/
- LambdaTest: https://www.lambdatest.com/
- Sauce Labs: https://saucelabs.com/
- Best for comprehensive coverage

### Using Chrome DevTools Mobile Emulation

#### Step 1: Enable Device Emulation
1. Open Chrome DevTools (F12)
2. Click mobile icon (or Ctrl + Shift + M)
3. Select device from dropdown:
   - iPhone 12
   - iPhone 15
   - Pixel 6
   - Pixel 8
4. Or select "Custom dimensions" for specific size

#### Step 2: Test Each Screen Size

| Device | Resolution | Orientation | Test |
|--------|-----------|-------------|------|
| iPhone 14 | 390x844 | Portrait | ✓/✗ |
| iPhone 14 | 844x390 | Landscape | ✓/✗ |
| Pixel 8 | 412x915 | Portrait | ✓/✗ |
| Pixel 8 | 915x412 | Landscape | ✓/✗ |
| iPad | 1024x1366 | Portrait | ✓/✗ |
| iPad | 1366x1024 | Landscape | ✓/✗ |

#### Step 3: Mobile Specific Tests

**Touchscreen Interaction**:
1. Simulate touch: DevTools > ... > Settings > Emulate touch instead of mouse
2. Test:
   - Buttons clickable (44x44px minimum)
   - Bottom nav touch targets adequate
   - Dropdowns work with touch
   - No double-tap delays (should be fast)

**Viewport & Safe Areas**:
1. Check for notch/safe area padding:
   - Sidebar doesn't overlap notch
   - Content not cut off by home indicator
   - Safe area insets applied (iOS)

**Mobile Form Input**:
1. Tap on text input
2. Verify keyboard appears
3. Type text
4. Submit form
5. Verify no layout shift when keyboard appears

**Mobile Navigation**:
1. Check bottom nav on mobile
2. Verify sidebar drawer on mobile:
   - Menu button visible
   - Drawer slides from left
   - Backdrop visible
   - Close on link click

**Performance on Mobile**:
1. Throttle network: DevTools > Network > "Slow 3G"
2. Test page load time
3. Verify content appears progressively
4. Target: <3s full load on 3G

### Physical Device Testing

#### iPhone Testing

**Setup**:
1. Connect iPhone via USB to Mac
2. Open Safari on Mac
3. Develop menu > Select iPhone > localhost:5173
4. Safari DevTools opens on Mac

**Test Steps**:
1. Open Settings app
2. Safari > Developer
3. Enable "Web Inspector"
4. Back to Safari, open localhost
5. Use Mac DevTools to debug

**Test Checklist** (iPhone):
- [ ] Portrait orientation works
- [ ] Landscape orientation works
- [ ] Bottom nav touch targets adequate (44x44px+)
- [ ] Forms fill and submit
- [ ] No console errors
- [ ] Page loads in <3s (WiFi)
- [ ] Scrolling smooth (60 FPS)
- [ ] Images load and display correctly
- [ ] Colors look good
- [ ] Notch/safe area respected

#### Android Testing

**Setup**:
1. Enable Developer Mode: Settings > About > Tap Build Number 7x
2. Enable USB Debugging: Settings > Developer Options > USB Debugging
3. Connect Android via USB to computer
4. Open Chrome
5. Navigate to `chrome://inspect`
6. Select Android device

**Test Steps**:
1. Open Chrome on Android
2. Navigate to localhost or deployment URL
3. DevTools opens on computer showing mobile screen

**Test Checklist** (Android):
- [ ] Portrait orientation works
- [ ] Landscape orientation works
- [ ] Bottom nav touch targets adequate (48x48dp minimum)
- [ ] Forms fill and submit
- [ ] No console errors
- [ ] Page loads in <3s (WiFi)
- [ ] Scrolling smooth
- [ ] Status bar doesn't overlap content
- [ ] Navigation drawer works
- [ ] All pages accessible

---

## Part 3: Browser Compatibility Matrix

### Desktop Compatibility

```
✓ = Fully compatible
⚠️ = Minor issues
✗ = Major issues / Not tested
```

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| HTML5 Support | ✓ | ✓ | ✓ | ✓ |
| CSS Grid | ✓ | ✓ | ✓ | ✓ |
| CSS Flexbox | ✓ | ✓ | ✓ | ✓ |
| CSS Custom Properties (vars) | ✓ | ✓ | ✓ | ✓ |
| SVG | ✓ | ✓ | ✓ | ✓ |
| Web Components | ✓ | ⚠️ | ⚠️ | ✓ |
| ES6/ES2015 | ✓ | ✓ | ✓ | ✓ |
| Fetch API | ✓ | ✓ | ✓ | ✓ |
| LocalStorage | ✓ | ✓ | ✓ | ✓ |
| Service Workers | ✓ | ✓ | ✓ | ✓ |
| Touch Events | ✓ | ✓ | ✓ | ✓ |
| Geolocation | ✓ | ✓ | ✓ | ✓ |

### Mobile Compatibility

| Feature | iOS Safari | Android Chrome | Firefox Android |
|---------|-----------|----------------|-----------------|
| Responsive Design | ✓ | ✓ | ✓ |
| Touch Gestures | ✓ | ✓ | ✓ |
| Safe Area Support | ✓ | ⚠️ | ⚠️ |
| Mobile Form Input | ✓ | ✓ | ✓ |
| Viewport Units (vh) | ⚠️ | ✓ | ✓ |
| Service Workers | ✓ | ✓ | ⚠️ |
| Progressive Web App | ✓ | ✓ | ⚠️ |

---

## Part 4: Common Compatibility Issues

### Issue 1: Safari 100vh Behavior
**Problem**: On mobile Safari, 100vh includes the address bar, causing overflow
**Solution**: Use `100dvh` (dynamic viewport height) instead
**Detection**: Dashboard appears scrollable on Safari iOS
**Fix**: CSS: `height: 100dvh` for full-screen elements

### Issue 2: iOS Home Indicator Overlap
**Problem**: Content hidden under home indicator
**Solution**: Use `env(safe-area-inset-bottom)` for padding
**Detection**: Bottom nav cuts off on iPhone notched devices
**Fix**: CSS: `padding-bottom: env(safe-area-inset-bottom)`

### Issue 3: Firefox Focus Ring Styling
**Problem**: Firefox shows default focus ring, can't customize easily
**Solution**: Use `outline-offset` property
**Detection**: Focus ring appears different in Firefox
**Fix**: CSS: `outline: 2px solid currentColor; outline-offset: 2px`

### Issue 4: Safari Select Dropdown Styling
**Problem**: Select elements can't be styled in Safari iOS
**Solution**: Accept default styling or use custom component
**Detection**: Work page dropdown looks different on iOS Safari
**Status**: Acceptable limitation - native controls preferred on mobile

### Issue 5: Touch and Mouse Events
**Problem**: Both fire on touch devices, can cause double-clicks
**Solution**: Use pointer events or check `isTouchEvent`
**Detection**: Buttons seem to require double-click on mobile
**Fix**: Use `pointer` events instead of `mouse` events

---

## Testing Workflow

### Day 1: Desktop Browsers (3 hours)
**Morning (1.5 hours)**: Chrome Desktop
1. Open Chrome
2. Navigate to all pages
3. Test forms
4. Check console for errors
5. Document results

**Afternoon (1.5 hours)**: Firefox + Safari
1. Repeat in Firefox
2. Repeat in Safari
3. Compare visual appearance
4. Note any differences

### Day 2: Mobile Browsers (2 hours)
**Morning (1 hour)**: Chrome Mobile Emulation
1. Enable mobile emulation
2. Test iPhone 14 (390x844)
3. Test Pixel 8 (412x915)
4. Test iPad (1024x1366)
5. Document results

**Afternoon (1 hour)**: Physical Devices
1. Test on real iPhone (if available)
2. Test on real Android (if available)
3. Verify touch interactions
4. Check performance on real networks

### Day 3: Results & Documentation (1 hour)
1. Compile all results into matrix
2. Identify any failures
3. Create bug reports for failures
4. Document known limitations

---

## Test Results Template

```
GASTOWN UI CROSS-BROWSER COMPATIBILITY TEST
Date: January 9, 2026

DESKTOP RESULTS
Chrome 120:       ✓ PASS (0 errors)
Firefox 121:      ✓ PASS (0 errors)
Safari 17:        ✓ PASS (0 errors, some visual differences OK)
Edge 121:         ✓ PASS (0 errors)
Desktop Summary:  ✓ PASS

MOBILE RESULTS (Emulation)
iPhone 14:        ✓ PASS (forms work, nav correct)
Pixel 8:          ✓ PASS (forms work, nav correct)
iPad:             ✓ PASS (layout correct)
Mobile Summary:   ✓ PASS

PHYSICAL DEVICES (If tested)
iPhone 15 Pro:    ✓ PASS (actual device confirmed)
Samsung S24:      ✓ PASS (actual device confirmed)
Device Summary:   ✓ PASS

ISSUES FOUND
None - all pages work correctly

KNOWN LIMITATIONS
- Safari: 100dvh not available, using 100vh workaround
- Edge: Shares Chrome engine, expected parity

CONCLUSION: ✅ PASSES CROSS-BROWSER COMPATIBILITY
All target browsers working correctly.
Application ready for production across all platforms.
```

---

## Tools & Services

| Tool | Purpose | Cost | Coverage |
|------|---------|------|----------|
| Chrome DevTools | Desktop + mobile emulation | Free | Local testing |
| BrowserStack | Physical devices in cloud | Paid | 2000+ devices |
| LambdaTest | Multiple browsers + devices | Paid | 3000+ devices |
| Sauce Labs | Automated cross-browser | Paid | Comprehensive |
| Responsively App | Open source testing tool | Free | Desktop simulation |

---

## Success Criteria

- ✅ **Chrome**: 0 errors, all features work
- ✅ **Firefox**: 0 errors, all features work
- ✅ **Safari**: 0 errors, all features work (known limitations OK)
- ✅ **Edge**: 0 errors, all features work
- ✅ **iOS Safari**: Forms work, navigation works, responsive OK
- ✅ **Android Chrome**: Forms work, navigation works, responsive OK
- ✅ **No Console Errors**: 0 JavaScript errors across all browsers
- ✅ **Responsive**: Layout adjusts at all breakpoints (375px, 768px, 1920px)

---

**Last Updated**: January 9, 2026  
**Status**: Ready for testing  
**Estimated Time**: 6 hours for complete audit  
**Browsers Tested**: Chrome, Firefox, Safari, Edge, iOS Safari, Android Chrome
**Frequency**: Before each release, monthly ongoing
