/**
 * CSRF Protection Module (Server-Only)
 *
 * Implements Double Submit Cookie pattern with defense-in-depth:
 * - CSRF token stored in HttpOnly cookie (server-side)
 * - Token value also available via non-HttpOnly cookie for JS access
 * - Client sends token in X-CSRF-Token header
 * - Server validates header matches cookie value
 *
 * Combined with SameSite=strict cookies, provides robust CSRF protection.
 *
 * IMPORTANT: This module uses Node crypto and must only be imported on the server.
 * Client code should import from './csrf.constants' instead.
 */

import type { Cookies } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import { CSRF_COOKIES, CSRF_HEADER } from './csrf.constants';

// Re-export constants for server-side code
export { CSRF_COOKIES, CSRF_HEADER };

/** CSRF token length in bytes (32 bytes = 256 bits) */
const TOKEN_LENGTH = 32;

/** CSRF token expiry: 24 hours */
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60;

/** HTTP methods that require CSRF validation */
const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

/** Paths exempt from CSRF validation (login, logout, refresh) */
const CSRF_EXEMPT_PATHS = [
	'/api/auth/login',
	'/api/auth/logout',
	'/api/auth/refresh'
];

/** Check if we're in production */
function isProduction(): boolean {
	return import.meta.env.PROD;
}

/**
 * Generate a cryptographically secure CSRF token (server-only)
 */
export function generateCsrfToken(): string {
	const bytes = randomBytes(TOKEN_LENGTH);
	return bytes.toString('hex');
}

/**
 * Get secure cookie options for CSRF token
 */
function getCsrfCookieOptions(httpOnly: boolean): {
	path: string;
	httpOnly: boolean;
	secure: boolean;
	sameSite: 'strict';
	maxAge: number;
} {
	return {
		path: '/',
		httpOnly,
		secure: isProduction(),
		sameSite: 'strict',
		maxAge: CSRF_TOKEN_EXPIRY
	};
}

/**
 * Set CSRF token cookies
 * Sets both HttpOnly (for server validation) and non-HttpOnly (for client access)
 */
export function setCsrfToken(cookies: Cookies, token: string): void {
	// HttpOnly cookie for server-side validation
	cookies.set(CSRF_COOKIES.CSRF_TOKEN, token, getCsrfCookieOptions(true));

	// Non-HttpOnly cookie for client-side access
	cookies.set(CSRF_COOKIES.CSRF_TOKEN_CLIENT, token, getCsrfCookieOptions(false));
}

/**
 * Get CSRF token from HttpOnly cookie (server-side)
 */
export function getCsrfToken(cookies: Cookies): string | null {
	return cookies.get(CSRF_COOKIES.CSRF_TOKEN) ?? null;
}

/**
 * Clear CSRF tokens (e.g., on logout)
 */
export function clearCsrfTokens(cookies: Cookies): void {
	const clearOptions = {
		path: '/',
		httpOnly: true,
		secure: isProduction(),
		sameSite: 'strict' as const
	};

	cookies.delete(CSRF_COOKIES.CSRF_TOKEN, clearOptions);
	cookies.delete(CSRF_COOKIES.CSRF_TOKEN_CLIENT, { ...clearOptions, httpOnly: false });
}

/**
 * Ensure CSRF token exists, generate if missing
 * Call this in hooks.server.ts to ensure every session has a token
 */
export function ensureCsrfToken(cookies: Cookies): string {
	let token = getCsrfToken(cookies);

	if (!token) {
		token = generateCsrfToken();
		setCsrfToken(cookies, token);
	}

	return token;
}

/**
 * Check if a request method requires CSRF validation
 */
export function requiresCsrfValidation(method: string): boolean {
	return CSRF_PROTECTED_METHODS.includes(method.toUpperCase());
}

/**
 * Check if a path is exempt from CSRF validation
 */
export function isCsrfExempt(pathname: string): boolean {
	return CSRF_EXEMPT_PATHS.some(path => pathname.startsWith(path));
}

/**
 * Validate CSRF token from request header against cookie
 *
 * @returns Object with validation result and optional error message
 */
export function validateCsrfToken(
	cookies: Cookies,
	headerToken: string | null
): { valid: boolean; error?: string } {
	const cookieToken = getCsrfToken(cookies);

	// No cookie token means session is not properly initialized
	if (!cookieToken) {
		return { valid: false, error: 'CSRF token cookie missing' };
	}

	// No header token provided
	if (!headerToken) {
		return { valid: false, error: 'CSRF token header missing' };
	}

	// Tokens must match exactly
	// Using timing-safe comparison to prevent timing attacks
	if (!timingSafeEqual(cookieToken, headerToken)) {
		return { valid: false, error: 'CSRF token mismatch' };
	}

	return { valid: true };
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) {
		return false;
	}

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}

/**
 * CSRF validation result type
 */
export interface CsrfValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Full CSRF check for a request event
 * Combines all checks: method, path exemption, token validation
 */
export function checkCsrfProtection(
	method: string,
	pathname: string,
	cookies: Cookies,
	headerToken: string | null
): CsrfValidationResult {
	// Skip validation for safe methods
	if (!requiresCsrfValidation(method)) {
		return { valid: true };
	}

	// Skip validation for exempt paths
	if (isCsrfExempt(pathname)) {
		return { valid: true };
	}

	// Validate token
	return validateCsrfToken(cookies, headerToken);
}
