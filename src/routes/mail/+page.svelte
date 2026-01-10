<script lang="ts">
	import { onMount } from 'svelte';
	import { tv } from 'tailwind-variants';
	import { GridPattern, PullToRefresh, SplitView, SkeletonCard, ErrorState, EmptyState, FloatingActionButton, PageHeader } from '$lib/components';
	import { cn } from '$lib/utils';
	import { Plus, ChevronDown, ChevronRight, Loader2, PenLine } from 'lucide-svelte';
	import { UnreadDot } from '$lib/components';

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

	interface MailData {
		messages: MailMessage[];
		unreadCount: number;
		error: string | null;
		fetchedAt: string;
	}

	// Client-side state
	let data = $state<MailData>({
		messages: [],
		unreadCount: 0,
		error: null,
		fetchedAt: ''
	});
	let loading = $state(true);

	async function fetchMail() {
		try {
			const res = await fetch('/api/gastown/mail');
			if (!res.ok) throw new Error('Failed to fetch mail');
			data = await res.json();
		} catch (e) {
			data = {
				messages: [],
				unreadCount: 0,
				error: e instanceof Error ? e.message : 'Failed to fetch mail',
				fetchedAt: new Date().toISOString()
			};
		} finally {
			loading = false;
		}
	}

	async function refresh() {
		loading = true;
		await fetchMail();
	}

	async function handleRetry() {
		await fetchMail();
	}

	onMount(() => {
		fetchMail();
	});

	// Track which message is expanded
	let selectedId = $state<string | null>(null);

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
		// Extract the agent name from address like "gastown_ui/polecats/nux"
		const parts = from.split('/');
		if (parts.length === 0) return from;

		const last = parts[parts.length - 1];
		// Capitalize first letter
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
	 * Select a message for viewing
	 */
	function selectMessage(id: string) {
		selectedId = selectedId === id ? null : id;
	}

	/**
	 * Get the currently selected message
	 */
	const selectedMessage = $derived(data.messages.find(m => m.id === selectedId));
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10 flex flex-col h-screen">
		<PageHeader
			title="Mail Inbox"
			subtitle="{data.messages.length} messages"
			liveCount={data.unreadCount > 0 ? { count: data.unreadCount, label: 'unread', status: 'info' } : undefined}
			showAccentBar={true}
		>
			{#snippet actions()}
				<a
					href="/mail/compose"
					class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
				>
					<Plus class="w-4 h-4" />
					Compose
				</a>
			{/snippet}
		</PageHeader>

		<PullToRefresh onRefresh={refresh} class="flex-1 overflow-hidden">
			<div class="h-full overflow-hidden">
				{#if loading}
					<!-- Show skeleton loaders while loading -->
					<div class="h-full overflow-y-auto p-4">
						<div class="space-y-2">
							<SkeletonCard type="mail" count={5} />
						</div>
					</div>
				{:else if data.error}
					<div class="p-4">
						<ErrorState
							title="Failed to load inbox"
							message={data.error}
							onRetry={handleRetry}
							showRetryButton={true}
						/>
					</div>
				{:else if data.messages.length === 0}
					<div class="flex items-center justify-center h-full">
						<EmptyState
							title="No messages"
							description="Your inbox is empty. Check back later for new messages."
							size="default"
						/>
					</div>
				{:else}
					<!-- Split View: List on left, Content on right -->
					<SplitView
						listWidth={30}
						minListWidth={200}
						minContentWidth={400}
						storageKey="mail-split-width"
						class="h-full"
						listClass="bg-muted/20"
						contentClass="bg-background"
					>
						{#snippet list()}
							<!-- Message List -->
							<ul class="divide-y divide-border" role="list">
								{#each data.messages as message, index}
									{@const isSelected = selectedId === message.id}
									<li
										class={cn(
											'transition-colors animate-blur-fade-up border-l-4',
											isSelected && 'border-l-accent bg-accent/5',
											!isSelected && 'border-l-transparent',
											!message.read && 'bg-accent/5'
										)}
										style="animation-delay: {index * 50}ms"
									>
										<button
											type="button"
											class={cn(
												'w-full text-left p-4 hover:bg-accent/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset',
												isSelected && 'bg-accent/10'
											)}
											onclick={() => selectMessage(message.id)}
											aria-pressed={isSelected}
										>
											<div class="flex items-start gap-3">
												<!-- Unread indicator -->
												<div class="flex-shrink-0 mt-1.5">
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
																'text-sm truncate',
																!message.read ? 'font-semibold text-foreground' : 'font-medium text-foreground'
															)}
														>
															{formatSender(message.from)}
														</span>
														<span class="text-xs text-muted-foreground ml-auto flex-shrink-0 font-mono">
															{formatTime(message.timestamp)}
														</span>
													</div>

													<h3
														class={cn(
															'truncate',
															!message.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
														)}
													>
														{message.subject}
													</h3>

													<p class="text-sm text-muted-foreground truncate mt-1">
														{message.body}
													</p>
												</div>
											</div>
										</button>
									</li>
								{/each}
							</ul>
						{/snippet}

						{#snippet content()}
							<!-- Message Content Panel -->
							{#if selectedMessage}
								<div class="h-full flex flex-col overflow-y-auto">
									<!-- Message Header -->
									<div class="sticky top-0 z-10 bg-background/95 border-b border-border px-6 py-4">
										<div class="flex items-start justify-between gap-4">
											<div class="flex-1 min-w-0">
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
												<h2 class="text-xl font-semibold mt-2 break-words">{selectedMessage.subject}</h2>
												<p class="text-sm text-muted-foreground mt-1">
													From: <span class="font-medium">{formatSender(selectedMessage.from)}</span>
													<span class="mx-2">•</span>
													<span class="font-mono">{formatTime(selectedMessage.timestamp)}</span>
												</p>
											</div>
											<a
												href="/mail/{selectedMessage.id}"
												class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/20 rounded-md transition-colors flex-shrink-0"
											>
												View full
												<ChevronRight class="w-3.5 h-3.5" />
											</a>
										</div>
									</div>

									<!-- Message Body -->
									<div class="flex-1 overflow-y-auto px-6 py-4">
										<pre
											class="whitespace-pre-wrap text-sm text-foreground bg-muted/30 p-4 rounded-md font-mono"
										>{selectedMessage.body}</pre>

										<!-- Message Metadata -->
										<div class="mt-6 pt-4 border-t border-border">
											<div class="grid grid-cols-2 gap-4 text-xs">
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
										<p class="text-muted-foreground">Select a message to view details</p>
									</div>
								</div>
							{/if}
						{/snippet}
					</SplitView>
				{/if}
			</div>
		</PullToRefresh>

		<!-- Mobile compose FAB -->
		<FloatingActionButton
			href="/mail/compose"
			ariaLabel="Compose new message"
		>
			<PenLine class="w-5 h-5" strokeWidth={2.5} />
		</FloatingActionButton>
	</div>
</div>
