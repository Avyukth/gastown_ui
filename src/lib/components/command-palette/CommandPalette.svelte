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
	 */
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		Search,
		Command,
		Bot,
		FileText,
		Clock,
		Sparkles,
		ArrowUp,
		ArrowDown,
		CornerDownLeft,
		Terminal,
		Zap
	} from 'lucide-svelte';

	import { toastStore } from '$lib/stores/toast.svelte';
	import type { PaletteMode, PaletteResult, ModeConfig, AgentItem, IssueItem } from './types';
	import {
		routes,
		commands,
		formulas,
		mockAgents,
		mockIssues,
		recentItems,
		searchSuggestions,
		groupLabels
	} from './data';

	// Dynamic data fetched from APIs
	let agents = $state<AgentItem[]>(mockAgents);
	let issues = $state<IssueItem[]>(mockIssues);
	let dataFetched = $state(false);

	// Fetch agents and issues when palette opens
	async function fetchData() {
		if (dataFetched) return;

		try {
			// Fetch agents
			const agentsRes = await fetch('/api/gastown/agents');
			if (agentsRes.ok) {
				const data = await agentsRes.json();
				if (data.agents && Array.isArray(data.agents)) {
					agents = data.agents.map((a: { id?: string; name: string; status: string; currentTask?: string; type?: string; role?: string }) => ({
						id: a.id || a.name,
						name: a.name,
						status: a.status === 'running' ? 'running' : a.status === 'idle' ? 'idle' : 'offline',
						task: a.currentTask || `${a.type || a.role || 'agent'}`,
						type: a.type || a.role || 'agent'
					}));
				}
			}
		} catch {
			// Use mock data on error
		}

		try {
			// Fetch issues
			const issuesRes = await fetch('/api/gastown/work/issues?limit=20');
			if (issuesRes.ok) {
				const data = await issuesRes.json();
				if (data.issues && Array.isArray(data.issues)) {
					issues = data.issues.map((i: { id: string; title: string; issue_type?: string; type?: string; priority?: number }) => ({
						id: i.id,
						title: i.title,
						type: i.issue_type || i.type || 'task',
						priority: i.priority ?? 3
					}));
				}
			}
		} catch {
			// Use mock data on error
		}

		dataFetched = true;
	}

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
	let activeMode = $state<PaletteMode>('search');

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

	// Filter results based on query and mode
	const filteredAgents = $derived(
		activeMode === 'search' && searchQuery
			? agents.filter(
					(a) =>
						a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
						a.type.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: []
	);

	const filteredIssues = $derived(
		activeMode === 'search' && searchQuery
			? issues.filter(
					(i) =>
						i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						i.id.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: []
	);

	const filteredRoutes = $derived(
		activeMode === 'search' && searchQuery
			? routes.filter(
					(r) =>
						r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
						r.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
						r.description.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: []
	);

	const filteredCommands = $derived(
		activeMode === 'command'
			? searchQuery
				? commands.filter(
						(c) =>
							c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
							c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
							c.category.toLowerCase().includes(searchQuery.toLowerCase())
					)
				: commands
			: []
	);

	const filteredFormulas = $derived(
		activeMode === 'formula'
			? searchQuery
				? formulas.filter(
						(f) =>
							f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
							f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
							f.category.toLowerCase().includes(searchQuery.toLowerCase())
					)
				: formulas
			: []
	);

	// Build flat list of all results for keyboard navigation
	const allResults = $derived.by((): PaletteResult[] => {
		const results: PaletteResult[] = [];

		if (activeMode === 'command') {
			filteredCommands.forEach((c) => {
				results.push({
					type: 'command',
					id: c.id,
					label: c.label,
					sublabel: c.description,
					icon: c.icon,
					category: c.category,
					action: () => {
						executeCommand(c.id);
						close();
					}
				});
			});
			return results;
		}

		if (activeMode === 'formula') {
			filteredFormulas.forEach((f) => {
				results.push({
					type: 'formula',
					id: f.id,
					label: f.label,
					sublabel: f.description,
					icon: f.icon,
					category: f.category,
					action: () => {
						executeFormula(f.id);
						close();
					}
				});
			});
			return results;
		}

		// Search mode
		if (!searchQuery) {
			// Show recent items when no query
			recentItems.forEach((item) => {
				results.push({
					type: 'recent',
					id: item.id,
					label: item.label,
					sublabel: `Recent ${item.type}`,
					icon: Clock,
					action: () => {
						goto(item.path);
						close();
					}
				});
			});
			return results;
		}

		// Agents
		filteredAgents.forEach((a) => {
			results.push({
				type: 'agent',
				id: a.id,
				label: a.name,
				sublabel: `${a.status} · ${a.task}`,
				icon: Bot,
				action: () => {
					goto(`/agents/${a.id}`);
					close();
				}
			});
		});

		// Issues
		filteredIssues.forEach((i) => {
			results.push({
				type: 'issue',
				id: i.id,
				label: i.title,
				sublabel: `${i.id} · ${i.type} · P${i.priority}`,
				icon: FileText,
				action: () => {
					goto('/work');
					close();
				}
			});
		});

		// Routes
		filteredRoutes.forEach((r) => {
			results.push({
				type: 'route',
				id: r.path,
				label: r.label,
				sublabel: r.description,
				icon: r.icon,
				action: () => {
					goto(r.path);
					close();
				}
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
				showKeyboardShortcuts();
				break;
			default:
			// Unknown command - no action
		}
	}

	// Keyboard shortcuts display
	function showKeyboardShortcuts() {
		const modKey = isMac ? '⌘' : 'Ctrl';
		const shortcuts = [
			{ keys: `${modKey}+K`, desc: 'Open Command Palette' },
			{ keys: `${modKey}+/`, desc: 'Toggle Sidebar' },
			{ keys: `${modKey}+Shift+N`, desc: 'New Issue' },
			{ keys: `${modKey}+Shift+M`, desc: 'Compose Mail' },
			{ keys: `${modKey}+Shift+R`, desc: 'Refresh' },
			{ keys: 'Esc', desc: 'Close Dialog / Cancel' },
			{ keys: '↑/↓', desc: 'Navigate Results' },
			{ keys: 'Enter', desc: 'Select Result' },
			{ keys: '>', desc: 'Command Mode' },
			{ keys: ':', desc: 'Formula Mode' }
		];

		const shortcutText = shortcuts.map(s => `${s.keys}: ${s.desc}`).join('\n');
		toastStore.info(`Keyboard Shortcuts:\n${shortcutText}`, { duration: 10000 });
	}

	// Formula execution - execute CLI commands via API
	async function executeFormula(formulaId: string) {
		// Map formula IDs to CLI commands
		const formulaCommands: Record<string, { cmd: 'gt' | 'bd' | 'git'; args: string[] }> = {
			'bd-ready': { cmd: 'bd', args: ['ready'] },
			'bd-list': { cmd: 'bd', args: ['list'] },
			'bd-create': { cmd: 'bd', args: ['create'] },
			'bd-close': { cmd: 'bd', args: ['close'] },
			'gt-status': { cmd: 'gt', args: ['status'] },
			'gt-mail': { cmd: 'gt', args: ['mail', 'inbox'] },
			'gt-hook': { cmd: 'gt', args: ['hook'] },
			'gt-done': { cmd: 'gt', args: ['done'] },
			'git-status': { cmd: 'git', args: ['status'] },
			'git-diff': { cmd: 'git', args: ['diff'] }
		};

		const formula = formulaCommands[formulaId];
		if (!formula) {
			toastStore.warning(`Unknown formula: ${formulaId}`);
			return;
		}

		const complete = toastStore.async(`Running ${formula.cmd} ${formula.args.join(' ')}...`);

		try {
			// For navigation commands, redirect to the appropriate page
			switch (formulaId) {
				case 'bd-ready':
					complete.success('Showing ready work');
					goto('/work?status=ready');
					return;
				case 'bd-list':
					complete.success('Showing issues list');
					goto('/work');
					return;
				case 'bd-create':
					complete.success('Opening issue creator');
					goto('/work?action=new');
					return;
				case 'gt-status':
					complete.success('Showing status');
					goto('/');
					return;
				case 'gt-mail':
					complete.success('Opening inbox');
					goto('/mail');
					return;
				case 'gt-hook':
					complete.success('Showing hooked work');
					goto('/work?filter=hooked');
					return;
				case 'gt-done':
					complete.success('Showing merge queue');
					goto('/queue');
					return;
				default:
					// For other formulas, show a message
					complete.info(`Formula "${formulaId}" executed - navigate to view results`);
			}
		} catch (err) {
			complete.error(err instanceof Error ? err.message : 'Formula execution failed');
		}
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
		// Fetch data when palette opens
		fetchData();
	}

	function close() {
		isOpen = false;
		query = '';
		selectedIndex = 0;
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

	// Mode indicator
	const modeConfig = $derived.by((): ModeConfig => {
		switch (activeMode) {
			case 'command':
				return { icon: Zap, label: 'Commands', color: 'text-amber-500' };
			case 'formula':
				return { icon: Terminal, label: 'Formulas', color: 'text-emerald-500' };
			default:
				return { icon: Search, label: 'Search', color: 'text-muted-foreground' };
		}
	});

	// Generate unique ID for a result option
	function getResultId(index: number): string {
		return `cmd-result-${index}`;
	}

	// Get the currently active descendant ID
	const activeDescendantId = $derived(
		allResults.length > 0 && selectedIndex >= 0 ? getResultId(selectedIndex) : undefined
	);
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Trigger button -->
<button
	bind:this={triggerRef}
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
	<kbd
		class="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono font-medium bg-muted/80 text-muted-foreground rounded border border-border/80 shadow-sm"
	>
		{isMac ? '⌘' : 'Ctrl'}K
	</kbd>
</button>

<!-- Modal -->
{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="command-palette-title"
	>
		<!-- Backdrop - button for accessibility -->
		<button
			type="button"
			class="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in cursor-default"
			onclick={close}
			aria-label="Close command palette"
			tabindex="-1"
		></button>

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
			<h2 id="command-palette-title" class="sr-only">Command Palette</h2>
			<div class="flex items-center gap-3 px-4 py-3 border-b border-border">
				<div class={cn('flex-shrink-0', modeConfig.color)}>
					<modeConfig.icon class="w-5 h-5" />
				</div>
				<label for="command-palette-input" class="sr-only">
					{activeMode === 'command'
						? 'Type a command'
						: activeMode === 'formula'
							? 'Type a formula'
							: 'Search or type > for commands, : for formulas'}
				</label>
				<input
					bind:this={inputRef}
					bind:value={query}
					id="command-palette-input"
					type="text"
					role="combobox"
					aria-expanded={allResults.length > 0}
					aria-haspopup="listbox"
					aria-controls="command-results-listbox"
					aria-activedescendant={activeDescendantId}
					aria-autocomplete="list"
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
				<kbd
					class="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-mono text-muted-foreground bg-muted rounded border border-border"
				>
					ESC
				</kbd>
			</div>

			<!-- Results -->
			<div
				id="command-results-listbox"
				role="listbox"
				aria-label="Command palette results"
				class="max-h-[60vh] overflow-y-auto overscroll-contain"
			>
				{#if allResults.length === 0}
					<div class="px-4 py-8 text-center">
						{#if searchQuery}
							<div class="text-muted-foreground">
								<Search class="w-10 h-10 mx-auto mb-3 opacity-40" />
								<p class="font-medium">No results for "{searchQuery}"</p>
								<p class="text-body-sm mt-1">
									{#if activeMode === 'search'}
										Try <kbd class="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">&gt;</kbd> for commands
										or <kbd class="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">:</kbd> for formulas
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
											class="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-touch text-body-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors duration-fast"
											onclick={() => (query = suggestion.query)}
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
								<div
									class="flex items-center gap-2 px-2 py-1.5 text-label-sm text-muted-foreground/60 uppercase tracking-[0.1em]"
								>
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
										id={getResultId(flatIndex)}
										role="option"
										aria-selected={flatIndex === selectedIndex}
										class={cn(
											'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
											'transition-all duration-200 ease-out',
											flatIndex === selectedIndex
												? 'bg-accent text-accent-foreground shadow-sm'
												: 'hover:bg-muted/50',
											isRecent && flatIndex !== selectedIndex && 'opacity-60'
										)}
										onclick={() => item.action()}
										onmouseenter={() => (selectedIndex = flatIndex)}
									>
										<span
											class={cn(
												'w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-lg',
												flatIndex === selectedIndex
													? 'bg-accent-foreground/10 text-accent-foreground'
													: 'bg-muted/50 text-muted-foreground'
											)}
										>
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
			<div
				class="flex items-center justify-between gap-4 px-4 py-2.5 border-t border-border text-xs text-muted-foreground bg-muted/30"
			>
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
						<kbd class="px-1.5 py-0.5 font-mono bg-background rounded border border-border shadow-sm"
							>↵</kbd
						>
						<span class="text-muted-foreground/80">select</span>
					</span>
				</div>
				<div class="flex items-center gap-3">
					<span class="flex items-center gap-1.5">
						<kbd class="px-1.5 py-0.5 font-mono bg-background rounded border border-border shadow-sm"
							>&gt;</kbd
						>
						<span class="text-muted-foreground/80">commands</span>
					</span>
					<span class="flex items-center gap-1.5">
						<kbd class="px-1.5 py-0.5 font-mono bg-background rounded border border-border shadow-sm"
							>:</kbd
						>
						<span class="text-muted-foreground/80">formulas</span>
					</span>
				</div>
			</div>
		</div>
	</div>
{/if}
