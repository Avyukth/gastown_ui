/**
 * Domain Components Module Tests
 *
 * Tests for the business domain components barrel exports.
 * These components are organized by domain area (work, agents, mail, queue, convoys).
 */
import { describe, it, expect } from 'vitest';

describe('Domain Components Module Exports', () => {
	describe('Work domain', () => {
		it('exports WorkFilters component', async () => {
			const module = await import('./index');
			expect(typeof module.WorkFilters).toBe('string');
			expect(module.WorkFilters).toMatch(/WorkFilters\.svelte/);
		});

		it('exports WorkList component', async () => {
			const module = await import('./index');
			expect(typeof module.WorkList).toBe('string');
			expect(module.WorkList).toMatch(/WorkList\.svelte/);
		});

		it('exports WorkCreateForm component', async () => {
			const module = await import('./index');
			expect(typeof module.WorkCreateForm).toBe('string');
			expect(module.WorkCreateForm).toMatch(/WorkCreateForm\.svelte/);
		});

		it('exports WorkSlingForm component', async () => {
			const module = await import('./index');
			expect(typeof module.WorkSlingForm).toBe('string');
			expect(module.WorkSlingForm).toMatch(/WorkSlingForm\.svelte/);
		});

		it('exports WorkItemCard component', async () => {
			const module = await import('./index');
			expect(typeof module.WorkItemCard).toBe('string');
			expect(module.WorkItemCard).toMatch(/WorkItemCard\.svelte/);
		});

		it('exports WorkItemDetail component', async () => {
			const module = await import('./index');
			expect(typeof module.WorkItemDetail).toBe('string');
			expect(module.WorkItemDetail).toMatch(/WorkItemDetail\.svelte/);
		});

		it('exports workFiltersVariants as callable function', async () => {
			const { workFiltersVariants } = await import('./index');
			expect(typeof workFiltersVariants).toBe('function');
			const result = workFiltersVariants();
			expect(result).toHaveProperty('container');
		});

		it('exports workListVariants as callable function', async () => {
			const { workListVariants } = await import('./index');
			expect(typeof workListVariants).toBe('function');
			const result = workListVariants();
			expect(result).toHaveProperty('container');
		});

		it('exports workCreateFormVariants as callable function', async () => {
			const { workCreateFormVariants } = await import('./index');
			expect(typeof workCreateFormVariants).toBe('function');
			const result = workCreateFormVariants();
			expect(result).toHaveProperty('container');
		});

		it('exports workSlingFormVariants as callable function', async () => {
			const { workSlingFormVariants } = await import('./index');
			expect(typeof workSlingFormVariants).toBe('function');
			const result = workSlingFormVariants();
			expect(result).toHaveProperty('container');
		});

		it('exports workItemCardVariants as callable function', async () => {
			const { workItemCardVariants } = await import('./index');
			expect(typeof workItemCardVariants).toBe('function');
		});

		it('exports workItemDetailVariants as callable function', async () => {
			const { workItemDetailVariants } = await import('./index');
			expect(typeof workItemDetailVariants).toBe('function');
		});

		it('exports issueSchema validation with safeParse method', async () => {
			const { issueSchema } = await import('./index');
			expect(typeof issueSchema.safeParse).toBe('function');
			const validResult = issueSchema.safeParse({
				title: 'Test Issue',
				type: 'task',
				priority: 2
			});
			expect(validResult.success).toBe(true);
		});

		it('exports convoySchema validation with safeParse method', async () => {
			const { convoySchema } = await import('./index');
			expect(typeof convoySchema.safeParse).toBe('function');
		});

		it('exports slingSchema validation with safeParse method', async () => {
			const { slingSchema } = await import('./index');
			expect(typeof slingSchema.safeParse).toBe('function');
			const validResult = slingSchema.safeParse({
				issue: 'bd-123',
				rig: 'gastownui'
			});
			expect(validResult.success).toBe(true);
		});
	});

	describe('Agents domain', () => {
		it('exports AgentCard component', async () => {
			const module = await import('./index');
			expect(typeof module.AgentCard).toBe('string');
			expect(module.AgentCard).toMatch(/AgentCard\.svelte/);
		});

		it('exports AgentCardSkeleton component', async () => {
			const module = await import('./index');
			expect(typeof module.AgentCardSkeleton).toBe('string');
			expect(module.AgentCardSkeleton).toMatch(/AgentCardSkeleton\.svelte/);
		});
	});

	describe('Seance domain', () => {
		it('exports SeanceControls component', async () => {
			const module = await import('./index');
			expect(typeof module.SeanceControls).toBe('string');
			expect(module.SeanceControls).toMatch(/SeanceControls\.svelte/);
		});

		it('exports SeanceOutput component', async () => {
			const module = await import('./index');
			expect(typeof module.SeanceOutput).toBe('string');
			expect(module.SeanceOutput).toMatch(/SeanceOutput\.svelte/);
		});

		it('exports SeanceHistory component', async () => {
			const module = await import('./index');
			expect(typeof module.SeanceHistory).toBe('string');
			expect(module.SeanceHistory).toMatch(/SeanceHistory\.svelte/);
		});
	});

	describe('Workflows domain', () => {
		it('exports WorkflowFilters component', async () => {
			const module = await import('./index');
			expect(typeof module.WorkflowFilters).toBe('string');
			expect(module.WorkflowFilters).toMatch(/WorkflowFilters\.svelte/);
		});

		it('exports WorkflowList component', async () => {
			const module = await import('./index');
			expect(typeof module.WorkflowList).toBe('string');
			expect(module.WorkflowList).toMatch(/WorkflowList\.svelte/);
		});

		it('exports WorkflowDetail component', async () => {
			const module = await import('./index');
			expect(typeof module.WorkflowDetail).toBe('string');
			expect(module.WorkflowDetail).toMatch(/WorkflowDetail\.svelte/);
		});
	});

	describe('Module Structure', () => {
		it('exports all expected domain component keys', async () => {
			const indexModule = await import('./index');
			const exportKeys = Object.keys(indexModule);

			// Work domain
			expect(exportKeys).toContain('WorkFilters');
			expect(exportKeys).toContain('workFiltersVariants');
			expect(exportKeys).toContain('WorkList');
			expect(exportKeys).toContain('workListVariants');
			expect(exportKeys).toContain('WorkCreateForm');
			expect(exportKeys).toContain('workCreateFormVariants');
			expect(exportKeys).toContain('WorkSlingForm');
			expect(exportKeys).toContain('workSlingFormVariants');
			expect(exportKeys).toContain('WorkItemCard');
			expect(exportKeys).toContain('workItemCardVariants');
			expect(exportKeys).toContain('WorkItemDetail');
			expect(exportKeys).toContain('workItemDetailVariants');
			expect(exportKeys).toContain('issueSchema');
			expect(exportKeys).toContain('convoySchema');
			expect(exportKeys).toContain('slingSchema');

			// Agents domain
			expect(exportKeys).toContain('AgentCard');
			expect(exportKeys).toContain('AgentCardSkeleton');

			// Seance domain
			expect(exportKeys).toContain('SeanceControls');
			expect(exportKeys).toContain('SeanceOutput');
			expect(exportKeys).toContain('SeanceHistory');

			// Workflows domain
			expect(exportKeys).toContain('WorkflowFilters');
			expect(exportKeys).toContain('WorkflowList');
			expect(exportKeys).toContain('WorkflowDetail');
		});
	});

	describe('Schema Validation', () => {
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
