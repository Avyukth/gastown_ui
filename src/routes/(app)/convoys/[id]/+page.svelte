<script lang="ts">
	import { GridPattern, ProgressBar, StatusIndicator, PageHeader } from '$lib/components';
	import {
		formatDate,
		convoyStatusConfig,
		getIssueStatusColor,
		getIssueStatusBgSimple,
		formatWorkerName,
		type ConvoyStatus
	} from '$lib/utils';
	import type { ConvoyDetail } from './+page.server';

	const { data } = $props();
	const convoy: ConvoyDetail = $derived(data.convoy);
	const config = $derived(convoyStatusConfig[convoy.status as ConvoyStatus]);
</script>

<svelte:head>
	<title>{convoy.title} | Gas Town</title>
</svelte:head>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<PageHeader
			title={convoy.title}
			subtitle={convoy.id}
			backLink={{ label: 'Back to Convoys', href: '/convoys' }}
			showAccentBar={true}
		>
			{#snippet titleExtras()}
				<StatusIndicator status={config.indicatorStatus} size="md" />
				<span class="text-xs font-medium px-2 py-0.5 rounded-full {config.bgClass}">
					{config.label}
				</span>
			{/snippet}
		</PageHeader>

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
							<dd class="text-foreground mt-0.5">{formatDate(convoy.createdAt, true)}</dd>
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
									class="flex items-center justify-between gap-3 p-3 rounded-lg {getIssueStatusBgSimple(
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

			{/if}
		</main>
	</div>
</div>
