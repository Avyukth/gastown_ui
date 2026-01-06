/**
 * EmptyState Component Tests
 *
 * Tests for EmptyState presets, sizes, actions, and accessibility.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import EmptyState from './EmptyState.svelte';

describe('EmptyState', () => {
	describe('Presets', () => {
		it('renders no-data preset', () => {
			render(EmptyState, { props: { preset: 'no-data' } });
			expect(screen.getByText('No data yet')).toBeInTheDocument();
			expect(screen.getByText(/nothing here at the moment/i)).toBeInTheDocument();
		});

		it('renders no-results preset', () => {
			render(EmptyState, { props: { preset: 'no-results' } });
			expect(screen.getByText('No results found')).toBeInTheDocument();
			expect(screen.getByText(/couldn't find anything/i)).toBeInTheDocument();
		});

		it('renders error preset', () => {
			render(EmptyState, { props: { preset: 'error' } });
			expect(screen.getByText('Something went wrong')).toBeInTheDocument();
			expect(screen.getByText(/encountered an error/i)).toBeInTheDocument();
		});

		it('renders offline preset', () => {
			render(EmptyState, { props: { preset: 'offline' } });
			expect(screen.getByText("You're offline")).toBeInTheDocument();
			expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
		});
	});

	describe('Custom Content', () => {
		it('allows custom title', () => {
			render(EmptyState, { props: { title: 'Custom Title' } });
			expect(screen.getByText('Custom Title')).toBeInTheDocument();
		});

		it('allows custom description', () => {
			render(EmptyState, { props: { description: 'Custom description text' } });
			expect(screen.getByText('Custom description text')).toBeInTheDocument();
		});

		it('custom title overrides preset', () => {
			render(EmptyState, { props: { preset: 'no-data', title: 'Override Title' } });
			expect(screen.getByText('Override Title')).toBeInTheDocument();
			expect(screen.queryByText('No data yet')).not.toBeInTheDocument();
		});

		it('custom description overrides preset', () => {
			render(EmptyState, { props: { preset: 'no-data', description: 'Override description' } });
			expect(screen.getByText('Override description')).toBeInTheDocument();
		});
	});

	describe('Sizes', () => {
		it('renders small size', () => {
			render(EmptyState, { props: { size: 'sm', title: 'Test' } });
			const container = screen.getByRole('status');
			expect(container).toHaveClass('py-6');
		});

		it('renders default size', () => {
			render(EmptyState, { props: { title: 'Test' } });
			const container = screen.getByRole('status');
			expect(container).toHaveClass('py-8');
		});

		it('renders large size', () => {
			render(EmptyState, { props: { size: 'lg', title: 'Test' } });
			const container = screen.getByRole('status');
			expect(container).toHaveClass('py-12');
		});
	});

	describe('Actions', () => {
		it('renders primary action button', () => {
			render(EmptyState, { props: { actionLabel: 'Try Again' } });
			expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
		});

		it('renders secondary action button', () => {
			render(EmptyState, { props: { secondaryLabel: 'Cancel' } });
			expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
		});

		it('renders both action buttons', () => {
			render(EmptyState, { props: { actionLabel: 'Primary', secondaryLabel: 'Secondary' } });
			expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
		});

		it('calls onaction when primary button clicked', async () => {
			const handleAction = vi.fn();
			render(EmptyState, { props: { actionLabel: 'Click Me', onaction: handleAction } });
			await fireEvent.click(screen.getByRole('button', { name: 'Click Me' }));
			expect(handleAction).toHaveBeenCalledTimes(1);
		});

		it('calls onsecondary when secondary button clicked', async () => {
			const handleSecondary = vi.fn();
			render(EmptyState, { props: { secondaryLabel: 'Cancel', onsecondary: handleSecondary } });
			await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
			expect(handleSecondary).toHaveBeenCalledTimes(1);
		});
	});

	describe('Animation', () => {
		it('has animation by default', () => {
			render(EmptyState, { props: { title: 'Test' } });
			const container = screen.getByRole('status');
			const iconWrapper = container.querySelector('[class*="animate-"]');
			expect(iconWrapper).toBeInTheDocument();
		});

		it('can disable animation', () => {
			render(EmptyState, { props: { title: 'Test', animated: false } });
			const container = screen.getByRole('status');
			const iconWrapper = container.querySelector('.animate-pulse-status');
			expect(iconWrapper).not.toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has status role', () => {
			render(EmptyState, { props: { title: 'Test' } });
			expect(screen.getByRole('status')).toBeInTheDocument();
		});

		it('has aria-live polite', () => {
			render(EmptyState, { props: { title: 'Test' } });
			expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
		});

		it('icon is hidden from screen readers', () => {
			render(EmptyState, { props: { preset: 'no-data' } });
			const container = screen.getByRole('status');
			const icon = container.querySelector('[aria-hidden="true"]');
			expect(icon).toBeInTheDocument();
		});
	});

	describe('Custom Classes', () => {
		it('accepts custom class names', () => {
			render(EmptyState, { props: { class: 'my-custom-class', title: 'Test' } });
			expect(screen.getByRole('status')).toHaveClass('my-custom-class');
		});
	});
});
