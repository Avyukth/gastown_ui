<script lang="ts">
	/**
	 * Operation Center - Floating badge + slide-out panel for operation monitoring
	 *
	 * Shows all running and recent operations, providing visibility into
	 * long-running tasks with progress tracking, cancellation, and retry support.
	 */
	import { cn, formatDuration } from '$lib/utils';
	import { operationsStore, type Operation } from '$lib/stores/operations.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { X, RefreshCw, Copy, XCircle, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	interface Props {
		/** Additional classes */
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	// Panel state
	let expanded = $state(false);
	let focusedIndex = $state(-1);
	let panelRef = $state<HTMLElement | null>(null);

	// Get reactive data from store
	const hasRunning = $derived(operationsStore.hasRunning);
	const operations = $derived(operationsStore.operations);
	const runningOps = $derived(operationsStore.runningOperations);
	const completedOps = $derived(operationsStore.completedOperations);
	const failedOps = $derived(operationsStore.failedOperations);

	// Recent operations (running + recent completed/failed for display)
	const recentOperations = $derived.by(() => {
		const all = [...operations];
		// Sort by startedAt descending (most recent first)
		all.sort((a, b) => b.startedAt - a.startedAt);
		// Limit to most recent 10
		return all.slice(0, 10);
	});

	// Auto-expand when operations start
	$effect(() => {
		if (hasRunning && !expanded) {
			expanded = true;
		}
	});

	// Focus management when panel opens
	$effect(() => {
		if (expanded && panelRef) {
			panelRef.focus();
		}
	});

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (!expanded) return;

		switch (event.key) {
			case 'Escape':
				event.preventDefault();
				expanded = false;
				break;
			case 'ArrowDown':
				event.preventDefault();
				focusedIndex = Math.min(focusedIndex + 1, recentOperations.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				focusedIndex = Math.max(focusedIndex - 1, -1);
				break;
			case 'Enter':
				// Could expand details in the future
				break;
		}
	}

	// Operation actions
	async function handleCancel(op: Operation) {
		await operationsStore.cancel(op.id);
	}

	function handleRetry(op: Operation) {
		// Retry is a conceptual action - the store doesn't have a native retry
		// We'd need the original config to retry. For now, show a toast.
		toastStore.info(`Retry requested for: ${op.name}. Please re-trigger the operation.`, {
			duration: 4000
		});
	}

	async function copyDebugBundle(op: Operation) {
		const debugInfo = {
			id: op.id,
			name: op.name,
			type: op.type,
			status: op.status,
			error: op.error?.message ?? null,
			stack: op.error?.stack ?? null,
			startedAt: new Date(op.startedAt).toISOString(),
			completedAt: op.completedAt ? new Date(op.completedAt).toISOString() : null,
			duration: op.duration ?? null,
			progress: op.progress,
			metadata: op.metadata ?? {}
		};

		try {
			await navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
			toastStore.success('Debug info copied to clipboard', { duration: 2000 });
		} catch {
			toastStore.error('Failed to copy debug info', { duration: 3000 });
		}
	}

	function handleClearCompleted() {
		operationsStore.clearCompleted();
	}

	// Format operation time
	function formatOperationTime(op: Operation): string {
		if (op.completedAt && op.startedAt) {
			return formatDuration(op.completedAt - op.startedAt);
		}
		if (op.startedAt) {
			return formatDuration(Date.now() - op.startedAt);
		}
		return '';
	}

	// Get status icon component
	function getStatusIcon(status: Operation['status']) {
		switch (status) {
			case 'running':
				return Loader2;
			case 'completed':
				return CheckCircle2;
			case 'failed':
				return AlertCircle;
			case 'cancelled':
				return XCircle;
			default:
				return Clock;
		}
	}

	// Get status color classes
	function getStatusColor(status: Operation['status']): string {
		switch (status) {
			case 'running':
				return 'text-info';
			case 'completed':
				return 'text-success';
			case 'failed':
				return 'text-destructive';
			case 'cancelled':
				return 'text-muted-foreground';
			default:
				return 'text-muted-foreground';
		}
	}

	// Get progress bar color
	function getProgressColor(status: Operation['status']): string {
		switch (status) {
			case 'running':
				return 'bg-info';
			case 'completed':
				return 'bg-success';
			case 'failed':
				return 'bg-destructive';
			case 'cancelled':
				return 'bg-muted-foreground';
			default:
				return 'bg-muted-foreground';
		}
	}

	// Check if there are any completed/failed operations to clear
	const hasClearable = $derived(
		operations.some((o) => o.status === 'completed' || o.status === 'failed' || o.status === 'cancelled')
	);
