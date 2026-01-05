<script lang="ts">
	import { GridPattern, ProgressBar, StatusIndicator } from '$lib/components';
	import type { Convoy } from './+page.server';

	const { data } = $props();

	// Track which convoys are expanded
	let expanded = $state<Set<string>>(new Set());

	function toggleExpanded(id: string) {
		if (expanded.has(id)) {
			expanded.delete(id);
		} else {
			expanded.add(id);
		}
		expanded = new Set(expanded);
	}

	// Map convoy status to visual properties
	const statusConfig = {
		active: {
			color: 'success' as const,
			indicatorStatus: 'running' as const,
			label: 'Active',
			borderClass: 'border-status-online/30'
		},
		stale: {
			color: 'warning' as const,
			indicatorStatus: 'idle' as const,
			label: 'Stale',
			borderClass: 'border-amber-500/30'
		},
		stuck: {
			color: 'error' as const,
			indicatorStatus: 'error' as const,
			label: 'Stuck',
			borderClass: 'border-status-offline/30'
		},
		complete: {
			color: 'success' as const,
			indicatorStatus: 'complete' as const,
			label: 'Complete',
			borderClass: 'border-status-online/30'
		}
	};

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getIssueStatusColor(status: string): string {
		switch (status) {
			case 'in_progress':
				return 'text-status-online';
			case 'closed':
				return 'text-muted-foreground';
			case 'blocked':
				return 'text-status-offline';
			default:
				return 'text-status-idle';
		}
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.15} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
			<div class="container">
				<h1 class="text-xl font-semibold text-foreground">Convoys</h1>
				<p class="text-sm text-muted-foreground">Track batched work across Gas Town</p>
			</div>
		</header>

		<main class="container py-6">
			{#if data.error}
				<div class="panel-glass p-6 border-status-offline/30">
					<p class="text-status-offline font-medium">Failed to load convoys</p>
					<p class="text-sm text-muted-foreground mt-1">{data.error}</p>
				</div>
			{:else if data.convoys.length === 0}
				<div class="panel-glass p-6">
					<p class="text-muted-foreground">No convoys found</p>
					<p class="text-sm text-muted-foreground/70 mt-1">
						Create a convoy with <code class="px-1 py-0.5 bg-muted rounded">gt convoy create</code>
					</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each data.convoys as convoy (convoy.id)}
						{@const config = statusConfig[convoy.status]}
						{@const isExpanded = expanded.has(convoy.id)}
						<a
							href="/convoys/{convoy.id}"
							class="block panel-glass p-4 transition-all duration-200 hover:shadow-lg hover:border-accent/50 {config.borderClass}"
						>
							<!-- Header -->
							<header class="flex items-start justify-between gap-3">
								<div class="flex items-start gap-3 min-w-0 flex-1">
									<StatusIndicator status={config.indicatorStatus} size="md" class="mt-0.5" />
									<div class="min-w-0 flex-1">
										<h3 class="font-medium text-foreground truncate">{convoy.title}</h3>
										<div class="flex items-center gap-2 mt-1">
											<span class="text-xs text-muted-foreground font-mono">{convoy.id}</span>
											<span class="text-xs text-muted-foreground">
												{formatDate(convoy.createdAt)}
											</span>
										</div>
									</div>
								</div>
								<div class="flex items-center gap-2 flex-shrink-0">
									<span
										class="text-xs font-medium px-2 py-0.5 rounded-full {config.color === 'success'
											? 'bg-success/10 text-success'
											: config.color === 'warning'
												? 'bg-warning/10 text-warning'
												: 'bg-destructive/10 text-destructive'}"
									>
										{config.label}
									</span>
								</div>
							</header>

							<!-- Progress -->
							<div class="mt-4 space-y-2">
								<div class="flex items-center justify-between text-sm">
									<span class="text-muted-foreground">Progress</span>
									<span class="font-medium text-foreground">
										{convoy.completed}/{convoy.total}
									</span>
								</div>
								<ProgressBar value={convoy.progress} size="md" color={config.color} />
							</div>

							<!-- Expand/Collapse Toggle -->
							{#if convoy.tracked.length > 0}
								<button
									type="button"
									class="mt-4 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 border-t border-border/50"
									onclick={() => toggleExpanded(convoy.id)}
								>
									<span>{isExpanded ? 'Hide' : 'Show'} tracked issues ({convoy.tracked.length})</span>
									<svg
										class="w-4 h-4 transition-transform {isExpanded ? 'rotate-180' : ''}"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>

								<!-- Tracked Issues -->
								{#if isExpanded}
									<div class="mt-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
										{#each convoy.tracked as issue (issue.id)}
											<div
												class="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg"
											>
												<div class="min-w-0 flex-1">
													<div class="flex items-center gap-2">
														<span class="text-xs font-mono text-muted-foreground">{issue.id}</span>
														<span
															class="text-xs font-medium {getIssueStatusColor(issue.status)}"
														>
															{issue.status.replace('_', ' ')}
														</span>
													</div>
													<p class="text-sm text-foreground truncate mt-0.5">{issue.title}</p>
												</div>
												{#if issue.assignee}
													<span class="text-xs text-muted-foreground flex-shrink-0">
														{issue.assignee.split('/').pop()}
													</span>
												{/if}
											</div>
										{/each}
									</div>
								{/if}
							{/if}
						</a>
					{/each}
				</div>
			{/if}
		</main>
	</div>
</div>
