<script lang="ts">
	/**
	 * Test wrapper for ErrorBoundary component
	 * Provides children snippet for testing and error trigger mechanism
	 */
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';

	interface Props {
		fallbackMessage?: string;
		showRetry?: boolean;
		showReportIssue?: boolean;
		requestId?: string;
		onError?: (error: Error, context: any) => void;
		onReport?: (error: Error, context: any) => void;
		class?: string;
		initialError?: Error | null;
	}

	let {
		fallbackMessage,
		showRetry = true,
		showReportIssue = true,
		requestId,
		onError,
		onReport,
		class: className = '',
		initialError = null
	}: Props = $props();

	let errorBoundaryRef: any = $state(null);

	// Track error state internally
	let pendingError = $state<Error | null>(initialError);

	// Call setError on the boundary after mount
	$effect(() => {
		if (pendingError && errorBoundaryRef) {
			errorBoundaryRef.setError(pendingError);
		}
	});

	export function setError(error: Error) {
		pendingError = error;
		if (errorBoundaryRef) {
			errorBoundaryRef.setError(error);
		}
	}

	export function clearError() {
		pendingError = null;
		if (errorBoundaryRef) {
			errorBoundaryRef.clearError();
		}
	}
</script>

<ErrorBoundary
	bind:this={errorBoundaryRef}
	{fallbackMessage}
	{showRetry}
	{showReportIssue}
	{requestId}
	{onError}
	{onReport}
	class={className}
>
	<div data-testid="children-content">Children rendered successfully</div>
</ErrorBoundary>
