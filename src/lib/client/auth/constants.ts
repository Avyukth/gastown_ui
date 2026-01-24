/**
 * Auth Constants (Client-Safe)
 *
 * Shared constants for authentication that can be safely imported
 * by both client and server code. NO server-only code here.
 */

/** Cookie names for auth tokens */
export const AUTH_COOKIES = {
	ACCESS_TOKEN: 'auth_access',
	REFRESH_TOKEN: 'auth_refresh',
	/** Non-HttpOnly cookie for client-side auth state detection */
	AUTH_STATE: 'auth_state'
} as const;

/** Cookie names for CSRF tokens */
export const CSRF_COOKIES = {
	/** HttpOnly cookie storing the actual token */
	CSRF_TOKEN: 'csrf_token',
	/** Non-HttpOnly cookie for client-side access */
	CSRF_TOKEN_CLIENT: 'csrf_token_client'
} as const;

/** Header name for CSRF token in requests */
export const CSRF_HEADER = 'X-CSRF-Token';

/**
 * Parse auth state cookie on client
 * This is a pure function that can safely run in browser
 */
export function parseAuthStateCookie(
	cookieValue: string | undefined
): { authenticated: boolean; expiresAt: number } | null {
	if (!cookieValue) return null;

	try {
		return JSON.parse(cookieValue);
	} catch {
		return null;
	}
}
