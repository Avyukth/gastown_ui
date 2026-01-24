/**
 * Route Groups Structure Tests
 *
 * TDD: RED phase - tests written before implementation
 *
 * These tests verify that:
 * 1. Route groups are properly organized ((app), (auth), api)
 * 2. URL paths remain unchanged after reorganization
 * 3. Layout files exist for each route group
 * 4. All existing routes are properly migrated
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROUTES_PATH = path.resolve(process.cwd(), 'src/routes');

// =============================================================================
// Route Group Directory Structure Tests
// =============================================================================

describe('Route Group Directory Structure', () => {
	describe('(app) route group', () => {
		const APP_GROUP_PATH = path.join(ROUTES_PATH, '(app)');

		it('should have (app) directory for main app routes', () => {
			const exists = fs.existsSync(APP_GROUP_PATH);
			expect(exists).toBe(true);
		});

		it('should have layout file in (app) group', () => {
			const layoutPath = path.join(APP_GROUP_PATH, '+layout.svelte');
			const exists = fs.existsSync(layoutPath);
			expect(exists).toBe(true);
		});

		it('should have dashboard page at (app)/+page.svelte', () => {
			const pagePath = path.join(APP_GROUP_PATH, '+page.svelte');
			const exists = fs.existsSync(pagePath);
			expect(exists).toBe(true);
		});

		// Core app routes that must exist in (app) group
		const appRoutes = [
			'work',
			'agents',
			'mail',
			'queue',
			'convoys',
			'workflows',
			'rigs',
			'escalations',
			'health',
			'activity',
			'watchdog',
			'dogs',
			'logs',
			'stats',
			'seance',
			'issues'
		];

		for (const route of appRoutes) {
			it(`should have /${route} route in (app) group`, () => {
				const routePath = path.join(APP_GROUP_PATH, route);
				const exists = fs.existsSync(routePath);
				expect(exists).toBe(true);
			});
		}
	});

	describe('(auth) route group', () => {
		const AUTH_GROUP_PATH = path.join(ROUTES_PATH, '(auth)');

		it('should have (auth) directory for authentication routes', () => {
			const exists = fs.existsSync(AUTH_GROUP_PATH);
			expect(exists).toBe(true);
		});

		it('should have layout file in (auth) group', () => {
			const layoutPath = path.join(AUTH_GROUP_PATH, '+layout.svelte');
			const exists = fs.existsSync(layoutPath);
			expect(exists).toBe(true);
		});

		it('should have login route in (auth) group', () => {
			const loginPath = path.join(AUTH_GROUP_PATH, 'login');
			const exists = fs.existsSync(loginPath);
			expect(exists).toBe(true);
		});

		it('should have login page file', () => {
			const loginPagePath = path.join(AUTH_GROUP_PATH, 'login', '+page.svelte');
			const exists = fs.existsSync(loginPagePath);
			expect(exists).toBe(true);
		});
	});

	describe('api routes (not grouped)', () => {
		const API_PATH = path.join(ROUTES_PATH, 'api');

		it('should have api directory at root level (not in route group)', () => {
			const exists = fs.existsSync(API_PATH);
			expect(exists).toBe(true);
		});

		it('should have api/auth routes', () => {
			const authApiPath = path.join(API_PATH, 'auth');
			const exists = fs.existsSync(authApiPath);
			expect(exists).toBe(true);
		});

		it('should have api/gastown routes', () => {
			const gastownApiPath = path.join(API_PATH, 'gastown');
			const exists = fs.existsSync(gastownApiPath);
			expect(exists).toBe(true);
		});
	});

	describe('root level files', () => {
		it('should have root +layout.svelte', () => {
			const layoutPath = path.join(ROUTES_PATH, '+layout.svelte');
			const exists = fs.existsSync(layoutPath);
			expect(exists).toBe(true);
		});

		it('should have root +error.svelte', () => {
			const errorPath = path.join(ROUTES_PATH, '+error.svelte');
			const exists = fs.existsSync(errorPath);
			expect(exists).toBe(true);
		});
	});
});

// =============================================================================
// Route Group Layout Content Tests
// =============================================================================

describe('Route Group Layout Content', () => {
	describe('(app) layout', () => {
		it('should include navigation components', () => {
			const layoutPath = path.join(ROUTES_PATH, '(app)', '+layout.svelte');

			if (fs.existsSync(layoutPath)) {
				const content = fs.readFileSync(layoutPath, 'utf-8');
				// Should import or reference navigation components
				expect(content).toContain('children');
				// Layout should render children
				expect(content.includes('{@render children()}') || content.includes('{@render children?.()}')).toBe(true);
			} else {
				expect.fail('(app)/+layout.svelte does not exist');
			}
		});
	});

	describe('(auth) layout', () => {
		it('should be a minimal layout without main navigation', () => {
			const layoutPath = path.join(ROUTES_PATH, '(auth)', '+layout.svelte');

			if (fs.existsSync(layoutPath)) {
				const content = fs.readFileSync(layoutPath, 'utf-8');
				// Should render children
				expect(content.includes('{@render children()}') || content.includes('{@render children?.()}')).toBe(true);
				// Should NOT include full navigation components (BottomNav, Sidebar)
				expect(content).not.toContain('BottomNav');
				expect(content).not.toContain('Sidebar');
			} else {
				expect.fail('(auth)/+layout.svelte does not exist');
			}
		});
	});
});

// =============================================================================
// URL Path Preservation Tests
// =============================================================================

describe('URL Path Preservation', () => {
	// These tests verify that route groups don't affect URL paths
	// Route groups use parentheses, which are excluded from the URL

	describe('app routes maintain original paths', () => {
		const routeMappings = [
			{ group: '(app)', dir: '', expectedUrl: '/' },
			{ group: '(app)', dir: 'work', expectedUrl: '/work' },
			{ group: '(app)', dir: 'agents', expectedUrl: '/agents' },
			{ group: '(app)', dir: 'mail', expectedUrl: '/mail' },
			{ group: '(app)', dir: 'convoys', expectedUrl: '/convoys' },
			{ group: '(app)', dir: 'queue', expectedUrl: '/queue' },
			{ group: '(app)', dir: 'health', expectedUrl: '/health' },
			{ group: '(app)', dir: 'escalations', expectedUrl: '/escalations' },
		];

		for (const { group, dir, expectedUrl } of routeMappings) {
			it(`${group}/${dir || '+'} should map to ${expectedUrl}`, () => {
				// SvelteKit route groups with parentheses don't affect URL
				// (app)/work/+page.svelte -> /work
				// This is a structural verification that files exist in correct location

				const routePath = dir
					? path.join(ROUTES_PATH, group, dir)
					: path.join(ROUTES_PATH, group);

				const pageExists =
					fs.existsSync(path.join(routePath, '+page.svelte')) ||
					fs.existsSync(path.join(routePath, '+page.server.ts'));

				expect(pageExists).toBe(true);
			});
		}
	});

	describe('auth routes maintain original paths', () => {
		it('(auth)/login should map to /login', () => {
			const loginPath = path.join(ROUTES_PATH, '(auth)', 'login');
			const pageExists = fs.existsSync(path.join(loginPath, '+page.svelte'));
			expect(pageExists).toBe(true);
		});
	});

	describe('api routes are unchanged', () => {
		const apiRoutes = [
			'api/auth/login',
			'api/auth/logout',
			'api/auth/me',
			'api/gastown/status',
			'api/gastown/agents',
			'api/gastown/mail',
		];

		for (const route of apiRoutes) {
			it(`${route} should exist at root level (not in route group)`, () => {
				const routePath = path.join(ROUTES_PATH, route);
				const serverExists = fs.existsSync(path.join(routePath, '+server.ts'));
				expect(serverExists).toBe(true);
			});
		}
	});
});

// =============================================================================
// Migration Completeness Tests
// =============================================================================

describe('Migration Completeness', () => {
	it('should NOT have app routes at root level (except api and route groups)', () => {
		const rootEntries = fs.readdirSync(ROUTES_PATH);

		// These are the only allowed entries at root level
		const allowedRootEntries = [
			'(app)',      // App route group
			'(auth)',     // Auth route group
			'api',        // API routes (not grouped)
			'+layout.svelte',
			'+error.svelte',
			'+page.svelte',      // Optional: could redirect to (app)
			'+page.server.ts',   // Optional: root page server
			'__tests__',         // Test directory
		];

		const unexpectedEntries = rootEntries.filter(entry => {
			// Allow test files and directories
			if (entry.includes('.test.') || entry.includes('.spec.')) return false;
			// Check if it's an allowed entry
			return !allowedRootEntries.includes(entry);
		});

		// Should have no unexpected route directories at root
		expect(unexpectedEntries).toEqual([]);
	});

	it('should have moved all page routes into (app) group', () => {
		const appGroupPath = path.join(ROUTES_PATH, '(app)');

		if (!fs.existsSync(appGroupPath)) {
			expect.fail('(app) directory does not exist');
			return;
		}

		const appRoutes = fs.readdirSync(appGroupPath);

		// Verify key routes exist
		const requiredRoutes = ['work', 'agents', 'mail', 'convoys', 'queue'];
		for (const route of requiredRoutes) {
			expect(appRoutes).toContain(route);
		}
	});
});

// =============================================================================
// Nested Route Tests
// =============================================================================

describe('Nested Routes in Groups', () => {
	describe('(app)/agents nested routes', () => {
		it('should have agents/[id] dynamic route', () => {
			const dynamicPath = path.join(ROUTES_PATH, '(app)', 'agents', '[id]');
			const exists = fs.existsSync(dynamicPath);
			expect(exists).toBe(true);
		});
	});

	describe('(app)/convoys nested routes', () => {
		it('should have convoys/[id] dynamic route', () => {
			const dynamicPath = path.join(ROUTES_PATH, '(app)', 'convoys', '[id]');
			const exists = fs.existsSync(dynamicPath);
			expect(exists).toBe(true);
		});
	});

	describe('(app)/mail nested routes', () => {
		it('should have mail/[id] dynamic route', () => {
			const dynamicPath = path.join(ROUTES_PATH, '(app)', 'mail', '[id]');
			const exists = fs.existsSync(dynamicPath);
			expect(exists).toBe(true);
		});

		it('should have mail/compose route', () => {
			const composePath = path.join(ROUTES_PATH, '(app)', 'mail', 'compose');
			const exists = fs.existsSync(composePath);
			expect(exists).toBe(true);
		});
	});

	describe('(app)/escalations nested routes', () => {
		it('should have escalations/[id] dynamic route', () => {
			const dynamicPath = path.join(ROUTES_PATH, '(app)', 'escalations', '[id]');
			const exists = fs.existsSync(dynamicPath);
			expect(exists).toBe(true);
		});
	});

	describe('(app)/issues nested routes', () => {
		it('should have issues/[id] dynamic route', () => {
			const dynamicPath = path.join(ROUTES_PATH, '(app)', 'issues', '[id]');
			const exists = fs.existsSync(dynamicPath);
			expect(exists).toBe(true);
		});
	});

	describe('(auth)/login nested routes', () => {
		it('should have login/mobile route', () => {
			const mobilePath = path.join(ROUTES_PATH, '(auth)', 'login', 'mobile');
			const exists = fs.existsSync(mobilePath);
			expect(exists).toBe(true);
		});
	});
});
