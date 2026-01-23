/**
 * CommandPaletteList Component Tests
 *
 * Tests for grouped results list rendering.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { CommandPaletteList } from './index';
import { Bot, FileText, Home } from 'lucide-svelte';
import type { PaletteResult } from './types';

describe('CommandPaletteList', () => {
	const createMockResults = (): PaletteResult[] => [
		{
			type: 'agent',
			id: 'agent-1',
			label: 'Agent One',
			sublabel: 'running',
			icon: Bot,
			action: vi.fn()
		},
		{
			type: 'agent',
			id: 'agent-2',
			label: 'Agent Two',
			sublabel: 'idle',
			icon: Bot,
			action: vi.fn()
		},
		{
			type: 'issue',
			id: 'issue-1',
			label: 'Bug Fix',
			sublabel: 'high priority',
			icon: FileText,
			action: vi.fn()
		},
		{
			type: 'route',
			id: 'dashboard',
			label: 'Dashboard',
			sublabel: 'Home page',
			icon: Home,
			action: vi.fn()
		}
	];

	describe('Rendering', () => {
		it('renders listbox role', () => {
			render(CommandPaletteList, {
				props: {
					results: createMockResults(),
					selectedIndex: 0
				}
			});
			expect(screen.getByRole('listbox')).toBeInTheDocument();
		});

		it('renders all result items', () => {
			const results = createMockResults();
			render(CommandPaletteList, {
				props: {
					results,
					selectedIndex: 0
				}
			});
			expect(screen.getByText('Agent One')).toBeInTheDocument();
			expect(screen.getByText('Agent Two')).toBeInTheDocument();
			expect(screen.getByText('Bug Fix')).toBeInTheDocument();
			expect(screen.getByText('Dashboard')).toBeInTheDocument();
		});

		it('renders group headers', () => {
			render(CommandPaletteList, {
				props: {
					results: createMockResults(),
					selectedIndex: 0
				}
			});
			// Should have group labels for different types
			expect(screen.getByText('Agents')).toBeInTheDocument();
			expect(screen.getByText('Issues')).toBeInTheDocument();
			expect(screen.getByText('Navigation')).toBeInTheDocument();
		});

		it('renders empty state when no results and has search query', () => {
			render(CommandPaletteList, {
				props: {
					results: [],
					selectedIndex: 0,
					searchQuery: 'nonexistent'
				}
			});
			expect(screen.getByText(/no results for/i)).toBeInTheDocument();
		});

		it('renders suggestions when no results and no search query', () => {
			render(CommandPaletteList, {
				props: {
					results: [],
					selectedIndex: 0,
					searchQuery: ''
				}
			});
			expect(screen.getByText(/try searching for/i)).toBeInTheDocument();
		});
	});

	describe('Selection', () => {
		it('marks correct item as selected', () => {
			render(CommandPaletteList, {
				props: {
					results: createMockResults(),
					selectedIndex: 2
				}
			});
			const options = screen.getAllByRole('option');
			expect(options[0]).toHaveAttribute('aria-selected', 'false');
			expect(options[1]).toHaveAttribute('aria-selected', 'false');
			expect(options[2]).toHaveAttribute('aria-selected', 'true');
			expect(options[3]).toHaveAttribute('aria-selected', 'false');
		});

		it('dispatches select event when item is hovered', async () => {
			const { component } = render(CommandPaletteList, {
				props: {
					results: createMockResults(),
					selectedIndex: 0
				}
			});
			let newIndex = -1;
			component.$on('select', (e: CustomEvent<number>) => {
				newIndex = e.detail;
			});
			const options = screen.getAllByRole('option');
			await fireEvent.mouseEnter(options[2]);
			expect(newIndex).toBe(2);
		});
	});

	describe('Grouping', () => {
		it('groups results by type', () => {
			render(CommandPaletteList, {
				props: {
					results: createMockResults(),
					selectedIndex: 0
				}
			});
			// Agents should be grouped together
			const agentTexts = screen.getAllByText(/Agent/);
			expect(agentTexts.length).toBeGreaterThanOrEqual(2);
		});

		it('groups results by category when provided', () => {
			const resultsWithCategory: PaletteResult[] = [
				{
					type: 'command',
					id: 'cmd-1',
					label: 'Command 1',
					category: 'agents',
					action: vi.fn()
				},
				{
					type: 'command',
					id: 'cmd-2',
					label: 'Command 2',
					category: 'agents',
					action: vi.fn()
				},
				{
					type: 'command',
					id: 'cmd-3',
					label: 'Command 3',
					category: 'work',
					action: vi.fn()
				}
			];
			render(CommandPaletteList, {
				props: {
					results: resultsWithCategory,
					selectedIndex: 0
				}
			});
			expect(screen.getByText('Agent Commands')).toBeInTheDocument();
			expect(screen.getByText('Work Commands')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has aria-label on listbox', () => {
			render(CommandPaletteList, {
				props: {
					results: createMockResults(),
					selectedIndex: 0
				}
			});
			expect(screen.getByRole('listbox')).toHaveAttribute(
				'aria-label',
				'Command palette results'
			);
		});

		it('passes correct IDs to items for aria-activedescendant', () => {
			render(CommandPaletteList, {
				props: {
					results: createMockResults(),
					selectedIndex: 1
				}
			});
			const options = screen.getAllByRole('option');
			expect(options[0]).toHaveAttribute('id', 'cmd-result-0');
			expect(options[1]).toHaveAttribute('id', 'cmd-result-1');
			expect(options[2]).toHaveAttribute('id', 'cmd-result-2');
		});
	});

	describe('Mode-specific empty states', () => {
		it('shows command mode hint in empty state for search mode', () => {
			render(CommandPaletteList, {
				props: {
					results: [],
					selectedIndex: 0,
					searchQuery: 'xyz',
					activeMode: 'search'
				}
			});
			// Should suggest using > for commands
			expect(screen.getByText('>')).toBeInTheDocument();
		});

		it('shows different hint in command mode empty state', () => {
			render(CommandPaletteList, {
				props: {
					results: [],
					selectedIndex: 0,
					searchQuery: 'xyz',
					activeMode: 'command'
				}
			});
			// Should not suggest > since already in command mode
			expect(screen.getByText(/different search term/i)).toBeInTheDocument();
		});
	});
});
