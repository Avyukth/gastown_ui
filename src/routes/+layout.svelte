<script lang="ts">
	import '../app.css';
	import { SkipLink, Announcer, BottomNav, GlobalSearch } from '$lib/components';
	import { preloadRoute } from '$lib/preload';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// Badge counts (fetched from API)
	let unreadMail = $state(0);
	let escalationCount = $state(0);

	// Navigation items for bottom nav (reactive for badge updates)
	// Grouped: Core → Operations → Communication → Monitoring → System
	// Primary items shown in bottom nav: Dashboard, Work, Agents, Mail + More
	const navItems = $derived([
		// Core (primary visibility)
		{ id: 'dashboard', label: 'Dashboard', href: '/', icon: '🏠' },
		{ id: 'work', label: 'Work', href: '/work', icon: '🎯' },
		{ id: 'agents', label: 'Agents', href: '/agents', icon: '🤖' },
		{ id: 'mail', label: 'Mail', href: '/mail', icon: '📬', badge: unreadMail || undefined },
		// Core (in overflow)
		{ id: 'queue', label: 'Queue', href: '/queue', icon: '📋' },
		// Operations
		{ id: 'convoys', label: 'Convoys', href: '/convoys', icon: '🚛' },
		{ id: 'workflows', label: 'Workflows', href: '/workflows', icon: '⚗️' },
		{ id: 'rigs', label: 'Rigs', href: '/rigs', icon: '🏭' },
		// Communication
		{ id: 'escalations', label: 'Alerts', href: '/escalations', icon: '🚨', badge: escalationCount || undefined },
		// Monitoring
		{ id: 'health', label: 'Health', href: '/health', icon: '🩺' },
		{ id: 'activity', label: 'Activity', href: '/activity', icon: '📊' },
		{ id: 'watchdog', label: 'Watchdog', href: '/watchdog', icon: '🐺' },
		// System
		{ id: 'crew', label: 'Crew', href: '/crew', icon: '👷' },
		{ id: 'dogs', label: 'Dogs', href: '/dogs', icon: '🐕' },
		{ id: 'settings', label: 'Settings', href: '/settings', icon: '⚙️' },
		{ id: 'logs', label: 'Logs', href: '/logs', icon: '📜' }
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

	// Poll for badge counts
	onMount(() => {
		fetchBadgeCounts();
		const interval = setInterval(fetchBadgeCounts, 30000); // Poll every 30s
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Gas Town</title>
	<meta name="description" content="Gas Town - Multi-agent orchestration dashboard" />
</svelte:head>

<!-- Skip link for keyboard users -->
<SkipLink href="main-content" />

<!-- Screen reader announcements -->
<Announcer />

<!-- Global search (always rendered, handles its own visibility) -->
{#if !hideNav}
	<!-- Desktop: Fixed in top-right corner -->
	<div class="hidden md:block fixed top-4 right-4 z-40">
		<GlobalSearch />
	</div>

	<!-- Mobile: Floating action button above bottom nav -->
	<div class="md:hidden fixed bottom-24 right-4 z-40">
		<GlobalSearch class="rounded-full p-3 shadow-lg" />
	</div>
{/if}

<!-- Main content area -->
<div id="main-content" tabindex="-1" class="min-h-screen {hideNav ? '' : 'pb-20 md:pb-0'}">
	{@render children()}
</div>

<!-- Bottom navigation (mobile) with preload on hover -->
{#if !hideNav}
	<nav class="md:hidden">
		{#each navItems as item}
			<a
				href={item.href}
				class="sr-only"
				onmouseenter={() => handleNavHover(item.href)}
				onfocus={() => handleNavHover(item.href)}
			>
				{item.label}
			</a>
		{/each}
	</nav>
	<BottomNav items={navItems} {activeId} />
{/if}
