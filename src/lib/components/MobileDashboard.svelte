<script lang="ts">
	/**
	 * MobileDashboard Component
	 *
	 * Mobile-optimized dashboard with swipeable tab navigation.
	 * Shows Agents (default), Flows, Queue, and Logs tabs.
	 * Only visible on mobile viewports (md: breakpoint and below).
	 *
	 * @example
	 * <MobileDashboard>
	 *   {#snippet agents()}
	 *     <AgentsList />
	 *   {/snippet}
	 *   {#snippet flows()}
	 *     <FlowsList />
	 *   {/snippet}
	 * </MobileDashboard>
	 */
	import { cn } from '$lib/utils';
	import SwipeableTabs from './SwipeableTabs.svelte';
	import StatusIndicator from './StatusIndicator.svelte';
	import GridPattern from './GridPattern.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Dashboard title */
		title?: string;
		/** System status */
		systemStatus?: 'running' | 'idle' | 'error' | 'warning';
		/** Badge counts for tabs */
		agentsBadge?: number;
		flowsBadge?: number;
		queueBadge?: number;
		logsBadge?: number;
		/** Initial active tab */
		initialTab?: 'agents' | 'flows' | 'queue' | 'logs';
		/** Additional CSS classes */
		class?: string;
		/** Agents tab content */
		agents?: Snippet;
		/** Flows tab content */
		flows?: Snippet;
		/** Queue tab content */
		queue?: Snippet;
		/** Logs tab content */
		logs?: Snippet;
		/** Tab change callback */
		onTabChange?: (tabId: string) => void;
	}

	let {
		title = 'Gas Town',
		systemStatus = 'running',
		agentsBadge,
		flowsBadge,
		queueBadge,
		logsBadge,
		initialTab = 'agents',
		class: className,
		agents,
		flows,
		queue,
		logs,
		onTabChange
	}: Props = $props();

	// Tab definitions
	const tabs = $derived([
		{
			id: 'agents',
			label: 'Agents',
			icon: '🤖',
			badge: agentsBadge
		},
		{
			id: 'flows',
			label: 'Flows',
			icon: '⚗️',
			badge: flowsBadge
		},
		{
			id: 'queue',
			label: 'Queue',
			icon: '📋',
			badge: queueBadge
		},
		{
			id: 'logs',
			label: 'Logs',
			icon: '📜',
			badge: logsBadge
		}
	]);

	let activeTab = $state(initialTab);
</script>

<div class={cn('relative min-h-screen bg-background md:hidden', className)}>
	<!-- Grid pattern background -->
	<GridPattern variant="dots" opacity={0.15} />

	<!-- Main content wrapper -->
	<div class="relative z-10 flex flex-col min-h-screen pb-16">
		<!-- Header -->
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-3">
			<div class="flex items-center justify-between gap-4">
				<!-- Branding -->
				<div class="flex items-center gap-3">
					<h1 class="text-lg font-semibold text-foreground">{title}</h1>
				</div>

				<!-- System status -->
				<div class="flex items-center gap-2">
					<StatusIndicator status={systemStatus} size="md" />
					<span class="text-sm text-muted-foreground capitalize">{systemStatus}</span>
				</div>
			</div>
		</header>

		<!-- Swipeable tabs -->
		<SwipeableTabs
			{tabs}
			bind:activeTab
			{onTabChange}
			class="flex-1"
		>
			{#snippet content(tabId)}
				<div class="min-h-[calc(100vh-180px)] p-4">
					{#if tabId === 'agents' && agents}
						{@render agents()}
					{:else if tabId === 'flows' && flows}
						{@render flows()}
					{:else if tabId === 'queue' && queue}
						{@render queue()}
					{:else if tabId === 'logs' && logs}
						{@render logs()}
					{:else}
						<!-- Empty state -->
						<div class="flex flex-col items-center justify-center h-64 text-muted-foreground">
							<span class="text-4xl mb-2">
								{tabId === 'agents' ? '🤖' : tabId === 'flows' ? '⚗️' : tabId === 'queue' ? '📋' : '📜'}
							</span>
							<p class="text-sm">No content available</p>
						</div>
					{/if}
				</div>
			{/snippet}
		</SwipeableTabs>
	</div>
</div>
