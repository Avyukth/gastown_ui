<script lang="ts">
	import { AgentCard, GridPattern, SwipeableItem } from '$lib/components';
	import { goto } from '$app/navigation';
	import { Search, RefreshCw } from 'lucide-svelte';

	const { data } = $props();

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
	<GridPattern variant="dots" opacity={0.15} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
			<div class="container">
				<h1 class="text-xl font-semibold text-foreground">Agents</h1>
				<p class="text-sm text-muted-foreground">All active agents in Gas Town</p>
			</div>
		</header>

		<main class="container py-6">
			{#if data.error}
				<div class="panel-glass p-6 border-status-offline/30">
					<p class="text-status-offline font-medium">Failed to load agents</p>
					<p class="text-sm text-muted-foreground mt-1">{data.error}</p>
				</div>
			{:else if data.agents.length === 0}
				<div class="panel-glass p-6">
					<p class="text-muted-foreground">No agents found</p>
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
									task={agent.task}
									status={agent.status}
									progress={agent.progress}
									meta={agent.meta}
									uptime={agent.uptime}
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
								task={agent.task}
								status={agent.status}
								progress={agent.progress}
								meta={agent.meta}
								uptime={agent.uptime}
								errorMessage={agent.errorMessage}
								compact={true}
							/>
						</a>
					{/each}
				</div>
			{/if}
		</main>
	</div>
</div>
