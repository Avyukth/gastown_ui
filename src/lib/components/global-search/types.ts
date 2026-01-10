/**
 * Type definitions for the Global Search component
 */
import type { ComponentType } from 'svelte';

export type FilterType = 'all' | 'agent' | 'issue' | 'convoy' | 'route';

export interface SearchResult {
	type: 'agent' | 'issue' | 'convoy' | 'route' | 'command' | 'recent';
	id: string;
	label: string;
	sublabel?: string;
	icon?: ComponentType;
	action: () => void;
}

export interface RouteItem {
	path: string;
	label: string;
	icon: ComponentType;
}

export interface CommandItem {
	id: string;
	label: string;
	description: string;
	action: () => void;
}

export interface AgentItem {
	id: string;
	name: string;
	status: string;
	task: string;
}

export interface IssueItem {
	id: string;
	title: string;
	type: string;
	priority: number;
}

export interface ConvoyItem {
	id: string;
	name: string;
	status: string;
	progress: number;
}

export interface RecentItem {
	type: string;
	id: string;
	label: string;
	path: string;
}

export interface SearchSuggestion {
	query: string;
	description: string;
}

export interface FilterOption {
	label: string;
	value: FilterType;
}
