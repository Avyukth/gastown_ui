/**
 * Work Store - Reactive store for work items (beads/issues)
 *
 * Uses Svelte 5 runes with SWR caching for instant perceived performance.
 * Fetches from API and caches locally, revalidates in background.
 */

import { swrCache, CACHE_KEYS, CACHE_TTLS } from './swr';
import { apiClient } from '$lib/api/client';
import type { ApiResponse } from '$lib/api/types';

const browser = typeof window !== 'undefined';

export interface WorkItem {
	id: string;
	title: string;
	type: 'task' | 'bug' | 'feature' | 'epic';
	status: 'open' | 'in_progress' | 'review' | 'done' | 'blocked';
	priority: number;
	assignee?: string;
	parent?: string;
	labels: string[];
	createdAt: string;
	updatedAt: string;
	description?: string;
}

export interface WorkFilter {
	status?: WorkItem['status'] | WorkItem['status'][];
	type?: WorkItem['type'] | WorkItem['type'][];
	assignee?: string;
	parent?: string;
	search?: string;
}

interface WorkStoreState {
	items: WorkItem[];
	isLoading: boolean;
	isValidating: boolean;
	error: Error | null;
	lastFetchedAt: number | null;
	filter: WorkFilter;
}

class WorkStore {
	#state = $state<WorkStoreState>({
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
			swrCache.subscribe<WorkItem[]>(CACHE_KEYS.WORK, (entry) => {
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

	get items(): WorkItem[] {
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

	get filter(): WorkFilter {
		return this.#state.filter;
	}

	get filteredItems(): WorkItem[] {
		return this.#applyFilter(this.#state.items, this.#state.filter);
	}

	get openItems(): WorkItem[] {
		return this.#state.items.filter((item) => item.status === 'open');
	}

	get inProgressItems(): WorkItem[] {
		return this.#state.items.filter((item) => item.status === 'in_progress');
	}

	get blockedItems(): WorkItem[] {
		return this.#state.items.filter((item) => item.status === 'blocked');
	}

	get itemsByType(): Record<WorkItem['type'], WorkItem[]> {
		return {
			task: this.#state.items.filter((i) => i.type === 'task'),
			bug: this.#state.items.filter((i) => i.type === 'bug'),
			feature: this.#state.items.filter((i) => i.type === 'feature'),
			epic: this.#state.items.filter((i) => i.type === 'epic')
		};
	}

	async fetch(): Promise<WorkItem[]> {
		if (!this.#state.lastFetchedAt) {
			this.#state.isLoading = true;
		}

		try {
			const items = await swrCache.swr<WorkItem[]>({
				key: CACHE_KEYS.WORK,
				fetcher: async () => {
					const response: ApiResponse<WorkItem[]> = await apiClient.get('/api/gastown/work');
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

	async fetchItem(id: string): Promise<WorkItem | null> {
		const cacheKey = CACHE_KEYS.WORK_ITEM(id);

		try {
			const item = await swrCache.swr<WorkItem>({
				key: cacheKey,
				fetcher: async () => {
					const response: ApiResponse<WorkItem> = await apiClient.get(`/api/gastown/work/${id}`);
					return response.data;
				},
				...CACHE_TTLS.FAST
			});

			return item;
		} catch {
			return null;
		}
	}

	getItem(id: string): WorkItem | undefined {
		return this.#state.items.find((item) => item.id === id);
	}

	getItemsByParent(parentId: string): WorkItem[] {
		return this.#state.items.filter((item) => item.parent === parentId);
	}

	setFilter(filter: WorkFilter): void {
		this.#state.filter = filter;
	}

	clearFilter(): void {
		this.#state.filter = {};
	}

	#applyFilter(items: WorkItem[], filter: WorkFilter): WorkItem[] {
		let result = items;

		if (filter.status) {
			const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
			result = result.filter((item) => statuses.includes(item.status));
		}

		if (filter.type) {
			const types = Array.isArray(filter.type) ? filter.type : [filter.type];
			result = result.filter((item) => types.includes(item.type));
		}

		if (filter.assignee) {
			result = result.filter((item) => item.assignee === filter.assignee);
		}

		if (filter.parent) {
			result = result.filter((item) => item.parent === filter.parent);
		}

		if (filter.search) {
			const search = filter.search.toLowerCase();
			result = result.filter(
				(item) =>
					item.title.toLowerCase().includes(search) ||
					item.id.toLowerCase().includes(search) ||
					item.description?.toLowerCase().includes(search)
			);
		}

		return result;
	}

	invalidate(): void {
		swrCache.invalidate(CACHE_KEYS.WORK);
	}

	invalidateItem(id: string): void {
		swrCache.invalidate(CACHE_KEYS.WORK_ITEM(id));
	}

	optimisticUpdate(id: string, updates: Partial<WorkItem>): void {
		const idx = this.#state.items.findIndex((item) => item.id === id);
		if (idx === -1) return;

		const updated = { ...this.#state.items[idx], ...updates };
		this.#state.items = [
			...this.#state.items.slice(0, idx),
			updated,
			...this.#state.items.slice(idx + 1)
		];

		swrCache.set(CACHE_KEYS.WORK, this.#state.items, CACHE_TTLS.FAST);
	}

	optimisticAdd(item: WorkItem): void {
		this.#state.items = [item, ...this.#state.items];
		swrCache.set(CACHE_KEYS.WORK, this.#state.items, CACHE_TTLS.FAST);
	}

	optimisticRemove(id: string): void {
		this.#state.items = this.#state.items.filter((item) => item.id !== id);
		swrCache.set(CACHE_KEYS.WORK, this.#state.items, CACHE_TTLS.FAST);
	}

	destroy(): void {
		for (const unsubscribe of this.#unsubscribers) {
			unsubscribe();
		}
		this.#unsubscribers = [];
		this.#initialized = false;
	}
}

export const workStore = new WorkStore();

export function useWork() {
	return {
		get items() {
			return workStore.items;
		},
		get filteredItems() {
			return workStore.filteredItems;
		},
		get isLoading() {
			return workStore.isLoading;
		},
		get isValidating() {
			return workStore.isValidating;
		},
		get error() {
			return workStore.error;
		},
		fetch: () => workStore.fetch(),
		getItem: (id: string) => workStore.getItem(id),
		setFilter: (filter: WorkFilter) => workStore.setFilter(filter),
		clearFilter: () => workStore.clearFilter(),
		invalidate: () => workStore.invalidate()
	};
}
