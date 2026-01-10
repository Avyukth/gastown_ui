<script lang="ts">
	import { goto } from '$app/navigation';
	import { login, getAuthState } from '$lib/auth';
	import { cn } from '$lib/utils';
	import { User, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-svelte';

	// Form state
	let operatorId = $state('');
	let securityKey = $state('');
	let showSecurityKey = $state(false);
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);

	// Server status (simulated - in production, this would come from a health check endpoint)
	let serverStatus = $state<'online' | 'offline' | 'checking'>('checking');

	// Check server status on mount
	$effect(() => {
		checkServerStatus();
	});

	async function checkServerStatus() {
		serverStatus = 'checking';
		try {
			const response = await fetch('/api/auth/me', { method: 'HEAD' });
			serverStatus = response.ok || response.status === 401 ? 'online' : 'offline';
		} catch {
			serverStatus = 'offline';
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isSubmitting) return;

		errorMessage = null;
		isSubmitting = true;

		try {
			const result = await login({
				email: operatorId,
				password: securityKey
			});

			if (result.success) {
				// Redirect to dashboard on successful login
				goto('/');
			} else {
				errorMessage = result.error ?? 'Authentication failed. Please verify credentials.';
			}
		} catch {
			errorMessage = 'Connection error. Check server status.';
		} finally {
			isSubmitting = false;
		}
	}

	function toggleSecurityKeyVisibility() {
		showSecurityKey = !showSecurityKey;
	}

	// Status indicator styles
	const statusStyles = {
		online: 'bg-status-online',
		offline: 'bg-status-offline',
		checking: 'bg-status-pending animate-pulse'
	};

	const statusLabels = {
		online: 'OPERATIONAL',
		offline: 'OFFLINE',
		checking: 'CONNECTING...'
	};
</script>

<svelte:head>
	<title>Operator Authentication | Gas Town</title>
</svelte:head>

<div class="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
	<!-- Industrial background pattern -->
	<div class="absolute inset-0 opacity-5">
		<svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
					<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="1"/>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#grid)" class="text-foreground"/>
		</svg>
	</div>

	<!-- Main login panel -->
	<div class="relative w-full max-w-md">
		<!-- Corner accents -->
		<div class="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-primary"></div>
		<div class="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-primary"></div>
		<div class="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-primary"></div>
		<div class="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-primary"></div>

		<div class="card-glass p-8">
			<!-- Factory Logo -->
			<div class="flex flex-col items-center mb-8">
				<div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/30">
					<svg
						class="w-10 h-10 text-primary"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<!-- Gear icon representing industrial/factory -->
						<circle cx="12" cy="12" r="3"/>
						<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
						<circle cx="12" cy="12" r="7" stroke-dasharray="2 2"/>
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-foreground tracking-wide">Gas Town</h1>
				<p class="text-sm text-muted-foreground font-mono mt-1">OPERATOR AUTHENTICATION</p>
			</div>

			<!-- Login Form -->
			<form onsubmit={handleSubmit} class="space-y-6">
				<!-- Operator ID Field -->
				<div class="space-y-2">
					<label for="operator-id" class="block text-sm font-medium text-muted-foreground font-mono">
						OPERATOR ID
					</label>
					<div class="relative">
						<input
							id="operator-id"
							type="email"
							bind:value={operatorId}
							required
							autocomplete="email"
							placeholder="operator@gastown.local"
							class="w-full h-12 px-4 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-mono transition-shadow"
						/>
						<div class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
							<User class="w-5 h-5" />
						</div>
					</div>
				</div>

				<!-- Security Key Field -->
				<div class="space-y-2">
					<label for="security-key" class="block text-sm font-medium text-muted-foreground font-mono">
						SECURITY KEY
					</label>
					<div class="relative">
						<input
							id="security-key"
							type={showSecurityKey ? 'text' : 'password'}
							bind:value={securityKey}
							required
							autocomplete="current-password"
							placeholder="Enter security key"
							class="w-full h-12 px-4 pr-12 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-mono transition-shadow"
						/>
						<button
							type="button"
							onclick={toggleSecurityKeyVisibility}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-target-interactive"
							aria-label={showSecurityKey ? 'Hide security key' : 'Show security key'}
						>
							{#if showSecurityKey}
								<EyeOff class="w-5 h-5" />
							{:else}
								<Eye class="w-5 h-5" />
							{/if}
						</button>
					</div>
				</div>

				<!-- Error Message -->
				{#if errorMessage}
					<div class="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm font-mono" role="alert">
						<div class="flex items-center gap-2">
							<AlertCircle class="w-4 h-4 flex-shrink-0" />
							<span>{errorMessage}</span>
						</div>
					</div>
				{/if}

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={isSubmitting || serverStatus === 'offline'}
					class={cn(
						'w-full h-12 rounded-md font-mono font-medium text-sm tracking-wide transition-all touch-target',
						'bg-primary text-primary-foreground hover:bg-primary/90',
						'disabled:opacity-50 disabled:cursor-not-allowed',
						'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
						'active:scale-[0.98]'
					)}
				>
					{#if isSubmitting}
						<span class="flex items-center justify-center gap-2">
							<Loader2 class="w-4 h-4 animate-spin" />
							AUTHENTICATING...
						</span>
					{:else}
						INITIALIZE SESSION
					{/if}
				</button>
			</form>

			<!-- Divider -->
			<div class="relative my-8">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-border"></div>
				</div>
				<div class="relative flex justify-center text-xs">
					<span class="bg-card px-4 text-muted-foreground font-mono">ALTERNATIVE ACCESS</span>
				</div>
			</div>

			<!-- Alternative Auth Methods -->
			<div class="grid grid-cols-2 gap-3">
				<button
					type="button"
					disabled
					class="h-12 rounded-md border border-border bg-secondary/50 text-muted-foreground font-mono text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
					title="Bio-Scan authentication coming soon"
				>
					<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 0 0 8 11a4 4 0 1 1 8 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0 0 15.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 0 0 8 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
					</svg>
					BIO-SCAN
				</button>
				<button
					type="button"
					disabled
					class="h-12 rounded-md border border-border bg-secondary/50 text-muted-foreground font-mono text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
					title="Keycard authentication coming soon"
				>
					<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="3" y="5" width="18" height="14" rx="2"/>
						<line x1="3" y1="10" x2="21" y2="10"/>
						<line x1="7" y1="15" x2="7.01" y2="15"/>
						<line x1="11" y1="15" x2="13" y2="15"/>
					</svg>
					KEYCARD
				</button>
			</div>
		</div>

		<!-- Server Status Indicator -->
		<div class="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground">
			<span class="flex items-center gap-2">
				<span class={cn('w-2 h-2 rounded-full', statusStyles[serverStatus])} aria-hidden="true"></span>
				<span>SERVER: {statusLabels[serverStatus]}</span>
			</span>
			<span class="text-border">|</span>
			<button
				type="button"
				onclick={checkServerStatus}
				class="hover:text-foreground transition-colors underline-offset-2 hover:underline"
			>
				REFRESH
			</button>
		</div>
	</div>
</div>
