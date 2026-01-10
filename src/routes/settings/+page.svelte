<script lang="ts">
	import { enhance } from '$app/forms';
	import { GridPattern } from '$lib/components';
	import { cn } from '$lib/utils';
	import { themeStore, type Theme } from '$lib/stores';
	import { Trash2, Sun, Moon, Monitor, Palette, Bot, Settings, AlertTriangle, Info } from 'lucide-svelte';
	import type { ComponentType } from 'svelte';

	const { data, form } = $props();

	let selectedAgent = $state('');
	let showAddAgent = $state(false);

	// Sync selected agent from data
	$effect(() => {
		selectedAgent = data.defaultAgent;
	});
	let newAgentName = $state('');
	let newAgentCommand = $state('');

	// Patrol mute dialog state
	let muteDialogPatrolId = $state<string | null>(null);
	let muteReason = $state('');

	// Theme options using shared store
	const themeOptions: Array<{ value: Theme; label: string; icon: ComponentType }> = [
		{ value: 'dark', label: 'Dark', icon: Moon },
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'system', label: 'System', icon: Monitor }
	];

	function getThemeIndex() {
		const index = themeOptions.findIndex((option) => option.value === themeStore.theme);
		return index === -1 ? 0 : index;
	}
</script>

<svelte:head>
	<title>Settings | Gas Town</title>
