/**
 * Layout Components Module Tests
 *
 * Tests for the layout scaffolding components barrel exports.
 * These components provide page structure and navigation patterns.
 *
 * NOTE: In Svelte 5, components are exported as functions (component constructors).
 */
import { describe, it, expect, beforeAll } from 'vitest';

// Pre-load the module once to avoid timeout on first test
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let layoutModule: typeof import('./index');

beforeAll(async () => {
	layoutModule = await import('./index');
}, 30000); // 30 second timeout for initial module load

describe('Layout Components Module Exports', () => {
	describe('Navigation components', () => {
		it('exports BottomNav component as a function', () => {
			expect(typeof layoutModule.BottomNav).toBe('function');
		});

		it('exports Sidebar component as a function', () => {
			expect(typeof layoutModule.Sidebar).toBe('function');
		});

		it('exports SheetNav component as a function', () => {
			expect(typeof layoutModule.SheetNav).toBe('function');
		});

		it('exports NavigationLoader component as a function', () => {
			expect(typeof layoutModule.NavigationLoader).toBe('function');
		});
	});

	describe('Page structure components', () => {
		it('exports PageHeader component as a function', () => {
			expect(typeof layoutModule.PageHeader).toBe('function');
		});

		it('exports pageHeaderVariants as callable function', () => {
			expect(typeof layoutModule.pageHeaderVariants).toBe('function');
		});

		it('exports DashboardLayout component as a function', () => {
			expect(typeof layoutModule.DashboardLayout).toBe('function');
		});

		it('exports Dashboard component as a function', () => {
			expect(typeof layoutModule.Dashboard).toBe('function');
		});

		it('exports MobileDashboard component as a function', () => {
			expect(typeof layoutModule.MobileDashboard).toBe('function');
		});
	});

	describe('Specialized layout components', () => {
		it('exports LogsLayout component as a function', () => {
			expect(typeof layoutModule.LogsLayout).toBe('function');
		});

		it('exports QueueLayout component as a function', () => {
			expect(typeof layoutModule.QueueLayout).toBe('function');
		});

		it('exports WorkflowLayout component as a function', () => {
			expect(typeof layoutModule.WorkflowLayout).toBe('function');
		});

		it('exports SplitView component as a function', () => {
			expect(typeof layoutModule.SplitView).toBe('function');
		});

		it('exports AgentDetailLayout component as a function', () => {
			expect(typeof layoutModule.AgentDetailLayout).toBe('function');
		});
	});

	describe('Accessibility components', () => {
		it('exports SkipLink component as a function', () => {
			expect(typeof layoutModule.SkipLink).toBe('function');
		});

		it('exports Announcer component as a function', () => {
			expect(typeof layoutModule.Announcer).toBe('function');
		});

		it('exports LiveRegion component as a function', () => {
			expect(typeof layoutModule.LiveRegion).toBe('function');
		});
	});

	describe('Status and indicator components', () => {
		it('exports OperationCenter component as a function', () => {
			expect(typeof layoutModule.OperationCenter).toBe('function');
		});

		it('exports StatusCards component as a function', () => {
			expect(typeof layoutModule.StatusCards).toBe('function');
		});

		it('exports QuickActions component as a function', () => {
			expect(typeof layoutModule.QuickActions).toBe('function');
		});

		it('exports ActivityFeed component as a function', () => {
			expect(typeof layoutModule.ActivityFeed).toBe('function');
		});
	});

	describe('Network status components', () => {
		it('exports OfflineIndicator component as a function', () => {
			expect(typeof layoutModule.OfflineIndicator).toBe('function');
		});

		it('exports ConnectionLost component as a function', () => {
			expect(typeof layoutModule.ConnectionLost).toBe('function');
		});

		it('exports DegradedModeBanner component as a function', () => {
			expect(typeof layoutModule.DegradedModeBanner).toBe('function');
		});
	});

	describe('PWA components', () => {
		it('exports UpdatePrompt component as a function', () => {
			expect(typeof layoutModule.UpdatePrompt).toBe('function');
		});
	});

	describe('Keyboard components', () => {
		it('exports KeyboardHelpDialog component as a function', () => {
			expect(typeof layoutModule.KeyboardHelpDialog).toBe('function');
		});

		it('exports VimSequenceIndicator component as a function', () => {
			expect(typeof layoutModule.VimSequenceIndicator).toBe('function');
		});
	});

	describe('Search components', () => {
		it('exports GlobalSearch component as a function', () => {
			expect(typeof layoutModule.GlobalSearch).toBe('function');
		});

		it('exports CommandPalette component as a function', () => {
			expect(typeof layoutModule.CommandPalette).toBe('function');
		});
	});

	describe('Log components', () => {
		it('exports LogEntry component as a function', () => {
			expect(typeof layoutModule.LogEntry).toBe('function');
		});

		it('exports LogEntrySkeleton component as a function', () => {
			expect(typeof layoutModule.LogEntrySkeleton).toBe('function');
		});
	});

	describe('Module Structure', () => {
		it('exports all expected layout component keys', () => {
			const exportKeys = Object.keys(layoutModule);

			// Navigation
			expect(exportKeys).toContain('BottomNav');
			expect(exportKeys).toContain('Sidebar');
			expect(exportKeys).toContain('SheetNav');
			expect(exportKeys).toContain('NavigationLoader');

			// Page structure
			expect(exportKeys).toContain('PageHeader');
			expect(exportKeys).toContain('pageHeaderVariants');
			expect(exportKeys).toContain('DashboardLayout');
			expect(exportKeys).toContain('Dashboard');
			expect(exportKeys).toContain('MobileDashboard');

			// Specialized layouts
			expect(exportKeys).toContain('LogsLayout');
			expect(exportKeys).toContain('QueueLayout');
			expect(exportKeys).toContain('WorkflowLayout');
			expect(exportKeys).toContain('SplitView');
			expect(exportKeys).toContain('AgentDetailLayout');

			// Accessibility
			expect(exportKeys).toContain('SkipLink');
			expect(exportKeys).toContain('Announcer');
			expect(exportKeys).toContain('LiveRegion');

			// Status/Operations
			expect(exportKeys).toContain('OperationCenter');
			expect(exportKeys).toContain('StatusCards');
			expect(exportKeys).toContain('QuickActions');
			expect(exportKeys).toContain('ActivityFeed');

			// Network status
			expect(exportKeys).toContain('OfflineIndicator');
			expect(exportKeys).toContain('ConnectionLost');
			expect(exportKeys).toContain('DegradedModeBanner');

			// PWA
			expect(exportKeys).toContain('UpdatePrompt');

			// Keyboard
			expect(exportKeys).toContain('KeyboardHelpDialog');
			expect(exportKeys).toContain('VimSequenceIndicator');

			// Search
			expect(exportKeys).toContain('GlobalSearch');
			expect(exportKeys).toContain('CommandPalette');

			// Logs
			expect(exportKeys).toContain('LogEntry');
			expect(exportKeys).toContain('LogEntrySkeleton');
		});
	});
});
