/**
 * Core Components Module Tests
 *
 * Tests for the core primitive UI components barrel exports.
 * These are the foundational building blocks used across the application.
 */
import { describe, it, expect } from 'vitest';

describe('Core Components Module Exports', () => {
	describe('Button', () => {
		it('exports Button component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.Button).toBe('string');
			expect(module.Button).toMatch(/Button\.svelte/);
		});

		it('exports buttonVariants as callable function', async () => {
			const { buttonVariants } = await import('./index');
			expect(typeof buttonVariants).toBe('function');
			const result = buttonVariants({ variant: 'default', size: 'md' });
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe('Badge', () => {
		it('exports Badge component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.Badge).toBe('string');
			expect(module.Badge).toMatch(/Badge\.svelte/);
		});

		it('exports badgeVariants as callable function', async () => {
			const { badgeVariants } = await import('./index');
			expect(typeof badgeVariants).toBe('function');
			const result = badgeVariants({ variant: 'default' });
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe('Input', () => {
		it('exports Input component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.Input).toBe('string');
			expect(module.Input).toMatch(/Input\.svelte/);
		});
	});

	describe('Icon', () => {
		it('exports Icon component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.Icon).toBe('string');
			expect(module.Icon).toMatch(/Icon\.svelte/);
		});
	});

	describe('Switch', () => {
		it('exports Switch component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.Switch).toBe('string');
			expect(module.Switch).toMatch(/Switch\.svelte/);
		});

		it('exports switchVariants as callable function', async () => {
			const { switchVariants } = await import('./index');
			expect(typeof switchVariants).toBe('function');
		});
	});

	describe('CircularProgress', () => {
		it('exports CircularProgress component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.CircularProgress).toBe('string');
			expect(module.CircularProgress).toMatch(/CircularProgress\.svelte/);
		});

		it('exports circularProgressVariants as callable function', async () => {
			const { circularProgressVariants } = await import('./index');
			expect(typeof circularProgressVariants).toBe('function');
		});
	});

	describe('ProgressBar', () => {
		it('exports ProgressBar component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.ProgressBar).toBe('string');
			expect(module.ProgressBar).toMatch(/ProgressBar\.svelte/);
		});
	});

	describe('StatusIndicator', () => {
		it('exports StatusIndicator component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.StatusIndicator).toBe('string');
			expect(module.StatusIndicator).toMatch(/StatusIndicator\.svelte/);
		});

		it('exports statusIndicatorVariants as callable function', async () => {
			const { statusIndicatorVariants } = await import('./index');
			expect(typeof statusIndicatorVariants).toBe('function');
		});
	});

	describe('StatusBadge', () => {
		it('exports StatusBadge component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.StatusBadge).toBe('string');
			expect(module.StatusBadge).toMatch(/StatusBadge\.svelte/);
		});

		it('exports statusBadgeVariants as callable function', async () => {
			const { statusBadgeVariants } = await import('./index');
			expect(typeof statusBadgeVariants).toBe('function');
		});
	});

	describe('EmptyState', () => {
		it('exports EmptyState component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.EmptyState).toBe('string');
			expect(module.EmptyState).toMatch(/EmptyState\.svelte/);
		});

		it('exports emptyStateVariants as callable function', async () => {
			const { emptyStateVariants } = await import('./index');
			expect(typeof emptyStateVariants).toBe('function');
		});
	});

	describe('ErrorState', () => {
		it('exports ErrorState component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.ErrorState).toBe('string');
			expect(module.ErrorState).toMatch(/ErrorState\.svelte/);
		});
	});

	describe('Toast', () => {
		it('exports Toast component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.Toast).toBe('string');
			expect(module.Toast).toMatch(/Toast\.svelte/);
		});
	});

	describe('ToastContainer', () => {
		it('exports ToastContainer component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.ToastContainer).toBe('string');
			expect(module.ToastContainer).toMatch(/ToastContainer\.svelte/);
		});
	});

	describe('Skeleton components', () => {
		it('exports Skeleton component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.Skeleton).toBe('string');
			expect(module.Skeleton).toMatch(/Skeleton\.svelte/);
		});

		it('exports SkeletonCard component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.SkeletonCard).toBe('string');
			expect(module.SkeletonCard).toMatch(/SkeletonCard\.svelte/);
		});

		it('exports SkeletonGroup component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.SkeletonGroup).toBe('string');
			expect(module.SkeletonGroup).toMatch(/SkeletonGroup\.svelte/);
		});

		it('exports SkeletonLoader component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.SkeletonLoader).toBe('string');
			expect(module.SkeletonLoader).toMatch(/SkeletonLoader\.svelte/);
		});
	});

	describe('Utility components', () => {
		it('exports UnreadDot component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.UnreadDot).toBe('string');
			expect(module.UnreadDot).toMatch(/UnreadDot\.svelte/);
		});

		it('exports ShimmerText component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.ShimmerText).toBe('string');
			expect(module.ShimmerText).toMatch(/ShimmerText\.svelte/);
		});

		it('exports GridPattern component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.GridPattern).toBe('string');
			expect(module.GridPattern).toMatch(/GridPattern\.svelte/);
		});

		it('exports NumberCounter component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.NumberCounter).toBe('string');
			expect(module.NumberCounter).toMatch(/NumberCounter\.svelte/);
		});
	});

	describe('Data display components', () => {
		it('exports DataTable component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.DataTable).toBe('string');
			expect(module.DataTable).toMatch(/DataTable\.svelte/);
		});

		it('exports dataTableVariants as callable function', async () => {
			const { dataTableVariants } = await import('./index');
			expect(typeof dataTableVariants).toBe('function');
		});

		it('exports StatsCard component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.StatsCard).toBe('string');
			expect(module.StatsCard).toMatch(/StatsCard\.svelte/);
		});

		it('exports statsCardVariants as callable function', async () => {
			const { statsCardVariants } = await import('./index');
			expect(typeof statsCardVariants).toBe('function');
		});
	});

	describe('Form components', () => {
		it('exports IssueTypeSelector component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.IssueTypeSelector).toBe('string');
			expect(module.IssueTypeSelector).toMatch(/IssueTypeSelector\.svelte/);
		});

		it('exports issueTypeSelectorVariants as callable function', async () => {
			const { issueTypeSelectorVariants } = await import('./index');
			expect(typeof issueTypeSelectorVariants).toBe('function');
		});

		it('exports CopyCliButton component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.CopyCliButton).toBe('string');
			expect(module.CopyCliButton).toMatch(/CopyCliButton\.svelte/);
		});

		it('exports copyCliButtonVariants as callable function', async () => {
			const { copyCliButtonVariants } = await import('./index');
			expect(typeof copyCliButtonVariants).toBe('function');
		});

		it('exports ThemeToggle component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.ThemeToggle).toBe('string');
			expect(module.ThemeToggle).toMatch(/ThemeToggle\.svelte/);
		});
	});

	describe('Interactive components', () => {
		it('exports SwipeableItem component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.SwipeableItem).toBe('string');
			expect(module.SwipeableItem).toMatch(/SwipeableItem\.svelte/);
		});

		it('exports SwipeableTabs component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.SwipeableTabs).toBe('string');
			expect(module.SwipeableTabs).toMatch(/SwipeableTabs\.svelte/);
		});

		it('exports PullToRefresh component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.PullToRefresh).toBe('string');
			expect(module.PullToRefresh).toMatch(/PullToRefresh\.svelte/);
		});

		it('exports FloatingActionButton component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.FloatingActionButton).toBe('string');
			expect(module.FloatingActionButton).toMatch(/FloatingActionButton\.svelte/);
		});

		it('exports TouchTarget component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.TouchTarget).toBe('string');
			expect(module.TouchTarget).toMatch(/TouchTarget\.svelte/);
		});

		it('exports VirtualList component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.VirtualList).toBe('string');
			expect(module.VirtualList).toMatch(/VirtualList\.svelte/);
		});
	});

	describe('Error handling components', () => {
		it('exports ErrorBoundary component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.ErrorBoundary).toBe('string');
			expect(module.ErrorBoundary).toMatch(/ErrorBoundary\.svelte/);
		});

		it('exports ApiError component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.ApiError).toBe('string');
			expect(module.ApiError).toMatch(/ApiError\.svelte/);
		});

		it('exports KnownBugDetector component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.KnownBugDetector).toBe('string');
			expect(module.KnownBugDetector).toMatch(/KnownBugDetector\.svelte/);
		});
	});

	describe('Module Structure', () => {
		it('exports all expected core component keys', async () => {
			const indexModule = await import('./index');
			const exportKeys = Object.keys(indexModule);

			// Button family
			expect(exportKeys).toContain('Button');
			expect(exportKeys).toContain('buttonVariants');

			// Badge family
			expect(exportKeys).toContain('Badge');
			expect(exportKeys).toContain('badgeVariants');

			// Input components
			expect(exportKeys).toContain('Input');
			expect(exportKeys).toContain('Icon');
			expect(exportKeys).toContain('Switch');
			expect(exportKeys).toContain('switchVariants');

			// Progress components
			expect(exportKeys).toContain('CircularProgress');
			expect(exportKeys).toContain('circularProgressVariants');
			expect(exportKeys).toContain('ProgressBar');

			// Status components
			expect(exportKeys).toContain('StatusIndicator');
			expect(exportKeys).toContain('statusIndicatorVariants');
			expect(exportKeys).toContain('StatusBadge');
			expect(exportKeys).toContain('statusBadgeVariants');

			// State components
			expect(exportKeys).toContain('EmptyState');
			expect(exportKeys).toContain('emptyStateVariants');
			expect(exportKeys).toContain('ErrorState');

			// Notification components
			expect(exportKeys).toContain('Toast');
			expect(exportKeys).toContain('ToastContainer');

			// Skeleton components
			expect(exportKeys).toContain('Skeleton');
			expect(exportKeys).toContain('SkeletonCard');
			expect(exportKeys).toContain('SkeletonGroup');
			expect(exportKeys).toContain('SkeletonLoader');

			// Utility components
			expect(exportKeys).toContain('UnreadDot');
			expect(exportKeys).toContain('ShimmerText');
			expect(exportKeys).toContain('GridPattern');
			expect(exportKeys).toContain('NumberCounter');

			// Data display components
			expect(exportKeys).toContain('DataTable');
			expect(exportKeys).toContain('dataTableVariants');
			expect(exportKeys).toContain('StatsCard');
			expect(exportKeys).toContain('statsCardVariants');

			// Interactive components
			expect(exportKeys).toContain('SwipeableItem');
			expect(exportKeys).toContain('PullToRefresh');
			expect(exportKeys).toContain('FloatingActionButton');
			expect(exportKeys).toContain('TouchTarget');
			expect(exportKeys).toContain('VirtualList');

			// Error handling
			expect(exportKeys).toContain('ErrorBoundary');
			expect(exportKeys).toContain('ApiError');
			expect(exportKeys).toContain('KnownBugDetector');
		});
	});
});
