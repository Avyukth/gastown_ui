<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { AgentDetailLayout, LogEntry } from '$lib/components';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const agent = $derived(data.agent);

	// Nudge input state
	let nudgeMessage = $state('');
	let isSubmitting = $state(false);

	// Show success/error feedback
	let feedbackMessage = $state('');
	let feedbackType = $state<'success' | 'error'>('success');

	function showFeedback(message: string, type: 'success' | 'error' = 'success') {
		feedbackMessage = message;
		feedbackType = type;
		setTimeout(() => {
			feedbackMessage = '';
		}, 3000);
	}

	// Handle form submission results
	$effect(() => {
		if (form?.success) {
			if (form.action === 'nudge') {
				nudgeMessage = '';
				showFeedback('Nudge sent successfully');
			} else if (form.action === 'start') {
				showFeedback('Session started');
			} else if (form.action === 'stop') {
				showFeedback('Session stopped');
			} else if (form.action === 'restart') {
				showFeedback('Session restarted');
			} else if (form.action === 'peek') {
				showFeedback('Output refreshed');
			}
		} else if (form?.error) {
			showFeedback(form.error, 'error');
		}
	});

	// Format role for display
	const displayRole = $derived(() => {
		if (agent.rig) {
			return `${agent.rig}/${agent.role}`;
		}
		return agent.role;
	});

	// Parse recent output into log entries
	const logEntries = $derived.by(() => {
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

{#snippet details()}
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
{/snippet}

{#snippet logs()}
	{#if logEntries.length > 0}
		{#each logEntries as log, i (log.id)}
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
{/snippet}

{#snippet logActions()}
	<form
		method="POST"
		action="?/peek"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				await update();
				await invalidateAll();
				isSubmitting = false;
			};
		}}
	>
		<button
			type="submit"
			disabled={isSubmitting}
			class="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors disabled:opacity-50"
		>
			{isSubmitting ? 'Refreshing...' : 'Refresh'}
		</button>
	</form>
{/snippet}

{#snippet actions()}
	<a
		href="/agents"
		class="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded transition-colors"
	>
		Back
	</a>
	{#if agent.unreadMail > 0}
		<a
			href="/mail"
			class="px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
		>
			View Mail ({agent.unreadMail})
		</a>
	{/if}

	<!-- Session controls dropdown/buttons -->
	<div class="flex items-center gap-1">
		{#if agent.status === 'running' || agent.status === 'idle'}
			<form method="POST" action="?/stop" use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					await invalidateAll();
					isSubmitting = false;
				};
			}}>
				<button
					type="submit"
					disabled={isSubmitting}
					class="px-3 py-1.5 text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors disabled:opacity-50"
				>
					Stop
				</button>
			</form>
			<form method="POST" action="?/restart" use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					await invalidateAll();
					isSubmitting = false;
				};
			}}>
				<button
					type="submit"
					disabled={isSubmitting}
					class="px-3 py-1.5 text-sm bg-warning/10 text-warning hover:bg-warning/20 rounded transition-colors disabled:opacity-50"
				>
					Restart
				</button>
			</form>
		{:else}
			<form method="POST" action="?/start" use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					await invalidateAll();
					isSubmitting = false;
				};
			}}>
				<button
					type="submit"
					disabled={isSubmitting}
					class="px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors disabled:opacity-50"
				>
					Start
				</button>
			</form>
		{/if}
	</div>
{/snippet}

{#snippet footer()}
	<!-- Feedback toast -->
	{#if feedbackMessage}
		<div
			class="fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 transition-opacity {feedbackType === 'success' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}"
		>
			{feedbackMessage}
		</div>
	{/if}

	<!-- Nudge input -->
	<form
		method="POST"
		action="?/nudge"
		class="flex gap-2"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				await update();
				isSubmitting = false;
			};
		}}
	>
		<input
			type="text"
			name="message"
			bind:value={nudgeMessage}
			placeholder="Send message to session..."
			class="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
		/>
		<button
			type="submit"
			disabled={isSubmitting || !nudgeMessage.trim()}
			class="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{isSubmitting ? 'Sending...' : 'Nudge'}
		</button>
	</form>
{/snippet}

<AgentDetailLayout
	name={agent.name}
	status={agent.status}
	task={agent.hasWork ? agent.firstSubject || 'Working...' : 'No active work'}
	meta={agent.address}
	{details}
	{logs}
	{logActions}
	{actions}
	{footer}
/>
