<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Session, SessionMessage, MessageRoleFilter } from './types';

	// Props
	let {
		session,
		onExport,
		onResume,
		onDelete
	}: {
		session: Session;
		onExport?: (session: Session) => void;
		onResume?: (session: Session) => void;
		onDelete?: (session: Session) => void;
	} = $props();

	// UI state
	let messageRoleFilter = $state<MessageRoleFilter>('all');
	let searchInTranscript = $state('');

	// Icon SVGs
	const icons = {
		search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
		file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
		error: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
		download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
		play: '<polygon points="5 3 19 12 5 21 5 3"/>',
		trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
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

	function handleExport() {
		onExport?.(session);
	}

	function handleResume() {
		onResume?.(session);
	}

	function handleDelete() {
		onDelete?.(session);
	}

	const filteredMessages = $derived(filterTranscript(session.transcript));
</script>

<div class="border-t border-border">
	<!-- Session actions -->
	<div class="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
		<button
			onclick={handleExport}
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
				onclick={handleResume}
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
			onclick={handleDelete}
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
			<h4 class="text-xs font-medium text-muted-foreground mb-2">
				Files Modified ({session.filesModified.length})
			</h4>
			<div class="flex flex-wrap gap-2">
				{#each session.filesModified as file}
					<span class="px-2 py-1 text-xs font-mono bg-muted rounded">
						{file}
					</span>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Errors -->
	{#if session.errors.length > 0}
		<div class="px-4 py-3 border-b border-border bg-destructive/5">
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
	<div class="px-4 py-3 border-b border-border flex flex-wrap items-center gap-3">
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
					onclick={() => (messageRoleFilter = role as MessageRoleFilter)}
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
		{#each filteredMessages as message, idx}
			<div
				class={cn(
					'px-4 py-3 flex gap-3',
					idx !== filteredMessages.length - 1 && 'border-b border-border/50'
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
					<div class="flex items-center gap-2 mb-1 text-xs">
						<span
							class={cn('font-medium capitalize', getRoleColor(message.role))}
						>
							{message.role}
						</span>
						{#if message.toolName}
							<span class="px-1.5 py-0.5 bg-muted rounded font-mono">
								{message.toolName}
							</span>
						{/if}
						<time class="text-muted-foreground font-mono">
							{formatTime(message.timestamp)}
						</time>
					</div>
					<p class="text-sm text-foreground whitespace-pre-wrap break-words">
						{message.content}
					</p>
					{#if message.toolResult}
						<p class="mt-1 text-xs text-muted-foreground font-mono">
							{message.toolResult}
						</p>
					{/if}
				</div>
			</div>
		{/each}
		{#if filteredMessages.length === 0}
			<div class="px-4 py-8 text-center text-muted-foreground text-sm">
				No messages match your filters
			</div>
		{/if}
	</div>
</div>
