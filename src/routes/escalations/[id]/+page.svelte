<script lang="ts">
	import { cn } from '$lib/utils';
	import { GridPattern } from '$lib/components';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

	const severityConfig: Record<
		Severity,
		{ bg: string; text: string; badge: string; border: string; icon: string }
	> = {
		CRITICAL: {
			bg: 'bg-destructive/10',
			text: 'text-destructive',
			badge: 'bg-destructive text-destructive-foreground',
			border: 'border-destructive/30',
			icon: '!!'
		},
		HIGH: {
			bg: 'bg-warning/10',
			text: 'text-warning',
			badge: 'bg-warning text-warning-foreground',
			border: 'border-warning/30',
			icon: '!'
		},
		MEDIUM: {
			bg: 'bg-status-pending/10',
			text: 'text-status-pending',
			badge: 'bg-status-pending text-black',
			border: 'border-status-pending/30',
			icon: '?'
		},
		LOW: {
			bg: 'bg-muted/20',
			text: 'text-muted-foreground',
			badge: 'bg-muted text-muted-foreground',
			border: 'border-muted',
			icon: '-'
		}
	};

	function formatTimestamp(isoString: string): string {
		const date = new Date(isoString);
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatRelativeTime(isoString: string): string {
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return formatTimestamp(isoString);
	}

	// Derived values for escalation and config
	const escalation = $derived(data.escalation);
	const config = $derived(severityConfig[escalation.severity]);

	let selectedOption = $state<number | null>(null);
	let resolutionNote = $state('');
	let isSubmitting = $state(false);

	async function handleResolve() {
		if (data.escalation.isDecision && selectedOption === null) {
			return;
		}
		isSubmitting = true;
		// Resolution would be handled via form action or API call
		// For now, just show the selection was made
		console.log('Resolving:', {
			id: data.escalation.id,
			selectedOption: selectedOption !== null ? data.escalation.options?.[selectedOption] : null,
			note: resolutionNote
		});
		// Would call bd close or similar
		isSubmitting = false;
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10 flex flex-col min-h-screen">
		<!-- Header -->
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
			<div class="container">
				<div class="flex items-center gap-4">
					<a
						href="/escalations"
						class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<span aria-hidden="true">&larr;</span>
						Back to Escalations
					</a>
				</div>
			</div>
		</header>

		<!-- Main content -->
		<main class="flex-1 container py-6">
			<div class="max-w-3xl mx-auto space-y-6">
				<!-- Main escalation card -->
				<article
					class={cn(
						'panel-glass overflow-hidden animate-blur-fade-up',
						config.border,
						'border-l-4'
					)}
				>
					<div class="p-6">
						<!-- Header -->
						<div class="flex items-start gap-4 mb-6">
							<!-- Severity badge -->
							<span
								class={cn(
									'inline-flex items-center justify-center w-12 h-12 rounded-xl font-mono font-bold text-lg shrink-0',
									config.badge
								)}
							>
								{config.icon}
							</span>

							<div class="flex-1 min-w-0">
								<h1 class="text-xl font-semibold text-foreground mb-2">
									{escalation.title}
								</h1>
								<div class="flex flex-wrap items-center gap-2">
									<span
										class={cn(
											'text-sm font-medium px-2 py-1 rounded',
											config.bg,
											config.text
										)}
									>
										{escalation.severity}
									</span>
									<span class="text-sm text-muted-foreground px-2 py-1 rounded bg-muted/30">
										{escalation.category}
									</span>
									<span
										class={cn(
											'text-sm px-2 py-1 rounded',
											escalation.status === 'open'
												? 'bg-warning/20 text-warning'
												: 'bg-success/20 text-success'
										)}
									>
										{escalation.status}
									</span>
								</div>
							</div>
						</div>

						<!-- Metadata -->
						<div class="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/10 mb-6">
							<div>
								<p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">ID</p>
								<p class="font-mono text-sm text-foreground">{escalation.id}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">Created By</p>
								<p class="text-sm text-foreground">{escalation.createdBy}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">Created</p>
								<p class="text-sm text-foreground">{formatTimestamp(escalation.timestamp)}</p>
								<p class="text-xs text-muted-foreground">{formatRelativeTime(escalation.timestamp)}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">Updated</p>
								<p class="text-sm text-foreground">{formatTimestamp(escalation.updatedAt)}</p>
								<p class="text-xs text-muted-foreground">{formatRelativeTime(escalation.updatedAt)}</p>
							</div>
						</div>

						<!-- Labels -->
						{#if escalation.labels && escalation.labels.length > 0}
							<div class="mb-6">
								<p class="text-xs text-muted-foreground uppercase tracking-wider mb-2">Labels</p>
								<div class="flex flex-wrap gap-2">
									{#each escalation.labels as label}
										<span class="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
											{label}
										</span>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Description -->
						{#if escalation.description && !escalation.isDecision}
							<div class="mb-6">
								<p class="text-xs text-muted-foreground uppercase tracking-wider mb-2">Description</p>
								<div class="prose prose-sm prose-invert max-w-none">
									<p class="text-foreground whitespace-pre-wrap">{escalation.description}</p>
								</div>
							</div>
						{/if}

						<!-- Decision section -->
						{#if escalation.isDecision && escalation.question}
							<div class={cn('p-5 rounded-xl', config.bg)}>
								<p class="text-xs text-muted-foreground uppercase tracking-wider mb-2">Decision Required</p>
								<p class="font-medium text-foreground text-lg mb-4">
									{escalation.question}
								</p>

								{#if escalation.options && escalation.options.length > 0}
									<div class="space-y-2">
										{#each escalation.options as option, optIdx}
											<button
												type="button"
												onclick={() => (selectedOption = optIdx)}
												class={cn(
													'w-full text-left px-4 py-3 rounded-lg border-2 transition-all',
													selectedOption === optIdx
														? 'border-primary bg-primary/10'
														: 'bg-background/80 border-border hover:border-primary/50 hover:bg-primary/5',
													'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
												)}
											>
												<div class="flex items-center gap-3">
													<span
														class={cn(
															'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0',
															selectedOption === optIdx
																? 'border-primary bg-primary'
																: 'border-muted-foreground'
														)}
													>
														{#if selectedOption === optIdx}
															<span class="w-2 h-2 rounded-full bg-primary-foreground"></span>
														{/if}
													</span>
													<div>
														<span class="text-sm font-medium text-foreground">
															{option.label}
														</span>
														{#if option.value !== option.label}
															<p class="text-xs text-muted-foreground mt-0.5">{option.value}</p>
														{/if}
													</div>
												</div>
											</button>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</article>

				<!-- Resolution panel -->
				<div class="panel-glass p-6 animate-blur-fade-up" style="animation-delay: 100ms">
					<h2 class="text-lg font-semibold text-foreground mb-4">Resolution</h2>

					<div class="space-y-4">
						<!-- Resolution note -->
						<div>
							<label for="resolution-note" class="block text-sm font-medium text-foreground mb-2">
								Resolution Note (optional)
							</label>
							<textarea
								id="resolution-note"
								bind:value={resolutionNote}
								placeholder="Add any notes about the resolution..."
								rows={3}
								class={cn(
									'w-full px-3 py-2 rounded-lg border border-border bg-background/50',
									'text-foreground placeholder:text-muted-foreground',
									'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
									'resize-none'
								)}
							></textarea>
						</div>

						<!-- Action buttons -->
						<div class="flex items-center gap-3 pt-2">
							<button
								type="button"
								onclick={handleResolve}
								disabled={isSubmitting || (data.escalation.isDecision && selectedOption === null)}
								class={cn(
									'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
									'bg-success text-success-foreground hover:bg-success/90',
									'disabled:opacity-50 disabled:cursor-not-allowed',
									'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
								)}
							>
								{#if isSubmitting}
									<span class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
								{/if}
								<span>Resolve Escalation</span>
							</button>

							<a
								href="/escalations"
								class={cn(
									'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
									'bg-muted text-muted-foreground hover:bg-muted/80'
								)}
							>
								Cancel
							</a>
						</div>

						{#if data.escalation.isDecision && selectedOption === null}
							<p class="text-sm text-warning">Please select an option before resolving.</p>
						{/if}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