</svelte:head>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass px-4 h-[72px] relative">
			<div class="container h-full flex items-center gap-3">
				<div class="w-1.5 h-8 bg-primary rounded-sm shadow-glow shrink-0" aria-hidden="true"></div>
				<div>
					<h1 class="text-2xl font-display font-semibold text-foreground">Settings</h1>
					<p class="text-sm text-muted-foreground">Configure Gas Town preferences</p>
				</div>
			</div>
			<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true"></div>
		</header>

		<main class="container py-6 space-y-6">
			{#if data.error}
				<div class="panel-glass p-6 border-status-offline/30">
					<p class="text-status-offline font-medium">Failed to load settings</p>
					<p class="text-sm text-muted-foreground mt-1">{data.error}</p>
				</div>
			{/if}

			{#if form?.error}
				<div class="panel-glass p-4 border-destructive/30 bg-destructive/5">
					<p class="text-destructive text-sm font-medium">{form.error}</p>
				</div>
			{/if}

			{#if form?.success}
				<div class="panel-glass p-4 border-success/30 bg-success/5">
					<p class="text-success text-sm font-medium">Settings updated successfully</p>
				</div>
			{/if}

			<!-- Theme Selection -->
			<section class="panel-glass p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<Palette size={24} strokeWidth={1.5} class="text-primary" />
					</div>
					<div>
						<h2 class="text-lg font-semibold text-foreground">Appearance</h2>
						<p class="text-sm text-muted-foreground">Choose your preferred theme</p>
					</div>
				</div>

				<div class="flex items-center">
					<div class="relative flex items-center rounded-lg border border-border bg-muted/40 p-1 shadow-sm">
						<div
							class="pointer-events-none absolute top-1 left-1 h-8 w-[calc((100%-0.5rem)/3)] rounded-md bg-card shadow-sm transition-transform duration-300 ease-out"
							style={`transform: translateX(${getThemeIndex() * 100}%)`}
						></div>
						{#each themeOptions as option}
							<button
								type="button"
								onclick={() => themeStore.set(option.value)}
								aria-pressed={themeStore.theme === option.value}
								class={cn(
									'relative z-10 flex h-8 w-20 items-center justify-center gap-1 rounded-md px-2 text-xs font-semibold uppercase tracking-wide transition-all',
									'hover:text-foreground',
									themeStore.theme === option.value ? 'text-foreground' : 'text-muted-foreground'
								)}
							>
								<span class="flex items-center justify-center">
									<option.icon size={14} strokeWidth={1.8} />
								</span>
								<span class="hidden sm:inline">{option.label}</span>
							</button>
						{/each}
					</div>
				</div>
			</section>

			<!-- Default Agent Selection -->
			<section class="panel-glass p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<Bot size={24} strokeWidth={1.5} class="text-primary" />
					</div>
					<div>
						<h2 class="text-lg font-semibold text-foreground">Default Agent</h2>
						<p class="text-sm text-muted-foreground">Agent used for new workers</p>
					</div>
				</div>

				<form method="POST" action="?/setDefaultAgent" use:enhance class="space-y-4">
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
						{#each data.agents as agent}
							<label
								class={cn(
									'p-4 rounded-lg border-2 cursor-pointer transition-all',
									'flex items-center gap-3',
									'hover:border-primary/50',
									selectedAgent === agent.name
										? 'border-primary bg-primary/5'
										: 'border-border bg-card'
								)}
							>
								<input
									type="radio"
									name="agent"
									value={agent.name}
									bind:group={selectedAgent}
									class="sr-only"
								/>
								<div class="flex-1 min-w-0">
									<p class="font-medium text-foreground capitalize">{agent.name}</p>
									<p class="text-xs text-muted-foreground font-mono truncate">
										{agent.command} {agent.args}
									</p>
								</div>
								{#if agent.is_custom}
									<span class="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-full">Custom</span>
								{/if}
							</label>
						{/each}
					</div>

					<button
						type="submit"
						disabled={selectedAgent === data.defaultAgent}
						class={cn(
							'px-4 py-2 rounded-md font-medium text-sm transition-all',
							'bg-primary text-primary-foreground hover:bg-primary/90',
							'disabled:opacity-50 disabled:cursor-not-allowed'
						)}
					>
						Save Default Agent
					</button>
				</form>
			</section>

			<!-- Agent Configuration -->
			<section class="panel-glass p-6">
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Settings size={24} strokeWidth={1.5} class="text-primary" />
						</div>
						<div>
							<h2 class="text-lg font-semibold text-foreground">Agent Configuration</h2>
							<p class="text-sm text-muted-foreground">Manage available agents</p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => showAddAgent = !showAddAgent}
						class={cn(
							'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
							'border border-border hover:bg-accent/10',
							showAddAgent && 'bg-accent/10'
						)}
					>
						{showAddAgent ? 'Cancel' : '+ Add Agent'}
					</button>
				</div>

				{#if showAddAgent}
					<form method="POST" action="?/addAgent" use:enhance class="mb-6 p-4 rounded-lg bg-secondary/30 border border-border space-y-4">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label for="new-agent-name" class="block text-sm font-medium text-muted-foreground mb-1">
									Agent Name
								</label>
								<input
									id="new-agent-name"
									type="text"
									name="name"
									bind:value={newAgentName}
									placeholder="my-agent"
									required
									class="w-full h-10 px-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>
							<div>
								<label for="new-agent-command" class="block text-sm font-medium text-muted-foreground mb-1">
									Command
								</label>
								<input
									id="new-agent-command"
									type="text"
									name="command"
									bind:value={newAgentCommand}
									placeholder="my-cli --flag"
									required
									class="w-full h-10 px-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>
						</div>
						<button
							type="submit"
							class="px-4 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
						>
							Add Agent
						</button>
					</form>
				{/if}

				<div class="space-y-2">
					{#each data.agents as agent}
						<div class="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<p class="font-medium text-foreground capitalize">{agent.name}</p>
									{#if agent.name === data.defaultAgent}
										<span class="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">Default</span>
									{/if}
									{#if agent.is_custom}
										<span class="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-full">Custom</span>
									{/if}
								</div>
								<p class="text-sm text-muted-foreground font-mono mt-0.5">
									{agent.command} {agent.args}
								</p>
							</div>
							{#if agent.is_custom}
								<form method="POST" action="?/removeAgent" use:enhance>
									<input type="hidden" name="name" value={agent.name} />
									<button
										type="submit"
										class="p-2 text-muted-foreground hover:text-destructive transition-colors"
										title="Remove agent"
									>
<Trash2 class="w-4 h-4" />
									</button>
								</form>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			<!-- Patrol Controls -->
			<section class="panel-glass p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<AlertTriangle size={24} strokeWidth={1.5} class="text-primary" />
					</div>
					<div>
						<h2 class="text-lg font-semibold text-foreground">Patrol Controls</h2>
						<p class="text-sm text-muted-foreground">Manage agent patrol state (mute/unmute)</p>
					</div>
				</div>

				{#if data.patrols.length === 0}
					<p class="text-sm text-muted-foreground">No patrol molecules found.</p>
				{:else}
					<div class="space-y-3">
						{#each data.patrols as patrol}
							<div class="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<p class="font-medium text-foreground">{patrol.title}</p>
										<span
											class={cn(
												'text-xs px-2 py-0.5 rounded-full',
												patrol.state === 'active'
													? 'bg-status-active/20 text-status-active'
													: patrol.state === 'muted'
														? 'bg-status-offline/20 text-status-offline'
														: 'bg-muted/20 text-muted-foreground'
											)}
										>
											{patrol.state === 'active' ? 'Active' : patrol.state === 'muted' ? 'Muted' : 'Unknown'}
										</span>
									</div>
									<p class="text-sm text-muted-foreground mt-0.5">{patrol.description}</p>
									{#if patrol.state === 'muted' && patrol.muteReason}
										<p class="text-xs text-status-offline mt-1">
											Reason: {patrol.muteReason}
										</p>
									{/if}
									<p class="text-xs text-muted-foreground/60 font-mono mt-1">{patrol.id}</p>
								</div>
								<div class="flex items-center gap-2 ml-4">
									{#if patrol.state === 'active' || patrol.state === 'unknown'}
										<button
											type="button"
											onclick={() => {
												muteDialogPatrolId = patrol.id;
												muteReason = '';
											}}
											class="px-3 py-1.5 text-sm font-medium rounded-md bg-status-offline/10 text-status-offline hover:bg-status-offline/20 transition-all"
										>
											Mute
										</button>
									{:else}
										<form method="POST" action="?/unmutePatrol" use:enhance>
											<input type="hidden" name="patrolId" value={patrol.id} />
											<button
												type="submit"
												class="px-3 py-1.5 text-sm font-medium rounded-md bg-status-active/10 text-status-active hover:bg-status-active/20 transition-all"
											>
												Unmute
											</button>
										</form>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Mute Dialog -->
				{#if muteDialogPatrolId}
					<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
						<div class="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
							<h3 class="text-lg font-semibold text-foreground mb-2">Mute Patrol</h3>
							<p class="text-sm text-muted-foreground mb-4">
								Provide a reason for muting this patrol. The patrol will stop monitoring until unmuted.
							</p>
							<form
								method="POST"
								action="?/mutePatrol"
								use:enhance={() => {
									return async ({ update }) => {
										await update();
										muteDialogPatrolId = null;
										muteReason = '';
									};
								}}
							>
								<input type="hidden" name="patrolId" value={muteDialogPatrolId} />
								<div class="mb-4">
									<label for="mute-reason" class="block text-sm font-medium text-muted-foreground mb-1">
										Reason
									</label>
									<input
										id="mute-reason"
										type="text"
										name="reason"
										bind:value={muteReason}
										placeholder="e.g., Investigating issue, maintenance..."
										class="w-full h-10 px-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
									/>
								</div>
								<div class="flex justify-end gap-2">
									<button
										type="button"
										onclick={() => {
											muteDialogPatrolId = null;
											muteReason = '';
										}}
										class="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-accent/10 transition-all"
									>
										Cancel
									</button>
									<button
										type="submit"
										class="px-4 py-2 text-sm font-medium rounded-md bg-status-offline text-white hover:bg-status-offline/90 transition-all"
									>
										Mute Patrol
									</button>
								</div>
							</form>
						</div>
					</div>
				{/if}
			</section>

			<!-- Info Section -->
			<section class="panel-glass p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<Info size={24} strokeWidth={1.5} class="text-primary" />
					</div>
					<div>
						<h2 class="text-lg font-semibold text-foreground">About Gas Town</h2>
						<p class="text-sm text-muted-foreground">System information</p>
					</div>
				</div>

				<dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
					<div>
						<dt class="text-muted-foreground">Configuration</dt>
						<dd class="font-mono text-foreground">gt config</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Default Agent</dt>
						<dd class="font-mono text-foreground">{data.defaultAgent}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Available Agents</dt>
						<dd class="font-mono text-foreground">{data.agents.length}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Custom Agents</dt>
						<dd class="font-mono text-foreground">{data.agents.filter(a => a.is_custom).length}</dd>
					</div>
				</dl>
			</section>
		</main>
	</div>
</div>
