# Performance Testing Procedure

## Overview
This document provides step-by-step procedures to verify Gastown UI meets performance targets including Lighthouse scores, Core Web Vitals, and load times.

---

## Target Metrics

| Metric | Target | Priority |
|--------|--------|----------|
| Lighthouse Performance Score | ≥90 | High |
| Largest Contentful Paint (LCP) | <2.5s | High |
| Cumulative Layout Shift (CLS) | <0.1 | High |
| First Input Delay (FID) | <100ms | High |
| Time to Interactive (TTI) | <3s (3G) | Medium |
| First Contentful Paint (FCP) | <1.8s | Medium |
| Bundle Size | <500KB (gzipped) | Medium |

---

## Part 1: Lighthouse Audit

### Setup

#### Prerequisites
- Google Chrome browser (Lighthouse built-in)
- Gastown UI running (`npm run dev` or `npm run build && npm run preview`)
- Fresh page load (no service worker cache from previous runs)

#### Clear Cache
```bash
# Chrome DevTools way:
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty cache and hard refresh"
```

### Test Procedure

#### Step 1: Open Lighthouse
1. Open Chrome DevTools (F12 or Cmd + Option + I)
2. Click "Lighthouse" tab (or check "More tools" if not visible)
3. Click "Analyze page load" button

#### Step 2: Configure Audit
1. Device: **Mobile** (primary test)
2. Throttling: **Slow 4G** (realistic mobile conditions)
3. Storage: **Clear storage**
4. Categories: Check all (Performance, Accessibility, Best Practices, SEO)
5. Click "Analyze page load"

#### Step 3: Wait for Results
- Takes 30-60 seconds per page
- Watch for errors/timeouts
- If timeout, check connection and try again

#### Step 4: Review Performance Score
1. Look for "Performance" section
2. Score appears as number 0-100
3. Green (90+), Yellow (50-89), Red (<50)
4. Target: **≥90**

#### Step 5: Record Metrics
- **Largest Contentful Paint (LCP)**: target <2.5s
- **Cumulative Layout Shift (CLS)**: target <0.1
- **First Input Delay (FID)**: target <100ms
- **Speed Index**: measure of visual completeness
- **Time to Interactive**: when page is usable

#### Step 6: Review Recommendations
Scroll down to see:
- **Opportunities**: What to improve
- **Diagnostics**: Current performance details
- **Passed Audits**: What's working well

### Test All Main Pages

Repeat Steps 1-6 for each page:
1. Dashboard (`/`)
2. Mail (`/mail`)
3. Work (`/work`)
4. Agents (`/agents`)
5. Rigs (`/rigs`)
6. Workflows (dashboard section)
7. Queue (`/queue`)
8. Convoys (`/convoys`)

### Create Test Results Table

| Page | LHP Score | LCP | CLS | FID | TTI | Pass? |
|------|-----------|-----|-----|-----|-----|-------|
| Dashboard | 92 | 1.8s | 0.05 | 45ms | 2.1s | ✓ |
| Mail | 88 | 2.2s | 0.08 | 52ms | 2.5s | ⚠️ |
| Work | 95 | 1.6s | 0.03 | 38ms | 1.9s | ✓ |
| Agents | 91 | 1.9s | 0.06 | 48ms | 2.2s | ✓ |
| Rigs | 93 | 1.7s | 0.04 | 42ms | 2.0s | ✓ |
| Workflows | 90 | 2.1s | 0.07 | 51ms | 2.4s | ✓ |
| Queue | 89 | 2.3s | 0.09 | 54ms | 2.6s | ⚠️ |
| Convoys | 90 | 2.0s | 0.06 | 47ms | 2.3s | ✓ |

**Result Interpretation**:
- ✓ = All metrics pass targets
- ⚠️ = Some metrics below target, minor fixes needed
- ✗ = Significant performance issues

---

## Part 2: Core Web Vitals Measurement

### Using Web Vitals Library

#### Install Web Vitals
```bash
npm install web-vitals --save
```

#### Check In-App Monitoring
1. If app has analytics integration, check real user data
2. Look for Core Web Vitals dashboard
3. Compare with Lighthouse synthetic data

### Manual Measurement

#### Real Device Testing
1. **Best practice**: Test on actual mobile devices
2. Use DevTools on Android phone:
   - Connect Android via USB
   - Open `chrome://inspect` on desktop
   - Select phone device
   - Run Lighthouse audit on phone

#### Measurement Tools

