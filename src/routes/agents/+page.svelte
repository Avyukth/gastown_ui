<script lang="ts">
	import { AgentCard, GridPattern } from '$lib/components';

	// Mock agents data - in real app from +page.ts load function
	const agents = [
		{
			id: 'mayor',
			name: 'Mayor',
			task: 'Coordinating cross-rig work',
			status: 'running' as const,
			progress: 100,
			meta: 'gastownui coordinator'
		},
		{
			id: 'witness-1',
			name: 'Witness',
			task: 'Monitoring polecat health',
			status: 'idle' as const,
			progress: 0,
			meta: 'gastownui/witness'
		},
		{
			id: 'refinery',
			name: 'Refinery',
			task: 'Processing merge queue',
			status: 'running' as const,
			progress: 45,
			meta: 'gastownui/refinery'
		},
		{
			id: 'polecat-nux',
			name: 'Polecat Nux',
			task: 'Code splitting implementation',
			status: 'running' as const,
			progress: 67,
			meta: 'gastownui/polecats/nux'
		},
		{
			id: 'polecat-rux',
			name: 'Polecat Rux',
			task: 'Waiting for work',
			status: 'idle' as const,
			progress: 0,
			meta: 'gastownui/polecats/rux'
		}
	];
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
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{#each agents as agent}
					<a href="/agents/{agent.id}" class="block transition-transform hover:scale-[1.02]">
						<AgentCard
							name={agent.name}
							task={agent.task}
							status={agent.status}
							progress={agent.progress}
							meta={agent.meta}
						/>
					</a>
				{/each}
			</div>
		</main>
	</div>
</div>
