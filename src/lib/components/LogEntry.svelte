<script module lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';

	/**
	 * LogEntry variant definitions using tailwind-variants
	 */
	export const logEntryVariants = tv({
		base: [
			'flex items-start gap-3 py-2 px-3 border-b border-border',
			'animate-blur-fade-up',
			'transition-colors duration-150',
			'hover:bg-muted/30'
		],
		variants: {
			level: {
				INF: '',
				WRN: '',
				ERR: '',
				DBG: ''
			}
		},
		defaultVariants: {
			level: 'INF'
		}
	});

	/**
	 * Props type derived from variant definitions
	 */
	export type LogEntryProps = VariantProps<typeof logEntryVariants> & {
		timestamp: string;
		message: string;
		delay?: number;
		class?: string;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils';

	/**
	 * Badge variant definitions for log levels
	 */
	const levelBadgeVariants = tv({
		base: 'inline-flex items-center justify-center px-1.5 py-0.5 text-2xs font-mono font-medium rounded',
		variants: {
			level: {
				INF: 'bg-info/20 text-info',
				WRN: 'bg-warning/20 text-warning',
				ERR: 'bg-destructive/20 text-destructive',
				DBG: 'bg-muted text-muted-foreground'
			}
		},
		defaultVariants: {
			level: 'INF'
		}
	});

	// Component props
	let {
		level = 'INF',
		timestamp,
		message,
		delay = 0,
		class: className = ''
	}: LogEntryProps = $props();

	// Animation delay style
	const animationStyle = $derived(delay > 0 ? `animation-delay: ${delay}ms` : '');
</script>

<div
	class={cn(logEntryVariants({ level }), className)}
	style={animationStyle}
>
	<!-- Timestamp -->
	<time class="text-xs text-muted-foreground font-mono flex-shrink-0 w-20">
		{timestamp}
	</time>

	<!-- Level badge -->
	<span class={levelBadgeVariants({ level })}>
		{level}
	</span>

	<!-- Message content -->
	<p class="flex-1 text-sm text-foreground break-words">
		{message}
	</p>
</div>
