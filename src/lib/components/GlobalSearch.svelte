<script lang="ts">
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	// State
	let isOpen = $state(false);
	let query = $state('');
	let selectedIndex = $state(0);
	let inputRef = $state<HTMLInputElement | null>(null);

	// Detect OS for keyboard shortcut display
	let isMac = $state(false);

	onMount(() => {
		isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	});

	// Command palette mode (when query starts with '>')
	const isCommandMode = $derived(query.trimStart().startsWith('>'));
	const searchQuery = $derived(isCommandMode ? query.slice(query.indexOf('>') + 1).trim() : query.trim());

	// Mock data for search results
	const mockAgents = [
		{ id: 'mayor', name: 'Mayor', status: 'running', task: 'Coordinating work' },
		{ id: 'witness-1', name: 'Witness (gastown_ui)', status: 'running', task: 'Monitoring polecats' },
		{ id: 'refinery-1', name: 'Refinery (gastown_ui)', status: 'idle', task: 'Waiting for merges' },
		{ id: 'polecat-morsov', name: 'Polecat Morsov', status: 'running', task: 'Building features' },
		{ id: 'polecat-rictus', name: 'Polecat Rictus', status: 'idle', task: 'Awaiting work' }
	];

	const mockIssues = [
		{ id: 'gt-d3a', title: 'Authentication', type: 'epic', priority: 1 },
		{ id: 'gt-2hs', title: 'UI Components', type: 'epic', priority: 2 },
		{ id: 'gt-be4', title: 'Auth Token Refresh', type: 'task', priority: 2 },
		{ id: 'gt-931', title: 'CSRF Protection', type: 'task', priority: 2 },
		{ id: 'gt-3v5', title: 'Command Palette', type: 'task', priority: 2 },
		{ id: 'hq-7vsv', title: 'Global Search', type: 'task', priority: 1 }
	];

	const mockConvoys = [
		{ id: 'convoy-001', name: 'Auth Sprint', status: 'active', progress: 45 },
		{ id: 'convoy-002', name: 'UI Polish', status: 'active', progress: 70 },
		{ id: 'convoy-003', name: 'Mobile PWA', status: 'stale', progress: 30 }
	];

	const routes = [
		{ path: '/', label: 'Dashboard', icon: '🏠' },
		{ path: '/agents', label: 'Agents', icon: '🤖' },
		{ path: '/work', label: 'Work', icon: '🎯' },
		{ path: '/convoys', label: 'Convoys', icon: '🚛' },
		{ path: '/queue', label: 'Queue', icon: '📋' },
		{ path: '/mail', label: 'Mail', icon: '📬' },
		{ path: '/escalations', label: 'Escalations', icon: '🚨' },
		{ path: '/logs', label: 'Logs', icon: '📜' },
		{ path: '/settings', label: 'Settings', icon: '⚙️' },
		{ path: '/crew', label: 'Crew', icon: '👥' },
		{ path: '/watchdog', label: 'Watchdog', icon: '🐕' }
	];

	const commands = [
		{ id: 'new-issue', label: 'New Issue', description: 'Create a new issue', action: () => goto('/work') },
		{ id: 'new-convoy', label: 'New Convoy', description: 'Create a new convoy', action: () => goto('/work') },
		{ id: 'go-settings', label: 'Go to Settings', description: 'Open settings page', action: () => goto('/settings') },
		{ id: 'go-mail', label: 'Compose Mail', description: 'Write a new message', action: () => goto('/mail/compose') },
		{ id: 'refresh', label: 'Refresh', description: 'Reload current page', action: () => window.location.reload() }
	];

	// Recent items (simulated)
	const recentItems = [
		{ type: 'agent', id: 'polecat-morsov', label: 'Polecat Morsov', path: '/agents/polecat-morsov' },
		{ type: 'issue', id: 'hq-7vsv', label: 'Global Search', path: '/work' },
		{ type: 'route', id: 'convoys', label: 'Convoys', path: '/convoys' }
	];

	// Filter results based on query
	const filteredAgents = $derived(
		searchQuery
			? mockAgents.filter(a =>
				a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				a.id.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: []
	);

	const filteredIssues = $derived(
		searchQuery
			? mockIssues.filter(i =>
				i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				i.id.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: []
	);

	const filteredConvoys = $derived(
		searchQuery
			? mockConvoys.filter(c =>
				c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.id.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: []
	);

	const filteredRoutes = $derived(
		searchQuery
			? routes.filter(r =>
				r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
				r.path.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: []
	);

	const filteredCommands = $derived(
		isCommandMode && searchQuery
			? commands.filter(c =>
				c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.description.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: isCommandMode ? commands : []
	);

	// Build flat list of all results for keyboard navigation
	interface SearchResult {
		type: 'agent' | 'issue' | 'convoy' | 'route' | 'command' | 'recent';
		id: string;
		label: string;
		sublabel?: string;
		icon?: string;
		action: () => void;
	}

	const allResults = $derived.by((): SearchResult[] => {
		if (isCommandMode) {
			return filteredCommands.map(c => ({
				type: 'command' as const,
				id: c.id,
				label: c.label,
				sublabel: c.description,
				icon: '⚡',
				action: () => { c.action(); close(); }
			}));
		}

		const results: SearchResult[] = [];

		// Show recent items when no query
		if (!searchQuery) {
			recentItems.forEach(item => {
				results.push({
					type: 'recent',
					id: item.id,
					label: item.label,
					sublabel: `Recent ${item.type}`,
					icon: item.type === 'agent' ? '🤖' : item.type === 'issue' ? '📝' : '📁',
					action: () => { goto(item.path); close(); }
				});
			});
			return results;
		}

		// Agents
		filteredAgents.forEach(a => {
			results.push({
				type: 'agent',
				id: a.id,
				label: a.name,
				sublabel: a.task,
				icon: '🤖',
				action: () => { goto(`/agents/${a.id}`); close(); }
			});
		});

		// Issues
		filteredIssues.forEach(i => {
			results.push({
				type: 'issue',
				id: i.id,
				label: i.title,
				sublabel: `${i.id} · ${i.type} · P${i.priority}`,
				icon: '📝',
				action: () => { goto('/work'); close(); }
			});
		});

		// Convoys
		filteredConvoys.forEach(c => {
			results.push({
				type: 'convoy',
				id: c.id,
				label: c.name,
				sublabel: `${c.status} · ${c.progress}%`,
				icon: '🚛',
				action: () => { goto(`/convoys/${c.id}`); close(); }
			});
		});

		// Routes
		filteredRoutes.forEach(r => {
			results.push({
				type: 'route',
				id: r.path,
				label: r.label,
				sublabel: r.path,
				icon: r.icon,
				action: () => { goto(r.path); close(); }
			});
		});

		return results;
	});

	// Reset selection when results change
	$effect(() => {
		allResults; // Subscribe to changes
		selectedIndex = 0;
	});

	function open() {
		isOpen = true;
		query = '';
		selectedIndex = 0;
		// Focus input after DOM update
		setTimeout(() => inputRef?.focus(), 0);
	}

	function close() {
		isOpen = false;
		query = '';
		selectedIndex = 0;
	}

	function handleKeydown(e: KeyboardEvent) {
		// Global shortcut: Cmd/Ctrl + K
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			if (isOpen) {
				close();
			} else {
				open();
			}
			return;
		}

		// Only handle these keys when modal is open
		if (!isOpen) return;

		switch (e.key) {
			case 'Escape':
				e.preventDefault();
				close();
				break;
			case 'ArrowDown':
				e.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, allResults.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				break;
			case 'Enter':
				e.preventDefault();
				if (allResults[selectedIndex]) {
					allResults[selectedIndex].action();
				}
				break;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	// Group results by type for display
	const groupedResults = $derived.by(() => {
		const groups: Record<string, SearchResult[]> = {};

		for (const result of allResults) {
			const groupKey = result.type;
			if (!groups[groupKey]) {
				groups[groupKey] = [];
			}
			groups[groupKey].push(result);
		}

		return groups;
	});

	const groupLabels: Record<string, string> = {
		recent: 'Recent',
		agent: 'Agents',
		issue: 'Issues',
		convoy: 'Convoys',
		route: 'Routes',
		command: 'Commands'
	};

	// Calculate flat index for a grouped item
	function getFlatIndex(groupKey: string, itemIndex: number): number {
		let flatIndex = 0;
		for (const [key, items] of Object.entries(groupedResults)) {
			if (key === groupKey) {
				return flatIndex + itemIndex;
			}
			flatIndex += items.length;
		}
		return 0;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Search trigger button (for mobile/header) -->
<button
	type="button"
	onclick={open}
	class={cn(
		'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
		'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground',
		'border border-border/50 hover:border-border',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
		className
	)}
	aria-label="Open search"
>
	<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
	</svg>
	<span class="hidden sm:inline text-sm">Search...</span>
	<kbd class="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono bg-background rounded border border-border">
		{isMac ? '⌘' : 'Ctrl'}K
	</kbd>
</button>

<!-- Modal overlay -->
{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
		role="dialog"
		aria-modal="true"
		aria-label="Global search"
		onclick={handleBackdropClick}
	>
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-hidden="true"></div>

		<!-- Modal content -->
		<div class="relative w-full max-w-xl bg-popover border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
			<!-- Search input -->
			<div class="flex items-center gap-3 px-4 py-3 border-b border-border">
				<svg class="w-5 h-5 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					bind:this={inputRef}
					bind:value={query}
					type="text"
					placeholder={isCommandMode ? 'Type a command...' : 'Search agents, issues, convoys, or type > for commands...'}
					class="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					spellcheck="false"
				/>
				<kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-mono text-muted-foreground bg-muted rounded border border-border">
					ESC
				</kbd>
			</div>

			<!-- Results -->
			<div class="max-h-[60vh] overflow-y-auto overscroll-contain">
				{#if allResults.length === 0}
					<div class="px-4 py-8 text-center text-muted-foreground">
						{#if searchQuery}
							<p>No results found for "{searchQuery}"</p>
							<p class="text-sm mt-1">Try a different search term or type &gt; for commands</p>
						{:else if isCommandMode}
							<p>Type to search commands</p>
						{:else}
							<p>Start typing to search</p>
						{/if}
					</div>
				{:else}
					<div class="py-2">
						{#each Object.entries(groupedResults) as [groupKey, items]}
							<div class="px-2">
								<div class="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
									{groupLabels[groupKey] || groupKey}
								</div>
								{#each items as item, itemIndex}
									{@const flatIndex = getFlatIndex(groupKey, itemIndex)}
									<button
										type="button"
										class={cn(
											'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
											flatIndex === selectedIndex
												? 'bg-accent text-accent-foreground'
												: 'hover:bg-muted/50'
										)}
										onclick={() => item.action()}
										onmouseenter={() => selectedIndex = flatIndex}
									>
										<span class="w-6 h-6 flex items-center justify-center text-base flex-shrink-0">
											{item.icon}
										</span>
										<div class="flex-1 min-w-0">
											<div class="font-medium truncate">{item.label}</div>
											{#if item.sublabel}
												<div class="text-sm text-muted-foreground truncate">{item.sublabel}</div>
											{/if}
										</div>
										{#if flatIndex === selectedIndex}
											<kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-mono text-muted-foreground bg-background rounded border border-border">
												↵
											</kbd>
										{/if}
									</button>
								{/each}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer hints -->
			<div class="flex items-center justify-between gap-4 px-4 py-2 border-t border-border text-xs text-muted-foreground">
				<div class="flex items-center gap-4">
					<span class="flex items-center gap-1">
						<kbd class="px-1 py-0.5 font-mono bg-muted rounded">↑</kbd>
						<kbd class="px-1 py-0.5 font-mono bg-muted rounded">↓</kbd>
						to navigate
					</span>
					<span class="flex items-center gap-1">
						<kbd class="px-1 py-0.5 font-mono bg-muted rounded">↵</kbd>
						to select
					</span>
				</div>
				<span class="flex items-center gap-1">
					<kbd class="px-1 py-0.5 font-mono bg-muted rounded">&gt;</kbd>
					for commands
				</span>
			</div>
		</div>
	</div>
{/if}
