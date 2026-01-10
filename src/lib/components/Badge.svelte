<script module lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';

	/**
	 * Badge variant definitions following shadcn Badge pattern
	 * Supports semantic status colors and animated states
	 */
	export const badgeVariants = tv({
		base: 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground',
				secondary: 'bg-secondary text-secondary-foreground',
				destructive: 'bg-destructive text-destructive-foreground',
				outline: 'border border-border bg-transparent text-foreground',
				// Semantic status variants
				success: 'bg-success/15 text-success border border-success/20',
				warning: 'bg-warning/15 text-warning border border-warning/20',
				info: 'bg-info/15 text-info border border-info/20',
				// Status-specific variants (matching StatusIndicator semantics)
				running: 'bg-status-online/15 text-status-online border border-status-online/20',
				idle: 'bg-status-idle/15 text-status-idle border border-status-idle/20',
				error: 'bg-status-offline/15 text-status-offline border border-status-offline/20',
				pending: 'bg-status-pending/15 text-status-pending border border-status-pending/20'
			},
			size: {
				sm: 'text-2xs px-1.5 py-0.5 rounded',
				default: 'text-xs px-2 py-0.5 rounded-md',
				lg: 'text-sm px-2.5 py-1 rounded-md'
			},
			animated: {
				true: '',
				false: ''
			}
		},
		compoundVariants: [
			// Pulse animation for running/active states
			{
				variant: 'running',
				animated: true,
				class: 'animate-pulse'
			},
			{
				variant: 'pending',
				animated: true,
				class: 'animate-pulse'
			}
		],
		defaultVariants: {
			variant: 'default',
			size: 'default',
			animated: false
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
	export type BadgeSize = VariantProps<typeof badgeVariants>['size'];

	export type BadgeProps = VariantProps<typeof badgeVariants> & {
		class?: string;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props extends BadgeProps {
		children?: Snippet;
	}

	let {
		variant = 'default',
		size = 'default',
		animated = false,
		class: className = '',
		children
	}: Props = $props();
</script>

<span class={cn(badgeVariants({ variant, size, animated }), className)}>
	{#if children}
		{@render children()}
	{/if}
</span>
