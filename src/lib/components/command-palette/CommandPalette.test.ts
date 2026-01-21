/**
 * CommandPalette Component Tests
 *
 * Tests for open/close, search, keyboard navigation, mode switching,
 * and accessibility.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import CommandPalette from './CommandPalette.svelte';

// Mock $app/navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

describe('CommandPalette', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Trigger Button', () => {
		it('renders trigger button', () => {
			render(CommandPalette);
			expect(screen.getByRole('button', { name: /open command palette/i })).toBeInTheDocument();
		});

		it('shows keyboard shortcut hint', () => {
			render(CommandPalette);
			const button = screen.getByRole('button', { name: /open command palette/i });
			expect(button).toHaveTextContent(/command/i);
		});

		it('opens palette on click', async () => {
			render(CommandPalette);
			const trigger = screen.getByRole('button', { name: /open command palette/i });
			await fireEvent.click(trigger);
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});
	});

	describe('Modal Behavior', () => {
		it('opens modal on Cmd+K', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('opens modal on Ctrl+K', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('closes on Escape', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			expect(screen.getByRole('dialog')).toBeInTheDocument();
			await fireEvent.keyDown(window, { key: 'Escape' });
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});

		it('closes on backdrop click', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const backdrop = screen.getByRole('button', { name: /close command palette/i });
			await fireEvent.click(backdrop);
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});

		it('focuses input when opened', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			await waitFor(() => {
				expect(screen.getByRole('combobox')).toHaveFocus();
			});
		});
	});

	describe('Search Mode (Default)', () => {
		it('shows recent items when no query', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			// Recent items should be visible
			expect(screen.getByText('Recent')).toBeInTheDocument();
		});

		it('filters agents by search query', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			await fireEvent.input(input, { target: { value: 'mayor' } });
			expect(screen.getByText('Mayor')).toBeInTheDocument();
		});

		it('filters issues by search query', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			await fireEvent.input(input, { target: { value: 'authentication' } });
			expect(screen.getByText('Authentication')).toBeInTheDocument();
		});

		it('filters routes by search query', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			await fireEvent.input(input, { target: { value: 'dashboard' } });
			expect(screen.getByText('Dashboard')).toBeInTheDocument();
		});

		it('shows empty state when no results', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			await fireEvent.input(input, { target: { value: 'xyznonexistent' } });
			expect(screen.getByText(/no results for/i)).toBeInTheDocument();
		});
	});

	describe('Command Mode (> prefix)', () => {
		it('switches to command mode with > prefix', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			await fireEvent.input(input, { target: { value: '>' } });
			expect(screen.getByText('Commands')).toBeInTheDocument();
		});

		it('shows available commands', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			await fireEvent.input(input, { target: { value: '>' } });
			expect(screen.getByText('Spawn Polecat')).toBeInTheDocument();
			expect(screen.getByText('New Issue')).toBeInTheDocument();
		});

		it('filters commands by query', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			await fireEvent.input(input, { target: { value: '>spawn' } });
			expect(screen.getByText('Spawn Polecat')).toBeInTheDocument();
			expect(screen.queryByText('New Issue')).not.toBeInTheDocument();
		});
	});

	describe('Formula Mode (: prefix)', () => {
		it('switches to formula mode with : prefix', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			await fireEvent.input(input, { target: { value: ':' } });
			expect(screen.getByText('Formulas')).toBeInTheDocument();
		});

		it('shows available formulas', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			await fireEvent.input(input, { target: { value: ':' } });
			expect(screen.getByText('bd ready')).toBeInTheDocument();
			expect(screen.getByText('gt status')).toBeInTheDocument();
		});

		it('filters formulas by query', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			await fireEvent.input(input, { target: { value: ':bd' } });
			expect(screen.getByText('bd ready')).toBeInTheDocument();
			expect(screen.queryByText('gt status')).not.toBeInTheDocument();
		});
	});

	describe('Keyboard Navigation', () => {
		it('navigates down with ArrowDown', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			// Focus on first item
			await fireEvent.keyDown(input, { key: 'ArrowDown' });
			// Check that selection moved (first item becomes selected)
			const options = screen.getAllByRole('option');
			expect(options[1]).toHaveAttribute('aria-selected', 'true');
		});

		it('navigates up with ArrowUp', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			// Move down first
			await fireEvent.keyDown(input, { key: 'ArrowDown' });
			await fireEvent.keyDown(input, { key: 'ArrowDown' });
			// Then up
			await fireEvent.keyDown(input, { key: 'ArrowUp' });
			const options = screen.getAllByRole('option');
			expect(options[1]).toHaveAttribute('aria-selected', 'true');
		});

		it('selects item with Enter', async () => {
			const { goto } = await import('$app/navigation');
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const input = screen.getByRole('combobox');
			// First item is selected by default, press Enter to execute
			await fireEvent.keyDown(input, { key: 'Enter' });
			// Dialog should close after selection
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has accessible dialog role', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const dialog = screen.getByRole('dialog');
			expect(dialog).toHaveAttribute('aria-modal', 'true');
		});

		it('has labeled dialog', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			// Dialog should have a title (screen-reader only)
			expect(screen.getByRole('heading', { name: 'Command Palette' })).toBeInTheDocument();
		});

		it('has combobox with proper ARIA attributes', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const combobox = screen.getByRole('combobox');
			expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');
			expect(combobox).toHaveAttribute('aria-autocomplete', 'list');
		});

		it('has listbox for results', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			expect(screen.getByRole('listbox')).toBeInTheDocument();
		});

		it('results have option role', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const options = screen.getAllByRole('option');
			expect(options.length).toBeGreaterThan(0);
		});

		it('active option has aria-selected', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const options = screen.getAllByRole('option');
			expect(options[0]).toHaveAttribute('aria-selected', 'true');
		});

		it('combobox references active descendant', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			const combobox = screen.getByRole('combobox');
			const activeDescendant = combobox.getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeTruthy();
		});
	});

	describe('Footer Hints', () => {
		it('shows keyboard navigation hints', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			expect(screen.getByText('navigate')).toBeInTheDocument();
			expect(screen.getByText('select')).toBeInTheDocument();
		});

		it('shows mode switch hints', async () => {
			render(CommandPalette);
			await fireEvent.keyDown(window, { key: 'k', metaKey: true });
			expect(screen.getByText('commands')).toBeInTheDocument();
			expect(screen.getByText('formulas')).toBeInTheDocument();
		});
	});

	describe('Custom Classes', () => {
		it('accepts custom class names', () => {
			render(CommandPalette, { props: { class: 'my-custom-class' } });
			const button = screen.getByRole('button', { name: /open command palette/i });
			expect(button).toHaveClass('my-custom-class');
		});
	});
});
