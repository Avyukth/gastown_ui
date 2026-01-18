/**
 * SWR (Stale-While-Revalidate) Cache Store
 *
 * Core caching infrastructure for instant perceived performance.
 * Serves stale data immediately while revalidating in the background.
 *
 * Key Features:
 * - Configurable TTLs per cache key
 * - Automatic background revalidation
 * - Cache invalidation with cascading support
 * - Memory-efficient with configurable limits
 * - SSR-safe (browser-only operations guarded)
 */

const browser = typeof window !== 'undefined';

export interface CacheEntry<T> {
	data: T;
	timestamp: number;
	staleAt: number;
	expiresAt: number;
	isRevalidating: boolean;
	error: Error | null;
}

export interface CacheConfig {
	staleTime: number;
	cacheTime: number;
	maxEntries: number;
	onEvict?: (key: string, entry: CacheEntry<unknown>) => void;
}

export interface SWROptions<T> {
	key: string;
	fetcher: () => Promise<T>;
	staleTime?: number;
	cacheTime?: number;
	onSuccess?: (data: T) => void;
	onError?: (error: Error) => void;
	dedupe?: boolean;
	revalidateOnFocus?: boolean;
	revalidateOnReconnect?: boolean;
}

const DEFAULT_CONFIG: CacheConfig = {
	staleTime: 5000,
	cacheTime: 300000,
	maxEntries: 100
};

type Subscriber<T> = (entry: CacheEntry<T> | null) => void;
type InvalidationCallback = (keys: string[]) => void;

class SWRCache {
	#cache = new Map<string, CacheEntry<unknown>>();
	#config: CacheConfig;
	#subscribers = new Map<string, Set<Subscriber<unknown>>>();
	#pendingFetches = new Map<string, Promise<unknown>>();
	#invalidationCallbacks: InvalidationCallback[] = [];
	#cleanupInterval: ReturnType<typeof setInterval> | null = null;
	#focusListener: (() => void) | null = null;
	#reconnectListener: (() => void) | null = null;
	#keyDependencies = new Map<string, Set<string>>();

	constructor(config: Partial<CacheConfig> = {}) {
		this.#config = { ...DEFAULT_CONFIG, ...config };

		if (browser) {
			this.#init();
		}
	}

	#init() {
		this.#cleanupInterval = setInterval(() => this.#cleanup(), 60000);

