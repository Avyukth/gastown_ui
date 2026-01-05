<script lang="ts">
	import { page } from '$app/stores';
	import { AgentDetailLayout, LogEntry } from '$lib/components';

	// Get agent ID from route params
	const agentId = $derived($page.params.id);

	// Mock agent data - in real app from +page.ts load function
	const agentData = $derived.by(() => {
		const agents: Record<string, { name: string; status: 'running' | 'idle' | 'error'; task: string; meta: string }> = {
			mayor: {
				name: 'Mayor',
				status: 'running',
				task: 'Coordinating cross-rig work',
				meta: 'gastownui coordinator'
			},
			'witness-1': {
				name: 'Witness',
				status: 'idle',
				task: 'Monitoring polecat health',
				meta: 'gastownui/witness'
			},
			refinery: {
				name: 'Refinery',
				status: 'running',
				task: 'Processing merge queue',
				meta: 'gastownui/refinery'
			},
			'polecat-nux': {
				name: 'Polecat Nux',
				status: 'running',
				task: 'Code splitting implementation',
				meta: 'gastownui/polecats/nux'
			},
			'polecat-rux': {
				name: 'Polecat Rux',
				status: 'idle',
				task: 'Waiting for work',
				meta: 'gastownui/polecats/rux'
			}
		};
		return agents[agentId] ?? { name: 'Unknown', status: 'idle' as const, task: '', meta: '' };
	});

	// Mock logs for this agent
	const logs = [
		{ timestamp: '17:10:05', level: 'INF' as const, message: 'Started work on ga-6vy' },
		{ timestamp: '17:10:12', level: 'INF' as const, message: 'Reading codebase structure' },
		{ timestamp: '17:10:45', level: 'INF' as const, message: 'Creating routes directory' },
		{ timestamp: '17:11:20', level: 'INF' as const, message: 'Implementing preload utility' },
		{ timestamp: '17:12:00', level: 'WRN' as const, message: 'Context usage at 45%' }
	];
</script>

<AgentDetailLayout
	name={agentData.name}
	status={agentData.status}
	task={agentData.task}
	meta={agentData.meta}
>
	<svelte:fragment slot="details">
		<dl class="space-y-2 text-sm">
			<div class="flex justify-between">
				<dt class="text-muted-foreground">Agent ID</dt>
				<dd class="font-mono text-foreground">{agentId}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-muted-foreground">Role</dt>
				<dd class="text-foreground">{agentData.meta}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-muted-foreground">Uptime</dt>
				<dd class="text-foreground">2h 34m</dd>
			</div>
		</dl>
	</svelte:fragment>

	<svelte:fragment slot="logs">
		{#each logs as log, i}
			<LogEntry
				timestamp={log.timestamp}
				level={log.level}
				message={log.message}
				delay={i * 50}
			/>
		{/each}
	</svelte:fragment>

	<svelte:fragment slot="actions">
		<button class="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded transition-colors">
			Pause
		</button>
		<button class="px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors">
			View Mail
		</button>
	</svelte:fragment>
</AgentDetailLayout>
