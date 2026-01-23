<script lang="ts">
	import { StatusIndicator, ProgressBar, Skeleton, EmptyState, ErrorState } from '$lib/components';
	import type { TabId, MoleculesResponse, Formula, StaleMolecule } from './types';

	interface Props {
		activeTab: TabId;
		loadingFormulas: boolean;
		loadingMolecules: boolean;
		formulas: Formula[];
		molecules: MoleculesResponse | null;
		error: string | null;
		onFormulaSelect: (name: string) => void;
	}

	let {
		activeTab,
		loadingFormulas,
		loadingMolecules,
		formulas,
		molecules,
		error,
		onFormulaSelect
	}: Props = $props();

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
				return 'bg-info/20 text-info';
			case 'convoy':
				return 'bg-accent/20 text-accent';
			case 'aspect':
				return 'bg-warning/20 text-warning';
			case 'expansion':
				return 'bg-success/20 text-success';
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

<!-- Molecules Tab Content -->
{#if activeTab === 'molecules'}
	<!-- Stale molecules section (if any) -->
	{#if molecules?.stale.stale_molecules && molecules.stale.stale_molecules.length > 0}
		<section class="space-y-4">
			<h2 class="text-lg font-medium text-warning flex items-center gap-2">
				<StatusIndicator status="warning" size="sm" />
				Stale Molecules
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each molecules.stale.stale_molecules as molecule}
					<div class="panel-glass p-4 rounded-lg border-l-4 border-warning/50">
						<div class="flex items-start justify-between gap-2">
							<div>
								<code class="text-xs text-muted-foreground">{molecule.id}</code>
								<h3 class="font-medium text-foreground">{molecule.title}</h3>
							</div>
							<span class="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning">
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

	<!-- Empty state -->
	{#if !loadingMolecules && !molecules?.active?.length && !molecules?.wisps?.length && !molecules?.stale?.stale_molecules?.length}
		<div class="panel-glass p-8 rounded-lg text-center">
			<p class="text-muted-foreground">No active molecules or wisps</p>
			<p class="text-sm text-muted-foreground mt-2">
				Use the Formulas tab to create new molecules from templates
			</p>
		</div>
	{/if}
{/if}

<!-- Formulas Tab Content -->
{#if activeTab === 'formulas'}
	<section class="space-y-4">
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
			<div class="max-w-md mx-auto">
				<ErrorState
					title="Failed to load workflows"
					message={error}
					showRetryButton={false}
					compact={false}
				/>
			</div>
		{:else if formulas.length === 0}
			<div class="max-w-md mx-auto">
				<EmptyState
					title="No workflows yet"
					description="Create your first workflow by adding formulas to .beads/formulas/"
					size="default"
				/>
			</div>
		{:else}
			{#each Object.entries(formulasByType()) as [type, typeFormulas]}
				<div class="space-y-3">
					<h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						{type}s ({typeFormulas.length})
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each typeFormulas as formula}
							<button
								type="button"
								onclick={() => onFormulaSelect(formula.name)}
								class="panel-glass p-4 rounded-lg hover:border-primary/30 transition-colors text-left cursor-pointer"
							>
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
							</button>
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</section>
{/if}
