<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import GridPattern from './GridPattern.svelte';
	import type { Snippet } from 'svelte';

	/**
	 * Priority badge variant definitions
	 */
	const priorityBadgeVariants = tv({
		base: 'inline-flex items-center justify-center px-1.5 py-0.5 text-2xs font-mono font-bold rounded',
		variants: {
			priority: {
				0: 'bg-destructive/20 text-destructive',
				1: 'bg-warning/20 text-warning',
				2: 'bg-info/20 text-info',
				3: 'bg-muted text-muted-foreground',
				4: 'bg-muted/50 text-muted-foreground/70'
			}
		},
		defaultVariants: {
			priority: 2
		}
	});

	interface QueueItem {
		id: string;
		title: string;
		priority: 0 | 1 | 2 | 3 | 4;
		assignee?: string;
		status?: string;
	}

	interface Props {
		title?: string;
		items?: QueueItem[];
		class?: string;
		actions?: Snippet;
		itemActions?: Snippet<[{ item: QueueItem; index: number }]>;
		footer?: Snippet;
	}

	let {
		title = 'Queue',
		items = [],
		class: className = '',
		actions,
		itemActions,
		footer
	}: Props = $props();

	// Priority labels
	const priorityLabels = ['P0', 'P1', 'P2', 'P3', 'P4'];
</script>

<div class={cn('relative min-h-screen bg-background', className)}>
	<!-- Grid pattern background -->
	<GridPattern variant="dots" opacity={0.1} />

	<!-- Main content wrapper -->
	<div class="relative z-10 flex flex-col min-h-screen">
		<!-- Header -->
		<header class="sticky top-0 z-50 panel-glass px-4 h-[72px] relative">
			<div class="container h-full flex items-center justify-between lg:pr-44">
				<div class="flex items-center gap-3">
					<div class="w-1.5 h-8 bg-primary rounded-sm shadow-glow shrink-0" aria-hidden="true"></div>
					<div>
						<h1 class="text-2xl font-display font-semibold text-foreground">{title}</h1>
						<p class="text-sm text-muted-foreground">{items.length} items in queue</p>
					</div>
				</div>
				{#if actions}
					<div class="flex items-center gap-2">
						{@render actions()}
					</div>
				{/if}
			</div>
			<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true"></div>
		</header>

		<!-- Queue list -->
		<main class="flex-1 container py-6">
			<div class="panel-glass overflow-hidden">
				{#if items.length > 0}
					<ul class="divide-y divide-border" role="list">
						{#each items as item, index}
							<li
								class="flex items-center gap-4 p-4 hover:bg-accent/5 transition-colors animate-blur-fade-up"
								style="animation-delay: {index * 50}ms"
							>
								<!-- Priority badge -->
								<span class={priorityBadgeVariants({ priority: item.priority })}>
									{priorityLabels[item.priority]}
								</span>

								<!-- Task content -->
								<div class="flex-1 min-w-0">
									<h3 class="font-medium text-foreground truncate">{item.title}</h3>
									{#if item.status}
										<p class="text-xs text-muted-foreground">{item.status}</p>
									{/if}
								</div>

								<!-- Assignee avatar -->
								{#if item.assignee}
									<div
										class="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-medium text-accent-foreground"
										title={item.assignee}
									>
										{item.assignee.slice(0, 2).toUpperCase()}
									</div>
								{/if}

								<!-- Actions slot -->
								{#if itemActions}
									<div class="flex-shrink-0">
										{@render itemActions({ item, index })}
									</div>
								{/if}
							</li>
						{/each}
					</ul>
				{:else}
					<div class="p-8 text-center text-muted-foreground">
						<p>Queue is empty</p>
					</div>
				{/if}
			</div>
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
