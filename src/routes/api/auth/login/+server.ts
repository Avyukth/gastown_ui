/**
 * Login API Endpoint
 *
 * POST /api/auth/login
 * Authenticates user and sets secure HttpOnly cookies
 *
 * Authentication modes:
 * - Demo mode (GASTOWN_DEMO_MODE=true): Accepts password "demo" for any email
 * - Production mode: Verifies CLI access and accepts valid credentials
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setAuthCookies } from '$lib/auth/cookies';
import type { AuthResponse, LoginCredentials } from '$lib/auth/types';
import {
	authenticateUser,
	ACCESS_TOKEN_EXPIRY_SECONDS,
	REFRESH_TOKEN_EXPIRY_SECONDS
} from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const credentials: LoginCredentials = {
			email: body.email,
			password: body.password
		};

		// Validate input
		if (!credentials.email || !credentials.password) {
			const response: AuthResponse = { success: false, error: 'Email and password are required' };
			return json(response, { status: 400 });
		}

		// Authenticate using server auth module (handles demo vs production mode)
		const result = await authenticateUser(credentials.email, credentials.password);

		if (!result.success || !result.user || !result.accessToken || !result.refreshToken) {
			const response: AuthResponse = { success: false, error: result.error ?? 'Authentication failed' };
			return json(response, { status: 401 });
		}

		// Set secure cookies with proper JWT tokens
		setAuthCookies(
			cookies,
			result.accessToken,
			result.refreshToken,
			ACCESS_TOKEN_EXPIRY_SECONDS,
			REFRESH_TOKEN_EXPIRY_SECONDS
		);

		const expiresAt = Date.now() + (ACCESS_TOKEN_EXPIRY_SECONDS * 1000);

		const response: AuthResponse = {
			success: true,
			user: result.user,
			expiresAt
		};
		return json(response);
	} catch (error) {
		console.error('Login error:', error);
		const response: AuthResponse = { success: false, error: 'Login failed' };
		return json(response, { status: 500 });
	}
};
