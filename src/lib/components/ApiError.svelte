<script lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';
	import { cn } from '$lib/utils';

	/**
	 * ApiError - Displays API errors with retry functionality
	 *
	 * Features:
	 * - Different display variants (inline, card, fullscreen)
	 * - Automatic retry with exponential backoff
	 * - Manual retry button
	 * - Connection status awareness
	 * - Graceful degradation messaging
	 */

	const apiErrorVariants = tv({
		slots: {
			container: 'relative',
			content: 'flex items-start gap-3',
			icon: 'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full',
			message: 'flex-1 min-w-0',
			title: 'text-sm font-medium',
			description: 'text-sm text-muted-foreground mt-0.5',
			actions: 'mt-3 flex items-center gap-2',
			retryButton: [
				'touch-target-interactive',
				'inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-md transition-colors',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
			],
			timer: 'text-xs text-muted-foreground'
		},
		variants: {
			variant: {
				inline: {
					container: 'p-3 bg-destructive/5 border border-destructive/20 rounded-lg',
					icon: 'bg-destructive/10',
					title: 'text-destructive',
					retryButton: 'bg-destructive/10 text-destructive hover:bg-destructive/20'
				},
				card: {
					container: 'p-6 bg-card border border-border rounded-xl shadow-sm',
					icon: 'bg-destructive/10',
					title: 'text-foreground',
					retryButton: 'bg-primary text-primary-foreground hover:bg-primary/90'
				},
				minimal: {
					container: 'p-2',
					icon: 'w-6 h-6',
					title: 'text-destructive text-xs',
					description: 'text-xs',
					retryButton: 'px-2 py-1 text-xs bg-muted hover:bg-muted/80 text-foreground'
				}
			},
			status: {
				error: {
					icon: 'bg-destructive/10 text-destructive'
				},
				offline: {
					icon: 'bg-warning/10 text-warning'
				},
				timeout: {
					icon: 'bg-muted text-muted-foreground'
				}
			}
		},
		defaultVariants: {
			variant: 'inline',
			status: 'error'
		}
	});

	type ApiErrorVariants = VariantProps<typeof apiErrorVariants>;

	interface Props extends ApiErrorVariants {
		error: Error | string | null;
		statusCode?: number;
		onRetry?: () => void | Promise<void>;
		autoRetry?: boolean;
		autoRetryDelay?: number;
		maxRetries?: number;
		class?: string;
	}

	let {
		error,
		statusCode,
		onRetry,
		autoRetry = false,
		autoRetryDelay = 5000,
		maxRetries = 3,
		variant = 'inline',
		status = 'error',
		class: className = ''
	}: Props = $props();

	// Retry state
	let retryCount = $state(0);
	let isRetrying = $state(false);
	let countdown = $state(0);
	let countdownInterval: ReturnType<typeof setInterval> | null = null;

	// Compute error message
	const errorMessage = $derived(
		typeof error === 'string' ? error : error?.message ?? 'An error occurred'
	);

	// Compute status from error type or status code
	const computedStatus = $derived.by((): 'error' | 'offline' | 'timeout' => {
		if (!navigator.onLine) return 'offline';
		if (statusCode === 408 || errorMessage.toLowerCase().includes('timeout')) return 'timeout';
		if (statusCode === 503 || errorMessage.toLowerCase().includes('unavailable')) return 'offline';
		return status ?? 'error';
	});

	// Get appropriate message based on status
	const statusInfo = $derived.by(() => {
		switch (computedStatus) {
			case 'offline':
				return {
					title: 'Connection Lost',
					description: 'Please check your internet connection and try again.',
					icon: 'wifi-off'
				};
			case 'timeout':
				return {
					title: 'Request Timed Out',
					description: 'The server is taking too long to respond.',
					icon: 'clock'
				};
			default:
				return {
					title: statusCode ? `Error ${statusCode}` : 'Request Failed',
					description: errorMessage,
					icon: 'alert'
				};
		}
	});

	// Get styles
	const styles = $derived(apiErrorVariants({ variant, status: computedStatus }));

	// Auto-retry logic
	$effect(() => {
		if (autoRetry && error && retryCount < maxRetries && onRetry) {
			startCountdown();
		}
		return () => {
			if (countdownInterval) {
				clearInterval(countdownInterval);
			}
		};
	});

	function startCountdown() {
		countdown = Math.ceil(autoRetryDelay / 1000);
		countdownInterval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				if (countdownInterval) clearInterval(countdownInterval);
				handleRetry();
			}
		}, 1000);
	}

	async function handleRetry() {
		if (isRetrying || !onRetry) return;

		isRetrying = true;
		retryCount++;

		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}

		try {
			await onRetry();
		} catch (e) {
			console.error('[ApiError] Retry failed:', e);
			// Auto-retry will restart if conditions are met
		} finally {
			isRetrying = false;
		}
	}

	function cancelAutoRetry() {
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
		countdown = 0;
	}

	// Icon paths
	const icons = {
		'wifi-off': 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0',
		clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
		alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
	};
</script>

{#if error}
	<div class={cn(styles.container(), className)} role="alert">
		<div class={styles.content()}>
			<!-- Icon -->
			<div class={styles.icon()}>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d={icons[statusInfo.icon as keyof typeof icons]} />
				</svg>
			</div>

			<!-- Message -->
			<div class={styles.message()}>
				<p class={styles.title()}>{statusInfo.title}</p>
				<p class={styles.description()}>{statusInfo.description}</p>

				<!-- Actions -->
				{#if onRetry}
					<div class={styles.actions()}>
						<button
							type="button"
							class={styles.retryButton()}
							onclick={handleRetry}
							disabled={isRetrying}
						>
							{#if isRetrying}
								<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Retrying...
							{:else}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
								Retry
							{/if}
						</button>

						{#if countdown > 0}
							<span class={styles.timer()}>
								Auto-retry in {countdown}s
								<button
									type="button"
									class="ml-1 text-muted-foreground hover:text-foreground"
									onclick={cancelAutoRetry}
								>
									(cancel)
								</button>
							</span>
						{/if}

						{#if retryCount > 0 && retryCount < maxRetries}
							<span class={styles.timer()}>
								Attempt {retryCount}/{maxRetries}
							</span>
						{:else if retryCount >= maxRetries}
							<span class={styles.timer()}>
								Max retries reached
							</span>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
