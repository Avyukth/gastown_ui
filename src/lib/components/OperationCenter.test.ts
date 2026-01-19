/**
 * OperationCenter Component Tests
 *
 * Tests for basic component functionality without store mocking.
 * Store integration is tested via the operations store tests.
 *
 * Note: Full integration tests with store would require E2E testing
 * due to Svelte's compile-time import resolution.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

// Mock stores before they're loaded by the component
vi.mock('$lib/stores/toast.svelte', () => ({
	toastStore: {
		info: vi.fn(),
		error: vi.fn(),
		success: vi.fn()
	}
}));

vi.mock('$lib/stores/operations.svelte', () => ({
	operationsStore: {
		hasRunning: false,
		operations: [],
		runningOperations: [],
		completedOperations: [],
		failedOperations: [],
		cancel: vi.fn().mockResolvedValue(true),
		clearCompleted: vi.fn()
	}
}));

// Import component after mocks
import OperationCenter from './OperationCenter.svelte';

describe('OperationCenter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Collapsed Badge State', () => {
		it('renders floating badge when collapsed', () => {
			render(OperationCenter);
			expect(screen.getByTestId('operation-center-badge')).toBeInTheDocument();
		});

		it('shows "Operations" text when no operations are running', () => {
			render(OperationCenter);
			expect(screen.getByText('Operations')).toBeInTheDocument();
		});

		it('has proper aria-label for accessibility', () => {
			render(OperationCenter);
			const badge = screen.getByTestId('operation-center-badge');
			expect(badge).toHaveAttribute('aria-label', 'View operations');
		});

		it('badge is a button element', () => {
			render(OperationCenter);
			const badge = screen.getByTestId('operation-center-badge');
			expect(badge.tagName.toLowerCase()).toBe('button');
		});
	});

	describe('Expanded Panel State', () => {
		it('opens panel when badge is clicked', async () => {
			render(OperationCenter);
			const badge = screen.getByTestId('operation-center-badge');

			await fireEvent.click(badge);

			expect(screen.getByTestId('operation-center-panel')).toBeInTheDocument();
		});

		it('hides badge when panel is open', async () => {
			render(OperationCenter);
			const badge = screen.getByTestId('operation-center-badge');

			await fireEvent.click(badge);

			expect(screen.queryByTestId('operation-center-badge')).not.toBeInTheDocument();
		});

		it('shows backdrop when panel is open', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			expect(screen.getByTestId('operation-center-backdrop')).toBeInTheDocument();
		});

		it('closes panel when backdrop is clicked', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));
			await fireEvent.click(screen.getByTestId('operation-center-backdrop'));

			expect(screen.queryByTestId('operation-center-panel')).not.toBeInTheDocument();
			expect(screen.getByTestId('operation-center-badge')).toBeInTheDocument();
		});

		it('closes panel when close button is clicked', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));
			await fireEvent.click(screen.getByTestId('operation-center-close'));

			expect(screen.queryByTestId('operation-center-panel')).not.toBeInTheDocument();
		});

		it('has proper ARIA role and label', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			const panel = screen.getByTestId('operation-center-panel');
			expect(panel).toHaveAttribute('role', 'dialog');
			expect(panel).toHaveAttribute('aria-modal', 'true');
			expect(panel).toHaveAttribute('aria-label', 'Operation center');
		});
	});

	describe('Empty State', () => {
		it('shows empty state when no operations', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			expect(screen.getByTestId('operation-empty-state')).toBeInTheDocument();
			expect(screen.getByText('No operations yet')).toBeInTheDocument();
		});
	});

	describe('Keyboard Navigation', () => {
		it('closes panel when Escape is pressed', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			const panel = screen.getByTestId('operation-center-panel');
			await fireEvent.keyDown(panel, { key: 'Escape' });

			expect(screen.queryByTestId('operation-center-panel')).not.toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('badge has accessible name', () => {
			render(OperationCenter);
			const badge = screen.getByTestId('operation-center-badge');
			expect(badge).toHaveAttribute('aria-label', 'View operations');
		});

		it('close button has accessible name', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			const closeBtn = screen.getByTestId('operation-center-close');
			expect(closeBtn).toHaveAttribute('aria-label', 'Close');
		});

		it('panel has tabindex for keyboard focus', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			const panel = screen.getByTestId('operation-center-panel');
			expect(panel).toHaveAttribute('tabindex', '-1');
		});

		it('backdrop has accessible name', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			const backdrop = screen.getByTestId('operation-center-backdrop');
			expect(backdrop).toHaveAttribute('aria-label', 'Close operation center');
		});
	});

	describe('Custom Classes', () => {
		it('accepts custom class names', () => {
			const { container } = render(OperationCenter, {
				props: { class: 'my-custom-class' }
			});

			const wrapper = container.querySelector('.operation-center');
			expect(wrapper).toHaveClass('my-custom-class');
		});
	});

	describe('Panel Structure', () => {
		it('has header with title', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			expect(screen.getByText('Operations')).toBeInTheDocument();
		});

		it('shows operation count in header', async () => {
			render(OperationCenter);
			await fireEvent.click(screen.getByTestId('operation-center-badge'));

			expect(screen.getByText(/0 running, 0 total/)).toBeInTheDocument();
		});
	});
});
