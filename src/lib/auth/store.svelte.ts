/**
 * Authentication Store
 *
 * Client-side reactive auth state using Svelte 5 runes.
 * Works with HttpOnly cookies - tokens are NOT accessible in JS.
 * Uses auth_state cookie to track authentication status.
 */

import { browser } from '$app/environment';
import type { AuthState, User, LoginCredentials, AuthResponse } from './types';
import { AUTH_COOKIES, parseAuthStateCookie } from './cookies';

/** Default auth state */
const DEFAULT_STATE: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: true,
	error: null
};

/** Auth store state */
let state = $state<AuthState>({ ...DEFAULT_STATE });

/** Token refresh timer */
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/** Visibility listener cleanup */
let visibilityCleanup: (() => void) | null = null;

/** Refresh margin - refresh token 60 seconds before expiry */
const REFRESH_MARGIN_MS = 60 * 1000;

/** Maximum retry attempts for refresh */
const MAX_REFRESH_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_RETRY_DELAY_MS = 1000;

/** Current retry count */
let refreshRetryCount = 0;

/** Indicates if a refresh is currently in progress */
let isRefreshing = false;

/** Last known expiry time for visibility-based refresh */
let lastKnownExpiresAt: number | null = null;

/**
 * Get current auth state (reactive)
 */
export function getAuthState(): AuthState {
	return state;
}

/**
 * Check if user is authenticated (reactive)
 */
export function isAuthenticated(): boolean {
	return state.isAuthenticated;
}

/**
 * Get current user (reactive)
 */
export function getUser(): User | null {
	return state.user;
}

/**
 * Initialize auth state from cookies
 * Called on app startup to restore session
 */
export async function initializeAuth(): Promise<void> {
	if (!browser) return;

	state.isLoading = true;
	state.error = null;

	try {
		// Check auth_state cookie for authentication status
		const authStateCookie = getCookie(AUTH_COOKIES.AUTH_STATE);
		const authState = parseAuthStateCookie(authStateCookie);

		if (authState?.authenticated && authState.expiresAt > Date.now()) {
			// Session appears valid, verify with server
			const response = await fetch('/api/auth/me', {
				credentials: 'include' // Include HttpOnly cookies
			});

			if (response.ok) {
				const data: AuthResponse = await response.json();
				if (data.success && data.user) {
					setAuthenticated(data.user, data.expiresAt);
					return;
				}
			}
		}

		// No valid session
		setUnauthenticated();
	} catch (error) {
		console.error('Auth initialization failed:', error);
		setUnauthenticated();
	}
}

/**
 * Login with credentials
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
	state.isLoading = true;
	state.error = null;

	try {
		const response = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(credentials)
		});

		const data: AuthResponse = await response.json();

		if (data.success && data.user) {
			setAuthenticated(data.user, data.expiresAt);
			return data;
		}

		state.error = data.error ?? 'Login failed';
		state.isLoading = false;
		return data;
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Login failed';
		state.error = message;
		state.isLoading = false;
		return { success: false, error: message };
	}
}

/**
 * Logout - clears all tokens
 */
export async function logout(): Promise<void> {
	try {
		await fetch('/api/auth/logout', {
			method: 'POST',
			credentials: 'include'
		});
	} catch {
		// Continue with local logout even if server fails
	}

	// Clear local state
	setUnauthenticated();

	// Clear any cached data
	if (browser && 'caches' in window) {
		try {
			// Clear auth-related cache entries
			const cacheNames = await caches.keys();
			for (const name of cacheNames) {
				if (name.includes('auth') || name.includes('user')) {
					await caches.delete(name);
				}
			}
		} catch {
			// Cache clearing is best-effort
		}
	}
}

/**
 * Refresh access token before expiration
 * Includes retry logic with exponential backoff
 */
export async function refreshToken(): Promise<boolean> {
	// Prevent concurrent refresh attempts
	if (isRefreshing) {
		return false;
	}

	isRefreshing = true;

	try {
		const response = await fetch('/api/auth/refresh', {
			method: 'POST',
			credentials: 'include'
		});

		if (response.ok) {
			const data: AuthResponse = await response.json();
			if (data.success && data.expiresAt) {
				// Success - reset retry count and schedule next refresh
				refreshRetryCount = 0;
				lastKnownExpiresAt = data.expiresAt;
				scheduleTokenRefresh(data.expiresAt);
				isRefreshing = false;
				return true;
			}
		}

		// Handle different failure scenarios
		const is401 = response.status === 401;
		const is5xx = response.status >= 500;

		if (is5xx && refreshRetryCount < MAX_REFRESH_RETRIES) {
			// Server error - retry with backoff
			refreshRetryCount++;
			const delay = BASE_RETRY_DELAY_MS * Math.pow(2, refreshRetryCount - 1);
			console.warn(`Token refresh failed (attempt ${refreshRetryCount}/${MAX_REFRESH_RETRIES}), retrying in ${delay}ms`);

			isRefreshing = false;
			setTimeout(() => refreshToken(), delay);
			return false;
		}

		if (is401) {
			// Unauthorized - refresh token is invalid/expired
			console.warn('Refresh token invalid or expired, redirecting to login');
			await handleAuthFailure('Session expired. Please log in again.');
			isRefreshing = false;
			return false;
		}

		// Other failures - exhaust retries then fail
		if (refreshRetryCount < MAX_REFRESH_RETRIES) {
			refreshRetryCount++;
			const delay = BASE_RETRY_DELAY_MS * Math.pow(2, refreshRetryCount - 1);
			console.warn(`Token refresh failed (attempt ${refreshRetryCount}/${MAX_REFRESH_RETRIES}), retrying in ${delay}ms`);

			isRefreshing = false;
			setTimeout(() => refreshToken(), delay);
			return false;
		}

		// All retries exhausted
		console.error('Token refresh failed after all retries');
		await handleAuthFailure('Unable to refresh session. Please log in again.');
		isRefreshing = false;
		return false;
	} catch (error) {
		// Network error - retry with backoff
		if (refreshRetryCount < MAX_REFRESH_RETRIES) {
			refreshRetryCount++;
			const delay = BASE_RETRY_DELAY_MS * Math.pow(2, refreshRetryCount - 1);
			console.warn(`Token refresh network error (attempt ${refreshRetryCount}/${MAX_REFRESH_RETRIES}), retrying in ${delay}ms:`, error);

			isRefreshing = false;
			setTimeout(() => refreshToken(), delay);
			return false;
		}

		// All retries exhausted
		console.error('Token refresh failed after all retries due to network error');
		await handleAuthFailure('Network error. Please check your connection and try again.');
		isRefreshing = false;
		return false;
	}
}

