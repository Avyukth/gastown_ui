/**
 * Client Auth Module
 *
 * This module contains ONLY client-safe authentication code.
 * NO server-only imports (node:crypto, @sveltejs/kit Cookies).
 *
 * For server-side auth operations, use $lib/server/auth instead.
 */

// Types (safe for both client and server)
export type {
	User,
	AuthState,
	LoginCredentials,
	SessionData,
	AuthResponse
} from './types';

// Constants (safe for both client and server)
export {
	AUTH_COOKIES,
	CSRF_COOKIES,
	CSRF_HEADER,
	parseAuthStateCookie
} from './constants';

// Auth store (client-side only - uses browser APIs)
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
