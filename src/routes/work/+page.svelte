<script lang="ts">
	import { GridPattern, IssueTypeSelector, SkeletonCard, ErrorState, EmptyState, FloatingActionButton } from '$lib/components';
	import { ClipboardList, PenLine, Target, Truck, ChevronDown, CheckSquare, Bug, Lightbulb, BookOpen, Plus } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { hapticMedium, hapticSuccess, hapticError } from '$lib/utils/haptics';
	import { cn } from '$lib/utils';
	import { z } from 'zod';

	let { data } = $props();
	
	let isLoading = $state(true);

	// Issue creation form state
	let issueTitle = $state('');
	let issueType = $state('task');
	let issuePriority = $state(2);
	let issueSubmitting = $state(false);
	let issueMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let issueErrors = $state<Record<string, string>>({});

	// Validation schemas
	const issueSchema = z.object({
		title: z.string().min(3, 'Title must be at least 3 characters'),
		type: z.enum(['task', 'bug', 'feature', 'epic']),
		priority: z.number().min(0).max(4)
	});

	const convoySchema = z.object({
		name: z.string().min(3, 'Convoy name must be at least 3 characters'),
		issues: z.array(z.string()).min(1, 'Select at least one issue')
	});

	const slingSchema = z.object({
		issue: z.string().min(1, 'Issue is required'),
		rig: z.string().min(1, 'Rig is required')
	});
	
	onMount(() => {
		// Simulate data loading with small delay
		isLoading = false;
	});

	// Convoy creation form state
	let convoyName = $state('');
	let selectedIssues = $state<string[]>([]);
	let convoySubmitting = $state(false);
	let convoyMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let convoyErrors = $state<Record<string, string>>({});

	// Sling form state
	let slingIssue = $state('');
	let slingRig = $state('');
	let slingSubmitting = $state(false);
	let slingMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let slingErrors = $state<Record<string, string>>({});

	// Local copy of issues that updates after creation
	let localIssues = $state<typeof data.issues>([]);

	// Filter and sort state
	let filters = $state({
		type: 'all' as 'all' | 'task' | 'bug' | 'feature' | 'epic',
		priority: 'all' as 'all' | 0 | 1 | 2 | 3 | 4,
		status: 'all' as 'all' | 'open' | 'in_progress' | 'done'
	});
	let sortBy = $state('id' as 'id' | 'priority' | 'type');
	let sortOrder = $state('asc' as 'asc' | 'desc');

	// Filtered and sorted issues
	const filteredIssues = $derived.by(() => {
		let result = [...localIssues];

		// Apply filters
		if (filters.type !== 'all') {
			result = result.filter(i => i.type === filters.type);
		}
		if (filters.priority !== 'all') {
			result = result.filter(i => i.priority === filters.priority);
		}
		if (filters.status !== 'all') {
			result = result.filter(i => i.status === filters.status);
		}

		// Apply sorting
		result.sort((a, b) => {
			let aVal: any;
			let bVal: any;
			
			if (sortBy === 'priority') {
				aVal = a.priority;
				bVal = b.priority;
			} else if (sortBy === 'type') {
				aVal = a.type;
				bVal = b.type;
			} else {
				// Default to ID (insertion order)
				aVal = a.id;
				bVal = b.id;
			}

			if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		return result;
	});

	// Sync with server data
	$effect(() => {
		localIssues = [...data.issues];
	});

	const issueTypes = [
		{ value: 'task', label: 'Task', description: 'Work item to be completed', icon: CheckSquare },
		{ value: 'bug', label: 'Bug', description: 'Something is broken', icon: Bug },
		{ value: 'feature', label: 'Feature', description: 'New capability', icon: Lightbulb },
		{ value: 'epic', label: 'Epic', description: 'Large feature set', icon: BookOpen }
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
		issueMessage = null;
		issueErrors = {};

		// Validate form
		const result = issueSchema.safeParse({
			title: issueTitle,
			type: issueType,
			priority: issuePriority
		});

		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			issueErrors = Object.fromEntries(
				Object.entries(fieldErrors).map(([key, errors]) => [key, errors?.[0] || ''])
			);
			hapticError();
			return;
		}

		issueSubmitting = true;
		hapticMedium(); // Medium haptic on form submission

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

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || 'Failed to create issue');
			}

			hapticSuccess(); // Success haptic on successful submission
			issueMessage = { type: 'success', text: `Created issue: ${data.id}` };
			// Add to local issues list
			localIssues = [...localIssues, data];
			// Reset form
			issueTitle = '';
			issueType = 'task';
			issuePriority = 2;
		} catch (error) {
			hapticError(); // Error haptic on failure
			issueMessage = { type: 'error', text: error instanceof Error ? error.message : 'Failed to create issue' };
		} finally {
			issueSubmitting = false;
		}
	}

	async function handleCreateConvoy(e: Event) {
		e.preventDefault();
		convoyMessage = null;
		convoyErrors = {};

		// Validate form
		const result = convoySchema.safeParse({
			name: convoyName,
			issues: selectedIssues
		});

		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			convoyErrors = Object.fromEntries(
				Object.entries(fieldErrors).map(([key, errors]) => [key, errors?.[0] || ''])
			);
			hapticError();
			return;
		}

		convoySubmitting = true;
		hapticMedium(); // Medium haptic on form submission

		try {
			const res = await fetch('/api/gastown/work/convoys', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: convoyName,
					issues: selectedIssues
				})
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || 'Failed to create convoy');
			}

			hapticSuccess(); // Success haptic on successful submission
			convoyMessage = { type: 'success', text: data.message || 'Convoy created successfully' };
			// Reset form
			convoyName = '';
			selectedIssues = [];
		} catch (error) {
			hapticError(); // Error haptic on failure
			convoyMessage = { type: 'error', text: error instanceof Error ? error.message : 'Failed to create convoy' };
		} finally {
			convoySubmitting = false;
		}
	}

	async function handleSling(e: Event) {
		e.preventDefault();
		slingMessage = null;
		slingErrors = {};

		// Validate form
		const result = slingSchema.safeParse({
			issue: slingIssue,
			rig: slingRig
		});

		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			slingErrors = Object.fromEntries(
				Object.entries(fieldErrors).map(([key, errors]) => [key, errors?.[0] || ''])
			);
			hapticError();
			return;
		}

		slingSubmitting = true;
		hapticMedium(); // Medium haptic on form submission

		try {
			const res = await fetch('/api/gastown/work/sling', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					issue: slingIssue,
					rig: slingRig
				})
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || 'Failed to sling work');
			}

			hapticSuccess(); // Success haptic on successful submission
			slingMessage = { type: 'success', text: data.message || 'Work slung successfully' };
			// Reset form
			slingIssue = '';
			slingRig = '';
		} catch (error) {
			hapticError(); // Error haptic on failure
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
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass px-4 h-[72px] relative">
			<div class="container h-full flex items-center gap-3">
				<div class="w-1.5 h-8 bg-primary rounded-sm shadow-glow shrink-0" aria-hidden="true"></div>
				<div>
					<h1 class="text-2xl font-display font-semibold text-foreground">Work Management</h1>
					<p class="text-sm text-muted-foreground">Create issues, convoys, and assign work</p>
				</div>
			</div>
			<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true"></div>
		</header>

		<main class="container py-6">
			<!-- Create Issue Section -->
			<section class="panel-glass p-6 mx-auto mb-8 max-w-lg">
				<h2 class="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
					<PenLine class="w-5 h-5 text-foreground" strokeWidth={2} />
					Create Issue
				</h2>

				<form onsubmit={handleCreateIssue} class="space-y-4">
					<div>
						<label for="issue-title" class="block text-sm font-medium text-foreground mb-2">
							<span>Title</span>
							<span class="text-destructive font-semibold">*</span>
							<span class="text-xs text-muted-foreground ml-1">(required)</span>
						</label>
						<input
							id="issue-title"
							type="text"
							bind:value={issueTitle}
							required
							placeholder="Describe the task..."
							class="w-full px-3 py-2 bg-input border border-border rounded-lg
								   text-foreground placeholder:text-muted-foreground
								   focus:outline-none focus:ring-2 focus:ring-ring
								   {issueErrors.title ? 'border-destructive' : ''}"
						/>
						{#if issueErrors.title}
							<p class="text-sm text-destructive mt-1">{issueErrors.title}</p>
						{/if}
					</div>

					<!-- Issue Type Selector Component -->
					<div>
						<IssueTypeSelector 
							options={issueTypes}
							bind:value={issueType}
							label="Type"
						/>
					</div>

					<div>
						<label for="issue-priority" class="block text-sm font-medium text-foreground mb-2">
							<span>Priority</span>
							<span class="text-destructive font-semibold">*</span>
							<span class="text-xs text-muted-foreground ml-1">(required)</span>
						</label>
						<div class="relative">
							<select
								id="issue-priority"
								bind:value={issuePriority}
								class="w-full px-3 py-2 bg-input border border-border rounded-lg
									   text-foreground focus:outline-none focus:ring-2 focus:ring-ring
									   appearance-none pr-10"
								>
									{#each priorities as p}
										<option value={p.value}>{p.label}</option>
									{/each}
								</select>
								<ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" strokeWidth={2} />
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
			<section class="panel-glass p-6 mx-auto mb-8 max-w-lg">
				<h2 class="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
					<Truck class="w-5 h-5 text-foreground" strokeWidth={2} />
					Create Convoy
				</h2>

				<form onsubmit={handleCreateConvoy} class="space-y-4">
					<div>
						<label for="convoy-name" class="block text-sm font-medium text-foreground mb-2">
							<span>Convoy Name</span>
							<span class="text-destructive font-semibold">*</span>
							<span class="text-xs text-muted-foreground ml-1">(required)</span>
						</label>
						<input
							id="convoy-name"
							type="text"
							bind:value={convoyName}
							required
							placeholder="Name for the convoy..."
							class="w-full px-3 py-2 bg-input border border-border rounded-lg
								   text-foreground placeholder:text-muted-foreground
								   focus:outline-none focus:ring-2 focus:ring-ring
								   {convoyErrors.name ? 'border-destructive' : ''}"
						/>
						{#if convoyErrors.name}
							<p class="text-sm text-destructive mt-1">{convoyErrors.name}</p>
						{/if}
					</div>

					<div>
						<span class="block text-sm font-medium text-foreground mb-2">
							Select Issues ({selectedIssues.length} selected)
							<span class="text-destructive font-semibold">*</span>
							<span class="text-xs text-muted-foreground ml-1">(required)</span>
						</span>
						{#if localIssues.length === 0}
							<p class="text-sm text-muted-foreground">No open issues available</p>
						{:else}
							<div class="max-h-48 overflow-y-auto space-y-2 border border-border rounded-lg p-2 {convoyErrors.issues ? 'border-destructive' : ''}">
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
						{#if convoyErrors.issues}
							<p class="text-sm text-destructive mt-1">{convoyErrors.issues}</p>
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
			<section class="panel-glass p-6 mx-auto mb-8 max-w-lg">
				<h2 class="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
					<Target class="w-5 h-5 text-foreground" strokeWidth={2} />
					Sling Work
				</h2>

				<form onsubmit={handleSling} class="space-y-4">
					<div>
						<label for="sling-issue" class="block text-sm font-medium text-foreground mb-2">
							<span>Issue</span>
							<span class="text-destructive font-semibold">*</span>
							<span class="text-xs text-muted-foreground ml-1">(required)</span>
						</label>
						<div class="relative">
							<select
								id="sling-issue"
								bind:value={slingIssue}
								required
								class="w-full px-3 py-2 bg-input border border-border rounded-lg
									   text-foreground focus:outline-none focus:ring-2 focus:ring-ring
									   appearance-none pr-10
									   {slingErrors.issue ? 'border-destructive' : ''}"
							>
								<option value="">Select an issue...</option>
								{#each localIssues as issue}
									<option value={issue.id}>
										{issue.id}: {issue.title}
									</option>
								{/each}
							</select>
							<ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" strokeWidth={2} />
						</div>
						{#if slingErrors.issue}
							<p class="text-sm text-destructive mt-1">{slingErrors.issue}</p>
						{/if}
					</div>

					<div>
						<label for="sling-rig" class="block text-sm font-medium text-foreground mb-2">
							<span>Target Rig</span>
							<span class="text-destructive font-semibold">*</span>
							<span class="text-xs text-muted-foreground ml-1">(required)</span>
						</label>
						<div class="relative">
							<select
								id="sling-rig"
								bind:value={slingRig}
								required
								class="w-full px-3 py-2 bg-input border border-border rounded-lg
									   text-foreground focus:outline-none focus:ring-2 focus:ring-ring
									   appearance-none pr-10
									   {slingErrors.rig ? 'border-destructive' : ''}"
							>
								<option value="">Select a rig...</option>
								{#each data.rigs as rig}
									<option value={rig.name}>{rig.name}</option>
								{/each}
							</select>
							<ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" strokeWidth={2} />
						</div>
						{#if slingErrors.rig}
							<p class="text-sm text-destructive mt-1">{slingErrors.rig}</p>
						{/if}
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
			<section class="panel-glass p-6 mx-auto mb-8 max-w-lg">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
						<ClipboardList class="w-5 h-5 text-foreground" strokeWidth={2} />
						Issues ({filteredIssues.length})
					</h2>
					<!-- Sort dropdown -->
					<div class="relative inline-block">
						<select
							bind:value={sortBy}
							class="px-3 py-1 text-xs bg-muted text-muted-foreground rounded border border-border
								   appearance-none pr-8 cursor-pointer
								   focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="id">ID</option>
							<option value="priority">Priority</option>
							<option value="type">Type</option>
						</select>
						<ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
					</div>
				</div>

				{#if isLoading}
					<!-- Show skeleton loaders while loading -->
					<SkeletonCard type="work" count={4} />
				{:else if data.issuesError}
					<ErrorState
						title="Failed to load issues"
						message={data.issuesError}
						onRetry={() => window.location.reload()}
						showRetryButton={true}
						compact={true}
					/>
				{:else if localIssues.length === 0}
					<EmptyState
						title="No open issues"
						description="Create your first issue to get started"
						actionLabel="Create Issue"
						onaction={() => document.getElementById('issue-form')?.scrollIntoView({ behavior: 'smooth' })}
						size="sm"
					/>
				{:else}
					<!-- Filter chips -->
					<div class="flex flex-wrap gap-2 mb-4">
						{#each [
							{ label: 'All Types', value: 'all', key: 'type' },
							{ label: 'Tasks', value: 'task', key: 'type' },
							{ label: 'Bugs', value: 'bug', key: 'type' },
							{ label: 'Features', value: 'feature', key: 'type' },
							{ label: 'Epics', value: 'epic', key: 'type' }
						] as chip}
							<button
								type="button"
								class={cn(
									'px-3 py-1 text-xs font-medium rounded-full transition-colors',
									filters.type === chip.value
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-muted-foreground hover:bg-muted/80'
								)}
								onclick={() => filters.type = chip.value as any}
								aria-pressed={filters.type === chip.value}
							>
								{chip.label}
							</button>
						{/each}
					</div>

					<!-- Priority filter -->
					<div class="flex flex-wrap gap-2 mb-4">
						{#each [
							{ label: 'All Priorities', value: 'all', key: 'priority' },
							{ label: 'P0 - Critical', value: 0, key: 'priority' },
							{ label: 'P1 - High', value: 1, key: 'priority' },
							{ label: 'P2 - Medium', value: 2, key: 'priority' },
							{ label: 'P3 - Low', value: 3, key: 'priority' }
						] as chip}
							<button
								type="button"
								class={cn(
									'px-3 py-1 text-xs font-medium rounded-full transition-colors',
									filters.priority === chip.value
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-muted-foreground hover:bg-muted/80'
								)}
								onclick={() => filters.priority = chip.value as any}
								aria-pressed={filters.priority === chip.value}
							>
								{chip.label}
							</button>
						{/each}
					</div>

					<!-- Issues list -->
					<div class="space-y-2">
						{#each filteredIssues as issue}
							<div class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
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

					{#if filteredIssues.length === 0 && localIssues.length > 0}
						<div class="text-center py-6 text-muted-foreground">
							<p class="text-sm">No issues match your filters</p>
						</div>
					{/if}
				{/if}
			</section>
		</main>

		<!-- Mobile create issue FAB -->
		<FloatingActionButton
			href="/work/new"
			ariaLabel="Create new issue"
		>
			<Plus class="w-5 h-5" strokeWidth={2.5} />
		</FloatingActionButton>
	</div>
</div>
