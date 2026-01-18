/**
 * Agents Store - Reactive store for agent (polecat) management
 *
 * Uses Svelte 5 runes with SWR caching.
 * Tracks agent status, assignments, and activity.
 */

import { swrCache, CACHE_KEYS, CACHE_TTLS } from './swr';
import { apiClient } from '$lib/api/client';
import type { ApiResponse } from '$lib/api/types';

const browser = typeof window !== 'undefined';

export type AgentStatus = 'idle' | 'working' | 'blocked' | 'error' | 'offline';

export interface Agent {
	id: string;
	name: string;
	status: AgentStatus;
	currentWork?: string;
	branch?: string;
	lastActivity?: string;
	progress?: number;
	error?: string;
	metadata?: Record<string, unknown>;
}

export interface AgentFilter {
	status?: AgentStatus | AgentStatus[];
	search?: string;
}

interface AgentsStoreState {
	items: Agent[];
	isLoading: boolean;
	isValidating: boolean;
	error: Error | null;
	lastFetchedAt: number | null;
	filter: AgentFilter;
}

class AgentsStore {
	#state = $state<AgentsStoreState>({
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
			swrCache.subscribe<Agent[]>(CACHE_KEYS.AGENTS, (entry) => {
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

	get items(): Agent[] {
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

	get filter(): AgentFilter {
		return this.#state.filter;
	}

	get filteredItems(): Agent[] {
		return this.#applyFilter(this.#state.items, this.#state.filter);
	}

	get idleAgents(): Agent[] {
		return this.#state.items.filter((a) => a.status === 'idle');
	}

	get workingAgents(): Agent[] {
		return this.#state.items.filter((a) => a.status === 'working');
	}

	get blockedAgents(): Agent[] {
		return this.#state.items.filter((a) => a.status === 'blocked');
	}

	get errorAgents(): Agent[] {
		return this.#state.items.filter((a) => a.status === 'error');
	}

	get offlineAgents(): Agent[] {
		return this.#state.items.filter((a) => a.status === 'offline');
	}

	get activeCount(): number {
		return this.workingAgents.length;
	}

	get totalCount(): number {
		return this.#state.items.length;
	}

	get byStatus(): Record<AgentStatus, Agent[]> {
		return {
			idle: this.idleAgents,
			working: this.workingAgents,
			blocked: this.blockedAgents,
			error: this.errorAgents,
			offline: this.offlineAgents
		};
	}

	async fetch(): Promise<Agent[]> {
		if (!this.#state.lastFetchedAt) {
			this.#state.isLoading = true;
		}

		try {
			const items = await swrCache.swr<Agent[]>({
				key: CACHE_KEYS.AGENTS,
				fetcher: async () => {
					const response: ApiResponse<Agent[]> = await apiClient.get('/api/gastown/agents');
					return response.data;
				},
				...CACHE_TTLS.REALTIME
			});

			return items;
		} catch (err) {
			this.#state.error = err instanceof Error ? err : new Error(String(err));
			throw err;
		} finally {
			this.#state.isLoading = false;
		}
	}

	async fetchAgent(id: string): Promise<Agent | null> {
		const cacheKey = CACHE_KEYS.AGENT(id);

		try {
			const agent = await swrCache.swr<Agent>({
				key: cacheKey,
				fetcher: async () => {
					const response: ApiResponse<Agent> = await apiClient.get(`/api/gastown/agents/${id}`);
					return response.data;
				},
				...CACHE_TTLS.REALTIME
			});

			return agent;
		} catch {
			return null;
		}
	}

	getAgent(id: string): Agent | undefined {
		return this.#state.items.find((a) => a.id === id);
	}

	getAgentByName(name: string): Agent | undefined {
		return this.#state.items.find((a) => a.name === name);
	}

	setFilter(filter: AgentFilter): void {
		this.#state.filter = filter;
	}

	clearFilter(): void {
		this.#state.filter = {};
	}

	#applyFilter(items: Agent[], filter: AgentFilter): Agent[] {
		let result = items;

		if (filter.status) {
			const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
			result = result.filter((a) => statuses.includes(a.status));
		}

		if (filter.search) {
			const search = filter.search.toLowerCase();
			result = result.filter(
				(a) =>
					a.name.toLowerCase().includes(search) ||
					a.id.toLowerCase().includes(search) ||
					a.currentWork?.toLowerCase().includes(search)
			);
		}

		return result;
	}

	invalidate(): void {
		swrCache.invalidate(CACHE_KEYS.AGENTS);
	}

	invalidateAgent(id: string): void {
		swrCache.invalidate(CACHE_KEYS.AGENT(id));
	}

	updateAgentStatus(id: string, status: AgentStatus, details?: Partial<Agent>): void {
		const idx = this.#state.items.findIndex((a) => a.id === id);
		if (idx === -1) return;

		const updated = { ...this.#state.items[idx], status, ...details };
		this.#state.items = [
			...this.#state.items.slice(0, idx),
			updated,
			...this.#state.items.slice(idx + 1)
		];

		swrCache.set(CACHE_KEYS.AGENTS, this.#state.items, CACHE_TTLS.REALTIME);
	}

	destroy(): void {
		for (const unsubscribe of this.#unsubscribers) {
			unsubscribe();
		}
		this.#unsubscribers = [];
		this.#initialized = false;
	}
}

export const agentsStore = new AgentsStore();

export function useAgents() {
	return {
		get items() {
			return agentsStore.items;
		},
		get filteredItems() {
			return agentsStore.filteredItems;
		},
		get isLoading() {
			return agentsStore.isLoading;
		},
		get isValidating() {
			return agentsStore.isValidating;
		},
		get error() {
			return agentsStore.error;
		},
		get byStatus() {
			return agentsStore.byStatus;
		},
		get activeCount() {
			return agentsStore.activeCount;
		},
		get totalCount() {
			return agentsStore.totalCount;
		},
		fetch: () => agentsStore.fetch(),
		getAgent: (id: string) => agentsStore.getAgent(id),
		setFilter: (filter: AgentFilter) => agentsStore.setFilter(filter),
		clearFilter: () => agentsStore.clearFilter(),
		invalidate: () => agentsStore.invalidate()
	};
}
