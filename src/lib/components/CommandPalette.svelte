<script lang="ts">
	/**
	 * CommandPalette Component - Full-featured command palette
	 *
	 * Features:
	 * - Cmd+K/Ctrl+K global trigger
	 * - Search autocomplete for agents, issues, routes
	 * - Agent spawn commands
	 * - Formula triggers (bd/gt commands)
	 * - Quick navigation
	 * - Keyboard shortcuts display
	 *
	 * Design tokens used:
	 * - Animation: animate-scale-in, ease-out-expo
	 * - Typography: label-sm for hints, body-sm for descriptions
	 * - Shadows: shadow-2xl for modal elevation
	 */
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		Search,
		Command,
		Home,
		Bot,
		Target,
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
		CornerDownLeft,
		Plus,
		Play,
		Square,
		RefreshCw,
		Terminal,
		Hash,
		GitBranch,
		Send,
		Keyboard
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
	let activeMode = $state<'search' | 'command' | 'formula'>('search');

	// Detect OS for keyboard shortcut display
	let isMac = $state(false);

	onMount(() => {
		isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	});

	// Mode detection based on query prefix
	$effect(() => {
		const trimmed = query.trimStart();
		if (trimmed.startsWith('>')) {
			activeMode = 'command';
		} else if (trimmed.startsWith(':')) {
			activeMode = 'formula';
		} else {
			activeMode = 'search';
		}
	});

	const searchQuery = $derived.by(() => {
		const trimmed = query.trimStart();
		if (trimmed.startsWith('>')) return trimmed.slice(1).trim();
		if (trimmed.startsWith(':')) return trimmed.slice(1).trim();
		return trimmed;
	});

	// Mock data for search results
	const mockAgents = [
		{ id: 'mayor', name: 'Mayor', status: 'running', task: 'Coordinating work', type: 'coordinator' },
		{ id: 'witness-1', name: 'Witness (gastown_ui)', status: 'running', task: 'Monitoring polecats', type: 'monitor' },
		{ id: 'refinery-1', name: 'Refinery (gastown_ui)', status: 'idle', task: 'Waiting for merges', type: 'processor' },
		{ id: 'polecat-morsov', name: 'Polecat Morsov', status: 'running', task: 'Building features', type: 'worker' },
		{ id: 'polecat-rictus', name: 'Polecat Rictus', status: 'idle', task: 'Awaiting work', type: 'worker' },
		{ id: 'polecat-furiosa', name: 'Polecat Furiosa', status: 'running', task: 'UI polish', type: 'worker' }
	];

	const mockIssues = [
		{ id: 'gt-d3a', title: 'Authentication', type: 'epic', priority: 1 },
		{ id: 'gt-2hs', title: 'UI Components', type: 'epic', priority: 2 },
		{ id: 'gt-be4', title: 'Auth Token Refresh', type: 'task', priority: 2 },
		{ id: 'gt-931', title: 'CSRF Protection', type: 'task', priority: 2 },
		{ id: 'gt-3v5', title: 'Command Palette', type: 'task', priority: 2 },
		{ id: 'hq-7vsv', title: 'Global Search', type: 'task', priority: 1 }
	];

	const routes: Array<{ path: string; label: string; icon: ComponentType; description: string }> = [
		{ path: '/', label: 'Dashboard', icon: Home, description: 'Overview and stats' },
		{ path: '/agents', label: 'Agents', icon: Bot, description: 'View all agents' },
		{ path: '/work', label: 'Work', icon: Target, description: 'Issues and tasks' },
		{ path: '/convoys', label: 'Convoys', icon: Truck, description: 'Batch operations' },
		{ path: '/queue', label: 'Queue', icon: ClipboardList, description: 'Merge queue' },
		{ path: '/mail', label: 'Mail', icon: Mail, description: 'Messages' },
		{ path: '/escalations', label: 'Escalations', icon: Bell, description: 'Alerts and issues' },
		{ path: '/logs', label: 'Logs', icon: ScrollText, description: 'System logs' },
		{ path: '/settings', label: 'Settings', icon: Settings, description: 'Configuration' },
		{ path: '/crew', label: 'Crew', icon: Users, description: 'Team members' },
		{ path: '/watchdog', label: 'Watchdog', icon: Dog, description: 'Health monitoring' }
	];

	// Commands (> prefix)
	const commands = [
		{ id: 'spawn-polecat', label: 'Spawn Polecat', description: 'Create new worker agent', icon: Plus, category: 'agents' },
		{ id: 'stop-agent', label: 'Stop Agent', description: 'Gracefully stop an agent', icon: Square, category: 'agents' },
		{ id: 'restart-agent', label: 'Restart Agent', description: 'Restart selected agent', icon: RefreshCw, category: 'agents' },
		{ id: 'new-issue', label: 'New Issue', description: 'Create a new issue', icon: FileText, category: 'work' },
		{ id: 'new-convoy', label: 'New Convoy', description: 'Create batch operation', icon: Truck, category: 'work' },
		{ id: 'compose-mail', label: 'Compose Mail', description: 'Write a new message', icon: Send, category: 'communication' },
		{ id: 'refresh', label: 'Refresh', description: 'Reload current page', icon: RefreshCw, category: 'system' },
		{ id: 'shortcuts', label: 'Keyboard Shortcuts', description: 'View all shortcuts', icon: Keyboard, category: 'help' }
	];

	// Formula triggers (: prefix) - bd/gt commands
	const formulas = [
		{ id: 'bd-ready', label: 'bd ready', description: 'Show issues ready to work', icon: Terminal, category: 'beads' },
		{ id: 'bd-list', label: 'bd list', description: 'List all issues', icon: Terminal, category: 'beads' },
		{ id: 'bd-create', label: 'bd create', description: 'Create new issue', icon: Terminal, category: 'beads' },
		{ id: 'bd-close', label: 'bd close <id>', description: 'Close an issue', icon: Terminal, category: 'beads' },
		{ id: 'gt-status', label: 'gt status', description: 'Show town status', icon: Terminal, category: 'gasstown' },
		{ id: 'gt-mail', label: 'gt mail inbox', description: 'Check mail inbox', icon: Terminal, category: 'gasstown' },
		{ id: 'gt-hook', label: 'gt hook', description: 'Check hooked work', icon: Terminal, category: 'gasstown' },
		{ id: 'gt-done', label: 'gt done', description: 'Submit work to MQ', icon: Terminal, category: 'gasstown' },
		{ id: 'git-status', label: 'git status', description: 'Show git status', icon: GitBranch, category: 'git' },
		{ id: 'git-diff', label: 'git diff', description: 'Show uncommitted changes', icon: GitBranch, category: 'git' }
	];

	// Recent items
	const recentItems = [
		{ type: 'agent', id: 'polecat-furiosa', label: 'Polecat Furiosa', path: '/agents/polecat-furiosa' },
		{ type: 'issue', id: 'gt-3v5', label: 'Command Palette', path: '/work' },
		{ type: 'route', id: 'convoys', label: 'Convoys', path: '/convoys' }
	];

	// Search suggestions for empty state
	const searchSuggestions = [
		{ query: 'running agents', description: 'Find active agents' },
		{ query: 'P1 issues', description: 'High priority issues' },
		{ query: '>spawn', description: 'Spawn new agent' },
		{ query: ':bd ready', description: 'Check ready work' }
	];

	// Filter results based on query and mode
	const filteredAgents = $derived(
		activeMode === 'search' && searchQuery
			? mockAgents.filter(a =>
				a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				a.type.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: []
	);

	const filteredIssues = $derived(
		activeMode === 'search' && searchQuery
			? mockIssues.filter(i =>
				i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				i.id.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: []
	);

	const filteredRoutes = $derived(
		activeMode === 'search' && searchQuery
			? routes.filter(r =>
				r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
				r.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
				r.description.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: []
	);

	const filteredCommands = $derived(
		activeMode === 'command'
			? (searchQuery
				? commands.filter(c =>
					c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
					c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
					c.category.toLowerCase().includes(searchQuery.toLowerCase())
				)
				: commands)
			: []
	);

	const filteredFormulas = $derived(
		activeMode === 'formula'
			? (searchQuery
				? formulas.filter(f =>
					f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
					f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
					f.category.toLowerCase().includes(searchQuery.toLowerCase())
				)
				: formulas)
			: []
	);

	// Build flat list of all results for keyboard navigation
	interface PaletteResult {
		type: 'agent' | 'issue' | 'route' | 'command' | 'formula' | 'recent';
		id: string;
		label: string;
		sublabel?: string;
		icon?: ComponentType;
		category?: string;
		action: () => void;
	}

	const allResults = $derived.by((): PaletteResult[] => {
		const results: PaletteResult[] = [];

		if (activeMode === 'command') {
			filteredCommands.forEach(c => {
				results.push({
					type: 'command',
					id: c.id,
					label: c.label,
					sublabel: c.description,
					icon: c.icon,
					category: c.category,
					action: () => { executeCommand(c.id); close(); }
				});
			});
			return results;
		}

		if (activeMode === 'formula') {
			filteredFormulas.forEach(f => {
				results.push({
					type: 'formula',
					id: f.id,
					label: f.label,
					sublabel: f.description,
					icon: f.icon,
					category: f.category,
					action: () => { executeFormula(f.id); close(); }
				});
			});
			return results;
		}

		// Search mode
		if (!searchQuery) {
			// Show recent items when no query
			recentItems.forEach(item => {
				results.push({
					type: 'recent',
					id: item.id,
					label: item.label,
					sublabel: `Recent ${item.type}`,
					icon: Clock,
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
				sublabel: `${a.status} · ${a.task}`,
				icon: Bot,
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
				icon: FileText,
				action: () => { goto('/work'); close(); }
			});
		});

		// Routes
		filteredRoutes.forEach(r => {
			results.push({
				type: 'route',
				id: r.path,
				label: r.label,
				sublabel: r.description,
				icon: r.icon,
				action: () => { goto(r.path); close(); }
			});
		});

		return results;
	});

	// Command execution
	function executeCommand(commandId: string) {
		switch (commandId) {
			case 'spawn-polecat':
				goto('/agents?action=spawn');
				break;
			case 'new-issue':
				goto('/work?action=new');
				break;
			case 'new-convoy':
				goto('/convoys?action=new');
				break;
			case 'compose-mail':
				goto('/mail/compose');
				break;
			case 'refresh':
				window.location.reload();
				break;
			case 'shortcuts':
				// Could open a shortcuts modal
				console.log('Show shortcuts');
				break;
			default:
				console.log('Command:', commandId);
		}
	}

	// Formula execution
	function executeFormula(formulaId: string) {
		// In a real app, these would execute actual commands or open terminals
		console.log('Execute formula:', formulaId);
		// For now, just show a message
	}

	// Group results by type/category for display
	const groupedResults = $derived.by(() => {
		const groups: Record<string, PaletteResult[]> = {};

		for (const result of allResults) {
			const groupKey = result.category || result.type;
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
		route: 'Navigation',
		command: 'Commands',
		formula: 'Formulas',
		agents: 'Agent Commands',
		work: 'Work Commands',
		communication: 'Communication',
		system: 'System',
		help: 'Help',
		beads: 'Beads (bd)',
		gasstown: 'Gas Town (gt)',
		git: 'Git'
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

	// Reset selection when results change
	$effect(() => {
		allResults;
		selectedIndex = 0;
	});

	function open() {
		isOpen = true;
		query = '';
		selectedIndex = 0;
		activeMode = 'search';
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
			if (document.activeElement === firstElement) {
				e.preventDefault();
				lastElement?.focus();
			}
		} else {
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

	// Mode indicator
	const modeConfig = $derived.by(() => {
		switch (activeMode) {
			case 'command':
				return { icon: Zap, label: 'Commands', color: 'text-amber-500' };
			case 'formula':
				return { icon: Terminal, label: 'Formulas', color: 'text-emerald-500' };
			default:
				return { icon: Search, label: 'Search', color: 'text-muted-foreground' };
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Trigger button -->
<button
	type="button"
	onclick={open}
	class={cn(
		'flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-3 py-2',
		'rounded-lg transition-all duration-200 ease-out',
		'bg-card/80 backdrop-blur-sm text-muted-foreground',
		'border border-border/60',
		'hover:bg-card hover:text-foreground hover:border-primary/40',
		'hover:shadow-[0_0_12px_-3px_hsl(var(--primary)/0.3)]',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
		'active:scale-[0.98] active:shadow-inner',
		className
	)}
	aria-label="Open command palette (Press {isMac ? '⌘' : 'Ctrl'}+K)"
>
	<Command class="w-4 h-4 flex-shrink-0" />
	<span class="hidden sm:inline text-sm font-medium">Command...</span>
	<kbd class="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono font-medium bg-muted/80 text-muted-foreground rounded border border-border/80 shadow-sm">
		{isMac ? '⌘' : 'Ctrl'}K
	</kbd>
</button>

<!-- Modal -->
{#if isOpen}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
		role="dialog"
		aria-modal="true"
		aria-label="Command palette"
		tabindex="-1"
		onclick={handleBackdropClick}
		onkeydown={(e) => e.key === 'Escape' && close()}
	>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
			aria-hidden="true"
		></div>

		<!-- Modal content -->
		<div
			bind:this={dialogRef}
			class={cn(
				'relative w-full max-w-2xl',
				'bg-popover border border-border rounded-xl',
				'shadow-2xl overflow-hidden',
				'animate-scale-in origin-top'
			)}
		>
			<!-- Input area -->
			<div class="flex items-center gap-3 px-4 py-3 border-b border-border">
				<div class={cn('flex-shrink-0', modeConfig.color)}>
					<modeConfig.icon class="w-5 h-5" />
				</div>
				<label for="command-palette-input" class="sr-only">
					{activeMode === 'command' ? 'Type a command' : activeMode === 'formula' ? 'Type a formula' : 'Search or type > for commands, : for formulas'}
				</label>
				<input
					bind:this={inputRef}
					bind:value={query}
					id="command-palette-input"
					type="text"
					placeholder={activeMode === 'command'
						? 'Type a command...'
						: activeMode === 'formula'
						? 'Type a formula (bd, gt, git)...'
						: 'Search or type > for commands, : for formulas...'}
					class="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					spellcheck="false"
				/>
				{#if activeMode !== 'search'}
					<span class={cn('px-2 py-0.5 text-xs font-medium rounded-full', modeConfig.color, 'bg-current/10')}>
						{modeConfig.label}
					</span>
				{/if}
				<kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-mono text-muted-foreground bg-muted rounded border border-border">
					ESC
				</kbd>
			</div>

			<!-- Results -->
			<div class="max-h-[60vh] overflow-y-auto overscroll-contain">
				{#if allResults.length === 0}
					<div class="px-4 py-8 text-center">
						{#if searchQuery}
							<div class="text-muted-foreground">
								<Search class="w-10 h-10 mx-auto mb-3 opacity-40" />
								<p class="font-medium">No results for "{searchQuery}"</p>
								<p class="text-body-sm mt-1">
									{#if activeMode === 'search'}
										Try <kbd class="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">&gt;</kbd> for commands or <kbd class="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">:</kbd> for formulas
									{:else}
										Try a different search term
									{/if}
								</p>
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
								<!-- Group header -->
								<div class="flex items-center gap-2 px-2 py-1.5 text-label-sm text-muted-foreground/60 uppercase tracking-[0.1em]">
									{#if groupKey === 'recent'}
										<Clock class="w-3.5 h-3.5" />
									{:else if groupKey === 'beads' || groupKey === 'gasstown' || groupKey === 'git'}
										<Terminal class="w-3.5 h-3.5" />
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
											'transition-all duration-200 ease-out',
											flatIndex === selectedIndex
												? 'bg-accent text-accent-foreground shadow-sm'
												: 'hover:bg-muted/50',
											isRecent && flatIndex !== selectedIndex && 'opacity-60'
										)}
										onclick={() => item.action()}
										onmouseenter={() => selectedIndex = flatIndex}
									>
										<span class={cn(
											'w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-lg',
											flatIndex === selectedIndex
												? 'bg-accent-foreground/10 text-accent-foreground'
												: 'bg-muted/50 text-muted-foreground'
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
											<div class="flex items-center gap-1 text-muted-foreground opacity-60">
												<CornerDownLeft class="w-4 h-4" />
											</div>
										{/if}
									</button>
								{/each}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer with keyboard hints -->
			<div class="flex items-center justify-between gap-4 px-4 py-2.5 border-t border-border text-xs text-muted-foreground bg-muted/30">
				<div class="flex items-center gap-4">
					<span class="flex items-center gap-1.5">
						<kbd class="px-1.5 py-0.5 font-mono bg-background rounded border border-border shadow-sm">
							<ArrowUp class="w-3 h-3 inline" />
						</kbd>
						<kbd class="px-1.5 py-0.5 font-mono bg-background rounded border border-border shadow-sm">
							<ArrowDown class="w-3 h-3 inline" />
						</kbd>
						<span class="text-muted-foreground/80">navigate</span>
					</span>
					<span class="flex items-center gap-1.5">
						<kbd class="px-1.5 py-0.5 font-mono bg-background rounded border border-border shadow-sm">↵</kbd>
						<span class="text-muted-foreground/80">select</span>
					</span>
				</div>
				<div class="flex items-center gap-3">
					<span class="flex items-center gap-1.5">
						<kbd class="px-1.5 py-0.5 font-mono bg-background rounded border border-border shadow-sm">&gt;</kbd>
						<span class="text-muted-foreground/80">commands</span>
					</span>
					<span class="flex items-center gap-1.5">
						<kbd class="px-1.5 py-0.5 font-mono bg-background rounded border border-border shadow-sm">:</kbd>
						<span class="text-muted-foreground/80">formulas</span>
					</span>
				</div>
			</div>
		</div>
	</div>
{/if}
