<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { GridPattern } from '$lib/components';
	import type { PageData } from './$types';
	import { ArrowLeft, Reply, Forward } from 'lucide-svelte';

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
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
			<div class="container">
				<div class="flex items-center gap-4">
					<a
						href="/mail"
						class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft class="w-5 h-5" />
						<span class="text-sm font-medium">Back to Inbox</span>
					</a>
				</div>
			</div>
		</header>

		<main class="container py-6 animate-blur-fade-up">
			<div class="panel-glass overflow-hidden">
				<!-- Message Header -->
				<div class="p-6 border-b border-border">
					<div class="flex items-start gap-4">
						<div class="flex-1 min-w-0">
							<!-- Type Badge and Subject -->
							<div class="flex items-center gap-3 mb-3">
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
							</div>

							<h1 class="text-xl font-semibold text-foreground mb-4">
								{data.message.subject}
							</h1>

							<!-- Sender/Recipient Info -->
							<div class="space-y-2">
								<div class="flex items-center gap-2 text-sm">
									<span class="text-muted-foreground w-16">From:</span>
									<span class="font-medium text-foreground">
										{formatAddress(data.message.from).name}
									</span>
									<span class="text-muted-foreground text-xs">
										({data.message.from})
									</span>
								</div>
								<div class="flex items-center gap-2 text-sm">
									<span class="text-muted-foreground w-16">To:</span>
									<span class="font-medium text-foreground">
										{formatAddress(data.message.to).name}
									</span>
									<span class="text-muted-foreground text-xs">
										({data.message.to})
									</span>
								</div>
								<div class="flex items-center gap-2 text-sm">
									<span class="text-muted-foreground w-16">Date:</span>
									<span class="text-foreground">
										{formatTime(data.message.timestamp)}
									</span>
								</div>
							</div>
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
					<a
						href="/mail/compose?to={encodeURIComponent(data.message.from)}&subject={encodeURIComponent('Re: ' + data.message.subject)}"
						class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/30 hover:bg-muted/50 rounded-md transition-colors"
					>
						<Reply class="w-4 h-4" />
						Reply
					</a>
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
