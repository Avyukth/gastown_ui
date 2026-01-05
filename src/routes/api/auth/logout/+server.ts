/**
 * Logout API Endpoint
 *
 * POST /api/auth/logout
 * Clears all auth cookies to complete logout
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clearAuthCookies } from '$lib/auth/cookies';
import { clearCsrfTokens } from '$lib/auth/csrf.server';
import type { AuthResponse } from '$lib/auth/types';

export const POST: RequestHandler = async ({ cookies }) => {
	// Clear all auth cookies
	// This removes:
	// - Access token (HttpOnly)
	// - Refresh token (HttpOnly)
	// - Auth state cookie
	clearAuthCookies(cookies);

	// Clear CSRF tokens as well
	clearCsrfTokens(cookies);

	const response: AuthResponse = { success: true };
	return json(response);
};