</script>

<div class={cn('operation-center', className)}>
	<!-- Collapsed: floating badge -->
	{#if !expanded}
		<button
			class={cn(
				'fixed bottom-24 right-4 z-40',
				'flex items-center gap-2 px-4 py-2 rounded-full',
				'bg-card border border-border shadow-lg',
				'text-sm font-medium text-foreground',
				'transition-all duration-200 ease-out',
				'hover:shadow-xl hover:scale-105 hover:border-primary/50',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
				'md:bottom-4'
			)}
			style="bottom: calc(80px + env(safe-area-inset-bottom))"
			onclick={() => (expanded = true)}
			data-testid="operation-center-badge"
			aria-label="View operations"
		>
			{#if hasRunning}
				<span class="relative flex h-2 w-2">
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-75"
					></span>
					<span class="relative inline-flex h-2 w-2 rounded-full bg-info"></span>
				</span>
				<span>{runningOps.length} running</span>
			{:else}
				<span class="h-2 w-2 rounded-full bg-muted-foreground"></span>
				<span>Operations</span>
			{/if}
		</button>
	{/if}

	<!-- Expanded: slide-out panel -->
	{#if expanded}
		<!-- Backdrop -->
		<button
			class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
			onclick={() => (expanded = false)}
			aria-label="Close operation center"
			data-testid="operation-center-backdrop"
		></button>

		<!-- Panel -->
		<div
			bind:this={panelRef}
			class={cn(
				'fixed top-0 right-0 bottom-0 z-50 w-full max-w-md',
				'bg-background border-l border-border shadow-2xl',
				'flex flex-col',
				'animate-slide-in-right'
			)}
			data-testid="operation-center-panel"
			role="dialog"
			aria-modal="true"
			aria-label="Operation center"
			tabindex="-1"
			onkeydown={handleKeydown}
		>
			<!-- Header -->
			<header class="flex items-center justify-between px-4 py-3 border-b border-border">
				<div>
					<h2 class="text-lg font-semibold text-foreground">Operations</h2>
					<p class="text-xs text-muted-foreground">
						{runningOps.length} running, {operations.length} total
					</p>
				</div>
				<button
					type="button"
					class={cn(
						'p-2 rounded-lg',
						'text-muted-foreground hover:text-foreground',
						'hover:bg-muted/50 transition-colors',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
					)}
					onclick={() => (expanded = false)}
					aria-label="Close"
					data-testid="operation-center-close"
				>
					<X class="w-5 h-5" />
				</button>
			</header>

			<!-- Operation list -->
			<div class="flex-1 overflow-y-auto p-4 space-y-3">
				{#if recentOperations.length === 0}
					<p class="text-center text-sm text-muted-foreground py-8" data-testid="operation-empty-state">
						No operations yet
					</p>
				{:else}
					{#each recentOperations as op, index (op.id)}
						{@const StatusIcon = getStatusIcon(op.status)}
						<article
							class={cn(
								'p-3 rounded-lg border',
								'bg-card/50 border-border/50',
								'transition-all duration-150',
								focusedIndex === index && 'ring-2 ring-primary/50 border-primary/50'
							)}
							data-status={op.status}
							data-testid="operation-item"
							data-operation-id={op.id}
						>
							<!-- Operation header -->
							<div class="flex items-start justify-between gap-2 mb-2">
								<div class="flex items-center gap-2 min-w-0 flex-1">
									<StatusIcon
										class={cn(
											'w-4 h-4 flex-shrink-0',
											getStatusColor(op.status),
											op.status === 'running' && 'animate-spin'
										)}
									/>
									<div class="min-w-0 flex-1">
										<span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											{op.type}
										</span>
										<p class="text-sm font-medium text-foreground truncate">{op.name}</p>
									</div>
								</div>
								<span
									class={cn(
										'text-xs font-medium px-2 py-0.5 rounded-full',
										op.status === 'running' && 'bg-info/10 text-info',
										op.status === 'completed' && 'bg-success/10 text-success',
										op.status === 'failed' && 'bg-destructive/10 text-destructive',
										op.status === 'cancelled' && 'bg-muted text-muted-foreground',
										op.status === 'pending' && 'bg-muted text-muted-foreground'
									)}
								>
									{op.status}
								</span>
							</div>

							<!-- Description if present -->
							{#if op.description}
								<p class="text-xs text-muted-foreground mb-2 line-clamp-2">{op.description}</p>
							{/if}

							<!-- Progress bar for running operations -->
							{#if op.status === 'running' && op.progress !== undefined}
								<div class="mb-2">
									<div class="flex items-center justify-between text-xs text-muted-foreground mb-1">
										<span>Progress</span>
										<span>{op.progress}%</span>
									</div>
									<div class="w-full bg-muted rounded-full h-1.5 overflow-hidden">
										<div
											class={cn('h-full transition-all duration-300', getProgressColor(op.status))}
											style="width: {op.progress}%"
											role="progressbar"
											aria-valuenow={op.progress}
											aria-valuemin={0}
											aria-valuemax={100}
											aria-label="Operation progress"
										></div>
									</div>
								</div>
							{/if}

							<!-- Error message for failed operations -->
							{#if op.error}
								<p class="text-xs text-destructive bg-destructive/10 rounded px-2 py-1 mb-2">
									{op.error.message}
								</p>
							{/if}

							<!-- Action buttons -->
							<div class="flex items-center justify-between gap-2 mt-2">
								<time class="text-xs text-muted-foreground">
									{formatOperationTime(op)}
								</time>

								<div class="flex items-center gap-1">
									{#if op.status === 'running' && op.cancellable}
										<button
											type="button"
											class={cn(
												'px-2 py-1 text-xs rounded',
												'text-muted-foreground hover:text-foreground',
												'hover:bg-muted transition-colors',
												'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
											)}
											onclick={() => handleCancel(op)}
											data-testid="operation-cancel"
										>
											Cancel
										</button>
									{/if}

									{#if op.status === 'failed'}
										<button
											type="button"
											class={cn(
												'px-2 py-1 text-xs rounded flex items-center gap-1',
												'text-muted-foreground hover:text-foreground',
												'hover:bg-muted transition-colors',
												'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
											)}
											onclick={() => handleRetry(op)}
											data-testid="operation-retry"
										>
											<RefreshCw class="w-3 h-3" />
											Retry
										</button>

										<button
											type="button"
											class={cn(
												'px-2 py-1 text-xs rounded flex items-center gap-1',
												'text-muted-foreground hover:text-foreground',
												'hover:bg-muted transition-colors',
												'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
											)}
											onclick={() => copyDebugBundle(op)}
											data-testid="operation-copy-debug"
										>
											<Copy class="w-3 h-3" />
											Copy debug
										</button>
									{/if}
								</div>
							</div>
						</article>
					{/each}
				{/if}
			</div>

			<!-- Footer with clear button -->
			{#if hasClearable}
				<footer class="px-4 py-3 border-t border-border">
					<button
						type="button"
						class={cn(
							'w-full px-4 py-2 text-sm rounded-lg',
							'text-muted-foreground hover:text-foreground',
							'bg-muted/50 hover:bg-muted transition-colors',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
						)}
						onclick={handleClearCompleted}
						data-testid="clear-completed"
					>
						Clear completed
					</button>
				</footer>
			{/if}
		</div>
	{/if}
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-in-right {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 150ms ease-out;
	}

	.animate-slide-in-right {
		animation: slide-in-right 200ms ease-out;
	}
</style>
