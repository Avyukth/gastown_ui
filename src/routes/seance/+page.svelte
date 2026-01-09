<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { GridPattern, StatusIndicator } from '$lib/components';
	import type { Session, SessionMessage } from './+page.server';
	import { RefreshCw } from 'lucide-svelte';

	let { data } = $props();

	// UI state
	let expandedSessionId = $state<string | null>(null);
	let messageRoleFilter = $state<'all' | 'user' | 'assistant' | 'tool'>('all');
	let searchInTranscript = $state('');

	// Filter state - use $state with $effect to sync from URL/data
	let selectedAgent = $state('');
	let selectedRig = $state('');
	let selectedStatus = $state('');
	let searchQuery = $state('');
	let dateFrom = $state('');
	let dateTo = $state('');

	// Icon SVGs
	const icons: Record<string, string> = {
		ghost: '<path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>',
		search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
		filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
		clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
		messages: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
		tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
		file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
		error: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
		download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
		play: '<polygon points="5 3 19 12 5 21 5 3"/>',
		trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
		chevronDown: '<polyline points="6 9 12 15 18 9"/>',
		chevronUp: '<polyline points="18 15 12 9 6 15"/>',
		x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
		user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
		bot: '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>',
		terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>'
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

	function getRoleIcon(role: SessionMessage['role']): string {
		const roleIcons = {
			user: 'user',
			assistant: 'bot',
			tool: 'terminal'
		};
		return roleIcons[role];
	}

	function getRoleColor(role: SessionMessage['role']): string {
		const colors = {
			user: 'text-info',
			assistant: 'text-accent',
			tool: 'text-warning'
		};
		return colors[role];
	}

	function applyFilters() {
		const params = new URLSearchParams();
		if (selectedAgent) params.set('agent', selectedAgent);
		if (selectedRig) params.set('rig', selectedRig);
		if (selectedStatus) params.set('status', selectedStatus);
		if (searchQuery) params.set('q', searchQuery);
		if (dateFrom) params.set('from', dateFrom);
		if (dateTo) params.set('to', dateTo);
		const queryString = params.toString();
		goto(`/seance${queryString ? `?${queryString}` : ''}`, { replaceState: true });
	}

	function clearFilters() {
		selectedAgent = '';
		selectedRig = '';
		selectedStatus = '';
		searchQuery = '';
		dateFrom = '';
		dateTo = '';
		goto('/seance', { replaceState: true });
	}

	function toggleSession(sessionId: string) {
		expandedSessionId = expandedSessionId === sessionId ? null : sessionId;
		messageRoleFilter = 'all';
		searchInTranscript = '';
	}

	function filterTranscript(messages: SessionMessage[]): SessionMessage[] {
		let filtered = messages;

		if (messageRoleFilter !== 'all') {
			filtered = filtered.filter((m) => m.role === messageRoleFilter);
		}

		if (searchInTranscript) {
			const query = searchInTranscript.toLowerCase();
			filtered = filtered.filter((m) => m.content.toLowerCase().includes(query));
		}

		return filtered;
	}

	function exportSession(session: Session) {
		const content = JSON.stringify(session, null, 2);
		const blob = new Blob([content], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `session-${session.id}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function resumeSession(session: Session) {
		// Mock resume action - would actually reinitialize the agent
		alert(`Resuming session ${session.id} for ${session.agentName}...`);
	}

	function deleteSession(session: Session) {
		// Mock delete action - would actually delete from storage
		if (confirm(`Delete session ${session.id}? This cannot be undone.`)) {
			alert(`Session ${session.id} deleted.`);
		}
	}

	// Sync filter state with URL changes
	$effect(() => {
		selectedAgent = data.filters.agent;
		selectedRig = data.filters.rig;
		selectedStatus = data.filters.status;
		searchQuery = data.filters.search;
		dateFrom = data.filters.dateFrom;
		dateTo = data.filters.dateTo;
	});

	// Group sessions by date
	function groupByDate(sessions: Session[]): Map<string, Session[]> {
		const groups = new Map<string, Session[]>();
		for (const session of sessions) {
			const dateKey = formatDate(session.startTime);
			if (!groups.has(dateKey)) {
				groups.set(dateKey, []);
			}
			groups.get(dateKey)!.push(session);
		}
		return groups;
	}

	const groupedSessions = $derived(groupByDate(data.sessions));
	const hasFilters = $derived(
		selectedAgent || selectedRig || selectedStatus || searchQuery || dateFrom || dateTo
	);
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10 flex flex-col min-h-screen">
		<!-- Header -->
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
			<div class="container space-y-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<svg
							class="w-6 h-6 text-accent"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							{@html icons.ghost}
						</svg>
						<h1 class="text-xl font-semibold text-foreground">Seance</h1>
						<span class="text-xs text-muted-foreground">
							{data.sessions.length} sessions
						</span>
					</div>

					<button
						onclick={() => invalidateAll()}
						class="p-2 text-muted-foreground hover:text-foreground transition-colors"
						title="Refresh"
					>
						<RefreshCw class="w-4 h-4" />
					</button>
				</div>

				<!-- Search bar -->
				<div class="relative">
					<svg
						class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						{@html icons.search}
					</svg>
					<input
						type="text"
						placeholder="Search sessions..."
						bind:value={searchQuery}
						onkeydown={(e) => e.key === 'Enter' && applyFilters()}
						class="w-full pl-10 pr-4 py-2 text-sm bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
					/>
				</div>

				<!-- Filters -->
				<div class="flex flex-wrap items-center gap-3">
					<!-- Agent filter -->
					<select
						bind:value={selectedAgent}
						onchange={applyFilters}
						class="px-3 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground"
					>
						<option value="">All agents</option>
						{#each data.agents as agent}
							<option value={agent}>{agent}</option>
						{/each}
					</select>

					<!-- Rig filter -->
					<select
						bind:value={selectedRig}
						onchange={applyFilters}
						class="px-3 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground"
					>
						<option value="">All rigs</option>
						{#each data.rigs as rig}
							<option value={rig}>{rig}</option>
						{/each}
					</select>

					<!-- Status filter -->
					<select
						bind:value={selectedStatus}
						onchange={applyFilters}
						class="px-3 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground"
					>
						<option value="">All statuses</option>
						{#each data.statuses as status}
							<option value={status}>{status}</option>
						{/each}
					</select>

					<!-- Date range -->
					<div class="flex items-center gap-2">
						<input
							type="date"
							bind:value={dateFrom}
							onchange={applyFilters}
							class="px-2 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground"
							placeholder="From"
						/>
						<span class="text-muted-foreground">-</span>
						<input
							type="date"
							bind:value={dateTo}
							onchange={applyFilters}
							class="px-2 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground"
							placeholder="To"
						/>
					</div>

					<!-- Clear filters -->
					{#if hasFilters}
						<button
							onclick={clearFilters}
							class="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
						>
							<svg
								class="w-3 h-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								{@html icons.x}
							</svg>
							Clear
						</button>
					{/if}
				</div>
			</div>
		</header>

		<!-- Session list -->
		<main class="flex-1 container py-4">
			{#if data.error}
				<div class="panel-glass p-8 text-center">
					<p class="text-destructive font-medium">Error loading sessions</p>
					<p class="text-sm text-muted-foreground mt-2">{data.error}</p>
				</div>
			{:else if data.sessions.length === 0}
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
					{#each groupedSessions as [date, sessions]}
						<div>
							<!-- Date header -->
							<div class="flex items-center gap-3 mb-3">
								<span
									class="text-xs font-medium text-muted-foreground uppercase tracking-wide"
								>
									{date}
								</span>
								<div class="flex-1 h-px bg-border"></div>
							</div>

							<!-- Sessions for this date -->
							<div class="space-y-3">
								{#each sessions as session, i}
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
											<div class="border-t border-border">
												<!-- Session actions -->
												<div
													class="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border"
												>
													<button
														onclick={() => exportSession(session)}
														class="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded flex items-center gap-1.5 transition-colors"
													>
														<svg
															class="w-3.5 h-3.5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
															stroke-width="2"
															stroke-linecap="round"
															stroke-linejoin="round"
														>
															{@html icons.download}
														</svg>
														Export
													</button>
													{#if session.status === 'crashed'}
														<button
															onclick={() => resumeSession(session)}
															class="px-3 py-1.5 text-xs bg-accent/20 text-accent hover:bg-accent/30 rounded flex items-center gap-1.5 transition-colors"
														>
															<svg
																class="w-3.5 h-3.5"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
															>
																{@html icons.play}
															</svg>
															Resume
														</button>
													{/if}
													<button
														onclick={() => deleteSession(session)}
														class="px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded flex items-center gap-1.5 transition-colors ml-auto"
													>
														<svg
															class="w-3.5 h-3.5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
															stroke-width="2"
															stroke-linecap="round"
															stroke-linejoin="round"
														>
															{@html icons.trash}
														</svg>
														Delete
													</button>
												</div>

												<!-- Files modified -->
												{#if session.filesModified.length > 0}
													<div class="px-4 py-3 border-b border-border">
														<h4
															class="text-xs font-medium text-muted-foreground mb-2"
														>
															Files Modified ({session.filesModified.length})
														</h4>
														<div class="flex flex-wrap gap-2">
															{#each session.filesModified as file}
																<span
																	class="px-2 py-1 text-xs font-mono bg-muted rounded"
																>
																	{file}
																</span>
															{/each}
														</div>
													</div>
												{/if}

												<!-- Errors -->
												{#if session.errors.length > 0}
													<div
														class="px-4 py-3 border-b border-border bg-destructive/5"
													>
														<h4
															class="text-xs font-medium text-destructive mb-2 flex items-center gap-1"
														>
															<svg
																class="w-3.5 h-3.5"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
															>
																{@html icons.error}
															</svg>
															Errors ({session.errors.length})
														</h4>
														<ul class="space-y-1">
															{#each session.errors as error}
																<li class="text-xs text-destructive font-mono">
																	{error}
																</li>
															{/each}
														</ul>
													</div>
												{/if}

												<!-- Transcript filters -->
												<div
													class="px-4 py-3 border-b border-border flex flex-wrap items-center gap-3"
												>
													<div class="relative flex-1 min-w-[200px]">
														<svg
															class="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
															stroke-width="2"
															stroke-linecap="round"
															stroke-linejoin="round"
														>
															{@html icons.search}
														</svg>
														<input
															type="text"
															placeholder="Search transcript..."
															bind:value={searchInTranscript}
															class="w-full pl-7 pr-3 py-1.5 text-xs bg-muted border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
														/>
													</div>
													<div class="flex items-center gap-1">
														{#each ['all', 'user', 'assistant', 'tool'] as role}
															<button
																onclick={() =>
																	(messageRoleFilter = role as typeof messageRoleFilter)}
																class={cn(
																	'px-2 py-1 text-xs rounded transition-colors',
																	messageRoleFilter === role
																		? 'bg-accent text-accent-foreground'
																		: 'bg-muted text-muted-foreground hover:text-foreground'
																)}
															>
																{role}
															</button>
														{/each}
													</div>
												</div>

												<!-- Transcript -->
												<div class="max-h-96 overflow-y-auto">
													{#each filterTranscript(session.transcript) as message, idx}
														<div
															class={cn(
																'px-4 py-3 flex gap-3',
																idx !== session.transcript.length - 1 &&
																	'border-b border-border/50'
															)}
														>
															<!-- Role icon -->
															<div
																class={cn(
																	'flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-muted/50',
																	getRoleColor(message.role)
																)}
															>
																<svg
																	class="w-3.5 h-3.5"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																>
																	{@html icons[getRoleIcon(message.role)]}
																</svg>
															</div>

															<!-- Message content -->
															<div class="flex-1 min-w-0">
																<div
																	class="flex items-center gap-2 mb-1 text-xs"
																>
																	<span
																		class={cn(
																			'font-medium capitalize',
																			getRoleColor(message.role)
																		)}
																	>
																		{message.role}
																	</span>
																	{#if message.toolName}
																		<span
																			class="px-1.5 py-0.5 bg-muted rounded font-mono"
																		>
																			{message.toolName}
																		</span>
																	{/if}
																	<time class="text-muted-foreground font-mono">
																		{formatTime(message.timestamp)}
																	</time>
																</div>
																<p
																	class="text-sm text-foreground whitespace-pre-wrap break-words"
																>
																	{message.content}
																</p>
																{#if message.toolResult}
																	<p
																		class="mt-1 text-xs text-muted-foreground font-mono"
																	>
																		{message.toolResult}
																	</p>
																{/if}
															</div>
														</div>
													{/each}
													{#if filterTranscript(session.transcript).length === 0}
														<div
															class="px-4 py-8 text-center text-muted-foreground text-sm"
														>
															No messages match your filters
														</div>
													{/if}
												</div>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</main>
	</div>
</div>
