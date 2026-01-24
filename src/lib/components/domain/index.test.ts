/**
 * Domain Components Module Tests
 *
 * Tests for the business domain components barrel exports.
 * These components are organized by domain area (work, agents, mail, queue, convoys).
 *
 * NOTE: In Svelte 5, components are exported as functions (component constructors).
 */
import { describe, it, expect, beforeAll } from 'vitest';

// Pre-load the module once to avoid timeout on first test
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let domainModule: typeof import('./index');

beforeAll(async () => {
	domainModule = await import('./index');
}, 30000); // 30 second timeout for initial module load

describe('Domain Components Module Exports', () => {
	describe('Work domain', () => {
		it('exports WorkFilters component as a function', () => {
			expect(typeof domainModule.WorkFilters).toBe('function');
		});

		it('exports WorkList component as a function', () => {
			expect(typeof domainModule.WorkList).toBe('function');
		});

		it('exports WorkCreateForm component as a function', () => {
			expect(typeof domainModule.WorkCreateForm).toBe('function');
		});

		it('exports WorkSlingForm component as a function', () => {
			expect(typeof domainModule.WorkSlingForm).toBe('function');
		});

		it('exports WorkItemCard component as a function', () => {
			expect(typeof domainModule.WorkItemCard).toBe('function');
		});

		it('exports WorkItemDetail component as a function', () => {
			expect(typeof domainModule.WorkItemDetail).toBe('function');
		});

		it('exports workFiltersVariants as callable function with expected slots', () => {
			expect(typeof domainModule.workFiltersVariants).toBe('function');
			const result = domainModule.workFiltersVariants();
			expect(result).toHaveProperty('container');
		});

		it('exports workListVariants as callable function with expected slots', () => {
			expect(typeof domainModule.workListVariants).toBe('function');
			const result = domainModule.workListVariants();
			expect(result).toHaveProperty('container');
		});

		it('exports workCreateFormVariants as callable function with expected slots', () => {
			expect(typeof domainModule.workCreateFormVariants).toBe('function');
			const result = domainModule.workCreateFormVariants();
			expect(result).toHaveProperty('container');
		});

		it('exports workSlingFormVariants as callable function with expected slots', () => {
			expect(typeof domainModule.workSlingFormVariants).toBe('function');
			const result = domainModule.workSlingFormVariants();
			expect(result).toHaveProperty('container');
		});

		it('exports workItemCardVariants as callable function', () => {
			expect(typeof domainModule.workItemCardVariants).toBe('function');
		});

		it('exports workItemDetailVariants as callable function', () => {
			expect(typeof domainModule.workItemDetailVariants).toBe('function');
		});

		it('exports issueSchema validation with safeParse method', () => {
			expect(typeof domainModule.issueSchema.safeParse).toBe('function');
			const validResult = domainModule.issueSchema.safeParse({
				title: 'Test Issue',
				type: 'task',
				priority: 2
			});
			expect(validResult.success).toBe(true);
		});

		it('exports convoySchema validation with safeParse method', () => {
			expect(typeof domainModule.convoySchema.safeParse).toBe('function');
		});

		it('exports slingSchema validation with safeParse method', () => {
			expect(typeof domainModule.slingSchema.safeParse).toBe('function');
			const validResult = domainModule.slingSchema.safeParse({
				issue: 'bd-123',
				rig: 'gastownui'
			});
			expect(validResult.success).toBe(true);
		});
	});

	describe('Agents domain', () => {
		it('exports AgentCard component as a function', () => {
			expect(typeof domainModule.AgentCard).toBe('function');
		});

		it('exports AgentCardSkeleton component as a function', () => {
			expect(typeof domainModule.AgentCardSkeleton).toBe('function');
		});
	});

	describe('Seance domain', () => {
		it('exports SeanceControls component as a function', () => {
			expect(typeof domainModule.SeanceControls).toBe('function');
		});

		it('exports SeanceOutput component as a function', () => {
			expect(typeof domainModule.SeanceOutput).toBe('function');
		});

		it('exports SeanceHistory component as a function', () => {
			expect(typeof domainModule.SeanceHistory).toBe('function');
		});
	});

	describe('Workflows domain', () => {
		it('exports WorkflowFilters component as a function', () => {
			expect(typeof domainModule.WorkflowFilters).toBe('function');
		});

		it('exports WorkflowList component as a function', () => {
			expect(typeof domainModule.WorkflowList).toBe('function');
		});

		it('exports WorkflowDetail component as a function', () => {
			expect(typeof domainModule.WorkflowDetail).toBe('function');
		});
	});

	describe('Module Structure', () => {
		it('exports all expected domain component keys', () => {
			const exportKeys = Object.keys(domainModule);

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
		it('issueSchema rejects empty title', () => {
			const result = domainModule.issueSchema.safeParse({
				title: '',
				type: 'task',
				priority: 2
			});
			expect(result.success).toBe(false);
		});

		it('issueSchema rejects title less than 3 chars', () => {
			const result = domainModule.issueSchema.safeParse({
				title: 'ab',
				type: 'task',
				priority: 2
			});
			expect(result.success).toBe(false);
		});

		it('issueSchema rejects invalid type', () => {
			const result = domainModule.issueSchema.safeParse({
				title: 'Test Issue',
				type: 'invalid',
				priority: 2
			});
			expect(result.success).toBe(false);
		});

		it('issueSchema rejects priority out of range', () => {
			const result = domainModule.issueSchema.safeParse({
				title: 'Test Issue',
				type: 'task',
				priority: 5
			});
			expect(result.success).toBe(false);
		});

		it('slingSchema rejects empty issue', () => {
			const result = domainModule.slingSchema.safeParse({
				issue: '',
				rig: 'gastownui'
			});
			expect(result.success).toBe(false);
		});

		it('slingSchema rejects empty rig', () => {
			const result = domainModule.slingSchema.safeParse({
				issue: 'bd-123',
				rig: ''
			});
			expect(result.success).toBe(false);
		});
	});
});
