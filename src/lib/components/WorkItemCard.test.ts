/**
 * WorkItemCard Component Tests
 *
 * Tests for rendering, type variants, expansion, selection,
 * and accessibility.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import WorkItemCard from './WorkItemCard.svelte';
import type { WorkItem } from './WorkItemCard.svelte';

// Sample work items for testing
const mockTaskItem: WorkItem = {
	id: 'gt-123',
	title: 'Implement login feature',
	type: 'task',
	status: 'open',
	priority: 2,
	assignee: 'john',
	description: 'Implement OAuth login flow',
	created: '2024-01-15',
	updated: '2024-01-16'
};

const mockBugItem: WorkItem = {
	id: 'gt-456',
	title: 'Fix authentication timeout',
	type: 'bug',
	status: 'in_progress',
	priority: 1
};

const mockFeatureItem: WorkItem = {
	id: 'gt-789',
	title: 'Add dark mode support',
	type: 'feature',
	status: 'done',
	priority: 3
};

const mockEpicItem: WorkItem = {
	id: 'gt-abc',
	title: 'User Authentication System',
	type: 'epic',
	status: 'blocked',
	priority: 0
};

describe('WorkItemCard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Basic Rendering', () => {
		it('renders item ID', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			expect(screen.getByText('gt-123')).toBeInTheDocument();
		});

		it('renders item title', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			expect(screen.getByText('Implement login feature')).toBeInTheDocument();
		});

		it('renders as article element', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			expect(screen.getByRole('button')).toBeInTheDocument();
		});

		it('renders priority badge', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			expect(screen.getByText('P2')).toBeInTheDocument();
		});

		it('renders P0 for critical priority', () => {
			render(WorkItemCard, { props: { item: mockEpicItem } });
			expect(screen.getByText('P0')).toBeInTheDocument();
		});
	});

	describe('Type Variants', () => {
		it('renders task type badge', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			expect(screen.getByText('Task')).toBeInTheDocument();
		});

		it('renders bug type badge', () => {
			render(WorkItemCard, { props: { item: mockBugItem } });
			expect(screen.getByText('Bug')).toBeInTheDocument();
		});

		it('renders feature type badge', () => {
			render(WorkItemCard, { props: { item: mockFeatureItem } });
			expect(screen.getByText('Feature')).toBeInTheDocument();
		});

		it('renders epic type badge', () => {
			render(WorkItemCard, { props: { item: mockEpicItem } });
			expect(screen.getByText('Epic')).toBeInTheDocument();
		});

		it('has info border color for task type', () => {
			const { container } = render(WorkItemCard, { props: { item: mockTaskItem } });
			const card = container.querySelector('article');
			expect(card).toHaveClass('border-l-info');
		});

		it('has destructive border color for bug type', () => {
			const { container } = render(WorkItemCard, { props: { item: mockBugItem } });
			const card = container.querySelector('article');
			expect(card).toHaveClass('border-l-destructive');
		});

		it('has success border color for feature type', () => {
			const { container } = render(WorkItemCard, { props: { item: mockFeatureItem } });
			const card = container.querySelector('article');
			expect(card).toHaveClass('border-l-success');
		});
	});

	describe('Status Display', () => {
		it('renders Open status', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			expect(screen.getByText('Open')).toBeInTheDocument();
		});

		it('renders In Progress status', () => {
			render(WorkItemCard, { props: { item: mockBugItem } });
			expect(screen.getByText('In Progress')).toBeInTheDocument();
		});

		it('renders Done status', () => {
			render(WorkItemCard, { props: { item: mockFeatureItem } });
			expect(screen.getByText('Done')).toBeInTheDocument();
		});

		it('renders Blocked status', () => {
			render(WorkItemCard, { props: { item: mockEpicItem } });
			expect(screen.getByText('Blocked')).toBeInTheDocument();
		});
	});

	describe('Assignee Display', () => {
		it('renders assignee when provided', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			expect(screen.getByText('john')).toBeInTheDocument();
		});

		it('does not render assignee when not provided', () => {
			render(WorkItemCard, { props: { item: mockBugItem } });
			expect(screen.queryByText(/assignee/i)).not.toBeInTheDocument();
		});
	});

	describe('Expansion', () => {
		it('has aria-expanded="false" by default', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
		});

		it('has aria-expanded="true" when expanded', () => {
			render(WorkItemCard, { props: { item: mockTaskItem, expanded: true } });
			expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
		});

		it('shows description when expanded', () => {
			render(WorkItemCard, { props: { item: mockTaskItem, expanded: true } });
			expect(screen.getByText('Implement OAuth login flow')).toBeInTheDocument();
		});

		it('hides description when collapsed', () => {
			render(WorkItemCard, { props: { item: mockTaskItem, expanded: false } });
			expect(screen.queryByText('Implement OAuth login flow')).not.toBeInTheDocument();
		});

		it('shows created date when expanded', () => {
			render(WorkItemCard, { props: { item: mockTaskItem, expanded: true } });
			expect(screen.getByText(/created.*2024-01-15/i)).toBeInTheDocument();
		});

		it('shows updated date when expanded', () => {
			render(WorkItemCard, { props: { item: mockTaskItem, expanded: true } });
			expect(screen.getByText(/updated.*2024-01-16/i)).toBeInTheDocument();
		});

		it('calls onexpand callback when clicked', async () => {
			const handleExpand = vi.fn();
			render(WorkItemCard, {
				props: { item: mockTaskItem, onexpand: handleExpand }
			});
			await fireEvent.click(screen.getByRole('button'));
			expect(handleExpand).toHaveBeenCalledWith('gt-123');
		});

		it('rotates chevron when expanded', () => {
			const { container } = render(WorkItemCard, {
				props: { item: mockTaskItem, expanded: true }
			});
			const chevron = container.querySelector('svg[aria-hidden="true"]');
			expect(chevron).toHaveClass('rotate-180');
		});
	});

	describe('Selection', () => {
		it('does not show checkbox by default', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
		});

		it('shows checkbox when selectable', () => {
			render(WorkItemCard, { props: { item: mockTaskItem, selectable: true } });
			expect(screen.getByRole('checkbox')).toBeInTheDocument();
		});

		it('checkbox is unchecked by default', () => {
			render(WorkItemCard, { props: { item: mockTaskItem, selectable: true } });
			expect(screen.getByRole('checkbox')).not.toBeChecked();
		});

		it('checkbox is checked when selected', () => {
			render(WorkItemCard, {
				props: { item: mockTaskItem, selectable: true, selected: true }
			});
			expect(screen.getByRole('checkbox')).toBeChecked();
		});

		it('has ring styling when selected', () => {
			const { container } = render(WorkItemCard, {
				props: { item: mockTaskItem, selected: true }
			});
			const card = container.querySelector('article');
			expect(card).toHaveClass('ring-2');
			expect(card).toHaveClass('ring-primary');
		});

		it('checkbox has accessible label', () => {
			render(WorkItemCard, { props: { item: mockTaskItem, selectable: true } });
			expect(screen.getByRole('checkbox')).toHaveAttribute(
				'aria-label',
				'Select gt-123'
			);
		});
	});

	describe('Keyboard Interaction', () => {
		it('expands on Enter key', async () => {
			const handleExpand = vi.fn();
			render(WorkItemCard, {
				props: { item: mockTaskItem, onexpand: handleExpand }
			});
			const card = screen.getByRole('button');
			await fireEvent.keyDown(card, { key: 'Enter' });
			expect(handleExpand).toHaveBeenCalledWith('gt-123');
		});

		it('expands on Space key', async () => {
			const handleExpand = vi.fn();
			render(WorkItemCard, {
				props: { item: mockTaskItem, onexpand: handleExpand }
			});
			const card = screen.getByRole('button');
			await fireEvent.keyDown(card, { key: ' ' });
			expect(handleExpand).toHaveBeenCalledWith('gt-123');
		});
	});

	describe('Accessibility', () => {
		it('has role="button"', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			expect(screen.getByRole('button')).toBeInTheDocument();
		});

		it('has tabindex for keyboard focus', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
		});

		it('title is in heading element', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
				'Implement login feature'
			);
		});

		it('chevron icon is hidden from screen readers', () => {
			const { container } = render(WorkItemCard, { props: { item: mockTaskItem } });
			const chevron = container.querySelector('svg[aria-hidden="true"]');
			expect(chevron).toBeInTheDocument();
		});
	});

	describe('Custom Classes', () => {
		it('accepts custom class names', () => {
			const { container } = render(WorkItemCard, {
				props: { item: mockTaskItem, class: 'my-custom-class' }
			});
			const card = container.querySelector('article');
			expect(card).toHaveClass('my-custom-class');
		});
	});

	describe('Priority Styling', () => {
		it('P0 has destructive styling', () => {
			const { container } = render(WorkItemCard, { props: { item: mockEpicItem } });
			const priorityBadge = screen.getByText('P0');
			expect(priorityBadge).toHaveClass('bg-destructive/20');
		});

		it('P1 has warning styling', () => {
			const { container } = render(WorkItemCard, { props: { item: mockBugItem } });
			const priorityBadge = screen.getByText('P1');
			expect(priorityBadge).toHaveClass('bg-warning/20');
		});

		it('P2 has info styling', () => {
			render(WorkItemCard, { props: { item: mockTaskItem } });
			const priorityBadge = screen.getByText('P2');
			expect(priorityBadge).toHaveClass('bg-info/20');
		});

		it('P3 has muted styling', () => {
			render(WorkItemCard, { props: { item: mockFeatureItem } });
			const priorityBadge = screen.getByText('P3');
			expect(priorityBadge).toHaveClass('bg-muted');
		});
	});
});
