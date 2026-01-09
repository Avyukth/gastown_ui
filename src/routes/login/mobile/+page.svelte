<script lang="ts">
	import { goto } from '$app/navigation';
	import { GridPattern, StatusIndicator } from '$lib/components';
	import { login } from '$lib/auth';
	import { Loader2 } from 'lucide-svelte';

	// Auth method selection
	type AuthMethod = 'bio-scan' | 'keycard';
	let authMethod = $state<AuthMethod>('bio-scan');

	// Form state
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Bio-scan simulation state
	let scanProgress = $state(0);
	let scanStatus = $state<'idle' | 'scanning' | 'success' | 'error'>('idle');

	// Server status (mock - would come from WebSocket in real app)
	let serverStatus = $state<'online' | 'offline' | 'degraded'>('online');

	// Handle bio-scan authentication
	async function handleBioScan() {
		if (scanStatus === 'scanning') return;

		scanStatus = 'scanning';
		scanProgress = 0;
		error = null;

		// Simulate bio-scan progress
		const interval = setInterval(() => {
			scanProgress += 10;
			if (scanProgress >= 100) {
				clearInterval(interval);
				// Simulate success (demo mode)
				handleBioScanComplete();
			}
		}, 150);
	}

	async function handleBioScanComplete() {
		scanStatus = 'success';

		// Auto-login with demo credentials for bio-scan
		try {
			const result = await login({ email: 'operator@gastown.local', password: 'demo' });
			if (result.success) {
				await goto('/');
			} else {
				scanStatus = 'error';
				error = result.error ?? 'Bio-scan authentication failed';
			}
		} catch (e) {
			scanStatus = 'error';
			error = 'Bio-scan authentication failed';
		}
	}

	// Handle keycard (credential) login
	async function handleKeycardLogin(e: SubmitEvent) {
		e.preventDefault();
		if (!email || !password) {
			error = 'Keycard ID and access code required';
			return;
		}

		isLoading = true;
		error = null;

		try {
			const result = await login({ email, password });
			if (result.success) {
				await goto('/');
			} else {
				error = result.error ?? 'Invalid credentials';
			}
		} catch (e) {
			error = 'Authentication failed';
		} finally {
			isLoading = false;
		}
	}

	// Server status text
	const serverStatusText = $derived(
		serverStatus === 'online'
			? 'All systems operational'
			: serverStatus === 'degraded'
				? 'Degraded performance'
				: 'Connection lost'
	);
</script>

<svelte:head>
	<title>Login | Gas Town</title>
</svelte:head>

