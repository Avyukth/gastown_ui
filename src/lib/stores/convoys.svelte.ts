/**
 * Convoys Store - Reactive store for convoy management
 *
 * Uses Svelte 5 runes with SWR caching.
 * Convoys group related work items and track their progress.
 */

import { swrCache, CACHE_KEYS, CACHE_TTLS } from './swr';
import { apiClient } from '$lib/api/client';
import type { ApiResponse } from '$lib/api/types';

const browser = typeof window !== 'undefined';

export type ConvoyStatus = 'active' | 'stale' | 'stuck' | 'complete';

export interface Convoy {
	id: string;
	name: string;
	description?: string;
	status: ConvoyStatus;
	progress: number;
	workItems: string[];
	createdAt: string;
	updatedAt: string;
	completedAt?: string;
	owner?: string;
	tags: string[];
}

export interface ConvoyFilter {
	status?: ConvoyStatus | ConvoyStatus[];
	owner?: string;
	search?: string;
}

interface ConvoysStoreState {
	items: Convoy[];
	isLoading: boolean;
	isValidating: boolean;
	error: Error | null;
	lastFetchedAt: number | null;
	filter: ConvoyFilter;
}

class ConvoysStore {
	#state = $state<ConvoysStoreState>({
		items: [],
		isLoading: false,
		isValidating: false,
		error: null,
		lastFetchedAt: null,
		filter: {}
	});

	#unsubscribers: (() => void)[] = [];
	#initialized = false;

	constructor() {
		if (browser) {
			this.#init();
		}
	}

	#init() {
		if (this.#initialized) return;
		this.#initialized = true;

		this.#unsubscribers.push(
			swrCache.subscribe<Convoy[]>(CACHE_KEYS.CONVOYS, (entry) => {
				if (entry) {
					this.#state.items = entry.data;
					this.#state.isValidating = entry.isRevalidating;
					this.#state.error = entry.error;
					this.#state.lastFetchedAt = entry.timestamp;
					this.#state.isLoading = false;
				}
			})
		);
	}

	get items(): Convoy[] {
		return this.#state.items;
	}

	get isLoading(): boolean {
		return this.#state.isLoading;
	}

	get isValidating(): boolean {
		return this.#state.isValidating;
	}

	get error(): Error | null {
		return this.#state.error;
	}

	get lastFetchedAt(): number | null {
		return this.#state.lastFetchedAt;
	}

	get filter(): ConvoyFilter {
		return this.#state.filter;
	}

	get filteredItems(): Convoy[] {
		return this.#applyFilter(this.#state.items, this.#state.filter);
	}

	get activeConvoys(): Convoy[] {
		return this.#state.items.filter((c) => c.status === 'active');
	}

	get staleConvoys(): Convoy[] {
		return this.#state.items.filter((c) => c.status === 'stale');
	}

	get stuckConvoys(): Convoy[] {
		return this.#state.items.filter((c) => c.status === 'stuck');
	}

	get completeConvoys(): Convoy[] {
		return this.#state.items.filter((c) => c.status === 'complete');
	}

	get byStatus(): Record<ConvoyStatus, Convoy[]> {
		return {
			active: this.activeConvoys,
			stale: this.staleConvoys,
			stuck: this.stuckConvoys,
			complete: this.completeConvoys
		};
	}

	async fetch(): Promise<Convoy[]> {
		if (!this.#state.lastFetchedAt) {
			this.#state.isLoading = true;
		}

		try {
			const items = await swrCache.swr<Convoy[]>({
				key: CACHE_KEYS.CONVOYS,
				fetcher: async () => {
					const response: ApiResponse<Convoy[]> = await apiClient.get('/api/gastown/convoys');
					return response.data;
				},
				...CACHE_TTLS.FAST
			});

			return items;
		} catch (err) {
			this.#state.error = err instanceof Error ? err : new Error(String(err));
			throw err;
		} finally {
			this.#state.isLoading = false;
		}
	}

	async fetchConvoy(id: string): Promise<Convoy | null> {
		const cacheKey = CACHE_KEYS.CONVOY(id);

		try {
			const convoy = await swrCache.swr<Convoy>({
				key: cacheKey,
				fetcher: async () => {
					const response: ApiResponse<Convoy> = await apiClient.get(`/api/gastown/convoys/${id}`);
					return response.data;
				},
				...CACHE_TTLS.FAST
			});

			return convoy;
		} catch {
			return null;
		}
	}

	getConvoy(id: string): Convoy | undefined {
		return this.#state.items.find((c) => c.id === id);
	}

	setFilter(filter: ConvoyFilter): void {
		this.#state.filter = filter;
	}

	clearFilter(): void {
		this.#state.filter = {};
	}

	#applyFilter(items: Convoy[], filter: ConvoyFilter): Convoy[] {
		let result = items;

		if (filter.status) {
			const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
			result = result.filter((c) => statuses.includes(c.status));
		}

		if (filter.owner) {
			result = result.filter((c) => c.owner === filter.owner);
		}

		if (filter.search) {
			const search = filter.search.toLowerCase();
			result = result.filter(
				(c) =>
					c.name.toLowerCase().includes(search) ||
					c.id.toLowerCase().includes(search) ||
					c.description?.toLowerCase().includes(search)
			);
		}

		return result;
	}

	invalidate(): void {
		swrCache.invalidate(CACHE_KEYS.CONVOYS);
	}

	invalidateConvoy(id: string): void {
		swrCache.invalidate(CACHE_KEYS.CONVOY(id));
	}

	optimisticUpdate(id: string, updates: Partial<Convoy>): void {
		const idx = this.#state.items.findIndex((c) => c.id === id);
		if (idx === -1) return;

		const updated = { ...this.#state.items[idx], ...updates };
		this.#state.items = [
			...this.#state.items.slice(0, idx),
			updated,
			...this.#state.items.slice(idx + 1)
		];

		swrCache.set(CACHE_KEYS.CONVOYS, this.#state.items, CACHE_TTLS.FAST);
	}

	optimisticAdd(convoy: Convoy): void {
		this.#state.items = [convoy, ...this.#state.items];
		swrCache.set(CACHE_KEYS.CONVOYS, this.#state.items, CACHE_TTLS.FAST);
	}

	optimisticRemove(id: string): void {
		this.#state.items = this.#state.items.filter((c) => c.id !== id);
		swrCache.set(CACHE_KEYS.CONVOYS, this.#state.items, CACHE_TTLS.FAST);
	}

	destroy(): void {
		for (const unsubscribe of this.#unsubscribers) {
			unsubscribe();
		}
		this.#unsubscribers = [];
		this.#initialized = false;
	}
}

export const convoysStore = new ConvoysStore();

export function useConvoys() {
	return {
		get items() {
			return convoysStore.items;
		},
		get filteredItems() {
			return convoysStore.filteredItems;
		},
		get isLoading() {
			return convoysStore.isLoading;
		},
		get isValidating() {
			return convoysStore.isValidating;
		},
		get error() {
			return convoysStore.error;
		},
		get byStatus() {
			return convoysStore.byStatus;
		},
		fetch: () => convoysStore.fetch(),
		getConvoy: (id: string) => convoysStore.getConvoy(id),
		setFilter: (filter: ConvoyFilter) => convoysStore.setFilter(filter),
		clearFilter: () => convoysStore.clearFilter(),
		invalidate: () => convoysStore.invalidate()
	};
}
