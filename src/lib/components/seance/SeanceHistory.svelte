<script lang="ts">
	import { cn } from '$lib/utils';
	import { StatusIndicator } from '$lib/components';
	import SeanceOutput from './SeanceOutput.svelte';
	import type { Session } from './types';

	// Props
	let {
		sessions,
		hasFilters = false,
		error = null,
		onExportSession,
		onResumeSession,
		onDeleteSession
	}: {
		sessions: Session[];
		hasFilters?: boolean;
		error?: string | null;
		onExportSession?: (session: Session) => void;
		onResumeSession?: (session: Session) => void;
		onDeleteSession?: (session: Session) => void;
	} = $props();

	// UI state
	let expandedSessionId = $state<string | null>(null);

	// Icon SVGs
	const icons = {
		ghost: '<path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>',
		clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
		messages: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
		tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
		chevronDown: '<polyline points="6 9 12 15 18 9"/>',
		user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
		bot: '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>',
		search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'
	};

	function formatTime(isoString: string): string {
		return new Date(isoString).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function formatDate(isoString: string): string {
		const date = new Date(isoString);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) {
			return 'Today';
		} else if (date.toDateString() === yesterday.toDateString()) {
			return 'Yesterday';
		}
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
		});
	}

	function formatDuration(minutes: number): string {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}

	function getStatusColor(status: Session['status']): string {
		const colors = {
			active: 'text-success',
			completed: 'text-muted-foreground',
			crashed: 'text-destructive'
		};
		return colors[status];
	}

	function getStatusIndicatorType(status: Session['status']): 'running' | 'complete' | 'error' {
		const types = {
			active: 'running' as const,
			completed: 'complete' as const,
			crashed: 'error' as const
		};
		return types[status];
	}

	function getAgentTypeIcon(type: Session['agentType']): string {
		const typeIcons = {
			polecat: 'bot',
			witness: 'search',
			refinery: 'tool',
			mayor: 'user'
		};
		return typeIcons[type] || 'bot';
	}

	function toggleSession(sessionId: string) {
		expandedSessionId = expandedSessionId === sessionId ? null : sessionId;
	}

	function groupByDate(sessionList: Session[]): Map<string, Session[]> {
		const groups = new Map<string, Session[]>();
		for (const session of sessionList) {
			const dateKey = formatDate(session.startTime);
			if (!groups.has(dateKey)) {
				groups.set(dateKey, []);
			}
			groups.get(dateKey)!.push(session);
		}
		return groups;
	}

	const groupedSessions = $derived(groupByDate(sessions));
</script>

{#if error}
	<div class="panel-glass p-8 text-center">
		<p class="text-destructive font-medium">Error loading sessions</p>
		<p class="text-sm text-muted-foreground mt-2">{error}</p>
	</div>
{:else if sessions.length === 0}
	<div class="panel-glass p-8 text-center">
		<svg
			class="w-12 h-12 mx-auto text-muted-foreground mb-4"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			{@html icons.ghost}
		</svg>
		<p class="text-muted-foreground">No sessions found</p>
		{#if hasFilters}
			<p class="text-sm text-muted-foreground mt-2">
				Try adjusting your filters to see more sessions
			</p>
		{:else}
			<p class="text-sm text-muted-foreground mt-2">
				Session transcripts will appear here as agents work
			</p>
		{/if}
	</div>
{:else}
	<div class="space-y-6">
		{#each groupedSessions as [date, dateSessions]}
			<div>
				<!-- Date header -->
				<div class="flex items-center gap-3 mb-3">
					<span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						{date}
					</span>
					<div class="flex-1 h-px bg-border"></div>
				</div>

				<!-- Sessions for this date -->
				<div class="space-y-3">
					{#each dateSessions as session, i}
						<div
							class="panel-glass overflow-hidden animate-blur-fade-up"
							style="animation-delay: {i * 30}ms"
						>
							<!-- Session header (clickable) -->
							<button
								onclick={() => toggleSession(session.id)}
								class="w-full p-4 flex items-start gap-4 text-left hover:bg-muted/30 transition-colors"
							>
								<!-- Agent icon -->
								<div
									class={cn(
										'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50',
										getStatusColor(session.status)
									)}
								>
									<svg
										class="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										{@html icons[getAgentTypeIcon(session.agentType)]}
									</svg>
								</div>

								<!-- Session info -->
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-1">
										<span class="font-medium text-foreground">
											{session.agentName}
										</span>
										<span
											class="px-1.5 py-0.5 text-2xs bg-muted rounded text-muted-foreground"
										>
											{session.agentType}
										</span>
										<StatusIndicator
											status={getStatusIndicatorType(session.status)}
											size="sm"
										/>
										<span
											class={cn(
												'text-xs capitalize',
												getStatusColor(session.status)
											)}
										>
											{session.status}
										</span>
									</div>
									<div
										class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
									>
										<span class="font-mono">{session.id}</span>
										<span>{session.rig}</span>
										<span class="flex items-center gap-1">
											<svg
												class="w-3 h-3"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												{@html icons.clock}
											</svg>
											{formatDuration(session.duration)}
										</span>
										<span class="flex items-center gap-1">
											<svg
												class="w-3 h-3"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												{@html icons.messages}
											</svg>
											{session.messageCount}
										</span>
										<span class="flex items-center gap-1">
											<svg
												class="w-3 h-3"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												{@html icons.tool}
											</svg>
											{session.toolCallCount}
										</span>
									</div>
								</div>

								<!-- Timestamp and expand icon -->
								<div class="flex-shrink-0 text-right">
									<time class="text-xs text-muted-foreground font-mono block">
										{formatTime(session.startTime)}
									</time>
									<svg
										class={cn(
											'w-4 h-4 text-muted-foreground mt-2 transition-transform',
											expandedSessionId === session.id && 'rotate-180'
										)}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										{@html icons.chevronDown}
									</svg>
								</div>
							</button>

							<!-- Expanded detail -->
							{#if expandedSessionId === session.id}
								<SeanceOutput
									{session}
									onExport={onExportSession}
									onResume={onResumeSession}
									onDelete={onDeleteSession}
								/>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}
