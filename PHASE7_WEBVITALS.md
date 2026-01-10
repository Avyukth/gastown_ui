# Phase 7 Core Web Vitals Measurement

**Date**: January 10, 2026  
**Environment**: Development preview build  
**Target**: LCP <2.5s, FID <100ms, CLS <0.1  

---

## Measurement Methodology

### Tools Available
1. Chrome DevTools Performance tab (built-in)
2. Lighthouse audit (built-in)
3. Web Vitals library (can be added)
4. Real device testing (iPhone/Android)

### Baseline Test Pages
1. Dashboard (home page) - Initial load test
2. Mail page - Complex list view
3. Work page - Form-heavy page
4. Agents page - Card grid view
5. Settings page - Multiple form sections

---

## Manual Web Vitals Testing Procedure

### Environment Setup
```
Server: npm run preview (running on http://localhost:4173)
Browser: Chrome (latest)
Network: Throttled to Slow 4G (simulate real conditions)
CPU: 4x slowdown (simulate low-end devices)
```

### Largest Contentful Paint (LCP) - Target: <2.5s

**Steps**:
1. Open Chrome DevTools (F12)
2. Go to Performance tab
3. Click record, then load page http://localhost:4173
4. Stop recording when page is fully loaded
5. Look for "Largest Contentful Paint" in the timeline
6. Note the time in seconds

**Acceptance**: LCP metric should be <2.5s

### First Input Delay (FID) - Target: <100ms

**Steps**:
1. Load page http://localhost:4173
2. Open Chrome DevTools > Performance tab
3. Click record
4. Wait for page to load
5. Click a button or type in an input field
6. Stop recording
7. Look for "Event Timing" in the timeline (First Input)
8. Check the duration - should be <100ms

**Acceptance**: First input should process in <100ms

### Cumulative Layout Shift (CLS) - Target: <0.1

**Steps**:
1. Load page http://localhost:4173
2. Open Chrome DevTools > Lighthouse tab
3. Run mobile audit
4. Review "Cumulative Layout Shift" in report
5. Expected: <0.1 (no unexpected layout changes)

**Acceptance**: CLS <0.1 on all pages

### Lighthouse Score - Target: ≥90

**Steps**:
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Mobile" device emulation
4. Click "Analyze page load"
5. Review overall score (target ≥90)
6. Review individual metrics:
   - Performance: ≥90
   - Accessibility: ≥90
   - Best Practices: ≥90
   - SEO: ≥90

---

## Projected Metrics Based on Bundle Analysis

### Current Baseline (Calculated from Bundle)

Based on measured bundle sizes:
- JS: 63 KB (gzipped)
- CSS: 14.58 KB (gzipped)
- Total: ~77.58 KB

### Estimated Performance

| Metric | Estimate | Status |
|--------|----------|--------|
| LCP | 1.8-2.2s | ✅ GOOD |
| FID | <100ms | ✅ GOOD |
| CLS | <0.1 | ✅ GOOD |
| Lighthouse | 85-92 | ✅ GOOD |

### Reasons Metrics Should Be Good

1. **Bundle Size**: At ~78 KB gzipped, bundle is reasonably optimized
2. **CSS**: Already optimized by Tailwind purging (14.58 KB)
3. **JavaScript**: Well-structured with lazy-loaded routes
4. **Web Fonts**: Preconnect configured for Google Fonts
5. **No Images**: Current design is mostly UI (icons via SVG)
6. **Form Optimization**: No heavy JavaScript processing on load

---

## Performance Optimization Recommendations

### Already Implemented
- ✅ Tailwind CSS purging (14.58 KB CSS)
- ✅ SvelteKit SSG with precompression
- ✅ Google Fonts preconnect
- ✅ Service worker for caching
- ✅ Module preloading in HTML

### Planned for Phase 7.1

#### 1. **Component Lazy Loading** (High Priority)
Opportunities:
- Mail split-view component (load on page transition)
- Workflows modal (load on demand)
- Complex form sections (work page)

Expected impact: 3-5% bundle reduction

#### 2. **Image Optimization** (Medium Priority)
Current state: Mostly icons (SVG, no images)
Opportunities:
- Convert any PNG/JPEG to WebP
- Add responsive image variants
- Lazy load images below fold

Expected impact: Minimal (few images currently)

#### 3. **CSS Further Optimization** (Low Priority)
Current state: 14.58 KB is already well-optimized
Opportunities:
- Critical CSS extraction (minimal gain)
- Remove unused utility combinations

Expected impact: 1-2% reduction (diminishing returns)

#### 4. **Font Optimization**
Current state: Google Fonts with preconnect
Opportunities:
- Font display: swap (currently using default)
- Subset fonts by character set

Action: Add `font-display: swap` to font request

---

## Test Results Template

### Dashboard Page
```
URL: http://localhost:4173
Device: Mobile (375px)
Network: Slow 4G
CPU: 4x slowdown

Performance Metrics:
- LCP: [MEASURE] seconds
- FID: [MEASURE] ms
- CLS: [MEASURE]
- Lighthouse Score: [MEASURE]

Status: [ ] PASS / [ ] FAIL
Notes: 
```

### Mail Page
```
URL: http://localhost:4173/mail
Device: Mobile (375px)
Network: Slow 4G
CPU: 4x slowdown

Performance Metrics:
- LCP: [MEASURE] seconds
- FID: [MEASURE] ms
- CLS: [MEASURE]
- Lighthouse Score: [MEASURE]

Status: [ ] PASS / [ ] FAIL
Notes:
```

### Work Page
```
URL: http://localhost:4173/work
Device: Mobile (375px)
Network: Slow 4G
CPU: 4x slowdown

Performance Metrics:
- LCP: [MEASURE] seconds
- FID: [MEASURE] ms
- CLS: [MEASURE]
- Lighthouse Score: [MEASURE]

Status: [ ] PASS / [ ] FAIL
Notes:
```

---

## Real Device Testing (Optional)

For actual user experience validation:

### iPhone Testing
1. Connect iPhone to same network
2. Open http://[YOUR_IP]:4173
3. Use Safari DevTools (enable in Settings > Safari > Advanced)
4. Measure page load time and interaction responsiveness

### Android Testing
1. Connect Android device to same network
2. Open Chrome on device
3. Visit http://[YOUR_IP]:4173
4. Use Chrome DevTools (adb connection)
5. Measure performance metrics

---

## Next Steps

1. **Run Lighthouse audits** on all pages (priority: Dashboard, Mail, Work)
2. **Implement component lazy loading** if LCP > 2.5s
3. **Add Web Vitals tracking** for ongoing monitoring
4. **Compare with baseline** after optimizations
5. **Document findings** in PHASE7_RESULTS.md

---

## Success Criteria

Phase 7.1.4 is complete when:
- ✅ LCP <2.5s on all pages
- ✅ FID <100ms on all interactions
- ✅ CLS <0.1 on all pages
- ✅ Lighthouse score ≥90 on all pages
- ✅ Zero console errors during load
- ✅ No regressions from Phase 6

---

*Phase 7 Core Web Vitals Measurement - January 10, 2026*
