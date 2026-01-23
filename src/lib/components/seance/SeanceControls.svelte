<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';
	import { RefreshCw } from 'lucide-svelte';
	import type { SeanceFilters } from './types';

	// Props
	let {
		sessionCount,
		agents,
		rigs,
		statuses,
		filters,
		onFiltersChange
	}: {
		sessionCount: number;
		agents: string[];
		rigs: string[];
		statuses: string[];
		filters: SeanceFilters;
		onFiltersChange?: (filters: SeanceFilters) => void;
	} = $props();

	// Local filter state synced from props
	let selectedAgent = $state(filters.agent);
	let selectedRig = $state(filters.rig);
	let selectedStatus = $state(filters.status);
	let searchQuery = $state(filters.search);
	let dateFrom = $state(filters.dateFrom);
	let dateTo = $state(filters.dateTo);

	// Icon SVGs
	const icons = {
		ghost: '<path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>',
		search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
		x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
	};

	function applyFilters() {
		const params = new URLSearchParams();
		if (selectedAgent) params.set('agent', selectedAgent);
		if (selectedRig) params.set('rig', selectedRig);
		if (selectedStatus) params.set('status', selectedStatus);
		if (searchQuery) params.set('q', searchQuery);
		if (dateFrom) params.set('from', dateFrom);
		if (dateTo) params.set('to', dateTo);
		const queryString = params.toString();
		goto(`/seance${queryString ? `?${queryString}` : ''}`, { replaceState: true });
		onFiltersChange?.({
			agent: selectedAgent,
			rig: selectedRig,
			status: selectedStatus,
			search: searchQuery,
			dateFrom,
			dateTo
		});
	}

	function clearFilters() {
		selectedAgent = '';
		selectedRig = '';
		selectedStatus = '';
		searchQuery = '';
		dateFrom = '';
		dateTo = '';
		goto('/seance', { replaceState: true });
		onFiltersChange?.({
			agent: '',
			rig: '',
			status: '',
			search: '',
			dateFrom: '',
			dateTo: ''
		});
	}

	// Sync with external filter changes
	$effect(() => {
		selectedAgent = filters.agent;
		selectedRig = filters.rig;
		selectedStatus = filters.status;
		searchQuery = filters.search;
		dateFrom = filters.dateFrom;
		dateTo = filters.dateTo;
	});

	const hasFilters = $derived(
		selectedAgent || selectedRig || selectedStatus || searchQuery || dateFrom || dateTo
	);
</script>

<!-- Header -->
<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
	<div class="container space-y-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<svg
					class="w-6 h-6 text-accent"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					{@html icons.ghost}
				</svg>
				<h1 class="text-xl font-semibold text-foreground">Seance</h1>
				<span class="text-xs text-muted-foreground">
					{sessionCount} sessions
				</span>
			</div>

			<button
				onclick={() => invalidateAll()}
				class="p-2 text-muted-foreground hover:text-foreground transition-colors"
				title="Refresh"
			>
				<RefreshCw class="w-4 h-4" />
			</button>
		</div>

		<!-- Search bar -->
		<div class="relative">
			<svg
				class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				{@html icons.search}
			</svg>
			<input
				type="text"
				placeholder="Search sessions..."
				bind:value={searchQuery}
				onkeydown={(e) => e.key === 'Enter' && applyFilters()}
				class="w-full pl-10 pr-4 py-2 text-sm bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
			/>
		</div>

		<!-- Filters -->
		<div class="flex flex-wrap items-center gap-3">
			<!-- Agent filter -->
			<select
				bind:value={selectedAgent}
				onchange={applyFilters}
				class="px-3 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground"
			>
				<option value="">All agents</option>
				{#each agents as agent}
					<option value={agent}>{agent}</option>
				{/each}
			</select>

			<!-- Rig filter -->
			<select
				bind:value={selectedRig}
				onchange={applyFilters}
				class="px-3 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground"
			>
				<option value="">All rigs</option>
				{#each rigs as rig}
					<option value={rig}>{rig}</option>
				{/each}
			</select>

			<!-- Status filter -->
			<select
				bind:value={selectedStatus}
				onchange={applyFilters}
				class="px-3 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground"
			>
				<option value="">All statuses</option>
				{#each statuses as status}
					<option value={status}>{status}</option>
				{/each}
			</select>

			<!-- Date range -->
			<div class="flex items-center gap-2">
				<input
					type="date"
					bind:value={dateFrom}
					onchange={applyFilters}
					class="px-2 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground"
					placeholder="From"
				/>
				<span class="text-muted-foreground">-</span>
				<input
					type="date"
					bind:value={dateTo}
					onchange={applyFilters}
					class="px-2 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground"
					placeholder="To"
				/>
			</div>

			<!-- Clear filters -->
			{#if hasFilters}
				<button
					onclick={clearFilters}
					class="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
				>
					<svg
						class="w-3 h-3"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						{@html icons.x}
					</svg>
					Clear
				</button>
			{/if}
		</div>
	</div>
</header>
