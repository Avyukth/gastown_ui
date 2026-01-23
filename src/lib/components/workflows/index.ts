/**
 * Workflow components module
 *
 * Split from the monolithic workflows/+page.svelte (~699 LOC) into:
 * - WorkflowFilters: Tab navigation and stats cards (~100 LOC)
 * - WorkflowList: Molecules and formulas list rendering (~200 LOC)
 * - WorkflowDetail: Formula detail modal view (~220 LOC)
 */
export { default as WorkflowFilters } from './WorkflowFilters.svelte';
export { default as WorkflowList } from './WorkflowList.svelte';
export { default as WorkflowDetail } from './WorkflowDetail.svelte';

export * from './types';
