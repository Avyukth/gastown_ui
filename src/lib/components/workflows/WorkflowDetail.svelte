<script lang="ts">
	import { Skeleton } from '$lib/components';
	import { cn } from '$lib/utils';
	import { X } from 'lucide-svelte';
	import type { FormulaDetail, ActionMessage } from './types';

	interface Props {
		selectedFormula: FormulaDetail | null;
		loadingDetail: boolean;
		detailError: string | null;
		actionMessage: ActionMessage | null;
		cookLoading: boolean;
		pourLoading: boolean;
		varInputs: Record<string, string>;
		onClose: () => void;
		onCook: (dryRun: boolean) => void;
		onPour: () => void;
		onVarChange: (name: string, value: string) => void;
	}

	let {
		selectedFormula,
		loadingDetail,
		detailError,
		actionMessage,
		cookLoading,
		pourLoading,
		varInputs,
		onClose,
		onCook,
		onPour,
		onVarChange
	}: Props = $props();

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

	// Only render if there's something to show
	const isVisible = $derived(selectedFormula || loadingDetail || detailError);
</script>

{#if isVisible}
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
					onclick={onClose}
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
											value={varInputs[variable.name] || ''}
											oninput={(e) => onVarChange(variable.name, e.currentTarget.value)}
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
							onclick={() => onCook(true)}
							disabled={cookLoading || pourLoading}
							class="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
						>
							{cookLoading ? 'Cooking...' : 'Dry Run'}
						</button>
						<button
							type="button"
							onclick={() => onCook(false)}
							disabled={cookLoading || pourLoading}
							class="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors disabled:opacity-50"
						>
							{cookLoading ? 'Cooking...' : 'Cook'}
						</button>
						<button
							type="button"
							onclick={onPour}
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
