<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { GridPattern, PageHeader, Button, SkeletonCard, ActivityFeed } from '$lib/components';
	import StatusCards from '$lib/components/StatusCards.svelte';
	import QuickActions from '$lib/components/QuickActions.svelte';
	import { RefreshCw, Server, Users, Layers, Package, HeartPulse, Plus, ClipboardList } from 'lucide-svelte';
	import { hapticSuccess, hapticError } from '$lib/utils/haptics';

	interface RigSnapshot {
		name: string;
		status: 'active' | 'idle';
		polecats: number;
		has_witness: boolean;
		has_refinery: boolean;
		active_work: number;
	}

	interface PolecatSnapshot {
		id: string;
		name: string;
		role: string;
		rig: string;
		status: 'running' | 'idle';
		has_work: boolean;
		task?: string;
	}

	interface ConvoySnapshot {
		id: string;
		title: string;
		status: string;
		priority: number;
		issue_count?: number;
	}

	interface ActivitySnapshot {
		id: string;
		title: string;
		type: string;
		status: string;
		updated_at: string;
	}

	interface MailSummary {
		unread: number;
		total: number;
	}

	interface QueueSummary {
		pending: number;
		inProgress: number;
		total: number;
	}

	interface GasTownSnapshot {
		rigs: RigSnapshot[];
		polecats: PolecatSnapshot[];
		convoys: ConvoySnapshot[];
		recent_activity: ActivitySnapshot[];
		mail: MailSummary;
		queue: QueueSummary;
		health: 'healthy' | 'degraded' | 'unhealthy';
		fetchedAt: string;
		timestamp: string;
	}

	let snapshot = $state<GasTownSnapshot | null>(null);
	let loading = $state(true);
	let isRefreshing = $state(false);
	let error = $state<string | null>(null);
	let doctorRunning = $state(false);

	async function fetchSnapshot(options: { silent?: boolean; manual?: boolean } = {}) {
		const { silent = false, manual = false } = options;
		const shouldShowLoader = !silent || !snapshot;

		if (shouldShowLoader) {
			loading = true;
		}
		if (manual) {
			isRefreshing = true;
		}
		error = null;

		try {
			const res = await fetch('/api/gastown/snapshot');
			if (!res.ok) {
				throw new Error(await res.text());
			}
			snapshot = await res.json();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			if (shouldShowLoader) {
				loading = false;
			}
			if (manual) {
				isRefreshing = false;
			}
		}
	}

	function startAutoRefresh() {
		const interval = setInterval(() => {
			fetchSnapshot({ silent: true });
		}, 10000);
		return () => clearInterval(interval);
	}

	function handleAddRig() {
		goto('/rigs');
	}

	function handleNewWork() {
		goto('/work');
	}

	async function handleRunDoctor() {
		if (doctorRunning) return;
		doctorRunning = true;
		try {
			const res = await fetch('/api/gastown/diagnostics?refresh=true');
			if (!res.ok) {
				throw new Error(await res.text());
			}
			hapticSuccess();
		} catch (e) {
			hapticError();
			error = e instanceof Error ? e.message : 'Failed to run diagnostics';
		} finally {
			doctorRunning = false;
		}
	}

	const statusCounts = $derived.by(() => {
		if (!snapshot) {
			return { rigs: 0, agents: 0, mail: 0, queue: 0 };
		}
		return {
			rigs: snapshot.rigs.length,
			agents: snapshot.polecats.length,
			mail: snapshot.mail.unread,
			queue: snapshot.queue.total
		};
	});

	const activityEvents = $derived.by(() => {
		if (!snapshot) return [];
		return snapshot.recent_activity.map((item) => ({
			id: item.id,
			timestamp: item.updated_at,
			type: item.type || 'activity',
			actor: 'System',
			actorDisplay: 'System',
			description: item.title,
			icon: item.type === 'task' ? 'check-circle' : 'activity'
		}));
	});

	const operationActivities = $derived.by(() => {
		if (!snapshot) return [];
		return snapshot.recent_activity.map((item) => {
			const level: 'success' | 'info' | 'warning' | 'error' = item.status === 'completed'
				? 'success'
				: item.status === 'in_progress'
					? 'info'
					: item.status === 'failed'
						? 'error'
						: 'warning';
			return {
				id: item.id,
				message: item.title,
				timestamp: item.updated_at,
				level
			};
		});
	});

	const operationMetrics = $derived.by(() => {
		if (!snapshot) return [];
		const activePolecats = snapshot.polecats.filter((p) => p.has_work).length;
		const hasDegradedRig = snapshot.rigs.some((rig) => !rig.has_witness || !rig.has_refinery);
		const polecatStatus: 'success' | 'warning' | 'neutral' | 'error' = activePolecats > 0 ? 'success' : 'neutral';
		const queueStatus: 'success' | 'warning' | 'neutral' | 'error' = snapshot.queue.pending > 0 ? 'warning' : 'success';
		const convoyStatus: 'success' | 'warning' | 'neutral' | 'error' = snapshot.convoys.length > 0 ? 'neutral' : 'success';
		const rigStatus: 'success' | 'warning' | 'neutral' | 'error' = hasDegradedRig ? 'warning' : 'success';
		return [
			{ label: 'Active Polecats', value: activePolecats, status: polecatStatus, icon: Users },
			{ label: 'Queue Depth', value: snapshot.queue.total, status: queueStatus, icon: Package },
			{ label: 'Convoys', value: snapshot.convoys.length, status: convoyStatus, icon: Layers },
			{ label: 'Rigs', value: snapshot.rigs.length, status: rigStatus, icon: Server }
		];
	});

	const operationActions = $derived([
		{ id: 'add-rig', label: 'Add Rig', icon: Plus, variant: 'primary' as const, action: handleAddRig },
		{ id: 'new-work', label: 'New Work Item', icon: ClipboardList, variant: 'secondary' as const, action: handleNewWork },
		{ id: 'run-doctor', label: doctorRunning ? 'Running Doctor' : 'Run Doctor', icon: HeartPulse, variant: 'secondary' as const, action: handleRunDoctor, disabled: doctorRunning }
	]);

	const systemStatus = $derived.by(() => {
		if (!snapshot) return 'degraded';
		return snapshot.health === 'healthy' ? 'healthy' : snapshot.health === 'unhealthy' ? 'critical' : 'degraded';
	});

	onMount(() => {
		fetchSnapshot();
		return startAutoRefresh();
	});
