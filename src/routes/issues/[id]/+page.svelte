<script lang="ts">
	import { GridPattern, StatusIndicator } from '$lib/components';
	import type { IssueDetail, IssueStatus, ActivityEvent } from './+page.server';

	const { data } = $props();
	const issue: IssueDetail = $derived(data.issue);

	// Status configuration
	const statusConfig: Record<IssueStatus, {
		indicatorStatus: 'running' | 'idle' | 'error' | 'warning' | 'complete';
		label: string;
		bgClass: string;
		borderClass: string;
	}> = {
		open: {
			indicatorStatus: 'warning',
			label: 'Open',
			bgClass: 'bg-warning/10 text-warning',
			borderClass: 'border-warning/30'
		},
		in_progress: {
			indicatorStatus: 'running',
			label: 'In Progress',
			bgClass: 'bg-info/10 text-info',
			borderClass: 'border-info/30'
		},
		blocked: {
			indicatorStatus: 'error',
			label: 'Blocked',
			bgClass: 'bg-destructive/10 text-destructive',
			borderClass: 'border-destructive/30'
		},
		completed: {
			indicatorStatus: 'complete',
			label: 'Completed',
			bgClass: 'bg-success/10 text-success',
			borderClass: 'border-success/30'
		}
	};

	const config = $derived(statusConfig[issue.status]);

	// Priority labels
	const priorityLabels: Record<number, { label: string; class: string }> = {
		0: { label: 'P0 Critical', class: 'text-destructive bg-destructive/10' },
		1: { label: 'P1 High', class: 'text-warning bg-warning/10' },
		2: { label: 'P2 Medium', class: 'text-warning/80 bg-warning/10' },
		3: { label: 'P3 Low', class: 'text-info bg-info/10' },
		4: { label: 'P4 Backlog', class: 'text-muted-foreground bg-muted' }
	};

	// Activity event icons
	function getActivityIcon(type: ActivityEvent['type']): string {
		switch (type) {
			case 'status_change': return 'swap_horiz';
			case 'assignment': return 'person_add';
			case 'comment': return 'chat';
			case 'created': return 'add_circle';
			case 'convoy_added': return 'local_shipping';
			default: return 'info';
		}
	}

	function getActivityColor(type: ActivityEvent['type']): string {
		switch (type) {
			case 'status_change': return 'text-info';
			case 'assignment': return 'text-success';
			case 'comment': return 'text-muted-foreground';
			case 'created': return 'text-warning';
			case 'convoy_added': return 'text-accent';
			default: return 'text-muted-foreground';
		}
	}

	function formatActivityMessage(event: ActivityEvent): string {
		switch (event.type) {
			case 'status_change':
				return `Status changed from ${event.details.from} to ${event.details.to}`;
			case 'assignment':
				return event.details.from
					? `Reassigned from ${formatAgent(event.details.from)} to ${formatAgent(event.details.to!)}`
					: `Assigned to ${formatAgent(event.details.to!)}`;
			case 'comment':
				return event.details.message || 'Added a comment';
			case 'created':
				return event.details.message || 'Issue created';
			case 'convoy_added':
				return `Added to convoy ${event.details.convoy_id}`;
			default:
				return 'Unknown activity';
		}
	}

	function formatAgent(agent: string): string {
		const parts = agent.split('/');
		return parts[parts.length - 1];
	}

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

	function formatRelativeTime(dateStr: string): string {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return formatDate(dateStr);
	}

	function getIssueStatusBg(status: IssueStatus): string {
		return statusConfig[status].bgClass;
	}
</script>

<svelte:head>
	<title>{issue.title} | Gas Town</title>
