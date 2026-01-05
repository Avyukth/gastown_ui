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
	forceRefresh,
	getAuthHealth,
	createAuthStore
} from './store.svelte';
