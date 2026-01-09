<script lang="ts">
	import { GridPattern, StatusIndicator } from '$lib/components';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const { data } = $props();

	const timeRanges = [
		{ value: 'today', label: 'Today' },
		{ value: '7d', label: '7 Days' },
		{ value: '30d', label: '30 Days' },
		{ value: 'all', label: 'All Time' }
	];

	let selectedRange = $derived($page.url.searchParams.get('range') || '7d');
	let selectedRig = $derived($page.url.searchParams.get('rig') || '');

	function updateFilter(key: string, value: string) {
		const url = new URL($page.url);
		if (value) {
			url.searchParams.set(key, value);
		} else {
			url.searchParams.delete(key);
		}
		goto(url.toString(), { replaceState: true });
	}

	function getMaxValue(arr: number[]): number {
		return Math.max(...arr, 1);
	}

	// Computed max values for charts
	let maxActivity = $derived(data.stats?.charts?.dailyActivity ? getMaxValue(data.stats.charts.dailyActivity.map((d: { active: number; idle: number }) => d.active + d.idle)) : 1);
	let maxVolume = $derived(data.stats?.charts?.hourlyVolume ? getMaxValue(data.stats.charts.hourlyVolume.map((h: { messages: number }) => h.messages)) : 1);

	function formatUptime(uptime: number): string {
		return `${uptime.toFixed(1)}%`;
	}

	function formatResponseTime(ms: number): string {
		return `${ms}ms`;
	}

	function getHealthColor(value: number, thresholds: { good: number; warn: number }): string {
		if (value >= thresholds.good) return 'text-status-online';
		if (value >= thresholds.warn) return 'text-status-pending';
		return 'text-status-offline';
	}

	function getErrorRateColor(rate: number): string {
		if (rate < 1) return 'text-status-online';
		if (rate < 5) return 'text-status-pending';
		return 'text-status-offline';
	}

	type VerificationStatus = 'pass' | 'warn' | 'fail';
	type VerificationOverallStatus = 'verified' | 'warning' | 'failed';

	function getVerificationIndicator(status: VerificationStatus): 'complete' | 'warning' | 'error' {
		if (status === 'pass') return 'complete';
		if (status === 'warn') return 'warning';
		return 'error';
	}

	function getVerificationTone(status: VerificationStatus): string {
		if (status === 'pass') return 'text-status-online';
		if (status === 'warn') return 'text-status-pending';
		return 'text-status-offline';
	}

	function getVerificationOverall(status: VerificationOverallStatus): {
		label: string;
		indicator: 'complete' | 'warning' | 'error';
	} {
		switch (status) {
			case 'verified':
				return { label: 'Verified', indicator: 'complete' };
			case 'warning':
				return { label: 'Needs Attention', indicator: 'warning' };
			case 'failed':
				return { label: 'Failed', indicator: 'error' };
		}
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
			<div class="container">
				<div class="flex items-center justify-between flex-wrap gap-4">
					<div>
						<h1 class="text-xl font-semibold text-foreground">Statistics</h1>
						<p class="text-sm text-muted-foreground">System-wide performance metrics</p>
					</div>

					<!-- Filters -->
					<div class="flex items-center gap-3 flex-wrap">
						<select
							class="panel-glass px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-background"
							value={selectedRange}
							onchange={(e) => updateFilter('range', e.currentTarget.value)}
						>
							{#each timeRanges as range}
								<option value={range.value}>{range.label}</option>
							{/each}
						</select>

						{#if data.stats?.filters.rigs}
							<select
								class="panel-glass px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-background"
								value={selectedRig}
								onchange={(e) => updateFilter('rig', e.currentTarget.value)}
							>
								<option value="">All Rigs</option>
								{#each data.stats.filters.rigs as rig}
									<option value={rig}>{rig}</option>
								{/each}
							</select>
						{/if}
					</div>
				</div>
			</div>
		</header>

		<main class="container py-6 space-y-6">
			{#if data.error}
				<div class="panel-glass p-6 border-status-offline/30">
					<p class="text-status-offline font-medium">Failed to load statistics</p>
					<p class="text-sm text-muted-foreground mt-1">{data.error}</p>
				</div>
			{:else if data.stats}
				<!-- Summary Cards -->
				<section>
					<h2 class="sr-only">Summary Statistics</h2>
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 stagger">
						<!-- Agents Card -->
						<div class="panel-glass p-4 animate-blur-fade-up">
							<p class="text-xs text-muted-foreground uppercase tracking-wide">Agents</p>
							<p class="text-2xl font-bold mt-1">{data.stats.summary.totalAgents}</p>
							<div class="flex items-center gap-2 mt-2 text-xs">
								<span class="flex items-center gap-1">
									<span class="w-2 h-2 rounded-full bg-status-online"></span>
									{data.stats.summary.activeAgents}
								</span>
								<span class="flex items-center gap-1">
									<span class="w-2 h-2 rounded-full bg-status-idle"></span>
									{data.stats.summary.idleAgents}
								</span>
								<span class="flex items-center gap-1">
									<span class="w-2 h-2 rounded-full bg-status-offline"></span>
									{data.stats.summary.deadAgents}
								</span>
							</div>
						</div>

						<!-- Rigs Card -->
						<div class="panel-glass p-4 animate-blur-fade-up">
							<p class="text-xs text-muted-foreground uppercase tracking-wide">Rigs</p>
							<p class="text-2xl font-bold mt-1">{data.stats.summary.totalRigs}</p>
							<p class="text-xs text-muted-foreground mt-2">Project containers</p>
						</div>

						<!-- Convoys Card -->
						<div class="panel-glass p-4 animate-blur-fade-up">
							<p class="text-xs text-muted-foreground uppercase tracking-wide">Convoys</p>
							<p class="text-2xl font-bold mt-1">{data.stats.summary.totalConvoys}</p>
							<div class="flex items-center gap-2 mt-2 text-xs">
								<span class="text-status-online">{data.stats.summary.activeConvoys} active</span>
								<span class="text-muted-foreground">{data.stats.summary.completedConvoys} done</span>
							</div>
						</div>

						<!-- Issues Card -->
						<div class="panel-glass p-4 animate-blur-fade-up">
							<p class="text-xs text-muted-foreground uppercase tracking-wide">Issues</p>
							<p class="text-2xl font-bold mt-1">{data.stats.summary.totalIssues}</p>
							<div class="flex items-center gap-2 mt-2 text-xs">
								<span class="text-status-pending">{data.stats.summary.openIssues} open</span>
								<span class="text-status-online">{data.stats.summary.closedIssues} closed</span>
							</div>
						</div>

						<!-- Messages Card -->
						<div class="panel-glass p-4 animate-blur-fade-up">
							<p class="text-xs text-muted-foreground uppercase tracking-wide">Messages Today</p>
							<p class="text-2xl font-bold mt-1">{data.stats.summary.messagesToday}</p>
							<p class="text-xs text-muted-foreground mt-2">Processed</p>
						</div>
					</div>
				</section>

				<!-- Health Indicators -->
				<section>
					<h2 class="text-lg font-semibold mb-3">System Health</h2>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
						<div class="panel-glass p-4 animate-blur-fade-up">
							<div class="flex items-center justify-between">
								<p class="text-sm text-muted-foreground">Uptime</p>
								<StatusIndicator status={data.stats.health.uptime >= 99 ? 'running' : data.stats.health.uptime >= 95 ? 'warning' : 'error'} />
							</div>
							<p class="text-3xl font-bold mt-2 {getHealthColor(data.stats.health.uptime, { good: 99, warn: 95 })}">
								{formatUptime(data.stats.health.uptime)}
							</p>
							<div class="mt-3 h-2 rounded-full bg-muted overflow-hidden">
								<div
									class="h-full rounded-full bg-status-online transition-all duration-500"
									style="width: {data.stats.health.uptime}%"
								></div>
							</div>
						</div>

						<div class="panel-glass p-4 animate-blur-fade-up">
							<div class="flex items-center justify-between">
								<p class="text-sm text-muted-foreground">Avg Response Time</p>
								<StatusIndicator status={data.stats.health.avgResponseTime < 300 ? 'running' : data.stats.health.avgResponseTime < 500 ? 'warning' : 'error'} />
							</div>
							<p class="text-3xl font-bold mt-2 {data.stats.health.avgResponseTime < 300 ? 'text-status-online' : data.stats.health.avgResponseTime < 500 ? 'text-status-pending' : 'text-status-offline'}">
								{formatResponseTime(data.stats.health.avgResponseTime)}
							</p>
							<div class="mt-3 h-2 rounded-full bg-muted overflow-hidden">
								<div
									class="h-full rounded-full bg-status-online transition-all duration-500"
									style="width: {Math.min((1 - data.stats.health.avgResponseTime / 1000) * 100, 100)}%"
								></div>
							</div>
						</div>

						<div class="panel-glass p-4 animate-blur-fade-up">
							<div class="flex items-center justify-between">
								<p class="text-sm text-muted-foreground">Error Rate</p>
								<StatusIndicator status={data.stats.health.errorRate < 1 ? 'running' : data.stats.health.errorRate < 5 ? 'warning' : 'error'} />
							</div>
							<p class="text-3xl font-bold mt-2 {getErrorRateColor(data.stats.health.errorRate)}">
								{data.stats.health.errorRate}%
							</p>
							<div class="mt-3 h-2 rounded-full bg-muted overflow-hidden">
								<div
									class="h-full rounded-full {data.stats.health.errorRate < 1 ? 'bg-status-online' : data.stats.health.errorRate < 5 ? 'bg-status-pending' : 'bg-status-offline'} transition-all duration-500"
									style="width: {Math.min(data.stats.health.errorRate * 10, 100)}%"
								></div>
							</div>
						</div>
					</div>
				</section>

				<!-- Performance Verification -->
				<section>
					<div class="flex items-center justify-between mb-3">
						<div>
							<h2 class="text-lg font-semibold">Performance Verification</h2>
							<p class="text-xs text-muted-foreground">
								Budgets: 16ms frames, 100ms interactions, 8ms paint, 250KB gzip
							</p>
						</div>
						<p class="text-xs text-muted-foreground">
							Last run {new Date(data.stats.performanceVerification.lastVerified).toLocaleTimeString()}
						</p>
					</div>
					<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div class="panel-glass p-4 animate-blur-fade-up">
							<div class="flex items-center justify-between">
								<p class="text-sm text-muted-foreground">Verification Status</p>
								<StatusIndicator
									status={getVerificationOverall(data.stats.performanceVerification.status).indicator}
									size="lg"
								/>
							</div>
							<p class="text-2xl font-semibold mt-2">
								{getVerificationOverall(data.stats.performanceVerification.status).label}
							</p>
							<div class="mt-3">
								<div class="flex items-center justify-between text-xs text-muted-foreground">
									<span>Confidence score</span>
									<span>{data.stats.performanceVerification.score}%</span>
								</div>
								<div class="mt-2 h-2 rounded-full bg-muted overflow-hidden">
									<div
										class="h-full rounded-full bg-status-online transition-all duration-500"
										style="width: {data.stats.performanceVerification.score}%"
									></div>
								</div>
							</div>
							<div class="mt-4 text-xs text-muted-foreground flex items-center justify-between">
								<span>Next check</span>
								<span>{new Date(data.stats.performanceVerification.nextScheduled).toLocaleTimeString()}</span>
							</div>
						</div>

						<div class="panel-glass p-4 lg:col-span-2 animate-blur-fade-up">
							<div class="flex items-center justify-between mb-3">
								<h3 class="text-sm font-medium">Verification Checks</h3>
								<span class="text-xs text-muted-foreground">
									{data.stats.performanceVerification.checks.length} checks
								</span>
							</div>
							<div class="space-y-4">
								{#each data.stats.performanceVerification.checks as check}
									<div class="space-y-2">
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-3">
												<StatusIndicator status={getVerificationIndicator(check.status)} />
												<div>
													<p class="text-sm font-medium">{check.name}</p>
													<p class="text-xs text-muted-foreground">
														Target {check.target}
													</p>
												</div>
											</div>
											<div class="text-right">
												<p class="text-sm font-semibold {getVerificationTone(check.status)}">
													{check.current}
												</p>
												{#if check.note}
													<p class="text-xs text-muted-foreground">{check.note}</p>
												{/if}
											</div>
										</div>
										<div class="h-2 rounded-full bg-muted overflow-hidden">
											<div
												class="h-full rounded-full transition-all duration-500 {check.status === 'pass'
													? 'bg-status-online'
													: check.status === 'warn'
														? 'bg-status-pending'
														: 'bg-status-offline'}"
												style="width: {check.confidence}%"
											></div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</section>

				<!-- Charts Section -->
				<section>
					<h2 class="text-lg font-semibold mb-3">Activity Charts</h2>
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<!-- Daily Activity Chart -->
						<div class="panel-glass p-4 animate-blur-fade-up">
							<h3 class="text-sm font-medium mb-4">Agent Activity (Last 7 Days)</h3>
							<div class="flex items-end gap-2 h-40">
								{#each data.stats.charts.dailyActivity as day}
									<div class="flex-1 flex flex-col items-center gap-1">
										<div class="w-full flex flex-col-reverse gap-0.5" style="height: 120px">
											<div
												class="w-full bg-status-online rounded-t transition-all duration-500"
												style="height: {(day.active / maxActivity) * 100}%"
												title="{day.active} active"
											></div>
											<div
												class="w-full bg-status-idle rounded-t transition-all duration-500"
												style="height: {(day.idle / maxActivity) * 100}%"
												title="{day.idle} idle"
											></div>
										</div>
										<span class="text-xs text-muted-foreground">{day.label}</span>
									</div>
								{/each}
							</div>
							<div class="flex items-center gap-4 mt-4 text-xs">
								<span class="flex items-center gap-1">
									<span class="w-3 h-3 rounded bg-status-online"></span>
									Active
								</span>
								<span class="flex items-center gap-1">
									<span class="w-3 h-3 rounded bg-status-idle"></span>
									Idle
								</span>
							</div>
						</div>

						<!-- Issue Completion Rate -->
						<div class="panel-glass p-4 animate-blur-fade-up">
							<h3 class="text-sm font-medium mb-4">Issue Completion Rate</h3>
							<div class="flex items-center justify-center h-40">
								<div class="relative w-32 h-32">
									<!-- Background circle -->
									<svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
										<circle
											cx="50"
											cy="50"
											r="40"
											fill="none"
											stroke="hsl(var(--muted))"
											stroke-width="12"
										/>
										<circle
											cx="50"
											cy="50"
											r="40"
											fill="none"
											stroke="hsl(var(--status-online))"
											stroke-width="12"
											stroke-linecap="round"
											stroke-dasharray="{data.stats.charts.issueCompletion.rate * 2.51} 251"
											class="transition-all duration-1000"
										/>
									</svg>
									<div class="absolute inset-0 flex items-center justify-center flex-col">
										<span class="text-2xl font-bold">{data.stats.charts.issueCompletion.rate}%</span>
										<span class="text-xs text-muted-foreground">completed</span>
									</div>
								</div>
							</div>
							<div class="flex items-center justify-center gap-6 mt-4 text-sm">
								<span class="flex items-center gap-2">
									<span class="w-3 h-3 rounded bg-status-online"></span>
									{data.stats.charts.issueCompletion.completed} closed
								</span>
								<span class="flex items-center gap-2">
									<span class="w-3 h-3 rounded bg-muted"></span>
									{data.stats.charts.issueCompletion.open} open
								</span>
							</div>
						</div>

						<!-- Hourly Message Volume -->
						<div class="panel-glass p-4 lg:col-span-2 animate-blur-fade-up">
							<h3 class="text-sm font-medium mb-4">Message Volume by Hour</h3>
							<div class="flex items-end gap-1 h-32 overflow-x-auto pb-2">
								{#each data.stats.charts.hourlyVolume as hour}
									<div class="flex flex-col items-center gap-1 min-w-[20px]">
										<div
											class="w-4 bg-primary/80 rounded-t transition-all duration-300 hover:bg-primary"
											style="height: {(hour.messages / maxVolume) * 100}px"
											title="{hour.messages} messages at {hour.label}"
										></div>
										{#if hour.hour % 4 === 0}
											<span class="text-[10px] text-muted-foreground">{hour.label}</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>
				</section>

				<!-- Leaderboards -->
				<section>
					<h2 class="text-lg font-semibold mb-3">Leaderboards</h2>
					<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<!-- Most Active Agents -->
						<div class="panel-glass p-4 animate-blur-fade-up">
							<h3 class="text-sm font-medium mb-3">Most Active Agents</h3>
							<div class="space-y-3">
								{#each data.stats.leaderboards.mostActiveAgents as agent, i}
									<div class="flex items-center gap-3">
										<span class="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
											{i + 1}
										</span>
										<div class="flex-1 min-w-0">
											<p class="font-medium text-sm truncate">{agent.name}</p>
											<p class="text-xs text-muted-foreground">{agent.role}</p>
										</div>
										<div class="text-right">
											<p class="text-sm font-semibold">{agent.tasksCompleted}</p>
											<p class="text-xs text-muted-foreground">tasks</p>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- Fastest Convoys -->
						<div class="panel-glass p-4 animate-blur-fade-up">
							<h3 class="text-sm font-medium mb-3">Fastest Convoys</h3>
							<div class="space-y-3">
								{#each data.stats.leaderboards.fastestConvoys as convoy, i}
									<div class="flex items-center gap-3">
										<span class="w-6 h-6 rounded-full bg-status-online/10 text-status-online text-xs font-bold flex items-center justify-center">
											{i + 1}
										</span>
										<div class="flex-1 min-w-0">
											<p class="font-medium text-sm truncate">{convoy.name}</p>
											<p class="text-xs text-muted-foreground">by {convoy.agent}</p>
										</div>
										<div class="text-right">
											<p class="text-sm font-semibold">{convoy.completionTime}m</p>
											<p class="text-xs text-muted-foreground">{convoy.tasksCompleted} tasks</p>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- Top Issue Closers -->
						<div class="panel-glass p-4 animate-blur-fade-up">
							<h3 class="text-sm font-medium mb-3">Top Issue Closers</h3>
							<div class="space-y-3">
								{#each data.stats.leaderboards.topIssueClosers as closer, i}
									<div class="flex items-center gap-3">
										<span class="w-6 h-6 rounded-full bg-status-pending/10 text-status-pending text-xs font-bold flex items-center justify-center">
											{i + 1}
										</span>
										<div class="flex-1 min-w-0">
											<p class="font-medium text-sm truncate">{closer.name}</p>
											<p class="text-xs text-muted-foreground">avg {closer.avgTimeToClose}h</p>
										</div>
										<div class="text-right">
											<p class="text-sm font-semibold">{closer.closed}</p>
											<p class="text-xs text-muted-foreground">closed</p>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</section>

				<!-- Footer -->
				<footer class="panel-glass p-4">
					<div class="flex items-center justify-between text-sm text-muted-foreground">
						<span>Statistics for {data.stats.filters.rigs.length} rigs</span>
						<span>Updated: {new Date(data.stats.timestamp).toLocaleTimeString()}</span>
					</div>
				</footer>
			{:else}
				<div class="panel-glass p-6">
					<p class="text-muted-foreground">No statistics available</p>
				</div>
			{/if}
		</main>
	</div>
</div>
