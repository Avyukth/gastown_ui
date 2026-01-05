<script lang="ts">
	import { DashboardLayout, AgentCard } from '$lib/components';

	// Mock data - in real app this would come from +page.ts load function
	const systemStatus = 'running' as const;

	// Simulated agents data
	const agents = [
		{
			id: 'mayor',
			name: 'Mayor',
			task: 'Coordinating cross-rig work',
			status: 'running' as const,
			progress: 100,
			meta: 'Last activity: 2 min ago'
		},
		{
			id: 'witness-1',
			name: 'Witness',
			task: 'Monitoring polecat health',
			status: 'idle' as const,
			progress: 0,
			meta: 'Last activity: 5 min ago'
		},
		{
			id: 'polecat-1',
			name: 'Polecat Alpha',
			task: 'Implementing code splitting',
			status: 'running' as const,
			progress: 67,
			meta: 'Last activity: Just now'
		}
	];
</script>

<DashboardLayout title="Gas Town" {systemStatus}>
	<svelte:fragment slot="stats">
		<div class="card-glass p-4">
			<div class="text-sm text-muted-foreground">Active Agents</div>
			<div class="text-2xl font-bold text-foreground">3</div>
		</div>
		<div class="card-glass p-4">
			<div class="text-sm text-muted-foreground">Tasks Running</div>
			<div class="text-2xl font-bold text-foreground">7</div>
		</div>
		<div class="card-glass p-4">
			<div class="text-sm text-muted-foreground">Queue Depth</div>
			<div class="text-2xl font-bold text-foreground">12</div>
		</div>
		<div class="card-glass p-4">
			<div class="text-sm text-muted-foreground">Completed Today</div>
			<div class="text-2xl font-bold text-foreground">42</div>
		</div>
	</svelte:fragment>

	<svelte:fragment slot="agents">
		{#each agents as agent}
			<AgentCard
				name={agent.name}
				task={agent.task}
				status={agent.status}
				progress={agent.progress}
				meta={agent.meta}
			/>
		{/each}
	</svelte:fragment>
</DashboardLayout>
