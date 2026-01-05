/**
 * CSRF Constants
 *
 * Shared constants for CSRF protection that can be safely imported
 * by both client and server code.
 */

/** Cookie names for CSRF tokens */
export const CSRF_COOKIES = {
	/** HttpOnly cookie storing the actual token */
	CSRF_TOKEN: 'csrf_token',
	/** Non-HttpOnly cookie for client-side access */
	CSRF_TOKEN_CLIENT: 'csrf_token_client'
} as const;

/** Header name for CSRF token in requests */
export const CSRF_HEADER = 'X-CSRF-Token';
