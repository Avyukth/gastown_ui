/**
 * Network Partition Detection and Recovery Store
 *
 * Provides:
 * - Real-time offline/online detection within 1s (via browser events)
 * - Request queueing for offline scenarios with FIFO processing
 * - Auto-process queue on reconnection
 * - Polling pause integration
 * - Offline duration tracking
 *
 * @module stores/core/network
 */

// Browser detection without SvelteKit dependency (works in all contexts)
const browser = typeof window !== 'undefined';

/**
 * Error codes for network-related failures
 */
export const NetworkErrorCode = {
	OFFLINE: 'OFFLINE',
	EMPTY_ENDPOINT: 'EMPTY_ENDPOINT',
	QUEUE_PROCESSING_FAILED: 'QUEUE_PROCESSING_FAILED'
} as const;

export type NetworkErrorCodeType = (typeof NetworkErrorCode)[keyof typeof NetworkErrorCode];

/**
 * Error thrown for network-related failures
 */
export class NetworkError extends Error {
	readonly code: NetworkErrorCodeType;

	constructor(message: string, code: NetworkErrorCodeType = NetworkErrorCode.OFFLINE) {
		super(message);
		this.name = 'NetworkError';
		this.code = code;
	}
}

/**
 * HTTP method types for queued requests
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Queued request structure
 */
export interface QueuedRequest {
	/** Unique identifier for the request */
	readonly id: string;
	/** HTTP method type */
	readonly type: HttpMethod;
	/** API endpoint path */
	readonly endpoint: string;
	/** Optional request payload */
	readonly payload?: unknown;
	/** Timestamp when the request was queued (ms since epoch) */
	readonly timestamp: number;
}

/**
 * Network state structure
 */
export interface NetworkState {
	/** Whether the browser reports being online */
	readonly isOnline: boolean;
	/** Convenience inverse of isOnline */
	readonly isOffline: boolean;
	/** Copy of queued requests (immutable) */
	readonly queuedRequests: ReadonlyArray<QueuedRequest>;
	/** Number of queued requests */
	readonly queuedCount: number;
	/** Flag for polling systems to check if they should pause */
	readonly shouldPausePolling: boolean;
	/** Timestamp of last offline event (ms since epoch), null if never offline */
	readonly lastOfflineAt: number | null;
	/** Timestamp of last online event (ms since epoch), null if never online */
	readonly lastOnlineAt: number | null;
	/** Duration of last offline period in ms, null if not yet recovered */
	readonly lastOfflineDuration: number | null;
}

/**
 * Request configuration for queueing
 */
export interface QueueRequestConfig {
	/** HTTP method type */
	type: HttpMethod;
	/** API endpoint path (required, non-empty) */
	endpoint: string;
	/** Optional request payload */
	payload?: unknown;
}

/**
 * Callback type for status change subscriptions
 * @param isOnline - true when network comes online, false when it goes offline
 */
export type StatusChangeCallback = (isOnline: boolean) => void;

/**
 * Queue processor function type
 * @param request - The queued request to process
 * @returns Promise resolving to true if processed successfully (removes from queue), false to keep in queue
 */
export type QueueProcessor = (request: QueuedRequest) => Promise<boolean>;

/**
 * Dependencies for testable network store factory
 */
export interface NetworkStoreDeps {
	getOnlineStatus: () => boolean;
	addEventListener: (event: string, handler: () => void) => void;
	removeEventListener: (event: string, handler: () => void) => void;
	generateId: () => string;
	now: () => number;
}

/**
 * Default browser dependencies
 */
const defaultDeps: NetworkStoreDeps = {
	getOnlineStatus: () => (browser ? navigator.onLine : true),
	addEventListener: (event, handler) => browser && window.addEventListener(event, handler),
	removeEventListener: (event, handler) => browser && window.removeEventListener(event, handler),
	generateId: () => crypto.randomUUID(),
	now: () => Date.now()
};

/**
 * Network store return type
 */
export interface NetworkStoreInstance {
	/** Current network state (immutable snapshot) */
	readonly state: NetworkState;
	/** Assert that network is online, throws NetworkError if offline */
	assertOnline(): void;
	/** Subscribe to online/offline status changes */
	onStatusChange(callback: StatusChangeCallback): () => void;
	/** Queue a request for later processing */
	queueRequest(config: QueueRequestConfig): string;
	/** Remove a specific request from the queue by ID */
	removeRequest(id: string): void;
	/** Clear all queued requests */
	clearQueue(): void;
	/** Process the queue with a custom processor function */
	processQueue(processor: QueueProcessor): Promise<void>;
	/** Set or clear the auto-process handler for reconnection */
	setAutoProcessQueue(processor: QueueProcessor | null): void;
	/** Cleanup and destroy the store instance */
	destroy(): void;
}

/**
 * Create a network store instance with optional custom dependencies
 *
 * @param deps - Optional dependencies for testing
 * @returns Network store instance
 *
 * @example
 * ```typescript
 * // Production usage
 * const network = createNetworkStore();
 *
 * // Subscribe to changes
 * const unsubscribe = network.onStatusChange((isOnline) => {
 *   if (isOnline) {
 *     console.log('Back online!');
 *   }
 * });
 *
 * // Queue a request while offline
 * if (network.state.isOffline) {
 *   network.queueRequest({
 *     type: 'POST',
 *     endpoint: '/api/data',
 *     payload: { key: 'value' }
 *   });
 * }
 *
 * // Set up auto-processing on reconnection
 * network.setAutoProcessQueue(async (request) => {
 *   const response = await fetch(request.endpoint, {
 *     method: request.type,
 *     body: JSON.stringify(request.payload)
 *   });
 *   return response.ok;
 * });
 * ```
 */
