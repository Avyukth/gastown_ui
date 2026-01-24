/**
 * Server-side Authentication Module
 *
 * Provides JWT-based authentication with proper signing.
 * Supports demo mode and production mode with CLI verification.
 *
 * This module contains ALL server-only auth code:
 * - JWT token creation/verification
 * - Cookie management (requires @sveltejs/kit Cookies)
 * - CSRF protection (requires node:crypto)
 *
 * For client-safe auth code, use $lib/client/auth instead.
 */

// JWT utilities
export {
	createAccessToken,
	createRefreshToken,
	verifyToken,
	extractUserFromPayload,
	authenticateUser,
	refreshTokens,
	ACCESS_TOKEN_EXPIRY_SECONDS,
	REFRESH_TOKEN_EXPIRY_SECONDS,
	type UserPayload,
	type TokenType
} from './jwt';

// Auth verification
export {
	verifyAuth,
	requireAuth,
	AuthError,
	type AuthResult,
	type AuthErrorCode
} from './verify';

// Cookie utilities (server-only - requires @sveltejs/kit Cookies)
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

// CSRF protection (server-only - requires node:crypto)
export {
	CSRF_COOKIES,
	CSRF_HEADER,
	generateCsrfToken,
	setCsrfToken,
	getCsrfToken,
	clearCsrfTokens,
	ensureCsrfToken,
	requiresCsrfValidation,
	isCsrfExempt,
	validateCsrfToken,
	checkCsrfProtection,
	type CsrfValidationResult
} from './csrf';

// Re-export types from client module for convenience
export type {
	User,
	AuthState,
	LoginCredentials,
	SessionData,
	AuthResponse
} from '$lib/client/auth/types';
