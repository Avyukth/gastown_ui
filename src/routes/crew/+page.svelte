<script lang="ts">
	import { enhance } from '$app/forms';
	import { GridPattern, StatusIndicator } from '$lib/components';
	import { cn } from '$lib/utils';
	import { Plus, Users } from 'lucide-svelte';

	const { data, form } = $props();

	let showAddCrew = $state(false);
	let newCrewName = $state('');
	let selectedRig = $state('');
	let expandedCrew = $state<string | null>(null);
	let peekContent = $state<string | null>(null);
	let peekTarget = $state<string | null>(null);
	let nudgeMessage = $state('');

	function toggleExpand(crewId: string) {
		expandedCrew = expandedCrew === crewId ? null : crewId;
		// Clear peek when closing
		if (expandedCrew !== crewId) {
			peekContent = null;
			peekTarget = null;
		}
	}

	function resetForm() {
		newCrewName = '';
		selectedRig = '';
		showAddCrew = false;
	}

	function getStatusColor(status: string): 'running' | 'idle' | 'error' | 'complete' {
		switch (status) {
			case 'running':
				return 'running';
			case 'idle':
				return 'idle';
			case 'stopped':
				return 'error';
			case 'error':
				return 'error';
			default:
				return 'idle';
		}
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'running':
				return 'Running';
			case 'idle':
				return 'Idle';
			case 'stopped':
				return 'Stopped';
			case 'error':
				return 'Error';
			default:
				return status;
		}
	}

	// Handle peek response
	$effect(() => {
		if (form?.peek) {
			peekContent = form.peek;
			peekTarget = form.peekTarget || null;
		}
	});
</script>

<svelte:head>
	<title>Crew | Gas Town</title>