export function createNetworkStore(deps: NetworkStoreDeps = defaultDeps): NetworkStoreInstance {
	// Internal state
	let isOnline = deps.getOnlineStatus();
	let queuedRequests: QueuedRequest[] = [];
	let callbacks: StatusChangeCallback[] = [];
	let autoProcessor: QueueProcessor | null = null;
	let lastOfflineAt: number | null = null;
	let lastOnlineAt: number | null = isOnline ? deps.now() : null;
	let lastOfflineDuration: number | null = null;
	let destroyed = false;

	/**
	 * Handle online event from browser
	 */
	const handleOnline = (): void => {
		if (destroyed) return;

		const wasOffline = !isOnline;
		isOnline = true;

		if (wasOffline) {
			const now = deps.now();

			// Calculate offline duration
			if (lastOfflineAt !== null) {
				lastOfflineDuration = now - lastOfflineAt;
			}
			lastOnlineAt = now;

			// Notify all registered callbacks
			notifyCallbacks(true);

			// Auto-process queue if handler is set
			if (autoProcessor !== null) {
				// Fire and forget - don't block the online handler
				processQueueInternal(autoProcessor).catch(() => {
					// Errors are handled internally in processQueueInternal
				});
			}
		}
	};

	/**
	 * Handle offline event from browser
	 */
	const handleOffline = (): void => {
		if (destroyed) return;

		const wasOnline = isOnline;
		isOnline = false;

		if (wasOnline) {
			lastOfflineAt = deps.now();

			// Notify all registered callbacks
			notifyCallbacks(false);
		}
	};

	/**
	 * Notify all callbacks of status change
	 */
	const notifyCallbacks = (online: boolean): void => {
		// Iterate over a copy to handle callbacks that unsubscribe themselves
		const callbacksCopy = [...callbacks];
		for (const callback of callbacksCopy) {
			try {
				callback(online);
			} catch (error) {
				// Log but don't rethrow - one callback failing shouldn't affect others
				if (typeof console !== 'undefined') {
					console.error('[NetworkStore] Callback error:', error);
				}
			}
		}
	};

	/**
	 * Internal queue processor that handles all queued requests
	 */
	const processQueueInternal = async (processor: QueueProcessor): Promise<void> => {
		// Don't process if offline or queue is empty
		if (!isOnline || queuedRequests.length === 0) {
			return;
		}

		// Process in FIFO order (oldest first)
		const toProcess = [...queuedRequests];
		for (const request of toProcess) {
			// Check if still online before each request
			if (!isOnline) {
				break;
			}

			try {
				const success = await processor(request);
				if (success) {
					// Remove successfully processed request
					queuedRequests = queuedRequests.filter((r) => r.id !== request.id);
				}
				// If !success, keep in queue for retry
			} catch (error) {
				// Keep failed requests in queue for retry
				// Log the error for debugging
				if (typeof console !== 'undefined') {
					console.error('[NetworkStore] Queue processing error for request', request.id, error);
				}
			}
		}
	};

	// Initialize event listeners
	deps.addEventListener('online', handleOnline);
	deps.addEventListener('offline', handleOffline);

	return {
		get state(): NetworkState {
			return {
				isOnline,
				isOffline: !isOnline,
				queuedRequests: [...queuedRequests],
				queuedCount: queuedRequests.length,
				shouldPausePolling: !isOnline,
				lastOfflineAt,
				lastOnlineAt,
				lastOfflineDuration
			};
		},

		assertOnline(): void {
			if (!isOnline) {
				throw new NetworkError('Network is offline', NetworkErrorCode.OFFLINE);
			}
		},

		onStatusChange(callback: StatusChangeCallback): () => void {
			callbacks.push(callback);

			// Return unsubscribe function
			return () => {
				const index = callbacks.indexOf(callback);
				if (index > -1) {
					callbacks.splice(index, 1);
				}
			};
		},

		queueRequest(config: QueueRequestConfig): string {
			// Validate endpoint
			if (!config.endpoint || config.endpoint.trim() === '') {
				throw new NetworkError('Endpoint cannot be empty', NetworkErrorCode.EMPTY_ENDPOINT);
			}

			const request: QueuedRequest = {
				id: deps.generateId(),
				type: config.type,
				endpoint: config.endpoint,
				payload: config.payload,
				timestamp: deps.now()
			};

			queuedRequests = [...queuedRequests, request];
			return request.id;
		},

		removeRequest(id: string): void {
			queuedRequests = queuedRequests.filter((r) => r.id !== id);
		},

		clearQueue(): void {
			queuedRequests = [];
		},

		async processQueue(processor: QueueProcessor): Promise<void> {
			await processQueueInternal(processor);
		},

		setAutoProcessQueue(processor: QueueProcessor | null): void {
			autoProcessor = processor;
		},

		destroy(): void {
			destroyed = true;
			callbacks = [];

			deps.removeEventListener('online', handleOnline);
			deps.removeEventListener('offline', handleOffline);
		}
	};
}

/**
 * Singleton instance for application-wide use
 *
 * @example
 * ```typescript
 * import { networkStore } from '$lib/stores/core/network.svelte';
 *
 * // Check if online
 * if (networkStore.state.isOnline) {
 *   await fetchData();
 * } else {
 *   networkStore.queueRequest({ type: 'GET', endpoint: '/api/data' });
 * }
 * ```
 */
export const networkStore = createNetworkStore();
