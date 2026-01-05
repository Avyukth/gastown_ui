<script lang="ts">
	import { DashboardLayout, StatusIndicator, ProgressBar, Skeleton } from '$lib/components';
	import { onMount } from 'svelte';

	interface Formula {
		name: string;
		type: string;
		description: string;
		source: string;
		steps: number;
		vars: number;
	}

	interface StaleMolecule {
		id: string;
		title: string;
		total_children: number;
		closed_children: number;
		blocking_count: number;
	}

	interface Wisp {
		id: string;
		title: string;
		formula: string;
		steps_complete: number;
		steps_total: number;
	}

	interface MoleculesResponse {
		stale: {
			stale_molecules: StaleMolecule[];
			total_count: number;
			blocking_count: number;
		};
		wisps: Wisp[];
		active: Array<{
			id: string;
			title: string;
			type: string;
			status: string;
			priority: number;
		}>;
	}

	let formulas = $state<Formula[]>([]);
	let molecules = $state<MoleculesResponse | null>(null);
	let loadingFormulas = $state(true);
	let loadingMolecules = $state(true);
	let error = $state<string | null>(null);

	async function fetchFormulas() {
		try {
			const res = await fetch('/api/gastown/workflows/formulas');
			if (!res.ok) throw new Error('Failed to fetch formulas');
			formulas = await res.json();
		} catch (e) {
			console.error('Error fetching formulas:', e);
			error = e instanceof Error ? e.message : 'Failed to fetch formulas';
		} finally {
			loadingFormulas = false;
		}
	}

	async function fetchMolecules() {
		try {
			const res = await fetch('/api/gastown/workflows/molecules');
			if (!res.ok) throw new Error('Failed to fetch molecules');
			molecules = await res.json();
		} catch (e) {
			console.error('Error fetching molecules:', e);
		} finally {
			loadingMolecules = false;
		}
	}

	onMount(() => {
		fetchFormulas();
		fetchMolecules();
	});

	// Group formulas by type
	const formulasByType = $derived(() => {
		const grouped: Record<string, Formula[]> = {};
		for (const formula of formulas) {
			if (!grouped[formula.type]) {
				grouped[formula.type] = [];
			}
			grouped[formula.type].push(formula);
		}
		return grouped;
	});

	// Get type badge color
	function getTypeColor(type: string): string {
		switch (type) {
			case 'workflow':
				return 'bg-blue-500/20 text-blue-400';
			case 'convoy':
				return 'bg-purple-500/20 text-purple-400';
			case 'aspect':
				return 'bg-amber-500/20 text-amber-400';
			case 'expansion':
				return 'bg-green-500/20 text-green-400';
			default:
				return 'bg-muted text-muted-foreground';
		}
	}

	// Calculate progress percentage
	function getProgress(molecule: StaleMolecule): number {
		if (molecule.total_children === 0) return 0;
		return Math.round((molecule.closed_children / molecule.total_children) * 100);
	}
</script>

