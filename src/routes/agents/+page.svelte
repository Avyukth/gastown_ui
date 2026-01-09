<script lang="ts">
	import { AgentCard, GridPattern, SwipeableItem, SkeletonCard, ErrorState, EmptyState, PullToRefresh } from '$lib/components';
	import { goto } from '$app/navigation';
	import { Search, RefreshCw } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const { data } = $props();
	
	let isLoading = $state(true);
	let error = $state(data.error);
	
	async function handleRetry() {
		isLoading = true;
		error = null;
		try {
			const response = await fetch(window.location.href);
			if (response.ok) {
				// Reload page to get fresh data
				window.location.reload();
			} else {
				error = 'Failed to refresh agents list';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to refresh agents';
		} finally {
			isLoading = false;
		}
	}

	async function refresh() {
		isLoading = true;
		error = null;
		try {
			const response = await fetch(window.location.href);
			if (response.ok) {
				window.location.reload();
			} else {
				error = 'Failed to refresh agents list';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to refresh agents';
		} finally {
			isLoading = false;
		}
	}
	
	onMount(() => {
		// Simulate data loading with small delay
		isLoading = false;
	});

	// Handler functions for agent actions
	function handleInspect(agentId: string) {
		goto(`/agents/${agentId}`);
	}

	function handleReboot(agentId: string) {
		// TODO: Implement reboot API call
		console.log('Rebooting agent:', agentId);
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
			<div class="container">
				<h1 class="text-2xl md:text-2xl font-semibold text-foreground">Agents</h1>
				<p class="text-sm text-muted-foreground">All active agents in Gas Town</p>
			</div>
		</header>

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
					<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{#each data.agents as agent}
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
		</main>
		</PullToRefresh>
	</div>
</div>
