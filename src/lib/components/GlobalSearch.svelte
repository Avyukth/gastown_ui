<script lang="ts">
	/**
	 * GlobalSearch Component - Enhanced Command Palette
	 *
	 * Design tokens used:
	 * - Animation: ease-out-expo for open, ease-spring for item hover
	 * - Typography: label-sm for hints, body-sm for sublabels
	 * - Shadows: shadow-2xl for modal elevation
	 */
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		Search,
		Home,
		Bot,
		Briefcase,
		Truck,
		ClipboardList,
		Mail,
		Bell,
		ScrollText,
		Settings,
		Users,
		Dog,
		Zap,
		FileText,
		FolderOpen,
		Clock,
		Sparkles,
		ArrowUp,
		ArrowDown,
		CornerDownLeft
	} from 'lucide-svelte';
	import type { ComponentType } from 'svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	// State
	let isOpen = $state(false);
	let query = $state('');
	let selectedIndex = $state(0);
	let inputRef = $state<HTMLInputElement | null>(null);
	let dialogRef = $state<HTMLDivElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);

	// Filter state
	let filters = $state({ type: 'all' as 'all' | 'agent' | 'issue' | 'convoy' | 'route' });
	let recentSearches = $state<string[]>([]);

	// Detect OS for keyboard shortcut display
	let isMac = $state(false);

	onMount(() => {
		isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
		// Load recent searches from localStorage
		const saved = localStorage.getItem('gastown-recent-searches');
		if (saved) {
			try {
				recentSearches = JSON.parse(saved);
			} catch (e) {
				console.error('Failed to parse recent searches:', e);
			}
		}
		// Listen for open-search event from keyboard shortcuts
		window.addEventListener('open-search', open);
		return () => {
			window.removeEventListener('open-search', open);
		};
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

	const routes: Array<{ path: string; label: string; icon: ComponentType }> = [
		{ path: '/', label: 'Dashboard', icon: Home },
		{ path: '/agents', label: 'Agents', icon: Bot },
		{ path: '/work', label: 'Work', icon: Briefcase },
		{ path: '/convoys', label: 'Convoys', icon: Truck },
		{ path: '/queue', label: 'Queue', icon: ClipboardList },
		{ path: '/mail', label: 'Mail', icon: Mail },
		{ path: '/escalations', label: 'Escalations', icon: Bell },
		{ path: '/logs', label: 'Logs', icon: ScrollText },
		{ path: '/settings', label: 'Settings', icon: Settings },
		{ path: '/crew', label: 'Crew', icon: Users },
		{ path: '/watchdog', label: 'Watchdog', icon: Dog }
	];

	const commands = [
		{ id: 'new-issue', label: 'New Issue', description: 'Create a new issue', action: () => goto('/work') },
		{ id: 'new-convoy', label: 'New Convoy', description: 'Create a new convoy', action: () => goto('/work') },
		{ id: 'go-settings', label: 'Go to Settings', description: 'Open settings page', action: () => goto('/settings') },
		{ id: 'go-mail', label: 'Compose Mail', description: 'Write a new message', action: () => goto('/mail/compose') },
		{ id: 'refresh', label: 'Refresh', description: 'Reload current page', action: () => window.location.reload() }
	];

	// Recent items (simulated) - shown with clock icon at 60% opacity
	const recentItems = [
		{ type: 'agent', id: 'polecat-morsov', label: 'Polecat Morsov', path: '/agents/polecat-morsov' },
		{ type: 'issue', id: 'hq-7vsv', label: 'Global Search', path: '/work' },
		{ type: 'route', id: 'convoys', label: 'Convoys', path: '/convoys' }
	];

	// Search suggestions for empty state
	const searchSuggestions = [
		{ query: 'running agents', description: 'Find active agents' },
		{ query: 'P1 issues', description: 'High priority issues' },
		{ query: '>new issue', description: 'Create a new issue' },
		{ query: 'convoy', description: 'View convoy status' }
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

	// Helper: Save recent search
	function addRecentSearch(term: string) {
		if (!term.trim()) return;
		const filtered = recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase());
		recentSearches = [term, ...filtered].slice(0, 5);
		localStorage.setItem('gastown-recent-searches', JSON.stringify(recentSearches));
	}

	// Helper: Execute search (apply filters)
	function shouldIncludeInResults(type: 'agent' | 'issue' | 'convoy' | 'route'): boolean {
		return filters.type === 'all' || filters.type === type;
	}

	// Build flat list of all results for keyboard navigation
	interface SearchResult {
		type: 'agent' | 'issue' | 'convoy' | 'route' | 'command' | 'recent';
		id: string;
		label: string;
		sublabel?: string;
		icon?: ComponentType;
		action: () => void;
	}

	const allResults = $derived.by((): SearchResult[] => {
		if (isCommandMode) {
			return filteredCommands.map(c => ({
				type: 'command' as const,
				id: c.id,
				label: c.label,
				sublabel: c.description,
				icon: Zap,
				action: () => { c.action(); close(); }
			}));
		}

		const results: SearchResult[] = [];

		// Show recent items when no query (with Clock icon, will be styled at 60% opacity)
		if (!searchQuery) {
			recentItems.forEach(item => {
				results.push({
					type: 'recent',
					id: item.id,
					label: item.label,
					sublabel: `Recent ${item.type}`,
					icon: Clock, // Clock icon for all recent items
					action: () => { goto(item.path); close(); }
				});
			});
			return results;
		}

		// Agents
		if (shouldIncludeInResults('agent')) {
			filteredAgents.forEach(a => {
				results.push({
					type: 'agent',
					id: a.id,
					label: a.name,
					sublabel: a.task,
					icon: Bot,
					action: () => { goto(`/agents/${a.id}`); close(); }
				});
			});
		}

		// Issues
		if (shouldIncludeInResults('issue')) {
			filteredIssues.forEach(i => {
				results.push({
					type: 'issue',
					id: i.id,
					label: i.title,
					sublabel: `${i.id} · ${i.type} · P${i.priority}`,
					icon: FileText,
					action: () => { goto('/work'); close(); }
				});
			});
		}

		// Convoys
		if (shouldIncludeInResults('convoy')) {
			filteredConvoys.forEach(c => {
				results.push({
					type: 'convoy',
					id: c.id,
					label: c.name,
					sublabel: `${c.status} · ${c.progress}%`,
					icon: Truck,
					action: () => { goto(`/convoys/${c.id}`); close(); }
				});
			});
		}

		// Routes
		if (shouldIncludeInResults('route')) {
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
		}

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
		if (query.trim()) {
			addRecentSearch(query.trim());
		}
		isOpen = false;
		query = '';
		selectedIndex = 0;
		filters.type = 'all';
		// Restore focus to trigger button for accessibility
		requestAnimationFrame(() => triggerRef?.focus());
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
			case 'Tab':
				// Focus trap: keep Tab within dialog
				handleFocusTrap(e);
				break;
		}
	}

	function handleFocusTrap(e: KeyboardEvent) {
		if (!dialogRef) return;

		const focusableElements = dialogRef.querySelectorAll<HTMLElement>(
			'input, button, [tabindex]:not([tabindex="-1"])'
		);
		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		if (e.shiftKey) {
			// Shift+Tab: if on first element, go to last
			if (document.activeElement === firstElement) {
				e.preventDefault();
				lastElement?.focus();
			}
		} else {
			// Tab: if on last element, go to first
			if (document.activeElement === lastElement) {
				e.preventDefault();
				firstElement?.focus();
			}
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
	bind:this={triggerRef}
	type="button"
	onclick={open}
	class={cn(
		// Base layout and sizing
		'flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-3 py-2',
		'rounded-lg transition-all duration-200',
		// Colors and background - industrial aesthetic
		'bg-card/80 backdrop-blur-sm text-muted-foreground',
		'border border-border/60',
		// Hover state with subtle glow
		'hover:bg-card hover:text-foreground hover:border-primary/40',
		'hover:shadow-[0_0_12px_-3px_hsl(var(--primary)/0.3)]',
		// Focus state for accessibility
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
		// Active state
		'active:scale-[0.98] active:shadow-inner',
		className
	)}
	aria-label="Open search (Press {isMac ? '⌘' : 'Ctrl'}+K)"
>
	<Search class="w-4 h-4 flex-shrink-0" />
	<span class="hidden sm:inline text-sm font-medium">Search...</span>
	<kbd class="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono font-medium bg-muted/80 text-muted-foreground rounded border border-border/80 shadow-sm">
		{isMac ? '⌘' : 'Ctrl'}K
	</kbd>
</button>

<!-- Modal overlay -->
{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="search-dialog-title"
	>
		<!-- Backdrop with fade animation - button for accessibility -->
		<button
			type="button"
			class="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in cursor-default"
			onclick={close}
			aria-label="Close search"
			tabindex="-1"
		></button>

		<!-- Modal content with scale + fade from trigger -->
		<div
			bind:this={dialogRef}
			class={cn(
				'relative w-full max-w-xl',
				'bg-popover border border-border rounded-xl',
				'shadow-2xl overflow-hidden',
				// Scale + fade animation using design tokens
				'animate-scale-in origin-top'
			)}
		>
			<!-- Search input -->
			<div class="space-y-3 px-4 py-3 border-b border-border">
				<div class="flex items-center gap-3">
					<label for="global-search-input" class="sr-only" id="search-dialog-title">
						Search agents, issues, convoys, or commands
					</label>
					<Search class="w-5 h-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
					<input
						bind:this={inputRef}
						bind:value={query}
						id="global-search-input"
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

				<!-- Filter buttons (show when searching) -->
				{#if searchQuery}
					<div class="flex flex-wrap gap-2">
						{#each [
							{ label: 'All', value: 'all' },
							{ label: 'Agents', value: 'agent' },
							{ label: 'Issues', value: 'issue' },
							{ label: 'Convoys', value: 'convoy' }
						] as filterOption}
							<button
								type="button"
								class={cn(
									'px-3 py-1 text-xs font-medium rounded-md transition-colors',
									filters.type === filterOption.value
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-muted-foreground hover:bg-muted/80'
								)}
								onclick={() => filters.type = filterOption.value as any}
								aria-pressed={filters.type === filterOption.value}
							>
								{filterOption.label}
							</button>
						{/each}
					</div>
				{/if}

				<!-- Recent searches (show when empty query) -->
				{#if !searchQuery && !isCommandMode && recentSearches.length > 0}
					<div class="flex flex-wrap gap-2">
						<span class="text-xs text-muted-foreground w-full mb-1">Recent:</span>
						{#each recentSearches as recent}
							<button
								type="button"
								class="px-3 py-1 text-xs rounded-md bg-muted/50 text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1"
								onclick={() => query = recent}
								title="Search for '{recent}'"
							>
								<Clock class="w-3 h-3" />
								{recent}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Results -->
			<div class="max-h-[60vh] overflow-y-auto overscroll-contain">
				{#if allResults.length === 0}
					<div class="px-4 py-8 text-center">
						{#if searchQuery}
							<!-- No results found -->
							<div class="text-muted-foreground">
								<Search class="w-10 h-10 mx-auto mb-3 opacity-40" />
								<p class="font-medium">No results for "{searchQuery}"</p>
								<p class="text-body-sm mt-1">Try a different search term or type <kbd class="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">&gt;</kbd> for commands</p>
							</div>
						{:else if isCommandMode}
							<!-- Command mode empty -->
							<div class="text-muted-foreground">
								<Zap class="w-10 h-10 mx-auto mb-3 opacity-40" />
								<p class="font-medium">Type to search commands</p>
							</div>
						{:else}
							<!-- Empty state with suggestions -->
							<div class="space-y-4">
								<div class="text-muted-foreground">
									<Sparkles class="w-10 h-10 mx-auto mb-3 opacity-40" />
									<p class="font-medium">Try searching for:</p>
								</div>
								<div class="flex flex-wrap justify-center gap-2">
									{#each searchSuggestions as suggestion}
										<button
											type="button"
											class="inline-flex items-center gap-1.5 px-3 py-1.5 text-body-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors duration-fast"
											onclick={() => query = suggestion.query}
										>
											<Search class="w-3 h-3" />
											{suggestion.query}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<div class="py-2">
						{#each Object.entries(groupedResults) as [groupKey, items]}
							<div class="px-2">
								<!-- Group header with icon -->
								<div class="flex items-center gap-2 px-2 py-1.5 text-label-sm text-muted-foreground uppercase tracking-wider">
									{#if groupKey === 'recent'}
										<Clock class="w-3.5 h-3.5" />
									{/if}
									{groupLabels[groupKey] || groupKey}
								</div>
								{#each items as item, itemIndex}
									{@const flatIndex = getFlatIndex(groupKey, itemIndex)}
									{@const isRecent = item.type === 'recent'}
									<button
										type="button"
										class={cn(
											'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
											'transition-all duration-fast ease-out-expo',
											flatIndex === selectedIndex
												? 'bg-accent text-accent-foreground shadow-sm'
												: 'hover:bg-muted/50',
											// Recent items at 60% opacity
											isRecent && flatIndex !== selectedIndex && 'opacity-60'
										)}
										onclick={() => item.action()}
										onmouseenter={() => selectedIndex = flatIndex}
									>
										<span class={cn(
											'w-6 h-6 flex items-center justify-center flex-shrink-0 rounded-md',
											flatIndex === selectedIndex ? 'text-accent-foreground' : 'text-muted-foreground'
										)}>
											{#if item.icon}
												<item.icon size={18} strokeWidth={2} />
											{/if}
										</span>
										<div class="flex-1 min-w-0">
											<div class="font-medium truncate">{item.label}</div>
											{#if item.sublabel}
												<div class="text-body-sm text-muted-foreground truncate">{item.sublabel}</div>
											{/if}
										</div>
										{#if flatIndex === selectedIndex}
											<div class="flex items-center gap-1 text-muted-foreground">
												<CornerDownLeft class="w-3.5 h-3.5" />
											</div>
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
