<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';
	import type { Component } from 'svelte';

	/**
	 * EmptyState variant definitions
	 *
	 * Presets: no-data, no-results, error, offline, custom
	 * Sizes: sm, default, lg
	 */
	export const emptyStateVariants = tv({
		slots: {
			container: [
				'flex flex-col items-center justify-center',
				'text-center px-4'
			],
			iconWrapper: [
				'flex items-center justify-center',
				'rounded-full bg-muted/50',
				'mb-4'
			],
			icon: [
				'text-muted-foreground'
			],
			title: [
				'font-medium text-muted-foreground',
				'mb-1'
			],
			description: [
				'text-muted-foreground/80',
				'max-w-sm mx-auto',
				'mb-4'
			],
			actions: [
				'flex flex-col sm:flex-row items-center gap-2'
			]
		},
		variants: {
			size: {
				sm: {
					container: 'py-6 gap-2',
					iconWrapper: 'w-12 h-12',
					icon: 'w-5 h-5',
					title: 'text-sm',
					description: 'text-xs'
				},
				default: {
					container: 'py-8 gap-3',
					iconWrapper: 'w-16 h-16',
					icon: 'w-6 h-6',
					title: 'text-base',
					description: 'text-sm'
				},
				lg: {
					container: 'py-12 gap-4',
					iconWrapper: 'w-20 h-20',
					icon: 'w-8 h-8',
					title: 'text-lg',
					description: 'text-base'
				}
			},
			animated: {
				true: {
					iconWrapper: 'animate-pulse-status'
				},
				false: {}
			}
		},
		defaultVariants: {
			size: 'default',
			animated: true
		}
	});

	export type EmptyStateVariants = VariantProps<typeof emptyStateVariants>;

	// Preset configurations for common empty states
	export const emptyStatePresets = {
		'no-data': {
			title: 'No data yet',
			description: 'There\'s nothing here at the moment. Check back later or create something new.',
			iconName: 'Inbox' as const
		},
		'no-results': {
			title: 'No results found',
			description: 'We couldn\'t find anything matching your search. Try different keywords.',
			iconName: 'SearchX' as const
		},
		'error': {
			title: 'Something went wrong',
			description: 'We encountered an error loading this content. Please try again.',
			iconName: 'AlertCircle' as const
		},
		'offline': {
			title: 'You\'re offline',
			description: 'Please check your internet connection and try again.',
			iconName: 'WifiOff' as const
		}
	} as const;

	export type EmptyStatePreset = keyof typeof emptyStatePresets;

	export interface EmptyStateProps {
		/** Preset configuration (no-data, no-results, error, offline) */
		preset?: EmptyStatePreset;
		/** Custom title (overrides preset) */
		title?: string;
		/** Custom description (overrides preset) */
		description?: string;
		/** Custom icon component (overrides preset) */
		icon?: Component;
		/** Size variant */
		size?: EmptyStateVariants['size'];
		/** Enable subtle animation */
		animated?: boolean;
		/** Primary action button text */
		actionLabel?: string;
		/** Primary action callback */
		onaction?: () => void;
		/** Secondary action button text */
		secondaryLabel?: string;
		/** Secondary action callback */
		onsecondary?: () => void;
		/** Additional container classes */
		class?: string;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import { buttonVariants } from './Button.svelte';
	import {
		Inbox,
		SearchX,
		AlertCircle,
		WifiOff
	} from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props extends EmptyStateProps {
		children?: Snippet;
	}

	let {
		preset,
		title: customTitle,
		description: customDescription,
		icon: customIcon,
		size = 'default',
		animated = true,
		actionLabel,
		onaction,
		secondaryLabel,
		onsecondary,
		class: className = '',
		children
	}: Props = $props();

	// Get preset config if specified
	const presetConfig = $derived(preset ? emptyStatePresets[preset] : null);

	// Resolve final values (custom overrides preset)
	const finalTitle = $derived(customTitle ?? presetConfig?.title ?? 'Nothing here');
	const finalDescription = $derived(customDescription ?? presetConfig?.description);

	// Map preset icon names to components
	const iconMap = {
		Inbox,
		SearchX,
		AlertCircle,
		WifiOff
	} as const;

	// Resolve icon component
	const IconComponent = $derived(
		customIcon ?? (presetConfig?.iconName ? iconMap[presetConfig.iconName] : Inbox)
	);

	// Get styles
	const styles = $derived(emptyStateVariants({ size, animated }));
</script>

<!--
	Empty State Component

	A polished, animated empty state with preset configurations for common scenarios.
	Follows shadcn patterns with tailwind-variants.

	Example usage:
	```svelte
	<EmptyState
		preset="no-results"
		actionLabel="Clear filters"
		onaction={() => clearFilters()}
	/>

	<EmptyState
		title="No agents running"
		description="Start an agent to see it here"
		actionLabel="Create agent"
		onaction={() => createAgent()}
	/>
	```
-->

<div
	class={cn(styles.container(), className)}
	role="status"
	aria-live="polite"
>
	<!-- Animated Icon -->
	<div class={styles.iconWrapper()}>
		<IconComponent class={styles.icon()} aria-hidden="true" />
	</div>

	<!-- Title -->
	<h3 class={styles.title()}>
		{finalTitle}
	</h3>

	<!-- Description -->
	{#if finalDescription}
		<p class={styles.description()}>
			{finalDescription}
		</p>
	{/if}

	<!-- Custom content slot -->
	{#if children}
		<div class="mb-4">
			{@render children()}
		</div>
	{/if}

	<!-- Actions -->
	{#if actionLabel || secondaryLabel}
		<div class={styles.actions()}>
			{#if actionLabel}
				<button
					type="button"
					class={buttonVariants({ variant: 'default', size: size === 'sm' ? 'sm' : 'default' })}
					onclick={onaction}
				>
					{actionLabel}
				</button>
			{/if}
			{#if secondaryLabel}
				<button
					type="button"
					class={buttonVariants({ variant: 'ghost', size: size === 'sm' ? 'sm' : 'default' })}
					onclick={onsecondary}
				>
					{secondaryLabel}
				</button>
			{/if}
		</div>
	{/if}
</div>
