<script lang="ts">
	import '../app.css';
	import { SkipLink, Announcer, BottomNav, Sidebar, NavigationLoader } from '$lib/components';
	import { initializeKeyboardShortcuts, keyboardManager } from '$lib/utils/keyboard';
	import { preloadRoute } from '$lib/preload';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { swipe } from '$lib/actions/swipe';
	import { goto } from '$app/navigation';
	import {
		Home,
		Briefcase,
		Bot,
		Mail,
		ClipboardList,
		Truck,
		GitBranch,
		Server,
		Bell,
		HeartPulse,
		BarChart3,
		Eye,
		Users,
		Shield,
		Settings,
		ScrollText,
		Menu,
		X
	} from 'lucide-svelte';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// Sidebar collapse state (persisted via Sidebar component)
	let sidebarCollapsed = $state(false);
	
	// Mobile drawer state (not persisted - resets on navigation)
	let mobileDrawerOpen = $state(false);

	// Badge counts (fetched from API)
	let unreadMail = $state(0);
	let escalationCount = $state(0);

	// Accessibility: Route change announcement
	let routeAnnouncement = $state('');
	let mainContentRef = $state<HTMLElement | null>(null);

	// Navigation items for bottom nav (reactive for badge updates)
	// Grouped: Core → Operations → Communication → Monitoring → System
	// Primary items shown in bottom nav: Dashboard, Work, Agents, Mail + More
	const navItems = $derived([
		// Core (primary visibility)
		{ id: 'dashboard', label: 'Dashboard', href: '/', icon: Home },
		{ id: 'work', label: 'Work', href: '/work', icon: Briefcase },
		{ id: 'agents', label: 'Agents', href: '/agents', icon: Bot },
		{ id: 'mail', label: 'Mail', href: '/mail', icon: Mail, badge: unreadMail || undefined },
		// Core (in overflow)
		{ id: 'queue', label: 'Queue', href: '/queue', icon: ClipboardList },
		// Operations
		{ id: 'convoys', label: 'Convoys', href: '/convoys', icon: Truck },
		{ id: 'workflows', label: 'Workflows', href: '/workflows', icon: GitBranch },
		{ id: 'rigs', label: 'Rigs', href: '/rigs', icon: Server },
		// Communication
		{ id: 'escalations', label: 'Escalations', href: '/escalations', icon: Bell, badge: escalationCount || undefined },
		// Monitoring
		{ id: 'health', label: 'Health', href: '/health', icon: HeartPulse },
		{ id: 'activity', label: 'Activity', href: '/activity', icon: BarChart3 },
		{ id: 'watchdog', label: 'Watchdog', href: '/watchdog', icon: Eye },
		// System
		{ id: 'crew', label: 'Crew', href: '/crew', icon: Users },
		{ id: 'dogs', label: 'Dogs', href: '/dogs', icon: Shield },
		{ id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
		{ id: 'logs', label: 'Logs', href: '/logs', icon: ScrollText }
	]);

	// Determine active nav item from current route
	const activeId = $derived.by(() => {
		const path = $page.url.pathname;
		if (path === '/') return 'dashboard';
		const segment = path.split('/')[1];
		return segment || 'dashboard';
	});

	// Hide nav on certain routes (login, etc.)
	const hideNav = $derived($page.url.pathname === '/login');

	// Preload routes on hover for instant navigation
	function handleNavHover(href: string) {
		preloadRoute(href);
	}

	// Fetch badge counts from status API
	async function fetchBadgeCounts() {
		try {
			const res = await fetch('/api/gastown/status');
			if (!res.ok) return;
			const status = await res.json();

			// Overseer unread mail
			unreadMail = status.overseer?.unread_mail ?? 0;

			// Sum agent unread mail as well
			const agentMail = status.agents?.reduce((sum: number, a: { unread_mail?: number }) => sum + (a.unread_mail ?? 0), 0) ?? 0;
			const rigAgentMail = status.rigs?.reduce((sum: number, r: { agents?: Array<{ unread_mail?: number }> }) =>
				sum + (r.agents?.reduce((s: number, a) => s + (a.unread_mail ?? 0), 0) ?? 0), 0) ?? 0;
			unreadMail += agentMail + rigAgentMail;

			// Escalation count (placeholder - will be implemented when escalations API is ready)
			escalationCount = status.escalation_count ?? 0;
		} catch (e) {
			console.error('Failed to fetch badge counts:', e);
		}
	}

	// Apply theme on mount (persistence)
	function applyStoredTheme() {
		const stored = localStorage.getItem('gastown-theme') as 'light' | 'dark' | 'system' | null;
		const theme = stored ?? 'system';
		
		let effectiveTheme: 'light' | 'dark';
		if (theme === 'system') {
			effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		} else {
			effectiveTheme = theme;
		}
		
		const root = document.documentElement;
		root.classList.remove('light', 'dark');
		root.classList.add(effectiveTheme);
	}

	// Poll for badge counts and apply theme
	onMount(() => {
		// Apply stored theme immediately
		applyStoredTheme();
		
		// Listen for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleThemeChange = () => {
			const stored = localStorage.getItem('gastown-theme');
			if (stored === 'system') {
				applyStoredTheme();
			}
		};
		mediaQuery.addEventListener('change', handleThemeChange);
		
		// Initialize keyboard shortcuts
		const manager = initializeKeyboardShortcuts();
		if (manager) {
			// Navigation shortcuts
			manager.register('goto-inbox', {
				keys: ['cmd', 'j'],
				description: 'Go to Mail',
				action: () => goto('/mail'),
				category: 'navigation'
			});
			
			manager.register('goto-work', {
				keys: ['cmd', 'l'],
				description: 'Go to Work',
				action: () => goto('/work'),
				category: 'navigation'
			});
			
			// Action shortcuts (global)
			manager.register('toggle-search', {
				keys: ['cmd', 'k'],
				description: 'Toggle Search',
				action: () => {
					// Dispatch event to GlobalSearch component
					window.dispatchEvent(new CustomEvent('open-search'));
				},
				category: 'action'
			});
		}
		
		fetchBadgeCounts();
		const interval = setInterval(fetchBadgeCounts, 30000); // Poll every 30s
		
		return () => {
			clearInterval(interval);
			mediaQuery.removeEventListener('change', handleThemeChange);
		};
	});

	// Focus management and route announcements on navigation
	afterNavigate(({ to, from }) => {
		// Close mobile drawer on navigation
		mobileDrawerOpen = false;
		
		// Get page title from nav items or path
		const path = to?.url?.pathname || '/';
		const navItem = navItems.find((item) => item.href === path);
		const pageTitle = navItem?.label || getPageTitleFromPath(path);

		// Announce the page change for screen readers
		routeAnnouncement = `Navigated to ${pageTitle}`;

		// Focus the main content area for keyboard users
		// Use requestAnimationFrame to ensure DOM is updated
		requestAnimationFrame(() => {
			mainContentRef?.focus();
		});
	});

	// Get page title from path for pages not in nav
	function getPageTitleFromPath(path: string): string {
		const segment = path.split('/')[1] || 'Dashboard';
		return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
	}

	// Handle swipe-right to go back
	function handleSwipeRight() {
		history.back();
	}

	// Handle keyboard events for mobile drawer (Escape to close)
	function handleKeydown(event: KeyboardEvent) {
		// Close drawer on Escape key
		if (event.key === 'Escape' && mobileDrawerOpen) {
			mobileDrawerOpen = false;
			event.preventDefault();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Gas Town</title>
	<meta name="description" content="Gas Town - Multi-agent orchestration dashboard" />
</svelte:head>

<!-- Navigation loading indicator -->
<NavigationLoader />

<!-- Skip link for keyboard users -->
<SkipLink href="main-content" />

<!-- Screen reader announcements for route changes -->
<Announcer message={routeAnnouncement} clearAfter={3000} />

<!-- Layout wrapper with responsive sidebar/bottom nav -->
{#if !hideNav}
	<!-- Desktop layout with sidebar (hidden on mobile) -->
	<div class="hidden lg:flex h-dvh overflow-hidden">
		<!-- Sidebar navigation -->
		<Sidebar
			items={navItems}
			{activeId}
			bind:collapsed={sidebarCollapsed}
		/>

		<!-- Main content area -->
		<div class="flex-1 flex flex-col h-full overflow-y-auto">
			<!-- Global search in header for desktop -->
			<div class="fixed top-4 right-4 z-40">
				{#await import('$lib/components/GlobalSearch.svelte') then m}
					<m.default />
				{:catch}
					<button class="w-10 h-10 rounded-lg bg-card border border-border" aria-label="Loading search"></button>
				{/await}
			</div>

			<main
				bind:this={mainContentRef}
				id="main-content"
				tabindex="-1"
				class="flex-1 min-w-0 overflow-x-hidden outline-none"
			>
				{@render children()}
			</main>
		</div>
	</div>

	<!-- Mobile/Tablet layout with bottom nav (hidden on desktop) -->
	<div class="lg:hidden flex flex-col min-h-screen">
		<!-- Mobile header with menu button and search -->
		<div class="sticky top-0 z-30 flex items-center gap-2 px-4 py-3 bg-card/80 backdrop-blur-xl border-b border-border md:hidden">
			<button
				onclick={() => mobileDrawerOpen = !mobileDrawerOpen}
				class="p-2 -ml-2 text-foreground hover:bg-muted/50 rounded-lg transition-colors"
				aria-label={mobileDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
				aria-expanded={mobileDrawerOpen}
			>
				{#if mobileDrawerOpen}
					<X size={24} />
				{:else}
					<Menu size={24} />
				{/if}
			</button>
			<span class="text-sm font-semibold text-foreground">Navigation</span>
			<div class="ml-auto">
				{#await import('$lib/components/GlobalSearch.svelte') then m}
					<m.default class="rounded-lg" />
				{:catch}
					<button class="w-10 h-10 rounded-lg bg-card border border-border" aria-label="Loading search"></button>
				{/await}
			</div>
		</div>

		<!-- Mobile drawer backdrop -->
		{#if mobileDrawerOpen}
			<div
				class="fixed inset-0 z-20 bg-black/40 md:hidden transition-opacity duration-300"
				onclick={() => mobileDrawerOpen = false}
				aria-hidden="true"
				role="presentation"
			></div>
		{/if}

		<!-- Mobile sidebar drawer -->
		<div
			class="fixed inset-y-0 left-0 z-20 w-64 md:hidden transition-transform duration-300 ease-out transform"
			style:transform={mobileDrawerOpen ? 'translateX(0)' : 'translateX(-100%)'}
			aria-label="Main navigation"
			role="dialog"
			aria-modal={mobileDrawerOpen}
			tabindex="-1"
			inert={!mobileDrawerOpen}
		>
			<Sidebar
				items={navItems}
				{activeId}
				class="h-dvh"
			/>
		</div>

		<!-- Main content area with page transitions -->
		<div
			bind:this={mainContentRef}
			id="main-content"
			tabindex="-1"
			class="flex-1 min-h-screen min-w-0 overflow-x-hidden pb-20 outline-none"
			use:swipe={{
				onswiperight: handleSwipeRight,
				minDistance: 40
			}}
		>
			<div class="animate-fade-in">
				{@render children()}
			</div>
		</div>

		<!-- Bottom navigation with preload on hover -->
		<nav class="sr-only">
			{#each navItems as item}
				<a
					href={item.href}
					onmouseenter={() => handleNavHover(item.href)}
					onfocus={() => handleNavHover(item.href)}
				>
					{item.label}
				</a>
			{/each}
		</nav>
		<BottomNav items={navItems} {activeId} />
		
		<!-- Keyboard shortcuts help dialog (lazy loaded) -->
		{#await import('$lib/components/KeyboardHelpDialog.svelte') then m}
			<m.default />
		{/await}
		</div>
{:else}
	<!-- Login page - no navigation -->
	<div
		bind:this={mainContentRef}
		id="main-content"
		tabindex="-1"
		class="min-h-screen min-w-0 overflow-x-hidden outline-none"
	>
		{@render children()}
	</div>
{/if}
