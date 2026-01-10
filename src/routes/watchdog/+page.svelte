<script lang="ts">
	import { GridPattern, StatusIndicator } from '$lib/components';
	import { ArrowDown } from 'lucide-svelte';

	const { data } = $props();

	type Freshness = 'fresh' | 'stale' | 'very-stale' | 'unknown';

	function getFreshnessColor(freshness: Freshness): string {
		switch (freshness) {
			case 'fresh':
				return 'text-status-online';
			case 'stale':
				return 'text-status-pending';
			case 'very-stale':
				return 'text-status-offline';
			case 'unknown':
				return 'text-muted-foreground';
		}
	}

	function getFreshnessBg(freshness: Freshness): string {
		switch (freshness) {
			case 'fresh':
				return 'bg-status-online/10 border-status-online/30';
			case 'stale':
				return 'bg-status-pending/10 border-status-pending/30';
			case 'very-stale':
				return 'bg-status-offline/10 border-status-offline/30';
			case 'unknown':
				return 'bg-muted/50 border-border';
		}
	}

	function getFreshnessLabel(freshness: Freshness): string {
		switch (freshness) {
			case 'fresh':
				return 'Fresh (<5min)';
			case 'stale':
				return 'Stale (5-15min)';
			case 'very-stale':
				return 'Very Stale (>15min)';
			case 'unknown':
				return 'Unknown';
		}
	}

	function getStatusVariant(running: boolean, freshness: Freshness): 'running' | 'warning' | 'error' | 'idle' {
		if (!running) return 'error';
		switch (freshness) {
			case 'fresh':
				return 'running';
			case 'stale':
				return 'warning';
			case 'very-stale':
				return 'error';
			case 'unknown':
				return 'idle';
		}
	}

	function formatTime(timestamp: string | null): string {
		if (!timestamp) return 'Never';
		const date = new Date(timestamp);
		return date.toLocaleTimeString();
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass px-4 h-[72px] relative">
			<div class="container h-full flex items-center justify-between lg:pr-44">
				<div class="flex items-center gap-3">
					<div class="w-1.5 h-8 bg-primary rounded-sm shadow-glow shrink-0" aria-hidden="true"></div>
					<div>
						<h1 class="text-2xl font-display font-semibold text-foreground">Watchdog</h1>
						<p class="text-sm text-muted-foreground">Daemon → Boot → Deacon chain monitor</p>
					</div>
				</div>
				{#if data.watchdog}
					<StatusIndicator
						status={data.watchdog.chainHealthy ? 'running' : 'error'}
						size="lg"
					/>
				{/if}
			</div>
			<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true"></div>
		</header>

		<main class="container py-6 space-y-6">
			{#if data.error}
				<div class="panel-glass p-6 border-status-offline/30">
					<p class="text-status-offline font-medium">Watchdog chain broken</p>
					<p class="text-sm text-muted-foreground mt-1">{data.error}</p>
				</div>
			{/if}

			{#if data.watchdog}
				<!-- Chain Status Banner -->
				<div
					class="panel-glass p-4 border-l-4 {data.watchdog.chainHealthy
						? 'border-l-status-online bg-status-online/5'
						: 'border-l-status-offline bg-status-offline/5'} animate-blur-fade-up"
				>
					<div class="flex items-center gap-2">
						<StatusIndicator
							status={data.watchdog.chainHealthy ? 'running' : 'error'}
							size="lg"
						/>
						<div>
							<p class="font-medium text-foreground">{data.watchdog.summary}</p>
							<p class="text-sm text-muted-foreground">
								Last checked: {formatTime(data.watchdog.timestamp)}
							</p>
						</div>
					</div>
				</div>

				<!-- Three-Tier Chain Visualization -->
				<section>
					<h2 class="text-lg font-semibold mb-4">Chain Tiers</h2>
					<div class="relative">
						<!-- Connection lines -->
						<div class="absolute left-8 top-[4.5rem] h-[calc(100%-9rem)] w-0.5 bg-border hidden md:block"></div>

						<div class="space-y-4 stagger">
							{#each [
								{ tier: data.watchdog.tiers.daemon, num: 1 },
								{ tier: data.watchdog.tiers.boot, num: 2 },
								{ tier: data.watchdog.tiers.deacon, num: 3 }
							] as { tier, num }, i}
								{#if i > 0}
									<!-- Arrow down -->
									<div class="flex justify-center py-1">
										<ArrowDown class="w-6 h-6 text-muted-foreground" />
									</div>
								{/if}

								<div class="panel-glass p-5 animate-blur-fade-up relative">
									<div class="flex items-start gap-4">
										<div
											class="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-2xl {getFreshnessBg(tier.freshness)} border"
										>
											<span>{num}</span>
										</div>
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-3 flex-wrap">
												<h3 class="text-lg font-semibold">{tier.name}</h3>
												<StatusIndicator
													status={getStatusVariant(tier.running, tier.freshness)}
												/>
												<span
													class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {tier.running
														? 'bg-status-online/10 text-status-online'
														: 'bg-status-offline/10 text-status-offline'}"
												>
													{tier.running ? 'Running' : 'Stopped'}
												</span>
											</div>
											<p class="text-sm text-muted-foreground mt-1">{tier.description}</p>
											<div class="mt-3 flex flex-wrap gap-4 text-sm">
												<div>
													<span class="text-muted-foreground">Heartbeat:</span>
													<span class={getFreshnessColor(tier.freshness)}>
														{getFreshnessLabel(tier.freshness)}
													</span>
												</div>
												<div>
													<span class="text-muted-foreground">Details:</span>
													<span class="text-foreground">{tier.details}</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</section>

				<!-- Freshness Legend -->
				<section class="panel-glass p-4">
					<h3 class="text-sm font-medium mb-3">Heartbeat Freshness Legend</h3>
					<div class="flex flex-wrap gap-4 text-sm">
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 rounded-full bg-status-online"></div>
							<span>Fresh (&lt;5min)</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 rounded-full bg-status-pending"></div>
							<span>Stale (5-15min)</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 rounded-full bg-status-offline"></div>
							<span>Very Stale (&gt;15min)</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 rounded-full bg-muted"></div>
							<span>Unknown</span>
						</div>
					</div>
				</section>

				<!-- Footer -->
				<footer class="panel-glass p-4">
					<div class="flex flex-wrap gap-6 text-sm text-muted-foreground">
						<div>
							Chain status:
							<span class="font-medium {data.watchdog.chainHealthy ? 'text-status-online' : 'text-status-offline'}">
								{data.watchdog.chainHealthy ? 'Healthy' : 'Degraded'}
							</span>
						</div>
						<div class="ml-auto text-xs">
							Updated: {new Date(data.watchdog.timestamp).toLocaleTimeString()}
						</div>
					</div>
				</footer>
			{:else}
				<div class="panel-glass p-6">
					<p class="text-muted-foreground">No watchdog data available</p>
				</div>
			{/if}
		</main>
	</div>
</div>
