<script lang="ts" module>
	import { tv } from 'tailwind-variants';

	/**
	 * Circular Progress Component
	 * 
	 * Displays a circular progress ring with:
	 * - Brand orange (#F97316) fill
	 * - 24px diameter
	 * - Smooth SVG-based animations
	 * - Icon indicator for status
	 * - Status dot
	 */
	export const circularProgressVariants = tv({
		slots: {
			container: [
				'relative inline-flex items-center justify-center'
			],
			svg: [
				'transform -rotate-90'
			],
			iconContainer: [
				'absolute inset-0',
				'flex items-center justify-center',
				'text-muted-foreground'
			],
			icon: [
				'w-3 h-3'
			],
			statusDot: [
				'absolute bottom-0 right-0',
				'w-2 h-2 rounded-full'
			]
		}
	});

	export interface CircularProgressProps {
		/** Progress percentage (0-100) */
		progress?: number;
		/** Diameter in pixels */
		diameter?: number;
		/** Status: pending, running, completed */
		status?: 'pending' | 'running' | 'completed';
		/** Icon component (Lucide) */
		icon?: any;
		/** Background circle color */
		bgColor?: string;
		/** Progress circle color */
		progressColor?: string;
		/** Status dot color */
		dotColor?: string;
		/** Stroke width */
		strokeWidth?: number;
		/** Animation duration in ms */
		animationDuration?: number;
		/** Aria label for accessibility */
		ariaLabel?: string;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props extends CircularProgressProps {
		class?: string;
	}

	let {
		progress = 0,
		diameter = 24,
		status = 'running',
		icon,
		bgColor = 'hsl(var(--muted))',
		progressColor = 'hsl(var(--primary))',
		dotColor = 'hsl(var(--status-online))',
		strokeWidth = 2,
		animationDuration = 800,
		ariaLabel,
		class: className = ''
	}: Props = $props();

	// SVG calculations
	const radius = $derived(diameter / 2 - strokeWidth / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const offset = $derived(circumference - (Math.max(0, Math.min(100, progress)) / 100) * circumference);

	// Status colors
	const statusDotColors = {
		pending: 'hsl(var(--warning))',
		running: 'hsl(var(--status-online))',
		completed: 'hsl(var(--success))'
	};

	const displayDotColor = $derived(statusDotColors[status] || statusDotColors.running);

	// Format progress text
	const progressText = $derived(Math.round(progress));
</script>

<div 
	class={cn('relative inline-flex items-center justify-center', className)}
	role="progressbar"
	aria-valuenow={progress}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-label={ariaLabel || `${progressText}% complete`}
	style="width: {diameter}px; height: {diameter}px;"
>
	<!-- SVG Circular Progress -->
	<svg 
		viewBox="0 0 {diameter} {diameter}"
		class="transform -rotate-90"
		style="width: {diameter}px; height: {diameter}px;"
	>
		<!-- Background circle -->
		<circle
			cx={diameter / 2}
			cy={diameter / 2}
			r={radius}
			fill="none"
			stroke={bgColor}
			stroke-width={strokeWidth}
		/>
		
		<!-- Progress circle -->
		<circle
			cx={diameter / 2}
			cy={diameter / 2}
			r={radius}
			fill="none"
			stroke={progressColor}
			stroke-width={strokeWidth}
			stroke-dasharray={circumference}
			stroke-dashoffset={offset}
			stroke-linecap="round"
			style="transition: stroke-dashoffset {animationDuration}ms cubic-bezier(0.16, 1, 0.3, 1);"
		/>
	</svg>

	<!-- Icon in center -->
	{#if icon}
		{@const Icon = icon}
		<div
			class="absolute inset-0 flex items-center justify-center text-muted-foreground"
			aria-hidden="true"
		>
			<Icon
				class="w-3 h-3"
				strokeWidth={2}
			/>
		</div>
	{:else if status === 'completed'}
		<span class="absolute text-xs font-semibold text-foreground">✓</span>
	{:else}
		<span class="absolute text-xs text-muted-foreground">{progressText}%</span>
	{/if}

	<!-- Status indicator dot -->
	<div 
		class="absolute bottom-0 right-0 w-2 h-2 rounded-full"
		style="background-color: {displayDotColor};"
		aria-hidden="true"
	></div>
</div>