		this.#focusListener = () => {
			for (const key of this.#cache.keys()) {
				const entry = this.#cache.get(key);
				if (entry && this.#isStale(entry)) {
					this.#notifySubscribers(key, entry);
				}
			}
		};

		this.#reconnectListener = () => {
			for (const key of this.#cache.keys()) {
				const entry = this.#cache.get(key);
				if (entry && this.#isStale(entry)) {
					this.#notifySubscribers(key, entry);
				}
			}
		};

		window.addEventListener('focus', this.#focusListener);
		window.addEventListener('online', this.#reconnectListener);
	}

	get<T>(key: string): CacheEntry<T> | null {
		const entry = this.#cache.get(key);
		if (!entry) return null;

		if (Date.now() > entry.expiresAt) {
			this.#cache.delete(key);
			return null;
		}

		return entry as CacheEntry<T>;
	}

	set<T>(
		key: string,
		data: T,
		options: { staleTime?: number; cacheTime?: number } = {}
	): void {
		const now = Date.now();
		const staleTime = options.staleTime ?? this.#config.staleTime;
		const cacheTime = options.cacheTime ?? this.#config.cacheTime;

		const entry: CacheEntry<T> = {
			data,
			timestamp: now,
			staleAt: now + staleTime,
			expiresAt: now + cacheTime,
			isRevalidating: false,
			error: null
		};

		this.#enforceMaxEntries();
		this.#cache.set(key, entry);
		this.#notifySubscribers(key, entry);
	}

	delete(key: string): boolean {
		const deleted = this.#cache.delete(key);
		if (deleted) {
			this.#notifySubscribers(key, null);
		}
		return deleted;
	}

	has(key: string): boolean {
		const entry = this.#cache.get(key);
		if (!entry) return false;
		if (Date.now() > entry.expiresAt) {
			this.#cache.delete(key);
			return false;
		}
		return true;
	}

	isStale(key: string): boolean {
		const entry = this.#cache.get(key);
		if (!entry) return true;
		return this.#isStale(entry);
	}

	#isStale(entry: CacheEntry<unknown>): boolean {
		return Date.now() > entry.staleAt;
	}

	async swr<T>(options: SWROptions<T>): Promise<T> {
		const {
			key,
			fetcher,
			staleTime = this.#config.staleTime,
			cacheTime = this.#config.cacheTime,
			onSuccess,
			onError,
			dedupe = true
		} = options;

		const cached = this.get<T>(key);

		if (cached && !this.#isStale(cached)) {
			return cached.data;
		}

		if (cached) {
			this.#revalidateInBackground(key, fetcher, { staleTime, cacheTime, onSuccess, onError, dedupe });
			return cached.data;
		}

		return this.#fetchAndCache(key, fetcher, { staleTime, cacheTime, onSuccess, onError, dedupe });
	}

	async #fetchAndCache<T>(
		key: string,
		fetcher: () => Promise<T>,
		options: {
			staleTime: number;
			cacheTime: number;
			onSuccess?: (data: T) => void;
			onError?: (error: Error) => void;
			dedupe: boolean;
		}
	): Promise<T> {
		if (options.dedupe && this.#pendingFetches.has(key)) {
			return this.#pendingFetches.get(key) as Promise<T>;
		}

		const fetchPromise = (async () => {
			try {
				const data = await fetcher();
				this.set(key, data, { staleTime: options.staleTime, cacheTime: options.cacheTime });
				options.onSuccess?.(data);
				return data;
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				const entry = this.get<T>(key);
				if (entry) {
					entry.error = error;
					entry.isRevalidating = false;
					this.#notifySubscribers(key, entry);
				}
				options.onError?.(error);
				throw error;
			} finally {
				this.#pendingFetches.delete(key);
			}
		})();

		if (options.dedupe) {
			this.#pendingFetches.set(key, fetchPromise);
		}

		return fetchPromise;
	}

	#revalidateInBackground<T>(
		key: string,
		fetcher: () => Promise<T>,
		options: {
			staleTime: number;
			cacheTime: number;
			onSuccess?: (data: T) => void;
			onError?: (error: Error) => void;
			dedupe: boolean;
		}
	): void {
		const entry = this.#cache.get(key);
		if (entry?.isRevalidating) return;

		if (entry) {
			entry.isRevalidating = true;
			this.#notifySubscribers(key, entry);
		}

		this.#fetchAndCache(key, fetcher, options).catch(() => {
			/* error already handled in fetchAndCache */
		});
	}

	subscribe<T>(key: string, callback: Subscriber<T>): () => void {
		if (!this.#subscribers.has(key)) {
			this.#subscribers.set(key, new Set());
		}
		this.#subscribers.get(key)!.add(callback as Subscriber<unknown>);

		const entry = this.get<T>(key);
		if (entry) {
			callback(entry);
		}

		return () => {
			const subs = this.#subscribers.get(key);
			if (subs) {
				subs.delete(callback as Subscriber<unknown>);
				if (subs.size === 0) {
					this.#subscribers.delete(key);
				}
			}
		};
	}

	#notifySubscribers<T>(key: string, entry: CacheEntry<T> | null): void {
		const subs = this.#subscribers.get(key);
		if (!subs) return;

		for (const callback of subs) {
			try {
				callback(entry);
			} catch (err) {
				console.error(`SWR subscriber error for key "${key}":`, err);
			}
		}
	}

	invalidate(key: string): void {
		const entry = this.#cache.get(key);
		if (entry) {
			entry.staleAt = 0;
			this.#notifySubscribers(key, entry);
		}

		this.#triggerInvalidationCallbacks([key]);
		this.#invalidateDependents(key);
	}

	invalidatePattern(pattern: RegExp): string[] {
		const invalidated: string[] = [];

		for (const key of this.#cache.keys()) {
			if (pattern.test(key)) {
				this.invalidate(key);
				invalidated.push(key);
			}
		}

		return invalidated;
	}

	invalidateAll(): void {
		const keys = Array.from(this.#cache.keys());
		for (const key of keys) {
			const entry = this.#cache.get(key);
			if (entry) {
				entry.staleAt = 0;
				this.#notifySubscribers(key, entry);
			}
		}
		this.#triggerInvalidationCallbacks(keys);
	}

	addDependency(key: string, dependsOn: string): void {
		if (!this.#keyDependencies.has(dependsOn)) {
			this.#keyDependencies.set(dependsOn, new Set());
		}
		this.#keyDependencies.get(dependsOn)!.add(key);
	}

	removeDependency(key: string, dependsOn: string): void {
		const deps = this.#keyDependencies.get(dependsOn);
		if (deps) {
			deps.delete(key);
			if (deps.size === 0) {
				this.#keyDependencies.delete(dependsOn);
			}
		}
	}

	#invalidateDependents(key: string): void {
		const dependents = this.#keyDependencies.get(key);
		if (!dependents) return;

		for (const dependentKey of dependents) {
			this.invalidate(dependentKey);
		}
	}

	onInvalidate(callback: InvalidationCallback): () => void {
		this.#invalidationCallbacks.push(callback);
		return () => {
			const idx = this.#invalidationCallbacks.indexOf(callback);
			if (idx > -1) {
				this.#invalidationCallbacks.splice(idx, 1);
			}
		};
	}

	#triggerInvalidationCallbacks(keys: string[]): void {
		for (const callback of this.#invalidationCallbacks) {
			try {
				callback(keys);
			} catch (err) {
				console.error('SWR invalidation callback error:', err);
			}
		}
	}

	#enforceMaxEntries(): void {
		if (this.#cache.size < this.#config.maxEntries) return;

		const entries = Array.from(this.#cache.entries());
		entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

		const toRemove = entries.slice(0, entries.length - this.#config.maxEntries + 1);
		for (const [key, entry] of toRemove) {
			this.#cache.delete(key);
			this.#config.onEvict?.(key, entry);
		}
	}

	#cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.#cache) {
			if (now > entry.expiresAt) {
				this.#cache.delete(key);
				this.#config.onEvict?.(key, entry);
			}
		}
	}

	clear(): void {
		const keys = Array.from(this.#cache.keys());
		this.#cache.clear();
		for (const key of keys) {
			this.#notifySubscribers(key, null);
		}
	}

	size(): number {
		return this.#cache.size;
	}

	keys(): string[] {
		return Array.from(this.#cache.keys());
	}

	stats(): {
		size: number;
		staleCount: number;
		pendingCount: number;
		hitRate: number;
	} {
		let staleCount = 0;
		for (const entry of this.#cache.values()) {
			if (this.#isStale(entry)) staleCount++;
		}

		return {
			size: this.#cache.size,
			staleCount,
			pendingCount: this.#pendingFetches.size,
			hitRate: 0
		};
	}

	destroy(): void {
		if (this.#cleanupInterval) {
			clearInterval(this.#cleanupInterval);
			this.#cleanupInterval = null;
		}

		if (browser) {
			if (this.#focusListener) {
				window.removeEventListener('focus', this.#focusListener);
			}
			if (this.#reconnectListener) {
				window.removeEventListener('online', this.#reconnectListener);
			}
		}

		this.#cache.clear();
		this.#subscribers.clear();
		this.#pendingFetches.clear();
		this.#invalidationCallbacks = [];
		this.#keyDependencies.clear();
	}
}

export const swrCache = new SWRCache();

export function createSWRCache(config: Partial<CacheConfig> = {}): SWRCache {
	return new SWRCache(config);
}

export const CACHE_KEYS = {
	WORK: 'work',
	WORK_ITEM: (id: string) => `work:${id}`,
	CONVOYS: 'convoys',
	CONVOY: (id: string) => `convoy:${id}`,
	AGENTS: 'agents',
	AGENT: (id: string) => `agent:${id}`,
	MAIL: 'mail',
	MAIL_ITEM: (id: string) => `mail:${id}`,
	OPERATIONS: 'operations'
} as const;

export const CACHE_TTLS = {
	REALTIME: { staleTime: 2000, cacheTime: 30000 },
	FAST: { staleTime: 5000, cacheTime: 60000 },
	MEDIUM: { staleTime: 15000, cacheTime: 300000 },
	SLOW: { staleTime: 60000, cacheTime: 600000 }
} as const;

swrCache.addDependency(CACHE_KEYS.CONVOYS, CACHE_KEYS.WORK);
