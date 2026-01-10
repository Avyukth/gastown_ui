<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import GridPattern from './GridPattern.svelte';
	import PageHeader from './PageHeader.svelte';
	import type { Snippet } from 'svelte';

	/**
	 * Filter button variant definitions
	 */
	const filterButtonVariants = tv({
		base: 'px-3 py-1.5 text-xs font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		variants: {
			active: {
				true: 'bg-accent text-accent-foreground',
				false: 'bg-muted/50 text-muted-foreground hover:bg-muted'
			},
			level: {
				INF: 'data-[active=true]:bg-info/20 data-[active=true]:text-info',
				WRN: 'data-[active=true]:bg-warning/20 data-[active=true]:text-warning',
				ERR: 'data-[active=true]:bg-destructive/20 data-[active=true]:text-destructive',
				DBG: 'data-[active=true]:bg-muted data-[active=true]:text-muted-foreground'
			}
		},
		defaultVariants: {
			active: false
		}
	});

	interface Props {
		title?: string;
		sources?: string[];
		selectedLevels?: ('INF' | 'WRN' | 'ERR' | 'DBG')[];
		selectedSource?: string;
		searchQuery?: string;
		autoScroll?: boolean;
		class?: string;
		headerActions?: Snippet;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		title = 'Logs',
		sources = [],
		selectedLevels = ['INF', 'WRN', 'ERR', 'DBG'],
		selectedSource = '',
		searchQuery = '',
		autoScroll = true,
		class: className = '',
		headerActions,
		children,
		footer
	}: Props = $props();

	const levels: ('INF' | 'WRN' | 'ERR' | 'DBG')[] = ['INF', 'WRN', 'ERR', 'DBG'];
</script>

<div class={cn('relative min-h-screen bg-background', className)}>
	<!-- Grid pattern background -->
	<GridPattern variant="lines" opacity={0.08} />

	<!-- Main content wrapper -->
	<div class="relative z-10 flex flex-col min-h-screen">
		<!-- Header using PageHeader component -->
		<PageHeader {title} showAccentBar={true}>
			{#snippet actions()}
				{#if headerActions}
					{@render headerActions()}
				{/if}
			{/snippet}
		</PageHeader>

		<!-- Filter bar (composition pattern - separate from header) -->
		<div class="sticky top-[72px] z-40 panel-glass border-b border-border px-4 py-3">
			<div class="container flex flex-wrap items-center gap-4">
				<!-- Level filters -->
				<div class="flex items-center gap-2">
					<span class="text-xs text-muted-foreground">Level:</span>
					<div class="flex gap-1">
						{#each levels as level}
							<button
								class={filterButtonVariants({
									active: selectedLevels.includes(level),
									level
								})}
								data-active={selectedLevels.includes(level)}
							>
								{level}
							</button>
						{/each}
					</div>
				</div>

				<!-- Source filter -->
				{#if sources.length > 0}
					<div class="flex items-center gap-2">
						<span class="text-xs text-muted-foreground">Source:</span>
						<select
							class="px-2 py-1 text-xs bg-muted border border-border rounded text-foreground"
							bind:value={selectedSource}
						>
							<option value="">All sources</option>
							{#each sources as source}
								<option value={source}>{source}</option>
							{/each}
						</select>
					</div>
				{/if}

				<!-- Search -->
				<div class="flex-1 min-w-[200px]">
					<input
						type="search"
						placeholder="Search logs..."
						class="w-full px-3 py-1.5 text-sm bg-muted border border-border rounded text-foreground placeholder:text-muted-foreground"
						bind:value={searchQuery}
					/>
				</div>

				<!-- Auto-scroll toggle -->
				<label class="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
					<input
						type="checkbox"
						class="rounded border-border"
						bind:checked={autoScroll}
					/>
					Auto-scroll
				</label>
			</div>
		</div>

		<!-- Log entries -->
		<main class="flex-1 container py-4">
			<div class="panel-glass overflow-hidden h-[calc(100dvh-16rem)]">
				<div class="h-full overflow-y-auto" class:scroll-smooth={autoScroll}>
					{#if children}
						{@render children()}
					{:else}
						<div class="p-8 text-center text-muted-foreground">
							<p>No log entries</p>
						</div>
					{/if}
				</div>
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
