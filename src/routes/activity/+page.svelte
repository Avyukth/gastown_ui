<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { GridPattern, PullToRefresh } from '$lib/components';
	import { onMount, onDestroy } from 'svelte';
	import type { ActivityEvent } from './+page.server';
	import { RefreshCw, Activity } from 'lucide-svelte';

	let { data } = $props();

	// Auto-refresh state
	let autoRefresh = $state(true);
	let refreshInterval = $state(5000);
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let lastRefresh = $state(new Date());

	// Local filter state - use $derived to track URL/data changes
	let selectedType = $derived(data.filters.type);
	let selectedActor = $derived(data.filters.actor);

	// Icon mapping
	const iconSvgs: Record<string, string> = {
		play: '<path d="M6 4l12 8-12 8V4z"/>',
		stop: '<rect x="6" y="6" width="12" height="12"/>',
		rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
		bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
		send: '<path d="M22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
		inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
		'play-circle': '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
		'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
		'git-merge': '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
		check: '<polyline points="20 6 9 17 4 12"/>',
		x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
		'alert-triangle': '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
		activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'
	};

	function formatTime(isoString: string): string {
		const date = new Date(isoString);
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function formatDate(isoString: string): string {
		const date = new Date(isoString);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) {
			return 'Today';
		} else if (date.toDateString() === yesterday.toDateString()) {
			return 'Yesterday';
		}
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function getEventColor(type: string): string {
		const colors: Record<string, string> = {
			session_start: 'text-success',
			session_end: 'text-muted-foreground',
			spawn: 'text-accent',
			nudge: 'text-warning',
			mail_sent: 'text-info',
			mail_received: 'text-info',
			work_started: 'text-accent',
			work_completed: 'text-success',
			merge: 'text-success',
			test_pass: 'text-success',
			test_fail: 'text-destructive',
			error: 'text-destructive'
		};
		return colors[type] || 'text-foreground';
	}

	function applyFilters() {
		const params = new URLSearchParams();
		if (selectedType) params.set('type', selectedType);
		if (selectedActor) params.set('actor', selectedActor);
		const queryString = params.toString();
		goto(`/activity${queryString ? `?${queryString}` : ''}`, { replaceState: true });
	}

	function clearFilters() {
		selectedType = '';
		selectedActor = '';
		goto('/activity', { replaceState: true });
	}

	async function refresh() {
		await invalidateAll();
		lastRefresh = new Date();
	}

	function startAutoRefresh() {
		if (intervalId) clearInterval(intervalId);
		if (autoRefresh) {
			intervalId = setInterval(refresh, refreshInterval);
		}
	}

	function toggleAutoRefresh() {
		autoRefresh = !autoRefresh;
		if (autoRefresh) {
			startAutoRefresh();
		} else if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	// Group events by date
	function groupByDate(events: ActivityEvent[]): Map<string, ActivityEvent[]> {
		const groups = new Map<string, ActivityEvent[]>();
		for (const event of events) {
			const dateKey = formatDate(event.timestamp);
			if (!groups.has(dateKey)) {
				groups.set(dateKey, []);
			}
			groups.get(dateKey)!.push(event);
		}
		return groups;
	}

	const groupedEvents = $derived(groupByDate(data.events));

	onMount(() => {
		startAutoRefresh();
	});

	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});

	// Sync filter state with URL changes
	$effect(() => {
		selectedType = data.filters.type;
		selectedActor = data.filters.actor;
	});
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10 flex flex-col min-h-screen">
		<!-- Header (clean, minimal) -->
		<header class="sticky top-0 z-50 panel-glass px-4 h-[72px] relative">
			<div class="container h-full flex items-center justify-between gap-4 lg:pr-44">
				<div class="flex items-center gap-3">
					<div class="w-1.5 h-8 bg-primary rounded-sm shadow-glow shrink-0" aria-hidden="true"></div>
					<h1 class="text-2xl font-display font-semibold text-foreground">Activity Feed</h1>
					<span class="text-xs text-muted-foreground">
						{data.events.length} events
					</span>
				</div>

				<!-- Auto-refresh controls -->
				<div class="flex items-center gap-4">
					<span class="text-xs text-muted-foreground">
						Last: {formatTime(lastRefresh.toISOString())}
					</span>
					<button
						onclick={refresh}
						class="p-2 text-muted-foreground hover:text-foreground transition-colors"
						title="Refresh now"
					>
						<RefreshCw class="w-4 h-4" />
					</button>
					<button
						onclick={toggleAutoRefresh}
						class={cn(
							'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
							autoRefresh
								? 'bg-success/20 text-success'
								: 'bg-muted text-muted-foreground hover:bg-muted/80'
						)}
					>
						{autoRefresh ? 'Live' : 'Paused'}
					</button>
				</div>
			</div>
			<!-- Bottom gradient border -->
			<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true"></div>
		</header>

		<!-- Filter bar (separate, sticky below header) -->
		<div class="sticky top-[72px] z-40 panel-glass border-b border-border px-4 py-3">
			<div class="container space-y-3">
				<!-- Filter chips -->
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						class={cn(
							'px-3 py-1.5 text-xs font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
							selectedType === '' && !selectedActor
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground hover:bg-muted/80'
						)}
						onclick={() => clearFilters()}
					>
						All Events
					</button>
					{#each data.types as type}
						<button
							type="button"
							class={cn(
								'px-3 py-1.5 text-xs font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
								selectedType === type
									? 'bg-primary text-primary-foreground'
									: 'bg-muted text-muted-foreground hover:bg-muted/80'
							)}
							onclick={() => {
								selectedType = type;
								applyFilters();
							}}
						>
							{type.replace(/_/g, ' ')}
						</button>
					{/each}
				</div>

				<!-- Dropdown filters row -->
				<div class="flex flex-wrap items-center gap-4">
					<!-- Type filter (dropdown for narrow viewports) -->
					<div class="hidden sm:flex items-center gap-2">
						<span class="text-xs text-muted-foreground">Type:</span>
						<select
							bind:value={selectedType}
							onchange={applyFilters}
							class="px-2 py-1 text-xs bg-muted border border-border rounded text-foreground"
						>
							<option value="">All types</option>
							{#each data.types as type}
								<option value={type}>{type.replace(/_/g, ' ')}</option>
							{/each}
						</select>
					</div>

					<!-- Actor filter -->
					<div class="flex items-center gap-2">
						<span class="text-xs text-muted-foreground">Actor:</span>
						<select
							bind:value={selectedActor}
							onchange={applyFilters}
							class="px-2 py-1 text-xs bg-muted border border-border rounded text-foreground"
						>
							<option value="">All actors</option>
							{#each data.actors as actor}
								<option value={actor}>{actor}</option>
							{/each}
						</select>
					</div>

					<!-- Clear filters -->
					{#if selectedType || selectedActor}
						<button
							onclick={clearFilters}
							class="px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
						>
							Clear filters
						</button>
					{/if}

					<!-- Refresh interval -->
					<div class="ml-auto flex items-center gap-2">
						<span class="text-xs text-muted-foreground">Refresh:</span>
						<select
							bind:value={refreshInterval}
							onchange={startAutoRefresh}
							class="px-2 py-1 text-xs bg-muted border border-border rounded text-foreground"
							disabled={!autoRefresh}
						>
							<option value={3000}>3s</option>
							<option value={5000}>5s</option>
							<option value={10000}>10s</option>
							<option value={30000}>30s</option>
						</select>
					</div>
				</div>
			</div>
		</div>

		<!-- Activity stream with pull-to-refresh for mobile -->
		<PullToRefresh onRefresh={refresh} class="flex-1">
		<main class="container py-4" data-scrollable>
			{#if data.error}
				<div class="panel-glass p-8 text-center">
					<p class="text-destructive font-medium">Error loading activity</p>
					<p class="text-sm text-muted-foreground mt-2">{data.error}</p>
				</div>
			{:else if data.events.length === 0}
				<div class="panel-glass p-8 text-center">
					<Activity class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
					<p class="text-muted-foreground">No activity found</p>
					{#if selectedType || selectedActor}
						<p class="text-sm text-muted-foreground mt-2">
							Try clearing filters to see all events
						</p>
					{:else}
						<p class="text-sm text-muted-foreground mt-2">
							Events will appear here as Gas Town activity occurs
						</p>
					{/if}
				</div>
			{:else}
				<div class="space-y-6">
					{#each groupedEvents as [date, events]}
						<div>
							<!-- Date header -->
							<div class="flex items-center gap-3 mb-3">
								<span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
									{date}
								</span>
								<div class="flex-1 h-px bg-border"></div>
							</div>

							<!-- Events for this date -->
							<div class="panel-glass divide-y divide-border overflow-hidden">
								{#each events as event, i}
									<div
										class="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors animate-blur-fade-up"
										style="animation-delay: {i * 30}ms"
									>
										<!-- Icon -->
										<div
											class={cn(
												'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted/50',
												getEventColor(event.type)
											)}
										>
											<svg
												class="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												{@html iconSvgs[event.icon] || iconSvgs.activity}
											</svg>
										</div>

										<!-- Content -->
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2 mb-0.5">
												<span class="text-sm font-medium text-foreground">
													{event.actorDisplay}
												</span>
												<span
													class="px-1.5 py-0.5 text-2xs font-mono bg-muted rounded text-muted-foreground"
												>
													{event.type.replace(/_/g, ' ')}
												</span>
											</div>
											<p class="text-sm text-muted-foreground break-words">
												{event.description}
											</p>
										</div>

										<!-- Timestamp -->
										<time class="flex-shrink-0 text-xs text-muted-foreground font-mono">
											{formatTime(event.timestamp)}
										</time>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</main>
		</PullToRefresh>
	</div>
</div>
