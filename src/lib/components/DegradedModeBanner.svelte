<script lang="ts">
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	import { AlertTriangle, X } from 'lucide-svelte';

	interface Props {
		/** Additional classes */
		class?: string;
		/** Check interval in milliseconds */
		checkInterval?: number;
	}

	let { class: className = '', checkInterval = 30000 }: Props = $props();

	// Degradation tracking
	let isDegraded = $state(false);
	let degradedServices = $state<string[]>([]);
	let isDismissed = $state(false);
	let mounted = $state(false);
	let checkTimer: ReturnType<typeof setInterval> | null = null;

	// Derived state
	const showBanner = $derived(mounted && isDegraded && !isDismissed);
	const servicesText = $derived(degradedServices.join(', '));

	/**
	 * Check system status via snapshot API
	 */
	async function checkSystemStatus() {
		try {
			const response = await fetch('/api/gastown/snapshot', {
				signal: AbortSignal.timeout(5000)
			});

			if (!response.ok) {
				degradedServices = ['API unavailable'];
				isDegraded = true;
				return;
			}

			const data = await response.json();
			const services: string[] = [];

			// Check each rig for witness/refinery
			for (const rig of data.rigs || []) {
				if (!rig.has_witness) {
					services.push(`${rig.name} witness`);
				}
				if (!rig.has_refinery) {
					services.push(`${rig.name} refinery`);
				}
			}

			// Check for idle polecats (no active work across all rigs)
			const hasActiveWork = (data.polecats || []).some((p: any) => p.has_work);
			if (!hasActiveWork && data.polecats?.length > 0) {
				services.push('no active work');
			}

			// Update state
			degradedServices = services;
			isDegraded = services.length > 0;

			// Reset dismissal if system recovered
			if (services.length === 0) {
				isDismissed = false;
			}
		} catch (error) {
			console.error('Failed to check system status:', error);
			degradedServices = ['status check failed'];
			isDegraded = true;
		}
	}

	function handleDismiss() {
		isDismissed = true;
	}

	onMount(() => {
		mounted = true;

		// Initial check
		checkSystemStatus();

		// Periodic checks
		checkTimer = setInterval(checkSystemStatus, checkInterval);

		return () => {
			if (checkTimer) {
				clearInterval(checkTimer);
			}
		};
	});
</script>

<!--
	Degraded Mode Banner Component

	Displays a banner at the top of the page when Gas Town is in degraded mode.
	Checks for:
	- Missing witness agents
	- Missing refinery agents
	- No active work across polecats
	- API unavailability

	Features:
	- Auto-checks system status every 30s
	- Dismissible (until system changes state)
	- Accessible (role="alert", aria attributes)
	- Animated entrance
-->

{#if showBanner}
	<div
		class={cn(
			'fixed top-0 left-0 right-0 z-40',
			'bg-warning/10 border-b border-warning/30',
			'animate-blur-fade-down',
			className
		)}
		role="alert"
		aria-live="polite"
		aria-atomic="true"
	>
		<div class="container mx-auto px-4 py-3">
			<div class="flex items-center gap-3">
				<!-- Warning icon -->
				<AlertTriangle class="w-5 h-5 text-warning shrink-0" aria-hidden="true" />

				<!-- Message -->
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-foreground">
						<span class="font-semibold">Degraded Mode:</span>
						<span class="text-muted-foreground ml-1">
							{servicesText}
						</span>
					</p>
				</div>

				<!-- Dismiss button -->
				<button
					type="button"
					onclick={handleDismiss}
					class={cn(
						'p-1 -m-1',
						'text-muted-foreground hover:text-foreground',
						'transition-colors',
						'rounded',
						'focus-ring'
					)}
					aria-label="Dismiss degraded mode banner"
				>
					<X class="w-4 h-4" aria-hidden="true" />
				</button>
			</div>
		</div>
	</div>
{/if}
