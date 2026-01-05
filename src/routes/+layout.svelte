<script lang="ts">
	import '../app.css';
	import { SkipLink, Announcer, BottomNav } from '$lib/components';
	import { preloadRoute } from '$lib/preload';
	import { page } from '$app/stores';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// Navigation items for bottom nav
	const navItems = [
		{ id: 'dashboard', label: 'Dashboard', href: '/', icon: '🏠' },
		{ id: 'agents', label: 'Agents', href: '/agents', icon: '🤖' },
		{ id: 'work', label: 'Work', href: '/work', icon: '🎯' },
		{ id: 'queue', label: 'Queue', href: '/queue', icon: '📋' },
		{ id: 'logs', label: 'Logs', href: '/logs', icon: '📜' }
	];

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
</script>

<svelte:head>
	<title>Gas Town</title>
	<meta name="description" content="Gas Town - Multi-agent orchestration dashboard" />
</svelte:head>

<!-- Skip link for keyboard users -->
<SkipLink href="main-content" />

<!-- Screen reader announcements -->
<Announcer />

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
