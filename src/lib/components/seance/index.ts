/**
 * Seance components module
 *
 * Split from the monolithic seance/+page.svelte (~773 LOC) into:
 * - SeanceControls: Header with search bar and filter controls (~210 LOC)
 * - SeanceOutput: Expanded session detail with transcript viewer (~260 LOC)
 * - SeanceHistory: Session list grouped by date (~270 LOC)
 */
export { default as SeanceControls } from './SeanceControls.svelte';
export { default as SeanceOutput } from './SeanceOutput.svelte';
export { default as SeanceHistory } from './SeanceHistory.svelte';

export * from './types';