/**
 * Handle authentication failure - logout and redirect to login
 */
async function handleAuthFailure(errorMessage: string): Promise<void> {
	state.error = errorMessage;

	// Clear local auth state
	await logout();

	// Redirect to login page
	if (browser) {
		const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
		window.location.href = `/login?returnUrl=${returnUrl}&error=${encodeURIComponent(errorMessage)}`;
	}
}

/**
 * Set authenticated state
 */
function setAuthenticated(user: User, expiresAt?: number): void {
	state.user = user;
	state.isAuthenticated = true;
	state.isLoading = false;
	state.error = null;

	if (expiresAt) {
		lastKnownExpiresAt = expiresAt;
		scheduleTokenRefresh(expiresAt);
	}

	// Set up visibility listener for tab focus refresh
	setupVisibilityListener();
}

/**
 * Set unauthenticated state
 */
function setUnauthenticated(): void {
	state.user = null;
	state.isAuthenticated = false;
	state.isLoading = false;
	state.error = null;

	clearRefreshTimer();
	cleanupVisibilityListener();
	lastKnownExpiresAt = null;
	refreshRetryCount = 0;
}

/**
 * Schedule token refresh before expiration
 */
function scheduleTokenRefresh(expiresAt: number): void {
	clearRefreshTimer();

	const now = Date.now();
	const refreshAt = expiresAt - REFRESH_MARGIN_MS;
	const delay = Math.max(0, refreshAt - now);

	if (delay > 0) {
		refreshTimer = setTimeout(() => {
			refreshToken();
		}, delay);
	} else {
		// Token already needs refresh
		refreshToken();
	}
}

/**
 * Clear the refresh timer
 */
function clearRefreshTimer(): void {
	if (refreshTimer) {
		clearTimeout(refreshTimer);
		refreshTimer = null;
	}
}

/**
 * Set up visibility change listener
 * Refreshes token when tab becomes visible if nearing expiry
 */
function setupVisibilityListener(): void {
	if (!browser) return;

	// Clean up any existing listener
	cleanupVisibilityListener();

	const handleVisibilityChange = () => {
		if (document.visibilityState === 'visible' && state.isAuthenticated && lastKnownExpiresAt) {
			const now = Date.now();
			const timeUntilExpiry = lastKnownExpiresAt - now;

			// If token is expired or will expire within the refresh margin, refresh immediately
			if (timeUntilExpiry <= REFRESH_MARGIN_MS) {
				console.log('Tab became visible with token near/past expiry, refreshing...');
				refreshToken();
			} else if (timeUntilExpiry <= REFRESH_MARGIN_MS * 2) {
				// If within 2x the margin, reschedule refresh (timer might have drifted while tab was hidden)
				scheduleTokenRefresh(lastKnownExpiresAt);
			}
		}
	};

	document.addEventListener('visibilitychange', handleVisibilityChange);

	visibilityCleanup = () => {
		document.removeEventListener('visibilitychange', handleVisibilityChange);
	};
}

/**
 * Clean up visibility listener
 */
function cleanupVisibilityListener(): void {
	if (visibilityCleanup) {
		visibilityCleanup();
		visibilityCleanup = null;
	}
}

/**
 * Get cookie value by name (client-side)
 */
function getCookie(name: string): string | undefined {
	if (!browser) return undefined;

	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop()?.split(';').shift();
	}
	return undefined;
}

/**
 * Get auth health status
 * Returns information about the current auth state health
 */
export function getAuthHealth(): {
	isAuthenticated: boolean;
	isRefreshing: boolean;
	retryCount: number;
	tokenExpiresAt: number | null;
	tokenExpiresIn: number | null;
	isExpiringSoon: boolean;
} {
	const now = Date.now();
	const expiresIn = lastKnownExpiresAt ? lastKnownExpiresAt - now : null;

	return {
		isAuthenticated: state.isAuthenticated,
		isRefreshing,
		retryCount: refreshRetryCount,
		tokenExpiresAt: lastKnownExpiresAt,
		tokenExpiresIn: expiresIn,
		isExpiringSoon: expiresIn !== null && expiresIn <= REFRESH_MARGIN_MS * 2
	};
}

/**
 * Force refresh token immediately
 * Useful when detecting potential auth issues
 */
export async function forceRefresh(): Promise<boolean> {
	// Reset retry count for forced refresh
	refreshRetryCount = 0;
	return refreshToken();
}

/**
 * Create auth store with reactive getters
 */
export function createAuthStore() {
	return {
		get state() { return state; },
		get user() { return state.user; },
		get isAuthenticated() { return state.isAuthenticated; },
		get isLoading() { return state.isLoading; },
		get error() { return state.error; },
		get health() { return getAuthHealth(); },
		initialize: initializeAuth,
		login,
		logout,
		refresh: refreshToken,
		forceRefresh
	};
}
