/**
 * Server Hooks
 *
 * Handles server-side request processing:
 * - Session extraction from HttpOnly cookies
 * - Security headers (CSP, HSTS, etc.)
 * - Request authentication
 * - CSRF token generation and validation
 */

import { json, type Handle } from '@sveltejs/kit';
import { getAccessToken, getRefreshToken } from '$lib/auth/cookies';
import { ensureCsrfToken, checkCsrfProtection, CSRF_HEADER } from '$lib/auth/csrf.server';
import type { SessionData } from '$lib/auth/types';

// Extend App.Locals with session data
declare global {
	namespace App {
		interface Locals {
			session: SessionData;
		}
	}
}

/**
 * Content Security Policy directives
 */
const CSP_DIRECTIVES = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'", // unsafe-inline needed for Svelte
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: https:",
	"font-src 'self'",
	"connect-src 'self' wss:",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'"
];

/**
 * Security headers applied to all responses
 */
const SECURITY_HEADERS: Record<string, string> = {
	'Content-Security-Policy': CSP_DIRECTIVES.join('; '),
	'X-Frame-Options': 'DENY',
	'X-Content-Type-Options': 'nosniff',
	'X-XSS-Protection': '1; mode=block',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

/**
 * HSTS header (production only)
 */
const HSTS_HEADER = 'max-age=31536000; includeSubDomains; preload';

/**
 * Decode JWT payload without verification
 * Note: Actual verification should happen with your auth backend
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;

		const payload = parts[1];
		const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
		return JSON.parse(decoded);
	} catch {
		return null;
	}
}

/**
 * Extract session from cookies
 */
function extractSession(cookies: import('@sveltejs/kit').Cookies): SessionData {
	const accessToken = getAccessToken(cookies);
	const refreshToken = getRefreshToken(cookies);

	if (!accessToken) {
		return {
			user: null,
			accessToken: null,
			refreshToken: null,
			expiresAt: null
		};
	}

	// Decode token to get user info
	const payload = decodeJwtPayload(accessToken);

	if (!payload) {
		return {
			user: null,
			accessToken: null,
			refreshToken: null,
			expiresAt: null
		};
	}

	return {
		user: {
			id: String(payload.sub ?? ''),
			email: String(payload.email ?? ''),
			name: payload.name as string | undefined,
			roles: payload.roles as string[] | undefined
		},
		accessToken,
		refreshToken,
		expiresAt: payload.exp ? Number(payload.exp) * 1000 : null
	};
}

/**
 * Main request handler
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Extract session from cookies
	event.locals.session = extractSession(event.cookies);

	// Ensure CSRF token exists for all requests
	ensureCsrfToken(event.cookies);

	// Validate CSRF token for state-changing requests to API routes
	if (event.url.pathname.startsWith('/api/')) {
		const csrfResult = checkCsrfProtection(
			event.request.method,
			event.url.pathname,
			event.cookies,
			event.request.headers.get(CSRF_HEADER)
		);

		if (!csrfResult.valid) {
			return json(
				{ error: csrfResult.error ?? 'CSRF validation failed' },
				{ status: 403 }
			);
		}
	}

	// Resolve the request
	const response = await resolve(event);

	// Add security headers
	for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(header, value);
	}

	// Apply HSTS only in production
	if (import.meta.env.PROD) {
		response.headers.set('Strict-Transport-Security', HSTS_HEADER);
	}

	return response;
};
