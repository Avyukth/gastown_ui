/**
 * API Auth Guard - Protects all /api/gastown/* routes
 *
 * YELLOW phase: Minimal implementation to pass tests.
 *
 * All routes under /api/gastown/ require valid JWT authentication.
 * Unauthenticated requests receive 401 Unauthorized.
 */

import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { requireAuth, AuthError } from '$lib/server/auth';

/**
 * Layout load function that enforces authentication
 * Runs before any child route loads
 */
export const load: LayoutServerLoad = async ({ cookies }) => {
	try {
		const user = await requireAuth(cookies);

		// Pass authenticated user to child routes
		return { user };
	} catch (e) {
		if (e instanceof AuthError) {
			const message = getErrorMessage(e.code);
			throw error(401, { message });
		}

		// Unknown error - don't leak details
		throw error(401, { message: 'Authentication required' });
	}
};

/**
 * Get user-friendly error message for auth error code
 */
function getErrorMessage(code: string): string {
	switch (code) {
		case 'NO_TOKEN':
			return 'Authentication required';
		case 'INVALID_TOKEN':
			return 'Invalid authentication token';
		case 'EXPIRED_TOKEN':
			return 'Authentication token has expired';
		default:
			return 'Authentication required';
	}
}