<!-- Full-screen login container -->
<div class="relative min-h-screen flex flex-col bg-background overflow-hidden">
	<!-- Industrial grid background -->
	<GridPattern variant="lines" opacity={0.03} class="z-0" />

	<!-- Top industrial accent bar -->
	<div class="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary relative z-10">
		<div class="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,hsl(var(--background)/0.3)_8px,hsl(var(--background)/0.3)_16px)]"></div>
	</div>

	<!-- Main content -->
	<main class="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
		<!-- Logo/Title section -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/30 mb-4">
				<svg class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2L2 7l10 5 10-5-10-5z" />
					<path d="M2 17l10 5 10-5" />
					<path d="M2 12l10 5 10-5" />
				</svg>
			</div>
			<h1 class="text-2xl font-bold text-foreground">Gas Town</h1>
			<p class="text-sm text-muted-foreground mt-1">Multi-Agent Orchestration</p>
		</div>

		<!-- Auth method tabs -->
		<div class="w-full max-w-sm mb-6">
			<div class="flex rounded-lg bg-secondary/50 p-1">
				<button
					type="button"
					class="flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 touch-target-interactive
						{authMethod === 'bio-scan'
							? 'bg-card shadow-md text-foreground'
							: 'text-muted-foreground hover:text-foreground'}"
					onclick={() => (authMethod = 'bio-scan')}
					aria-pressed={authMethod === 'bio-scan'}
				>
					<span class="flex items-center justify-center gap-2">
						<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
						</svg>
						Bio-Scan
					</span>
				</button>
				<button
					type="button"
					class="flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 touch-target-interactive
						{authMethod === 'keycard'
							? 'bg-card shadow-md text-foreground'
							: 'text-muted-foreground hover:text-foreground'}"
					onclick={() => (authMethod = 'keycard')}
					aria-pressed={authMethod === 'keycard'}
				>
					<span class="flex items-center justify-center gap-2">
						<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="5" width="18" height="14" rx="2" />
							<line x1="3" y1="10" x2="21" y2="10" />
							<circle cx="7" cy="15" r="1" fill="currentColor" />
						</svg>
						Keycard
					</span>
				</button>
			</div>
		</div>

		<!-- Auth method content -->
		<div class="w-full max-w-sm">
			{#if authMethod === 'bio-scan'}
				<!-- Bio-Scan authentication -->
				<div class="card-glass p-6 animate-fade-in">
					<div class="text-center">
						<p class="text-sm text-muted-foreground mb-6">
							Place your finger on the scanner to authenticate
						</p>

						<!-- Fingerprint scanner button -->
						<button
							type="button"
							onclick={handleBioScan}
							disabled={scanStatus === 'scanning'}
							class="relative w-32 h-32 mx-auto rounded-full border-4 transition-all duration-300 touch-target-interactive
								{scanStatus === 'scanning'
									? 'border-primary animate-pulse'
									: scanStatus === 'success'
										? 'border-status-online'
										: scanStatus === 'error'
											? 'border-destructive'
											: 'border-border hover:border-primary/50'}"
							aria-label="Start bio-scan"
						>
							<!-- Progress ring -->
							{#if scanStatus === 'scanning'}
								<svg class="absolute inset-0 w-full h-full -rotate-90">
									<circle
										cx="64"
										cy="64"
										r="58"
										fill="none"
										stroke="hsl(var(--primary) / 0.2)"
										stroke-width="4"
									/>
									<circle
										cx="64"
										cy="64"
										r="58"
										fill="none"
										stroke="hsl(var(--primary))"
										stroke-width="4"
										stroke-linecap="round"
										stroke-dasharray={2 * Math.PI * 58}
										stroke-dashoffset={2 * Math.PI * 58 * (1 - scanProgress / 100)}
										class="transition-all duration-150"
									/>
								</svg>
							{/if}

							<!-- Fingerprint icon -->
							<svg
								class="w-12 h-12 mx-auto transition-colors duration-200
									{scanStatus === 'success' ? 'text-status-online' : scanStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'}"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
							</svg>
						</button>

						<!-- Scan status text -->
						<p class="mt-4 text-sm font-medium
							{scanStatus === 'scanning' ? 'text-primary' : scanStatus === 'success' ? 'text-status-online' : scanStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'}">
							{#if scanStatus === 'scanning'}
								Scanning... {scanProgress}%
							{:else if scanStatus === 'success'}
								Verified
							{:else if scanStatus === 'error'}
								Scan failed
							{:else}
								Tap to scan
							{/if}
						</p>
					</div>
				</div>
			{:else}
				<!-- Keycard authentication (email/password) -->
				<form onsubmit={handleKeycardLogin} class="card-glass p-6 animate-fade-in">
					<div class="space-y-4">
						<div>
							<label for="email" class="block text-sm font-medium text-foreground mb-2">
								Keycard ID
							</label>
							<input
								type="email"
								id="email"
								bind:value={email}
								placeholder="operator@gastown.local"
								autocomplete="email"
								required
								class="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground
									placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
									touch-target"
							/>
						</div>

						<div>
							<label for="password" class="block text-sm font-medium text-foreground mb-2">
								Access Code
							</label>
							<input
								type="password"
								id="password"
								bind:value={password}
								placeholder="Enter access code"
								autocomplete="current-password"
								required
								class="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground
									placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
									touch-target"
							/>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							class="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium
								hover:bg-primary/90 active:scale-[0.98] transition-all duration-150
								disabled:opacity-50 disabled:cursor-not-allowed touch-target-interactive"
						>
							{#if isLoading}
								<span class="flex items-center justify-center gap-2">
									<Loader2 class="w-4 h-4 animate-spin" />
									Authenticating...
								</span>
							{:else}
								Authenticate
							{/if}
						</button>
					</div>

					<p class="text-xs text-muted-foreground text-center mt-4">
						Demo: Use any email with access code "demo"
					</p>
				</form>
			{/if}

			<!-- Error message -->
			{#if error}
				<div class="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center animate-shake" role="alert">
					{error}
				</div>
			{/if}
		</div>
	</main>

	<!-- Server status footer -->
	<footer class="relative z-10 pb-safe">
		<!-- Industrial bottom accent -->
		<div class="h-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>

		<div class="px-6 py-4 flex items-center justify-center gap-3 bg-card/50 backdrop-blur-sm">
			<StatusIndicator
				status={serverStatus === 'online' ? 'running' : serverStatus === 'degraded' ? 'warning' : 'error'}
				size="sm"
			/>
			<span class="text-xs text-muted-foreground font-mono uppercase tracking-wider">
				{serverStatusText}
			</span>
		</div>

		<!-- Industrial hazard stripes accent -->
		<div class="h-2 bg-[repeating-linear-gradient(45deg,hsl(var(--primary)),hsl(var(--primary))_10px,hsl(var(--primary)/0.7)_10px,hsl(var(--primary)/0.7)_20px)]"></div>
	</footer>

	<!-- Corner industrial decorations -->
	<div class="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-border/50 z-10"></div>
	<div class="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-border/50 z-10"></div>
	<div class="absolute bottom-20 left-4 w-8 h-8 border-l-2 border-b-2 border-border/50 z-10"></div>
	<div class="absolute bottom-20 right-4 w-8 h-8 border-r-2 border-b-2 border-border/50 z-10"></div>
</div>
