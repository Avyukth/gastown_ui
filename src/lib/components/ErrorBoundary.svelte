<script lang="ts">
	import { cn } from '$lib/utils';

	/**
	 * ErrorBoundary - Catches and displays errors within a component tree
	 *
	 * In Svelte 5, error boundaries work by passing an error snippet that gets
	 * rendered when an error occurs during rendering of children.
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
		onError?: (error: Error) => void;
		children: import('svelte').Snippet;
		fallback?: import('svelte').Snippet<[Error, () => void]>;
	}

	let {
		class: className = '',
		fallbackMessage = 'Something went wrong',
		showRetry = true,
		onError,
		children,
		fallback
	}: Props = $props();

	// Error state
	let error = $state<Error | null>(null);
	let errorKey = $state(0);

	// Reset function to retry rendering
	function reset() {
		error = null;
		errorKey++;
	}

	// Handle errors caught during rendering
	function handleError(e: Error) {
		error = e;
		onError?.(e);
		console.error('[ErrorBoundary] Caught error:', e);
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
		>
			<div class="flex items-start gap-4">
				<!-- Error icon -->
				<div class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-destructive/10 rounded-full">
					<svg class="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				</div>

				<div class="flex-1 min-w-0">
					<h3 class="text-sm font-semibold text-destructive">
						{fallbackMessage}
					</h3>
					<p class="mt-1 text-sm text-muted-foreground">
						{error.message}
					</p>

					{#if showRetry}
						<button
							type="button"
							onclick={reset}
							class={cn(
								'mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md',
								'bg-destructive/10 text-destructive',
								'hover:bg-destructive/20 transition-colors',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive'
							)}
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							Try Again
						</button>
					{/if}
				</div>
			</div>

			<!-- Technical details in dev mode -->
			{#if import.meta.env.DEV && error.stack}
				<details class="mt-4">
					<summary class="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
						Stack trace
					</summary>
					<pre class="mt-2 p-3 bg-muted rounded text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">{error.stack}</pre>
				</details>
			{/if}
		</div>
	{/if}
{:else}
	{#key errorKey}
		{@render children()}
	{/key}
{/if}
