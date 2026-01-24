/**
 * Current User API Endpoint
 *
 * GET /api/auth/me
 * Returns current authenticated user from session
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { AuthResponse } from '$lib/server/auth';

export const GET: RequestHandler = async ({ locals }) => {
	const { session } = locals;

	if (!session.user || !session.accessToken) {
		const response: AuthResponse = { success: false, error: 'Not authenticated' };
		return json(response, { status: 401 });
	}

	const response: AuthResponse = {
		success: true,
		user: session.user,
		expiresAt: session.expiresAt ?? undefined
	};
	return json(response);
};
