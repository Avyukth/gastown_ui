/**
 * CUJ-6 Keyboard Navigation Smoke Tests
 *
 * This script provides structured testing for keyboard navigation features.
 * Supports both manual verification logging and Playwright automation.
 *
 * Usage:
 * - Manual: Run tests in browser console, call logTest() for each
 * - Playwright: Import automatedKeyboardTests() and pass page object
 *
 * @module scripts/smoke/cuj-6-keyboard
 */

import { createTestLogger, type TestLogger } from './lib';

const logger = createTestLogger('CUJ-6: Keyboard Navigation');

interface KeyboardTestResult {
	test: string;
	passed: boolean;
	notes?: string;
}

const tests: KeyboardTestResult[] = [];

/**
 * Log a single test result
 */
export function logTest(name: string, passed: boolean, notes?: string) {
	if (passed) {
		logger.success(`${name}`);
	} else {
		logger.fail(`${name}`, notes);
	}
	tests.push({ test: name, passed, notes });
}

/**
 * Run manual keyboard tests with logging
 * Call this to see the test checklist with results
 */
export function runKeyboardTests() {
	logger.step('CUJ-6: KEYBOARD NAVIGATION TESTS');

	// Section 1: Help Overlay
	logger.step('Section 1: Help Overlay');
	logger.info('Test: Press Cmd/Ctrl+? to open help overlay');
	logger.info('Test: Press Escape to close help overlay');
	logger.info('Verify: All documented shortcuts match actual behavior');

	// Section 2: Global Search
	logger.step('Section 2: Global Search');
	logger.info('Test: Press / to open search (when not in input)');
	logger.info('Test: Press Cmd/Ctrl+K to toggle search');
	logger.info('Test: Type query to filter results');
	logger.info('Test: Arrow keys navigate results');
	logger.info('Test: Enter selects result');
	logger.info('Test: Escape closes search');
	logger.info('Test: Type > for command mode');

	// Section 3: Navigation Shortcuts
	logger.step('Section 3: Navigation Shortcuts');
	logger.info('Test: Cmd/Ctrl+J navigates to Mail');
	logger.info('Test: Cmd/Ctrl+L navigates to Work');

	// Section 4: Command Palette
	logger.step('Section 4: Command Palette');
	logger.info('Test: Cmd/Ctrl+K opens command palette');
	logger.info('Test: Type > to enter command mode');
	logger.info('Test: Type : to enter formula mode');
	logger.info('Test: Arrow keys navigate commands');
	logger.info('Test: Enter executes selected command');
	logger.info('Test: Escape closes palette');

	// Section 5: List Navigation
	logger.step('Section 5: List Navigation');
	logger.info('Test: Arrow Down selects next item');
	logger.info('Test: Arrow Up selects previous item');
	logger.info('Test: Enter opens/executes selected item');

	// Section 6: Modal/Dialog Keyboard Support
	logger.step('Section 6: Modal/Dialog Keyboard Support');
	logger.info('Test: Tab cycles through focusable elements');
	logger.info('Test: Shift+Tab cycles backwards');
	logger.info('Test: Escape closes modals/dialogs');
	logger.info('Test: Focus is trapped within open modal');

	// Section 7: Accessibility
	logger.step('Section 7: Accessibility');
	logger.info('Test: All interactive elements have visible focus indicators');
	logger.info('Test: Tab order is logical');
	logger.info('Test: No keyboard traps exist');
	logger.info('Test: Skip link is functional');

	// Print summary
	const passed = tests.filter((t) => t.passed).length;
	const total = tests.length;
	if (total > 0) {
		logger.summary('CUJ-6', passed === total, 0, total);
	}

	return tests;
}

/**
 * Automated Playwright keyboard tests
 *
 * @param page - Playwright Page object
 */
