/**
 * Authentication Module (Backwards Compatibility)
 *
 * This module provides backwards compatibility for existing imports.
 *
 * RECOMMENDED: Use the new split modules:
 * - Client code: import from '$lib/client/auth'
 * - Server code: import from '$lib/server/auth'
 *
 * This module re-exports client-safe code from $lib/client/auth.
 * For server-side cookie/CSRF functions, import from $lib/server/auth.
 */

// Re-export everything from the client module for backwards compatibility
export {
	// Types
	type User,
	type AuthState,
	type LoginCredentials,
	type SessionData,
	type AuthResponse,

	// Constants
	AUTH_COOKIES,
	CSRF_COOKIES,
	CSRF_HEADER,
	parseAuthStateCookie,

	// Store functions
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
} from '$lib/client/auth';

// NOTE: Server-only functions are NOT exported here to prevent bundle leakage.
// For server-side auth operations, import from '$lib/server/auth':
//
// import {
//   setAccessToken,
//   setRefreshToken,
//   setAuthState,
//   getAccessToken,
//   getRefreshToken,
//   clearAuthCookies,
//   setAuthCookies,
//   generateCsrfToken,
//   setCsrfToken,
//   getCsrfToken,
//   clearCsrfTokens,
//   ensureCsrfToken,
//   validateCsrfToken,
//   checkCsrfProtection
// } from '$lib/server/auth';
