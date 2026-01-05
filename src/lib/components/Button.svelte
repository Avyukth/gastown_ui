<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	/**
	 * Button variant definitions using tailwind-variants
	 * Follows shadcn/ui patterns: default, destructive, outline, secondary, ghost, link
	 * Sizes: default (h-10), sm (h-9), lg (h-11), icon (h-10 w-10)
	 */
	export const buttonVariants = tv({
		base: [
			'inline-flex items-center justify-center gap-2',
			'whitespace-nowrap font-medium text-sm',
			'rounded-md',
			'transition-colors duration-150',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			'disabled:pointer-events-none disabled:opacity-50',
			'[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
		],
		variants: {
			variant: {
				default: [
					'bg-primary text-primary-foreground',
					'hover:bg-primary/90',
					'active:bg-primary/80'
				],
				destructive: [
					'bg-destructive text-destructive-foreground',
					'hover:bg-destructive/90',
					'active:bg-destructive/80'
				],
				outline: [
					'border border-input bg-background',
					'hover:bg-accent hover:text-accent-foreground',
					'active:bg-accent/80'
				],
				secondary: [
					'bg-secondary text-secondary-foreground',
					'hover:bg-secondary/80',
					'active:bg-secondary/70'
				],
				ghost: [
					'hover:bg-accent hover:text-accent-foreground',
					'active:bg-accent/80'
				],
				link: [
					'text-primary underline-offset-4',
					'hover:underline'
				]
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 px-3 rounded-md',
				lg: 'h-11 px-8 rounded-md',
				icon: 'h-10 w-10'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	type ButtonVariants = VariantProps<typeof buttonVariants>;

	export interface ButtonProps {
		variant?: ButtonVariants['variant'];
		size?: ButtonVariants['size'];
		loading?: boolean;
		class?: string;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props extends Omit<HTMLButtonAttributes, keyof ButtonProps>, ButtonProps {
		children?: Snippet;
		iconLeft?: Snippet;
		iconRight?: Snippet;
	}

	let {
		variant = 'default',
		size = 'default',
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

	// Check if this is an icon-only button
	const isIconOnly = $derived(size === 'icon');

	// Accessible loading label
	const ariaLabel = $derived(
		loading ? 'Loading...' : restProps['aria-label']
	);
</script>

<button
	type={type}
	class={cn(buttonVariants({ variant, size }), className)}
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
		<span class="shrink-0" aria-hidden="true">
			{@render iconLeft()}
		</span>
	{/if}

	{#if children && !isIconOnly}
		<span class={loading ? 'opacity-0' : ''}>
			{@render children()}
		</span>
	{:else if children && isIconOnly}
		<span class="sr-only">
			{@render children()}
		</span>
		{#if !loading}
			{@render children()}
		{/if}
	{/if}

	{#if iconRight && !loading && !isIconOnly}
		<span class="shrink-0" aria-hidden="true">
			{@render iconRight()}
		</span>
	{/if}
</button>
