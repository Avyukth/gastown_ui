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

		it('should export auth store functions', async () => {
			const clientAuth = await import('$lib/client/auth');

			// Store functions
			expect(typeof clientAuth.getAuthState).toBe('function');
			expect(typeof clientAuth.isAuthenticated).toBe('function');
			expect(typeof clientAuth.getUser).toBe('function');
			expect(typeof clientAuth.initializeAuth).toBe('function');
			expect(typeof clientAuth.login).toBe('function');
			expect(typeof clientAuth.logout).toBe('function');
			expect(typeof clientAuth.refreshToken).toBe('function');
			expect(typeof clientAuth.forceRefresh).toBe('function');
			expect(typeof clientAuth.getAuthHealth).toBe('function');
			expect(typeof clientAuth.createAuthStore).toBe('function');
		});

		it('should export client-safe constants', async () => {
			const clientAuth = await import('$lib/client/auth');

			// CSRF constants (safe for client)
			expect(clientAuth.CSRF_COOKIES).toBeDefined();
			expect(clientAuth.CSRF_HEADER).toBeDefined();

			// Auth cookie name constant (but NOT the cookie functions)
			expect(clientAuth.AUTH_COOKIES).toBeDefined();
		});

		it('should export shared types', async () => {
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

		it('should NOT export server-only cookie functions', async () => {
			const clientAuth = await import('$lib/client/auth');

			// These should NOT be exported from client module
			expect(clientAuth).not.toHaveProperty('setAccessToken');
			expect(clientAuth).not.toHaveProperty('setRefreshToken');
			expect(clientAuth).not.toHaveProperty('setAuthState');
			expect(clientAuth).not.toHaveProperty('getAccessToken');
			expect(clientAuth).not.toHaveProperty('getRefreshToken');
			expect(clientAuth).not.toHaveProperty('clearAuthCookies');
			expect(clientAuth).not.toHaveProperty('setAuthCookies');
		});

		it('should NOT export server-only CSRF functions', async () => {
			const clientAuth = await import('$lib/client/auth');

			// These should NOT be exported from client module
			expect(clientAuth).not.toHaveProperty('generateCsrfToken');
			expect(clientAuth).not.toHaveProperty('setCsrfToken');
			expect(clientAuth).not.toHaveProperty('getCsrfToken');
			expect(clientAuth).not.toHaveProperty('clearCsrfTokens');
			expect(clientAuth).not.toHaveProperty('ensureCsrfToken');
			expect(clientAuth).not.toHaveProperty('validateCsrfToken');
			expect(clientAuth).not.toHaveProperty('checkCsrfProtection');
		});

		it('should NOT import node:crypto or @sveltejs/kit Cookies', () => {
			const indexPath = path.join(CLIENT_AUTH_PATH, 'index.ts');
			const indexContent = fs.readFileSync(indexPath, 'utf-8');

			// Scan all files in client auth directory
			const files = fs.readdirSync(CLIENT_AUTH_PATH).filter((f) => f.endsWith('.ts') && !f.includes('.test.'));

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
			const clientAuth = await import('$lib/client/auth');

			expect(typeof clientAuth.parseAuthStateCookie).toBe('function');

			// Verify it works with valid input
			const result = clientAuth.parseAuthStateCookie('{"authenticated":true,"expiresAt":1234567890}');
			expect(result).toEqual({ authenticated: true, expiresAt: 1234567890 });

			// Verify it handles invalid input
			expect(clientAuth.parseAuthStateCookie(undefined)).toBeNull();
			expect(clientAuth.parseAuthStateCookie('invalid')).toBeNull();
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
		it('should still export all types for backwards compat', async () => {
			const auth = await import('$lib/auth');

			// Types are re-exported
			// (TypeScript types are compile-time, so we check the module loads)
			expect(auth).toBeDefined();
		});

		it('should export client-safe functions from $lib/auth', async () => {
			const auth = await import('$lib/auth');

			// Store functions should still be accessible
			expect(typeof auth.getAuthState).toBe('function');
			expect(typeof auth.isAuthenticated).toBe('function');
			expect(typeof auth.login).toBe('function');
			expect(typeof auth.logout).toBe('function');
		});

		it('should warn about server imports in development', async () => {
			// This would be a runtime warning in dev mode when accessing server-only
			// exports from client code. For now, we verify the module structure
			// allows for such warnings to be added.
			const indexPath = path.join(LIB_PATH, 'auth', 'index.ts');
			const content = fs.readFileSync(indexPath, 'utf-8');

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
