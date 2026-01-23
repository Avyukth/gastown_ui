<script lang="ts">
	import { cn } from '$lib/utils';
	import type { TabId, MoleculesResponse, Formula } from './types';

	interface Props {
		activeTab: TabId;
		onTabChange: (tab: TabId) => void;
		loadingFormulas: boolean;
		loadingMolecules: boolean;
		formulas: Formula[];
		molecules: MoleculesResponse | null;
	}

	let { activeTab, onTabChange, loadingFormulas, loadingMolecules, formulas, molecules }: Props = $props();

	const tabs = $derived<Array<{ id: TabId; label: string; count?: number }>>([
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

<!-- Tab navigation -->
<div class="col-span-full flex gap-1 p-1 bg-muted/30 rounded-lg">
	{#each tabs as tab}
		<button
			type="button"
			onclick={() => onTabChange(tab.id)}
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
