<script context="module" lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';

	/**
	 * AgentCard variant definitions using tailwind-variants
	 * Enhanced for mobile with rich interactions and expandable details
	 */
	export const agentCardVariants = tv({
		slots: {
<<<<<<< HEAD
<<<<<<< HEAD
			card: 'bg-card text-card-foreground border border-border rounded-lg shadow-sm transition-all duration-200 hover:shadow-lg hover:border-accent/50 overflow-hidden',
=======
			card: 'bg-card/80 backdrop-blur-xl border border-border rounded-lg shadow-sm transition-all duration-200 hover:shadow-lg hover:border-accent/50 overflow-hidden',
>>>>>>> polecat/cheedo-mk1qula2
=======
			card: 'panel-glass transition-all duration-200 hover:shadow-lg hover:border-accent/50 overflow-hidden',
>>>>>>> polecat/furiosa-mk1ppoio
			hero: 'flex items-center justify-center p-4 bg-gradient-to-br',
			heroIcon: 'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md',
			content: 'p-4 space-y-3',
			header: 'flex items-center justify-between gap-3',
			badge: 'px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide',
			details: 'overflow-hidden transition-all duration-300 ease-out',
			actions: 'flex gap-2 pt-3 border-t border-border/50',
			actionBtn: 'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 min-h-[44px]'
		},
		variants: {
			status: {
				running: {
					card: 'border-status-online/30',
					hero: 'from-status-online/10 to-status-online/5',
					heroIcon: 'bg-status-online/20 text-status-online',
					badge: 'bg-status-online/15 text-status-online'
				},
				idle: {
					card: 'border-status-idle/30',
					hero: 'from-status-idle/10 to-status-idle/5',
					heroIcon: 'bg-status-idle/20 text-status-idle',
					badge: 'bg-status-idle/15 text-status-idle'
				},
				error: {
					card: 'border-status-offline/50 shadow-[0_0_20px_-5px_hsl(var(--status-offline)/0.3)] animate-shake',
					hero: 'from-status-offline/15 to-status-offline/5',
					heroIcon: 'bg-status-offline/25 text-status-offline animate-pulse',
					badge: 'bg-status-offline/20 text-status-offline animate-pulse'
				},
				complete: {
					card: 'border-status-online/30',
					hero: 'from-status-online/10 to-status-online/5',
					heroIcon: 'bg-status-online/20 text-status-online',
					badge: 'bg-status-online/15 text-status-online'
				}
			},
			expanded: {
				true: { details: 'max-h-96 opacity-100' },
				false: { details: 'max-h-0 opacity-0' }
			},
			compact: {
				true: { hero: 'hidden', content: 'p-3' },
				false: {}
			}
		},
		defaultVariants: {
			status: 'idle',
			expanded: false,
			compact: false
		}
	});

	/**
	 * Props type derived from variant definitions
	 */
	export type AgentCardProps = VariantProps<typeof agentCardVariants> & {
		name: string;
		task?: string;
		meta?: string;
		progress?: number;
		class?: string;
		// Mobile-rich props
		icon?: string;
		uptime?: string;
		errorMessage?: string;
		expandable?: boolean;
		onInspect?: () => void;
		onReboot?: () => void;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import StatusIndicator from './StatusIndicator.svelte';
	import ProgressBar from './ProgressBar.svelte';

	// Component props
	let {
		name,
		status = 'idle',
		task = '',
		meta = '',
		progress = 0,
		class: className = '',
		// Mobile-rich props
		icon = '',
		uptime = '',
		errorMessage = '',
		expandable = false,
		compact = false,
		onInspect,
		onReboot
	}: AgentCardProps = $props();

	// Expandable state
	let isExpanded = $state(false);

	// Derived styles
	const styles = $derived(agentCardVariants({ status, expanded: isExpanded, compact }));

	// Map status to StatusIndicator status type
	const statusIndicatorMap = {
		running: 'running',
		idle: 'idle',
		error: 'error',
		complete: 'complete'
	} as const;

	// Map status to ProgressBar color
	const progressColorMap = {
		running: 'default',
		idle: 'default',
		error: 'error',
		complete: 'success'
	} as const;

	// Status label mapping
	const statusLabels = {
		running: 'Running',
		idle: 'Idle',
		error: 'Error',
		complete: 'Complete'
	} as const;

	// Default icons by status
	const defaultIcons = {
		running: '⚡',
		idle: '💤',
		error: '⚠️',
		complete: '✅'
	} as const;

	// Get display icon
	const displayIcon = $derived(icon || defaultIcons[status ?? 'idle']);

	// Toggle expanded state
	function toggleExpanded() {
		if (expandable) {
			isExpanded = !isExpanded;
		}
	}

	// Handle keyboard for expansion
	function handleKeyDown(e: KeyboardEvent) {
		if (expandable && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			toggleExpanded();
		}
	}
</script>

<article
	class={cn(styles.card(), className)}
	role={expandable ? 'button' : undefined}
	tabindex={expandable ? 0 : undefined}
	aria-expanded={expandable ? isExpanded : undefined}
	onclick={expandable ? toggleExpanded : undefined}
	onkeydown={expandable ? handleKeyDown : undefined}
>
	<!-- Hero Section with Icon -->
	{#if !compact}
		<div class={styles.hero()}>
			<div class={styles.heroIcon()}>
				{displayIcon}
			</div>
		</div>
	{/if}

	<div class={styles.content()}>
		<!-- Header: Name + Status Badge -->
		<header class={styles.header()}>
			<div class="flex items-center gap-2 min-w-0">
				<StatusIndicator status={statusIndicatorMap[status ?? 'idle']} size="md" />
				<h3 class="font-medium text-foreground truncate">{name}</h3>
			</div>
			<div class="flex items-center gap-2 flex-shrink-0">
				<span class={styles.badge()}>
					{statusLabels[status ?? 'idle']}
				</span>
				{#if expandable}
					<svg
						class="w-4 h-4 text-muted-foreground transition-transform duration-200"
						class:rotate-180={isExpanded}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				{/if}
			</div>
		</header>

		<!-- Body: Task + Metadata -->
		{#if task || meta || uptime}
			<div class="space-y-2">
				{#if task}
					<p class="text-sm text-foreground/80 line-clamp-2">{task}</p>
				{/if}
				<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
					{#if meta}
						<span class="flex items-center gap-1">
							<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
							{meta}
						</span>
					{/if}
					{#if uptime}
						<span class="flex items-center gap-1">
							<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{uptime}
						</span>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Error Message (prominent for error state) -->
		{#if status === 'error' && errorMessage}
			<div class="p-3 rounded-lg bg-status-offline/10 border border-status-offline/20">
				<p class="text-sm text-status-offline font-medium flex items-start gap-2">
					<svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					{errorMessage}
				</p>
			</div>
		{/if}

		<!-- Progress Bar -->
		{#if status === 'running' && progress > 0}
			<div class="pt-1">
				<ProgressBar
					value={progress}
					size="sm"
					color={progressColorMap[status ?? 'idle']}
				/>
			</div>
		{/if}

		<!-- Expandable Details Section -->
		{#if expandable}
			<div class={styles.details()}>
				{#if isExpanded}
					<!-- Quick Actions -->
					{#if onInspect || onReboot}
						<div class={styles.actions()}>
							{#if onInspect}
								<button
									type="button"
									class={cn(styles.actionBtn(), 'bg-secondary hover:bg-secondary/80 text-secondary-foreground')}
									onclick={(e) => { e.stopPropagation(); onInspect?.(); }}
								>
									<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
									Inspect
								</button>
							{/if}
							{#if onReboot}
								<button
									type="button"
									class={cn(
										styles.actionBtn(),
										status === 'error'
											? 'bg-status-offline/15 hover:bg-status-offline/25 text-status-offline'
											: 'bg-primary/10 hover:bg-primary/20 text-primary'
									)}
									onclick={(e) => { e.stopPropagation(); onReboot?.(); }}
								>
									<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
									Reboot
								</button>
							{/if}
						</div>
					{/if}

					<!-- Custom expanded content slot -->
					{#if $$slots.expanded}
						<div class="pt-3">
							<slot name="expanded" />
						</div>
					{/if}
				{/if}
			</div>
		{/if}

		<!-- Legacy actions slot (non-expandable cards) -->
		{#if !expandable && $$slots.actions}
			<div class="flex items-center gap-1 pt-2">
				<slot name="actions" />
			</div>
		{/if}
	</div>

	<!-- Custom content slot -->
	{#if $$slots.default}
		<div class="px-4 pb-4 pt-2 border-t border-border/50">
			<slot />
		</div>
	{/if}
</article>
