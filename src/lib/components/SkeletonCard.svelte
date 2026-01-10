<script lang="ts">
	/**
	 * SkeletonCard - Placeholder for agent cards, stats cards, etc.
	 * Shows skeleton loaders in a card layout
	 */

	interface Props {
		type?: 'agent' | 'stat' | 'mail' | 'work'; // Card type
		count?: number; // Number of skeleton cards
		class?: string; // Additional CSS classes
		animated?: boolean; // Whether to animate
	}

	let { type = 'agent', count = 1, class: className = '', animated = true }: Props = $props();

	// Different skeleton layouts based on type
	const getSkeletonLayout = (cardType: string) => {
		switch (cardType) {
			case 'agent':
				return {
					// Agent card: icon + name + role + status
					icon: true,
					titleLines: 1,
					descLines: 2,
					badgeWidth: 60
				};
			case 'stat':
				return {
					// Stat card: title + number + chart preview
					icon: true,
					titleLines: 1,
					statLines: 1,
					chartHeight: 40
				};
			case 'mail':
				return {
					// Mail item: avatar + sender + subject + timestamp
					avatar: true,
					titleLines: 1,
					descLines: 2,
					smallLines: 1
				};
			case 'work':
				return {
					// Work item: title + status + assignee + date
					titleLines: 1,
					descLines: 2,
					badgeWidth: 50
				};
			default:
				return {
					titleLines: 1,
					descLines: 2
				};
		}
	};

	const layout = $derived(getSkeletonLayout(type));
</script>

<!-- Skeleton cards container -->
<div class={`grid gap-4 ${className}`}>
	{#each Array(count) as _, cardIdx}
		<div
			class="rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm overflow-hidden"
			aria-busy="true"
			aria-label="Loading content"
			style={animated ? `animation-delay: ${cardIdx * 50}ms` : undefined}
		>
			{#if animated}
				<!-- Shimmer effect overlay -->
				<div
					class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
				></div>
			{/if}
			<!-- Agent card skeleton -->
			{#if type === 'agent'}
				<div class="flex items-start gap-3 relative">
					<!-- Icon skeleton -->
					{#if layout.icon}
						<div
							class="h-8 w-8 flex-shrink-0 rounded-md bg-muted/50 animate-pulse"
							aria-hidden="true"
							style={animated ? `animation-delay: ${cardIdx * 50}ms` : undefined}
						></div>
					{/if}

					<div class="flex-1 space-y-2">
						<!-- Title -->
						<div
							class="h-4 w-24 rounded-md bg-muted/50 animate-pulse"
							aria-hidden="true"
							style={animated ? `animation-delay: ${cardIdx * 50 + 75}ms` : undefined}
						></div>
						<!-- Description lines -->
						{#each Array(layout.descLines || 1) as _, lineIdx}
							<div
								class="h-3 w-full rounded-md bg-muted/50 animate-pulse"
								style={`width: ${Math.random() > 0.5 ? 80 : 60}%; ${animated ? `animation-delay: ${cardIdx * 50 + (lineIdx + 1) * 75}ms` : ''}`}
								aria-hidden="true"
							></div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Stat card skeleton -->
			{#if type === 'stat'}
				<div class="space-y-3">
					<!-- Title + icon -->
					<div class="flex items-center justify-between">
						<div class="h-4 w-20 rounded-md bg-muted/50 animate-pulse" aria-hidden="true"></div>
						<div class="h-6 w-6 rounded-md bg-muted/50 animate-pulse" aria-hidden="true"></div>
					</div>
					<!-- Big number -->
					<div class="h-8 w-16 rounded-md bg-muted/50 animate-pulse" aria-hidden="true"></div>
					<!-- Change indicator -->
					<div class="h-3 w-32 rounded-md bg-muted/50 animate-pulse" aria-hidden="true"></div>
				</div>
			{/if}

			<!-- Mail item skeleton -->
			{#if type === 'mail'}
				<div class="flex items-start gap-3">
					<!-- Avatar skeleton -->
					{#if layout.avatar}
						<div
							class="h-10 w-10 flex-shrink-0 rounded-full bg-muted/50 animate-pulse"
							aria-hidden="true"
						></div>
					{/if}

					<div class="flex-1 space-y-2">
						<!-- Sender + timestamp -->
						<div class="flex items-center justify-between gap-2">
							<div class="h-4 w-24 rounded-md bg-muted/50 animate-pulse" aria-hidden="true"></div>
							<div class="h-3 w-12 rounded-md bg-muted/50 animate-pulse" aria-hidden="true"></div>
						</div>
						<!-- Subject -->
						<div class="h-4 w-full rounded-md bg-muted/50 animate-pulse" aria-hidden="true"></div>
						<!-- Preview -->
						<div
							class="h-3 rounded-md bg-muted/50 animate-pulse"
							style="width: 85%"
							aria-hidden="true"
						></div>
					</div>
				</div>
			{/if}

			<!-- Work item skeleton -->
			{#if type === 'work'}
				<div class="space-y-3">
					<!-- Title -->
					<div class="h-4 w-40 rounded-md bg-muted/50 animate-pulse" aria-hidden="true"></div>
					<!-- Description -->
					{#each Array(layout.descLines || 1) as _}
						<div
							class="h-3 rounded-md bg-muted/50 animate-pulse"
							style="width: {Math.random() > 0.5 ? 80 : 60}%"
							aria-hidden="true"
						></div>
					{/each}
					<!-- Footer: status + assignee -->
					<div class="flex items-center gap-2 pt-2">
						<div class="h-5 w-16 rounded-full bg-muted/50 animate-pulse" aria-hidden="true"></div>
						<div class="h-6 w-6 rounded-full bg-muted/50 animate-pulse" aria-hidden="true"></div>
					</div>
				</div>
			{/if}

			<!-- Generic skeleton -->
			{#if type === 'agent' || type === 'stat' || type === 'mail' || type === 'work'}
				<!-- handled above -->
			{:else}
				<div class="space-y-3">
					{#each Array(3) as _}
						<div
							class="h-4 rounded-md bg-muted/50 animate-pulse"
							style="width: {Math.random() > 0.5 ? 80 : 60}%"
							aria-hidden="true"
						></div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	:global(.animate-pulse) {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
