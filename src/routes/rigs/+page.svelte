<script lang="ts">
	import { enhance } from '$app/forms';
	import { GridPattern } from '$lib/components';
	import { cn } from '$lib/utils';
	import { ChevronDown } from 'lucide-svelte';

	const { data, form } = $props();

	let showAddRig = $state(false);
	let newRigName = $state('');
	let newRigUrl = $state('');
	let newRigPrefix = $state('');
	let expandedRig = $state<string | null>(null);

	function toggleExpand(rigName: string) {
		expandedRig = expandedRig === rigName ? null : rigName;
	}

	function resetForm() {
		newRigName = '';
		newRigUrl = '';
		newRigPrefix = '';
		showAddRig = false;
	}
</script>

<svelte:head>
	<title>Rigs | Gas Town</title>
</svelte:head>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass px-4 h-[72px] relative">
			<div class="container h-full flex items-center gap-3">
				<div class="w-1.5 h-8 bg-primary rounded-sm shadow-glow shrink-0" aria-hidden="true"></div>
				<div>
					<h1 class="text-2xl font-display font-semibold text-foreground">Rigs</h1>
					<p class="text-sm text-muted-foreground">Manage project containers in Gas Town</p>
				</div>
			</div>
			<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true"></div>
		</header>

		<main class="container py-6 space-y-6">
			{#if data.error}
				<div class="panel-glass p-6 border-status-offline/30">
					<p class="text-status-offline font-medium">Failed to load rigs</p>
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
					<p class="text-success text-sm font-medium">{form.message}</p>
				</div>
			{/if}

			<!-- Add Rig Section -->
			<section class="panel-glass p-6">
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<span class="text-xl">+</span>
						</div>
						<div>
							<h2 class="text-lg font-semibold text-foreground">Add Rig</h2>
							<p class="text-sm text-muted-foreground">Clone a repository as a new rig</p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => (showAddRig = !showAddRig)}
						class={cn(
							'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
							'border border-border hover:bg-accent/10',
							showAddRig && 'bg-accent/10'
						)}
					>
						{showAddRig ? 'Cancel' : '+ New Rig'}
					</button>
				</div>

				{#if showAddRig}
					<form
						method="POST"
						action="?/addRig"
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
								<label for="rig-name" class="block text-sm font-medium text-muted-foreground mb-1">
									Rig Name
								</label>
								<input
									id="rig-name"
									type="text"
									name="name"
									bind:value={newRigName}
									placeholder="my-project"
									required
									class="w-full h-10 px-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>
							<div>
								<label for="rig-prefix" class="block text-sm font-medium text-muted-foreground mb-1">
									Beads Prefix <span class="text-muted-foreground/50">(optional)</span>
								</label>
								<input
									id="rig-prefix"
									type="text"
									name="prefix"
									bind:value={newRigPrefix}
									placeholder="mp"
									class="w-full h-10 px-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>
						</div>
						<div>
							<label for="rig-url" class="block text-sm font-medium text-muted-foreground mb-1">
								Git URL
							</label>
							<input
								id="rig-url"
								type="text"
								name="gitUrl"
								bind:value={newRigUrl}
								placeholder="https://github.com/user/repo.git"
								required
								class="w-full h-10 px-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						<button
							type="submit"
							class="px-4 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
						>
							Add Rig
						</button>
					</form>
				{/if}
			</section>

			<!-- Rigs List -->
			<section class="panel-glass p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<span class="text-xl">&#9881;</span>
					</div>
					<div>
						<h2 class="text-lg font-semibold text-foreground">Active Rigs</h2>
						<p class="text-sm text-muted-foreground">{data.rigs.length} rig{data.rigs.length !== 1 ? 's' : ''} registered</p>
					</div>
				</div>

				{#if data.rigs.length === 0}
					<div class="p-6 text-center border border-dashed border-border rounded-lg">
						<p class="text-muted-foreground">No rigs configured</p>
						<p class="text-sm text-muted-foreground/70 mt-1">Add a rig to get started</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each data.rigs as rig}
							<div class="rounded-lg border border-border bg-card overflow-hidden">
								<!-- Rig Header -->
								<button
									type="button"
									onclick={() => toggleExpand(rig.name)}
									class="w-full p-4 flex items-center justify-between hover:bg-accent/5 transition-colors"
								>
									<div class="flex items-center gap-4">
										<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
											<span class="font-bold text-primary">{rig.name.charAt(0).toUpperCase()}</span>
										</div>
										<div class="text-left">
											<p class="font-semibold text-foreground">{rig.name}</p>
											<div class="flex items-center gap-3 text-sm text-muted-foreground">
												<span>{rig.polecatCount} polecat{rig.polecatCount !== 1 ? 's' : ''}</span>
												<span class="text-border">|</span>
												<span>{rig.crewCount} crew</span>
												{#if rig.hasWitness}
													<span class="text-border">|</span>
													<span class="text-status-online">Witness</span>
												{/if}
												{#if rig.hasRefinery}
													<span class="text-border">|</span>
													<span class="text-status-online">Refinery</span>
												{/if}
											</div>
										</div>
									</div>
									<ChevronDown
									class={cn(
										'w-5 h-5 text-muted-foreground transition-transform',
										expandedRig === rig.name && 'rotate-180'
									)}
								/>
								</button>

								<!-- Rig Detail View -->
								{#if expandedRig === rig.name}
									<div class="border-t border-border p-4 bg-secondary/20 space-y-4">
										<!-- Polecats -->
										{#if rig.polecats.length > 0}
											<div>
												<h4 class="text-sm font-medium text-muted-foreground mb-2">Polecats</h4>
												<div class="flex flex-wrap gap-2">
													{#each rig.polecats as polecat}
														<span class="px-2 py-1 text-xs font-medium bg-accent/20 text-accent rounded-full">
															{polecat}
														</span>
													{/each}
												</div>
											</div>
										{/if}

										<!-- Crews -->
										{#if rig.crews.length > 0}
											<div>
												<h4 class="text-sm font-medium text-muted-foreground mb-2">Crew</h4>
												<div class="flex flex-wrap gap-2">
													{#each rig.crews as crew}
														<span class="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
															{crew}
														</span>
													{/each}
												</div>
											</div>
										{/if}

										<!-- Agents -->
										<div>
											<h4 class="text-sm font-medium text-muted-foreground mb-2">Agents</h4>
											<div class="flex flex-wrap gap-2">
												{#if rig.hasWitness}
													<span class="px-2 py-1 text-xs font-medium bg-status-online/20 text-status-online rounded-full">
														witness
													</span>
												{/if}
												{#if rig.hasRefinery}
													<span class="px-2 py-1 text-xs font-medium bg-status-online/20 text-status-online rounded-full">
														refinery
													</span>
												{/if}
											</div>
										</div>

										<!-- Actions -->
										<div class="flex items-center justify-end gap-2 pt-2 border-t border-border">
											<form method="POST" action="?/removeRig" use:enhance>
												<input type="hidden" name="name" value={rig.name} />
												<button
													type="submit"
													class="px-3 py-1.5 rounded-md text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-all"
												>
													Remove from Registry
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
						<h2 class="text-lg font-semibold text-foreground">About Rigs</h2>
						<p class="text-sm text-muted-foreground">What are rigs?</p>
					</div>
				</div>

				<div class="text-sm text-muted-foreground space-y-2">
					<p>
						A <strong class="text-foreground">rig</strong> is a project container that manages:
					</p>
					<ul class="list-disc list-inside space-y-1 ml-2">
						<li><code class="text-xs bg-secondary px-1 rounded">refinery/rig/</code> - Canonical main clone</li>
						<li><code class="text-xs bg-secondary px-1 rounded">mayor/rig/</code> - Mayor's working clone</li>
						<li><code class="text-xs bg-secondary px-1 rounded">crew/</code> - Human workspaces</li>
						<li><code class="text-xs bg-secondary px-1 rounded">polecats/</code> - Worker directories</li>
						<li><code class="text-xs bg-secondary px-1 rounded">.beads/</code> - Issue tracking</li>
					</ul>
				</div>
			</section>
		</main>
	</div>
</div>
