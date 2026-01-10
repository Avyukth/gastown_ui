<script lang="ts">
	import { GridPattern, StatusIndicator } from '$lib/components';
	import { Check, Clock, HelpCircle, PawPrint, Pointer, Rocket, Shield } from 'lucide-svelte';

	const { data } = $props();

	type DogStatus = 'online' | 'offline' | 'unknown';
	type TriageDecision = 'START' | 'WAKE' | 'NUDGE' | 'NOTHING' | 'unknown';

	function getStatusVariant(
		status: DogStatus
	): 'running' | 'idle' | 'error' | 'warning' | 'complete' {
		switch (status) {
			case 'online':
				return 'running';
			case 'offline':
				return 'error';
			case 'unknown':
				return 'idle';
		}
	}

	function getStatusLabel(status: DogStatus): string {
		switch (status) {
			case 'online':
				return 'Online';
			case 'offline':
				return 'Offline';
			case 'unknown':
				return 'Unknown';
		}
	}

	function getTriageVariant(
		triage: TriageDecision
	): 'running' | 'idle' | 'error' | 'warning' | 'complete' {
		switch (triage) {
			case 'START':
				return 'running';
			case 'WAKE':
				return 'warning';
			case 'NUDGE':
				return 'complete';
			case 'NOTHING':
				return 'idle';
			case 'unknown':
				return 'idle';
		}
	}

	function getTriageLabel(triage: TriageDecision): string {
		switch (triage) {
			case 'START':
				return 'Started new session';
			case 'WAKE':
				return 'Woke sleeping session';
			case 'NUDGE':
				return 'Nudged stuck session';
			case 'NOTHING':
				return 'No action needed';
			case 'unknown':
				return 'Unknown';
		}
	}

	function getTriageIcon(triage: TriageDecision) {
		switch (triage) {
			case 'START':
				return Rocket;
			case 'WAKE':
				return Clock;
			case 'NUDGE':
				return Pointer;
			case 'NOTHING':
				return Check;
			case 'unknown':
				return HelpCircle;
		}
	}

	function formatTime(isoString: string | null): string {
		if (!isoString) return 'Never';
		return new Date(isoString).toLocaleTimeString();
	}

	function formatRelativeTime(isoString: string | null): string {
		if (!isoString) return '';
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffSecs = Math.floor(diffMs / 1000);
		const diffMins = Math.floor(diffSecs / 60);
		const diffHours = Math.floor(diffMins / 60);

		if (diffSecs < 60) return `${diffSecs}s ago`;
		if (diffMins < 60) return `${diffMins}m ago`;
		return `${diffHours}h ago`;
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass px-4 h-[72px] relative">
			<div class="container h-full flex items-center justify-between lg:pr-44">
				<div class="flex items-center gap-3">
					<div class="w-1.5 h-8 bg-primary rounded-sm shadow-glow shrink-0" aria-hidden="true"></div>
					<PawPrint class="w-6 h-6 text-foreground" strokeWidth={2} />
					<div>
						<h1 class="text-2xl font-display font-semibold text-foreground">Deacon Dogs</h1>
						<p class="text-sm text-muted-foreground">Helper agents that keep Gas Town running</p>
					</div>
				</div>
				{#if data.dogs}
					<StatusIndicator status={getStatusVariant(data.dogs.boot.status)} size="lg" />
				{/if}
			</div>
			<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true"></div>
		</header>

		<main class="container py-6 space-y-6">
			{#if data.dogs.error}
				<div class="panel-glass p-6 border-status-offline/30">
					<p class="text-status-offline font-medium">Failed to load dogs status</p>
					<p class="text-sm text-muted-foreground mt-1">{data.dogs.error}</p>
				</div>
			{/if}

			<!-- Boot (Watchdog) Section -->
			<section class="animate-blur-fade-up">
				<div class="panel-glass p-6">
					<div class="flex items-center gap-4 mb-6">
						<div
							class="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center"
						>
							<Shield class="w-8 h-8 text-warning" strokeWidth={2} />
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h2 class="text-xl font-semibold">Boot</h2>
								<span
									class="px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning"
								>
									Watchdog
								</span>
							</div>
							<p class="text-sm text-muted-foreground">
								Monitors agent health and performs triage decisions
							</p>
						</div>
						<StatusIndicator status={getStatusVariant(data.dogs.boot.status)} size="lg" />
					</div>

					<!-- Status Cards -->
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
						<div class="p-4 rounded-lg bg-background/50 border border-border">
							<p class="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
							<div class="flex items-center gap-2 mt-2">
								<StatusIndicator status={getStatusVariant(data.dogs.boot.status)} />
								<span class="font-semibold">{getStatusLabel(data.dogs.boot.status)}</span>
							</div>
						</div>

						<div class="p-4 rounded-lg bg-background/50 border border-border">
							<p class="text-xs text-muted-foreground uppercase tracking-wide">Last Decision</p>
							{#if data.dogs.boot.lastTriage}
								{@const TriageIcon = getTriageIcon(data.dogs.boot.lastTriage)}
								<div class="flex items-center gap-2 mt-2">
									<TriageIcon
										class="w-5 h-5 text-muted-foreground"
										strokeWidth={2}
									/>
									<span class="font-semibold">{data.dogs.boot.lastTriage}</span>
								</div>
							{/if}
						</div>

						<div class="p-4 rounded-lg bg-background/50 border border-border">
							<p class="text-xs text-muted-foreground uppercase tracking-wide">Patrol Count</p>
							<p class="text-2xl font-bold mt-2">{data.dogs.boot.patrolCount}</p>
						</div>

						<div class="p-4 rounded-lg bg-background/50 border border-border">
							<p class="text-xs text-muted-foreground uppercase tracking-wide">Last Check</p>
							<p class="font-semibold mt-2">{formatTime(data.dogs.boot.lastTriageTime)}</p>
							{#if data.dogs.boot.lastTriageTime}
								<p class="text-xs text-muted-foreground">
									{formatRelativeTime(data.dogs.boot.lastTriageTime)}
								</p>
							{/if}
						</div>
					</div>

					<!-- Last Triage Details -->
					{#if data.dogs.boot.lastTriage !== 'unknown'}
						<div
							class="p-4 rounded-lg border-l-4 {data.dogs.boot.lastTriage === 'START'
								? 'border-l-status-online bg-status-online/5'
								: data.dogs.boot.lastTriage === 'WAKE'
									? 'border-l-status-pending bg-status-pending/5'
									: data.dogs.boot.lastTriage === 'NUDGE'
										? 'border-l-info bg-info/5'
										: 'border-l-border bg-background/50'}"
						>
							<div class="flex items-center gap-3">
								<StatusIndicator status={getTriageVariant(data.dogs.boot.lastTriage)} size="lg" />
								<div>
									<p class="font-medium">{getTriageLabel(data.dogs.boot.lastTriage)}</p>
									{#if data.dogs.boot.lastTriageTarget}
										<p class="text-sm text-muted-foreground">
											Target: <code class="px-1 py-0.5 rounded bg-muted text-xs"
												>{data.dogs.boot.lastTriageTarget}</code
											>
										</p>
									{/if}
								</div>
							</div>
						</div>
					{:else}
						<div class="p-4 rounded-lg bg-muted/20 border border-border">
							<p class="text-muted-foreground text-sm">
								No triage data available. Boot may not have run yet, or status files are missing.
							</p>
						</div>
					{/if}
				</div>
			</section>

			<!-- Marker Files Section -->
			{#if Object.keys(data.dogs.boot.markerFiles).length > 0}
				<section class="animate-blur-fade-up" style="animation-delay: 100ms">
					<h2 class="text-lg font-semibold mb-3">Marker Files</h2>
					<div class="panel-glass divide-y divide-border">
						{#each Object.entries(data.dogs.boot.markerFiles) as [rig, marker]}
							<div class="p-4 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<StatusIndicator
										status={marker.exists ? (marker.stale ? 'warning' : 'running') : 'error'}
									/>
									<div>
										<p class="font-medium">{rig}</p>
										<p class="text-xs text-muted-foreground font-mono">{marker.path}</p>
									</div>
								</div>
								<span
									class="px-2 py-1 rounded text-xs font-medium {marker.exists
										? marker.stale
											? 'bg-status-pending/10 text-status-pending'
											: 'bg-status-online/10 text-status-online'
										: 'bg-status-offline/10 text-status-offline'}"
								>
									{marker.exists ? (marker.stale ? 'Stale' : 'Active') : 'Missing'}
								</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Heartbeat Section -->
			{#if data.dogs.heartbeat}
				<section class="animate-blur-fade-up" style="animation-delay: 200ms">
					<h2 class="text-lg font-semibold mb-3">Heartbeat</h2>
					<div class="panel-glass p-4">
						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p class="text-muted-foreground">Last Beat</p>
								<p class="font-medium">{formatTime(data.dogs.heartbeat.timestamp)}</p>
							</div>
							<div>
								<p class="text-muted-foreground">Interval</p>
								<p class="font-medium">{data.dogs.heartbeat.interval}s</p>
							</div>
							<div class="col-span-2">
								<p class="text-muted-foreground">Monitored Rigs</p>
								<div class="flex flex-wrap gap-2 mt-1">
									{#each data.dogs.heartbeat.rigs as rig}
										<span class="px-2 py-1 rounded bg-muted text-xs font-mono">{rig}</span>
									{/each}
									{#if data.dogs.heartbeat.rigs.length === 0}
										<span class="text-muted-foreground text-xs">No rigs configured</span>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</section>
			{:else}
				<section class="animate-blur-fade-up" style="animation-delay: 200ms">
					<h2 class="text-lg font-semibold mb-3">Heartbeat</h2>
					<div class="panel-glass p-4">
						<p class="text-muted-foreground text-sm">
							No heartbeat data available. Deacon may not be running.
						</p>
					</div>
				</section>
			{/if}

			<!-- Footer -->
			<footer class="panel-glass p-4">
				<div class="flex items-center justify-between text-sm text-muted-foreground">
					<span>Dogs help keep Gas Town agents healthy and responsive</span>
					<span>Updated: {new Date(data.dogs.timestamp).toLocaleTimeString()}</span>
				</div>
			</footer>
		</main>
	</div>
</div>