| Tool | Purpose | URL |
|------|---------|-----|
| Google PageSpeed Insights | LHP + CWV data | https://pagespeed.web.dev |
| Web Vitals Extension | Real-time CWV | Chrome Web Store |
| Lighthouse CI | Automated testing | https://github.com/GoogleChrome/lighthouse-ci |
| WebPageTest | Detailed waterfall | https://www.webpagetest.org |

### Test Procedure

#### Using PageSpeed Insights
1. Go to https://pagespeed.web.dev
2. Enter URL (e.g., `https://gastown-ui.example.com/`)
3. Click "Analyze"
4. View results:
   - **Mobile** score (priority)
   - **Core Web Vitals**: LCP, CLS, FID
   - **Recommendations**
5. Compare to targets

#### Using Web Vitals Extension
1. Install from Chrome Web Store
2. Open extension
3. Refresh page
4. View real measurements:
   - LCP: When main content loads
   - FID: When page responds to interaction
   - CLS: Visual stability score

---

## Part 3: Load Time Testing (3G Throttling)

### Simulate 3G Network

#### Chrome DevTools Throttling
1. Open DevTools (F12)
2. Go to Network tab
3. Find "Throttling" dropdown (default: "No throttling")
4. Select: **"Slow 3G"** or **"Fast 3G"**
5. Refresh page
6. Watch Network tab for load time

#### Interpreting Results
- **Slow 3G**: Simulates poor mobile conditions
  - Target: <5s full page load
  - Typical: Download speed ~400 kbps
- **Fast 3G**: More realistic mobile conditions
  - Target: <3s full page load
  - Typical: Download speed ~1.6 mbps

### Test Procedure

#### Step 1: Setup
1. Open DevTools (F12)
2. Network tab
3. Select **"Slow 3G"** throttling
4. Check "Disable cache" checkbox

#### Step 2: Test Each Page
For each main page:
1. Clear cache (Hard refresh: Cmd + Shift + R)
2. Observe load time
3. Note:
   - When First Contentful Paint (FCP) happens
   - When Largest Contentful Paint (LCP) happens
   - Total page load time
4. Record in table below

#### Step 3: Analyze Waterfall
1. Click on page request in Network tab
2. View timing breakdown:
   - DNS lookup
   - TCP connection
   - TLS handshake
   - Request time
   - Response time
   - Processing time
   - Rendering time

#### Step 4: Identify Bottlenecks
Look for:
- Large JavaScript files (minify if needed)
- Unoptimized images (compress/WebP)
- Render-blocking CSS (inline critical CSS)
- Synchronous requests (parallelize)

### 3G Load Time Results

| Page | 3G Load Time | FCP | LCP | Target <3s | Pass? |
|------|-------------|-----|-----|-----------|-------|
| Dashboard | 2.8s | 0.8s | 1.8s | ✓ | Yes |
| Mail | 3.2s | 1.0s | 2.2s | ✗ | No |
| Work | 2.5s | 0.7s | 1.6s | ✓ | Yes |
| Agents | 2.9s | 0.9s | 1.9s | ✓ | Yes |
| Rigs | 2.6s | 0.8s | 1.7s | ✓ | Yes |
| Workflows | 3.0s | 1.1s | 2.1s | ⚠️ | Borderline |
| Queue | 3.3s | 1.2s | 2.3s | ✗ | No |
| Convoys | 2.7s | 0.8s | 1.8s | ✓ | Yes |

**Action Items**:
- ✗ (No): Investigate and optimize
- ⚠️ (Borderline): Monitor and consider optimizations
- ✓ (Yes): Meets target, maintain quality

---

## Part 4: Bundle Size Analysis

### Check Build Output

```bash
# Build production version
npm run build

# Check generated files
ls -lh build/
```

### Analyze Bundle

#### Using Vite Visualizer Plugin
1. Plugin already included in project
2. Build with analysis:
   ```bash
   npm run analyze
   ```
3. View `dist/stats.html` in browser
4. Visualizes bundle composition

#### Using Bundle Analyzer Tools
- **Webpack Bundle Analyzer**: https://github.com/webpack-bundle-analyzer/webpack-bundle-analyzer
- **Source Map Explorer**: https://github.com/danvk/source-map-explorer
- **BundlePhobia**: https://bundlephobia.com

### Target Bundle Sizes

| Resource | Gzipped Target | Current | Status |
|----------|---------------|---------|--------|
| Main JS | <200KB | XXX | ✓/✗ |
| CSS | <50KB | XXX | ✓/✗ |
| HTML | <30KB | XXX | ✓/✗ |
| Total | <500KB | XXX | ✓/✗ |

### Optimization Recommendations

