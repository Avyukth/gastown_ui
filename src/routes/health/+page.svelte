<script lang="ts">
	import { GridPattern, StatusIndicator, PageHeader } from '$lib/components';

	const { data } = $props();

	type HealthStatus = 'healthy' | 'degraded' | 'offline';

	function getStatusVariant(
		status: HealthStatus
	): 'running' | 'idle' | 'error' | 'warning' | 'complete' {
		switch (status) {
			case 'healthy':
				return 'running';
			case 'degraded':
				return 'warning';
			case 'offline':
				return 'error';
		}
	}

	function getStatusLabel(status: HealthStatus): string {
		switch (status) {
			case 'healthy':
				return 'Healthy';
			case 'degraded':
				return 'Degraded';
			case 'offline':
				return 'Offline';
		}
	}

	function getPatrolStatusLabel(status: 'active' | 'inactive' | 'unknown'): string {
		switch (status) {
			case 'active':
				return 'Active';
			case 'inactive':
				return 'Inactive';
			case 'unknown':
				return 'Unknown';
		}
	}

	function getPatrolStatusVariant(
		status: 'active' | 'inactive' | 'unknown'
	): 'running' | 'idle' | 'warning' {
		switch (status) {
			case 'active':
				return 'running';
			case 'inactive':
				return 'idle';
			case 'unknown':
				return 'warning';
		}
	}

	function getTriageStatusLabel(status: 'complete' | 'pending' | 'unknown'): string {
		switch (status) {
			case 'complete':
				return 'Complete';
			case 'pending':
				return 'Pending';
			case 'unknown':
				return 'Unknown';
		}
	}

	function getTriageStatusVariant(
		status: 'complete' | 'pending' | 'unknown'
	): 'complete' | 'warning' | 'idle' {
		switch (status) {
			case 'complete':
				return 'complete';
			case 'pending':
				return 'warning';
			case 'unknown':
				return 'idle';
		}
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<PageHeader
			title="System Health"
			subtitle="Agent health dashboard for Gas Town"
			liveCount={data.health ? {
				count: data.health.summary.healthyRigs,
				label: getStatusLabel(data.health.overallStatus).toLowerCase(),
				status: data.health.overallStatus === 'healthy' ? 'success' : data.health.overallStatus === 'degraded' ? 'warning' : 'error'
			} : undefined}
			showAccentBar={true}
		/>

		<main class="container py-6 space-y-6">
			{#if data.error}
				<div class="panel-glass p-6 border-status-offline/30">
					<p class="text-status-offline font-medium">Failed to load health status</p>
					<p class="text-sm text-muted-foreground mt-1">{data.error}</p>
				</div>
			{:else if data.health}
				<!-- Degraded Mode Banner -->
				{#if data.health.isDegraded}
					<div
						class="panel-glass p-4 border-l-4 border-l-status-pending bg-status-pending/5 animate-blur-fade-up"
					>
						<div class="flex items-center gap-2">
							<StatusIndicator status="warning" size="lg" />
							<div>
								<p class="font-medium text-foreground">System Running in Degraded Mode</p>
								<p class="text-sm text-muted-foreground">
									Some agents are offline or experiencing issues
								</p>
							</div>
						</div>
					</div>
				{/if}

				<!-- Overview Cards -->
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
					<div class="panel-glass p-4 animate-blur-fade-up">
						<p class="text-xs text-muted-foreground uppercase tracking-wide">Overall Status</p>
						<div class="flex items-center gap-2 mt-2">
							<StatusIndicator status={getStatusVariant(data.health.overallStatus)} />
							<span class="text-lg font-semibold"
								>{getStatusLabel(data.health.overallStatus)}</span
							>
						</div>
					</div>

					<div class="panel-glass p-4 animate-blur-fade-up">
						<p class="text-xs text-muted-foreground uppercase tracking-wide">Boot Triage</p>
						<div class="flex items-center gap-2 mt-2">
							<StatusIndicator status={getTriageStatusVariant(data.health.bootTriageStatus)} />
							<span class="text-lg font-semibold"
								>{getTriageStatusLabel(data.health.bootTriageStatus)}</span
							>
						</div>
					</div>

					<div class="panel-glass p-4 animate-blur-fade-up">
						<p class="text-xs text-muted-foreground uppercase tracking-wide">Deacon Patrol</p>
						<div class="flex items-center gap-2 mt-2">
							<StatusIndicator status={getPatrolStatusVariant(data.health.deaconPatrolStatus)} />
							<span class="text-lg font-semibold"
								>{getPatrolStatusLabel(data.health.deaconPatrolStatus)}</span
							>
						</div>
					</div>

					<div class="panel-glass p-4 animate-blur-fade-up">
						<p class="text-xs text-muted-foreground uppercase tracking-wide">Active Hooks</p>
						<p class="text-2xl font-bold mt-2">{data.health.summary.activeHooks}</p>
					</div>
				</div>

				<!-- Daemon Heartbeat Section -->
				<section>
					<h2 class="text-lg font-semibold mb-3">Daemon Heartbeat</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
						{#each data.health.daemons as daemon}
							<div class="panel-glass p-4 animate-blur-fade-up">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<StatusIndicator status={getStatusVariant(daemon.status)} size="lg" />
										<div>
											<p class="font-medium">{daemon.name}</p>
											<p class="text-xs text-muted-foreground capitalize">{daemon.role}</p>
										</div>
									</div>
									<div class="text-right">
										<span
											class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {daemon.running
												? 'bg-status-online/10 text-status-online'
												: 'bg-status-offline/10 text-status-offline'}"
										>
											{daemon.running ? 'Running' : 'Stopped'}
										</span>
										{#if daemon.hasWork}
											<p class="text-xs text-muted-foreground mt-1">Processing work</p>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</section>

				<!-- Per-Rig Health Section -->
				<section>
					<h2 class="text-lg font-semibold mb-3">Rig Health</h2>
					<div class="space-y-4 stagger">
						{#each data.health.rigs as rig}
							<div class="panel-glass p-4 animate-blur-fade-up">
								<div class="flex items-center justify-between mb-4">
									<div class="flex items-center gap-3">
										<StatusIndicator status={getStatusVariant(rig.status)} size="lg" />
										<div>
											<p class="font-medium">{rig.name}</p>
											<p class="text-xs text-muted-foreground">
												{rig.activePolecats}/{rig.polecatCount} polecats active
											</p>
										</div>
									</div>
									<span
										class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {rig.status ===
										'healthy'
											? 'bg-status-online/10 text-status-online'
											: rig.status === 'degraded'
												? 'bg-status-pending/10 text-status-pending'
												: 'bg-status-offline/10 text-status-offline'}"
									>
										{getStatusLabel(rig.status)}
									</span>
								</div>

								<!-- Rig Agents -->
								<div class="grid grid-cols-2 gap-3 text-sm">
									<div class="flex items-center gap-2">
										<StatusIndicator status={getStatusVariant(rig.witnessStatus)} />
										<span class="text-muted-foreground">Witness</span>
										<span class="ml-auto {rig.witnessStatus === 'healthy' ? 'text-status-online' : 'text-status-offline'}">
											{rig.hasWitness ? getStatusLabel(rig.witnessStatus) : 'Not configured'}
										</span>
									</div>
									<div class="flex items-center gap-2">
										<StatusIndicator status={getStatusVariant(rig.refineryStatus)} />
										<span class="text-muted-foreground">Refinery</span>
										<span class="ml-auto {rig.refineryStatus === 'healthy' ? 'text-status-online' : 'text-status-offline'}">
											{rig.hasRefinery ? getStatusLabel(rig.refineryStatus) : 'Not configured'}
										</span>
									</div>
								</div>

								<!-- Dead Agents Warning -->
								{#if rig.deadAgents.length > 0}
									<div class="mt-3 p-2 rounded bg-status-offline/10 border border-status-offline/20">
										<p class="text-xs text-status-offline font-medium">
											Dead agents: {rig.deadAgents.join(', ')}
										</p>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>

				<!-- Summary Footer -->
				<footer class="panel-glass p-4">
					<div class="flex flex-wrap gap-6 text-sm text-muted-foreground">
						<div>
							<span class="font-medium text-foreground">{data.health.summary.totalRigs}</span> rigs
						</div>
						<div>
							<span class="font-medium text-foreground">{data.health.summary.totalPolecats}</span> polecats
						</div>
						<div>
							<span class="font-medium text-status-online">{data.health.summary.healthyRigs}</span> healthy
						</div>
						{#if data.health.summary.degradedRigs > 0}
							<div>
								<span class="font-medium text-status-pending"
									>{data.health.summary.degradedRigs}</span
								> degraded
							</div>
						{/if}
						{#if data.health.summary.offlineRigs > 0}
							<div>
								<span class="font-medium text-status-offline"
									>{data.health.summary.offlineRigs}</span
								> offline
							</div>
						{/if}
						<div class="ml-auto text-xs">
							Updated: {new Date(data.health.timestamp).toLocaleTimeString()}
						</div>
					</div>
				</footer>
			{:else}
				<div class="panel-glass p-6">
					<p class="text-muted-foreground">No health data available</p>
				</div>
			{/if}
		</main>
	</div>
</div>