<DashboardLayout title="Molecules" systemStatus="running">
	<svelte:fragment slot="stats">
		<!-- Stats cards -->
		<div class="panel-glass p-4 rounded-lg">
			<div class="text-sm text-muted-foreground">Formulas</div>
			<div class="text-2xl font-semibold text-foreground mt-1">
				{loadingFormulas ? '...' : formulas.length}
			</div>
		</div>
		<div class="panel-glass p-4 rounded-lg">
			<div class="text-sm text-muted-foreground">Active Molecules</div>
			<div class="text-2xl font-semibold text-foreground mt-1">
				{loadingMolecules ? '...' : (molecules?.active.length ?? 0)}
			</div>
		</div>
		<div class="panel-glass p-4 rounded-lg">
			<div class="text-sm text-muted-foreground">Wisps</div>
			<div class="text-2xl font-semibold text-foreground mt-1">
				{loadingMolecules ? '...' : (molecules?.wisps.length ?? 0)}
			</div>
		</div>
		<div class="panel-glass p-4 rounded-lg">
			<div class="text-sm text-muted-foreground">Stale</div>
			<div class="text-2xl font-semibold text-amber-400 mt-1">
				{loadingMolecules ? '...' : (molecules?.stale.total_count ?? 0)}
			</div>
		</div>
	</svelte:fragment>

	<!-- Stale molecules section (if any) -->
	{#if molecules?.stale.stale_molecules && molecules.stale.stale_molecules.length > 0}
		<section class="space-y-4">
			<h2 class="text-lg font-medium text-amber-400 flex items-center gap-2">
				<StatusIndicator status="warning" size="sm" />
				Stale Molecules
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each molecules.stale.stale_molecules as molecule}
					<div class="panel-glass p-4 rounded-lg border-l-4 border-amber-500/50">
						<div class="flex items-start justify-between gap-2">
							<div>
								<code class="text-xs text-muted-foreground">{molecule.id}</code>
								<h3 class="font-medium text-foreground">{molecule.title}</h3>
							</div>
							<span class="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
								stale
							</span>
						</div>
						<div class="mt-3">
							<div class="flex items-center justify-between text-sm mb-1">
								<span class="text-muted-foreground">Progress</span>
								<span class="text-foreground">{getProgress(molecule)}%</span>
							</div>
							<ProgressBar value={getProgress(molecule)} size="sm" />
							<div class="text-xs text-muted-foreground mt-1">
								{molecule.closed_children}/{molecule.total_children} steps complete
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Active molecules section -->
	{#if molecules?.active && molecules.active.length > 0}
		<section class="space-y-4">
			<h2 class="text-lg font-medium text-foreground flex items-center gap-2">
				<StatusIndicator status="running" size="sm" />
				Active Molecules
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each molecules.active as molecule}
					<div class="panel-glass p-4 rounded-lg">
						<code class="text-xs text-muted-foreground">{molecule.id}</code>
						<h3 class="font-medium text-foreground">{molecule.title}</h3>
						<div class="flex items-center gap-2 mt-2">
							<StatusIndicator status="running" size="sm" />
							<span class="text-xs text-muted-foreground">{molecule.status}</span>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Wisps section -->
	{#if molecules?.wisps && molecules.wisps.length > 0}
		<section class="space-y-4">
			<h2 class="text-lg font-medium text-foreground flex items-center gap-2">
				<StatusIndicator status="idle" size="sm" />
				Wisps (Ephemeral)
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each molecules.wisps as wisp}
					<div class="panel-glass p-4 rounded-lg border-dashed border-border">
						<code class="text-xs text-muted-foreground">{wisp.id}</code>
						<h3 class="font-medium text-foreground">{wisp.title}</h3>
						<div class="text-xs text-muted-foreground mt-1">Formula: {wisp.formula}</div>
						<div class="mt-3">
							<ProgressBar
								value={wisp.steps_total > 0
									? Math.round((wisp.steps_complete / wisp.steps_total) * 100)
									: 0}
								size="sm"
							/>
							<div class="text-xs text-muted-foreground mt-1">
								{wisp.steps_complete}/{wisp.steps_total} steps
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Formula Library section -->
	<section class="space-y-4">
		<h2 class="text-lg font-medium text-foreground">Formula Library</h2>

		{#if loadingFormulas}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each Array(6) as _}
					<div class="panel-glass p-4 rounded-lg">
						<Skeleton class="h-4 w-24 mb-2" />
						<Skeleton class="h-5 w-48 mb-2" />
						<Skeleton class="h-16 w-full" />
					</div>
				{/each}
			</div>
		{:else if error}
			<div class="panel-glass p-4 rounded-lg border-l-4 border-red-500">
				<p class="text-red-400">{error}</p>
			</div>
		{:else if formulas.length === 0}
			<div class="panel-glass p-8 rounded-lg text-center">
				<p class="text-muted-foreground">No formulas found</p>
				<p class="text-sm text-muted-foreground mt-2">
					Add formulas to <code class="text-primary">.beads/formulas/</code>
				</p>
			</div>
		{:else}
			{#each Object.entries(formulasByType()) as [type, typeFormulas]}
				<div class="space-y-3">
					<h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						{type}s ({typeFormulas.length})
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each typeFormulas as formula}
							<div class="panel-glass p-4 rounded-lg hover:border-primary/30 transition-colors">
								<div class="flex items-start justify-between gap-2">
									<h4 class="font-medium text-foreground">{formula.name}</h4>
									<span class={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(formula.type)}`}>
										{formula.type}
									</span>
								</div>
								<p class="text-sm text-muted-foreground mt-2 line-clamp-2">
									{formula.description}
								</p>
								<div class="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
									{#if formula.steps > 0}
										<span>{formula.steps} steps</span>
									{/if}
									{#if formula.vars > 0}
										<span>{formula.vars} vars</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</section>
</DashboardLayout>
