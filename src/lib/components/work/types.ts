/**
 * Work Components Types
 *
 * Shared type definitions for work components.
 */

export type FilterType = 'all' | 'task' | 'bug' | 'feature' | 'epic';
export type FilterPriority = 'all' | 0 | 1 | 2 | 3 | 4;
export type FilterStatus = 'all' | 'open' | 'in_progress' | 'done';
export type SortBy = 'id' | 'priority' | 'type' | 'updated';
export type SortOrder = 'asc' | 'desc';

export interface WorkFiltersState {
	type: FilterType;
	priority: FilterPriority;
	status: FilterStatus;
}

export interface LocalIssue {
	id: string;
	title: string;
	type: string;
}

export interface Rig {
	name: string;
}

export interface IssueTypeOption {
	value: string;
	label: string;
	description: string;
	icon: typeof import('lucide-svelte').CheckSquare;
}
