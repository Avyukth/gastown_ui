<script module lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';

	/**
	 * AgentCard variant definitions using tailwind-variants
	 * Enhanced for mobile with rich interactions and expandable details
	 *
	 * Design tokens used:
	 * - Typography: label-sm for badges, body-sm for content
	 * - Shadows: elevation system + colored glows
	 * - Animations: ease-spring for expand, ease-out-expo for hover
	 * - Gradients: gradient-surface-subtle for hero depth
	 */
	export const agentCardVariants = tv({
		slots: {
			card: [
				'panel-glass overflow-hidden border-l-4 border-l-transparent',
				'transition-all duration-normal ease-out-expo',
				'hover:shadow-elevation-3 hover:border-accent/40 hover:-translate-y-0.5',
				// Touch optimizations: ripple effect + press state scale(0.98)
				'touch-ripple active:scale-[0.98]'
			].join(' '),
			hero: [
				'relative flex items-center justify-center p-6',
				'bg-gradient-to-br gradient-surface-subtle'
			].join(' '),
			heroIcon: [
				'w-14 h-14 rounded-2xl',
				'flex items-center justify-center',
				'shadow-elevation-2 gradient-shine',
				'transition-transform duration-normal ease-out-expo'
			].join(' '),
			content: 'p-4 space-y-3',
			header: 'flex items-center justify-between gap-3',
			badge: [
				'inline-flex items-center gap-1.5',
				'px-2.5 py-1 rounded-full',
				'text-label-sm uppercase tracking-wide'
			].join(' '),
			badgeDot: 'w-1.5 h-1.5 rounded-full',
			details: 'overflow-hidden transition-all duration-slow ease-spring',
			actions: 'flex gap-2 pt-3 border-t border-border/50',
			actionBtn: [
				'flex-1 flex items-center justify-center gap-2',
				'px-3 py-2.5 rounded-lg',
				'text-label-md font-medium',
				'transition-all duration-fast ease-out-expo',
				// Touch optimizations: 56px min height, scale(0.98) press state
				'active:scale-[0.98] min-h-14'
			].join(' '),
			progressWrapper: 'flex items-center gap-3',
			progressLabel: 'text-label-sm tabular-nums text-muted-foreground min-w-[3ch]'
		},
		variants: {
			status: {
				running: {
					card: 'border-status-online/30 hover:shadow-glow-success',
					hero: 'from-status-online/10 to-status-online/5',
					heroIcon: 'bg-status-online/20 text-status-online',
					badge: 'bg-status-online/15 text-status-online',
					badgeDot: 'bg-status-online animate-pulse'
				},
				idle: {
					card: 'border-status-idle/30',
					hero: 'from-status-idle/10 to-status-idle/5',
					heroIcon: 'bg-status-idle/20 text-status-idle',
					badge: 'bg-status-idle/15 text-status-idle',
					badgeDot: 'bg-status-idle'
				},
				error: {
					card: [
						'border-status-offline/60',
						'shadow-glow-destructive',
						'animate-[pulse-status_2s_ease-in-out_infinite]'
					].join(' '),
					hero: 'from-status-offline/15 to-status-offline/5',
					heroIcon: 'bg-status-offline/25 text-status-offline',
					badge: 'bg-status-offline/20 text-status-offline',
					badgeDot: 'bg-status-offline animate-pulse'
				},
				complete: {
					card: 'border-status-online/30',
					hero: 'from-status-online/10 to-status-online/5',
					heroIcon: 'bg-status-online/20 text-status-online',
					badge: 'bg-status-online/15 text-status-online',
					badgeDot: 'bg-status-online'
				}
			},
			role: {
				coordinator: { card: 'border-l-info' },
				'health-check': { card: 'border-l-success' },
				witness: { card: 'border-l-[#8B5CF6]' },
				refinery: { card: 'border-l-primary' },
				crew: { card: 'border-l-muted-foreground' },
				undefined: {}
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
			compact: false,
			role: 'undefined'
		}
	});

	/**
	 * Agent role type for color-coded left borders
	 */
	export type AgentRole = 'coordinator' | 'health-check' | 'witness' | 'refinery' | 'crew' | undefined;

	/**
	 * Props type derived from variant definitions
	 */
	export type AgentCardProps = VariantProps<typeof agentCardVariants> & {
		name: string;
		role?: AgentRole;
		task?: string;
		meta?: string;
		progress?: number;
		class?: string;
		// Enhanced card display props
		uptime?: string;
		uptimePercent?: number;
		efficiency?: number;
		lastSeen?: string;
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
	import type { Snippet } from 'svelte';
	import {
		ChevronDown,
		ClipboardList,
		Clock,
		AlertTriangle,
		Search,
		RefreshCw,
		// Status icons (replacing emojis)
		Zap,
		Moon,
		AlertCircle,
		CheckCircle2,
		// Role icons
		Briefcase,
		Heart,
		Shield,
		Flame,
		Users,
		// Metric icons
		TrendingUp,
		Eye
	} from 'lucide-svelte';

	// Component props with slot snippets
	interface Props extends Omit<AgentCardProps, 'expanded'> {
		expanded?: Snippet;
		actions?: Snippet;
		children?: Snippet;
	}

	let {
		name,
		role,
		status = 'idle',
		task = '',
		meta = '',
		progress = 0,
		class: className = '',
		// Enhanced card display props
		uptime = '',
		uptimePercent,
		efficiency,
		lastSeen = '',
		errorMessage = '',
		expandable = false,
		compact = false,
		onInspect,
		onReboot,
		// Slot snippets
		expanded: expandedSlot,
		actions: actionsSlot,
		children
	}: Props = $props();

	// Expandable state
	let isExpanded = $state(false);

	// Derived styles
	const styles = $derived(agentCardVariants({ status, expanded: isExpanded, compact, role: role || 'undefined' }));

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

	// Default Lucide icons by status (replacing emojis)
	const statusIcons = {
		running: Zap,
		idle: Moon,
		error: AlertCircle,
		complete: CheckCircle2
	} as const;

	// Get the icon component for current status
	const StatusIcon = $derived(statusIcons[status ?? 'idle']);

	// Role icon mapping
	const roleIcons: Record<string, typeof Briefcase> = {
		coordinator: Briefcase,
		'health-check': Heart,
		witness: Shield,
		refinery: Flame,
		crew: Users
	};

	// Get the icon component for current role
	const RoleIcon = $derived(role && roleIcons[role] ? roleIcons[role] : undefined);

	// Role label mapping for display
	const roleLabels: Record<string, string> = {
		coordinator: 'Coordinator',
		'health-check': 'Health Check',
		witness: 'Witness',
		refinery: 'Refinery',
		crew: 'Crew'
	};

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
	<!-- Hero Section with Lucide Icon -->
	{#if !compact}
		<div class={styles.hero()}>
			<div class={styles.heroIcon()}>
				<StatusIcon class="w-7 h-7" strokeWidth={2} />
			</div>
		</div>
	{/if}

	<div class={styles.content()}>
		<!-- Header: Name + Status Badge -->
		<header class={styles.header()}>
			<div class="flex items-center gap-2 min-w-0">
				<StatusIndicator status={statusIndicatorMap[status ?? 'idle']} size="md" />
				<h3 class="text-base font-semibold text-foreground truncate">{name}</h3>
			</div>
			<div class="flex items-center gap-2 flex-shrink-0">
				<span class={styles.badge()}>
					<span class={styles.badgeDot()} aria-hidden="true"></span>
					{statusLabels[status ?? 'idle']}
				</span>
				{#if expandable}
					<ChevronDown
						class="w-4 h-4 text-muted-foreground transition-transform duration-normal ease-spring {isExpanded ? 'rotate-180' : ''}"
						aria-hidden="true"
					/>
				{/if}
			</div>
		</header>

		<!-- Role Display (with icon) -->
		{#if RoleIcon}
			<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
				<RoleIcon class="w-3 h-3" strokeWidth={1.5} />
				<span>{roleLabels[role || '']}</span>
			</div>
		{/if}

		<!-- Body: Task + Metadata -->
		{#if task || meta || uptime || uptimePercent || efficiency || lastSeen}
			<div class="space-y-2">
				{#if task}
					<p class="text-sm text-foreground/80 line-clamp-2">{task}</p>
				{/if}
				<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
					{#if meta}
						<span class="flex items-center gap-1">
							<ClipboardList class="w-3.5 h-3.5" />
							{meta}
						</span>
					{/if}
					{#if uptime}
						<span class="flex items-center gap-1">
							<Clock class="w-3.5 h-3.5" />
							{uptime}
						</span>
					{/if}
				</div>
				<!-- Metrics row: Uptime %, Efficiency, Last Seen -->
				<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
					{#if uptimePercent !== undefined}
						<span class="flex items-center gap-1">
							<TrendingUp class="w-3.5 h-3.5" />
							{uptimePercent.toFixed(1)}% uptime
						</span>
					{/if}
					{#if efficiency !== undefined}
						<span class="flex items-center gap-1">
							<Zap class="w-3.5 h-3.5" />
							{efficiency}% efficient
						</span>
					{/if}
					{#if lastSeen}
						<span class="flex items-center gap-1">
							<Eye class="w-3.5 h-3.5" />
							{lastSeen}
						</span>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Error Message (prominent for error state) -->
		{#if status === 'error' && errorMessage}
			<div class="p-3 rounded-lg bg-status-offline/10 border border-status-offline/20">
				<p class="text-sm text-status-offline font-medium flex items-start gap-2">
					<AlertTriangle class="w-4 h-4 flex-shrink-0 mt-0.5" />
					{errorMessage}
				</p>
			</div>
		{/if}

		<!-- Progress Bar with Percentage Label -->
		{#if status === 'running' && progress > 0}
			<div class={styles.progressWrapper()}>
				<div class="flex-1">
					<ProgressBar
						value={progress}
						size="sm"
						color={progressColorMap[status ?? 'idle']}
					/>
				</div>
				<span class={styles.progressLabel()}>{Math.round(progress)}%</span>
			</div>
		{/if}

		<!-- Expandable Details Section with Spring Animation -->
		{#if expandable}
			<div class={styles.details()}>
				{#if isExpanded}
					<div class="animate-fade-in">
						<!-- Quick Actions -->
						{#if onInspect || onReboot}
							<div class={styles.actions()}>
								{#if onInspect}
									<button
										type="button"
										class={cn(styles.actionBtn(), 'bg-secondary hover:bg-secondary/80 text-secondary-foreground')}
										onclick={(e) => { e.stopPropagation(); onInspect?.(); }}
									>
										<Search class="w-4 h-4" />
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
										<RefreshCw class="w-4 h-4" />
										Reboot
									</button>
								{/if}
							</div>
						{/if}

						<!-- Custom expanded content -->
						{#if expandedSlot}
							<div class="pt-3">
								{@render expandedSlot()}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Legacy actions (non-expandable cards) -->
		{#if !expandable && actionsSlot}
			<div class="flex items-center gap-1 pt-2">
				{@render actionsSlot()}
			</div>
		{/if}
	</div>

	<!-- Custom content -->
	{#if children}
		<div class="px-4 pb-4 pt-2 border-t border-border/50">
			{@render children()}
		</div>
	{/if}
</article>
