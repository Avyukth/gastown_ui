/**
 * Token Refresh API Endpoint
 *
 * POST /api/auth/refresh
 * Refreshes access token before expiration using refresh token
 *
 * Uses proper JWT verification via jose library.
 * Rotates refresh tokens on each refresh for security.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getRefreshToken,
	setAuthCookies,
	clearAuthCookies,
	refreshTokens,
	ACCESS_TOKEN_EXPIRY_SECONDS,
	REFRESH_TOKEN_EXPIRY_SECONDS,
	type AuthResponse
} from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	const refreshToken = getRefreshToken(cookies);

	if (!refreshToken) {
		const response: AuthResponse = { success: false, error: 'No refresh token' };
		return json(response, { status: 401 });
	}

	// Verify and refresh tokens using server auth module (proper JWT verification)
	const result = await refreshTokens(refreshToken);

	if (!result.success || !result.accessToken || !result.newRefreshToken) {
		// Clear cookies on refresh failure
		clearAuthCookies(cookies);

		const response: AuthResponse = { success: false, error: result.error ?? 'Token refresh failed' };
		return json(response, { status: 401 });
	}

	// Set new cookies with rotated tokens
	setAuthCookies(
		cookies,
		result.accessToken,
		result.newRefreshToken,
		ACCESS_TOKEN_EXPIRY_SECONDS,
		REFRESH_TOKEN_EXPIRY_SECONDS
	);

	const expiresAt = Date.now() + (ACCESS_TOKEN_EXPIRY_SECONDS * 1000);

	const response: AuthResponse = { success: true, expiresAt };
	return json(response);
};
