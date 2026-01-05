<script lang="ts">
	import { GridPattern, ProgressBar, StatusIndicator } from '$lib/components';
	import type { ConvoyDetail } from './+page.server';

	const { data } = $props();
	const convoy: ConvoyDetail = $derived(data.convoy);

	const statusConfig = {
		active: {
			color: 'success' as const,
			indicatorStatus: 'running' as const,
			label: 'Active',
			borderClass: 'border-success/30',
			bgClass: 'bg-success/10 text-success'
		},
		stale: {
			color: 'warning' as const,
			indicatorStatus: 'idle' as const,
			label: 'Stale',
			borderClass: 'border-warning/30',
			bgClass: 'bg-warning/10 text-warning'
		},
		stuck: {
			color: 'error' as const,
			indicatorStatus: 'error' as const,
			label: 'Stuck',
			borderClass: 'border-destructive/30',
			bgClass: 'bg-destructive/10 text-destructive'
		},
		complete: {
			color: 'success' as const,
			indicatorStatus: 'complete' as const,
			label: 'Complete',
			borderClass: 'border-success/30',
			bgClass: 'bg-success/10 text-success'
		}
	};

	const config = $derived(statusConfig[convoy.status]);

	function formatDate(dateStr: string): string {
		if (!dateStr) return 'Unknown';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
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
			case 'unknown':
				return 'text-muted-foreground/50';
			default:
				return 'text-status-idle';
		}
	}

	function getIssueStatusBg(status: string): string {
		switch (status) {
			case 'in_progress':
				return 'bg-success/10';
			case 'closed':
				return 'bg-muted/50';
			case 'blocked':
				return 'bg-destructive/10';
			default:
				return 'bg-warning/10';
		}
	}

	function formatWorkerName(worker: string): string {
		const parts = worker.split('/');
		return parts[parts.length - 1];
	}
</script>

<svelte:head>
	<title>{convoy.title} | Gas Town</title>
</svelte:head>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.15} />

	<div class="relative z-10">
		<!-- Header -->
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
			<div class="container">
				<div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
					<a href="/convoys" class="hover:text-foreground transition-colors">Convoys</a>
					<span>/</span>
					<span class="font-mono">{convoy.id}</span>
				</div>
				<div class="flex items-center gap-3">
					<StatusIndicator status={config.indicatorStatus} size="md" />
					<h1 class="text-xl font-semibold text-foreground">{convoy.title}</h1>
					<span class="text-xs font-medium px-2 py-0.5 rounded-full {config.bgClass}">
						{config.label}
					</span>
				</div>
			</div>
		</header>

		<main class="container py-6 space-y-6">
			{#if data.error}
				<div class="panel-glass p-6 border-status-offline/30">
					<p class="text-status-offline font-medium">Failed to load convoy</p>
					<p class="text-sm text-muted-foreground mt-1">{data.error}</p>
				</div>
			{:else}
				<!-- Progress Section -->
				<section class="panel-glass p-6 {config.borderClass}">
					<h2 class="text-sm font-medium text-muted-foreground mb-4">Progress</h2>
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<span class="text-2xl font-bold text-foreground">
								{convoy.completed}/{convoy.total}
							</span>
							<span class="text-lg font-medium text-muted-foreground">
								{convoy.progress}%
							</span>
						</div>
						<ProgressBar value={convoy.progress} size="lg" color={config.color} />
					</div>
				</section>

				<!-- Metadata Section -->
				<section class="panel-glass p-6">
					<h2 class="text-sm font-medium text-muted-foreground mb-4">Details</h2>
					<dl class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<dt class="text-muted-foreground">Convoy ID</dt>
							<dd class="font-mono text-foreground mt-0.5">{convoy.id}</dd>
						</div>
						<div>
							<dt class="text-muted-foreground">Status</dt>
							<dd class="text-foreground mt-0.5 capitalize">{convoy.rawStatus}</dd>
						</div>
						<div>
							<dt class="text-muted-foreground">Created</dt>
							<dd class="text-foreground mt-0.5">{formatDate(convoy.createdAt)}</dd>
						</div>
						<div>
							<dt class="text-muted-foreground">Issues</dt>
							<dd class="text-foreground mt-0.5">{convoy.total} tracked</dd>
						</div>
					</dl>
				</section>

				<!-- Active Workers Section -->
				{#if convoy.workers.length > 0}
					<section class="panel-glass p-6">
						<h2 class="text-sm font-medium text-muted-foreground mb-4">
							Active Workers ({convoy.workers.length})
						</h2>
						<div class="flex flex-wrap gap-2">
							{#each convoy.workers as worker (worker)}
								<span
									class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-sm"
								>
									<span class="w-2 h-2 rounded-full bg-status-online"></span>
									{formatWorkerName(worker)}
								</span>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Tracked Issues Section -->
				<section class="panel-glass p-6">
					<h2 class="text-sm font-medium text-muted-foreground mb-4">
						Tracked Issues ({convoy.tracked.length})
					</h2>
					{#if convoy.tracked.length === 0}
						<p class="text-muted-foreground text-sm">No issues tracked in this convoy</p>
					{:else}
						<div class="space-y-2">
							{#each convoy.tracked as issue (issue.id)}
								<div
									class="flex items-center justify-between gap-3 p-3 rounded-lg {getIssueStatusBg(
										issue.status
									)}"
								>
									<div class="min-w-0 flex-1">
										<div class="flex items-center gap-2 flex-wrap">
											<span class="text-xs font-mono text-muted-foreground">{issue.id}</span>
											<span
												class="text-xs font-medium px-1.5 py-0.5 rounded {getIssueStatusColor(
													issue.status
												)}"
											>
												{issue.status.replace('_', ' ')}
											</span>
											{#if issue.issue_type}
												<span class="text-xs text-muted-foreground/70">
													{issue.issue_type}
												</span>
											{/if}
										</div>
										<p class="text-sm text-foreground truncate mt-1">
											{issue.title === '(external)' ? 'External issue' : issue.title}
										</p>
									</div>
									{#if issue.assignee}
										<span class="text-xs text-muted-foreground flex-shrink-0">
											{formatWorkerName(issue.assignee)}
										</span>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</section>

				<!-- Actions -->
				<div class="flex justify-start gap-3">
					<a
						href="/convoys"
						class="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
					>
						Back to Convoys
					</a>
				</div>
			{/if}
		</main>
	</div>
</div>