</script>

<svelte:head>
	<title>Dashboard - Gas Town</title>
</svelte:head>

<div class="relative min-h-screen bg-background" data-testid="dashboard">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<PageHeader
			title="Dashboard"
			subtitle="System health, recent activity, and quick actions"
			showAccentBar={true}
		>
			{#snippet actions()}
				<Button
					variant="secondary"
					size="sm"
					onclick={() => fetchSnapshot({ manual: true })}
					loading={isRefreshing}
					disabled={loading}
					data-testid="refresh-btn"
				>
					{#snippet iconLeft()}
						<RefreshCw class="w-4 h-4" />
					{/snippet}
					{isRefreshing ? 'Refreshing...' : 'Refresh'}
				</Button>
			{/snippet}
		</PageHeader>

		<main class="container py-6 space-y-6">
			{#if error}
				<div
					class="panel-glass p-4 border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-3"
					role="alert"
					data-testid="dashboard-error"
				>
					<p class="text-sm text-destructive">{error}</p>
					<Button variant="outline" size="sm" onclick={() => fetchSnapshot({ manual: true })}>
						Retry
					</Button>
				</div>
			{/if}

			{#if snapshot}
				<section class="space-y-3" data-testid="status-cards">
					<StatusCards
						rigs={statusCounts.rigs}
						agents={statusCounts.agents}
						mail={statusCounts.mail}
						queue={statusCounts.queue}
					/>
				</section>

				<section class="space-y-3" data-testid="quick-actions">
					<h2 class="text-lg font-semibold text-foreground">Quick Actions</h2>
					<QuickActions
						onAddRig={handleAddRig}
						onNewWork={handleNewWork}
						onRunDoctor={handleRunDoctor}
						doctorRunning={doctorRunning}
					/>
				</section>

				<section class="space-y-3" data-testid="activity-feed">
					<h2 class="text-lg font-semibold text-foreground">Recent Activity</h2>
					<div class="panel-glass p-4">
						<ActivityFeed events={activityEvents} limit={12} />
					</div>
				</section>

			{:else if loading}
				<section class="space-y-4">
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
						<SkeletonCard type="stat" count={4} />
					</div>
					<div class="panel-glass p-4">
						<SkeletonCard type="work" count={3} />
					</div>
				</section>
			{/if}
		</main>
	</div>
</div>
