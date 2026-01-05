<script lang="ts">
	import { AgentCard, GridPattern } from '$lib/components';
	import { goto } from '$app/navigation';

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
						<!-- Mobile view: Expandable with actions -->
						<div class="md:hidden">
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
