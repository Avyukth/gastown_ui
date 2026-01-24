/**
 * Secure Cookie Utilities (Server-Only)
 *
 * Implements HttpOnly cookies with Secure flag and SameSite=Strict
 * for secure token storage. Tokens are never exposed to JavaScript.
 *
 * This module requires @sveltejs/kit Cookies and should only be
 * imported in server-side code (+server.ts, hooks.server.ts, etc.)
 */

import type { Cookies } from '@sveltejs/kit';

/** Cookie names for auth tokens */
export const AUTH_COOKIES = {
	ACCESS_TOKEN: 'auth_access',
	REFRESH_TOKEN: 'auth_refresh',
	/** Non-HttpOnly cookie for client-side auth state detection */
	AUTH_STATE: 'auth_state'
} as const;

/** SvelteKit-compatible cookie options with required path */
type SecureCookieOptions = {
	path: string;
	httpOnly: boolean;
	secure: boolean;
	sameSite: 'strict' | 'lax' | 'none';
	maxAge?: number;
};

/** Check if we're in production */
function isProduction(): boolean {
	return import.meta.env.PROD;
}

/**
 * Get secure cookie options
 * - HttpOnly: Prevents XSS attacks from reading tokens
 * - Secure: Only sent over HTTPS (relaxed in dev)
 * - SameSite=strict: Prevents CSRF attacks
 */
function getSecureCookieOptions(httpOnly: boolean, maxAge?: number): SecureCookieOptions {
	return {
		path: '/',
		httpOnly,
		secure: isProduction(),
		sameSite: 'strict',
		maxAge
	};
}

/**
 * Set the access token cookie
 * Uses HttpOnly + Secure + SameSite=strict
 */
export function setAccessToken(cookies: Cookies, token: string, expiresIn: number): void {
	cookies.set(AUTH_COOKIES.ACCESS_TOKEN, token, getSecureCookieOptions(true, expiresIn));
}

/**
 * Set the refresh token cookie
 * Uses HttpOnly + Secure + SameSite=strict
 * Longer expiration than access token
 */
export function setRefreshToken(cookies: Cookies, token: string, expiresIn: number): void {
	cookies.set(AUTH_COOKIES.REFRESH_TOKEN, token, getSecureCookieOptions(true, expiresIn));
}

/**
 * Set auth state cookie for client-side detection
 * NOT HttpOnly so JavaScript can check auth status
 * Contains NO sensitive data - just a flag
 */
export function setAuthState(cookies: Cookies, isAuthenticated: boolean, expiresAt: number): void {
	const value = JSON.stringify({ authenticated: isAuthenticated, expiresAt });
	const maxAge = 60 * 60 * 24 * 7; // 7 days
	cookies.set(AUTH_COOKIES.AUTH_STATE, value, getSecureCookieOptions(false, maxAge));
}

/**
 * Get access token from cookies (server-side only)
 */
export function getAccessToken(cookies: Cookies): string | null {
	return cookies.get(AUTH_COOKIES.ACCESS_TOKEN) ?? null;
}

/**
 * Get refresh token from cookies (server-side only)
 */
export function getRefreshToken(cookies: Cookies): string | null {
	return cookies.get(AUTH_COOKIES.REFRESH_TOKEN) ?? null;
}

/**
 * Clear all auth cookies on logout
 * Must clear ALL token cookies to ensure complete logout
 */
export function clearAuthCookies(cookies: Cookies): void {
	const clearOptions: SecureCookieOptions = {
		path: '/',
		httpOnly: true,
		secure: isProduction(),
		sameSite: 'strict'
	};

	// Clear access token
	cookies.delete(AUTH_COOKIES.ACCESS_TOKEN, clearOptions);

	// Clear refresh token
	cookies.delete(AUTH_COOKIES.REFRESH_TOKEN, clearOptions);

	// Clear auth state (not httpOnly)
	cookies.delete(AUTH_COOKIES.AUTH_STATE, { ...clearOptions, httpOnly: false });
}

/**
 * Set all auth cookies after successful login
 */
export function setAuthCookies(
	cookies: Cookies,
	accessToken: string,
	refreshToken: string,
	accessExpiresIn: number,
	refreshExpiresIn: number
): void {
	const expiresAt = Date.now() + (accessExpiresIn * 1000);

	setAccessToken(cookies, accessToken, accessExpiresIn);
	setRefreshToken(cookies, refreshToken, refreshExpiresIn);
	setAuthState(cookies, true, expiresAt);
}

/**
 * Parse auth state cookie on client
 */
export function parseAuthStateCookie(cookieValue: string | undefined): { authenticated: boolean; expiresAt: number } | null {
	if (!cookieValue) return null;

	try {
		return JSON.parse(cookieValue);
	} catch {
		return null;
	}
}
