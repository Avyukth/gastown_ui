/**
 * Network state store using Svelte 5 runes
 *
 * Tracks online/offline status and provides:
 * - Real-time network status detection
 * - Queued actions tracking
 * - Status change callbacks for notifications
 */

// Browser detection without SvelteKit dependency (works in all contexts)
const browser = typeof window !== 'undefined';

// Type for queued action
export interface QueuedAction {
	id: string;
	type: string;
	timestamp: number;
	description?: string;
}

// Callbacks for status changes
type StatusChangeCallback = (isOnline: boolean) => void;

class NetworkState {
	// Core state
	#isOnline = $state(browser ? navigator.onLine : true);
	#queuedActions = $state<QueuedAction[]>([]);
	#callbacks: StatusChangeCallback[] = [];
	#initialized = false;

	constructor() {
		if (browser && !this.#initialized) {
			this.#init();
		}
	}

	#init() {
		if (this.#initialized) return;
		this.#initialized = true;

		// Listen for online/offline events
		window.addEventListener('online', this.#handleOnline);
		window.addEventListener('offline', this.#handleOffline);

		// Initial check
		this.#isOnline = navigator.onLine;
	}

	#handleOnline = () => {
		const wasOffline = !this.#isOnline;
		this.#isOnline = true;

		if (wasOffline) {
			this.#notifyCallbacks(true);
		}
	};

	#handleOffline = () => {
		const wasOnline = this.#isOnline;
		this.#isOnline = false;

		if (wasOnline) {
			this.#notifyCallbacks(false);
		}
	};

	#notifyCallbacks(isOnline: boolean) {
		for (const callback of this.#callbacks) {
			try {
				callback(isOnline);
			} catch (e) {
				console.error('Network status callback error:', e);
			}
		}
	}

	// Public getters
	get isOnline() {
		return this.#isOnline;
	}

	get isOffline() {
		return !this.#isOnline;
	}

	get queuedActions() {
		return this.#queuedActions;
	}

	get queuedCount() {
		return this.#queuedActions.length;
	}

	// Queue management
	queueAction(action: Omit<QueuedAction, 'id' | 'timestamp'>) {
		const newAction: QueuedAction = {
			...action,
			id: crypto.randomUUID(),
			timestamp: Date.now()
		};
		this.#queuedActions = [...this.#queuedActions, newAction];
		return newAction.id;
	}

	removeAction(id: string) {
		this.#queuedActions = this.#queuedActions.filter((a) => a.id !== id);
	}

	clearQueue() {
		this.#queuedActions = [];
	}

	// Process queued actions when back online
	async processQueue(processor: (action: QueuedAction) => Promise<boolean>) {
		if (!this.#isOnline || this.#queuedActions.length === 0) return;

		const toProcess = [...this.#queuedActions];
		for (const action of toProcess) {
			try {
				const success = await processor(action);
				if (success) {
					this.removeAction(action.id);
				}
			} catch (e) {
				console.error('Failed to process queued action:', action.id, e);
			}
		}
	}

	// Subscribe to status changes
	onStatusChange(callback: StatusChangeCallback) {
		this.#callbacks.push(callback);

		// Return unsubscribe function
		return () => {
			const index = this.#callbacks.indexOf(callback);
			if (index > -1) {
				this.#callbacks.splice(index, 1);
			}
		};
	}

	// Cleanup (for testing or hot reload)
	destroy() {
		if (browser) {
			window.removeEventListener('online', this.#handleOnline);
			window.removeEventListener('offline', this.#handleOffline);
		}
		this.#callbacks = [];
		this.#initialized = false;
	}
}

// Singleton instance
export const networkState = new NetworkState();
