<script lang="ts">
	import { GridPattern, IssueTypeSelector, SkeletonCard, ErrorState, EmptyState, FloatingActionButton, WorkItemCard, WorkItemDetail, type WorkItem } from '$lib/components';
	import { ClipboardList, PenLine, Target, Truck, ChevronDown, ChevronUp, CheckSquare, Bug, Lightbulb, BookOpen, Plus, Search, X, ArrowUpDown } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { hapticMedium, hapticSuccess, hapticError, hapticLight } from '$lib/utils/haptics';
	import { cn } from '$lib/utils';
	import { z } from 'zod';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let { data } = $props();

	let isLoading = $state(true);

	type LocalIssueStatus = 'open' | 'in_progress' | 'done' | 'blocked';
	type LocalIssueType = 'task' | 'bug' | 'feature' | 'epic';
	type LocalIssue = {
		id: string;
		title: string;
		type: LocalIssueType;
		status: LocalIssueStatus;
		priority: 0 | 1 | 2 | 3 | 4;
		assignee?: string;
		description?: string;
		created?: string;
		updated?: string;
	};

	type RawIssue = Partial<LocalIssue> & {
		issue_type?: string;
		created_at?: string;
		updated_at?: string;
		createdAt?: string;
		updatedAt?: string;
		assignee?: string | null;
		description?: string;
	};

	const issueStatusMap: Record<string, LocalIssueStatus> = {
		open: 'open',
		in_progress: 'in_progress',
		closed: 'done',
		hooked: 'in_progress',
		blocked: 'blocked',
		done: 'done'
	};
	const allowedIssueTypes = new Set<LocalIssueType>(['task', 'bug', 'feature', 'epic']);

	function normalizeIssue(raw: RawIssue): LocalIssue | null {
		if (!raw?.id || !raw?.title) return null;

		const rawType = typeof raw.type === 'string' ? raw.type : raw.issue_type;
		const type = allowedIssueTypes.has(rawType as LocalIssueType) ? (rawType as LocalIssueType) : 'task';
		const rawStatus = typeof raw.status === 'string' ? raw.status : 'open';
		const status = issueStatusMap[rawStatus] ?? 'open';
		const priority = Math.min(4, Math.max(0, Number(raw.priority ?? 2) || 2)) as 0 | 1 | 2 | 3 | 4;
		const created =
			typeof raw.created === 'string'
				? raw.created
				: typeof raw.created_at === 'string'
					? raw.created_at
					: typeof raw.createdAt === 'string'
						? raw.createdAt
						: undefined;
		const updated =
			typeof raw.updated === 'string'
				? raw.updated
				: typeof raw.updated_at === 'string'
					? raw.updated_at
					: typeof raw.updatedAt === 'string'
						? raw.updatedAt
						: undefined;

		return {
			id: String(raw.id),
			title: String(raw.title),
			type,
			status,
			priority,
			assignee: raw.assignee || undefined,
			description: raw.description,
			created,
			updated
		};
	}

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
	let localIssues = $state<LocalIssue[]>([]);

	// Search state with debouncing
	let searchQuery = $state('');
	let searchInput = $state('');
	let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Filter and sort state - initialized from URL
	let filters = $state({
		type: 'all' as 'all' | 'task' | 'bug' | 'feature' | 'epic',
		priority: 'all' as 'all' | 0 | 1 | 2 | 3 | 4,
		status: 'all' as 'all' | 'open' | 'in_progress' | 'done'
	});
	let sortBy = $state('id' as 'id' | 'priority' | 'type' | 'updated');
	let sortOrder = $state('asc' as 'asc' | 'desc');

	// Detail panel state
	let expandedItemId = $state<string | null>(null);
	let detailPanelOpen = $state(false);
	let selectedDetailItem = $state<WorkItem | null>(null);

	// Initialize from URL params
	$effect(() => {
		if (browser) {
			const url = $page.url;
			const typeParam = url.searchParams.get('type');
			const priorityParam = url.searchParams.get('priority');
			const statusParam = url.searchParams.get('status');
			const sortParam = url.searchParams.get('sort');
			const orderParam = url.searchParams.get('order');
			const searchParam = url.searchParams.get('q');

			if (typeParam && ['all', 'task', 'bug', 'feature', 'epic'].includes(typeParam)) {
				filters.type = typeParam as typeof filters.type;
			}
			if (priorityParam) {
				if (priorityParam === 'all') {
					filters.priority = 'all';
				} else {
					const p = parseInt(priorityParam, 10);
					if (!isNaN(p) && p >= 0 && p <= 4) {
						filters.priority = p as 0 | 1 | 2 | 3 | 4;
					}
				}
			}
			if (statusParam && ['all', 'open', 'in_progress', 'done'].includes(statusParam)) {
				filters.status = statusParam as typeof filters.status;
			}
			if (sortParam && ['id', 'priority', 'type', 'updated'].includes(sortParam)) {
				sortBy = sortParam as typeof sortBy;
			}
			if (orderParam && ['asc', 'desc'].includes(orderParam)) {
				sortOrder = orderParam as typeof sortOrder;
			}
			if (searchParam) {
				searchQuery = searchParam;
				searchInput = searchParam;
			}
		}
	});

	// Update URL when filters change
	function updateUrl() {
		if (!browser) return;

		const url = new URL($page.url);

		// Set or remove params based on defaults
		if (filters.type !== 'all') {
			url.searchParams.set('type', filters.type);
		} else {
			url.searchParams.delete('type');
		}

		if (filters.priority !== 'all') {
			url.searchParams.set('priority', String(filters.priority));
		} else {
			url.searchParams.delete('priority');
		}

		if (filters.status !== 'all') {
			url.searchParams.set('status', filters.status);
		} else {
			url.searchParams.delete('status');
		}

		if (sortBy !== 'id') {
			url.searchParams.set('sort', sortBy);
		} else {
			url.searchParams.delete('sort');
		}

		if (sortOrder !== 'asc') {
			url.searchParams.set('order', sortOrder);
		} else {
			url.searchParams.delete('order');
		}

		if (searchQuery) {
			url.searchParams.set('q', searchQuery);
		} else {
			url.searchParams.delete('q');
		}

		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	// Debounced search
	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;

		if (searchDebounceTimer) {
			clearTimeout(searchDebounceTimer);
		}

		searchDebounceTimer = setTimeout(() => {
			searchQuery = value;
			updateUrl();
		}, 300);
	}

	function clearSearch() {
		searchInput = '';
		searchQuery = '';
		updateUrl();
		hapticLight();
	}

	// Update URL when filters/sort change
	$effect(() => {
		if (browser && !isLoading) {
			updateUrl();
		}
	});

	// Filtered and sorted issues
	const filteredIssues = $derived.by(() => {
		let result = [...localIssues];

		// Apply search
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(i =>
				i.id.toLowerCase().includes(query) ||
				i.title.toLowerCase().includes(query)
			);
		}

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
			let aVal: string | number;
			let bVal: string | number;

			if (sortBy === 'priority') {
				aVal = a.priority;
				bVal = b.priority;
			} else if (sortBy === 'type') {
				aVal = a.type;
				bVal = b.type;
			} else if (sortBy === 'updated') {
				aVal = a.updated || a.id;
				bVal = b.updated || b.id;
			} else {
				aVal = a.id;
				bVal = b.id;
			}

			if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		return result;
	});

	// Convert to WorkItem format for the card component
	const workItems = $derived<WorkItem[]>(filteredIssues.map(issue => ({
		id: issue.id,
		title: issue.title,
		type: issue.type as WorkItem['type'],
		status: issue.status as WorkItem['status'],
		priority: issue.priority as WorkItem['priority'],
		assignee: (issue as { assignee?: string }).assignee,
		description: (issue as { description?: string }).description,
		created: (issue as { created?: string }).created,
		updated: (issue as { updated?: string }).updated
	})));

	// Sync with server data
	$effect(() => {
		const normalized = (data.issues || [])
			.map((issue: RawIssue) => normalizeIssue(issue))
			.filter((issue): issue is LocalIssue => Boolean(issue));
		localIssues = normalized;
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
		hapticMedium();

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

		const payload = await res.json();

		if (!res.ok) {
			throw new Error(payload.error || 'Failed to create issue');
		}

		const created = normalizeIssue((payload.data ?? payload) as RawIssue);

		hapticSuccess();
		issueMessage = {
			type: 'success',
			text: created?.id ? `Created issue: ${created.id}` : 'Issue created'
		};
		if (created) {
			localIssues = [...localIssues, created];
		}
		issueTitle = '';
		issueType = 'task';
		issuePriority = 2;
	} catch (error) {
			hapticError();
			issueMessage = { type: 'error', text: error instanceof Error ? error.message : 'Failed to create issue' };
		} finally {
			issueSubmitting = false;
		}
	}

	async function handleCreateConvoy(e: Event) {
		e.preventDefault();
		convoyMessage = null;
		convoyErrors = {};

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
		hapticMedium();

		try {
			const res = await fetch('/api/gastown/work/convoys', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: convoyName,
					issues: selectedIssues
				})
			});

		const payload = await res.json();

		if (!res.ok) {
			throw new Error(payload.error || 'Failed to create convoy');
		}

		hapticSuccess();
		convoyMessage = { type: 'success', text: payload.message || 'Convoy created successfully' };
		convoyName = '';
		selectedIssues = [];
	} catch (error) {
			hapticError();
			convoyMessage = { type: 'error', text: error instanceof Error ? error.message : 'Failed to create convoy' };
		} finally {
			convoySubmitting = false;
		}
	}

	async function handleSling(e: Event) {
		e.preventDefault();
		slingMessage = null;
		slingErrors = {};

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
		hapticMedium();

		try {
		const res = await fetch('/api/gastown/work/sling', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				beadId: slingIssue,
				agentId: slingRig
			})
		});

		const payload = await res.json();

		if (!res.ok) {
			throw new Error(payload.error || payload.details || 'Failed to sling work');
		}

		hapticSuccess();
		slingMessage = {
			type: 'success',
			text: payload.data?.message || payload.message || 'Work slung successfully'
		};
		slingIssue = '';
		slingRig = '';
	} catch (error) {
			hapticError();
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

	function handleItemExpand(id: string) {
		if (expandedItemId === id) {
			expandedItemId = null;
		} else {
			expandedItemId = id;
		}
	}

	function handleOpenDetail(id: string) {
		const item = workItems.find(i => i.id === id);
		if (item) {
			selectedDetailItem = item;
			detailPanelOpen = true;
		}
	}

	function handleCloseDetail() {
		detailPanelOpen = false;
		setTimeout(() => {
			selectedDetailItem = null;
		}, 300);
	}

	function toggleSortOrder() {
		sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		hapticLight();
	}

	function setFilter(key: keyof typeof filters, value: typeof filters[keyof typeof filters]) {
		(filters as Record<string, unknown>)[key] = value;
		hapticLight();
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass px-4 h-[72px] relative">
			<div class="container h-full flex items-center gap-3">
				<div class="w-1.5 h-8 bg-primary rounded-sm shadow-glow shrink-0" aria-hidden="true"></div>
				<div>
					<h1 class="text-2xl font-display font-semibold text-foreground">Work Items</h1>
					<p class="text-sm text-muted-foreground">Manage issues, convoys, and assignments</p>
				</div>
			</div>
			<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true"></div>
		</header>

		<main class="container py-6 space-y-6">
			<!-- Search Bar -->
			<div class="panel-glass p-4 mx-auto max-w-lg">
				<div class="relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<input
						type="search"
						value={searchInput}
						oninput={handleSearchInput}
						placeholder="Search by ID or title..."
						class="w-full pl-10 pr-10 py-2 bg-input border border-border rounded-lg
							   text-foreground placeholder:text-muted-foreground
							   focus:outline-none focus:ring-2 focus:ring-ring"
						aria-label="Search work items"
					/>
					{#if searchInput}
						<button
							type="button"
							onclick={clearSearch}
							class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Clear search"
						>
							<X class="w-4 h-4" />
						</button>
					{/if}
				</div>
			</div>

			<!-- Filters & Sort -->
			<div class="panel-glass p-4 mx-auto max-w-lg space-y-4">
				<!-- Type filter chips -->
				<div>
					<span class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Type</span>
					<div class="flex flex-wrap gap-2">
						{#each [
							{ label: 'All', value: 'all' },
							{ label: 'Tasks', value: 'task' },
							{ label: 'Bugs', value: 'bug' },
							{ label: 'Features', value: 'feature' },
							{ label: 'Epics', value: 'epic' }
						] as chip}
							<button
								type="button"
								class={cn(
									'px-3 py-1.5 text-xs font-medium rounded-full transition-colors touch-target',
									filters.type === chip.value
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-muted-foreground hover:bg-muted/80'
								)}
								onclick={() => setFilter('type', chip.value as typeof filters.type)}
								aria-pressed={filters.type === chip.value}
							>
								{chip.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Priority filter chips -->
				<div>
					<span class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Priority</span>
					<div class="flex flex-wrap gap-2">
						{#each [
							{ label: 'All', value: 'all' },
							{ label: 'P0', value: 0 },
							{ label: 'P1', value: 1 },
							{ label: 'P2', value: 2 },
							{ label: 'P3', value: 3 }
						] as chip}
							<button
								type="button"
								class={cn(
									'px-3 py-1.5 text-xs font-medium rounded-full transition-colors touch-target',
									filters.priority === chip.value
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-muted-foreground hover:bg-muted/80'
								)}
								onclick={() => setFilter('priority', chip.value as typeof filters.priority)}
								aria-pressed={filters.priority === chip.value}
							>
								{chip.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Status filter chips -->
				<div>
					<span class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Status</span>
					<div class="flex flex-wrap gap-2">
						{#each [
							{ label: 'All', value: 'all' },
							{ label: 'Open', value: 'open' },
							{ label: 'In Progress', value: 'in_progress' },
							{ label: 'Done', value: 'done' }
						] as chip}
							<button
								type="button"
								class={cn(
									'px-3 py-1.5 text-xs font-medium rounded-full transition-colors touch-target',
									filters.status === chip.value
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-muted-foreground hover:bg-muted/80'
								)}
								onclick={() => setFilter('status', chip.value as typeof filters.status)}
								aria-pressed={filters.status === chip.value}
							>
								{chip.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Sort controls -->
				<div class="flex items-center justify-between pt-2 border-t border-border">
					<div class="flex items-center gap-2">
						<span class="text-xs font-medium text-muted-foreground">Sort by:</span>
						<select
							bind:value={sortBy}
							class="px-2 py-1 text-xs bg-muted text-foreground rounded border border-border
								   appearance-none pr-6 cursor-pointer
								   focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="id">ID</option>
							<option value="priority">Priority</option>
							<option value="type">Type</option>
							<option value="updated">Updated</option>
						</select>
					</div>
					<button
						type="button"
						onclick={toggleSortOrder}
						class="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded hover:bg-muted/50 transition-colors touch-target"
						aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
					>
						{#if sortOrder === 'asc'}
							<ChevronUp class="w-4 h-4" />
							Asc
						{:else}
							<ChevronDown class="w-4 h-4" />
							Desc
						{/if}
					</button>
				</div>
			</div>

			<!-- Work Items List -->
			<section class="panel-glass p-4 mx-auto max-w-lg">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
						<ClipboardList class="w-5 h-5 text-foreground" strokeWidth={2} />
						Items ({filteredIssues.length})
					</h2>
				</div>

				{#if isLoading}
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
						title="No work items"
						description="Create your first issue to get started"
						actionLabel="Create Issue"
						onaction={() => document.getElementById('issue-form')?.scrollIntoView({ behavior: 'smooth' })}
						size="sm"
					/>
				{:else if filteredIssues.length === 0}
					<EmptyState
						title="No matches"
						description="No items match your current filters"
						actionLabel="Clear Filters"
						onaction={() => {
							filters = { type: 'all', priority: 'all', status: 'all' };
							searchInput = '';
							searchQuery = '';
							hapticLight();
						}}
						size="sm"
					/>
				{:else}
					<div class="space-y-3">
						{#each workItems as item (item.id)}
							<WorkItemCard
								{item}
								expanded={expandedItemId === item.id}
								onexpand={handleItemExpand}
							/>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Create Issue Section -->
			<section id="issue-form" class="panel-glass p-6 mx-auto max-w-lg">
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
			<section class="panel-glass p-6 mx-auto max-w-lg">
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
			<section class="panel-glass p-6 mx-auto max-w-lg">
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
		</main>

		<!-- Mobile create issue FAB -->
		<FloatingActionButton
			href="/work/new"
			ariaLabel="Create new issue"
		>
			<Plus class="w-5 h-5" strokeWidth={2.5} />
		</FloatingActionButton>
	</div>

	<!-- Work Item Detail Panel -->
	<WorkItemDetail
		item={selectedDetailItem}
		open={detailPanelOpen}
		onclose={handleCloseDetail}
	/>
</div>
