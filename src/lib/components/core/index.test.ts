/**
 * Core Components Module Tests
 *
 * Tests for the core primitive UI components barrel exports.
 * These are the foundational building blocks used across the application.
 *
 * NOTE: In Svelte 5, components are exported as functions (component constructors).
 */
import { describe, it, expect, beforeAll } from 'vitest';

// Pre-load the module once to avoid timeout on first test
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let coreModule: typeof import('./index');

beforeAll(async () => {
	coreModule = await import('./index');
}, 30000); // 30 second timeout for initial module load

describe('Core Components Module Exports', () => {
	describe('Button', () => {
		it('exports Button component as a function', () => {
			expect(typeof coreModule.Button).toBe('function');
		});

		it('exports buttonVariants as callable function that returns className string', () => {
			expect(typeof coreModule.buttonVariants).toBe('function');
			const result = coreModule.buttonVariants({ variant: 'default', size: 'default' });
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe('Badge', () => {
		it('exports Badge component as a function', () => {
			expect(typeof coreModule.Badge).toBe('function');
		});

		it('exports badgeVariants as callable function that returns className string', () => {
			expect(typeof coreModule.badgeVariants).toBe('function');
			const result = coreModule.badgeVariants({ variant: 'default' });
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe('Input', () => {
		it('exports Input component as a function', () => {
			expect(typeof coreModule.Input).toBe('function');
		});
	});

	describe('Icon', () => {
		it('exports Icon component as a function', () => {
			expect(typeof coreModule.Icon).toBe('function');
		});
	});

	describe('Switch', () => {
		it('exports Switch component as a function', () => {
			expect(typeof coreModule.Switch).toBe('function');
		});

		it('exports switchVariants as callable function', () => {
			expect(typeof coreModule.switchVariants).toBe('function');
		});
	});

	describe('CircularProgress', () => {
		it('exports CircularProgress component as a function', () => {
			expect(typeof coreModule.CircularProgress).toBe('function');
		});

		it('exports circularProgressVariants as callable function', () => {
			expect(typeof coreModule.circularProgressVariants).toBe('function');
		});
	});

	describe('ProgressBar', () => {
		it('exports ProgressBar component as a function', () => {
			expect(typeof coreModule.ProgressBar).toBe('function');
		});
	});

	describe('StatusIndicator', () => {
		it('exports StatusIndicator component as a function', () => {
			expect(typeof coreModule.StatusIndicator).toBe('function');
		});

		it('exports statusIndicatorVariants as callable function', () => {
			expect(typeof coreModule.statusIndicatorVariants).toBe('function');
		});
	});

	describe('StatusBadge', () => {
		it('exports StatusBadge component as a function', () => {
			expect(typeof coreModule.StatusBadge).toBe('function');
		});

		it('exports statusBadgeVariants as callable function', () => {
			expect(typeof coreModule.statusBadgeVariants).toBe('function');
		});
	});

	describe('EmptyState', () => {
		it('exports EmptyState component as a function', () => {
			expect(typeof coreModule.EmptyState).toBe('function');
		});

		it('exports emptyStateVariants as callable function', () => {
			expect(typeof coreModule.emptyStateVariants).toBe('function');
		});
	});

	describe('ErrorState', () => {
		it('exports ErrorState component as a function', () => {
			expect(typeof coreModule.ErrorState).toBe('function');
		});
	});

	describe('Toast', () => {
		it('exports Toast component as a function', () => {
			expect(typeof coreModule.Toast).toBe('function');
		});
	});

	describe('ToastContainer', () => {
		it('exports ToastContainer component as a function', () => {
			expect(typeof coreModule.ToastContainer).toBe('function');
		});
	});

	describe('Skeleton components', () => {
		it('exports Skeleton component as a function', () => {
			expect(typeof coreModule.Skeleton).toBe('function');
		});

		it('exports SkeletonCard component as a function', () => {
			expect(typeof coreModule.SkeletonCard).toBe('function');
		});

		it('exports SkeletonGroup component as a function', () => {
			expect(typeof coreModule.SkeletonGroup).toBe('function');
		});

		it('exports SkeletonLoader component as a function', () => {
			expect(typeof coreModule.SkeletonLoader).toBe('function');
		});
	});

	describe('Utility components', () => {
		it('exports UnreadDot component as a function', () => {
			expect(typeof coreModule.UnreadDot).toBe('function');
		});

		it('exports ShimmerText component as a function', () => {
			expect(typeof coreModule.ShimmerText).toBe('function');
		});

		it('exports GridPattern component as a function', () => {
			expect(typeof coreModule.GridPattern).toBe('function');
		});

		it('exports NumberCounter component as a function', () => {
			expect(typeof coreModule.NumberCounter).toBe('function');
		});
	});

	describe('Data display components', () => {
		it('exports DataTable component as a function', () => {
			expect(typeof coreModule.DataTable).toBe('function');
		});

		it('exports dataTableVariants as callable function', () => {
			expect(typeof coreModule.dataTableVariants).toBe('function');
		});

		it('exports StatsCard component as a function', () => {
			expect(typeof coreModule.StatsCard).toBe('function');
		});

		it('exports statsCardVariants as callable function', () => {
			expect(typeof coreModule.statsCardVariants).toBe('function');
		});
	});

	describe('Form components', () => {
		it('exports IssueTypeSelector component as a function', () => {
			expect(typeof coreModule.IssueTypeSelector).toBe('function');
		});

		it('exports issueTypeSelectorVariants as callable function', () => {
			expect(typeof coreModule.issueTypeSelectorVariants).toBe('function');
		});

		it('exports CopyCliButton component as a function', () => {
			expect(typeof coreModule.CopyCliButton).toBe('function');
		});

		it('exports copyCliButtonVariants as callable function', () => {
			expect(typeof coreModule.copyCliButtonVariants).toBe('function');
		});

		it('exports ThemeToggle component as a function', () => {
			expect(typeof coreModule.ThemeToggle).toBe('function');
		});
	});

	describe('Interactive components', () => {
		it('exports SwipeableItem component as a function', () => {
			expect(typeof coreModule.SwipeableItem).toBe('function');
		});

		it('exports SwipeableTabs component as a function', () => {
			expect(typeof coreModule.SwipeableTabs).toBe('function');
		});

		it('exports PullToRefresh component as a function', () => {
			expect(typeof coreModule.PullToRefresh).toBe('function');
		});

		it('exports FloatingActionButton component as a function', () => {
			expect(typeof coreModule.FloatingActionButton).toBe('function');
		});

		it('exports TouchTarget component as a function', () => {
			expect(typeof coreModule.TouchTarget).toBe('function');
		});

		it('exports VirtualList component as a function', () => {
			expect(typeof coreModule.VirtualList).toBe('function');
		});
	});

	describe('Error handling components', () => {
		it('exports ErrorBoundary component as a function', () => {
			expect(typeof coreModule.ErrorBoundary).toBe('function');
		});

		it('exports ApiError component as a function', () => {
			expect(typeof coreModule.ApiError).toBe('function');
		});

		it('exports KnownBugDetector component as a function', () => {
			expect(typeof coreModule.KnownBugDetector).toBe('function');
		});
	});

	describe('Module Structure', () => {
		it('exports all expected core component keys', () => {
			const exportKeys = Object.keys(coreModule);

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
			expect(exportKeys).toContain('SwipeableTabs');
			expect(exportKeys).toContain('PullToRefresh');
			expect(exportKeys).toContain('FloatingActionButton');
			expect(exportKeys).toContain('TouchTarget');
			expect(exportKeys).toContain('VirtualList');

			// Form components
			expect(exportKeys).toContain('IssueTypeSelector');
			expect(exportKeys).toContain('issueTypeSelectorVariants');
			expect(exportKeys).toContain('CopyCliButton');
			expect(exportKeys).toContain('copyCliButtonVariants');
			expect(exportKeys).toContain('ThemeToggle');

			// Error handling
			expect(exportKeys).toContain('ErrorBoundary');
			expect(exportKeys).toContain('ApiError');
			expect(exportKeys).toContain('KnownBugDetector');
		});
	});
});
