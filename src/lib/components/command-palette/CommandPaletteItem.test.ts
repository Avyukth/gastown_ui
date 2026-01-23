/**
 * CommandPaletteItem Component Tests
 *
 * Tests for individual palette result item rendering.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { CommandPaletteItem } from './index';
import { Bot } from 'lucide-svelte';

describe('CommandPaletteItem', () => {
	const mockResult = {
		type: 'agent' as const,
		id: 'test-agent',
		label: 'Test Agent',
		sublabel: 'running - doing work',
		icon: Bot,
		action: vi.fn()
	};

	describe('Rendering', () => {
		it('renders label text', () => {
			render(CommandPaletteItem, {
				props: {
					result: mockResult,
					isSelected: false,
					index: 0
				}
			});
			expect(screen.getByText('Test Agent')).toBeInTheDocument();
		});

		it('renders sublabel when provided', () => {
			render(CommandPaletteItem, {
				props: {
					result: mockResult,
					isSelected: false,
					index: 0
				}
			});
			expect(screen.getByText('running - doing work')).toBeInTheDocument();
		});

		it('renders without sublabel when not provided', () => {
			const resultWithoutSublabel = {
				...mockResult,
				sublabel: undefined
			};
			render(CommandPaletteItem, {
				props: {
					result: resultWithoutSublabel,
					isSelected: false,
					index: 0
				}
			});
			expect(screen.getByText('Test Agent')).toBeInTheDocument();
			expect(screen.queryByText('running - doing work')).not.toBeInTheDocument();
		});

		it('has option role for accessibility', () => {
			render(CommandPaletteItem, {
				props: {
					result: mockResult,
					isSelected: false,
					index: 0
				}
			});
			expect(screen.getByRole('option')).toBeInTheDocument();
		});

		it('has correct aria-selected when selected', () => {
			render(CommandPaletteItem, {
				props: {
					result: mockResult,
					isSelected: true,
					index: 0
				}
			});
			expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
		});

		it('has correct aria-selected when not selected', () => {
			render(CommandPaletteItem, {
				props: {
					result: mockResult,
					isSelected: false,
					index: 0
				}
			});
			expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'false');
		});

		it('has correct id based on index', () => {
			render(CommandPaletteItem, {
				props: {
					result: mockResult,
					isSelected: false,
					index: 5
				}
			});
			expect(screen.getByRole('option')).toHaveAttribute('id', 'cmd-result-5');
		});
	});

	describe('Interactions', () => {
		it('calls action on click', async () => {
			const action = vi.fn();
			render(CommandPaletteItem, {
				props: {
					result: { ...mockResult, action },
					isSelected: false,
					index: 0
				}
			});
			await fireEvent.click(screen.getByRole('option'));
			expect(action).toHaveBeenCalledTimes(1);
		});

		it('dispatches select event on mouseenter', async () => {
			const { component } = render(CommandPaletteItem, {
				props: {
					result: mockResult,
					isSelected: false,
					index: 3
				}
			});
			let selectedIndex = -1;
			component.$on('select', (e: CustomEvent<number>) => {
				selectedIndex = e.detail;
			});
			await fireEvent.mouseEnter(screen.getByRole('option'));
			expect(selectedIndex).toBe(3);
		});
	});

	describe('Visual States', () => {
		it('shows enter hint when selected', () => {
			render(CommandPaletteItem, {
				props: {
					result: mockResult,
					isSelected: true,
					index: 0
				}
			});
			// Selected item should show the enter/return indicator
			const item = screen.getByRole('option');
			expect(item).toHaveAttribute('aria-selected', 'true');
		});

		it('applies dimmed styling for recent items when not selected', () => {
			const recentResult = {
				...mockResult,
				type: 'recent' as const
			};
			render(CommandPaletteItem, {
				props: {
					result: recentResult,
					isSelected: false,
					index: 0
				}
			});
			// Recent items should have reduced opacity when not selected
			expect(screen.getByRole('option')).toBeInTheDocument();
		});
	});
});
