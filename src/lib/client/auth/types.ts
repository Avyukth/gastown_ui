/**
 * Authentication Types (Client-Safe)
 *
 * Defines the core types for the secure authentication flow.
 * These types are safe for both client and server use.
 */

/** User information decoded from token */
export interface User {
	id: string;
	email: string;
	name?: string;
	roles?: string[];
}

/** Authentication state */
export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

/** Login credentials */
export interface LoginCredentials {
	email: string;
	password: string;
}

/** Session data stored in server locals */
export interface SessionData {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	expiresAt: number | null; // Unix timestamp
}

/** Auth API response */
export interface AuthResponse {
	success: boolean;
	user?: User;
	error?: string;
	expiresAt?: number;
}
