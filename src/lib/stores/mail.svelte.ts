/**
 * Mail Store - Reactive store for mayor mail / notifications
 *
 * Uses Svelte 5 runes with SWR caching.
 * Handles notifications, alerts, and inter-agent communication.
 */

import { swrCache, CACHE_KEYS, CACHE_TTLS } from './swr';
import { apiClient } from '$lib/api/client';
import type { ApiResponse } from '$lib/api/types';

const browser = typeof window !== 'undefined';

export type MailPriority = 'low' | 'normal' | 'high' | 'urgent';
export type MailStatus = 'unread' | 'read' | 'archived' | 'actioned';
export type MailType = 'notification' | 'alert' | 'request' | 'update' | 'error';

export interface MailItem {
	id: string;
	type: MailType;
	subject: string;
	body: string;
	priority: MailPriority;
	status: MailStatus;
	from?: string;
	to?: string;
	relatedWork?: string;
	relatedAgent?: string;
	createdAt: string;
	readAt?: string;
	actionedAt?: string;
	metadata?: Record<string, unknown>;
}

export interface MailFilter {
	status?: MailStatus | MailStatus[];
	type?: MailType | MailType[];
	priority?: MailPriority | MailPriority[];
	from?: string;
	search?: string;
}

interface MailStoreState {
	items: MailItem[];
	isLoading: boolean;
	isValidating: boolean;
	error: Error | null;
	lastFetchedAt: number | null;
	filter: MailFilter;
}

