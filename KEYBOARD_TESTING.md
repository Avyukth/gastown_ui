# Keyboard Navigation Testing Procedure

## Overview
This document provides step-by-step procedures to verify keyboard navigation and screen reader accessibility across the Gastown UI application.

---

## Prerequisites
- **Browsers**: Chrome/Edge (Windows), Safari (macOS), Firefox
- **Screen Readers**: 
  - macOS: VoiceOver (built-in)
  - Windows: NVDA (free) or JAWS (commercial)
  - Chrome: ChromeVox extension
- **Testing Environment**: Local development server running (`npm run dev`)

---

## Part 1: Keyboard Navigation Testing

### Test Procedure

#### Step 1: Setup
1. Open the application in a test browser
2. Disable mouse usage (recommended: unplug mouse or use keyboard-only mode)
3. Start on the Dashboard page
4. Close DevTools (prevents focus jumps)

#### Step 2: Verify Tab Order
1. Press **Tab** repeatedly to navigate through all interactive elements
2. Expected behavior:
   - Focus moves left-to-right, top-to-bottom
   - Focus ring appears around each interactive element (2px border or background)
   - Tab order is logical and predictable
   - No skipped elements

#### Step 3: Check Focus Visibility
1. Verify each focused element has visible focus indicator:
   - Buttons: 2px ring around button
   - Links: underline or color change
   - Form inputs: 2px ring around input
   - Navigation items: orange highlight or background
2. Focus indicator should have sufficient contrast (WCAG AA: 4.5:1)

#### Step 4: Test Form Navigation
1. Press Tab to reach a form
2. Fill form using keyboard:
   - Text inputs: Type directly
   - Dropdowns: Tab to dropdown, press Space/Enter to open, arrow keys to select, Enter to confirm
   - Checkboxes: Space to toggle
   - Radio buttons: Arrow keys to select, Space to confirm
3. Submit form: Tab to submit button, press Enter
4. Expected: Form submits without mouse

#### Step 5: Test Modal/Dialog Navigation
1. Open any modal or dialog (e.g., compose form)
2. Tab through elements within modal
3. Expected:
   - Focus stays within modal (focus trap)
   - Cannot tab to background elements
   - Escape key closes modal
   - Focus returns to trigger button after close

#### Step 6: Test Navigation Menu
1. Sidebar/bottom nav: Tab to nav item
2. Press Enter or Space to navigate
3. Expected: Page changes without mouse

#### Step 7: Verify Escape Key
1. On any focusable dropdown/menu/modal: Press Escape
2. Expected: Closes dropdown/modal
3. Focus returns to trigger element

#### Step 8: Check for Keyboard Traps
1. Navigate through entire application with Tab key
2. Verify you can Tab out of EVERY element
3. Look for elements where focus gets stuck

---

## Part 2: Screen Reader Testing

### Test with VoiceOver (macOS)

#### Enable VoiceOver
```bash
# Mac keyboard shortcut
Cmd + F5
```

#### Test Procedure
1. Start VoiceOver (Cmd + F5)
2. Press VO (Control + Option) + U to open rotor
3. Navigate pages using VO + arrow keys
4. Listen for announcements:
   - Page title announced on page load
   - Heading hierarchy announced (H1, H2, etc.)
   - Form labels announced with inputs
   - Button purposes announced
   - Link text announced
   - Status changes announced (e.g., "loading", "error")

#### Checklist: VoiceOver Announcements
- [ ] Page title: "Mail Inbox", "Work Management", etc.
- [ ] Main landmark: "main"
- [ ] Navigation landmark: "navigation"
- [ ] Heading hierarchy: H1 (page title), H2 (sections), etc.
- [ ] Form labels: "Title required" for inputs
- [ ] Buttons announce purpose: "Create Issue", "Submit", etc.
- [ ] Links announce destination: "View full message", etc.
- [ ] Status messages announced: "Error loading agents", "Success: Issue created"
- [ ] List items announced: "List, X items"
- [ ] Card/article roles announced
- [ ] Images have alt text (or are marked decorative)

### Test with NVDA (Windows)

#### Enable NVDA
```bash
# Download from: https://www.nvaccess.org/
# Run installer and start NVDA
```

#### Test Procedure
1. Start NVDA
2. Press Insert + B to activate browse mode
3. Press H to jump between headings
4. Press T to jump to next table
5. Press F to jump to next form field
6. Listen for announcements (same as VoiceOver)

#### Checklist: NVDA Announcements
- [ ] Page title announced on load
- [ ] Headings announced with level (H1, H2, etc.)
- [ ] Form fields announced with labels
- [ ] Buttons announced with purpose
- [ ] Links announced as clickable
- [ ] Error messages announced
- [ ] Success confirmations announced
- [ ] Required field indicators announced
- [ ] Disabled state announced
- [ ] List structure announced

### Test with ChromeVox (Chrome)

#### Enable ChromeVox
1. Go to Chrome Extensions: `chrome://extensions`
2. Search "ChromeVox"
3. Install official Google extension
4. Press Ctrl + Alt + Z to enable

#### Test Procedure
Same as NVDA/VoiceOver - navigate with arrow keys, listen for announcements

---

## Test Matrix: Pages to Test

