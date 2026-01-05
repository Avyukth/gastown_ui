<script lang="ts">
	import { DashboardLayout, AgentCard } from '$lib/components';

	let { data } = $props();

	const { agents, stats, systemStatus, townName, error } = data;
</script>

<DashboardLayout title={townName} {systemStatus}>
	<svelte:fragment slot="stats">
		<div class="card-glass p-4">
			<div class="text-sm text-muted-foreground">Active Agents</div>
			<div class="text-2xl font-bold text-foreground">{stats.activeAgents}</div>
		</div>
		<div class="card-glass p-4">
			<div class="text-sm text-muted-foreground">Tasks Running</div>
			<div class="text-2xl font-bold text-foreground">{stats.tasksRunning}</div>
		</div>
		<div class="card-glass p-4">
			<div class="text-sm text-muted-foreground">Polecats</div>
			<div class="text-2xl font-bold text-foreground">{stats.queueDepth}</div>
		</div>
		<div class="card-glass p-4">
			<div class="text-sm text-muted-foreground">Completed Today</div>
			<div class="text-2xl font-bold text-foreground">{stats.completedToday}</div>
		</div>
	</svelte:fragment>

	<svelte:fragment slot="agents">
		{#if error}
			<div class="col-span-full panel-glass p-6 text-center">
				<p class="text-status-offline font-medium">Failed to load agents</p>
				<p class="text-sm text-muted-foreground mt-2">{error}</p>
			</div>
		{:else if agents.length === 0}
			<div class="col-span-full panel-glass p-6 text-center">
				<p class="text-muted-foreground">No agents running</p>
			</div>
		{:else}
			{#each agents as agent (agent.id)}
				<AgentCard
					name={agent.name}
					task={agent.task}
					status={agent.status}
					progress={agent.progress}
					meta={agent.meta}
				/>
			{/each}
		{/if}
	</svelte:fragment>
</DashboardLayout>
