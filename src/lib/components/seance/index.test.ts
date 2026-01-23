import { describe, it, expect } from 'vitest';

describe('seance component module exports', () => {
	describe('SeanceControls', () => {
		it('exports SeanceControls component with correct path reference', async () => {
			const module = await import('./index');
			// In test environment, Svelte components are exported as string paths
			// Verify the export is a string containing the component path
			expect(typeof module.SeanceControls).toBe('string');
			expect(module.SeanceControls).toMatch(/SeanceControls\.svelte/);
		});
	});

	describe('SeanceOutput', () => {
		it('exports SeanceOutput component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.SeanceOutput).toBe('string');
			expect(module.SeanceOutput).toMatch(/SeanceOutput\.svelte/);
		});
	});

	describe('SeanceHistory', () => {
		it('exports SeanceHistory component with correct path reference', async () => {
			const module = await import('./index');
			expect(typeof module.SeanceHistory).toBe('string');
			expect(module.SeanceHistory).toMatch(/SeanceHistory\.svelte/);
		});
	});

	describe('type exports', () => {
		it('exports types module with no runtime values (type-only exports)', async () => {
			// Type-only exports don't exist at runtime, verify module loads cleanly
			const module = await import('./types');
			expect(Object.keys(module)).toEqual([]);
		});

		it('re-exports components from index with correct structure', async () => {
			// Verify index module exports the expected component keys
			const indexModule = await import('./index');
			const exportKeys = Object.keys(indexModule);
			expect(exportKeys).toContain('SeanceControls');
			expect(exportKeys).toContain('SeanceOutput');
			expect(exportKeys).toContain('SeanceHistory');
			expect(exportKeys.length).toBeGreaterThanOrEqual(3);
		});
	});
});
