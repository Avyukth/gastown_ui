/**
 * HTTP API Client
 *
 * Type-safe HTTP client with:
 * - Bearer token authentication (cookies or explicit token)
 * - Automatic retries with exponential backoff
 * - Rate limiting
 * - Request timeout handling
 * - Structured error responses
 */

import type {
	HttpMethod,
	ApiError,
	ApiErrorCode,
	ApiResponse,
	RequestOptions,
	ClientConfig,
	RateLimiterState
} from './types';
import { DEFAULT_CLIENT_CONFIG } from './types';
import { CSRF_COOKIES, CSRF_HEADER } from '$lib/auth/csrf.constants';

/** HTTP methods that require CSRF token */
const CSRF_REQUIRED_METHODS: HttpMethod[] = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Get CSRF token from client-accessible cookie
 */
function getCsrfTokenFromCookie(): string | null {
	if (typeof document === 'undefined') return null;

	const cookies = document.cookie.split(';');
	for (const cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === CSRF_COOKIES.CSRF_TOKEN_CLIENT) {
			return decodeURIComponent(value);
		}
	}
	return null;
}

/**
 * Create an ApiError from various error sources
 */
function createApiError(
	code: ApiErrorCode,
	message: string,
	status?: number,
	details?: Record<string, unknown>
): ApiError {
	const retryable = ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMITED', 'SERVER_ERROR'].includes(code);
	return { code, message, status, details, retryable };
}

/**
 * Map HTTP status to error code
 */
function statusToErrorCode(status: number): ApiErrorCode {
	if (status === 401) return 'UNAUTHORIZED';
	if (status === 403) return 'FORBIDDEN';
	if (status === 404) return 'NOT_FOUND';
	if (status === 422 || status === 400) return 'VALIDATION_ERROR';
	if (status === 429) return 'RATE_LIMITED';
	if (status >= 500) return 'SERVER_ERROR';
	return 'UNKNOWN';
}

/**
 * Rate limiter using sliding window
 */
class RateLimiter {
	#state: RateLimiterState = {
		requests: [],
		blocked: false,
		resetTime: null
	};
	#maxRequests: number;
	#windowMs: number;

	constructor(maxRequests: number, windowMs: number) {
		this.#maxRequests = maxRequests;
		this.#windowMs = windowMs;
	}

	get isBlocked(): boolean {
		return this.#state.blocked;
	}

	get resetTime(): number | null {
		return this.#state.resetTime;
	}

	/**
	 * Check if request is allowed and record it
	 */
	acquire(): boolean {
		const now = Date.now();
		const windowStart = now - this.#windowMs;

		// Clean old requests outside the window
		this.#state.requests = this.#state.requests.filter((t) => t > windowStart);

		// Check if blocked
		if (this.#state.requests.length >= this.#maxRequests) {
			this.#state.blocked = true;
			this.#state.resetTime = this.#state.requests[0] + this.#windowMs;
			return false;
		}

		// Record request
		this.#state.requests.push(now);
		this.#state.blocked = false;
		this.#state.resetTime = null;
		return true;
	}

	/**
	 * Get wait time until next request is allowed
	 */
	getWaitTime(): number {
		if (!this.#state.blocked || !this.#state.resetTime) return 0;
		return Math.max(0, this.#state.resetTime - Date.now());
	}

	/**
	 * Record rate limit from server (429 response)
	 */
	setServerRateLimit(retryAfterMs: number): void {
		this.#state.blocked = true;
		this.#state.resetTime = Date.now() + retryAfterMs;
	}
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
	const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
	const jitter = delay * 0.2 * Math.random();
	return delay + jitter;
}

/**
 * Build URL with query parameters
 */
function buildUrl(
	baseUrl: string,
	path: string,
	params?: Record<string, string | number | boolean | undefined>
): string {
	const url = new URL(path, baseUrl || window.location.origin);

	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				url.searchParams.set(key, String(value));
			}
		}
	}

	return url.toString();
}

/**
 * Sleep for specified duration
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * API Client class
 */
export class ApiClient {
	#config: ClientConfig;
	#rateLimiter: RateLimiter;

