/**
 * Layout Components Module Tests
 *
 * Tests for the layout scaffolding components barrel exports.
 * These components provide page structure and navigation patterns.
 */
import { describe, it, expect } from 'vitest';

describe('Layout Components Module Exports', () => {
	describe('Navigation components', () => {
		it('exports BottomNav component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.BottomNav).toBe('string');
			expect(module.BottomNav).toMatch(/BottomNav\.svelte/);
		});

		it('exports Sidebar component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.Sidebar).toBe('string');
			expect(module.Sidebar).toMatch(/Sidebar\.svelte/);
		});

		it('exports SheetNav component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.SheetNav).toBe('string');
			expect(module.SheetNav).toMatch(/SheetNav\.svelte/);
		});

		it('exports NavigationLoader component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.NavigationLoader).toBe('string');
			expect(module.NavigationLoader).toMatch(/NavigationLoader\.svelte/);
		});
	});

	describe('Page structure components', () => {
		it('exports PageHeader component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.PageHeader).toBe('string');
			expect(module.PageHeader).toMatch(/PageHeader\.svelte/);
		});

		it('exports pageHeaderVariants as callable function', async () => {
			const { pageHeaderVariants } = await import('./index');
			expect(typeof pageHeaderVariants).toBe('function');
		});

		it('exports DashboardLayout component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.DashboardLayout).toBe('string');
			expect(module.DashboardLayout).toMatch(/DashboardLayout\.svelte/);
		});

		it('exports Dashboard component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.Dashboard).toBe('string');
			expect(module.Dashboard).toMatch(/Dashboard\.svelte/);
		});

		it('exports MobileDashboard component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.MobileDashboard).toBe('string');
			expect(module.MobileDashboard).toMatch(/MobileDashboard\.svelte/);
		});
	});

	describe('Specialized layout components', () => {
		it('exports LogsLayout component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.LogsLayout).toBe('string');
			expect(module.LogsLayout).toMatch(/LogsLayout\.svelte/);
		});

		it('exports QueueLayout component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.QueueLayout).toBe('string');
			expect(module.QueueLayout).toMatch(/QueueLayout\.svelte/);
		});

		it('exports WorkflowLayout component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.WorkflowLayout).toBe('string');
			expect(module.WorkflowLayout).toMatch(/WorkflowLayout\.svelte/);
		});

		it('exports SplitView component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.SplitView).toBe('string');
			expect(module.SplitView).toMatch(/SplitView\.svelte/);
		});

		it('exports AgentDetailLayout component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.AgentDetailLayout).toBe('string');
			expect(module.AgentDetailLayout).toMatch(/AgentDetailLayout\.svelte/);
		});
	});

	describe('Accessibility components', () => {
		it('exports SkipLink component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.SkipLink).toBe('string');
			expect(module.SkipLink).toMatch(/SkipLink\.svelte/);
		});

		it('exports Announcer component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.Announcer).toBe('string');
			expect(module.Announcer).toMatch(/Announcer\.svelte/);
		});

		it('exports LiveRegion component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.LiveRegion).toBe('string');
			expect(module.LiveRegion).toMatch(/LiveRegion\.svelte/);
		});
	});

	describe('Status and indicator components', () => {
		it('exports OperationCenter component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.OperationCenter).toBe('string');
			expect(module.OperationCenter).toMatch(/OperationCenter\.svelte/);
		});

		it('exports StatusCards component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.StatusCards).toBe('string');
			expect(module.StatusCards).toMatch(/StatusCards\.svelte/);
		});

		it('exports QuickActions component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.QuickActions).toBe('string');
			expect(module.QuickActions).toMatch(/QuickActions\.svelte/);
		});

		it('exports ActivityFeed component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.ActivityFeed).toBe('string');
			expect(module.ActivityFeed).toMatch(/ActivityFeed\.svelte/);
		});
	});

	describe('Network status components', () => {
		it('exports OfflineIndicator component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.OfflineIndicator).toBe('string');
			expect(module.OfflineIndicator).toMatch(/OfflineIndicator\.svelte/);
		});

		it('exports ConnectionLost component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.ConnectionLost).toBe('string');
			expect(module.ConnectionLost).toMatch(/ConnectionLost\.svelte/);
		});

		it('exports DegradedModeBanner component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.DegradedModeBanner).toBe('string');
			expect(module.DegradedModeBanner).toMatch(/DegradedModeBanner\.svelte/);
		});
	});

	describe('PWA components', () => {
		it('exports UpdatePrompt component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.UpdatePrompt).toBe('string');
			expect(module.UpdatePrompt).toMatch(/UpdatePrompt\.svelte/);
		});
	});

	describe('Keyboard components', () => {
		it('exports KeyboardHelpDialog component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.KeyboardHelpDialog).toBe('string');
			expect(module.KeyboardHelpDialog).toMatch(/KeyboardHelpDialog\.svelte/);
		});

		it('exports VimSequenceIndicator component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.VimSequenceIndicator).toBe('string');
			expect(module.VimSequenceIndicator).toMatch(/VimSequenceIndicator\.svelte/);
		});
	});

	describe('Search components', () => {
		it('exports GlobalSearch component', async () => {
			const module = await import('./index');
			expect(module.GlobalSearch).toMatch(/GlobalSearch/);
		});

		it('exports CommandPalette component', async () => {
			const module = await import('./index');
			expect(module.CommandPalette).toMatch(/CommandPalette/);
		});
	});

	describe('Log components', () => {
		it('exports LogEntry component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.LogEntry).toBe('string');
			expect(module.LogEntry).toMatch(/LogEntry\.svelte/);
		});

		it('exports LogEntrySkeleton component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.LogEntrySkeleton).toBe('string');
			expect(module.LogEntrySkeleton).toMatch(/LogEntrySkeleton\.svelte/);
		});
	});

	describe('Module Structure', () => {
		it('exports all expected layout component keys', async () => {
			const indexModule = await import('./index');
			const exportKeys = Object.keys(indexModule);

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
