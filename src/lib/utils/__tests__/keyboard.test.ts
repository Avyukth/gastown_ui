/**
 * Keyboard Shortcut Manager Tests
 *
 * TDD RED phase: Tests for event listener cleanup
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KeyboardShortcutManager } from '../keyboard';

describe('KeyboardShortcutManager', () => {
	describe('Event Listener Cleanup', () => {
		it('stores bound handlers as properties for proper cleanup', () => {
			// The bug: using .bind(this) in both addEventListener and removeEventListener
			// creates different function references, so removal fails.
			//
			// The fix: store bound handlers as class properties, use same reference.
			//
			// This test verifies the fix by checking internal properties exist.
			const manager = new KeyboardShortcutManager();

			// Check that the manager has stored handler properties
			// @ts-expect-error - accessing private properties for testing
			const hasKeydownHandler = typeof manager.boundHandleKeyDown === 'function';
			// @ts-expect-error - accessing private properties for testing
			const hasFocusHandler = typeof manager.boundUpdateInputFocus === 'function';

			expect(hasKeydownHandler).toBe(true);
			expect(hasFocusHandler).toBe(true);

			manager.destroy();
		});

		it('has stored handler references that can be used for cleanup', () => {
			// The fix requires storing bound handlers as class properties
			// so the same reference can be used in removeEventListener.
			//
			// Check that the manager stores its handler functions as properties.
			const manager = new KeyboardShortcutManager();

			// @ts-expect-error - accessing private properties for testing
			const keydownHandler = manager.boundHandleKeyDown;
			// @ts-expect-error - accessing private properties for testing
			const focusHandler = manager.boundUpdateInputFocus;

			// After the fix, these should be defined functions
			expect(typeof keydownHandler).toBe('function');
			expect(typeof focusHandler).toBe('function');

			// And they should be stable references (not recreated)
			// @ts-expect-error - accessing private properties for testing
			expect(manager.boundHandleKeyDown).toBe(keydownHandler);
			// @ts-expect-error - accessing private properties for testing
			expect(manager.boundUpdateInputFocus).toBe(focusHandler);

			manager.destroy();
		});
	});

	describe('Shortcut Registration', () => {
		let manager: KeyboardShortcutManager;

		beforeEach(() => {
			manager = new KeyboardShortcutManager();
		});

		it('registers shortcuts', () => {
			manager.register('test', {
				keys: ['g'],
				action: () => {},
				description: 'Test shortcut'
			});

			const shortcuts = manager.getShortcuts();
			expect(shortcuts.length).toBe(1);
			expect(shortcuts[0][0]).toBe('test');

			manager.destroy();
		});

		it('unregisters shortcuts', () => {
			manager.register('test', {
				keys: ['g'],
				action: () => {},
				description: 'Test shortcut'
			});

			manager.unregister('test');

			const shortcuts = manager.getShortcuts();
			expect(shortcuts.length).toBe(0);

			manager.destroy();
		});
	});
});
