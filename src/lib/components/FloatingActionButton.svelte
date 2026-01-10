<script lang="ts">
	/**
	 * FloatingActionButton (FAB)
	 * Mobile-first action button - visible on mobile, hidden on desktop
	 * Positioned above bottom nav to avoid overlap
	 * 56x56px touch target (meets WCAG AA standards)
	 */
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		href?: string; // Navigation link
		onclick?: () => void; // Click handler
		icon?: Snippet; // Icon content (deprecated, use children instead)
		children?: Snippet; // Child content
		label?: string; // Aria label
		ariaLabel?: string; // Explicit aria-label
		disabled?: boolean;
		class?: string;
	}

	let {
		href,
		onclick,
		icon,
		children,
		label = 'Action',
		ariaLabel = label,
		disabled = false,
		class: className = ''
	}: Props = $props();

	// Use button or link based on href
	const element = $derived(href ? 'a' : 'button');
</script>

{#if element === 'a'}
	<a
		{href}
		class={cn(
			'fixed md:hidden bottom-24 right-4 z-30',
			'w-14 h-14 min-h-touch min-w-touch', // 56x56px touch target
			'rounded-full bg-primary text-primary-foreground',
			'flex items-center justify-center',
			'shadow-lg hover:shadow-xl active:shadow-md',
			'transition-all duration-300 ease-out',
			'hover:scale-110 active:scale-95',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
			disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
			className
		)}
		aria-label={ariaLabel}
		style="bottom: calc(80px + env(safe-area-inset-bottom))"
	>
		{#if children}
			<div class="flex items-center justify-center" aria-hidden="true">
				{@render children()}
			</div>
		{:else if icon}
			<div class="flex items-center justify-center" aria-hidden="true">
				{@render icon()}
			</div>
		{/if}
	</a>
{:else}
	<button
		type="button"
		{disabled}
		{onclick}
		class={cn(
			'fixed md:hidden bottom-24 right-4 z-30',
			'w-14 h-14 min-h-touch min-w-touch', // 56x56px touch target
			'rounded-full bg-primary text-primary-foreground',
			'flex items-center justify-center',
			'shadow-lg hover:shadow-xl active:shadow-md',
			'transition-all duration-300 ease-out',
			'hover:scale-110 active:scale-95',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
			disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
			className
		)}
		aria-label={ariaLabel}
		style="bottom: calc(80px + env(safe-area-inset-bottom))"
	>
		{#if children}
			<div class="flex items-center justify-center" aria-hidden="true">
				{@render children()}
			</div>
		{:else if icon}
			<div class="flex items-center justify-center" aria-hidden="true">
				{@render icon()}
			</div>
		{/if}
	</button>
{/if}