If bundle is over target:

1. **Code Splitting**
   - Split by route (Svelte Kit does this automatically)
   - Lazy load heavy components
   - Check: `build/` folder has separate chunk files

2. **Minification**
   - Ensure Vite/SvelteKit minification enabled
   - Check build output is minified (uglified JS)

3. **Image Optimization**
   - Convert to WebP format
   - Use appropriate sizes for device
   - Compress with TinyPNG or ImageOptim

4. **Unused Dependencies**
   - Audit `package.json`
   - Remove unused packages
   - Use `npm ls` to identify duplicates

---

## Part 5: Rendering Performance

### Check for Layout Shifts

#### Detect CLS Issues
1. Open DevTools Performance tab
2. Record page load (5-10 seconds)
3. Look for yellow bars (layout shifts)
4. Click to see what shifted
5. CLS target: <0.1 (minimize shifts)

#### Common CLS Issues
- Ads/content loading late and shifting layout
- Images without fixed dimensions
- Animations affecting layout
- Fonts loading and changing size

### Check for Jank (Frame Drops)

1. Open DevTools Performance tab
2. Record interaction (click button, scroll)
3. Look for red bars (dropped frames)
4. FPS counter: target 60 FPS
5. If red bars: animation/rendering issue

---

## Testing Schedule

### Week 1: Baseline Performance
**Monday (1 hour)**
- Run Lighthouse on all pages with Fast 3G
- Record baseline scores
- Create test results table

**Wednesday (1 hour)**
- Run on Slow 3G
- Measure Core Web Vitals
- Identify top bottlenecks

**Friday (1 hour)**
- Analyze bundle size
- Check for Layout Shifts
- Create performance report

### Continuous Monitoring
- Run Lighthouse weekly
- Track score trends
- Address regressions immediately

---

## Performance Report Template

```
GASTOWN UI PERFORMANCE AUDIT
Date: January 9, 2026

LIGHTHOUSE SCORES (Mobile, Slow 3G)
Dashboard: 92 (✓ target 90+)
Mail: 88 (⚠️ target 90+)
Work: 95 (✓ target 90+)
Agents: 91 (✓ target 90+)
Average: 91.5 ✓ PASS

CORE WEB VITALS (Slow 3G)
LCP: 1.9s (✓ target <2.5s)
CLS: 0.06 (✓ target <0.1)
FID: 48ms (✓ target <100ms)
Average: PASS

3G LOAD TIMES (Slow 3G)
Dashboard: 2.8s (✓ <3s)
Mail: 3.2s (✗ >3s)
Work: 2.5s (✓ <3s)
Agents: 2.9s (✓ <3s)
Average: 2.85s (mostly passing)

BUNDLE SIZE
Main JS: 185KB gzipped (✓ <200KB)
CSS: 42KB gzipped (✓ <50KB)
HTML: 25KB gzipped (✓ <30KB)
Total: 252KB (✓ <500KB)

RECOMMENDATIONS
1. Optimize Mail page (score 88): Review large images/scripts
2. Investigate Queue page load (3.3s): Consider lazy loading
3. Continue monitoring CLS (very low at 0.06)
4. Consider Service Worker for offline support

CONCLUSION: ✅ PASSES PERFORMANCE REQUIREMENTS
Overall score: 90.75/100 - Production ready
```

---

## Tools & Resources

| Tool | Purpose | URL |
|------|---------|-----|
| Chrome Lighthouse | Performance scoring | Built into Chrome DevTools |
| PageSpeed Insights | Public scoring + CWV | https://pagespeed.web.dev |
| WebPageTest | Detailed waterfall + comparison | https://www.webpagetest.org |
| Lighthouse CI | Automated monitoring | https://github.com/GoogleChrome/lighthouse-ci |
| Web Vitals Extension | Real-time Core Web Vitals | Chrome Web Store |
| Sentry Performance | Production monitoring | https://sentry.io/for/performance |

---

## Success Criteria

- ✅ **Lighthouse**: ≥90 on all main pages
- ✅ **LCP**: <2.5s on 3G
- ✅ **CLS**: <0.1 throughout interaction
- ✅ **FID**: <100ms average
- ✅ **3G Load**: <3s on most pages
- ✅ **Bundle Size**: <500KB gzipped
- ✅ **No Layout Shifts**: CLS minimized
- ✅ **60 FPS**: Smooth interactions

---

**Last Updated**: January 9, 2026  
**Status**: Ready for testing  
**Estimated Time**: 3-4 hours for complete audit  
**Frequency**: Weekly monitoring recommended
