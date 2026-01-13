<script lang="ts">
	/**
	 * ErrorState - Consistent error display with retry button
	 * Shows error icon, message, and optional retry action
	 * Includes haptic feedback: error pattern on display, success on retry
	 */
	import { AlertCircle } from 'lucide-svelte';
	import { Button } from '$lib/components';
	import { hapticError, hapticSuccess } from '$lib/utils/haptics';
	import { onMount } from 'svelte';

	interface Props {
		title?: string; // Error title
		message?: string; // Error message
		onRetry?: () => void | Promise<void>; // Retry callback
		showRetryButton?: boolean; // Show retry button (default: true)
		isRetrying?: boolean; // Show loading state during retry
		compact?: boolean; // Compact layout (smaller padding/icon)
		class?: string; // Additional CSS classes
		hapticFeedback?: boolean; // Enable haptic feedback (default: true)
	}

	let {
		title = 'Something went wrong',
		message = 'We encountered an error. Please try again.',
		onRetry,
		showRetryButton = true,
		isRetrying = false,
		compact = false,
		class: className = '',
		hapticFeedback = true
	}: Props = $props();

	let isLoading = $state(false);

	// Trigger error haptic on component mount
	onMount(() => {
		if (hapticFeedback) {
			hapticError();
		}
	});

	async function handleRetry() {
		if (!onRetry) return;
		isLoading = true;
		try {
			await onRetry();
			// Success haptic on successful retry
			if (hapticFeedback) {
				hapticSuccess();
			}
		} finally {
			isLoading = false;
		}
	}
</script>

<div
	class={`flex flex-col items-center gap-4 ${
		compact ? 'p-4' : 'p-6'
	} rounded-lg border border-destructive/30 bg-destructive/5 text-center ${className}`}
	role="alert"
	aria-live="assertive"
>
	<!-- Error Icon -->
	<AlertCircle
		class={`text-destructive ${compact ? 'w-8 h-8' : 'w-12 h-12'}`}
		strokeWidth={1.5}
		aria-hidden="true"
	/>

	<!-- Error Title -->
	<div class="flex flex-col gap-1">
		<h3 class={`font-semibold text-destructive ${compact ? 'text-sm' : 'text-base'}`}>
			{title}
		</h3>

		<!-- Error Message -->
		{#if message}
			<p class={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
				{message}
			</p>
		{/if}
	</div>

	<!-- Retry Button -->
	{#if showRetryButton && onRetry}
		<Button
			variant="primary"
			size={compact ? 'sm' : 'default'}
			onclick={handleRetry}
			disabled={isLoading || isRetrying}
			class="mt-2"
		>
			{isLoading || isRetrying ? 'Retrying...' : 'Try Again'}
		</Button>
	{/if}
</div>

<style>
	/* No additional styles needed - uses Tailwind utilities */
</style>
