<script lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	/**
	 * Button variant definitions using tailwind-variants
	 * Supports: Primary, Secondary, Danger, Ghost variants
	 * Features: Icon support, full width, loading states, sizes
	 */
	const buttonVariants = tv({
		base: [
			'inline-flex items-center justify-center gap-2',
			'font-medium text-sm',
			'rounded-lg border',
			'transition-colors duration-150',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			'disabled:pointer-events-none disabled:opacity-50',
			'touch-target-interactive'
		],
		variants: {
			variant: {
				primary: [
					'bg-primary text-primary-foreground border-primary',
					'hover:bg-primary/90',
					'active:bg-primary/80'
				],
				secondary: [
					'bg-secondary text-secondary-foreground border-secondary',
					'hover:bg-secondary/80',
					'active:bg-secondary/70'
				],
				danger: [
					'bg-destructive text-destructive-foreground border-destructive',
					'hover:bg-destructive/90',
					'active:bg-destructive/80'
				],
				ghost: [
					'bg-transparent text-foreground border-transparent',
					'hover:bg-muted',
					'active:bg-muted/80'
				]
			},
			size: {
				sm: 'h-9 px-3 text-xs',
				md: 'h-10 px-4 text-sm',
				lg: 'h-12 px-6 text-base'
			},
			fullWidth: {
				true: 'w-full',
				false: ''
			},
			iconOnly: {
				true: 'aspect-square p-0',
				false: ''
			}
		},
		compoundVariants: [
			// Icon-only sizing adjustments
			{ iconOnly: true, size: 'sm', class: 'h-9 w-9' },
			{ iconOnly: true, size: 'md', class: 'h-10 w-10' },
			{ iconOnly: true, size: 'lg', class: 'h-12 w-12' }
		],
		defaultVariants: {
			variant: 'primary',
			size: 'md',
			fullWidth: false,
			iconOnly: false
		}
	});

	type ButtonVariants = VariantProps<typeof buttonVariants>;

	interface Props extends HTMLButtonAttributes {
		variant?: ButtonVariants['variant'];
		size?: ButtonVariants['size'];
		fullWidth?: boolean;
		iconOnly?: boolean;
		loading?: boolean;
		class?: string;
		children?: Snippet;
		iconLeft?: Snippet;
		iconRight?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		fullWidth = false,
		iconOnly = false,
		loading = false,
		disabled = false,
		type = 'button',
		class: className = '',
		children,
		iconLeft,
		iconRight,
		...restProps
	}: Props = $props();

	// Combine disabled and loading states
	const isDisabled = $derived(disabled || loading);

	// Accessible loading label
	const ariaLabel = $derived(
		loading ? 'Loading...' : restProps['aria-label']
	);
</script>

<button
	type={type}
	class={cn(buttonVariants({ variant, size, fullWidth, iconOnly }), className)}
	disabled={isDisabled}
	aria-disabled={isDisabled}
	aria-label={ariaLabel}
	aria-busy={loading}
	{...restProps}
>
	{#if loading}
		<svg
			class="h-4 w-4 animate-spin"
			fill="none"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<circle
				class="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				stroke-width="4"
			/>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	{:else if iconLeft}
		<span class="flex-shrink-0" aria-hidden="true">
			{@render iconLeft()}
		</span>
	{/if}

	{#if children && !iconOnly}
		<span class={loading ? 'opacity-0' : ''}>
			{@render children()}
		</span>
	{:else if children && iconOnly}
		<span class="sr-only">
			{@render children()}
		</span>
		{#if !loading}
			{@render children()}
		{/if}
	{/if}

	{#if iconRight && !loading && !iconOnly}
		<span class="flex-shrink-0" aria-hidden="true">
			{@render iconRight()}
		</span>
	{/if}
</button>
