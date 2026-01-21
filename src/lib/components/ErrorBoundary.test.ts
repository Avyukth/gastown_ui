/**
 * ErrorBoundary Component Tests
 *
 * Tests for error display, known bug detection, retry/report actions,
 * and accessibility.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import ErrorBoundaryWrapper from '../../tests/wrappers/ErrorBoundaryWrapper.svelte';

// Mock crypto.randomUUID for consistent request IDs in tests
vi.stubGlobal('crypto', {
	randomUUID: () => 'test-uuid-1234'
});

describe('ErrorBoundary', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Normal Rendering', () => {
		it('renders children when no error', () => {
			render(ErrorBoundaryWrapper);
			expect(screen.getByTestId('children-content')).toBeInTheDocument();
			expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		});
	});

	describe('Error Display', () => {
		it('shows error UI when setError is called', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Test error message'));
			await tick();
			expect(screen.getByRole('alert')).toBeInTheDocument();
		});

		it('displays default message for unknown errors', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Unknown error'));
			await tick();
			// Unknown errors show the default category message
			expect(screen.getByText('Something went wrong')).toBeInTheDocument();
		});

		it('hides children when error is shown', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Test error'));
			await tick();
			expect(screen.queryByTestId('children-content')).not.toBeInTheDocument();
		});

		it('has aria-live="assertive" for error alerts', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Test error'));
			await tick();
			const alert = screen.getByRole('alert');
			expect(alert).toHaveAttribute('aria-live', 'assertive');
		});
	});

	describe('Known Bug Detection', () => {
		it('shows user-friendly message for network errors', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('ECONNREFUSED'));
			await tick();
			expect(screen.getByText('Network connection failed')).toBeInTheDocument();
		});

		it('shows user-friendly message for database locked', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('SQLITE_BUSY: database is locked'));
			await tick();
			expect(screen.getByText('Database is locked by another process')).toBeInTheDocument();
		});

		it('shows workaround for known bugs', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('ECONNREFUSED'));
			await tick();
			expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
		});

		it('shows user-friendly message for auth errors', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('401 unauthorized'));
			await tick();
			expect(screen.getByText('Authentication required')).toBeInTheDocument();
		});

		it('shows user-friendly message for timeout errors', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('request timeout'));
			await tick();
			expect(screen.getByText('Request timed out')).toBeInTheDocument();
		});
	});

	describe('Retry Button', () => {
		it('shows retry button by default', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Test error'));
			await tick();
			expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
		});

		it('hides retry button when showRetry is false', async () => {
			const { component } = render(ErrorBoundaryWrapper, {
				props: { showRetry: false }
			});
			component.setError(new Error('Test error'));
			await tick();
			expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
		});

		it('clears error when retry is clicked', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Test error'));
			await tick();
			expect(screen.getByRole('alert')).toBeInTheDocument();
			const retryButton = screen.getByRole('button', { name: /retry/i });
			await fireEvent.click(retryButton);
			await tick();
			expect(screen.queryByRole('alert')).not.toBeInTheDocument();
			expect(screen.getByTestId('children-content')).toBeInTheDocument();
		});
	});

	describe('Report Issue Button', () => {
		it('shows report issue button by default', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Test error'));
			await tick();
			expect(screen.getByRole('button', { name: /report issue/i })).toBeInTheDocument();
		});

		it('hides report issue button when showReportIssue is false', async () => {
			const { component } = render(ErrorBoundaryWrapper, {
				props: { showReportIssue: false }
			});
			component.setError(new Error('Test error'));
			await tick();
			expect(screen.queryByRole('button', { name: /report issue/i })).not.toBeInTheDocument();
		});

		it('calls onReport callback when clicked', async () => {
			const handleReport = vi.fn();
			const { component } = render(ErrorBoundaryWrapper, {
				props: { onReport: handleReport }
			});
			component.setError(new Error('Test error'));
			await tick();
			const reportButton = screen.getByRole('button', { name: /report issue/i });
			await fireEvent.click(reportButton);
			expect(handleReport).toHaveBeenCalledWith(
				expect.any(Error),
				expect.objectContaining({
					requestId: expect.any(String),
					timestamp: expect.any(String)
				})
			);
		});
	});

	describe('Error Callbacks', () => {
		it('calls onError callback when error occurs', async () => {
			const handleError = vi.fn();
			const { component } = render(ErrorBoundaryWrapper, {
				props: { onError: handleError }
			});
			const error = new Error('Test error');
			component.setError(error);
			await tick();
			expect(handleError).toHaveBeenCalledWith(
				error,
				expect.objectContaining({
					requestId: expect.any(String),
					category: expect.any(Object),
					timestamp: expect.any(String)
				})
			);
		});

		it('provides request ID in error context', async () => {
			const handleError = vi.fn();
			const { component } = render(ErrorBoundaryWrapper, {
				props: { onError: handleError, requestId: 'custom-req-123' }
			});
			component.setError(new Error('Test error'));
			await tick();
			expect(handleError).toHaveBeenCalledWith(
				expect.any(Error),
				expect.objectContaining({
					requestId: 'custom-req-123'
				})
			);
		});
	});

	describe('Programmatic API', () => {
		it('setError programmatically shows error', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			expect(screen.queryByRole('alert')).not.toBeInTheDocument();
			component.setError(new Error('Programmatic error'));
			await tick();
			expect(screen.getByRole('alert')).toBeInTheDocument();
		});

		it('clearError programmatically clears error', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Test error'));
			await tick();
			expect(screen.getByRole('alert')).toBeInTheDocument();
			component.clearError();
			await tick();
			expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		});
	});

	describe('Styling', () => {
		it('accepts custom class names', async () => {
			const { component } = render(ErrorBoundaryWrapper, {
				props: { class: 'my-custom-class' }
			});
			component.setError(new Error('Test error'));
			await tick();
			const alert = screen.getByRole('alert');
			expect(alert).toHaveClass('my-custom-class');
		});

		it('has destructive styling for error state', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Test error'));
			await tick();
			const alert = screen.getByRole('alert');
			expect(alert).toHaveClass('bg-destructive/5');
		});
	});

	describe('Accessibility', () => {
		it('error container has role="alert"', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Test error'));
			await tick();
			expect(screen.getByRole('alert')).toBeInTheDocument();
		});

		it('error title is visible', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Test error'));
			await tick();
			// Check that error message is displayed
			expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
		});

		it('buttons are keyboard accessible', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Test error'));
			await tick();
			const buttons = screen.getAllByRole('button');
			buttons.forEach((button) => {
				expect(button).not.toHaveAttribute('tabindex', '-1');
			});
		});

		it('retry button has focus styles', async () => {
			const { component } = render(ErrorBoundaryWrapper);
			component.setError(new Error('Test error'));
			await tick();
			const retryButton = screen.getByRole('button', { name: /retry/i });
			expect(retryButton).toHaveClass('focus-visible:outline-none');
			expect(retryButton).toHaveClass('focus-visible:ring-2');
		});
	});
});
