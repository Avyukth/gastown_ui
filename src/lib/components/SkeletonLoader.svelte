<script lang="ts">
	/**
	 * SkeletonLoader - Animated placeholder for loading content
	 * Displays pulsing skeleton lines with varying widths
	 */

	interface Props {
		lines?: number; // Number of skeleton lines to show
		widths?: number[]; // Widths as percentages (e.g., [100, 80, 60])
		height?: string; // Height of each line (default: h-4)
		gap?: string; // Gap between lines (default: gap-3)
		class?: string; // Additional CSS classes
		animated?: boolean; // Whether to animate (default: true)
	}

	let {
		lines = 3,
		widths = [100, 80, 60],
		height = 'h-4',
		gap = 'gap-3',
		class: className = '',
		animated = true
	}: Props = $props();

	// Generate widths array if not provided
	const lineWidths = $derived(() => {
		if (widths.length >= lines) return widths.slice(0, lines);
		// If not enough widths, use defaults and pad
		const defaults = [100, 80, 60, 40, 100];
		return [...widths, ...defaults.slice(widths.length)].slice(0, lines);
	});
</script>

<div class={`flex flex-col ${gap} ${className}`}>
	{#each Array(lines) as _, i}
		<div
			class={`rounded-md bg-muted/50 ${height} ${
				animated ? 'animate-pulse' : ''
			}`}
			style={`width: ${lineWidths()[i]}%`}
			aria-hidden="true"
		></div>
	{/each}
</div>

<style>
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	:global(.animate-pulse) {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
