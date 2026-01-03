<script lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';
	import { cn } from '$lib/utils';

	/**
	 * Status indicator variant definitions using tailwind-variants
	 */
	const statusVariants = tv({
		base: 'w-2 h-2 rounded-full inline-block flex-shrink-0',
		variants: {
			status: {
				running: 'bg-status-online animate-glow-pulse',
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

	/**
	 * Props type derived from variant definitions
	 */
	type StatusIndicatorProps = VariantProps<typeof statusVariants> & {
		class?: string;
		label?: string;
	};

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
	class={cn(statusVariants({ status, size }), className)}
	role="status"
	aria-label={accessibleLabel}
	title={accessibleLabel}
></span>
