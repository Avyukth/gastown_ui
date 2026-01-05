<script lang="ts">
	import { GridPattern } from '$lib/components';

	let { data } = $props();

	// Issue creation form state
	let issueTitle = $state('');
	let issueType = $state('task');
	let issuePriority = $state(2);
	let issueSubmitting = $state(false);
	let issueMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	// Convoy creation form state
	let convoyName = $state('');
	let selectedIssues = $state<string[]>([]);
	let convoySubmitting = $state(false);
	let convoyMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	// Sling form state
	let slingIssue = $state('');
	let slingRig = $state('');
	let slingSubmitting = $state(false);
	let slingMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	// Local copy of issues that updates after creation
	let localIssues = $state([...data.issues]);

	const issueTypes = [
		{ value: 'task', label: 'Task' },
		{ value: 'bug', label: 'Bug' },
		{ value: 'feature', label: 'Feature' },
		{ value: 'epic', label: 'Epic' }
	];

	const priorities = [
		{ value: 0, label: 'P0 - Critical' },
		{ value: 1, label: 'P1 - High' },
		{ value: 2, label: 'P2 - Medium' },
		{ value: 3, label: 'P3 - Low' },
		{ value: 4, label: 'P4 - Backlog' }
	];

	async function handleCreateIssue(e: Event) {
		e.preventDefault();
		issueSubmitting = true;
		issueMessage = null;

		try {
			const res = await fetch('/api/gastown/work/issues', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: issueTitle,
					type: issueType,
					priority: issuePriority
				})
			});

			const result = await res.json();

			if (!res.ok) {
				throw new Error(result.error || 'Failed to create issue');
			}

			issueMessage = { type: 'success', text: `Created issue: ${result.id}` };
			// Add to local issues list
			localIssues = [...localIssues, result];
			// Reset form
			issueTitle = '';
			issueType = 'task';
			issuePriority = 2;
		} catch (error) {
			issueMessage = { type: 'error', text: error instanceof Error ? error.message : 'Failed to create issue' };
		} finally {
			issueSubmitting = false;
		}
	}

	async function handleCreateConvoy(e: Event) {
		e.preventDefault();
		convoySubmitting = true;
		convoyMessage = null;

		try {
			const res = await fetch('/api/gastown/work/convoys', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: convoyName,
					issues: selectedIssues
				})
			});

			const result = await res.json();

			if (!res.ok) {
				throw new Error(result.error || 'Failed to create convoy');
			}

			convoyMessage = { type: 'success', text: result.message || 'Convoy created successfully' };
			// Reset form
			convoyName = '';
			selectedIssues = [];
		} catch (error) {
			convoyMessage = { type: 'error', text: error instanceof Error ? error.message : 'Failed to create convoy' };
		} finally {
			convoySubmitting = false;
		}
	}

	async function handleSling(e: Event) {
		e.preventDefault();
		slingSubmitting = true;
		slingMessage = null;

		try {
			const res = await fetch('/api/gastown/work/sling', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					issue: slingIssue,
					rig: slingRig
				})
			});

			const result = await res.json();

			if (!res.ok) {
				throw new Error(result.error || 'Failed to sling work');
			}

			slingMessage = { type: 'success', text: result.message || 'Work slung successfully' };
			// Reset form
			slingIssue = '';
			slingRig = '';
		} catch (error) {
			slingMessage = { type: 'error', text: error instanceof Error ? error.message : 'Failed to sling work' };
		} finally {
			slingSubmitting = false;
		}
	}

	function toggleIssueSelection(id: string) {
		if (selectedIssues.includes(id)) {
			selectedIssues = selectedIssues.filter(i => i !== id);
		} else {
			selectedIssues = [...selectedIssues, id];
		}
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.15} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
			<div class="container">
				<h1 class="text-xl font-semibold text-foreground">Work Management</h1>
				<p class="text-sm text-muted-foreground">Create issues, convoys, and assign work</p>
			</div>
		</header>

		<main class="container py-6 space-y-8">
			<!-- Create Issue Section -->
			<section class="panel-glass p-6">
				<h2 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
					<span class="text-xl">📝</span>
					Create Issue
				</h2>

				<form onsubmit={handleCreateIssue} class="space-y-4">
					<div>
						<label for="issue-title" class="block text-sm font-medium text-foreground mb-1">
							Title
						</label>
						<input
							id="issue-title"
							type="text"
							bind:value={issueTitle}
							required
							placeholder="Describe the task..."
							class="w-full px-3 py-2 bg-input border border-border rounded-lg
								   text-foreground placeholder:text-muted-foreground
								   focus:outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="issue-type" class="block text-sm font-medium text-foreground mb-1">
								Type
							</label>
							<select
								id="issue-type"
								bind:value={issueType}
								class="w-full px-3 py-2 bg-input border border-border rounded-lg
									   text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							>
								{#each issueTypes as type}
									<option value={type.value}>{type.label}</option>
								{/each}
							</select>
						</div>

						<div>
							<label for="issue-priority" class="block text-sm font-medium text-foreground mb-1">
								Priority
							</label>
							<select
								id="issue-priority"
								bind:value={issuePriority}
								class="w-full px-3 py-2 bg-input border border-border rounded-lg
									   text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							>
								{#each priorities as p}
									<option value={p.value}>{p.label}</option>
								{/each}
							</select>
						</div>
					</div>

					{#if issueMessage}
						<div
							class="p-3 rounded-lg text-sm {issueMessage.type === 'success'
								? 'bg-status-online/10 text-status-online'
								: 'bg-status-offline/10 text-status-offline'}"
						>
							{issueMessage.text}
						</div>
					{/if}

					<button
						type="submit"
						disabled={issueSubmitting || !issueTitle.trim()}
						class="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-lg
							   hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
							   transition-colors touch-target"
					>
						{issueSubmitting ? 'Creating...' : 'Create Issue'}
					</button>
				</form>
			</section>

			<!-- Create Convoy Section -->
			<section class="panel-glass p-6">
				<h2 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
					<span class="text-xl">🚚</span>
					Create Convoy
				</h2>

				<form onsubmit={handleCreateConvoy} class="space-y-4">
					<div>
						<label for="convoy-name" class="block text-sm font-medium text-foreground mb-1">
							Convoy Name
						</label>
						<input
							id="convoy-name"
							type="text"
							bind:value={convoyName}
							required
							placeholder="Name for the convoy..."
							class="w-full px-3 py-2 bg-input border border-border rounded-lg
								   text-foreground placeholder:text-muted-foreground
								   focus:outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-foreground mb-2">
							Select Issues ({selectedIssues.length} selected)
						</label>
						{#if localIssues.length === 0}
							<p class="text-sm text-muted-foreground">No open issues available</p>
						{:else}
							<div class="max-h-48 overflow-y-auto space-y-2 border border-border rounded-lg p-2">
								{#each localIssues as issue}
									<label
										class="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={selectedIssues.includes(issue.id)}
											onchange={() => toggleIssueSelection(issue.id)}
											class="w-4 h-4 rounded border-border text-primary focus:ring-ring"
										/>
										<span class="flex-1 text-sm text-foreground truncate">
											<span class="font-mono text-muted-foreground">{issue.id}</span>
											{issue.title}
										</span>
										<span class="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
											{issue.type}
										</span>
									</label>
								{/each}
							</div>
						{/if}
					</div>

					{#if convoyMessage}
						<div
							class="p-3 rounded-lg text-sm {convoyMessage.type === 'success'
								? 'bg-status-online/10 text-status-online'
								: 'bg-status-offline/10 text-status-offline'}"
						>
							{convoyMessage.text}
						</div>
					{/if}

					<button
						type="submit"
						disabled={convoySubmitting || !convoyName.trim() || selectedIssues.length === 0}
						class="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-lg
							   hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
							   transition-colors touch-target"
					>
						{convoySubmitting ? 'Creating...' : 'Create Convoy'}
					</button>
				</form>
			</section>

			<!-- Sling Work Section -->
			<section class="panel-glass p-6">
				<h2 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
					<span class="text-xl">🎯</span>
					Sling Work
				</h2>

				<form onsubmit={handleSling} class="space-y-4">
					<div>
						<label for="sling-issue" class="block text-sm font-medium text-foreground mb-1">
							Issue
						</label>
						<select
							id="sling-issue"
							bind:value={slingIssue}
							required
							class="w-full px-3 py-2 bg-input border border-border rounded-lg
								   text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="">Select an issue...</option>
							{#each localIssues as issue}
								<option value={issue.id}>
									{issue.id}: {issue.title}
								</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="sling-rig" class="block text-sm font-medium text-foreground mb-1">
							Target Rig
						</label>
						<select
							id="sling-rig"
							bind:value={slingRig}
							required
							class="w-full px-3 py-2 bg-input border border-border rounded-lg
								   text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="">Select a rig...</option>
							{#each data.rigs as rig}
								<option value={rig.name}>{rig.name}</option>
							{/each}
						</select>
					</div>

					{#if slingMessage}
						<div
							class="p-3 rounded-lg text-sm {slingMessage.type === 'success'
								? 'bg-status-online/10 text-status-online'
								: 'bg-status-offline/10 text-status-offline'}"
						>
							{slingMessage.text}
						</div>
					{/if}

					<button
						type="submit"
						disabled={slingSubmitting || !slingIssue || !slingRig}
						class="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-lg
							   hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
							   transition-colors touch-target"
					>
						{slingSubmitting ? 'Slinging...' : 'Sling Work'}
					</button>
				</form>
			</section>

			<!-- Current Issues List -->
			<section class="panel-glass p-6">
				<h2 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
					<span class="text-xl">📋</span>
					Open Issues ({localIssues.length})
				</h2>

				{#if data.issuesError}
					<div class="p-3 rounded-lg bg-status-offline/10 text-status-offline text-sm">
						Failed to load issues: {data.issuesError}
					</div>
				{:else if localIssues.length === 0}
					<p class="text-muted-foreground text-sm">No open issues</p>
				{:else}
					<div class="space-y-2">
						{#each localIssues as issue}
							<div class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
								<span class="font-mono text-sm text-primary">{issue.id}</span>
								<span class="flex-1 text-sm text-foreground truncate">{issue.title}</span>
								<span class="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
									{issue.type}
								</span>
								<span class="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
									P{issue.priority}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</main>
	</div>
</div>
