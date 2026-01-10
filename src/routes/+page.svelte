<script lang="ts">
	import { DashboardLayout, AgentCard, StatsCard, EmptyState, Button, CircularProgress } from '$lib/components';
	import { Clock, CheckCircle, Zap, Layers, TrendingUp, Package } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	// Use $derived to track data changes (from navigation/invalidation)
	// Note: Variable names avoid collision with snippet names
	const agentsList = $derived(data.agents);
	const statsData = $derived(data.stats);
	const systemStatus = $derived(data.systemStatus);
	const error = $derived(data.error);

	// Mock workflow and queue data (would come from API in real app)
	const workflowsList = $derived([
		{ id: '1', name: 'Deploy Pipeline', status: 'running', progress: 65 },
		{ id: '2', name: 'Test Suite', status: 'pending', progress: 0 },
		{ id: '3', name: 'Build Assets', status: 'completed', progress: 100 }
	]);

	const queueItems = $derived([
		{ id: '1', task: 'Process batch #1234', priority: 'high' },
		{ id: '2', task: 'Sync database', priority: 'medium' },
		{ id: '3', task: 'Generate reports', priority: 'low' }
	]);

	const logEntries = $derived([
		{ id: '1', message: 'Agent nux completed task', time: '2m ago', level: 'info' },
		{ id: '2', message: 'Workflow deploy started', time: '5m ago', level: 'info' },
		{ id: '3', message: 'Queue item processed', time: '8m ago', level: 'success' },
		{ id: '4', message: 'Agent furiosa restarted', time: '12m ago', level: 'warning' }
	]);
</script>

<DashboardLayout title="GASTOWN" {systemStatus}>
	<!-- Left Column: Agents -->
	{#snippet agents()}
		{#if error}
			<EmptyState
				preset="error"
				title="Failed to load agents"
				description={error}
				actionLabel="Retry"
				size="sm"
			/>
		{:else if agentsList.length === 0}
			<EmptyState
				preset="no-data"
				title="No agents running"
				description="Start an agent to see it here"
				size="sm"
			/>
		{:else}
			{#each agentsList as agent (agent.id)}
				<AgentCard
					name={agent.name}
					task={agent.task}
					status={agent.status}
					progress={agent.progress}
					meta={agent.meta}
					role={agent.role === 'polecat' ? 'crew' : (agent.role as any)}
					compact
				/>
			{/each}
		{/if}
	{/snippet}

	<!-- Center Column: Workflows -->
	{#snippet workflows()}
		{#each workflowsList as workflow (workflow.id)}
			<div 
				class="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors cursor-pointer group"
				role="button"
				tabindex="0"
				onclick={() => goto(`/workflows/${workflow.id}`)}
				onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto(`/workflows/${workflow.id}`)}
				aria-label="View {workflow.name} workflow"
			>
				<div class="flex items-center gap-3 min-w-0 flex-1">
					<span class="text-sm font-medium text-foreground truncate">{workflow.name}</span>
				</div>
				
				<!-- Circular Progress Indicator -->
				<div class="flex items-center gap-3 flex-shrink-0">
					<div class="text-right">
						{#if workflow.status === 'running'}
							<span class="text-xs text-muted-foreground block">{workflow.progress}%</span>
							<span class="text-xs text-muted-foreground text-muted-foreground/70">Running</span>
						{:else if workflow.status === 'completed'}
							<span class="text-xs text-success block">Complete</span>
						{:else}
							<span class="text-xs text-warning block">Pending</span>
						{/if}
					</div>
					
					<CircularProgress 
						progress={workflow.progress}
						diameter={32}
						status={workflow.status as 'pending' | 'running' | 'completed'}
						icon={workflow.status === 'pending' ? Clock : workflow.status === 'completed' ? CheckCircle : undefined}
						ariaLabel="{workflow.name} progress: {workflow.progress}%"
					/>
				</div>
			</div>
		{/each}
	{/snippet}

	<!-- Center Column: Queue -->
	{#snippet queue()}
		{#each queueItems as item (item.id)}
			<div class="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
				<span class="text-sm text-foreground truncate">{item.task}</span>
				<span
					class="text-2xs font-bold uppercase px-2 py-0.5 rounded {item.priority === 'high' ? 'bg-destructive/20 text-destructive' : item.priority === 'medium' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'}"
				>
					{item.priority}
				</span>
			</div>
		{/each}
	{/snippet}

	<!-- Right Column: Stats -->
	{#snippet stats()}
		<button
			type="button"
			onclick={() => goto('/agents')}
			class="w-full text-left hover:opacity-100 transition-opacity"
		>
			<StatsCard
				label="Active Agents"
				value={statsData.activeAgents}
				icon={Zap}
				trend="up"
				trendValue={12}
				comparisonText="from yesterday"
				sparklineData={[3, 4, 3, 5, 4, 6, statsData.activeAgents]}
			/>
		</button>
		<button
			type="button"
			onclick={() => goto('/work')}
			class="w-full text-left hover:opacity-100 transition-opacity"
		>
			<StatsCard
				label="Tasks Running"
				value={statsData.tasksRunning}
				icon={Layers}
				trend="neutral"
			/>
		</button>
		<button
			type="button"
			onclick={() => goto('/queue')}
			class="w-full text-left hover:opacity-100 transition-opacity"
		>
			<StatsCard
				label="Polecats"
				value={statsData.queueDepth}
				icon={Package}
				trend={statsData.queueDepth > 5 ? 'up' : 'down'}
				trendValue={statsData.queueDepth > 5 ? 8 : -3}
			/>
		</button>
		<button
			type="button"
			onclick={() => goto('/activity')}
			class="w-full text-left hover:opacity-100 transition-opacity"
		>
			<StatsCard
				label="Completed Today"
				value={statsData.completedToday}
				icon={TrendingUp}
				trend="up"
				trendValue={25}
				comparisonText="from yesterday"
			/>
		</button>
	{/snippet}

	<!-- Right Column: Actions -->
	{#snippet actions()}
		<Button variant="primary" fullWidth>
			Create Agent
		</Button>
		<Button variant="ghost" fullWidth>
			View All Logs
		</Button>
		<Button variant="ghost" fullWidth>
			System Settings
		</Button>
	{/snippet}

	<!-- Bottom: Logs -->
	{#snippet logs()}
		{#each logEntries as log (log.id)}
			<div class="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
				<div class="flex items-center gap-3 min-w-0">
					<span
						class="w-1.5 h-1.5 rounded-full {log.level === 'success' ? 'bg-success' : log.level === 'warning' ? 'bg-warning' : log.level === 'error' ? 'bg-destructive' : 'bg-info'}"
						aria-hidden="true"
					></span>
					<span class="text-sm text-foreground truncate">{log.message}</span>
				</div>
				<span class="text-xs text-muted-foreground flex-shrink-0">{log.time}</span>
			</div>
		{/each}
	{/snippet}
</DashboardLayout>
