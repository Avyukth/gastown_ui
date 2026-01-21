/**
 * Server-side Authentication Module
 *
 * Provides JWT-based authentication with proper signing.
 * Supports demo mode and production mode with CLI verification.
 */

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
