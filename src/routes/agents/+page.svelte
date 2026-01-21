<script lang="ts">
	import { AgentCard, GridPattern, SwipeableItem, SkeletonCard, ErrorState, EmptyState, PullToRefresh, PageHeader } from '$lib/components';
	import { goto } from '$app/navigation';
	import { Search, RefreshCw, ChevronDown } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils';
	import { toastStore } from '$lib/stores/toast.svelte';

	const { data } = $props();

	let isLoading = $state(true);
	let localError = $state<string | null>(null);
	const error = $derived(localError ?? data.error ?? null);

	// Filter state
	let filters = $state({
		status: 'all' as 'all' | 'running' | 'idle' | 'error'
	});

	// Filtered agents
	const filteredAgents = $derived.by(() => {
		let result = [...data.agents];

		if (filters.status !== 'all') {
			result = result.filter(a => a.status === filters.status);
		}

		return result;
	});
	
	async function handleRetry() {
		isLoading = true;
		localError = null;
		try {
			const response = await fetch(window.location.href);
			if (response.ok) {
				// Reload page to get fresh data
				window.location.reload();
			} else {
				localError = 'Failed to refresh agents list';
			}
		} catch (e) {
			localError = e instanceof Error ? e.message : 'Failed to refresh agents';
		} finally {
			isLoading = false;
		}
	}

	async function refresh() {
		isLoading = true;
		localError = null;
		try {
			const response = await fetch(window.location.href);
			if (response.ok) {
				window.location.reload();
			} else {
				localError = 'Failed to refresh agents list';
			}
		} catch (e) {
			localError = e instanceof Error ? e.message : 'Failed to refresh agents';
		} finally {
			isLoading = false;
		}
	}
	
	onMount(() => {
		// Simulate data loading with small delay
		isLoading = false;
	});

	// Loading state for reboot actions
	let rebootingAgents = $state<Set<string>>(new Set());

	// Handler functions for agent actions
	function handleInspect(agentId: string) {
		goto(`/agents/${agentId}`);
	}

	async function handleReboot(agentId: string) {
		if (rebootingAgents.has(agentId)) return;

		// Find agent name for display
		const agent = data.agents.find(a => a.id === agentId);
		const agentName = agent?.name || agentId;

		// Confirm before reboot
		const confirmed = confirm(`Are you sure you want to reboot "${agentName}"? This will restart the agent.`);
		if (!confirmed) return;

		rebootingAgents.add(agentId);
		rebootingAgents = new Set(rebootingAgents); // Trigger reactivity

		const complete = toastStore.async(`Rebooting ${agentName}...`);

		try {
			const response = await fetch(`/api/gastown/agents/${encodeURIComponent(agentId)}/reboot`, {
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
				complete.success(result.message || `${agentName} reboot initiated`);
			}

			// Refresh the page after a short delay to show updated status
			setTimeout(() => {
				window.location.reload();
			}, 2000);
		} catch (err) {
			complete.error(err instanceof Error ? err.message : 'Reboot failed');
		} finally {
			rebootingAgents.delete(agentId);
			rebootingAgents = new Set(rebootingAgents); // Trigger reactivity
		}
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<PageHeader
			title="Agents"
			subtitle="Showing {filteredAgents.length} of {data.agents.length} agents"
			showAccentBar={true}
		>
			{#snippet actions()}
				<!-- Status filter dropdown -->
				<div class="relative inline-block">
					<select
						bind:value={filters.status}
						class="px-3 py-1 text-xs bg-muted text-muted-foreground rounded border border-border
							   appearance-none pr-8 cursor-pointer
							   focus:outline-none focus:ring-2 focus:ring-ring"
					>
						<option value="all">All Status</option>
						<option value="running">Running</option>
						<option value="idle">Idle</option>
						<option value="error">Error</option>
					</select>
					<ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
				</div>
			{/snippet}
		</PageHeader>

		<PullToRefresh onRefresh={refresh} class="flex-1">
			<main class="container py-6">
				{#if error}
					<ErrorState
						title="Failed to load agents"
						message={error}
						onRetry={handleRetry}
						showRetryButton={true}
					/>
				{:else if isLoading}
					<!-- Show skeleton loaders while loading -->
					<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						<SkeletonCard type="agent" count={6} />
					</div>
				{:else if data.agents.length === 0}
					<div class="max-w-md mx-auto">
						<EmptyState
							title="No agents running"
							description="Start an agent to see it here"
							size="default"
						/>
					</div>
				{:else}
					<!-- Mobile: Expandable cards, Desktop: Clickable grid -->
					{#if filteredAgents.length === 0}
						<div class="text-center py-12">
							<p class="text-muted-foreground">No agents match your filter</p>
						</div>
					{:else}
						<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{#each filteredAgents as agent}
						<!-- Mobile view: Swipeable + Expandable with actions -->
						<div class="md:hidden">
							<SwipeableItem
								variant="card"
								onSwipeLeft={() => handleInspect(agent.id)}
								onSwipeRight={() => handleReboot(agent.id)}
								threshold={60}
								maxReveal={80}
							>
								<AgentCard
									name={agent.name}
									role={agent.role as any}
									task={agent.task}
									status={agent.status}
									progress={agent.progress}
									meta={agent.meta}
									uptime={agent.uptime}
									uptimePercent={agent.uptimePercent}
									efficiency={agent.efficiency}
									lastSeen={agent.lastSeen}
									errorMessage={agent.errorMessage}
									expandable={true}
									onInspect={() => handleInspect(agent.id)}
									onReboot={() => handleReboot(agent.id)}
								/>
								{#snippet leftActions()}
									<div class="flex items-center gap-2 px-4 text-white">
										<Search class="w-5 h-5" />
										<span class="text-sm font-medium">Inspect</span>
									</div>
								{/snippet}
								{#snippet rightActions()}
									<div class="flex items-center gap-2 px-4 text-white">
										<RefreshCw class="w-5 h-5" />
										<span class="text-sm font-medium">Reboot</span>
									</div>
								{/snippet}
							</SwipeableItem>
						</div>
						<!-- Desktop view: Clickable card -->
						<a href="/agents/{agent.id}" class="hidden md:block transition-transform hover:scale-[1.02]">
							<AgentCard
								name={agent.name}
								role={agent.role as any}
								task={agent.task}
								status={agent.status}
								progress={agent.progress}
								meta={agent.meta}
								uptime={agent.uptime}
								uptimePercent={agent.uptimePercent}
								efficiency={agent.efficiency}
								lastSeen={agent.lastSeen}
								errorMessage={agent.errorMessage}
								compact={true}
							/>
						</a>
					{/each}
					</div>
				{/if}
			{/if}
		</main>
		</PullToRefresh>
	</div>
</div>
