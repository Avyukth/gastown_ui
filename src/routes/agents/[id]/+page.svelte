<script lang="ts">
	import { goto } from '$app/navigation';
	import { GridPattern, ErrorState, ProgressBar, StatusIndicator } from '$lib/components';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { ArrowLeft, Clock, Zap, Eye, AlertTriangle, RefreshCw, Search, Briefcase, Heart, Shield, Flame, Users, TrendingUp, Loader2 } from 'lucide-svelte';

	let { data } = $props();

	const agent = $derived(data.agent);

	// Loading states for actions
	let isRebooting = $state(false);
	let isLoadingLogs = $state(false);

	// Role icons mapping
	const roleIcons: Record<string, typeof Briefcase> = {
		coordinator: Briefcase,
		'health-check': Heart,
		witness: Shield,
		refinery: Flame,
		polecat: Users
	};

	const RoleIcon = $derived(roleIcons[agent.role || ''] || Briefcase);

	// Status indicator map
	const statusIndicatorMap = {
		running: 'running',
		idle: 'idle',
		error: 'error',
		complete: 'complete'
	} as const;

	// Status label map
	const statusLabels = {
		running: 'Running',
		idle: 'Idle',
		error: 'Error',
		complete: 'Complete'
	} as const;

	// Role label map
	const roleLabels: Record<string, string> = {
		coordinator: 'Coordinator',
		'health-check': 'Health Check',
		witness: 'Witness',
		refinery: 'Refinery',
		polecat: 'Crew',
		undefined: 'Unknown'
	};

	function goBack() {
		goto('/agents');
	}

	function handleInspect() {
		// Navigate to agent detail with full status inspection
		// This page IS the inspect view - show a toast indicating this
		toastStore.info(`Viewing inspection for ${agent.name}`);
	}

	async function handleViewLogs() {
		isLoadingLogs = true;
		const complete = toastStore.async('Loading logs...');

		try {
			const response = await fetch(`/api/gastown/agents/${encodeURIComponent(agent.id || agent.name)}/logs`);
			const result = await response.json();

			if (!response.ok) {
				complete.error(result.error || 'Failed to load logs');
				return;
			}

			// Navigate to logs view with agent context
			// For now, show logs in a toast since we don't have a dedicated logs page
			if (result.logs && result.logs.length > 0) {
				const recentLog = result.logs[0];
				complete.success(`Latest: ${recentLog.message}`);
				// Future: Navigate to /agents/[id]/logs page
				// goto(`/agents/${agent.id}/logs`);
			} else {
				complete.info('No recent logs available');
			}
		} catch (err) {
			complete.error(err instanceof Error ? err.message : 'Failed to load logs');
		} finally {
			isLoadingLogs = false;
		}
	}

	async function handleReboot() {
		if (isRebooting) return;

		// Confirm before reboot
		const confirmed = confirm(`Are you sure you want to reboot "${agent.name}"? This will restart the agent.`);
		if (!confirmed) return;

		isRebooting = true;
		const complete = toastStore.async(`Rebooting ${agent.name}...`);

		try {
			const response = await fetch(`/api/gastown/agents/${encodeURIComponent(agent.id || agent.name)}/reboot`, {
				method: 'POST'
			});
			const result = await response.json();

			if (!response.ok) {
				complete.error(result.error || 'Reboot failed');
				return;
			}

			if (result.demo) {
				complete.info(result.message);
			} else {
				complete.success(result.message || `${agent.name} reboot initiated`);
			}

			// Refresh the page after a short delay to show updated status
			setTimeout(() => {
				goto(`/agents/${agent.id || agent.name}`, { invalidateAll: true });
			}, 2000);
		} catch (err) {
			complete.error(err instanceof Error ? err.message : 'Reboot failed');
		} finally {
			isRebooting = false;
		}
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<!-- Header with Back Button -->
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
			<div class="container flex items-center gap-3">
				<button
					onclick={goBack}
					class="touch-target-interactive p-2 -m-2 hover:bg-muted rounded-lg transition-colors"
					aria-label="Back to agents"
					title="Back to agents"
				>
					<ArrowLeft class="w-5 h-5 text-foreground" strokeWidth={2} />
				</button>
				<div class="flex-1">
					<h1 class="text-2xl font-semibold text-foreground">{agent.name}</h1>
					<p class="text-sm text-muted-foreground">{roleLabels[agent.role || 'undefined']}</p>
				</div>
				<StatusIndicator status={statusIndicatorMap[agent.status ?? 'idle']} size="lg" />
			</div>
		</header>

		<main class="container py-6 pb-20">
			<!-- Hero Card Section -->
			<section class="panel-glass rounded-lg p-8 mx-auto mb-8 max-w-2xl">
				<div class="flex flex-col sm:flex-row items-center gap-6">
					<!-- Icon -->
					<div class="flex-shrink-0">
						<div class="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
							<RoleIcon class="w-10 h-10 text-primary" strokeWidth={2} />
						</div>
					</div>

					<!-- Info -->
					<div class="flex-1 text-center sm:text-left">
						<h2 class="text-3xl font-bold text-foreground mb-2">{agent.name}</h2>
						<div class="flex items-center gap-2 justify-center sm:justify-start mb-4">
							<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-sm font-medium">
								<span class="w-2 h-2 rounded-full {agent.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-muted'}"></span>
								{statusLabels[agent.status ?? 'idle']}
							</span>
						</div>
						<p class="text-muted-foreground">{agent.task}</p>
					</div>
				</div>
			</section>

			<!-- Quick Stats Grid -->
			{#if agent.uptimePercent !== undefined || agent.efficiency !== undefined || agent.lastSeen || agent.uptime}
				<section class="grid grid-cols-2 sm:grid-cols-4 gap-4 mx-auto mb-8 max-w-2xl">
					{#if agent.uptimePercent !== undefined}
						<div class="panel-glass rounded-lg p-4">
							<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Uptime</p>
							<p class="text-2xl font-bold text-foreground">{agent.uptimePercent.toFixed(1)}%</p>
						</div>
					{/if}

					{#if agent.efficiency !== undefined}
						<div class="panel-glass rounded-lg p-4">
							<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Efficiency</p>
							<p class="text-2xl font-bold text-foreground">{agent.efficiency}%</p>
						</div>
					{/if}

					{#if agent.lastSeen}
						<div class="panel-glass rounded-lg p-4">
							<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Last Seen</p>
							<p class="text-lg font-semibold text-foreground">{agent.lastSeen}</p>
						</div>
					{/if}

					{#if agent.uptime}
						<div class="panel-glass rounded-lg p-4">
							<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Uptime Duration</p>
							<p class="text-lg font-semibold text-foreground">{agent.uptime}</p>
						</div>
					{/if}
				</section>
			{/if}

			<!-- Agent Details -->
			<section class="panel-glass rounded-lg p-6 mx-auto mb-8 max-w-2xl">
				<h3 class="text-lg font-semibold text-foreground mb-6">Agent Details</h3>

				<div class="space-y-4">
					<!-- Name -->
					<div>
						<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Name</p>
						<p class="text-foreground">{agent.name}</p>
					</div>

					<!-- Role -->
					{#if agent.role}
						<div>
							<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Role</p>
							<div class="flex items-center gap-2">
								<RoleIcon class="w-4 h-4 text-muted-foreground" strokeWidth={2} />
								<p class="text-foreground">{roleLabels[agent.role] || agent.role}</p>
							</div>
						</div>
					{/if}

					<!-- Status -->
					<div>
						<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Status</p>
						<p class="text-foreground">{statusLabels[agent.status ?? 'idle']}</p>
					</div>

					<!-- Task -->
					{#if agent.task}
						<div>
							<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Current Task</p>
							<p class="text-foreground line-clamp-2">{agent.task}</p>
						</div>
					{/if}

					<!-- Address/Meta -->
					{#if agent.meta}
						<div>
							<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Address</p>
							<p class="font-mono text-sm text-foreground">{agent.meta}</p>
						</div>
					{/if}

					<!-- Progress (if running) -->
					{#if agent.status === 'running' && agent.progress > 0}
						<div>
							<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Progress</p>
							<div class="flex items-center gap-3">
								<div class="flex-1">
									<ProgressBar value={agent.progress} size="sm" color="default" />
								</div>
								<span class="text-sm font-medium text-foreground min-w-12">{Math.round(agent.progress)}%</span>
							</div>
						</div>
					{/if}

					<!-- Error Message (if error state) -->
					{#if agent.status === 'error' && agent.errorMessage}
						<div class="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
							<p class="text-sm text-destructive font-medium flex items-start gap-2">
								<AlertTriangle class="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
								{agent.errorMessage}
							</p>
						</div>
					{/if}
				</div>
			</section>

			<!-- Action Buttons -->
			<section class="flex flex-col sm:flex-row gap-3 mx-auto max-w-2xl mb-8">
				<button
					onclick={handleInspect}
					class="touch-target-interactive flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
					aria-label="Inspect agent"
				>
					<Search class="w-4 h-4" strokeWidth={2} />
					Inspect
				</button>

				<button
					onclick={handleViewLogs}
					disabled={isLoadingLogs}
					class="touch-target-interactive flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					aria-label="View logs"
				>
					{#if isLoadingLogs}
						<Loader2 class="w-4 h-4 animate-spin" strokeWidth={2} />
					{:else}
						<Clock class="w-4 h-4" strokeWidth={2} />
					{/if}
					Logs
				</button>

				{#if agent.status !== 'error'}
					<button
						onclick={handleReboot}
						disabled={isRebooting}
						class="touch-target-interactive flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 text-destructive font-medium rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="Reboot agent"
					>
						{#if isRebooting}
							<Loader2 class="w-4 h-4 animate-spin" strokeWidth={2} />
						{:else}
							<RefreshCw class="w-4 h-4" strokeWidth={2} />
						{/if}
						Reboot
					</button>
				{/if}
			</section>
		</main>
	</div>
</div>
