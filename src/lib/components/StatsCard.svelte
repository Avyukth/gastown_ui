<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	/**
	 * StatsCard variant definitions
	 *
	 * Desktop-optimized stats cards with trends, sparklines, and hover effects.
	 */
	export const statsCardVariants = tv({
		slots: {
			container: [
				'panel-glass p-6 rounded-lg',
				'transition-all duration-200 ease-out',
				'hover:scale-[1.02] hover:shadow-lg',
				'cursor-pointer',
				// Mobile horizontal scroll support
				'min-w-[280px] flex-shrink-0 snap-center',
				'xl:min-w-0 xl:flex-shrink xl:snap-align-none'
			],
			header: [
				'flex items-center justify-between gap-2 mb-2'
			],
			label: [
				'text-xs text-muted-foreground uppercase tracking-wide flex-1'
			],
			icon: [
				'w-5 h-5 text-muted-foreground flex-shrink-0'
			],
			valueRow: [
				'flex items-end justify-between gap-2',
				'mt-2'
			],
			value: [
				'text-[32px] font-display font-bold leading-none',
				'font-mono tabular-nums'
			],
			trend: [
				'flex items-center gap-1',
				'text-sm font-medium'
			],
			trendIcon: [
				'w-4 h-4'
			],
			sparklineContainer: [
				'mt-3 h-10 w-full',
				'overflow-hidden rounded'
			],
			sparkline: [
				'w-full h-full'
			],
			comparison: [
				'mt-2 text-xs text-muted-foreground',
				'flex items-center gap-1'
			],
			footer: [
				'mt-3 pt-3 border-t border-border',
				'flex items-center gap-2 text-xs'
			],
			statusDot: [
				'w-2 h-2 rounded-full inline-block'
			]
		},
		variants: {
			trend: {
				up: {
					trend: 'text-success',
					value: ''
				},
				down: {
					trend: 'text-destructive',
					value: ''
				},
				neutral: {
					trend: 'text-muted-foreground',
					value: ''
				}
			}
		},
		defaultVariants: {
			trend: 'neutral'
		}
	});

	export type StatsCardVariants = VariantProps<typeof statsCardVariants>;

	/** Trend direction */
	export type TrendDirection = 'up' | 'down' | 'neutral';

	/** Sparkline data point */
	export type SparklinePoint = number;

	/** Status breakdown item */
	export interface StatusBreakdown {
		label: string;
		value: number;
		status: 'success' | 'warning' | 'error' | 'info' | 'muted';
	}

	export interface StatsCardProps {
		/** Card label (uppercase) */
		label: string;
		/** Main value (displayed in 32px font-mono) */
		value: string | number;
		/** Value suffix (e.g., '%', 'ms') */
		suffix?: string;
		/** Descriptive icon (Lucide component) */
		icon?: any;
		/** Trend direction */
		trend?: TrendDirection;
		/** Trend percentage (e.g., 12.5) */
		trendValue?: number;
		/** Comparison text (e.g., 'from yesterday') */
		comparisonText?: string;
		/** 7-day sparkline data (array of numbers) */
		sparklineData?: SparklinePoint[];
		/** Status breakdown for footer */
		statusBreakdown?: StatusBreakdown[];
		/** Additional container classes */
		class?: string;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import { TrendingUp, TrendingDown, Minus } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props extends StatsCardProps {
		children?: Snippet;
	}

	let {
		label,
		value,
		suffix = '',
		icon,
		trend = 'neutral',
		trendValue,
		comparisonText,
		sparklineData = [],
		statusBreakdown = [],
		class: className = '',
		children
	}: Props = $props();

	// Get styles
	const styles = $derived(statsCardVariants({ trend }));

	// Status color mapping
	const statusColors: Record<string, string> = {
		success: 'bg-success',
		warning: 'bg-warning',
		error: 'bg-destructive',
		info: 'bg-info',
		muted: 'bg-muted-foreground'
	};

	// Compute sparkline path
	const sparklinePath = $derived(() => {
		if (sparklineData.length < 2) return '';

		const width = 100;
		const height = 40;
		const padding = 2;

		const min = Math.min(...sparklineData);
		const max = Math.max(...sparklineData);
		const range = max - min || 1;

		const points = sparklineData.map((val, i) => {
			const x = padding + (i / (sparklineData.length - 1)) * (width - padding * 2);
			const y = height - padding - ((val - min) / range) * (height - padding * 2);
			return `${x},${y}`;
		});

		return `M ${points.join(' L ')}`;
	});

	// Format trend value
	const formattedTrend = $derived(() => {
		if (trendValue === undefined) return '';
		const sign = trendValue >= 0 ? '+' : '';
		return `${sign}${trendValue.toFixed(1)}%`;
	});

	// Trend icon component
	const TrendIcon = $derived(
		trend === 'up' ? TrendingUp :
		trend === 'down' ? TrendingDown :
		Minus
	);
</script>

<!--
	Stats Card Component

	Desktop-optimized stats card with trend indicators, sparklines, and hover effects.

	Example usage:
	```svelte
	<StatsCard
		label="Active Agents"
		value={42}
		trend="up"
		trendValue={12.5}
		comparisonText="from yesterday"
		sparklineData={[38, 35, 40, 42, 41, 44, 42]}
		statusBreakdown={[
			{ label: 'running', value: 38, status: 'success' },
			{ label: 'idle', value: 4, status: 'muted' }
		]}
	/>
	```
-->

<article class={cn(styles.container(), className)}>
	<!-- Header: Label + Icon -->
	<div class={styles.header()}>
		<p class={styles.label()}>
			{label}
		</p>
		{#if icon}
			{@const Icon = icon}
			<span class={styles.icon()} aria-hidden="true">
				<Icon strokeWidth={1.5} />
			</span>
		{/if}
	</div>

	<!-- Value + Trend -->
	<div class={styles.valueRow()}>
		<p class={styles.value()}>
			{value}{suffix}
		</p>

		{#if trend !== 'neutral' || trendValue !== undefined}
			<div class={styles.trend()}>
				<TrendIcon class={styles.trendIcon()} aria-hidden="true" />
				{#if trendValue !== undefined}
					<span>{formattedTrend()}</span>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Comparison Text -->
	{#if comparisonText && trendValue !== undefined}
		<p class={styles.comparison()}>
			<span class={trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : ''}>
				{formattedTrend()}
			</span>
			<span>{comparisonText}</span>
		</p>
	{/if}

	<!-- Sparkline -->
	{#if sparklineData.length >= 2}
		<div class={styles.sparklineContainer()}>
			<svg
				class={styles.sparkline()}
				viewBox="0 0 100 40"
				preserveAspectRatio="none"
				aria-label="7-day trend"
				role="img"
			>
				<!-- Gradient fill under line -->
				<defs>
					<linearGradient id="sparkline-gradient-{label.replace(/\s+/g, '-')}" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop
							offset="0%"
							stop-color={trend === 'up' ? 'hsl(var(--success))' : trend === 'down' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'}
							stop-opacity="0.3"
						/>
						<stop
							offset="100%"
							stop-color={trend === 'up' ? 'hsl(var(--success))' : trend === 'down' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'}
							stop-opacity="0"
						/>
					</linearGradient>
				</defs>

				<!-- Area fill -->
				<path
					d="{sparklinePath()} L 98,40 L 2,40 Z"
					fill="url(#sparkline-gradient-{label.replace(/\s+/g, '-')})"
				/>

				<!-- Line -->
				<path
					d={sparklinePath()}
					fill="none"
					stroke={trend === 'up' ? 'hsl(var(--success))' : trend === 'down' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'}
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>
	{/if}

	<!-- Custom content slot -->
	{#if children}
		<div class="mt-3">
			{@render children()}
		</div>
	{/if}

	<!-- Status Breakdown Footer -->
	{#if statusBreakdown.length > 0}
		<footer class={styles.footer()}>
			{#each statusBreakdown as item}
				<span class="flex items-center gap-1">
					<span
						class={cn(styles.statusDot(), statusColors[item.status] ?? 'bg-muted-foreground')}
						aria-hidden="true"
					></span>
					<span class="text-foreground">{item.value}</span>
					<span class="text-muted-foreground">{item.label}</span>
				</span>
			{/each}
		</footer>
	{/if}
</article>
