<script lang="ts">
	import { onMount } from 'svelte';
	import { tv } from 'tailwind-variants';
	import { GridPattern, PullToRefresh, SplitView, SkeletonCard, ErrorState, EmptyState, PageHeader } from '$lib/components';
	import { cn } from '$lib/utils';
	import { ChevronRight, Loader2, Mail, User, Eye, Bot, Settings } from 'lucide-svelte';
	import { UnreadDot } from '$lib/components';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	interface MailMessage {
		id: string;
		from: string;
		subject: string;
		body: string;
		timestamp: string;
		read: boolean;
		priority: string;
		messageType: string;
		threadId: string;
	}

	interface AgentMailData {
		messages: MailMessage[];
		unreadCount: number;
		error: string | null;
		fetchedAt: string;
	}

	// Client-side state
	let selectedAgentId = $state<string | null>(null);
	let agentMail = $state<Map<string, AgentMailData>>(new Map());
	let loadingAgents = $state<Set<string>>(new Set());

	// Track which message is expanded
	let selectedMessageId = $state<string | null>(null);

	/**
	 * Message type badge variants
	 */
	const typeBadgeVariants = tv({
		base: 'inline-flex items-center px-2 py-0.5 text-2xs font-mono font-bold rounded uppercase',
		variants: {
			type: {
				ESCALATION: 'bg-destructive/20 text-destructive',
				ERROR: 'bg-destructive/20 text-destructive',
				HANDOFF: 'bg-warning/20 text-warning',
				DONE: 'bg-success/20 text-success',
				POLECAT_DONE: 'bg-success/20 text-success',
				TEST: 'bg-info/20 text-info',
				MESSAGE: 'bg-muted text-muted-foreground'
			}
		},
		defaultVariants: {
			type: 'MESSAGE'
		}
	});

	/**
	 * Agent type icon variants
	 */
	function getAgentIcon(type: string) {
		switch (type) {
			case 'human':
				return User;
			case 'witness':
				return Eye;
			case 'refinery':
				return Settings;
			case 'polecat':
				return Bot;
			default:
				return Mail;
		}
	}

	/**
	 * Get agent type color
	 */
	function getAgentColor(type: string): string {
		switch (type) {
			case 'human':
				return 'text-primary';
			case 'witness':
				return 'text-success';
			case 'refinery':
				return 'text-warning';
			case 'polecat':
				return 'text-info';
			default:
				return 'text-muted-foreground';
		}
	}

	/**
	 * Format timestamp for display
	 */
	function formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();

		// Less than 1 hour: show minutes
		if (diff < 3600000) {
			const mins = Math.floor(diff / 60000);
			return mins <= 0 ? 'now' : `${mins}m ago`;
		}

		// Less than 24 hours: show hours
		if (diff < 86400000) {
			const hours = Math.floor(diff / 3600000);
			return `${hours}h ago`;
		}

		// Otherwise: show date
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	/**
	 * Format sender address for display
	 */
	function formatSender(from: string): string {
		const parts = from.split('/');
		if (parts.length === 0) return from;

		const last = parts[parts.length - 1];
		return last.charAt(0).toUpperCase() + last.slice(1);
	}

	/**
	 * Get badge type for message
	 */
	function getBadgeType(messageType: string): string {
		const knownTypes = ['ESCALATION', 'ERROR', 'HANDOFF', 'DONE', 'POLECAT_DONE', 'TEST'];
		return knownTypes.includes(messageType) ? messageType : 'MESSAGE';
	}

	/**
	 * Fetch mail for a specific agent
	 */
	async function fetchAgentMail(agentId: string): Promise<AgentMailData> {
		// Check cache first
		if (agentMail.has(agentId)) {
			return agentMail.get(agentId)!;
		}

		// Mark as loading
		loadingAgents = new Set(loadingAgents).add(agentId);

		try {
			const address = agentId === 'human' ? '--human' : agentId;
			const res = await fetch(`/api/gastown/mail?identity=${encodeURIComponent(address)}`);
			if (!res.ok) throw new Error('Failed to fetch mail');

			const mailData: AgentMailData = await res.json();
			agentMail = new Map(agentMail).set(agentId, mailData);
			return mailData;
		} catch (e) {
			const errorData: AgentMailData = {
				messages: [],
				unreadCount: 0,
				error: e instanceof Error ? e.message : 'Failed to fetch mail',
				fetchedAt: new Date().toISOString()
			};
			agentMail = new Map(agentMail).set(agentId, errorData);
			return errorData;
		} finally {
			loadingAgents = new Set(Array.from(loadingAgents).filter((id) => id !== agentId));
		}
	}

	/**
	 * Select an agent to view their mail
	 */
	function selectAgent(agentId: string) {
		selectedAgentId = agentId;
		selectedMessageId = null;
		// Fetch mail if not already cached
		if (!agentMail.has(agentId)) {
			fetchAgentMail(agentId);
		}
	}

	/**
	 * Select a message for viewing
	 */
	function selectMessage(id: string) {
		selectedMessageId = selectedMessageId === id ? null : id;
	}

	/**
	 * Get the current agent's mail data
	 */
	const currentAgentMail = $derived(
		selectedAgentId && agentMail.has(selectedAgentId) ? agentMail.get(selectedAgentId)! : null
	);

	/**
	 * Get the currently selected message
	 */
	const selectedMessage = $derived(
		currentAgentMail?.messages.find((m) => m.id === selectedMessageId) || null
	);

	/**
	 * Get total unread count across all agents
	 */
	const totalUnreadCount = $derived(
		data.agents.reduce((sum, agent) => {
			const mail = agentMail.get(agent.id);
			return sum + (mail?.unreadCount || 0);
		}, 0)
	);

	// On mount, select the human agent by default
	onMount(() => {
		if (data.agents.length > 0) {
			const humanAgent = data.agents.find((a) => a.type === 'human');
			if (humanAgent) {
				selectAgent(humanAgent.id);
			}
		}
	});
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10 flex flex-col h-screen">
		<PageHeader
			title="Agent Mail"
			subtitle="{data.agents.length} agents"
			liveCount={totalUnreadCount > 0 ? { count: totalUnreadCount, label: 'unread', status: 'info' } : undefined}
			showAccentBar={true}
		/>

		{#if data.error}
			<div class="p-4">
				<ErrorState
					title="Failed to load agents"
					message={data.error}
					showRetryButton={false}
				/>
			</div>
		{:else if data.agents.length === 0}
			<div class="flex items-center justify-center h-full">
				<EmptyState
					title="No agents found"
					description="No agents are currently available. Check back later."
					size="default"
				/>
			</div>
		{:else}
			<!-- Split View: Agent List on left, Mail Content on right -->
			<SplitView
				listWidth={25}
				minListWidth={200}
				minContentWidth={400}
				storageKey="agent-mail-split-width"
				class="h-full"
				listClass="bg-muted/20"
				contentClass="bg-background"
			>
				{#snippet list()}
					<!-- Agent List -->
					<ul class="divide-y divide-border" role="list">
						{#each data.agents as agent, index}
							{@const isSelected = selectedAgentId === agent.id}
							{@const mailData = agentMail.get(agent.id)}
							{@const isLoading = loadingAgents.has(agent.id)}
							{@const Icon = getAgentIcon(agent.type)}
							<li
								class={cn(
									'transition-colors animate-blur-fade-up border-l-4',
									isSelected && 'border-l-accent bg-accent/5',
									!isSelected && 'border-l-transparent'
								)}
								style="animation-delay: {index * 30}ms"
							>
								<button
									type="button"
									class={cn(
										'w-full text-left p-4 hover:bg-accent/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset',
										isSelected && 'bg-accent/10'
									)}
									onclick={() => selectAgent(agent.id)}
									aria-pressed={isSelected}
								>
									<div class="flex items-start gap-3">
										<!-- Agent Icon -->
										<div class="flex-shrink-0 mt-0.5">
											<Icon class={cn('w-5 h-5', getAgentColor(agent.type))} />
										</div>

										<!-- Agent Info -->
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2">
												<span
													class={cn(
														'sm:text-sm truncate',
														isSelected ? 'font-semibold text-foreground' : 'font-medium text-foreground'
													)}
												>
													{agent.displayName}
												</span>
												{#if mailData && mailData.unreadCount > 0}
													<span class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-accent text-accent-foreground rounded-full">
														{mailData.unreadCount}
													</span>
												{/if}
											</div>

											<div class="flex items-center gap-2 mt-1">
												{#if agent.type === 'polecat' && agent.state}
													<span
														class={cn(
															'inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded',
															agent.state === 'working' && 'bg-info/20 text-info',
															agent.state === 'done' && 'bg-success/20 text-success',
															agent.state === 'stuck' && 'bg-destructive/20 text-destructive'
														)}
													>
														{agent.state}
													</span>
												{/if}
												{#if agent.sessionRunning}
													<span class="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
														<span class="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
														active
													</span>
												{/if}
												{#if isLoading}
													<Loader2 class="w-3 h-3 text-muted-foreground animate-spin" />
												{:else if mailData}
													<span class="text-xs text-muted-foreground">
														{mailData.messages.length} messages
													</span>
												{/if}
											</div>

											{#if agent.rig}
												<p class="text-xs text-muted-foreground mt-1 font-mono">
													{agent.rig}
												</p>
											{/if}
										</div>
									</div>
								</button>
							</li>
						{/each}
					</ul>
				{/snippet}

				{#snippet content()}
					<!-- Mail Content Panel -->
					{#if selectedAgentId}
						{@const selectedAgent = data.agents.find((a) => a.id === selectedAgentId)}
						{@const Icon = selectedAgent ? getAgentIcon(selectedAgent.type) : Mail}

						{#if loadingAgents.has(selectedAgentId)}
							<div class="h-full overflow-y-auto p-4">
								<div class="space-y-2">
									<SkeletonCard type="mail" count={5} />
								</div>
							</div>
						{:else if currentAgentMail?.error}
							<div class="p-4">
								<ErrorState
									title="Failed to load mail"
									message={currentAgentMail.error}
									showRetryButton={false}
								/>
							</div>
						{:else if !currentAgentMail || currentAgentMail.messages.length === 0}
							<div class="flex items-center justify-center h-full">
								<EmptyState
									title="No messages"
									description="{selectedAgent?.displayName || 'This agent'} has no messages."
									size="default"
								/>
							</div>
						{:else}
							<!-- Split View: Message List on left, Message Content on right -->
							<SplitView
								listWidth={35}
								minListWidth={200}
								minContentWidth={350}
								storageKey="agent-mail-messages-split-width"
								class="h-full"
								listClass="bg-muted/10"
								contentClass="bg-background"
							>
								{#snippet list()}
									<!-- Message List -->
									<div class="h-full flex flex-col">
										<!-- Message List Header -->
										<div class="sticky top-0 z-10 bg-background/95 border-b border-border px-4 py-3">
											<div class="flex items-center gap-2">
												<Icon class={cn('w-4 h-4', getAgentColor(selectedAgent?.type || ''))} />
												<h3 class="text-sm font-semibold">{selectedAgent?.displayName}</h3>
												<span class="text-xs text-muted-foreground ml-auto">
													{currentAgentMail.messages.length} messages
												</span>
											</div>
										</div>

										<!-- Messages -->
										<ul class="flex-1 divide-y divide-border overflow-y-auto" role="list">
											{#each currentAgentMail.messages as message}
												{@const isMsgSelected = selectedMessageId === message.id}
												<li
													class={cn(
														'transition-colors border-l-4',
														isMsgSelected && 'border-l-accent bg-accent/5',
														!isMsgSelected && 'border-l-transparent',
														!message.read && 'bg-accent/5'
													)}
												>
													<button
														type="button"
														class={cn(
															'w-full text-left p-3 hover:bg-accent/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset',
															isMsgSelected && 'bg-accent/10'
														)}
														onclick={() => selectMessage(message.id)}
														aria-pressed={isMsgSelected}
													>
														<div class="flex items-start gap-2">
															<!-- Unread indicator -->
															<div class="flex-shrink-0 mt-1">
																{#if !message.read}
																	<UnreadDot size="sm" />
																{:else}
																	<span class="block w-2 h-2"></span>
																{/if}
															</div>

															<!-- Message content -->
															<div class="flex-1 min-w-0">
																<div class="flex items-center gap-2 mb-1">
																	<span
																		class={typeBadgeVariants({
																			type: getBadgeType(message.messageType) as
																				| 'ESCALATION'
																				| 'ERROR'
																				| 'HANDOFF'
																				| 'DONE'
																				| 'POLECAT_DONE'
																				| 'TEST'
																				| 'MESSAGE'
																		})}
																	>
																		{message.messageType}
																	</span>
																	<span
																		class={cn(
																			'text-xs truncate',
																			!message.read
																				? 'font-semibold text-foreground'
																				: 'font-medium text-foreground'
																		)}
																	>
																		{formatSender(message.from)}
																	</span>
																	<span
																		class="text-[10px] text-muted-foreground ml-auto flex-shrink-0 font-mono"
																	>
																		{formatTime(message.timestamp)}
																	</span>
																</div>

																<h3
																	class={cn(
																		'truncate text-sm',
																		!message.read
																			? 'font-semibold text-foreground'
																			: 'font-medium text-muted-foreground'
																	)}
																>
																	{message.subject}
																</h3>

																<p class="text-xs text-muted-foreground truncate mt-0.5">
																	{message.body}
																</p>
															</div>
														</div>
													</button>
												</li>
											{/each}
										</ul>
									</div>
								{/snippet}

								{#snippet content()}
									<!-- Message Content Panel -->
									{#if selectedMessage}
										<div class="h-full flex flex-col overflow-y-auto">
											<!-- Message Header -->
											<div class="sticky top-0 z-10 bg-background/95 border-b border-border px-5 py-3">
												<span
													class={typeBadgeVariants({
														type: getBadgeType(selectedMessage.messageType) as
															| 'ESCALATION'
															| 'ERROR'
															| 'HANDOFF'
															| 'DONE'
															| 'POLECAT_DONE'
															| 'TEST'
															| 'MESSAGE'
													})}
												>
													{selectedMessage.messageType}
												</span>
												<h2 class="text-lg font-semibold mt-2 break-words">
													{selectedMessage.subject}
												</h2>
												<p class="text-xs text-muted-foreground mt-1">
													From: <span class="font-medium">{formatSender(selectedMessage.from)}</span>
													<span class="mx-2">•</span>
													<span class="font-mono">{formatTime(selectedMessage.timestamp)}</span>
												</p>
											</div>

											<!-- Message Body -->
											<div class="flex-1 overflow-y-auto px-5 py-4">
												<pre
													class="whitespace-pre-wrap text-sm text-foreground bg-muted/30 p-3 rounded-md font-mono"
												>{selectedMessage.body}</pre>

												<!-- Message Metadata -->
												<div class="mt-5 pt-3 border-t border-border">
													<div class="grid grid-cols-2 gap-3 text-xs">
														<div>
															<p class="text-muted-foreground">From</p>
															<p class="text-foreground font-mono">{selectedMessage.from}</p>
														</div>
														<div>
															<p class="text-muted-foreground">Message ID</p>
															<p class="text-foreground font-mono">{selectedMessage.id}</p>
														</div>
														{#if selectedMessage.threadId}
															<div>
																<p class="text-muted-foreground">Thread ID</p>
																<p class="text-foreground font-mono">{selectedMessage.threadId}</p>
															</div>
														{/if}
														<div>
															<p class="text-muted-foreground">Status</p>
															<p class="text-foreground">{selectedMessage.read ? 'Read' : 'Unread'}</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									{:else}
										<!-- Empty State: No message selected -->
										<div class="h-full flex items-center justify-center">
											<div class="text-center">
												<Mail class="w-12 h-12 text-muted-foreground mx-auto mb-3" />
												<p class="text-muted-foreground">Select a message to view details</p>
											</div>
										</div>
									{/if}
								{/snippet}
							</SplitView>
						{/if}
					{:else}
						<!-- Empty State: No agent selected -->
						<div class="h-full flex items-center justify-center">
							<div class="text-center">
								<Mail class="w-12 h-12 text-muted-foreground mx-auto mb-3" />
								<p class="text-muted-foreground">Select an agent to view their mail</p>
							</div>
						</div>
					{/if}
				{/snippet}
			</SplitView>
		{/if}
	</div>
</div>
