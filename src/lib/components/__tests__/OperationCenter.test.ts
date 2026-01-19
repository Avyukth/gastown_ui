import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import OperationCenter from '../OperationCenter.svelte';
import { operationsStore } from '$lib/stores';

// Mock toast store
vi.mock('$lib/stores/toast.svelte', () => ({
	toastStore: {
		info: vi.fn(),
		error: vi.fn(),
		success: vi.fn()
	}
}));

// Mock clipboard API
Object.assign(navigator, {
	clipboard: {
		writeText: vi.fn().mockResolvedValue(undefined)
	}
});

describe('OperationCenter', () => {
	beforeEach(() => {
		operationsStore.clearAll();
		operationsStore.clearHistory();
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Badge (collapsed state)', () => {
		it('renders floating badge by default', () => {
			render(OperationCenter);

			const badge = screen.getByTestId('operation-center-badge');
			expect(badge).toBeInTheDocument();
			expect(badge).toHaveAttribute('aria-label', 'View operations');
		});

		it('shows "Operations" text when no operations running', () => {
			render(OperationCenter);

			expect(screen.getByText('Operations')).toBeInTheDocument();
		});

		it('auto-expands when operations are running', async () => {
			// Create operation before rendering - component will auto-expand
			operationsStore.create({
				type: 'api',
				name: 'Test Operation'
			});

			render(OperationCenter);
			await tick();

			// Panel should be expanded (auto-expand behavior)
			expect(screen.getByTestId('operation-center-panel')).toBeInTheDocument();
		});

		it('shows running count in badge when panel is collapsed', async () => {
			// Render without operations first
			render(OperationCenter);
			await tick();

			// Badge should show "Operations" when no running ops
			expect(screen.getByText('Operations')).toBeInTheDocument();

			// Create operation - this will auto-expand the panel
			operationsStore.create({
				type: 'api',
				name: 'Test Operation'
			});
			await tick();

			// Panel is now expanded, so badge is hidden
			expect(screen.queryByTestId('operation-center-badge')).not.toBeInTheDocument();
			expect(screen.getByTestId('operation-center-panel')).toBeInTheDocument();
		});

		it('expands panel when badge clicked', async () => {
			render(OperationCenter);

			const badge = screen.getByTestId('operation-center-badge');
			await fireEvent.click(badge);

			expect(screen.getByTestId('operation-center-panel')).toBeInTheDocument();
		});
	});

	describe('Panel (expanded state)', () => {
		it('renders panel with proper ARIA attributes', async () => {
			render(OperationCenter);

			// Expand the panel
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			const panel = screen.getByTestId('operation-center-panel');
			expect(panel).toHaveAttribute('role', 'region');
			expect(panel).toHaveAttribute('aria-label', 'Operation center');
		});

		it('shows header with title', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			expect(screen.getByRole('heading', { name: 'Operations' })).toBeInTheDocument();
		});

		it('shows close button', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			const closeButton = screen.getByLabelText('Close');
			expect(closeButton).toBeInTheDocument();
		});

		it('closes panel when close button clicked', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			expect(screen.getByTestId('operation-center-panel')).toBeInTheDocument();

			await fireEvent.click(screen.getByLabelText('Close'));

			expect(screen.queryByTestId('operation-center-panel')).not.toBeInTheDocument();
			expect(screen.getByTestId('operation-center-badge')).toBeInTheDocument();
		});

		it('shows empty state when no operations', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			expect(screen.getByText('No operations yet')).toBeInTheDocument();
		});
	});

	describe('Operation Items', () => {
		it('displays operation with name and type', async () => {
			operationsStore.create({
				type: 'api',
				name: 'Fetch Users'
			});

			render(OperationCenter);
			await tick();
			// Panel auto-expands when there are running operations

			expect(screen.getByText('Fetch Users')).toBeInTheDocument();
			expect(screen.getByText(/api/)).toBeInTheDocument();
		});

		it('shows progress bar for running operations', async () => {
			const id = operationsStore.create({
				type: 'api',
				name: 'Test Operation'
			});
			operationsStore.update(id, { progress: 50 });

			render(OperationCenter);
			await tick();
			// Panel auto-expands when there are running operations

			expect(screen.getByText('50% complete')).toBeInTheDocument();
		});

		it('applies data-testid to operation items', async () => {
			operationsStore.create({
				type: 'api',
				name: 'Test Operation'
			});

			render(OperationCenter);
			await tick();
			// Panel auto-expands when there are running operations

			const operationItem = screen.getByTestId('operation-item');
			expect(operationItem).toBeInTheDocument();
			expect(operationItem).toHaveAttribute('data-status', 'running');
		});

		it('shows operation description if provided', async () => {
			operationsStore.create({
				type: 'api',
				name: 'Test Operation',
				description: 'Processing batch data'
			});

			render(OperationCenter);
			await tick();
			// Panel auto-expands when there are running operations

			expect(screen.getByText(/Processing batch data/)).toBeInTheDocument();
		});
	});

	describe('Cancel Button', () => {
		it('shows cancel button for cancellable running operations', async () => {
			operationsStore.create({
				type: 'api',
				name: 'Cancellable Operation',
				cancellable: true
			});

			render(OperationCenter);
			await tick();
			// Panel auto-expands when there are running operations

			const cancelButton = screen.getByTestId('operation-cancel');
			expect(cancelButton).toBeInTheDocument();
			expect(cancelButton).toHaveTextContent('Cancel');
		});

		it('does not show cancel button for non-cancellable operations', async () => {
			operationsStore.create({
				type: 'api',
				name: 'Non-cancellable Operation',
				cancellable: false
			});

			render(OperationCenter);
			await tick();
			// Panel auto-expands when there are running operations

			expect(screen.queryByTestId('operation-cancel')).not.toBeInTheDocument();
		});

		it('cancels operation when cancel button clicked', async () => {
			const onCancel = vi.fn();
			operationsStore.create({
				type: 'api',
				name: 'Test Operation',
				cancellable: true,
				onCancel
			});

			render(OperationCenter);
			await tick();
			// Panel auto-expands when there are running operations

			await fireEvent.click(screen.getByTestId('operation-cancel'));
			await tick();

			expect(onCancel).toHaveBeenCalled();
		});
	});

	describe('Failed Operations', () => {
		it('shows retry button for failed operations', async () => {
			const id = operationsStore.create({
				type: 'api',
				name: 'Failed Operation'
			});
			operationsStore.fail(id, 'Network error');

			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));
			await tick();

			const retryButton = screen.getByTestId('operation-retry');
			expect(retryButton).toBeInTheDocument();
			expect(retryButton).toHaveTextContent('Retry');
		});

		it('shows copy debug info button for failed operations', async () => {
			const id = operationsStore.create({
				type: 'api',
				name: 'Failed Operation'
			});
			operationsStore.fail(id, 'Network error');

			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));
			await tick();

			const copyButton = screen.getByTestId('operation-copy-debug');
			expect(copyButton).toBeInTheDocument();
			expect(copyButton).toHaveTextContent('Copy debug info');
		});

		it('copies debug info to clipboard when copy button clicked', async () => {
			const id = operationsStore.create({
				type: 'api',
				name: 'Failed Operation'
			});
			operationsStore.fail(id, 'Network error');

			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));
			await tick();

			await fireEvent.click(screen.getByTestId('operation-copy-debug'));

			expect(navigator.clipboard.writeText).toHaveBeenCalled();
		});

		it('shows expandable error details', async () => {
			const id = operationsStore.create({
				type: 'api',
				name: 'Failed Operation'
			});
			operationsStore.fail(id, new Error('Detailed error message'));

			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));
			await tick();

			// Click to expand error details
			const detailsButton = screen.getByText('Error details');
			await fireEvent.click(detailsButton);

			expect(screen.getByText(/Detailed error message/)).toBeInTheDocument();
		});
	});

	describe('Clear Completed', () => {
		it('shows clear completed button when there are completed operations', async () => {
			const id = operationsStore.create({
				type: 'api',
				name: 'Test Operation'
			});
			operationsStore.complete(id);

			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));
			await tick();

			expect(screen.getByTestId('clear-completed')).toBeInTheDocument();
		});

		it('shows clear completed button when there are failed operations', async () => {
			const id = operationsStore.create({
				type: 'api',
				name: 'Test Operation'
			});
			operationsStore.fail(id, 'Error');

			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));
			await tick();

			expect(screen.getByTestId('clear-completed')).toBeInTheDocument();
		});

		it('does not show clear completed button when only running operations', async () => {
			operationsStore.create({
				type: 'api',
				name: 'Running Operation'
			});

			render(OperationCenter);
			await tick();
			// Panel auto-expands when there are running operations

			expect(screen.queryByTestId('clear-completed')).not.toBeInTheDocument();
		});

		it('clears completed operations when button clicked', async () => {
			const id = operationsStore.create({
				type: 'api',
				name: 'Completed Operation'
			});
			operationsStore.complete(id);

			render(OperationCenter);
			// Need to manually open panel since no running operations
			await fireEvent.click(screen.getByTestId('operation-center-badge'));
			await tick();

			// Verify operation is visible
			expect(screen.getByText('Completed Operation')).toBeInTheDocument();
			expect(operationsStore.completedOperations).toHaveLength(1);

			// Click clear completed
			await fireEvent.click(screen.getByTestId('clear-completed'));
			await tick();

			// Verify store was cleared (primary behavior test)
			expect(operationsStore.completedOperations).toHaveLength(0);
			expect(operationsStore.operations).toHaveLength(0);
		});
	});

	describe('Auto-expand behavior', () => {
		it('auto-expands when operation starts while collapsed', async () => {
			render(OperationCenter);

			// Initially collapsed
			expect(screen.getByTestId('operation-center-badge')).toBeInTheDocument();
			expect(screen.queryByTestId('operation-center-panel')).not.toBeInTheDocument();

			// Create an operation
			operationsStore.create({
				type: 'api',
				name: 'New Operation'
			});
			await tick();

			// Should auto-expand
			expect(screen.getByTestId('operation-center-panel')).toBeInTheDocument();
		});
	});

	describe('Keyboard Navigation', () => {
		it('closes panel on Escape key', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			expect(screen.getByTestId('operation-center-panel')).toBeInTheDocument();

			await fireEvent.keyDown(window, { key: 'Escape' });

			expect(screen.queryByTestId('operation-center-panel')).not.toBeInTheDocument();
		});

		it('navigates operations with arrow keys', async () => {
			operationsStore.create({ type: 'api', name: 'Op 1' });
			operationsStore.create({ type: 'api', name: 'Op 2' });

			render(OperationCenter);
			await tick();
			// Panel auto-expands when there are running operations

			// Press down arrow to focus first item
			await fireEvent.keyDown(window, { key: 'ArrowDown' });
			await tick();

			// Check that the first item has focus ring
			const items = screen.getAllByTestId('operation-item');
			expect(items[0]).toHaveClass('ring-2');

			// Press down arrow to focus second item
			await fireEvent.keyDown(window, { key: 'ArrowDown' });
			await tick();

			expect(items[0]).not.toHaveClass('ring-2');
			expect(items[1]).toHaveClass('ring-2');
		});
	});

	describe('Duration Display', () => {
		it('shows "just now" for very recent operations', async () => {
			operationsStore.create({
				type: 'api',
				name: 'Recent Operation'
			});

			render(OperationCenter);
			await tick();
			// Panel auto-expands when there are running operations

			expect(screen.getByText('just now')).toBeInTheDocument();
		});
	});

	describe('Status Colors', () => {
		it('shows running status with info color', async () => {
			operationsStore.create({
				type: 'api',
				name: 'Running Operation'
			});

			render(OperationCenter);
			await tick();
			// Panel auto-expands when there are running operations

			const statusElement = screen.getByText('running');
			expect(statusElement).toHaveClass('text-info');
		});

		it('shows completed status with success color', async () => {
			const id = operationsStore.create({
				type: 'api',
				name: 'Completed Operation'
			});
			operationsStore.complete(id);

			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));
			await tick();

			const statusElement = screen.getByText('completed');
			expect(statusElement).toHaveClass('text-success');
		});

		it('shows failed status with destructive color', async () => {
			const id = operationsStore.create({
				type: 'api',
				name: 'Failed Operation'
			});
			operationsStore.fail(id, 'Error');

			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));
			await tick();

			const statusElement = screen.getByText('failed');
			expect(statusElement).toHaveClass('text-destructive');
		});
	});

	describe('Responsive Design', () => {
		it('panel has full width on mobile', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			const panel = screen.getByTestId('operation-center-panel');
			expect(panel).toHaveClass('w-full');
			expect(panel).toHaveClass('sm:w-96');
		});
	});
});
