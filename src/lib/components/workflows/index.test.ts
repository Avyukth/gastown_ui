import { describe, it, expect } from 'vitest';

describe('workflows component module exports', () => {
	describe('WorkflowFilters', () => {
		it('exports WorkflowFilters component', async () => {
			const module = await import('./index');
			expect(module.WorkflowFilters).toBeDefined();
			// Svelte components are exported as strings (path) in test environment
			// The important thing is the export exists and is truthy
			expect(module.WorkflowFilters).toBeTruthy();
		});
	});

	describe('WorkflowList', () => {
		it('exports WorkflowList component', async () => {
			const module = await import('./index');
			expect(module.WorkflowList).toBeDefined();
			expect(module.WorkflowList).toBeTruthy();
		});
	});

	describe('WorkflowDetail', () => {
		it('exports WorkflowDetail component', async () => {
			const module = await import('./index');
			expect(module.WorkflowDetail).toBeDefined();
			expect(module.WorkflowDetail).toBeTruthy();
		});
	});

	describe('type exports', () => {
		it('exports types module successfully', async () => {
			// Type-only imports don't exist at runtime, but we verify the module loads
			// and the types are properly re-exported by importing them
			const module = await import('./types');
			expect(module).toBeDefined();
		});

		it('re-exports types from index', async () => {
			// Verify types are re-exported from index
			const indexModule = await import('./index');
			// Types aren't runtime values, but the module should import cleanly
			expect(indexModule).toBeDefined();
		});
	});
});