class MailStore {
	#state = $state<MailStoreState>({
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
			swrCache.subscribe<MailItem[]>(CACHE_KEYS.MAIL, (entry) => {
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

	get items(): MailItem[] {
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

	get filter(): MailFilter {
		return this.#state.filter;
	}

	get filteredItems(): MailItem[] {
		return this.#applyFilter(this.#state.items, this.#state.filter);
	}

	get unreadItems(): MailItem[] {
		return this.#state.items.filter((m) => m.status === 'unread');
	}

	get unreadCount(): number {
		return this.unreadItems.length;
	}

	get urgentItems(): MailItem[] {
		return this.#state.items.filter((m) => m.priority === 'urgent' && m.status === 'unread');
	}

	get alerts(): MailItem[] {
		return this.#state.items.filter((m) => m.type === 'alert');
	}

	get errors(): MailItem[] {
		return this.#state.items.filter((m) => m.type === 'error');
	}

	get byType(): Record<MailType, MailItem[]> {
		return {
			notification: this.#state.items.filter((m) => m.type === 'notification'),
			alert: this.#state.items.filter((m) => m.type === 'alert'),
			request: this.#state.items.filter((m) => m.type === 'request'),
			update: this.#state.items.filter((m) => m.type === 'update'),
			error: this.#state.items.filter((m) => m.type === 'error')
		};
	}

	get byPriority(): Record<MailPriority, MailItem[]> {
		return {
			low: this.#state.items.filter((m) => m.priority === 'low'),
			normal: this.#state.items.filter((m) => m.priority === 'normal'),
			high: this.#state.items.filter((m) => m.priority === 'high'),
			urgent: this.#state.items.filter((m) => m.priority === 'urgent')
		};
	}

	async fetch(): Promise<MailItem[]> {
		if (!this.#state.lastFetchedAt) {
			this.#state.isLoading = true;
		}

		try {
			const items = await swrCache.swr<MailItem[]>({
				key: CACHE_KEYS.MAIL,
				fetcher: async () => {
					const response: ApiResponse<MailItem[]> = await apiClient.get('/api/gastown/mail');
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

	async fetchItem(id: string): Promise<MailItem | null> {
		const cacheKey = CACHE_KEYS.MAIL_ITEM(id);

		try {
			const item = await swrCache.swr<MailItem>({
				key: cacheKey,
				fetcher: async () => {
					const response: ApiResponse<MailItem> = await apiClient.get(`/api/gastown/mail/${id}`);
					return response.data;
				},
				...CACHE_TTLS.FAST
			});

			return item;
		} catch {
			return null;
		}
	}

	getItem(id: string): MailItem | undefined {
		return this.#state.items.find((m) => m.id === id);
	}

	setFilter(filter: MailFilter): void {
		this.#state.filter = filter;
	}

	clearFilter(): void {
		this.#state.filter = {};
	}

	#applyFilter(items: MailItem[], filter: MailFilter): MailItem[] {
		let result = items;

		if (filter.status) {
			const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
			result = result.filter((m) => statuses.includes(m.status));
		}

		if (filter.type) {
			const types = Array.isArray(filter.type) ? filter.type : [filter.type];
			result = result.filter((m) => types.includes(m.type));
		}

		if (filter.priority) {
			const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
			result = result.filter((m) => priorities.includes(m.priority));
		}

		if (filter.from) {
			result = result.filter((m) => m.from === filter.from);
		}

		if (filter.search) {
			const search = filter.search.toLowerCase();
			result = result.filter(
				(m) =>
					m.subject.toLowerCase().includes(search) ||
					m.body.toLowerCase().includes(search) ||
					m.from?.toLowerCase().includes(search)
			);
		}

		return result;
	}

	invalidate(): void {
		swrCache.invalidate(CACHE_KEYS.MAIL);
	}

	invalidateItem(id: string): void {
		swrCache.invalidate(CACHE_KEYS.MAIL_ITEM(id));
	}

	markAsRead(id: string): void {
		const idx = this.#state.items.findIndex((m) => m.id === id);
		if (idx === -1) return;

		const updated = {
			...this.#state.items[idx],
			status: 'read' as MailStatus,
			readAt: new Date().toISOString()
		};

		this.#state.items = [
			...this.#state.items.slice(0, idx),
			updated,
			...this.#state.items.slice(idx + 1)
		];

		swrCache.set(CACHE_KEYS.MAIL, this.#state.items, CACHE_TTLS.FAST);
	}

	markAllAsRead(): void {
		this.#state.items = this.#state.items.map((m) =>
			m.status === 'unread'
				? { ...m, status: 'read' as MailStatus, readAt: new Date().toISOString() }
				: m
		);

		swrCache.set(CACHE_KEYS.MAIL, this.#state.items, CACHE_TTLS.FAST);
	}

	archive(id: string): void {
		const idx = this.#state.items.findIndex((m) => m.id === id);
		if (idx === -1) return;

		const updated = { ...this.#state.items[idx], status: 'archived' as MailStatus };

		this.#state.items = [
			...this.#state.items.slice(0, idx),
			updated,
			...this.#state.items.slice(idx + 1)
		];

		swrCache.set(CACHE_KEYS.MAIL, this.#state.items, CACHE_TTLS.FAST);
	}

	optimisticAdd(item: MailItem): void {
		this.#state.items = [item, ...this.#state.items];
		swrCache.set(CACHE_KEYS.MAIL, this.#state.items, CACHE_TTLS.FAST);
	}

	optimisticRemove(id: string): void {
		this.#state.items = this.#state.items.filter((m) => m.id !== id);
		swrCache.set(CACHE_KEYS.MAIL, this.#state.items, CACHE_TTLS.FAST);
	}

	destroy(): void {
		for (const unsubscribe of this.#unsubscribers) {
			unsubscribe();
		}
		this.#unsubscribers = [];
		this.#initialized = false;
	}
}

export const mailStore = new MailStore();

export function useMail() {
	return {
		get items() {
			return mailStore.items;
		},
		get filteredItems() {
			return mailStore.filteredItems;
		},
		get isLoading() {
			return mailStore.isLoading;
		},
		get isValidating() {
			return mailStore.isValidating;
		},
		get error() {
			return mailStore.error;
		},
		get unreadCount() {
			return mailStore.unreadCount;
		},
		get urgentItems() {
			return mailStore.urgentItems;
		},
		get byType() {
			return mailStore.byType;
		},
		fetch: () => mailStore.fetch(),
		getItem: (id: string) => mailStore.getItem(id),
		setFilter: (filter: MailFilter) => mailStore.setFilter(filter),
		clearFilter: () => mailStore.clearFilter(),
		markAsRead: (id: string) => mailStore.markAsRead(id),
		markAllAsRead: () => mailStore.markAllAsRead(),
		archive: (id: string) => mailStore.archive(id),
		invalidate: () => mailStore.invalidate()
	};
}
