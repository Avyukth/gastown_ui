<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	/**
	 * Button variant definitions using tailwind-variants (shadcn pattern)
	 *
	 * Variants: default, destructive, outline, secondary, ghost, link
	 * Sizes: default (h-10), sm (h-9), lg (h-11), icon (h-12 w-12, 48px touch target)
	 */
	export const buttonVariants = tv({
		base: [
			'inline-flex items-center justify-center gap-2 whitespace-nowrap',
			'font-medium text-sm',
			'rounded-md',
			'ring-offset-background',
			'transition-all duration-300 ease-out',
			'hover:-translate-y-px hover:shadow-sm',
			'active:translate-y-0 active:shadow-none',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none',
			'[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
		],
		variants: {
			variant: {
				default: [
					'bg-primary text-primary-foreground',
					'hover:bg-primary/90',
					'active:bg-primary/80'
				],
				primary: [
					'bg-primary text-primary-foreground',
					'rounded-xl',
					'hover:bg-gradient-to-br hover:from-primary hover:to-primary/80 hover:shadow-md',
					'active:bg-primary/80',
					'focus-visible:ring-primary'
				],
				destructive: [
					'bg-destructive text-destructive-foreground',
					'hover:bg-destructive/80 hover:shadow-destructive/25',
					'active:bg-destructive/70'
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
					'hover:underline',
					'hover:translate-y-0 hover:shadow-none'
				]
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-12 w-12 min-h-touch min-w-touch',
				cta: 'h-12 px-6 md:h-11'
			},
			fullWidth: {
				true: 'w-full',
				false: ''
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			fullWidth: false
		}
	});

	export type ButtonVariants = VariantProps<typeof buttonVariants>;

	export interface ButtonProps {
		variant?: ButtonVariants['variant'];
		size?: ButtonVariants['size'];
		fullWidth?: boolean;
		loading?: boolean;
		class?: string;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import { hapticLight } from '$lib/utils/haptics';
	import type { Snippet } from 'svelte';

	interface Props extends Omit<HTMLButtonAttributes, keyof ButtonProps>, ButtonProps {
		children?: Snippet;
		iconLeft?: Snippet;
		iconRight?: Snippet;
		haptic?: boolean;
	}

	let {
		variant = 'default',
		size = 'default',
		fullWidth = false,
		loading = false,
		disabled = false,
		type = 'button',
		class: className = '',
		children,
		iconLeft,
		iconRight,
		haptic = true,
		onclick,
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

	// Handle click with haptic feedback
	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (haptic && !isDisabled) {
			hapticLight();
		}
		onclick?.(event);
	}
</script>

<button
	type={type}
	class={cn(buttonVariants({ variant, size, fullWidth }), className)}
	disabled={isDisabled}
	aria-disabled={isDisabled}
	aria-label={ariaLabel}
	aria-busy={loading}
	onclick={handleClick}
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