| Page | Tab Order | Focus Visible | Forms Work | Modals Work | SR Announces | Notes |
|------|-----------|---------------|-----------|-------------|-------------|-------|
| Dashboard | ✓/✗ | ✓/✗ | N/A | N/A | ✓/✗ | Agent cards clickable |
| Mail | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | Compose button, message list |
| Work | ✓/✗ | ✓/✗ | ✓/✗ | N/A | ✓/✗ | 3 forms to test |
| Agents | ✓/✗ | ✓/✗ | N/A | ✓/✗ | ✓/✗ | Agent card expand action |
| Rigs | ✓/✗ | ✓/✗ | N/A | N/A | ✓/✗ | Read-only page |
| Workflows | ✓/✗ | ✓/✗ | N/A | N/A | ✓/✗ | List navigation |
| Queue | ✓/✗ | ✓/✗ | N/A | N/A | ✓/✗ | List navigation |
| Convoys | ✓/✗ | ✓/✗ | N/A | N/A | ✓/✗ | List navigation |

**Legend**: ✓ = Pass, ✗ = Fail, N/A = Not Applicable

---

## Keyboard Shortcuts to Test

| Key | Expected Action | Test Result |
|-----|-----------------|-------------|
| Tab | Move focus to next element | ✓/✗ |
| Shift + Tab | Move focus to previous element | ✓/✗ |
| Enter | Activate button/link/submit form | ✓/✗ |
| Space | Activate button/toggle checkbox | ✓/✗ |
| Escape | Close modal/dropdown | ✓/✗ |
| Arrow Down | Navigate dropdown, expand menu | ✓/✗ |
| Arrow Up | Navigate dropdown (reverse) | ✓/✗ |
| Arrow Left | Navigate radio buttons, navigate sidebar | ✓/✗ |
| Arrow Right | Navigate radio buttons, navigate sidebar | ✓/✗ |

---

## Common Issues to Look For

### Tab Order Issues
- **Problem**: Tab order jumps around unexpectedly
- **Solution**: Check CSS z-index values, ensure logical HTML structure
- **Test**: Press Tab multiple times, listen for pattern

### Missing Focus Indicators
- **Problem**: Cannot see which element has focus
- **Solution**: Add focus ring via `focus:ring-2 focus:ring-accent` (Tailwind)
- **Test**: Tab to element, look for visible focus ring

### Keyboard Traps
- **Problem**: Cannot Tab out of an element
- **Solution**: Implement Escape key handler, fix focus management
- **Test**: Press Tab repeatedly, verify can exit

### Form Label Issues
- **Problem**: Screen reader doesn't announce label with input
- **Solution**: Ensure `<label for="id">` matches input `id` attribute
- **Test**: Tab to input, listen for label announcement

### Missing Alt Text
- **Problem**: Screen reader announces "image" with no description
- **Solution**: Add `alt="description"` to images
- **Test**: Navigate to image, verify description announced

### Dropdown Not Keyboard Accessible
- **Problem**: Cannot open/navigate dropdown with keyboard
- **Solution**: Implement keyboard handlers (Enter, Space, Arrow keys)
- **Test**: Tab to dropdown, press Space, arrow through options, press Enter

---

## Testing Workflow (Complete)

### Morning: Full Accessibility Audit
1. **Duration**: 30-45 minutes per page
2. **Setup**: 
   - Open page in Chrome
   - Disable mouse
   - Start VoiceOver (Mac) or NVDA (Windows)
3. **Execute**:
   - Tab through all elements, verify focus visible
   - Press Enter/Space on buttons, verify action
   - Fill and submit forms with keyboard only
   - Open/close modals with Escape
   - Navigate dropdowns with arrow keys
   - Listen to all screen reader announcements
4. **Document**: Check off items in test matrix above

### Afternoon: Browser Testing
1. **Firefox**: Repeat core pages (Dashboard, Mail, Work, Agents)
2. **Safari (Mac)**: Repeat core pages
3. **Edge (Windows, if available)**: Repeat core pages

### Evening: Results Review
1. Create issue for each failure found
2. Document success rate (X/Y tests passed)
3. Calculate accessibility score:
   - Core pages: Dashboard, Mail, Work, Agents (4 pages)
   - Each page: 3 tests (tab order, focus, forms)
   - Target: 12/12 tests passing

---

## Success Criteria

- ✅ **Tab Order**: Logical left-to-right, top-to-bottom on all pages
- ✅ **Focus Visible**: Every interactive element has visible focus ring
- ✅ **Keyboard Shortcuts**: Tab, Enter, Space, Escape work as expected
- ✅ **No Traps**: Can Tab out of every element
- ✅ **Forms Work**: All forms fillable with keyboard only
- ✅ **SR Announces**: Page title, headings, labels, buttons, links, status changes
- ✅ **Modals Trap Focus**: Cannot Tab outside modal, Escape closes it
- ✅ **Dropdowns Work**: Can navigate with arrow keys, select with Enter

---

## Notes

- Test on actual devices (macOS with VoiceOver, Windows with NVDA) for best results
- Browser versions tested: Chrome 120+, Firefox 121+, Safari 17+, Edge 121+
- Screen reader versions: VoiceOver (Mac), NVDA 2024.1+, ChromeVox latest
- Keyboard-only testing is critical: disconnect mouse or use keyboard-only mode

---

## Resources

- **WCAG 2.1 Keyboard**: https://www.w3.org/WAI/WCAG21/Understanding/keyboard
- **WCAG 2.1 Focus**: https://www.w3.org/WAI/WCAG21/Understanding/focus-visible
- **ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/
- **VoiceOver Help**: https://www.apple.com/accessibility/voiceover/
- **NVDA Documentation**: https://www.nvaccess.org/documentation/

---

**Last Updated**: January 9, 2026  
**Status**: Ready for testing  
**Estimated Time**: 2-3 hours for complete audit
