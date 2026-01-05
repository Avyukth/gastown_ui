/**
 * Secure Authentication Module
 *
 * Provides secure authentication with:
 * - HttpOnly cookies for token storage
 * - Secure flag in production
 * - SameSite=strict for CSRF protection
 * - Automatic token refresh before expiration
 * - Complete logout clearing all tokens
 */

// Types
export type {
	User,
	AuthState,
	LoginCredentials,
	SessionData,
	AuthResponse
} from './types';

// Cookie utilities (server-side)
export {
	AUTH_COOKIES,
	setAccessToken,
	setRefreshToken,
	setAuthState,
	getAccessToken,
	getRefreshToken,
	clearAuthCookies,
	setAuthCookies,
	parseAuthStateCookie
} from './cookies';

// Auth store (client-side)
export {
	getAuthState,
	isAuthenticated,
	getUser,
	initializeAuth,
	login,
	logout,
	refreshToken,
	createAuthStore
} from './store.svelte';

// CSRF constants (safe for client-side import)
export { CSRF_COOKIES, CSRF_HEADER } from './csrf.constants';

// Note: Server-only CSRF functions (generateCsrfToken, validateCsrfToken, etc.)
// should be imported directly from '$lib/auth/csrf.server' in server-side code
