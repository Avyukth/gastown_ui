<script lang="ts">
	import { DashboardLayout, StatusIndicator, ProgressBar, Skeleton } from '$lib/components';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	import { X } from 'lucide-svelte';

	interface Formula {
		name: string;
		type: string;
		description: string;
		source: string;
		steps: number;
		vars: number;
	}

	interface FormulaDetail {
		name: string;
		type: string;
		description: string;
		phase: string;
		source: string;
		variables: Array<{
			name: string;
			default?: string;
			required: boolean;
			description?: string;
		}>;
		steps: Array<{
			id: string;
			title: string;
			type: string;
			depends_on?: string[];
		}>;
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

	// Tab state
	type TabId = 'molecules' | 'formulas';
	let activeTab = $state<TabId>('molecules');

	let formulas = $state<Formula[]>([]);
	let molecules = $state<MoleculesResponse | null>(null);
	let loadingFormulas = $state(true);
	let loadingMolecules = $state(true);
	let error = $state<string | null>(null);

	// Formula detail state
	let selectedFormula = $state<FormulaDetail | null>(null);
	let loadingDetail = $state(false);
	let detailError = $state<string | null>(null);

	// Cook/Pour state
	let cookLoading = $state(false);
	let pourLoading = $state(false);
	let actionMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let varInputs = $state<Record<string, string>>({});

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

	async function fetchFormulaDetail(name: string) {
		loadingDetail = true;
		detailError = null;
		selectedFormula = null;
		varInputs = {};

		try {
			const res = await fetch(`/api/gastown/workflows/formulas/${encodeURIComponent(name)}`);
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to fetch formula details');
			}
			selectedFormula = await res.json();

			// Initialize var inputs with defaults
			if (selectedFormula?.variables) {
				for (const v of selectedFormula.variables) {
					varInputs[v.name] = v.default || '';
				}
			}
		} catch (e) {
			console.error('Error fetching formula detail:', e);
			detailError = e instanceof Error ? e.message : 'Failed to fetch formula details';
		} finally {
			loadingDetail = false;
		}
	}

	async function cookFormula(dryRun = false) {
		if (!selectedFormula) return;

		cookLoading = true;
		actionMessage = null;

		try {
			const res = await fetch('/api/gastown/workflows/cook', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					formula: selectedFormula.name,
					vars: varInputs,
					dryRun
				})
			});

			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(data.error || 'Failed to cook formula');
			}

			actionMessage = {
				type: 'success',
				text: dryRun ? 'Dry run complete - check console for output' : 'Formula cooked successfully'
			};
		} catch (e) {
			actionMessage = {
				type: 'error',
				text: e instanceof Error ? e.message : 'Failed to cook formula'
			};
		} finally {
			cookLoading = false;
		}
	}

	async function pourMol() {
		if (!selectedFormula) return;

		pourLoading = true;
		actionMessage = null;

		try {
			const res = await fetch('/api/gastown/workflows/pour', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					proto: selectedFormula.name,
					vars: varInputs
				})
			});

			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(data.error || 'Failed to pour molecule');
			}

			actionMessage = {
				type: 'success',
				text: `Molecule poured${data.molId ? `: ${data.molId}` : ''}`
			};

			// Refresh molecules list
			await fetchMolecules();
		} catch (e) {
			actionMessage = {
				type: 'error',
				text: e instanceof Error ? e.message : 'Failed to pour molecule'
			};
		} finally {
			pourLoading = false;
		}
	}

	function closeDetail() {
		selectedFormula = null;
		detailError = null;
		actionMessage = null;
		varInputs = {};
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

	// Get phase badge color
	function getPhaseColor(phase: string): string {
		switch (phase) {
			case 'liquid':
				return 'bg-info/20 text-info';
			case 'vapor':
				return 'bg-accent/20 text-accent';
			case 'solid':
				return 'bg-muted/50 text-muted-foreground';
			default:
				return 'bg-muted text-muted-foreground';
		}
	}

	// Calculate progress percentage
	function getProgress(molecule: StaleMolecule): number {
		if (molecule.total_children === 0) return 0;
		return Math.round((molecule.closed_children / molecule.total_children) * 100);
	}

	const tabs: Array<{ id: TabId; label: string; count?: number }> = $derived([
		{
			id: 'molecules' as const,
			label: 'Molecules',
			count: loadingMolecules
				? undefined
				: (molecules?.active.length ?? 0) +
					(molecules?.wisps.length ?? 0) +
					(molecules?.stale.total_count ?? 0)
		},
		{ id: 'formulas' as const, label: 'Formulas', count: loadingFormulas ? undefined : formulas.length }
	]);
</script>

{#snippet stats()}
	<!-- Tab navigation -->
	<div class="col-span-full flex gap-1 p-1 bg-muted/30 rounded-lg">
		{#each tabs as tab}
			<button
				type="button"
				onclick={() => (activeTab = tab.id)}
				class={cn(
					'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all',
					activeTab === tab.id
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
				)}
			>
				{tab.label}
				{#if tab.count !== undefined}
					<span
						class={cn(
							'ml-2 px-1.5 py-0.5 text-xs rounded-full',
							activeTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
						)}
					>
						{tab.count}
					</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Stats cards for current tab -->
	{#if activeTab === 'molecules'}
		<div class="panel-glass p-4 rounded-lg">
			<div class="text-sm text-muted-foreground">Active</div>
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
			<div class="text-2xl font-semibold text-warning mt-1">
				{loadingMolecules ? '...' : (molecules?.stale.total_count ?? 0)}
			</div>
		</div>
	{:else}
		<div class="panel-glass p-4 rounded-lg">
			<div class="text-sm text-muted-foreground">Total</div>
			<div class="text-2xl font-semibold text-foreground mt-1">
				{loadingFormulas ? '...' : formulas.length}
			</div>
		</div>
		<div class="panel-glass p-4 rounded-lg">
			<div class="text-sm text-muted-foreground">Workflows</div>
			<div class="text-2xl font-semibold text-info mt-1">
				{loadingFormulas ? '...' : formulas.filter((f) => f.type === 'workflow').length}
			</div>
		</div>
		<div class="panel-glass p-4 rounded-lg">
			<div class="text-sm text-muted-foreground">Convoys</div>
			<div class="text-2xl font-semibold text-accent mt-1">
				{loadingFormulas ? '...' : formulas.filter((f) => f.type === 'convoy').length}
			</div>
		</div>
	{/if}
{/snippet}

<DashboardLayout title="Workflows" systemStatus="running" {stats}>

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
				<div class="panel-glass p-4 rounded-lg border-l-4 border-destructive">
					<p class="text-destructive">{error}</p>
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
								<button
									type="button"
									onclick={() => fetchFormulaDetail(formula.name)}
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
</DashboardLayout>

<!-- Formula Detail Modal -->
{#if selectedFormula || loadingDetail || detailError}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
	>
		<div class="panel-glass w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
			<!-- Header -->
			<div class="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
				<h2 class="text-lg font-semibold text-foreground">
					{#if loadingDetail}
						Loading...
					{:else if detailError}
						Error
					{:else if selectedFormula}
						{selectedFormula.name}
					{/if}
				</h2>
				<button
					type="button"
					onclick={closeDetail}
					class="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
					aria-label="Close"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Content -->
			<div class="p-4 space-y-6">
				{#if loadingDetail}
					<div class="space-y-4">
						<Skeleton class="h-6 w-48" />
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-3/4" />
						<Skeleton class="h-32 w-full" />
					</div>
				{:else if detailError}
					<div class="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
						<p class="text-destructive">{detailError}</p>
					</div>
				{:else if selectedFormula}
					<!-- Formula info -->
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<span class={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(selectedFormula.type)}`}>
								{selectedFormula.type}
							</span>
							{#if selectedFormula.phase}
								<span class={`text-xs px-2 py-0.5 rounded-full ${getPhaseColor(selectedFormula.phase)}`}>
									{selectedFormula.phase}
								</span>
							{/if}
						</div>
						<p class="text-sm text-muted-foreground">{selectedFormula.description}</p>
						{#if selectedFormula.source}
							<p class="text-xs text-muted-foreground">Source: {selectedFormula.source}</p>
						{/if}
					</div>

					<!-- Variables -->
					{#if selectedFormula.variables && selectedFormula.variables.length > 0}
						<div class="space-y-3">
							<h3 class="text-sm font-medium text-foreground">Variables</h3>
							<div class="space-y-3">
								{#each selectedFormula.variables as variable}
									<div class="space-y-1">
										<label for="var-{variable.name}" class="flex items-center gap-2 text-sm">
											<span class="font-medium text-foreground">{variable.name}</span>
											{#if variable.required}
												<span class="text-xs text-destructive">*</span>
											{/if}
										</label>
										{#if variable.description}
											<p class="text-xs text-muted-foreground">{variable.description}</p>
										{/if}
										<input
											id="var-{variable.name}"
											type="text"
											bind:value={varInputs[variable.name]}
											placeholder={variable.default || `Enter ${variable.name}`}
											class="w-full h-9 px-3 text-sm bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
										/>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Steps -->
					{#if selectedFormula.steps && selectedFormula.steps.length > 0}
						<div class="space-y-3">
							<h3 class="text-sm font-medium text-foreground">Steps ({selectedFormula.steps.length})</h3>
							<div class="space-y-2">
								{#each selectedFormula.steps as step, i}
									<div class="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
										<span class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-medium text-muted-foreground bg-muted rounded-full">
											{i + 1}
										</span>
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2">
												<span class="font-medium text-foreground text-sm">{step.title}</span>
												<span class="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
													{step.type}
												</span>
											</div>
											{#if step.depends_on && step.depends_on.length > 0}
												<p class="text-xs text-muted-foreground mt-1">
													Depends on: {step.depends_on.join(', ')}
												</p>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Action message -->
					{#if actionMessage}
						<div
							class={cn(
								'p-3 rounded-lg text-sm',
								actionMessage.type === 'success'
									? 'bg-success/10 text-success border border-success/30'
									: 'bg-destructive/10 text-destructive border border-destructive/30'
							)}
						>
							{actionMessage.text}
						</div>
					{/if}

					<!-- Actions -->
					<div class="flex items-center gap-3 pt-4 border-t border-border">
						<button
							type="button"
							onclick={() => cookFormula(true)}
							disabled={cookLoading || pourLoading}
							class="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
						>
							{cookLoading ? 'Cooking...' : 'Dry Run'}
						</button>
						<button
							type="button"
							onclick={() => cookFormula(false)}
							disabled={cookLoading || pourLoading}
							class="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors disabled:opacity-50"
						>
							{cookLoading ? 'Cooking...' : 'Cook'}
						</button>
						<button
							type="button"
							onclick={pourMol}
							disabled={cookLoading || pourLoading}
							class="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
						>
							{pourLoading ? 'Pouring...' : 'Pour Mol'}
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