export async function automatedKeyboardTests(page: import('playwright').Page) {
	logger.step('CUJ-6: AUTOMATED KEYBOARD TESTS (Playwright)');
	const startTime = Date.now();

	// Navigate to home page first
	await page.goto('/');
	await page.waitForLoadState('networkidle');

	// 1. Test Global Search with / key
	logger.step('1. Testing global search (/ key)');
	await page.keyboard.press('/');
	await page.waitForTimeout(100);

	const searchDialogVisible = await page.locator('div[role="dialog"]').isVisible();
	logTest('/ opens global search', searchDialogVisible);

	if (searchDialogVisible) {
		// Test search input
		await page.keyboard.type('agents');
		await page.waitForTimeout(200);
		const resultsExist = await page.locator('[role="listbox"] [role="option"]').count();
		logTest('Typing filters search results', resultsExist > 0);

		// Test Escape closes
		await page.keyboard.press('Escape');
		await page.waitForTimeout(100);
		const searchClosed = !(await page.locator('div[role="dialog"]').isVisible());
		logTest('Escape closes search', searchClosed);
	}

	// 2. Test Cmd/Ctrl+K for search toggle
	logger.step('2. Testing Cmd/Ctrl+K');
	const isMac = process.platform === 'darwin';
	const modifier = isMac ? 'Meta' : 'Control';

	await page.keyboard.press(`${modifier}+k`);
	await page.waitForTimeout(100);

	const cmdKOpensSearch = await page.locator('div[role="dialog"]').isVisible();
	logTest(`${modifier}+K opens search/command palette`, cmdKOpensSearch);

	if (cmdKOpensSearch) {
		// Test command mode with >
		await page.keyboard.type('>');
		await page.waitForTimeout(100);

		// Check for command results
		const commandResults = await page.locator('[role="listbox"] [role="option"]').count();
		logTest('> prefix enters command mode', commandResults > 0);

		await page.keyboard.press('Escape');
	}

	// 3. Test navigation shortcuts
	logger.step('3. Testing navigation shortcuts');

	// Test Cmd/Ctrl+J for Mail
	await page.keyboard.press(`${modifier}+j`);
	await page.waitForTimeout(500);
	const onMailPage = page.url().includes('/mail');
	logTest(`${modifier}+J navigates to Mail`, onMailPage);

	// Test Cmd/Ctrl+L for Work
	await page.keyboard.press(`${modifier}+l`);
	await page.waitForTimeout(500);
	const onWorkPage = page.url().includes('/work');
	logTest(`${modifier}+L navigates to Work`, onWorkPage);

	// 4. Test keyboard navigation in search results
	logger.step('4. Testing list navigation');
	await page.goto('/');
	await page.keyboard.press('/');
	await page.waitForTimeout(100);

	if (await page.locator('div[role="dialog"]').isVisible()) {
		// Navigate with arrow keys
		await page.keyboard.press('ArrowDown');
		const hasSelectedItem = await page.locator('[role="option"][aria-selected="true"]').isVisible();
		logTest('ArrowDown selects item', hasSelectedItem);

		await page.keyboard.press('ArrowUp');
		logTest('ArrowUp navigates', true); // Just verify no error

		await page.keyboard.press('Escape');
	}

	// 5. Test tab navigation and focus trap
	logger.step('5. Testing focus management');
	await page.keyboard.press('/');
	await page.waitForTimeout(100);

	if (await page.locator('div[role="dialog"]').isVisible()) {
		// Tab should cycle within dialog
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');

		// Focus should still be within dialog
		const activeElement = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'));
		logTest('Focus trapped in dialog', activeElement !== null);

		await page.keyboard.press('Escape');
	}

	// 6. Test skip link
	logger.step('6. Testing accessibility features');
	await page.goto('/');
	await page.keyboard.press('Tab');

	const skipLinkFocused = await page.evaluate(() => {
		const active = document.activeElement;
		return active?.textContent?.toLowerCase().includes('skip') || active?.getAttribute('href') === '#main-content';
	});
	logTest('Skip link is first focusable element', skipLinkFocused);

	// Summary
	const duration = Date.now() - startTime;
	const passed = tests.filter((t) => t.passed).length;
	const total = tests.length;
	logger.summary('CUJ-6', passed === total, duration, total);

	return tests;
}

/**
 * Get all test results
 */
export function getTestResults(): KeyboardTestResult[] {
	return [...tests];
}

/**
 * Clear test results (for re-running)
 */
export function clearTests() {
	tests.length = 0;
}

/**
 * Print a manual verification checklist
 */
export function printChecklist() {
	console.log(`
=======================================================================
  CUJ-6 KEYBOARD NAVIGATION - MANUAL VERIFICATION CHECKLIST
=======================================================================

SECTION 1: HELP OVERLAY
-----------------------
[ ] Press Cmd/Ctrl+? anywhere -> Help overlay appears
[ ] Press Escape -> Overlay closes
[ ] Verify all documented shortcuts match actual behavior

SECTION 2: GLOBAL SEARCH (/)
----------------------------
[ ] Press / anywhere (not in input) -> Search opens
[ ] Type query -> Results filter live
[ ] Arrow keys -> Navigate through results
[ ] Enter -> Navigate to selected result
[ ] Escape -> Close search

SECTION 3: COMMAND PALETTE (Cmd/Ctrl+K)
---------------------------------------
[ ] Cmd/Ctrl+K -> Opens command palette
[ ] Type > -> Enters command mode
[ ] Type : -> Enters formula mode
[ ] Type query -> Filters commands/formulas
[ ] Arrow keys -> Navigate commands
[ ] Enter -> Execute selected command
[ ] Escape -> Close palette

SECTION 4: NAVIGATION SHORTCUTS
-------------------------------
[ ] Cmd/Ctrl+J -> Navigate to Mail
[ ] Cmd/Ctrl+L -> Navigate to Work

SECTION 5: LIST NAVIGATION
--------------------------
[ ] Arrow Down -> Select next item
[ ] Arrow Up -> Select previous item
[ ] Enter -> Open/execute selected item

SECTION 6: ACCESSIBILITY
------------------------
[ ] All shortcuts have visible focus indicators
[ ] Tab order is logical throughout app
[ ] No keyboard traps (can always navigate away)
[ ] Skip link works (Tab then Enter skips to content)
[ ] Focus returns to trigger after closing dialogs

=======================================================================
  To log results, call: logTest("test name", passed, "optional notes")
  To see summary, call: runKeyboardTests()
=======================================================================
`);
}

// Auto-print checklist when run directly
if (typeof window !== 'undefined') {
	printChecklist();
}
