/**
 * Rate Limiting Middleware
 *
 * Per-endpoint rate limiting with configurable windows and limits.
 * Uses a sliding window algorithm with in-memory state.
 */

export interface RateLimitConfig {
	windowMs: number;
	maxRequests: number;
}

export interface RateLimitResult {
	allowed: boolean;
	retryAfter?: number;
	remaining?: number;
}

interface RateLimitState {
	count: number;
	resetAt: number;
}

/**
 * Default rate limits per endpoint pattern.
 * Patterns are matched in order: specific routes first, then wildcards.
 */
const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
	'GET:/api/gastown/status': { windowMs: 1000, maxRequests: 10 },
	'GET:/api/gastown/*': { windowMs: 1000, maxRequests: 20 },
	'POST:/api/gastown/rigs': { windowMs: 60000, maxRequests: 5 },
	'POST:/api/gastown/work/*': { windowMs: 10000, maxRequests: 10 },
	'POST:/api/gastown/work/sling': { windowMs: 5000, maxRequests: 5 },
	default: { windowMs: 1000, maxRequests: 50 }
};

/**
 * Environment variable accessor (works in both SvelteKit and test environments)
 */
function getEnvVar(name: string): string | undefined {
	// Try process.env first (Node.js / test environment)
	if (typeof process !== 'undefined' && process.env?.[name]) {
		return process.env[name];
	}
	return undefined;
}

/**
 * Parse rate limits from environment variable
 * Format: "endpoint:windowMs:maxRequests,endpoint:windowMs:maxRequests"
 */
function parseEnvRateLimits(): Record<string, RateLimitConfig> | null {
	const envLimits = getEnvVar('RATE_LIMITS');
	if (!envLimits) return null;

	try {
		const limits: Record<string, RateLimitConfig> = {};
		const entries = envLimits.split(',');

		for (const entry of entries) {
			const parts = entry.trim().split(':');
			if (parts.length >= 3) {
				const endpoint = parts.slice(0, -2).join(':');
				const windowMs = parseInt(parts[parts.length - 2], 10);
				const maxRequests = parseInt(parts[parts.length - 1], 10);

				if (!isNaN(windowMs) && !isNaN(maxRequests) && windowMs > 0 && maxRequests > 0) {
					limits[endpoint] = { windowMs, maxRequests };
				}
			}
		}

		return Object.keys(limits).length > 0 ? limits : null;
	} catch {
		return null;
	}
}

/**
 * Get rate limits configuration (environment override or defaults)
 */
function getRateLimits(): Record<string, RateLimitConfig> {
	const envLimits = parseEnvRateLimits();
	if (envLimits) {
		return { ...DEFAULT_RATE_LIMITS, ...envLimits };
	}
	return DEFAULT_RATE_LIMITS;
}

/**
 * In-memory client state storage
 * Map<clientId, Map<endpoint, RateLimitState>>
 */
const clients = new Map<string, Map<string, RateLimitState>>();

/**
 * Match a path against a pattern with wildcard support
 */
function matchPattern(pattern: string, path: string): boolean {
	if (pattern === path) return true;

	if (pattern.endsWith('/*')) {
		const prefix = pattern.slice(0, -1);
		return path.startsWith(prefix);
	}

	return false;
}

/**
 * Find the best matching rate limit config for a given method and path
 */
function findRateLimit(method: string, path: string): RateLimitConfig {
	const limits = getRateLimits();
	const key = `${method}:${path}`;

	// Exact match first
	if (limits[key]) {
		return limits[key];
	}

	// Try wildcard matches (specific to general)
	const wildcardKeys = Object.keys(limits)
		.filter((k) => k.includes('*'))
		.sort((a, b) => b.length - a.length);

	for (const pattern of wildcardKeys) {
		const [patternMethod, ...pathParts] = pattern.split(':');
		const patternPath = pathParts.join(':');

		if (patternMethod === method && matchPattern(patternPath, path)) {
			return limits[pattern];
		}
	}

	return limits['default'];
}

/**
 * Check if a request is allowed under rate limiting
 */
export function checkRateLimit(
	clientId: string,
	path: string,
	method: string
): RateLimitResult {
	const now = Date.now();
	const limit = findRateLimit(method, path);
	const key = `${method}:${path}`;

	// Get or create client map
	let clientMap = clients.get(clientId);
	if (!clientMap) {
		clientMap = new Map();
		clients.set(clientId, clientMap);
	}

	// Get or create rate limit state for this endpoint
	let state = clientMap.get(key);
	if (!state || now >= state.resetAt) {
		state = {
			count: 0,
			resetAt: now + limit.windowMs
		};
		clientMap.set(key, state);
	}

	state.count++;

	if (state.count > limit.maxRequests) {
		const retryAfter = Math.ceil((state.resetAt - now) / 1000);
		return {
			allowed: false,
			retryAfter: retryAfter > 0 ? retryAfter : 1,
			remaining: 0
		};
	}

	return {
		allowed: true,
		remaining: limit.maxRequests - state.count
	};
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header if available, otherwise falls back to a default
 */
export function getClientId(request: Request): string {
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}

	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		return realIp;
	}

	// Fallback for development/testing
	return 'unknown-client';
}

/**
 * Reset rate limit state for a specific client
 * Useful for testing or manual intervention
 */
export function resetClientRateLimit(clientId: string): void {
	clients.delete(clientId);
}

/**
 * Clear all rate limit state
 * Useful for testing
 */
export function clearAllRateLimits(): void {
	clients.clear();
}

/**
 * Get rate limit stats for a client (for monitoring/debugging)
 */
export function getRateLimitStats(clientId: string): Map<string, RateLimitState> | undefined {
	return clients.get(clientId);
}

/**
 * Cleanup expired rate limit entries
 * Call periodically to prevent memory buildup
 */
export function cleanupExpiredEntries(): number {
	const now = Date.now();
	let cleaned = 0;

	for (const [clientId, clientMap] of clients.entries()) {
		for (const [key, state] of clientMap.entries()) {
			if (now >= state.resetAt) {
				clientMap.delete(key);
				cleaned++;
			}
		}
		if (clientMap.size === 0) {
			clients.delete(clientId);
		}
	}

	return cleaned;
}
