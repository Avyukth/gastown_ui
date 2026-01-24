/**
 * Directory Structure Tests for bd-3ol
 *
 * Verifies the component directory structure meets acceptance criteria:
 * - Max 20 files per directory
 * - Components organized into core/layout/domain structure
 *
 * RED PHASE: Tests written before reorganization
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const COMPONENTS_DIR = join(__dirname, '..');
const MAX_FILES_PER_DIR = 20;

/**
 * Count Svelte component files in a directory (non-recursive)
 */
function countSvelteFiles(dir: string): number {
	try {
		const entries = readdirSync(dir);
		return entries.filter((entry) => {
			const fullPath = join(dir, entry);
			return statSync(fullPath).isFile() && entry.endsWith('.svelte');
		}).length;
	} catch {
		return 0;
	}
}

/**
 * Count all files in a directory (non-recursive, excluding test files)
 */
function countFiles(dir: string): number {
	try {
		const entries = readdirSync(dir);
		return entries.filter((entry) => {
			const fullPath = join(dir, entry);
			return (
				statSync(fullPath).isFile() &&
				!entry.endsWith('.test.ts') &&
				!entry.endsWith('.test.js')
			);
		}).length;
	} catch {
		return 0;
	}
}

/**
 * Get subdirectories in a directory
 */
function getSubdirectories(dir: string): string[] {
	try {
		const entries = readdirSync(dir);
		return entries.filter((entry) => {
			const fullPath = join(dir, entry);
			return statSync(fullPath).isDirectory() && !entry.startsWith('__');
		});
	} catch {
		return [];
	}
}

describe('Component Directory Structure (bd-3ol)', () => {
	describe('Root components directory constraints', () => {
		it('has max 20 Svelte files at root level', () => {
			const rootSvelteCount = countSvelteFiles(COMPONENTS_DIR);
			expect(rootSvelteCount).toBeLessThanOrEqual(
				MAX_FILES_PER_DIR,
				`Root components directory has ${rootSvelteCount} .svelte files, expected <= ${MAX_FILES_PER_DIR}`
			);
		});

		it('has required subdirectory structure', () => {
			const subdirs = getSubdirectories(COMPONENTS_DIR);
			expect(subdirs).toContain('core');
			expect(subdirs).toContain('layout');
			expect(subdirs).toContain('domain');
		});
	});

	describe('Core directory constraints', () => {
		const coreDir = join(COMPONENTS_DIR, 'core');

		it('exists', () => {
			expect(() => readdirSync(coreDir)).not.toThrow();
		});

		it('has max 20 files', () => {
			const fileCount = countFiles(coreDir);
			expect(fileCount).toBeLessThanOrEqual(
				MAX_FILES_PER_DIR,
				`Core directory has ${fileCount} files, expected <= ${MAX_FILES_PER_DIR}`
			);
		});

		it('contains primitive UI components', () => {
			const svelteCount = countSvelteFiles(coreDir);
			expect(svelteCount).toBeGreaterThan(
				0,
				'Core directory should contain Svelte components'
			);
		});
	});

	describe('Layout directory constraints', () => {
		const layoutDir = join(COMPONENTS_DIR, 'layout');

		it('exists', () => {
			expect(() => readdirSync(layoutDir)).not.toThrow();
		});

		it('has max 20 files', () => {
			const fileCount = countFiles(layoutDir);
			expect(fileCount).toBeLessThanOrEqual(
				MAX_FILES_PER_DIR,
				`Layout directory has ${fileCount} files, expected <= ${MAX_FILES_PER_DIR}`
			);
		});

		it('contains layout/navigation components', () => {
			const svelteCount = countSvelteFiles(layoutDir);
			expect(svelteCount).toBeGreaterThan(
				0,
				'Layout directory should contain Svelte components'
			);
		});
	});

	describe('Domain directory constraints', () => {
		const domainDir = join(COMPONENTS_DIR, 'domain');

		it('exists', () => {
			expect(() => readdirSync(domainDir)).not.toThrow();
		});

		it('has max 20 files or uses subdomain structure', () => {
			const fileCount = countFiles(domainDir);
			const subdirs = getSubdirectories(domainDir);

			// Either has <= 20 files at root, or uses subdirectories for domains
			const hasValidStructure =
				fileCount <= MAX_FILES_PER_DIR || subdirs.length > 0;
			expect(hasValidStructure).toBe(true);
		});

		it('contains domain-specific components', () => {
			// Check either directly in domain/ or in subdirectories
			let totalSvelteCount = countSvelteFiles(domainDir);

			const subdirs = getSubdirectories(domainDir);
			for (const subdir of subdirs) {
				totalSvelteCount += countSvelteFiles(join(domainDir, subdir));
			}

			expect(totalSvelteCount).toBeGreaterThan(
				0,
				'Domain directory should contain Svelte components'
			);
		});
	});

	describe('All subdirectories respect file limit', () => {
		it('no subdirectory exceeds max file count', () => {
			const allDirs = [
				{ name: 'core', path: join(COMPONENTS_DIR, 'core') },
				{ name: 'layout', path: join(COMPONENTS_DIR, 'layout') },
				{ name: 'domain', path: join(COMPONENTS_DIR, 'domain') },
				{ name: 'work', path: join(COMPONENTS_DIR, 'work') },
				{ name: 'seance', path: join(COMPONENTS_DIR, 'seance') },
				{ name: 'workflows', path: join(COMPONENTS_DIR, 'workflows') },
				{ name: 'command-palette', path: join(COMPONENTS_DIR, 'command-palette') },
				{ name: 'global-search', path: join(COMPONENTS_DIR, 'global-search') }
			];

			const violations: string[] = [];

			for (const { name, path } of allDirs) {
				try {
					const count = countFiles(path);
					if (count > MAX_FILES_PER_DIR) {
						violations.push(`${name}: ${count} files`);
					}
				} catch {
					// Directory doesn't exist, skip
				}
			}

			expect(violations).toEqual([]);
		});
	});
});