</svelte:head>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.15} />

	<div class="relative z-10">
		<!-- Header -->
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
			<div class="container">
				<div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
					<a href="/work" class="hover:text-foreground transition-colors">Work</a>
					<span>/</span>
					<span class="font-mono">{issue.id}</span>
				</div>
				<div class="flex items-center gap-3 flex-wrap">
					<StatusIndicator status={config.indicatorStatus} size="md" />
					<h1 class="text-xl font-semibold text-foreground">{issue.title}</h1>
					<span class="text-xs font-medium px-2 py-0.5 rounded-full {config.bgClass}">
						{config.label}
					</span>
					<span class="text-xs font-medium px-2 py-0.5 rounded-full {priorityLabels[issue.priority].class}">
						{priorityLabels[issue.priority].label}
					</span>
					<span class="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
						{issue.issue_type}
					</span>
				</div>
			</div>
		</header>

		<main class="container py-6">
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- Main Content -->
				<div class="lg:col-span-2 space-y-6">
					<!-- Description Section -->
					{#if issue.description}
						<section class="panel-glass p-6 {config.borderClass}">
							<h2 class="text-sm font-medium text-muted-foreground mb-3">Description</h2>
							<p class="text-foreground">{issue.description}</p>
						</section>
					{/if}

					<!-- Metadata Section -->
					<section class="panel-glass p-6">
						<h2 class="text-sm font-medium text-muted-foreground mb-4">Details</h2>
						<dl class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<dt class="text-muted-foreground">Issue ID</dt>
								<dd class="font-mono text-foreground mt-0.5">{issue.id}</dd>
							</div>
							<div>
								<dt class="text-muted-foreground">Status</dt>
								<dd class="text-foreground mt-0.5 capitalize">{issue.status.replace('_', ' ')}</dd>
							</div>
							<div>
								<dt class="text-muted-foreground">Priority</dt>
								<dd class="text-foreground mt-0.5">{priorityLabels[issue.priority].label}</dd>
							</div>
							<div>
								<dt class="text-muted-foreground">Type</dt>
								<dd class="text-foreground mt-0.5 capitalize">{issue.issue_type}</dd>
							</div>
							<div>
								<dt class="text-muted-foreground">Created</dt>
								<dd class="text-foreground mt-0.5">{formatDate(issue.created_at)}</dd>
							</div>
							<div>
								<dt class="text-muted-foreground">Updated</dt>
								<dd class="text-foreground mt-0.5">{formatDate(issue.updated_at)}</dd>
							</div>
							{#if issue.assignee}
								<div class="col-span-2">
									<dt class="text-muted-foreground">Assigned To</dt>
									<dd class="text-foreground mt-0.5">
										<a href="/agents/{issue.assignee.replace(/\//g, '-')}" class="hover:text-primary transition-colors">
											{issue.assignee}
										</a>
									</dd>
								</div>
							{/if}
						</dl>
					</section>

					<!-- Blockers Section -->
					{#if issue.blocked_by.length > 0 || issue.blocking.length > 0}
						<section class="panel-glass p-6">
							<h2 class="text-sm font-medium text-muted-foreground mb-4">Dependencies</h2>
							<div class="space-y-4">
								{#if issue.blocked_by.length > 0}
									<div>
										<h3 class="text-xs font-medium text-destructive mb-2">Blocked By ({issue.blocked_by.length})</h3>
										<div class="flex flex-wrap gap-2">
											{#each issue.blocked_by as blockerId}
												<a
													href="/issues/{blockerId}"
													class="px-2 py-1 text-xs font-mono bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
												>
													{blockerId}
												</a>
											{/each}
										</div>
									</div>
								{/if}
								{#if issue.blocking.length > 0}
									<div>
										<h3 class="text-xs font-medium text-warning mb-2">Blocking ({issue.blocking.length})</h3>
										<div class="flex flex-wrap gap-2">
											{#each issue.blocking as blockingId}
												<a
													href="/issues/{blockingId}"
													class="px-2 py-1 text-xs font-mono bg-warning/10 text-warning rounded hover:bg-warning/20 transition-colors"
												>
													{blockingId}
												</a>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						</section>
					{/if}

					<!-- Activity Timeline -->
					<section class="panel-glass p-6">
						<h2 class="text-sm font-medium text-muted-foreground mb-4">
							Activity ({issue.activity.length})
						</h2>
						{#if issue.activity.length === 0}
							<p class="text-muted-foreground text-sm">No activity recorded</p>
						{:else}
							<div class="relative">
								<!-- Timeline line -->
								<div class="absolute left-3 top-2 bottom-2 w-px bg-border"></div>

								<div class="space-y-4">
									{#each issue.activity as event (event.id)}
										<div class="relative flex gap-4 pl-8">
											<!-- Timeline dot -->
											<div class="absolute left-0 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center">
												<span class="material-symbols-outlined text-sm {getActivityColor(event.type)}">
													{getActivityIcon(event.type)}
												</span>
											</div>

											<div class="flex-1 min-w-0">
												<p class="text-sm text-foreground">
													{formatActivityMessage(event)}
												</p>
												<div class="flex items-center gap-2 mt-1">
													<span class="text-xs text-muted-foreground">
														{formatAgent(event.actor)}
													</span>
													<span class="text-xs text-muted-foreground/50">
														{formatRelativeTime(event.timestamp)}
													</span>
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</section>
				</div>

				<!-- Sidebar -->
				<div class="space-y-6">
					<!-- Action Buttons -->
					<section class="panel-glass p-6">
						<h2 class="text-sm font-medium text-muted-foreground mb-4">Actions</h2>
						<div class="space-y-2">
							<button
								class="w-full px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left"
							>
								Change Status
							</button>
							<button
								class="w-full px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left"
							>
								Assign to Agent
							</button>
							<button
								class="w-full px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left"
							>
								Add to Convoy
							</button>
							{#if issue.status !== 'completed'}
								<button
									class="w-full px-4 py-2 text-sm bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors text-left"
								>
									Close Issue
								</button>
							{:else}
								<button
									class="w-full px-4 py-2 text-sm bg-warning/10 text-warning hover:bg-warning/20 rounded-lg transition-colors text-left"
								>
									Reopen Issue
								</button>
							{/if}
						</div>
					</section>

					<!-- Convoy Link -->
					{#if issue.convoy_id}
						<section class="panel-glass p-6">
							<h2 class="text-sm font-medium text-muted-foreground mb-4">Convoy</h2>
							<a
								href="/convoys/{issue.convoy_id}"
								class="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
							>
								<div class="font-mono text-xs text-muted-foreground mb-1">{issue.convoy_id}</div>
								<div class="text-sm text-foreground">{issue.convoy_title}</div>
							</a>
						</section>
					{/if}

					<!-- Assigned Agent -->
					{#if issue.assignee}
						<section class="panel-glass p-6">
							<h2 class="text-sm font-medium text-muted-foreground mb-4">Assigned Agent</h2>
							<a
								href="/agents/{issue.assignee.replace(/\//g, '-')}"
								class="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
							>
								<StatusIndicator status="running" size="md" />
								<span class="text-sm text-foreground">{formatAgent(issue.assignee)}</span>
							</a>
						</section>
					{/if}

					<!-- Related Issues -->
					{#if issue.related_issues.length > 0}
						<section class="panel-glass p-6">
							<h2 class="text-sm font-medium text-muted-foreground mb-4">
								Related Issues ({issue.related_issues.length})
							</h2>
							<div class="space-y-2">
								{#each issue.related_issues as related (related.id)}
									<a
										href="/issues/{related.id}"
										class="block p-3 rounded-lg {getIssueStatusBg(related.status)} hover:opacity-80 transition-opacity"
									>
										<div class="flex items-center gap-2 mb-1">
											<span class="text-xs font-mono text-muted-foreground">{related.id}</span>
											<span class="text-xs capitalize">{related.status.replace('_', ' ')}</span>
										</div>
										<div class="text-sm text-foreground truncate">{related.title}</div>
									</a>
								{/each}
							</div>
						</section>
					{/if}
				</div>
			</div>

			<!-- Back Navigation -->
			<div class="mt-6 flex justify-start gap-3">
				<a
					href="/work"
					class="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
				>
					Back to Work
				</a>
			</div>
		</main>
	</div>
</div>
