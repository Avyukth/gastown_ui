<script lang="ts">
	import { AgentDetailLayout, LogEntry } from '$lib/components';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const agent = $derived(data.agent);

	// Format role for display
	const displayRole = $derived(() => {
		if (agent.rig) {
			return `${agent.rig}/${agent.role}`;
		}
		return agent.role;
	});

	// Parse recent output into log entries
	const logs = $derived.by(() => {
		if (!agent.recentOutput) return [];

		const lines = agent.recentOutput.split('\n').filter((line) => line.trim());
		// Take last 50 lines, reverse to show newest first
		return lines.slice(-50).reverse().map((line, i) => {
			// Try to detect log level from content
			let level: 'INF' | 'WRN' | 'ERR' | 'DBG' = 'INF';
			if (line.toLowerCase().includes('error') || line.toLowerCase().includes('fail')) {
				level = 'ERR';
			} else if (line.toLowerCase().includes('warn')) {
				level = 'WRN';
			} else if (line.toLowerCase().includes('debug')) {
				level = 'DBG';
			}

			return {
				id: `log-${i}`,
				timestamp: '',
				level,
				message: line.slice(0, 200) // Truncate long lines
			};
		});
	});
</script>

<svelte:head>
	<title>{agent.name} | Gas Town</title>
</svelte:head>

<AgentDetailLayout
	name={agent.name}
	status={agent.status}
	task={agent.hasWork ? agent.firstSubject || 'Working...' : 'No active work'}
	meta={agent.address}
>
	<svelte:fragment slot="details">
		<dl class="space-y-2 text-sm">
			<div class="flex justify-between">
				<dt class="text-muted-foreground">Agent ID</dt>
				<dd class="font-mono text-foreground">{agent.id}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-muted-foreground">Role</dt>
				<dd class="text-foreground">{displayRole()}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-muted-foreground">Session</dt>
				<dd class="font-mono text-foreground text-xs">{agent.session}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-muted-foreground">Status</dt>
				<dd class="text-foreground capitalize">{agent.status}</dd>
			</div>
			{#if agent.unreadMail > 0}
				<div class="flex justify-between">
					<dt class="text-muted-foreground">Unread Mail</dt>
					<dd class="text-foreground">{agent.unreadMail}</dd>
				</div>
			{/if}
			{#if agent.rig}
				<div class="flex justify-between">
					<dt class="text-muted-foreground">Rig</dt>
					<dd class="text-foreground">{agent.rig}</dd>
				</div>
			{/if}
		</dl>
	</svelte:fragment>

	<svelte:fragment slot="logs">
		{#if logs.length > 0}
			{#each logs as log, i (log.id)}
				<LogEntry
					timestamp={log.timestamp}
					level={log.level}
					message={log.message}
					delay={i * 20}
				/>
			{/each}
		{:else}
			<div class="p-4 text-center text-muted-foreground">
				<p>No recent output available</p>
			</div>
		{/if}
	</svelte:fragment>

	<svelte:fragment slot="actions">
		<a
			href="/agents"
			class="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded transition-colors"
		>
			Back
		</a>
		{#if agent.unreadMail > 0}
			<button class="px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors">
				View Mail ({agent.unreadMail})
			</button>
		{/if}
	</svelte:fragment>
</AgentDetailLayout>
