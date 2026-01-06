<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	/**
	 * PageHeader variant definitions
	 *
	 * Desktop-optimized page headers with breadcrumbs, titles,
	 * live counts, and action buttons.
	 */
	export const pageHeaderVariants = tv({
		slots: {
			container: [
				'sticky top-0 z-50',
				'panel-glass',
				'px-4 py-4',
				'relative'
			],
			inner: [
				'container',
				'flex items-center justify-between gap-4'
			],
			content: [
				'min-w-0 flex-1'
			],
			breadcrumb: [
				'flex items-center gap-1.5',
				'text-xs text-muted-foreground',
				'mb-1'
			],
			breadcrumbItem: [
				'hover:text-foreground transition-colors'
			],
			breadcrumbSeparator: [
				'text-muted-foreground/50'
			],
			title: [
				'text-2xl font-display font-semibold text-foreground',
				'truncate'
			],
			subtitle: [
				'text-sm text-muted-foreground',
				'flex items-center gap-2',
				'mt-0.5'
			],
			statusDot: [
				'w-2 h-2 rounded-full',
				'inline-block'
			],
			actions: [
				'flex items-center gap-2',
				'flex-shrink-0'
			],
			bottomBorder: [
				'absolute bottom-0 left-0 right-0 h-px',
				'bg-gradient-to-r from-transparent via-border to-transparent'
			]
		},
		variants: {
			sticky: {
				true: {
					container: 'sticky top-0'
				},
				false: {
					container: 'relative'
				}
			}
		},
		defaultVariants: {
			sticky: true
		}
	});

	export type PageHeaderVariants = VariantProps<typeof pageHeaderVariants>;

	/** Breadcrumb item definition */
	export interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	/** Live count with optional status */
	export interface LiveCount {
		count: number;
		label: string;
		status?: 'success' | 'warning' | 'error' | 'info' | 'muted';
	}

	export interface PageHeaderProps {
		/** Page title (24px font-display) */
		title: string;
		/** Breadcrumb trail items */
		breadcrumbs?: BreadcrumbItem[];
		/** Simple subtitle text */
		subtitle?: string;
		/** Live count with status dot */
		liveCount?: LiveCount;
		/** Multiple live counts */
		liveCounts?: LiveCount[];
		/** Whether header is sticky */
		sticky?: boolean;
		/** Additional container classes */
		class?: string;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import { buttonVariants } from './Button.svelte';
	import { ChevronRight } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props extends PageHeaderProps {
		/** Action buttons slot */
		actions?: Snippet;
	}

	let {
		title,
		breadcrumbs = [],
		subtitle,
		liveCount,
		liveCounts = [],
		sticky = true,
		class: className = '',
		actions
	}: Props = $props();

	// Combine single liveCount with liveCounts array
	const allCounts = $derived(
		liveCount ? [liveCount, ...liveCounts] : liveCounts
	);

	// Get styles
	const styles = $derived(pageHeaderVariants({ sticky }));

	// Status color mapping
	const statusColors: Record<string, string> = {
		success: 'bg-success',
		warning: 'bg-warning',
		error: 'bg-destructive',
		info: 'bg-info',
		muted: 'bg-muted-foreground'
	};
</script>

<!--
	Page Header Component

	Desktop-optimized header with breadcrumbs, titles, live counts, and actions.
	Features a subtle gradient bottom border.

	Example usage:
	```svelte
	<PageHeader
		title="Agents"
		breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Agents' }]}
		liveCount={{ count: 12, label: 'active', status: 'success' }}
	>
		{#snippet actions()}
			<Button variant="ghost">Settings</Button>
			<Button>Create Agent</Button>
		{/snippet}
	</PageHeader>
	```
-->

<header class={cn(styles.container(), className)}>
	<div class={styles.inner()}>
		<!-- Content: Breadcrumbs + Title + Subtitle -->
		<div class={styles.content()}>
			<!-- Breadcrumb Trail -->
			{#if breadcrumbs.length > 0}
				<nav class={styles.breadcrumb()} aria-label="Breadcrumb">
					{#each breadcrumbs as crumb, i}
						{#if i > 0}
							<ChevronRight class={cn(styles.breadcrumbSeparator(), 'w-3 h-3')} aria-hidden="true" />
						{/if}
						{#if crumb.href && i < breadcrumbs.length - 1}
							<a href={crumb.href} class={styles.breadcrumbItem()}>
								{crumb.label}
							</a>
						{:else}
							<span class={i === breadcrumbs.length - 1 ? 'text-foreground' : ''}>
								{crumb.label}
							</span>
						{/if}
					{/each}
				</nav>
			{/if}

			<!-- Title -->
			<h1 class={styles.title()}>
				{title}
			</h1>

			<!-- Subtitle / Live Counts -->
			{#if subtitle || allCounts.length > 0}
				<div class={styles.subtitle()}>
					{#if subtitle}
						<span>{subtitle}</span>
					{/if}
					{#each allCounts as count, i}
						{#if i > 0 || subtitle}
							<span class="text-muted-foreground/50">·</span>
						{/if}
						<span class="inline-flex items-center gap-1.5">
							{#if count.status}
								<span
									class={cn(styles.statusDot(), statusColors[count.status] ?? 'bg-muted-foreground')}
									aria-hidden="true"
								></span>
							{/if}
							<span class={count.status === 'success' ? 'text-success' : count.status === 'warning' ? 'text-warning' : count.status === 'error' ? 'text-destructive' : ''}>
								{count.count}
							</span>
							<span>{count.label}</span>
						</span>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Actions -->
		{#if actions}
			<div class={styles.actions()}>
				{@render actions()}
			</div>
		{/if}
	</div>

	<!-- Subtle Gradient Border -->
	<div class={styles.bottomBorder()} aria-hidden="true"></div>
</header>