</svelte:head>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass px-4 h-[72px] relative">
			<div class="container h-full flex items-center gap-3">
				<div class="w-1.5 h-8 bg-primary rounded-sm shadow-glow shrink-0" aria-hidden="true"></div>
				<div>
					<h1 class="text-2xl font-display font-semibold text-foreground">Crew</h1>
					<p class="text-sm text-muted-foreground">Persistent human-managed workers across rigs</p>
				</div>
			</div>
			<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true"></div>
		</header>

		<main class="container py-6 space-y-6">
			{#if data.error}
				<div class="panel-glass p-6 border-status-offline/30">
					<p class="text-status-offline font-medium">Failed to load crew</p>
					<p class="text-sm text-muted-foreground mt-1">{data.error}</p>
				</div>
			{/if}

			{#if form?.error}
				<div class="panel-glass p-4 border-destructive/30 bg-destructive/5">
					<p class="text-destructive text-sm font-medium">{form.error}</p>
				</div>
			{/if}

			{#if form?.success && form?.message}
				<div class="panel-glass p-4 border-success/30 bg-success/5">
					<p class="text-success text-sm font-medium">{form.message}</p>
				</div>
			{/if}

			<!-- Add Crew Section -->
			<section class="panel-glass p-6">
				<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<Plus class="w-5 h-5 text-primary" strokeWidth={2} />
					</div>
					<div>
						<h2 class="text-lg font-semibold text-foreground">Add Crew</h2>
							<p class="text-sm text-muted-foreground">Create a new persistent workspace</p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => (showAddCrew = !showAddCrew)}
						class={cn(
							'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
							'border border-border hover:bg-accent/10',
							showAddCrew && 'bg-accent/10'
						)}
					>
						{showAddCrew ? 'Cancel' : '+ New Crew'}
					</button>
				</div>

				{#if showAddCrew}
					<form
						method="POST"
						action="?/addCrew"
						use:enhance={() => {
							return async ({ result, update }) => {
								await update();
								if (result.type === 'success') {
									resetForm();
								}
							};
						}}
						class="p-4 rounded-lg bg-secondary/30 border border-border space-y-4"
					>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label for="crew-name" class="block text-sm font-medium text-muted-foreground mb-1">
									Crew Name
								</label>
								<input
									id="crew-name"
									type="text"
									name="name"
									bind:value={newCrewName}
									placeholder="dave"
									required
									class="w-full h-10 px-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>
							<div>
								<label for="crew-rig" class="block text-sm font-medium text-muted-foreground mb-1">
									Rig
								</label>
								<select
									id="crew-rig"
									name="rig"
									bind:value={selectedRig}
									required
									class="w-full h-10 px-3 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								>
									<option value="">Select a rig...</option>
									{#each data.rigs as rig}
										<option value={rig}>{rig}</option>
									{/each}
								</select>
							</div>
						</div>
						<button
							type="submit"
							class="px-4 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
						>
							Create Crew
						</button>
					</form>
				{/if}
			</section>

			<!-- Crew List -->
			<section class="panel-glass p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<Users class="w-5 h-5 text-primary" strokeWidth={2} />
					</div>
					<div>
						<h2 class="text-lg font-semibold text-foreground">Active Crew</h2>
						<p class="text-sm text-muted-foreground">
							{data.crew.length} crew member{data.crew.length !== 1 ? 's' : ''} across all rigs
						</p>
					</div>
				</div>

				{#if data.crew.length === 0}
					<div class="p-6 text-center border border-dashed border-border rounded-lg">
						<p class="text-muted-foreground">No crew members</p>
						<p class="text-sm text-muted-foreground/70 mt-1">Create a crew workspace to get started</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each data.crew as member}
							{@const crewId = `${member.rig}/${member.name}`}
							<div class="rounded-lg border border-border bg-card overflow-hidden">
								<!-- Crew Header -->
								<button
									type="button"
									onclick={() => toggleExpand(crewId)}
									class="w-full p-4 flex items-center justify-between hover:bg-accent/5 transition-colors"
								>
									<div class="flex items-center gap-4">
										<StatusIndicator status={getStatusColor(member.status)} size="md" />
										<div class="text-left">
											<p class="font-semibold text-foreground">{member.name}</p>
											<div class="flex items-center gap-3 text-sm text-muted-foreground">
												<span class="text-primary">{member.rig}</span>
												<span class="text-border">|</span>
												<span>{getStatusLabel(member.status)}</span>
												{#if member.branch}
													<span class="text-border">|</span>
													<span class="font-mono text-xs">{member.branch}</span>
												{/if}
											</div>
										</div>
									</div>
									<svg
										class={cn(
											'w-5 h-5 text-muted-foreground transition-transform',
											expandedCrew === crewId && 'rotate-180'
										)}
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="M6 9l6 6 6-6" />
									</svg>
								</button>

								<!-- Crew Detail View -->
								{#if expandedCrew === crewId}
									<div class="border-t border-border p-4 bg-secondary/20 space-y-4">
										<!-- Status Info -->
										<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
											<div>
												<p class="text-muted-foreground">Session</p>
												<p class="font-medium text-foreground">
													{member.session || 'None'}
												</p>
											</div>
											<div>
												<p class="text-muted-foreground">Current Work</p>
												<p class="font-medium text-foreground truncate" title={member.currentWork}>
													{member.currentWork}
												</p>
											</div>
											<div>
												<p class="text-muted-foreground">Last Activity</p>
												<p class="font-medium text-foreground">{member.lastActivity}</p>
											</div>
											<div>
												<p class="text-muted-foreground">Git Status</p>
												<p class="font-medium text-foreground">
													{#if member.gitStatus.clean}
														<span class="text-status-online">Clean</span>
													{:else}
														<span class="text-status-warning">
															{member.gitStatus.staged}S {member.gitStatus.modified}M {member.gitStatus.untracked}U
														</span>
													{/if}
												</p>
											</div>
										</div>

										<!-- Peek Output -->
										{#if peekContent && peekTarget === crewId}
											<div class="p-3 bg-background rounded-md border border-border">
												<div class="flex items-center justify-between mb-2">
													<p class="text-xs font-medium text-muted-foreground">Session Output</p>
													<button
														type="button"
														onclick={() => { peekContent = null; peekTarget = null; }}
														class="text-xs text-muted-foreground hover:text-foreground"
													>
														Close
													</button>
												</div>
												<pre class="text-xs text-foreground font-mono whitespace-pre-wrap overflow-x-auto max-h-64">{peekContent}</pre>
											</div>
										{/if}

										<!-- Actions -->
										<div class="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
											{#if member.status === 'stopped'}
												<form method="POST" action="?/startCrew" use:enhance>
													<input type="hidden" name="name" value={member.name} />
													<input type="hidden" name="rig" value={member.rig} />
													<button
														type="submit"
														class="px-3 py-1.5 rounded-md text-sm font-medium text-status-online border border-status-online/30 hover:bg-status-online/10 transition-all"
													>
														Start
													</button>
												</form>
											{:else}
												<form method="POST" action="?/stopCrew" use:enhance>
													<input type="hidden" name="name" value={member.name} />
													<input type="hidden" name="rig" value={member.rig} />
													<button
														type="submit"
														class="px-3 py-1.5 rounded-md text-sm font-medium text-status-warning border border-status-warning/30 hover:bg-status-warning/10 transition-all"
													>
														Stop
													</button>
												</form>
											{/if}

											<form method="POST" action="?/peekCrew" use:enhance>
												<input type="hidden" name="name" value={member.name} />
												<input type="hidden" name="rig" value={member.rig} />
												<button
													type="submit"
													class="px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-accent/10 transition-all"
												>
													Peek
												</button>
											</form>

											<form
												method="POST"
												action="?/nudgeCrew"
												use:enhance
												class="flex items-center gap-2"
											>
												<input type="hidden" name="name" value={member.name} />
												<input type="hidden" name="rig" value={member.rig} />
												<input
													type="text"
													name="message"
													bind:value={nudgeMessage}
													placeholder="Nudge message..."
													class="h-8 px-2 text-sm bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring w-32 sm:w-48"
												/>
												<button
													type="submit"
													class="px-3 py-1.5 rounded-md text-sm font-medium text-accent border border-accent/30 hover:bg-accent/10 transition-all"
												>
													Nudge
												</button>
											</form>

											<div class="flex-1"></div>

											<form method="POST" action="?/removeCrew" use:enhance>
												<input type="hidden" name="name" value={member.name} />
												<input type="hidden" name="rig" value={member.rig} />
												<button
													type="submit"
													class="px-3 py-1.5 rounded-md text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-all"
												>
													Remove
												</button>
											</form>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Info Section -->
			<section class="panel-glass p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<span class="text-xl">i</span>
					</div>
					<div>
						<h2 class="text-lg font-semibold text-foreground">About Crew</h2>
						<p class="text-sm text-muted-foreground">What are crew workers?</p>
					</div>
				</div>

				<div class="text-sm text-muted-foreground space-y-2">
					<p>
						<strong class="text-foreground">Crew</strong> are persistent, human-managed workspaces:
					</p>
					<ul class="list-disc list-inside space-y-1 ml-2">
						<li><strong>Persistent</strong> - Not auto-garbage-collected like polecats</li>
						<li><strong>User-managed</strong> - You control the lifecycle</li>
						<li><strong>Long-lived identities</strong> - Recognizable names like dave, emma, fred</li>
						<li><strong>Gas Town integrated</strong> - Mail, handoff mechanics work</li>
						<li><strong>Tmux optional</strong> - Can work in terminal directly</li>
					</ul>
					<p class="pt-2">
						Use <code class="text-xs bg-secondary px-1 rounded">gt crew add &lt;name&gt;</code> to create new crew workers.
					</p>
				</div>
			</section>
		</main>
	</div>
</div>
