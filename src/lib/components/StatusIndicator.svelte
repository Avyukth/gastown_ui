<script module lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';

	/**
	 * Status indicator variant definitions using tailwind-variants
	 * Uses glow-pulse-effect for GPU-accelerated glow animation (opacity instead of box-shadow)
	 *
	 * Status colors use semantic tokens:
	 * - running/complete: --status-online (green)
	 * - idle: --status-idle (gray)
	 * - error: --status-offline (red)
	 * - warning/pending/processing: --status-pending (amber)
	 */
	export const statusIndicatorVariants = tv({
		base: 'w-2 h-2 rounded-full inline-block flex-shrink-0',
		variants: {
			status: {
				running: 'bg-status-online glow-pulse-effect',
				idle: 'bg-status-idle',
				error: 'bg-status-offline animate-shake',
				warning: 'bg-status-pending',
				complete: 'bg-status-online animate-scale-in',
				processing: 'bg-status-pending animate-spin'
			},
			size: {
				sm: 'w-1.5 h-1.5',
				md: 'w-2 h-2',
				lg: 'w-3 h-3'
			}
		},
		defaultVariants: {
			status: 'idle',
			size: 'md'
		}
	});

	export type StatusIndicatorStatus = VariantProps<typeof statusIndicatorVariants>['status'];
	export type StatusIndicatorSize = VariantProps<typeof statusIndicatorVariants>['size'];

	export type StatusIndicatorProps = VariantProps<typeof statusIndicatorVariants> & {
		class?: string;
		label?: string;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils';

	// Component props
	let {
		status = 'idle',
		size = 'md',
		class: className = '',
		label
	}: StatusIndicatorProps = $props();

	// Generate accessible label based on status if not provided
	const accessibleLabel = $derived(
		label ??
			{
				running: 'Running',
				idle: 'Idle',
				error: 'Error',
				warning: 'Warning',
				complete: 'Complete',
				processing: 'Processing'
			}[status ?? 'idle']
	);
</script>

<span
	class={cn(statusIndicatorVariants({ status, size }), className)}
	role="status"
	aria-label={accessibleLabel}
	title={accessibleLabel}
></span>
