<script lang="ts">
	import { cn } from '$lib/utils';
	import { identifyKnownBug, getErrorCategory, type KnownBug, type ErrorCategoryInfo } from '$lib/errors';

	/**
	 * ErrorBoundary - Catches and displays errors within a component tree
	 *
	 * In Svelte 5, error boundaries work by passing an error snippet that gets
	 * rendered when an error occurs during rendering of children.
	 *
	 * Features:
	 * - Known Bug Detection integration (shows user-friendly messages for known issues)
	 * - Structured error logging with correlation IDs
	 * - Recovery actions (Retry and Report Issue)
	 *
	 * Usage:
	 * <ErrorBoundary>
	 *   <RiskyComponent />
	 *   {#snippet error(err, reset)}
	 *     <p>Error: {err.message}</p>
	 *     <button onclick={reset}>Retry</button>
	 *   {/snippet}
	 * </ErrorBoundary>
	 */

	interface Props {
		class?: string;
		fallbackMessage?: string;
		showRetry?: boolean;
		showReportIssue?: boolean;
		requestId?: string;
		onError?: (error: Error, context: ErrorContext) => void;
		onReport?: (error: Error, context: ErrorContext) => void;
		children: import('svelte').Snippet;
		fallback?: import('svelte').Snippet<[Error, () => void]>;
	}

	interface ErrorContext {
		requestId: string;
		knownBug: KnownBug | null;
		category: ErrorCategoryInfo;
		timestamp: string;
	}

	let {
		class: className = '',
		fallbackMessage = 'Something went wrong',
		showRetry = true,
		showReportIssue = true,
		requestId: propRequestId,
		onError,
		onReport,
		children,
		fallback
	}: Props = $props();

	// Error state
	let error = $state<Error | null>(null);
	let errorKey = $state(0);
	let errorContext = $state<ErrorContext | null>(null);

	// Derived state for known bug detection
	let knownBug = $derived(error ? identifyKnownBug(error.message) : null);
	let categoryInfo = $derived(error ? getErrorCategory(error) : null);

	// Display message - use known bug message if available, otherwise fallback
	let displayMessage = $derived(
		knownBug?.userMessage ?? categoryInfo?.defaultMessage ?? fallbackMessage
	);

	// Suggested action from known bug or category
	let suggestedAction = $derived(
		knownBug?.workaround ?? categoryInfo?.suggestedAction ?? null
	);

	// Category icon
	let categoryIcon = $derived(categoryInfo?.icon ?? '❌');

	// Reset function to retry rendering
	function reset() {
		error = null;
		errorContext = null;
		errorKey++;
	}

	// Generate or use provided requestId
	function getRequestId(): string {
		return propRequestId ?? crypto.randomUUID();
	}

	// Handle errors caught during rendering
	function handleError(e: Error) {
		const reqId = getRequestId();
		const bug = identifyKnownBug(e.message);
		const category = getErrorCategory(e);
		const timestamp = new Date().toISOString();

		const context: ErrorContext = {
			requestId: reqId,
			knownBug: bug,
			category,
			timestamp
		};

		// Structured error logging
		console.error('[ErrorBoundary]', {
			requestId: reqId,
			error: e.message,
			stack: e.stack,
			knownBug: bug?.id ?? null,
			category: category.category,
			timestamp
		});

		error = e;
		errorContext = context;
		onError?.(e, context);
	}

	// Handle report issue action
	function handleReportIssue() {
		if (error && errorContext) {
			if (onReport) {
				onReport(error, errorContext);
			} else {
				// Default behavior: log for now, could integrate with issue tracker
				console.info('[ErrorBoundary] Issue reported:', {
					requestId: errorContext.requestId,
					error: error.message,
					knownBug: errorContext.knownBug?.id,
					category: errorContext.category.category
				});
			}
		}
	}

	// Expose boundary API for programmatic use
	export function setError(e: Error) {
		handleError(e);
	}

	export function clearError() {
		reset();
	}
</script>

{#if error}
	{#if fallback}
		{@render fallback(error, reset)}
	{:else}
		<!-- Default error UI -->
		<div
			class={cn(
				'p-6 bg-destructive/5 border border-destructive/20 rounded-lg',
				className
			)}
			role="alert"
			aria-live="assertive"
		>
			<div class="flex items-start gap-4">
				<!-- Category icon -->
				<div class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-destructive/10 rounded-full text-lg">
					{#if knownBug}
						<span role="img" aria-label="Known issue">{categoryIcon}</span>
					{:else}
						<svg class="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					{/if}
				</div>

				<div class="flex-1 min-w-0">
					<h3 class="text-sm font-semibold text-destructive">
						{displayMessage}
					</h3>

					<!-- Show workaround for known bugs -->
					{#if suggestedAction}
						<p class="mt-1 text-sm text-muted-foreground">
							{suggestedAction}
						</p>
					{:else}
						<p class="mt-1 text-sm text-muted-foreground">
							{error.message}
						</p>
					{/if}

					<!-- Action buttons -->
					<div class="mt-4 flex flex-wrap items-center gap-2">
						{#if showRetry}
							<button
								type="button"
								onclick={reset}
								class={cn(
									'inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md',
									'bg-destructive/10 text-destructive',
									'hover:bg-destructive/20 transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive'
								)}
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
								Retry
							</button>
						{/if}

						{#if showReportIssue}
							<button
								type="button"
								onclick={handleReportIssue}
								class={cn(
									'inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md',
									'bg-muted text-muted-foreground',
									'hover:bg-muted/80 hover:text-foreground transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
								)}
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Report Issue
							</button>
						{/if}
					</div>
				</div>
			</div>

			<!-- Technical details in dev mode -->
			{#if import.meta.env.DEV}
				<details class="mt-4">
					<summary class="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
						Technical details
					</summary>
					<div class="mt-2 p-3 bg-muted rounded text-xs font-mono text-muted-foreground space-y-2">
						{#if errorContext}
							<div>
								<span class="text-foreground">Request ID:</span> {errorContext.requestId}
							</div>
							<div>
								<span class="text-foreground">Category:</span> {errorContext.category.category}
							</div>
							{#if knownBug}
								<div>
									<span class="text-foreground">Known Bug:</span> {knownBug.id}
								</div>
							{/if}
						{/if}
						{#if error.stack}
							<details class="mt-2">
								<summary class="cursor-pointer hover:text-foreground">Stack trace</summary>
								<pre class="mt-1 overflow-x-auto whitespace-pre-wrap">{error.stack}</pre>
							</details>
						{/if}
					</div>
				</details>
			{/if}
		</div>
	{/if}
{:else}
	{#key errorKey}
		{@render children()}
	{/key}
{/if}
