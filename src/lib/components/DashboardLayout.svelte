<script lang="ts">
	import { cn } from '$lib/utils';
	import GridPattern from './GridPattern.svelte';
	import StatusIndicator from './StatusIndicator.svelte';
	import PageHeader from './PageHeader.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		systemStatus?: 'running' | 'idle' | 'error' | 'warning';
		class?: string;
		/** Left column: Agents panel (desktop 3-column) */
		agents?: Snippet;
		/** Center column: Workflows + Queue (desktop 3-column) */
		workflows?: Snippet;
		queue?: Snippet;
		/** Right column: Stats + Actions (desktop 3-column) */
		stats?: Snippet;
		actions?: Snippet;
		/** Bottom: Full-width logs */
		logs?: Snippet;
		/** Legacy: Activity feed */
		activity?: Snippet;
		/** Default slot for custom content */
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		title = 'gastown_exp',
		systemStatus = 'running',
		class: className = '',
		agents,
		workflows,
		queue,
		stats,
		actions,
		logs,
		activity,
		children,
		footer
	}: Props = $props();

	// Determine if we have 3-column content
	const hasThreeColumnContent = $derived(
		!!(agents || workflows || queue || stats || actions)
	);
</script>

<div class={cn('relative min-h-screen bg-background', className)}>
	<!-- Grid pattern background -->
	<GridPattern variant="dots" opacity={0.15} />

	<!-- Main content wrapper -->
	<div class="relative z-10 flex flex-col min-h-screen">
		<!-- Header using PageHeader component -->
		<PageHeader
			title={title}
			showAccentBar={true}
			liveCount={{
				count: systemStatus === 'running' ? 1 : 0,
				label: systemStatus === 'running' ? 'connected' : systemStatus === 'error' ? 'disconnected' : systemStatus,
				status: systemStatus === 'running' ? 'success' : systemStatus === 'error' ? 'error' : 'warning'
			}}
		>
			{#snippet actions()}
				<!-- Connection status pill -->
				<div class="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full border border-border">
					<span
						class="w-2 h-2 rounded-full {systemStatus === 'running' ? 'bg-primary animate-pulse' : systemStatus === 'error' ? 'bg-destructive' : 'bg-warning'}"
						aria-hidden="true"
					></span>
					<span class="text-[10px] font-bold uppercase tracking-wider {systemStatus === 'running' ? 'text-primary' : systemStatus === 'error' ? 'text-destructive' : 'text-warning'}">
						{systemStatus === 'running' ? 'Connected' : systemStatus === 'error' ? 'Disconnected' : systemStatus}
					</span>
				</div>
			{/snippet}
		</PageHeader>

		<!-- Main content area -->
		<main class="flex-1 container py-6 space-y-6">
			<!-- Desktop 3-Column Layout (xl and above) -->
			{#if hasThreeColumnContent}
				<div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
					<!-- Left Column: Agents (4 cols on desktop) -->
					{#if agents}
						<section class="xl:col-span-4 space-y-4">
							<h2 class="text-lg font-semibold text-foreground">Agents</h2>
							<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
								{@render agents()}
							</div>
						</section>
					{/if}

					<!-- Center Column: Workflows + Queue (5 cols on desktop) -->
					{#if workflows || queue}
						<section class="xl:col-span-5 space-y-6">
							{#if workflows}
								<div class="space-y-4">
									<h2 class="text-lg font-semibold text-foreground">Workflows</h2>
									<div class="panel-glass divide-y divide-border overflow-hidden rounded-lg">
										{@render workflows()}
									</div>
								</div>
							{/if}

							{#if queue}
								<div class="space-y-4">
									<h2 class="text-lg font-semibold text-foreground">Queue</h2>
									<div class="panel-glass divide-y divide-border overflow-hidden rounded-lg">
										{@render queue()}
									</div>
								</div>
							{/if}
						</section>
					{/if}

					<!-- Right Column: Stats + Actions (3 cols on desktop) -->
					{#if stats || actions}
						<section class="xl:col-span-3 space-y-6">
							{#if stats}
								<div class="space-y-4">
									<h2 class="text-lg font-semibold text-foreground">System Stats</h2>
									<div class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-none xl:grid xl:grid-cols-1 xl:overflow-visible xl:snap-none xl:mx-0 xl:px-0">
										{@render stats()}
									</div>
								</div>
							{/if}

							{#if actions}
								<div class="space-y-4">
									<h2 class="text-lg font-semibold text-foreground">Quick Actions</h2>
									<div class="flex flex-col gap-2">
										{@render actions()}
									</div>
								</div>
							{/if}
						</section>
					{/if}
				</div>

				<!-- Bottom: Full-width Logs -->
				{#if logs}
					<section class="space-y-4">
						<h2 class="text-lg font-semibold text-foreground">Activity Logs</h2>
						<div class="panel-glass divide-y divide-border overflow-hidden rounded-lg max-h-80 overflow-y-auto">
							{@render logs()}
						</div>
					</section>
				{/if}
			{/if}

			<!-- Legacy: Activity feed (non-3-column mode) -->
			{#if activity && !hasThreeColumnContent}
				<section class="space-y-4">
					<h2 class="text-lg font-medium text-foreground">Recent Activity</h2>
					<div class="panel-glass divide-y divide-border overflow-hidden">
						{@render activity()}
					</div>
				</section>
			{/if}

			<!-- Default slot for custom content -->
			{#if children}
				{@render children()}
			{/if}
		</main>

		<!-- Footer slot -->
		{#if footer}
			<footer class="mt-auto border-t border-border px-4 py-3">
				<div class="container">
					{@render footer()}
				</div>
			</footer>
		{/if}
	</div>
</div>

<style>
	/* Hide scrollbar for horizontal stats scroll */
	.scrollbar-none {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-none::-webkit-scrollbar {
		display: none;
	}
</style>
