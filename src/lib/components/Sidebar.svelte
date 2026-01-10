<script lang="ts">
	/**
	 * Sidebar Component - Desktop Navigation
	 *
	 * Design tokens used:
	 * - Animation: ease-out-expo for collapse, 200ms transitions
	 * - Typography: label-xs (10px) for group headers
	 * - Shadows: subtle left glow for active state
	 */
	import { tv } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	import { Fuel } from 'lucide-svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	/**
	 * Navigation item styling variants
	 * - Active: 3px right border accent + subtle left glow
	 * - Hover: 200ms ease-out transition
	 */
	const navItemVariants = tv({
		base: [
			'relative flex items-center gap-3 px-3 py-2.5 rounded-lg',
			'transition-all duration-200 ease-out',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
		],
		variants: {
			active: {
				true: [
					'bg-primary/10 text-primary',
					'border-r-[3px] border-primary',
					'shadow-[inset_4px_0_8px_-4px_hsl(var(--primary)/0.3)]'
				],
				false: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
			},
			collapsed: {
				true: 'justify-center px-2',
				false: ''
			}
		},
		defaultVariants: {
			active: false,
			collapsed: false
		}
	});

	/**
	 * Group header styling
	 * - 10px font, 0.1em letter-spacing, 60% opacity
	 */
	const groupHeaderVariants = tv({
		base: [
			'text-[10px] font-semibold uppercase tracking-[0.1em]',
			'text-muted-foreground/60 mb-2 px-3',
			'transition-opacity duration-200'
		],
		variants: {
			collapsed: {
				true: 'opacity-0 sr-only',
				false: 'opacity-100'
			}
		}
	});

	// Tooltip state for collapsed sidebar
	let tooltipVisible = $state(false);
	let tooltipText = $state('');
	let tooltipPosition = $state({ x: 0, y: 0 });
	let tooltipTimeout: ReturnType<typeof setTimeout> | null = null;

	function showTooltip(event: MouseEvent, label: string) {
		if (!collapsed) return;

		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();

		tooltipText = label;
		tooltipPosition = {
			x: rect.right + 8,
			y: rect.top + rect.height / 2
		};

		// Delay showing tooltip slightly
		tooltipTimeout = setTimeout(() => {
			tooltipVisible = true;
		}, 150);
	}

	function hideTooltip() {
		if (tooltipTimeout) {
			clearTimeout(tooltipTimeout);
			tooltipTimeout = null;
		}
		tooltipVisible = false;
	}

	interface NavItem {
		id: string;
		label: string;
		href?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon?: any;
		badge?: number | string;
	}

	interface NavGroup {
		id: string;
		label: string;
		items: NavItem[];
	}

	interface Props {
		items?: NavItem[];
		activeId?: string;
		collapsed?: boolean;
		onCollapseChange?: (collapsed: boolean) => void;
		class?: string;
	}

	let {
		items = [],
		activeId = '',
		collapsed = $bindable(false),
		onCollapseChange,
		class: className = ''
	}: Props = $props();

	// Group items by category
	const navGroups = $derived.by((): NavGroup[] => {
		const mainIds = ['dashboard', 'work', 'agents', 'mail'];
		const operationsIds = ['queue', 'convoys', 'workflows'];
		const systemIds = ['rigs', 'health', 'activity', 'watchdog', 'crew', 'dogs', 'settings', 'logs', 'escalations'];

		const mainItems = items.filter(item => mainIds.includes(item.id));
		const operationsItems = items.filter(item => operationsIds.includes(item.id));
		const systemItems = items.filter(item => systemIds.includes(item.id));

		return [
			{ id: 'main', label: 'Main', items: mainItems },
			{ id: 'operations', label: 'Operations', items: operationsItems },
			{ id: 'system', label: 'System', items: systemItems }
		].filter(group => group.items.length > 0);
	});

	// Keyboard navigation
	let navRef = $state<HTMLElement | null>(null);
	let focusedIndex = $state(-1);

	// Scroll fade indicators state
	let showTopFade = $state(false);
	let showBottomFade = $state(false);

	function updateScrollState() {
		if (!navRef) return;

		const { scrollTop, scrollHeight, clientHeight } = navRef;
		const hasOverflow = scrollHeight > clientHeight;

		showTopFade = hasOverflow && scrollTop > 8;
		showBottomFade = hasOverflow && scrollTop < scrollHeight - clientHeight - 8;
	}

	// Recalculate when navRef is set, on resize, or when collapsed state changes
	$effect(() => {
		if (navRef) {
			// Initial calculation
			updateScrollState();

			// Watch for resize
			const resizeObserver = new ResizeObserver(updateScrollState);
			resizeObserver.observe(navRef);

			return () => resizeObserver.disconnect();
		}
	});

	// Recalculate when collapsed changes (waits for 300ms CSS transition)
	$effect(() => {
		if (collapsed !== undefined) {
			const timeout = setTimeout(updateScrollState, 350);
			return () => clearTimeout(timeout);
		}
	});

	// Flatten items for keyboard navigation
	const flatItems = $derived(navGroups.flatMap(group => group.items));

	function handleKeyDown(event: KeyboardEvent) {
		const { key } = event;

		if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(key)) {
			return;
		}

		event.preventDefault();

		if (key === 'ArrowDown') {
			focusedIndex = Math.min(focusedIndex + 1, flatItems.length - 1);
		} else if (key === 'ArrowUp') {
			focusedIndex = Math.max(focusedIndex - 1, 0);
		} else if (key === 'Home') {
			focusedIndex = 0;
		} else if (key === 'End') {
			focusedIndex = flatItems.length - 1;
		} else if ((key === 'Enter' || key === ' ') && focusedIndex >= 0) {
			const item = flatItems[focusedIndex];
			if (item?.href) {
				// Navigate programmatically
				window.location.href = item.href;
			}
		}

		// Focus the item
		if (focusedIndex >= 0 && navRef) {
			const links = navRef.querySelectorAll<HTMLAnchorElement>('[data-nav-item]');
			links[focusedIndex]?.focus();
		}
	}

	function toggleCollapse() {
		collapsed = !collapsed;
		onCollapseChange?.(collapsed);
	}

	// Load collapse state from localStorage
	onMount(() => {
		try {
			const stored = localStorage.getItem('sidebar-collapsed');
			if (stored !== null) {
				collapsed = stored === 'true';
			}
		} catch {
			// Ignore storage errors (e.g., private browsing)
		}
	});

	// Persist collapse state
	$effect(() => {
		try {
			localStorage.setItem('sidebar-collapsed', String(collapsed));
		} catch {
			// Ignore storage errors (e.g., private browsing)
		}
	});
