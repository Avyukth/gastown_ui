/**
 * Auth Module Separation Tests
 *
 * TDD: RED phase - tests written before implementation
 *
 * These tests verify that:
 * 1. Client auth module does not import any server-only code
 * 2. Server auth module contains all server-only functionality
 * 3. No Node.js built-ins leak into client bundle
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// =============================================================================
// Module Separation Tests
// =============================================================================

describe('Auth Module Separation', () => {
	const LIB_PATH = path.resolve(process.cwd(), 'src/lib');

	describe('Client Auth Module ($lib/client/auth)', () => {
		const CLIENT_AUTH_PATH = path.join(LIB_PATH, 'client', 'auth');

		it('should export auth store functions via index', () => {
			// Check the index.ts file exports store functions
			const indexContent = fs.readFileSync(
				path.join(CLIENT_AUTH_PATH, 'index.ts'),
				'utf-8'
			);

			// Store functions should be exported
			expect(indexContent).toContain('getAuthState');
			expect(indexContent).toContain('isAuthenticated');
			expect(indexContent).toContain('getUser');
			expect(indexContent).toContain('initializeAuth');
			expect(indexContent).toContain('login');
			expect(indexContent).toContain('logout');
			expect(indexContent).toContain('refreshToken');
			expect(indexContent).toContain('forceRefresh');
			expect(indexContent).toContain('getAuthHealth');
			expect(indexContent).toContain('createAuthStore');
		});

		it('should export client-safe constants', async () => {
			// Import constants module directly (no $app/environment dependency)
			const { AUTH_COOKIES, CSRF_COOKIES, CSRF_HEADER } = await import(
				'$lib/client/auth/constants'
			);

			expect(CSRF_COOKIES).toBeDefined();
			expect(CSRF_HEADER).toBeDefined();
			expect(AUTH_COOKIES).toBeDefined();

			expect(CSRF_COOKIES.CSRF_TOKEN).toBe('csrf_token');
			expect(CSRF_HEADER).toBe('X-CSRF-Token');
			expect(AUTH_COOKIES.ACCESS_TOKEN).toBe('auth_access');
		});

		it('should export shared types', () => {
			// Types are compile-time only, so we verify the module can be imported
			// and the types are re-exported in index.ts
			const indexContent = fs.readFileSync(
				path.join(CLIENT_AUTH_PATH, 'index.ts'),
				'utf-8'
			);

			expect(indexContent).toContain('export type');
			expect(indexContent).toContain('User');
			expect(indexContent).toContain('AuthState');
			expect(indexContent).toContain('LoginCredentials');
		});

		it('should NOT export server-only cookie functions (by index structure)', () => {
			const indexContent = fs.readFileSync(
				path.join(CLIENT_AUTH_PATH, 'index.ts'),
				'utf-8'
			);

			// These should NOT be in the client module exports
			expect(indexContent).not.toContain('setAccessToken');
			expect(indexContent).not.toContain('setRefreshToken');
			expect(indexContent).not.toContain('setAuthState');
			expect(indexContent).not.toContain('getAccessToken');
			expect(indexContent).not.toContain('getRefreshToken');
			expect(indexContent).not.toContain('clearAuthCookies');
			expect(indexContent).not.toContain('setAuthCookies');
		});

		it('should NOT export server-only CSRF functions (by index structure)', () => {
			const indexContent = fs.readFileSync(
				path.join(CLIENT_AUTH_PATH, 'index.ts'),
				'utf-8'
			);

			// These should NOT be in the client module exports
			expect(indexContent).not.toContain('generateCsrfToken');
			expect(indexContent).not.toContain('setCsrfToken');
			expect(indexContent).not.toContain('getCsrfToken');
			expect(indexContent).not.toContain('clearCsrfTokens');
			expect(indexContent).not.toContain('ensureCsrfToken');
			expect(indexContent).not.toContain('validateCsrfToken');
			expect(indexContent).not.toContain('checkCsrfProtection');
		});

		it('should NOT import node:crypto or @sveltejs/kit Cookies', () => {
			// Scan all files in client auth directory
			const files = fs
				.readdirSync(CLIENT_AUTH_PATH)
				.filter((f) => f.endsWith('.ts') && !f.includes('.test.') && !f.includes('__tests__'));

			for (const file of files) {
				const filePath = path.join(CLIENT_AUTH_PATH, file);
				const content = fs.readFileSync(filePath, 'utf-8');

				// No Node.js built-ins
				expect(content).not.toContain("from 'node:crypto'");
				expect(content).not.toContain("from 'crypto'");

				// No SvelteKit Cookies type (server-only)
				expect(content).not.toContain("type { Cookies }");
				expect(content).not.toContain("import type { Cookies }");
			}
		});

		it('should export parseAuthStateCookie (client-safe utility)', async () => {
			const { parseAuthStateCookie } = await import('$lib/client/auth/constants');

			expect(typeof parseAuthStateCookie).toBe('function');

			// Verify it works with valid input
			const result = parseAuthStateCookie('{"authenticated":true,"expiresAt":1234567890}');
			expect(result).toEqual({ authenticated: true, expiresAt: 1234567890 });

			// Verify it handles invalid input
			expect(parseAuthStateCookie(undefined)).toBeNull();
			expect(parseAuthStateCookie('invalid')).toBeNull();
		});
	});

	describe('Server Auth Module ($lib/server/auth)', () => {
		it('should export JWT functions', async () => {
			const serverAuth = await import('$lib/server/auth');

			expect(typeof serverAuth.createAccessToken).toBe('function');
			expect(typeof serverAuth.createRefreshToken).toBe('function');
			expect(typeof serverAuth.verifyToken).toBe('function');
			expect(typeof serverAuth.extractUserFromPayload).toBe('function');
			expect(typeof serverAuth.authenticateUser).toBe('function');
			expect(typeof serverAuth.refreshTokens).toBe('function');
		});

		it('should export auth verification functions', async () => {
			const serverAuth = await import('$lib/server/auth');

			expect(typeof serverAuth.verifyAuth).toBe('function');
			expect(typeof serverAuth.requireAuth).toBe('function');
			expect(serverAuth.AuthError).toBeDefined();
		});

		it('should export cookie utilities', async () => {
			const serverAuth = await import('$lib/server/auth');

			expect(typeof serverAuth.setAccessToken).toBe('function');
			expect(typeof serverAuth.setRefreshToken).toBe('function');
			expect(typeof serverAuth.setAuthState).toBe('function');
			expect(typeof serverAuth.getAccessToken).toBe('function');
			expect(typeof serverAuth.getRefreshToken).toBe('function');
			expect(typeof serverAuth.clearAuthCookies).toBe('function');
			expect(typeof serverAuth.setAuthCookies).toBe('function');
		});

		it('should export CSRF functions', async () => {
			const serverAuth = await import('$lib/server/auth');

			expect(typeof serverAuth.generateCsrfToken).toBe('function');
			expect(typeof serverAuth.setCsrfToken).toBe('function');
			expect(typeof serverAuth.getCsrfToken).toBe('function');
			expect(typeof serverAuth.clearCsrfTokens).toBe('function');
			expect(typeof serverAuth.ensureCsrfToken).toBe('function');
			expect(typeof serverAuth.validateCsrfToken).toBe('function');
			expect(typeof serverAuth.checkCsrfProtection).toBe('function');
		});

		it('should export token expiry constants', async () => {
			const serverAuth = await import('$lib/server/auth');

			expect(serverAuth.ACCESS_TOKEN_EXPIRY_SECONDS).toBe(15 * 60);
			expect(serverAuth.REFRESH_TOKEN_EXPIRY_SECONDS).toBe(7 * 24 * 60 * 60);
		});

		it('should export shared constants', async () => {
			const serverAuth = await import('$lib/server/auth');

			expect(serverAuth.AUTH_COOKIES).toBeDefined();
			expect(serverAuth.CSRF_COOKIES).toBeDefined();
			expect(serverAuth.CSRF_HEADER).toBeDefined();
		});
	});

	describe('Backwards Compatibility ($lib/auth)', () => {
		it('should still export all types for backwards compat (by structure)', () => {
			const indexPath = path.join(LIB_PATH, 'auth', 'index.ts');
			const content = fs.readFileSync(indexPath, 'utf-8');

			// Types are re-exported
			expect(content).toContain('type User');
			expect(content).toContain('type AuthState');
			expect(content).toContain('type LoginCredentials');
			expect(content).toContain('type SessionData');
			expect(content).toContain('type AuthResponse');
		});

		it('should export client-safe functions from $lib/auth (by structure)', () => {
			const indexPath = path.join(LIB_PATH, 'auth', 'index.ts');
			const content = fs.readFileSync(indexPath, 'utf-8');

			// Store functions should still be accessible
			expect(content).toContain('getAuthState');
			expect(content).toContain('isAuthenticated');
			expect(content).toContain('login');
			expect(content).toContain('logout');
		});

		it('should reference client module for imports', () => {
			// This would be a runtime warning in dev mode when accessing server-only
			// exports from client code. For now, we verify the module structure
			// allows for such warnings to be added.
			const indexPath = path.join(LIB_PATH, 'auth', 'index.ts');
			const content = fs.readFileSync(indexPath, 'utf-8');

			// The index should reference the client module
			expect(content).toContain("from '$lib/client/auth'");

			// The index should have a clear comment about the separation
			expect(content).toContain('client');
			expect(content).toContain('server');
		});
	});
});

// =============================================================================
// Bundle Leakage Prevention Tests
// =============================================================================

describe('Bundle Leakage Prevention', () => {
	it('should have no node: imports in client auth module', () => {
		const clientAuthPath = path.resolve(process.cwd(), 'src/lib/client/auth');

		if (fs.existsSync(clientAuthPath)) {
			const files = fs.readdirSync(clientAuthPath).filter((f) => f.endsWith('.ts'));

			for (const file of files) {
				const content = fs.readFileSync(path.join(clientAuthPath, file), 'utf-8');

				// No Node.js built-in imports
				expect(content).not.toMatch(/from ['"]node:/);
				expect(content).not.toMatch(/require\(['"]node:/);
			}
		}
	});

	it('should not import $lib/server from client auth', () => {
		const clientAuthPath = path.resolve(process.cwd(), 'src/lib/client/auth');

		if (fs.existsSync(clientAuthPath)) {
			const files = fs.readdirSync(clientAuthPath).filter((f) => f.endsWith('.ts'));

			for (const file of files) {
				const content = fs.readFileSync(path.join(clientAuthPath, file), 'utf-8');

				// No server imports
				expect(content).not.toMatch(/from ['"]\$lib\/server/);
			}
		}
	});
});
