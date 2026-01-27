<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { GridPattern, PageHeader } from '$lib/components';
	import type { PageData } from './$types';
	import { Reply, Forward } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	/**
	 * Message type badge variants
	 */
	const typeBadgeVariants = tv({
		base: 'inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold rounded uppercase',
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
	 * Priority badge variants
	 */
	const priorityBadgeVariants = tv({
		base: 'inline-flex items-center px-2 py-0.5 text-2xs font-mono rounded',
		variants: {
			priority: {
				high: 'bg-destructive/10 text-destructive',
				normal: 'bg-muted text-muted-foreground',
				low: 'bg-muted/50 text-muted-foreground/70'
			}
		},
		defaultVariants: {
			priority: 'normal'
		}
	});

	/**
	 * Format timestamp for display
	 */
	function formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		return date.toLocaleString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	/**
	 * Format address for display
	 */
	function formatAddress(address: string): { name: string; full: string } {
		const parts = address.split('/');
		const name = parts.length > 0 ? parts[parts.length - 1] : address;
		return {
			name: name.charAt(0).toUpperCase() + name.slice(1),
			full: address
		};
	}

	/**
	 * Get badge type for message
	 */
	function getBadgeType(
		messageType: string
	): 'ESCALATION' | 'ERROR' | 'HANDOFF' | 'DONE' | 'POLECAT_DONE' | 'TEST' | 'MESSAGE' {
		const knownTypes = ['ESCALATION', 'ERROR', 'HANDOFF', 'DONE', 'POLECAT_DONE', 'TEST'];
		return (knownTypes.includes(messageType) ? messageType : 'MESSAGE') as
			| 'ESCALATION'
			| 'ERROR'
			| 'HANDOFF'
			| 'DONE'
			| 'POLECAT_DONE'
			| 'TEST'
			| 'MESSAGE';
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<PageHeader
			title={data.message.subject}
			subtitle="From {formatAddress(data.message.from).name}"
			backLink={{ label: 'Back to Inbox', href: '/mail' }}
			showAccentBar={true}
		>
			{#snippet titleExtras()}
				<span class={typeBadgeVariants({ type: getBadgeType(data.message.messageType) })}>
					{data.message.messageType}
				</span>
				{#if data.message.priority !== 'normal'}
					<span
						class={priorityBadgeVariants({
							priority: data.message.priority as 'high' | 'normal' | 'low'
						})}
					>
						{data.message.priority}
					</span>
				{/if}
			{/snippet}
			{#snippet actions()}
				<a
					href="/mail/compose?to={encodeURIComponent(data.message.from)}&subject={encodeURIComponent('Re: ' + data.message.subject)}"
					class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/30 hover:bg-muted/50 rounded-md transition-colors"
				>
					<Reply class="w-4 h-4" />
					Reply
				</a>
			{/snippet}
		</PageHeader>

		<main class="container py-6 animate-blur-fade-up">
			<div class="panel-glass overflow-hidden">
				<!-- Message Metadata -->
				<div class="p-6 border-b border-border">
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span class="text-muted-foreground">From:</span>
							<span class="font-medium text-foreground ml-2">
								{formatAddress(data.message.from).name}
							</span>
							<span class="text-muted-foreground text-xs ml-1">
								({data.message.from})
							</span>
						</div>
						<div>
							<span class="text-muted-foreground">To:</span>
							<span class="font-medium text-foreground ml-2">
								{formatAddress(data.message.to).name}
							</span>
							<span class="text-muted-foreground text-xs ml-1">
								({data.message.to})
							</span>
						</div>
						<div class="col-span-2">
							<span class="text-muted-foreground">Date:</span>
							<span class="text-foreground ml-2">
								{formatTime(data.message.timestamp)}
							</span>
						</div>
					</div>
				</div>

				<!-- Message Body -->
				<div class="p-6">
					<div class="prose prose-sm prose-invert max-w-none">
						<pre
							class="whitespace-pre-wrap text-sm text-foreground bg-muted/30 p-6 rounded-lg font-mono leading-relaxed">{data.message.body}</pre>
					</div>
				</div>

				<!-- Message Footer / Metadata -->
				<div class="px-6 py-4 border-t border-border bg-muted/20">
					<div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
						<span>ID: <code class="font-mono">{data.message.id}</code></span>
						{#if data.message.threadId}
							<span>Thread: <code class="font-mono">{data.message.threadId}</code></span>
						{/if}
						<span>Read: {data.message.read ? 'Yes' : 'No'}</span>
					</div>
				</div>

				<!-- Actions -->
				<div class="px-6 py-4 border-t border-border flex items-center gap-3">
					<button
						type="button"
						class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/30 hover:bg-muted/50 rounded-md transition-colors"
					>
						<Forward class="w-4 h-4" />
						Forward
					</button>
				</div>
			</div>
		</main>
	</div>
</div>
