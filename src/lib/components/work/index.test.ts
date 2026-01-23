/**
 * Work Components Module Tests
 *
 * Tests for the work components barrel exports including:
 * - WorkFilters
 * - WorkList
 * - WorkCreateForm
 * - WorkSlingForm
 */
import { describe, it, expect } from 'vitest';

describe('Work Components Module Exports', () => {
	describe('WorkFilters', () => {
		it('exports WorkFilters component with correct path reference', async () => {
			const module = await import('./index');
			// In test environment, Svelte components are exported as string paths
			expect(typeof module.WorkFilters).toBe('string');
			expect(module.WorkFilters).toMatch(/WorkFilters\.svelte/);
		});

		it('exports workFiltersVariants', async () => {
			const { workFiltersVariants } = await import('./index');
			expect(workFiltersVariants).toBeDefined();
			expect(typeof workFiltersVariants).toBe('function');
		});
	});

	describe('WorkList', () => {
		it('exports WorkList component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.WorkList).toBe('string');
			expect(module.WorkList).toMatch(/WorkList\.svelte/);
		});

		it('exports workListVariants', async () => {
			const { workListVariants } = await import('./index');
			expect(workListVariants).toBeDefined();
			expect(typeof workListVariants).toBe('function');
		});
	});

	describe('WorkCreateForm', () => {
		it('exports WorkCreateForm component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.WorkCreateForm).toBe('string');
			expect(module.WorkCreateForm).toMatch(/WorkCreateForm\.svelte/);
		});

		it('exports workCreateFormVariants', async () => {
			const { workCreateFormVariants } = await import('./index');
			expect(workCreateFormVariants).toBeDefined();
			expect(typeof workCreateFormVariants).toBe('function');
		});

		it('exports issueSchema validation', async () => {
			const { issueSchema } = await import('./index');
			expect(issueSchema).toBeDefined();
			expect(typeof issueSchema.safeParse).toBe('function');
		});
	});

	describe('WorkSlingForm', () => {
		it('exports WorkSlingForm component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.WorkSlingForm).toBe('string');
			expect(module.WorkSlingForm).toMatch(/WorkSlingForm\.svelte/);
		});

		it('exports workSlingFormVariants', async () => {
			const { workSlingFormVariants } = await import('./index');
			expect(workSlingFormVariants).toBeDefined();
			expect(typeof workSlingFormVariants).toBe('function');
		});

		it('exports slingSchema validation', async () => {
			const { slingSchema } = await import('./index');
			expect(slingSchema).toBeDefined();
			expect(typeof slingSchema.safeParse).toBe('function');
		});
	});

	describe('Module Structure', () => {
		it('exports all expected component keys', async () => {
			const indexModule = await import('./index');
			const exportKeys = Object.keys(indexModule);
			expect(exportKeys).toContain('WorkFilters');
			expect(exportKeys).toContain('workFiltersVariants');
			expect(exportKeys).toContain('WorkList');
			expect(exportKeys).toContain('workListVariants');
			expect(exportKeys).toContain('WorkCreateForm');
			expect(exportKeys).toContain('workCreateFormVariants');
			expect(exportKeys).toContain('issueSchema');
			expect(exportKeys).toContain('WorkSlingForm');
			expect(exportKeys).toContain('workSlingFormVariants');
			expect(exportKeys).toContain('slingSchema');
		});
	});

	describe('Validation Schemas', () => {
		it('issueSchema validates valid issue', async () => {
			const { issueSchema } = await import('./index');
			const result = issueSchema.safeParse({
				title: 'Test Issue',
				type: 'task',
				priority: 2
			});
			expect(result.success).toBe(true);
		});

		it('issueSchema rejects empty title', async () => {
			const { issueSchema } = await import('./index');
			const result = issueSchema.safeParse({
				title: '',
				type: 'task',
				priority: 2
			});
			expect(result.success).toBe(false);
		});

		it('issueSchema rejects title less than 3 chars', async () => {
			const { issueSchema } = await import('./index');
			const result = issueSchema.safeParse({
				title: 'ab',
				type: 'task',
				priority: 2
			});
			expect(result.success).toBe(false);
		});

		it('issueSchema rejects invalid type', async () => {
			const { issueSchema } = await import('./index');
			const result = issueSchema.safeParse({
				title: 'Test Issue',
				type: 'invalid',
				priority: 2
			});
			expect(result.success).toBe(false);
		});

		it('issueSchema rejects priority out of range', async () => {
			const { issueSchema } = await import('./index');
			const result = issueSchema.safeParse({
				title: 'Test Issue',
				type: 'task',
				priority: 5
			});
			expect(result.success).toBe(false);
		});

		it('slingSchema validates valid sling', async () => {
			const { slingSchema } = await import('./index');
			const result = slingSchema.safeParse({
				issue: 'bd-123',
				rig: 'gastownui'
			});
			expect(result.success).toBe(true);
		});

		it('slingSchema rejects empty issue', async () => {
			const { slingSchema } = await import('./index');
			const result = slingSchema.safeParse({
				issue: '',
				rig: 'gastownui'
			});
			expect(result.success).toBe(false);
		});

		it('slingSchema rejects empty rig', async () => {
			const { slingSchema } = await import('./index');
			const result = slingSchema.safeParse({
				issue: 'bd-123',
				rig: ''
			});
			expect(result.success).toBe(false);
		});
	});
});
