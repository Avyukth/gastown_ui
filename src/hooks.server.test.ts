/**
 * Server Hooks Unit Tests
 *
 * Tests for security headers (CSP, HSTS, etc.) and request handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Handle, RequestEvent, Cookies } from '@sveltejs/kit';

// Mock auth and CSRF modules before importing handle
vi.mock('$lib/auth/cookies', () => ({
	getAccessToken: vi.fn(() => null),
	getRefreshToken: vi.fn(() => null)
}));

vi.mock('$lib/auth/csrf.server', () => ({
	ensureCsrfToken: vi.fn(),
	checkCsrfProtection: vi.fn(() => ({ valid: true })),
	CSRF_HEADER: 'x-csrf-token'
}));

// Import after mocks are set up
import { handle } from './hooks.server';

/**
 * Create a mock RequestEvent for testing
 */
function createMockEvent(overrides: Partial<RequestEvent> = {}): RequestEvent {
	const mockCookies = {
		get: vi.fn(() => null),
		getAll: vi.fn(() => []),
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn(() => '')
	} as unknown as Cookies;

	const mockUrl = new URL('http://localhost:5173/');

	return {
		cookies: mockCookies,
		fetch: vi.fn(),
		getClientAddress: vi.fn(() => '127.0.0.1'),
		locals: {} as App.Locals,
		params: {},
		platform: undefined,
		request: new Request(mockUrl, { method: 'GET' }),
		route: { id: '/' },
		setHeaders: vi.fn(),
		url: mockUrl,
		isDataRequest: false,
		isSubRequest: false,
		...overrides
	} as unknown as RequestEvent;
}

/**
 * Create a mock resolve function that returns a basic Response
 */
function createMockResolve(): (event: RequestEvent) => Promise<Response> {
	return async () => new Response('OK', { status: 200 });
}

describe('Security Headers', () => {
	const originalEnv = import.meta.env;

	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Content-Security-Policy', () => {
		it('sets CSP header on all responses', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.headers.has('Content-Security-Policy')).toBe(true);
		});

		it('includes default-src self directive', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });
			const csp = response.headers.get('Content-Security-Policy');

			expect(csp).toContain("default-src 'self'");
		});

		it('includes script-src directive', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });
			const csp = response.headers.get('Content-Security-Policy');

			expect(csp).toContain("script-src 'self'");
		});

		it('includes style-src directive with fonts', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });
			const csp = response.headers.get('Content-Security-Policy');

			expect(csp).toContain('style-src');
			expect(csp).toContain('https://fonts.googleapis.com');
		});

		it('includes font-src directive', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });
			const csp = response.headers.get('Content-Security-Policy');

			expect(csp).toContain('font-src');
			expect(csp).toContain('https://fonts.gstatic.com');
		});

		it('includes img-src directive', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });
			const csp = response.headers.get('Content-Security-Policy');

			expect(csp).toContain('img-src');
			expect(csp).toContain('data:');
			expect(csp).toContain('blob:');
		});

		it('includes connect-src directive', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });
			const csp = response.headers.get('Content-Security-Policy');

			expect(csp).toContain('connect-src');
		});

		it('blocks framing with frame-ancestors none', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });
			const csp = response.headers.get('Content-Security-Policy');

			expect(csp).toContain("frame-ancestors 'none'");
		});

		it('restricts base-uri to self', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });
			const csp = response.headers.get('Content-Security-Policy');

			expect(csp).toContain("base-uri 'self'");
		});

		it('restricts form-action to self', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });
			const csp = response.headers.get('Content-Security-Policy');

			expect(csp).toContain("form-action 'self'");
		});
	});

	describe('X-Content-Type-Options', () => {
		it('sets nosniff header', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
		});
	});

	describe('X-Frame-Options', () => {
		it('sets DENY header', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.headers.get('X-Frame-Options')).toBe('DENY');
		});
	});

	describe('Referrer-Policy', () => {
		it('sets strict-origin-when-cross-origin policy', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
		});
	});

	describe('X-XSS-Protection', () => {
		it('sets XSS protection header', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
		});
	});

	describe('Permissions-Policy', () => {
		it('restricts dangerous permissions', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			const permissionsPolicy = response.headers.get('Permissions-Policy');
			expect(permissionsPolicy).toContain('camera=()');
			expect(permissionsPolicy).toContain('microphone=()');
			expect(permissionsPolicy).toContain('geolocation=()');
		});
	});

	describe('All Security Headers Combined', () => {
		it('sets all required security headers', async () => {
			const event = createMockEvent();
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			// Verify all acceptance criteria headers are present
			expect(response.headers.has('Content-Security-Policy')).toBe(true);
			expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
			expect(response.headers.get('X-Frame-Options')).toBe('DENY');
			expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
		});

		it('applies headers to all routes', async () => {
			const routes = ['/', '/agents', '/api/health', '/convoys/123'];

			for (const route of routes) {
				const event = createMockEvent({
					url: new URL(`http://localhost:5173${route}`)
				});
				const resolve = createMockResolve();

				const response = await handle({ event, resolve });

				expect(response.headers.has('Content-Security-Policy')).toBe(true);
				expect(response.headers.has('X-Content-Type-Options')).toBe(true);
				expect(response.headers.has('X-Frame-Options')).toBe(true);
				expect(response.headers.has('Referrer-Policy')).toBe(true);
			}
		});
	});
});

describe('Session Extraction', () => {
	it('sets session in locals', async () => {
		const event = createMockEvent();
		const resolve = createMockResolve();

		await handle({ event, resolve });

		expect(event.locals.session).toBeDefined();
	});

	it('sets null user when no token present', async () => {
		const event = createMockEvent();
		const resolve = createMockResolve();

		await handle({ event, resolve });

		expect(event.locals.session.user).toBeNull();
	});
});
