<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { AlertTriangle, Lock, Search, Wrench, XCircle } from 'lucide-svelte';

	// Error info from SvelteKit
	const status = $derived($page.status);
	const message = $derived($page.error?.message ?? 'An unexpected error occurred');

	// Error code display info
	const errorInfo = $derived.by(() => {
		switch (status) {
			case 404:
				return {
					title: 'Page Not Found',
					description: 'The page you\'re looking for doesn\'t exist or has been moved.',
					icon: Search,
					suggestion: 'Check the URL or navigate back to the dashboard.'
				};
			case 403:
				return {
					title: 'Access Denied',
					description: 'You don\'t have permission to view this resource.',
					icon: Lock,
					suggestion: 'Contact an administrator if you believe this is an error.'
				};
			case 500:
				return {
					title: 'Server Error',
					description: 'Something went wrong on our end.',
					icon: AlertTriangle,
					suggestion: 'Try refreshing the page or come back later.'
				};
			case 503:
				return {
					title: 'Service Unavailable',
					description: 'The server is temporarily overloaded or under maintenance.',
					icon: Wrench,
					suggestion: 'Please try again in a few minutes.'
				};
			default:
				return {
					title: 'Error',
					description: message,
					icon: XCircle,
					suggestion: 'Try refreshing the page or go back to the dashboard.'
				};
		}
	});

	// Retry/refresh handler
	function handleRetry() {
		window.location.reload();
	}

	// Navigate to dashboard
	function handleGoHome() {
		goto('/');
	}

	// Navigate back
	function handleGoBack() {
		history.back();
	}
</script>

<svelte:head>
	<title>{status} - {errorInfo.title} | Gas Town</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4 bg-background">
	<div class="w-full max-w-lg">
		<!-- Error card with industrial styling -->
		<div class="relative bg-card border border-border rounded-xl p-8 shadow-lg">
			<!-- Corner accents (industrial decoration) -->
			<span class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-xl" aria-hidden="true"></span>
			<span class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-xl" aria-hidden="true"></span>
			<span class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-xl" aria-hidden="true"></span>
			<span class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-xl" aria-hidden="true"></span>

			<!-- Error icon and status -->
			<div class="text-center mb-6">
				{#if errorInfo.icon}
					{@const ErrorIcon = errorInfo.icon}
					<ErrorIcon
						class="w-12 h-12 text-destructive mx-auto mb-4"
						strokeWidth={2}
						aria-label={errorInfo.title}
					/>
				{/if}
				<div class="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-mono">
					<span class="w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
					ERROR {status}
				</div>
			</div>

			<!-- Error message -->
			<div class="text-center mb-8">
				<h1 class="text-2xl font-bold text-foreground mb-2">
					{errorInfo.title}
				</h1>
				<p class="text-muted-foreground mb-4">
					{errorInfo.description}
				</p>
				<p class="text-sm text-muted-foreground">
					{errorInfo.suggestion}
				</p>
			</div>

			<!-- Action buttons -->
			<div class="flex flex-col sm:flex-row gap-3 justify-center">
				<button
					type="button"
					onclick={handleGoBack}
					class={cn(
						'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
						'bg-muted text-foreground',
						'hover:bg-muted/80 transition-colors',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
						'touch-target'
					)}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Go Back
				</button>

				<button
					type="button"
					onclick={handleRetry}
					class={cn(
						'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
						'bg-muted text-foreground',
						'hover:bg-muted/80 transition-colors',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
						'touch-target'
					)}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					Retry
				</button>

				<button
					type="button"
					onclick={handleGoHome}
					class={cn(
						'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
						'bg-primary text-primary-foreground',
						'hover:bg-primary/90 transition-colors',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
						'touch-target'
					)}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
					</svg>
					Dashboard
				</button>
			</div>

			<!-- Technical details (dev mode) -->
			{#if import.meta.env.DEV && $page.error}
				<details class="mt-8 p-4 bg-muted/50 rounded-lg">
					<summary class="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
						Technical Details
					</summary>
					<pre class="mt-4 p-3 bg-background rounded text-xs font-mono text-muted-foreground overflow-x-auto">{JSON.stringify($page.error, null, 2)}</pre>
				</details>
			{/if}
		</div>

		<!-- Gas Town branding -->
		<p class="text-center text-xs text-muted-foreground mt-6">
			Gas Town v0.1.0
		</p>
	</div>
</div>
