/**
 * Integration Tests: /api/gastown Auth Guard
 *
 * Tests that all /api/gastown/* routes require authentication.
 * TDD RED phase: tests for route guard behavior.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Cookies } from '@sveltejs/kit';
import { createAccessToken, type UserPayload } from '$lib/server/auth';
import { load } from '../+layout.server';

// =============================================================================
// Test Fixtures
// =============================================================================

const TEST_USER: UserPayload = {
	id: 'test-user-123',
	email: 'test@example.com',
	name: 'Test User',
	roles: ['user']
};

function createMockCookies(tokens: { access?: string; refresh?: string }): Cookies {
	const cookieStore = new Map<string, string>();
	if (tokens.access) cookieStore.set('gastown_access', tokens.access);
	if (tokens.refresh) cookieStore.set('gastown_refresh', tokens.refresh);

	return {
		get: (name: string) => cookieStore.get(name) ?? null,
		getAll: () => Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value })),
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn()
	} as unknown as Cookies;
}

function createMockEvent(cookies: Cookies): Parameters<typeof load>[0] {
	return {
		cookies,
		locals: {},
		params: {},
		url: new URL('http://localhost/api/gastown/status'),
		request: new Request('http://localhost/api/gastown/status'),
		fetch: vi.fn(),
		getClientAddress: () => '127.0.0.1',
		platform: undefined,
		route: { id: '/api/gastown' },
		setHeaders: vi.fn(),
		isDataRequest: false,
		isSubRequest: false,
		depends: vi.fn(),
		untrack: vi.fn(),
		parent: vi.fn().mockResolvedValue({})
	} as unknown as Parameters<typeof load>[0];
}

// =============================================================================
// Auth Guard Tests
// =============================================================================

describe('API Auth Guard (/api/gastown/+layout.server.ts)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Authentication Required', () => {
		it('allows access with valid token', async () => {
			const accessToken = await createAccessToken(TEST_USER);
			const cookies = createMockCookies({ access: accessToken });
			const event = createMockEvent(cookies);

			const result = await load(event);

			expect(result).toBeDefined();
			expect(result.user).toBeDefined();
			expect(result.user.id).toBe(TEST_USER.id);
			expect(result.user.email).toBe(TEST_USER.email);
		});

		it('rejects request without token (401)', async () => {
			const cookies = createMockCookies({});
			const event = createMockEvent(cookies);

			await expect(load(event)).rejects.toMatchObject({
				status: 401,
				body: { message: expect.stringContaining('Authentication required') }
			});
		});

		it('rejects request with invalid token (401)', async () => {
			const cookies = createMockCookies({ access: 'invalid-token' });
			const event = createMockEvent(cookies);

			await expect(load(event)).rejects.toMatchObject({
				status: 401,
				body: { message: expect.stringContaining('Invalid') }
			});
		});

		it('rejects request with expired token (401)', async () => {
			const expiredToken = await createExpiredToken(TEST_USER);
			const cookies = createMockCookies({ access: expiredToken });
			const event = createMockEvent(cookies);

			await expect(load(event)).rejects.toMatchObject({
				status: 401,
				body: { message: expect.stringContaining('expired') }
			});
		});
	});

	describe('User Data in Response', () => {
		it('includes user id in load result', async () => {
			const accessToken = await createAccessToken(TEST_USER);
			const cookies = createMockCookies({ access: accessToken });
			const event = createMockEvent(cookies);

			const result = await load(event);

			expect(result.user.id).toBe(TEST_USER.id);
		});

		it('includes user email in load result', async () => {
			const accessToken = await createAccessToken(TEST_USER);
			const cookies = createMockCookies({ access: accessToken });
			const event = createMockEvent(cookies);

			const result = await load(event);

			expect(result.user.email).toBe(TEST_USER.email);
		});

		it('includes user roles in load result', async () => {
			const accessToken = await createAccessToken(TEST_USER);
			const cookies = createMockCookies({ access: accessToken });
			const event = createMockEvent(cookies);

			const result = await load(event);

			expect(result.user.roles).toEqual(TEST_USER.roles);
		});
	});
});

// =============================================================================
// Helper Functions
// =============================================================================

async function createExpiredToken(user: UserPayload): Promise<string> {
	const { SignJWT } = await import('jose');
	const secret = new TextEncoder().encode(
		process.env.AUTH_SECRET || 'gastown-dev-secret-do-not-use-in-production'
	);
	const now = Math.floor(Date.now() / 1000);

	return new SignJWT({
		email: user.email,
		name: user.name,
		roles: user.roles || ['user'],
		type: 'access'
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setSubject(user.id)
		.setIssuer('gastown-ui')
		.setAudience('gastown')
		.setIssuedAt(now - 3600)
		.setExpirationTime(now - 1800)
		.sign(secret);
}
