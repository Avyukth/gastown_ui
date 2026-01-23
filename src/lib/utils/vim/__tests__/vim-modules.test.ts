/**
 * Vim Module Split Tests
 *
 * TDD RED phase: Tests for vim module split imports
 * Verifies that the split modules can be imported individually
 * and through the barrel export.
 */
import { describe, it, expect } from 'vitest';

describe('Vim Module Split', () => {
	describe('Parser module (vim/parser.ts)', () => {
		it('exports SEQUENCE_TIMEOUT constant', async () => {
			const { SEQUENCE_TIMEOUT } = await import('../parser');
			expect(SEQUENCE_TIMEOUT).toBe(500);
		});

		it('exports SequenceTracker class', async () => {
			const { SequenceTracker } = await import('../parser');
			expect(typeof SequenceTracker).toBe('function');
		});

		it('SequenceTracker handles key sequences', async () => {
			const { SequenceTracker } = await import('../parser');
			const tracker = new SequenceTracker();

			// Start a sequence
			tracker.start('g');
			expect(tracker.isPending()).toBe(true);
			expect(tracker.getPrefix()).toBe('g');

			// Clear sequence
			tracker.clear();
			expect(tracker.isPending()).toBe(false);
			expect(tracker.getPrefix()).toBeNull();
		});

		it('SequenceTracker supports onClear callback', async () => {
			const { SequenceTracker } = await import('../parser');
			const tracker = new SequenceTracker();

			let clearCalled = false;
			tracker.onClear(() => {
				clearCalled = true;
			});

			tracker.start('g');
			expect(tracker.isPending()).toBe(true);

			// Manual clear triggers callback
			tracker.clear();
			expect(tracker.isPending()).toBe(false);
			expect(clearCalled).toBe(true);
		});
	});

	describe('Bindings module (vim/bindings.ts)', () => {
		it('exports expected binding arrays and types', async () => {
			// TypeScript will verify the type export at compile time
			// Runtime check that the module exports the expected binding arrays
			const bindings = await import('../bindings');
			expect(Object.keys(bindings).sort()).toEqual([
				'DEFAULT_ACTION_BINDINGS',
				'DEFAULT_LIST_BINDINGS',
				'DEFAULT_NAVIGATION_BINDINGS'
			]);
		});

		it('exports DEFAULT_NAVIGATION_BINDINGS', async () => {
			const { DEFAULT_NAVIGATION_BINDINGS } = await import('../bindings');
			expect(Array.isArray(DEFAULT_NAVIGATION_BINDINGS)).toBe(true);
			expect(DEFAULT_NAVIGATION_BINDINGS.length).toBeGreaterThan(0);

			// Verify structure of first binding
			const first = DEFAULT_NAVIGATION_BINDINGS[0];
			expect(first).toHaveProperty('id');
			expect(first).toHaveProperty('shortcut');
			expect(first.shortcut).toHaveProperty('key');
			expect(first.shortcut).toHaveProperty('description');
			expect(first.shortcut).toHaveProperty('category');
		});

		it('exports DEFAULT_LIST_BINDINGS', async () => {
			const { DEFAULT_LIST_BINDINGS } = await import('../bindings');
			expect(Array.isArray(DEFAULT_LIST_BINDINGS)).toBe(true);

			// Verify list bindings have j/k keys
			const keys = DEFAULT_LIST_BINDINGS.map((b) => b.shortcut.key);
			expect(keys).toContain('j');
			expect(keys).toContain('k');
		});

		it('exports DEFAULT_ACTION_BINDINGS', async () => {
			const { DEFAULT_ACTION_BINDINGS } = await import('../bindings');
			expect(Array.isArray(DEFAULT_ACTION_BINDINGS)).toBe(true);

			// Verify action bindings include r, c
			const keys = DEFAULT_ACTION_BINDINGS.map((b) => b.shortcut.key);
			expect(keys).toContain('r');
			expect(keys).toContain('c');
		});
	});

	describe('Modes module (vim/modes.ts)', () => {
		it('exports VimKeyboardManager class', async () => {
			const { VimKeyboardManager } = await import('../modes');
			expect(typeof VimKeyboardManager).toBe('function');
		});

		it('VimKeyboardManager has register/unregister methods', async () => {
			const { VimKeyboardManager } = await import('../modes');
			const manager = new VimKeyboardManager();

			expect(typeof manager.register).toBe('function');
			expect(typeof manager.unregister).toBe('function');
			expect(typeof manager.getShortcuts).toBe('function');
			expect(typeof manager.destroy).toBe('function');

			manager.destroy();
		});

		it('VimKeyboardManager has list navigation methods', async () => {
			const { VimKeyboardManager } = await import('../modes');
			const manager = new VimKeyboardManager();

			expect(typeof manager.registerList).toBe('function');
			expect(typeof manager.unregisterList).toBe('function');
			expect(typeof manager.setActiveList).toBe('function');
			expect(typeof manager.clearActiveList).toBe('function');
			expect(typeof manager.getSelectedItem).toBe('function');

			manager.destroy();
		});

		it('VimKeyboardManager has help methods', async () => {
			const { VimKeyboardManager } = await import('../modes');
			const manager = new VimKeyboardManager();

			expect(typeof manager.openHelp).toBe('function');
			expect(typeof manager.closeHelp).toBe('function');
			expect(typeof manager.toggleHelp).toBe('function');

			manager.destroy();
		});

		it('VimKeyboardManager has formatShortcut method', async () => {
			const { VimKeyboardManager } = await import('../modes');
			const manager = new VimKeyboardManager();

			expect(typeof manager.formatShortcut).toBe('function');

			// Test formatting
			expect(manager.formatShortcut('a')).toBe('A');
			expect(manager.formatShortcut('/')).toBe('/');
			expect(manager.formatShortcut('?')).toBe('?');
			expect(manager.formatShortcut(['g', 'd'])).toBe('g then d');

			manager.destroy();
		});
	});

	describe('Index barrel export (vim/index.ts)', () => {
		it('exports VimKeyboardManager from barrel', async () => {
			const { VimKeyboardManager } = await import('../index');
			expect(typeof VimKeyboardManager).toBe('function');
		});

		it('exports initializeVimShortcuts from barrel', async () => {
			const { initializeVimShortcuts } = await import('../index');
			expect(typeof initializeVimShortcuts).toBe('function');
		});

		it('exports getVimManager from barrel', async () => {
			const { getVimManager } = await import('../index');
			expect(typeof getVimManager).toBe('function');
		});

		it('exports vimList action from barrel', async () => {
			const { vimList } = await import('../index');
			expect(typeof vimList).toBe('function');
		});

		it('exports SEQUENCE_TIMEOUT from barrel', async () => {
			const { SEQUENCE_TIMEOUT } = await import('../index');
			expect(SEQUENCE_TIMEOUT).toBe(500);
		});

		it('exports SequenceTracker from barrel', async () => {
			const { SequenceTracker } = await import('../index');
			expect(typeof SequenceTracker).toBe('function');
		});

		it('exports binding arrays from barrel', async () => {
			const { DEFAULT_NAVIGATION_BINDINGS, DEFAULT_LIST_BINDINGS, DEFAULT_ACTION_BINDINGS } =
				await import('../index');

			expect(Array.isArray(DEFAULT_NAVIGATION_BINDINGS)).toBe(true);
			expect(Array.isArray(DEFAULT_LIST_BINDINGS)).toBe(true);
			expect(Array.isArray(DEFAULT_ACTION_BINDINGS)).toBe(true);
		});
	});

	describe('Backwards compatibility (keyboard-vim.ts)', () => {
		it('still exports VimKeyboardManager', async () => {
			const { VimKeyboardManager } = await import('../../keyboard-vim');
			expect(typeof VimKeyboardManager).toBe('function');
		});

		it('still exports initializeVimShortcuts', async () => {
			const { initializeVimShortcuts } = await import('../../keyboard-vim');
			expect(typeof initializeVimShortcuts).toBe('function');
		});

		it('still exports getVimManager', async () => {
			const { getVimManager } = await import('../../keyboard-vim');
			expect(typeof getVimManager).toBe('function');
		});

		it('still exports vimList', async () => {
			const { vimList } = await import('../../keyboard-vim');
			expect(typeof vimList).toBe('function');
		});
	});
});