	constructor(config: Partial<ClientConfig> = {}) {
		this.#config = { ...DEFAULT_CLIENT_CONFIG, ...config };
		this.#rateLimiter = new RateLimiter(
			this.#config.rateLimitRequests,
			this.#config.rateLimitWindow
		);
	}

	/**
	 * Make a typed HTTP request
	 */
	async request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
		const {
			headers = {},
			params,
			body,
			timeout = this.#config.defaultTimeout,
			retries = this.#config.defaultRetries,
			skipAuth = false,
			signal
		} = options;

		// Check rate limit
		if (!this.#rateLimiter.acquire()) {
			const waitTime = this.#rateLimiter.getWaitTime();
			throw createApiError(
				'RATE_LIMITED',
				`Rate limited. Retry after ${Math.ceil(waitTime / 1000)}s`,
				429,
				{ retryAfter: waitTime }
			);
		}

		// Build request headers
		const requestHeaders: Record<string, string> = {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...headers
		};

		// Add auth header if token provider exists and not skipped
		if (!skipAuth && this.#config.getToken) {
			const token = await this.#config.getToken();
			if (token) {
				requestHeaders['Authorization'] = `Bearer ${token}`;
			}
		}

		// Add CSRF token for state-changing requests
		if (CSRF_REQUIRED_METHODS.includes(method)) {
			const csrfToken = getCsrfTokenFromCookie();
			if (csrfToken) {
				requestHeaders[CSRF_HEADER] = csrfToken;
			}
		}

		// Build URL
		const url = buildUrl(this.#config.baseUrl, path, params);

		// Execute with retries
		let lastError: ApiError | null = null;
		for (let attempt = 1; attempt <= retries + 1; attempt++) {
			try {
				const response = await this.#executeRequest<T>(
					method,
					url,
					requestHeaders,
					body,
					timeout,
					signal
				);
				return response;
			} catch (error) {
				lastError = error as ApiError;

				// Don't retry if not retryable or last attempt
				if (!lastError.retryable || attempt > retries) {
					throw lastError;
				}

				// Handle server-specified rate limit
				if (lastError.code === 'RATE_LIMITED' && lastError.details?.retryAfter) {
					const retryAfter = lastError.details.retryAfter as number;
					this.#rateLimiter.setServerRateLimit(retryAfter);
					await sleep(retryAfter);
				} else {
					// Exponential backoff
					const backoff = calculateBackoff(
						attempt,
						this.#config.retryBaseDelay,
						this.#config.retryMaxDelay
					);
					await sleep(backoff);
				}
			}
		}

		throw lastError!;
	}

	/**
	 * Execute a single request with timeout
	 */
	async #executeRequest<T>(
		method: HttpMethod,
		url: string,
		headers: Record<string, string>,
		body: unknown,
		timeout: number,
		externalSignal?: AbortSignal
	): Promise<ApiResponse<T>> {
		// Create timeout controller
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		// Combine with external signal if provided
		if (externalSignal) {
			externalSignal.addEventListener('abort', () => controller.abort());
		}

		try {
			const response = await fetch(url, {
				method,
				headers,
				body: body ? JSON.stringify(body) : undefined,
				credentials: 'include', // Include cookies for auth
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				// Parse error response
				let errorDetails: Record<string, unknown> = {};
				try {
					errorDetails = await response.json();
				} catch {
					// Response may not be JSON
				}

				// Extract retry-after header for rate limits
				if (response.status === 429) {
					const retryAfter = response.headers.get('Retry-After');
					if (retryAfter) {
						const retryAfterMs = parseInt(retryAfter, 10) * 1000 || 60000;
						errorDetails.retryAfter = retryAfterMs;
					}
				}

				const code = statusToErrorCode(response.status);
				throw createApiError(
					code,
					errorDetails.message as string || response.statusText,
					response.status,
					errorDetails
				);
			}

			// Parse successful response
			const data = await response.json() as T;
			return {
				data,
				status: response.status,
				headers: response.headers
			};
		} catch (error) {
			clearTimeout(timeoutId);

			// Already an ApiError
			if ((error as ApiError).code) {
				throw error;
			}

			// Timeout
			if (error instanceof DOMException && error.name === 'AbortError') {
				throw createApiError('TIMEOUT', `Request timed out after ${timeout}ms`);
			}

			// Network error
			throw createApiError(
				'NETWORK_ERROR',
				error instanceof Error ? error.message : 'Network request failed'
			);
		}
	}

	// Convenience methods

	async get<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<ApiResponse<T>> {
		return this.request<T>('GET', path, options);
	}

	async post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>): Promise<ApiResponse<T>> {
		return this.request<T>('POST', path, { ...options, body });
	}

	async put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>): Promise<ApiResponse<T>> {
		return this.request<T>('PUT', path, { ...options, body });
	}

	async patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>): Promise<ApiResponse<T>> {
		return this.request<T>('PATCH', path, { ...options, body });
	}

	async delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this.request<T>('DELETE', path, options);
	}
}

// Default client instance (uses cookies for auth)
export const apiClient = new ApiClient();

// Factory for custom configurations
export function createApiClient(config: Partial<ClientConfig> = {}): ApiClient {
	return new ApiClient(config);
}

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		'message' in error &&
		'retryable' in error
	);
}
