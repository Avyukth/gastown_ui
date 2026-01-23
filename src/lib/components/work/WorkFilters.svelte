<script lang="ts">
	import { cn } from '$lib/utils';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import { workFiltersVariants } from './variants';
	import type { WorkFiltersState, FilterType, FilterPriority, FilterStatus, SortBy, SortOrder } from './types';

	interface Props {
		filters: WorkFiltersState;
		sortBy: SortBy;
		sortOrder: SortOrder;
		class?: string;
		onfilterchange?: (key: keyof WorkFiltersState, value: WorkFiltersState[keyof WorkFiltersState]) => void;
		onsortchange?: (sortBy: SortBy) => void;
		onsortorderchange?: () => void;
	}

	let {
		filters,
		sortBy,
		sortOrder,
		class: className = '',
		onfilterchange,
		onsortchange,
		onsortorderchange
	}: Props = $props();

	const styles = workFiltersVariants();

	const typeChips: Array<{ label: string; value: FilterType }> = [
		{ label: 'All', value: 'all' },
		{ label: 'Tasks', value: 'task' },
		{ label: 'Bugs', value: 'bug' },
		{ label: 'Features', value: 'feature' },
		{ label: 'Epics', value: 'epic' }
	];

	const priorityChips: Array<{ label: string; value: FilterPriority }> = [
		{ label: 'All', value: 'all' },
		{ label: 'P0', value: 0 },
		{ label: 'P1', value: 1 },
		{ label: 'P2', value: 2 },
		{ label: 'P3', value: 3 }
	];

	const statusChips: Array<{ label: string; value: FilterStatus }> = [
		{ label: 'All', value: 'all' },
		{ label: 'Open', value: 'open' },
		{ label: 'In Progress', value: 'in_progress' },
		{ label: 'Done', value: 'done' }
	];

	function handleFilterChange(key: keyof WorkFiltersState, value: WorkFiltersState[keyof WorkFiltersState]) {
		onfilterchange?.(key, value);
	}

	function handleSortChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value as SortBy;
		onsortchange?.(value);
	}
</script>

<div class={cn(styles.container(), className)}>
	<!-- Type filter chips -->
	<div class={styles.section()}>
		<span class={styles.label()}>Type</span>
		<div class={styles.chipGroup()}>
			{#each typeChips as chip}
				<button
					type="button"
					class={cn(
						styles.chip(),
						filters.type === chip.value
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground hover:bg-muted/80'
					)}
					onclick={() => handleFilterChange('type', chip.value)}
					aria-pressed={filters.type === chip.value}
				>
					{chip.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Priority filter chips -->
	<div class={styles.section()}>
		<span class={styles.label()}>Priority</span>
		<div class={styles.chipGroup()}>
			{#each priorityChips as chip}
				<button
					type="button"
					class={cn(
						styles.chip(),
						filters.priority === chip.value
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground hover:bg-muted/80'
					)}
					onclick={() => handleFilterChange('priority', chip.value)}
					aria-pressed={filters.priority === chip.value}
				>
					{chip.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Status filter chips -->
	<div class={styles.section()}>
		<span class={styles.label()}>Status</span>
		<div class={styles.chipGroup()}>
			{#each statusChips as chip}
				<button
					type="button"
					class={cn(
						styles.chip(),
						filters.status === chip.value
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground hover:bg-muted/80'
					)}
					onclick={() => handleFilterChange('status', chip.value)}
					aria-pressed={filters.status === chip.value}
				>
					{chip.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Sort controls -->
	<div class={styles.sortContainer()}>
		<div class="flex items-center gap-2">
			<span class={styles.sortLabel()}>Sort by:</span>
			<select
				value={sortBy}
				onchange={handleSortChange}
				class={styles.sortSelect()}
			>
				<option value="id">ID</option>
				<option value="priority">Priority</option>
				<option value="type">Type</option>
				<option value="updated">Updated</option>
			</select>
		</div>
		<button
			type="button"
			onclick={onsortorderchange}
			class={styles.sortButton()}
			aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
		>
			{#if sortOrder === 'asc'}
				<ChevronUp class="w-4 h-4" />
				Asc
			{:else}
				<ChevronDown class="w-4 h-4" />
				Desc
			{/if}
		</button>
	</div>
</div>
