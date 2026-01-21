/**
 * JWT Utilities - Server-side token generation and validation
 *
 * Uses jose library for standards-compliant JWT operations.
 * Supports both demo mode (weak tokens) and production mode (proper signing).
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/** Access token expiry: 15 minutes */
export const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;

/** Refresh token expiry: 7 days */
export const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

/** Algorithm for JWT signing */
const JWT_ALGORITHM = 'HS256';

/** JWT issuer */
const JWT_ISSUER = 'gastown-ui';

/** JWT audience */
const JWT_AUDIENCE = 'gastown';

/** Token types */
export type TokenType = 'access' | 'refresh';

/** User payload in JWT */
export interface UserPayload {
	id: string;
	email: string;
	name?: string;
	roles?: string[];
}

/** Extended JWT payload with our custom claims */
interface CustomJWTPayload extends JWTPayload {
	email?: string;
	name?: string;
	roles?: string[];
	type?: TokenType;
}

/**
 * Get signing key from environment or generate a deterministic one for dev
 * In production, AUTH_SECRET should be set to a secure random value
 */
function getSigningKey(): Uint8Array {
	const secret = process.env.AUTH_SECRET || process.env.GASTOWN_AUTH_SECRET;

	if (secret) {
		return new TextEncoder().encode(secret);
	}

	// Development fallback: use a deterministic key (NOT FOR PRODUCTION)
	const devKey = 'gastown-dev-secret-do-not-use-in-production';
	if (process.env.NODE_ENV === 'production') {
		console.error(
			'WARNING: AUTH_SECRET is not set in production! Using insecure fallback.'
		);
	}
	return new TextEncoder().encode(devKey);
}

/**
 * Check if demo mode is enabled
 */
function isDemoMode(): boolean {
	const demoMode = process.env.GASTOWN_DEMO_MODE;
	// Default to true if not explicitly set to 'false'
	return demoMode !== 'false';
}

/**
 * Create a signed JWT access token
 */
export async function createAccessToken(user: UserPayload): Promise<string> {
	const secret = getSigningKey();
	const now = Math.floor(Date.now() / 1000);

	return new SignJWT({
		email: user.email,
		name: user.name,
		roles: user.roles || ['user'],
		type: 'access' as TokenType
	})
		.setProtectedHeader({ alg: JWT_ALGORITHM })
		.setSubject(user.id)
		.setIssuer(JWT_ISSUER)
		.setAudience(JWT_AUDIENCE)
		.setIssuedAt(now)
		.setExpirationTime(now + ACCESS_TOKEN_EXPIRY_SECONDS)
		.sign(secret);
}

/**
 * Create a signed JWT refresh token
 */
export async function createRefreshToken(userId: string): Promise<string> {
	const secret = getSigningKey();
	const now = Math.floor(Date.now() / 1000);

	return new SignJWT({
		type: 'refresh' as TokenType
	})
		.setProtectedHeader({ alg: JWT_ALGORITHM })
		.setSubject(userId)
		.setIssuer(JWT_ISSUER)
		.setAudience(JWT_AUDIENCE)
		.setIssuedAt(now)
		.setExpirationTime(now + REFRESH_TOKEN_EXPIRY_SECONDS)
		.sign(secret);
}

/**
 * Verify and decode a JWT token
 * Returns the payload if valid, null if invalid/expired
 */
export async function verifyToken(
	token: string,
	expectedType?: TokenType
): Promise<CustomJWTPayload | null> {
	try {
		const secret = getSigningKey();
		const { payload } = await jwtVerify(token, secret, {
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE
		});

		// Verify token type if specified
		if (expectedType && payload.type !== expectedType) {
			return null;
		}

		return payload as CustomJWTPayload;
	} catch {
		return null;
	}
}

/**
 * Extract user info from access token payload
 */
export function extractUserFromPayload(payload: CustomJWTPayload): UserPayload | null {
	if (!payload.sub || payload.type !== 'access') {
		return null;
	}

	return {
		id: payload.sub,
		email: payload.email || '',
		name: payload.name,
		roles: payload.roles
	};
}

/**
 * Verify CLI access by running gt status
 * Returns true if the CLI is accessible and working
 */
async function verifyCLIAccess(): Promise<boolean> {
	try {
		const { stdout } = await execFileAsync('gt', ['status', '--json'], {
			timeout: 5000,
			env: process.env
		});
		// If we get any JSON output, CLI is accessible
		JSON.parse(stdout);
		return true;
	} catch {
		return false;
	}
}

/**
 * Authenticate user credentials
 *
 * In demo mode: accepts any email with password "demo"
 * In production mode: verifies CLI access and uses email as identity
 */
export async function authenticateUser(
	email: string,
	password: string
): Promise<{
	success: boolean;
	user?: UserPayload;
	accessToken?: string;
	refreshToken?: string;
	error?: string;
}> {
	// Demo mode: accept "demo" password for any email
	if (isDemoMode()) {
		if (password !== 'demo') {
			return { success: false, error: 'Invalid credentials' };
		}

		const userId = crypto.randomUUID();
		const user: UserPayload = {
			id: userId,
			email,
			name: email.split('@')[0],
			roles: ['user', 'demo']
		};

		const [accessToken, refreshToken] = await Promise.all([
			createAccessToken(user),
			createRefreshToken(userId)
		]);

		return { success: true, user, accessToken, refreshToken };
	}

	// Production mode: verify CLI access
	const hasCliAccess = await verifyCLIAccess();
	if (!hasCliAccess) {
		return {
			success: false,
			error: 'Gas Town CLI is not accessible. Ensure gt is installed and configured.'
		};
	}

	// In production, we could verify against a user database
	// For now, we accept any credentials if CLI is accessible
	// This matches the "local dev tool" model where CLI access = authorization
	if (!password || password.length < 4) {
		return { success: false, error: 'Password must be at least 4 characters' };
	}

	const userId = crypto.randomUUID();
	const user: UserPayload = {
		id: userId,
		email,
		name: email.split('@')[0],
		roles: ['user', 'operator']
	};

	const [accessToken, refreshToken] = await Promise.all([
		createAccessToken(user),
		createRefreshToken(userId)
	]);

	return { success: true, user, accessToken, refreshToken };
}

/**
 * Refresh tokens using a valid refresh token
 */
export async function refreshTokens(refreshToken: string): Promise<{
	success: boolean;
	accessToken?: string;
	newRefreshToken?: string;
	error?: string;
}> {
	const payload = await verifyToken(refreshToken, 'refresh');

	if (!payload || !payload.sub) {
		return { success: false, error: 'Invalid or expired refresh token' };
	}

	// Create new tokens (rotate refresh token for security)
	const userId = payload.sub;
	const user: UserPayload = {
		id: userId,
		email: `user-${userId.slice(0, 8)}@gastown.local`,
		roles: ['user']
	};

	const [newAccessToken, newRefreshToken] = await Promise.all([
		createAccessToken(user),
		createRefreshToken(userId)
	]);

	return {
		success: true,
		accessToken: newAccessToken,
		newRefreshToken
	};
}