</script>

<aside
	class={cn(
		'flex flex-col h-full bg-card/80 backdrop-blur-xl border-r border-border transition-all duration-300 ease-out',
		collapsed ? 'w-16' : 'w-64',
		className
	)}
	aria-label="Main navigation"
>
	<!-- Logo / Header -->
	<div class="flex items-center h-[72px] px-4 border-b border-border shrink-0">
		{#if collapsed}
			<Fuel class="w-6 h-6 text-foreground" strokeWidth={2} aria-hidden="true" />
		{:else}
			<div class="flex items-center gap-2">
				<Fuel class="w-6 h-6 text-foreground" strokeWidth={2} aria-hidden="true" />
				<span class="font-display font-semibold text-lg">Gas Town</span>
			</div>
		{/if}
	</div>

	<!-- Navigation with scroll fade indicators -->
	<div class="relative flex-1 overflow-hidden">
		<!-- Top fade gradient -->
		<div
			class="pointer-events-none absolute top-0 left-0 right-0 h-6 z-10
				   bg-gradient-to-b from-card to-transparent
				   transition-opacity duration-200"
			class:opacity-0={!showTopFade}
			aria-hidden="true"
		></div>

		<nav
			bind:this={navRef}
			onscroll={updateScrollState}
			class="h-full overflow-y-auto py-4 px-2"
			aria-label="Sidebar navigation"
			onkeydown={handleKeyDown}
		>
		{#each navGroups as group, groupIndex}
			<!-- Section divider with 24px vertical margins (except first group) -->
			{#if groupIndex > 0}
				<div class="my-6 mx-3 h-px bg-border/50" aria-hidden="true"></div>
			{/if}
			<div
				class="mb-4"
				role="group"
				aria-labelledby={`nav-group-${group.id}`}
			>
				<h2
					id={`nav-group-${group.id}`}
					class={groupHeaderVariants({ collapsed })}
				>
					{group.label}
				</h2>
				<ul role="list" class="space-y-1">
					{#each group.items as item, itemIndex}
						{@const globalIndex = navGroups.slice(0, groupIndex).reduce((acc, g) => acc + g.items.length, 0) + itemIndex}
						{@const isActive = item.id === activeId}
						<li>
							<a
								href={item.href ?? '#'}
								class={cn(navItemVariants({ active: isActive, collapsed }))}
								aria-current={isActive ? 'page' : undefined}
								data-nav-item
								tabindex={focusedIndex === globalIndex ? 0 : -1}
								onfocus={() => focusedIndex = globalIndex}
								onmouseenter={(e) => showTooltip(e, item.label)}
								onmouseleave={hideTooltip}
							>
								<span class="relative shrink-0">
									{#if item.icon}
										<span class="w-6 h-6 flex items-center justify-center" aria-hidden="true">
											<item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
										</span>
									{:else}
										<span class="w-6 h-6 rounded-full bg-current opacity-20" aria-hidden="true"></span>
									{/if}
									{#if item.badge}
										<span
											class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-destructive rounded-full flex items-center justify-center"
											aria-label="{item.badge} notifications"
										>
											{typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
										</span>
									{/if}
								</span>
								{#if !collapsed}
									<span class="text-sm font-medium truncate">{item.label}</span>
								{:else}
									<span class="sr-only">{item.label}</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
		</nav>

		<!-- Bottom fade gradient -->
		<div
			class="pointer-events-none absolute bottom-0 left-0 right-0 h-6 z-10
				   bg-gradient-to-t from-card to-transparent
				   transition-opacity duration-200"
			class:opacity-0={!showBottomFade}
			aria-hidden="true"
		></div>
	</div>

	<!-- Footer: Theme toggle and Collapse button -->
	<div class="shrink-0 border-t border-border p-2 pb-safe space-y-1">
		<!-- Theme toggle -->
		<ThemeToggle {collapsed} class="w-full" />

		<!-- Collapse toggle -->
		<button
			onclick={toggleCollapse}
			class={cn(
				'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
				'text-muted-foreground hover:text-foreground hover:bg-muted/50',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				collapsed && 'justify-center px-2'
			)}
			aria-expanded={!collapsed}
			aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		>
			<span class="w-5 h-5 flex items-center justify-center" aria-hidden="true">
				{#if collapsed}
					<!-- Expand icon: arrow pointing right into panel -->
					<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M16.5 3C16.7761 3 17 3.22386 17 3.5V16.5C17 16.7761 16.7761 17 16.5 17C16.2239 17 16 16.7761 16 16.5V3.5C16 3.22386 16.2239 3 16.5 3ZM8.12793 5.16504C8.28958 4.98547 8.5524 4.95058 8.75293 5.06836L8.83496 5.12793L13.835 9.62793C13.9403 9.72275 14 9.85828 14 10C14 10.1063 13.9667 10.2093 13.9053 10.2939L13.835 10.3721L8.83496 14.8721C8.62972 15.0568 8.31267 15.0402 8.12793 14.835C7.94322 14.6297 7.95984 14.3127 8.16504 14.1279L12.1963 10.5H3.5C3.22386 10.5 3 10.2761 3 10C3 9.72386 3.22386 9.5 3.5 9.5H12.1963L8.16504 5.87207L8.09766 5.79688C7.95931 5.60979 7.96622 5.34471 8.12793 5.16504Z"/>
					</svg>
				{:else}
					<!-- Collapse icon: sidebar panel -->
					<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M16.5 4C17.3284 4 18 4.67157 18 5.5V14.5C18 15.3284 17.3284 16 16.5 16H3.5C2.67157 16 2 15.3284 2 14.5V5.5C2 4.67157 2.67157 4 3.5 4H16.5ZM7 15H16.5C16.7761 15 17 14.7761 17 14.5V5.5C17 5.22386 16.7761 5 16.5 5H7V15ZM3.5 5C3.22386 5 3 5.22386 3 5.5V14.5C3 14.7761 3.22386 15 3.5 15H6V5H3.5Z"/>
					</svg>
				{/if}
			</span>
			{#if !collapsed}
				<span class="text-sm font-medium">Collapse</span>
			{/if}
		</button>
	</div>
</aside>

<!-- Custom tooltip for collapsed state (visual-only, sr-only text provides accessible name) -->
{#if tooltipVisible && collapsed}
	<div
		class="fixed z-50 px-2.5 py-1.5 text-sm font-medium text-popover-foreground bg-popover border border-border rounded-md shadow-lg pointer-events-none animate-fade-in"
		style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px; transform: translateY(-50%);"
		role="tooltip"
		aria-hidden="true"
	>
		{tooltipText}
		<!-- Arrow pointing left -->
		<div
			class="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-8 border-transparent border-r-popover"
		></div>
	</div>
{/if}
