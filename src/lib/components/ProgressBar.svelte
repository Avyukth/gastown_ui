<script lang="ts">
	/**
	 * Progress Bar Component
	 *
	 * Accessible progress indicator with size, color, and mode variants.
	 * Uses tailwind-variants for type-safe variant styling.
	 *
	 * @example
	 * <ProgressBar value={75} />
	 * <ProgressBar value={50} size="lg" color="success" />
	 * <ProgressBar mode="indeterminate" color="warning" />
	 */
	import { tv, type VariantProps } from 'tailwind-variants';
	import { cn } from '$lib/utils';

	// Define progress bar variants using tailwind-variants
	const progressBar = tv({
		slots: {
			base: 'w-full bg-muted rounded-full overflow-hidden',
			indicator: 'rounded-full transition-all duration-300'
		},
		variants: {
			size: {
				sm: { base: 'h-1', indicator: 'h-1' },
				md: { base: 'h-2', indicator: 'h-2' },
				lg: { base: 'h-3', indicator: 'h-3' }
			},
			color: {
				default: { indicator: 'bg-primary' },
				success: { indicator: 'bg-success' },
				warning: { indicator: 'bg-warning' },
				error: { indicator: 'bg-destructive' }
			},
			mode: {
				determinate: { indicator: '' },
				indeterminate: {
					indicator: 'animate-shimmer bg-gradient-to-r from-transparent via-current to-transparent bg-[length:200%_100%]'
				}
			}
		},
		defaultVariants: {
			size: 'md',
			color: 'default',
			mode: 'determinate'
		}
	});

	type ProgressBarVariants = VariantProps<typeof progressBar>;

	interface Props {
		/** Current progress value (0-100) */
		value?: number;
		/** Minimum value for progress range */
		min?: number;
		/** Maximum value for progress range */
		max?: number;
		/** Size variant */
		size?: ProgressBarVariants['size'];
		/** Color variant */
		color?: ProgressBarVariants['color'];
		/** Display mode */
		mode?: ProgressBarVariants['mode'];
		/** Additional CSS classes for the container */
		class?: string;
	}

	let {
		value = 0,
		min = 0,
		max = 100,
		size = 'md',
		color = 'default',
		mode = 'determinate',
		class: className
	}: Props = $props();

	// Calculate percentage for determinate mode
	const percentage = $derived(
		mode === 'determinate'
			? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
			: 100
	);

	// Get variant styles
	const styles = $derived(progressBar({ size, color, mode }));

	// Indicator width style
	const indicatorStyle = $derived(
		mode === 'determinate' ? `width: ${percentage}%` : 'width: 100%'
	);
</script>

<div
	class={cn(styles.base(), className)}
	role="progressbar"
	aria-valuenow={mode === 'determinate' ? value : undefined}
	aria-valuemin={min}
	aria-valuemax={max}
	aria-label="Progress"
>
	<div class={styles.indicator()} style={indicatorStyle}></div>
</div>
