<script lang="ts">
	import { cn } from '$lib/utils';
	import { networkState, toastStore } from '$lib/stores';
	import { onMount } from 'svelte';

	interface Props {
		/** Show queued actions count badge */
		showQueueCount?: boolean;
		/** Show toast notifications on status change */
		showToasts?: boolean;
		/** Position of the indicator */
		position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';
		/** Size variant */
		size?: 'sm' | 'md' | 'lg';
		/** Additional classes */
		class?: string;
	}

	let {
		showQueueCount = true,
		showToasts = true,
		position = 'bottom-left',
		size = 'md',
		class: className = ''
	}: Props = $props();

	// Track if component is mounted (for SSR safety)
	let mounted = $state(false);

	// Position classes
	const positionClasses: Record<NonNullable<Props['position']>, string> = {
		'top-left': 'fixed top-4 left-4 z-40',
		'top-right': 'fixed top-4 right-4 z-40',
		'bottom-left': 'fixed bottom-20 left-4 z-40', // Above bottom nav
		'bottom-right': 'fixed bottom-20 right-4 z-40',
		inline: 'relative'
	};

	// Size classes
	const sizeClasses: Record<NonNullable<Props['size']>, { container: string; icon: string; text: string; badge: string }> = {
		sm: {
			container: 'px-2 py-1.5 gap-1.5',
			icon: 'w-3.5 h-3.5',
			text: 'text-xs',
			badge: 'w-4 h-4 text-2xs'
		},
		md: {
			container: 'px-3 py-2 gap-2',
			icon: 'w-4 h-4',
			text: 'text-sm',
			badge: 'w-5 h-5 text-xs'
		},
		lg: {
			container: 'px-4 py-2.5 gap-2.5',
			icon: 'w-5 h-5',
			text: 'text-base',
			badge: 'w-6 h-6 text-sm'
		}
	};

	// Make sizes reactive to prop changes
	const sizes = $derived(sizeClasses[size]);

	onMount(() => {
		mounted = true;

		if (showToasts) {
			// Subscribe to network status changes for toast notifications
			const unsubscribe = networkState.onStatusChange((isOnline) => {
				if (isOnline) {
					toastStore.success('Back online', { duration: 3000 });
				} else {
					toastStore.warning('You are offline', { duration: 0, dismissible: false });
				}
			});

			return unsubscribe;
		}
	});

	// Derived values for reactivity
	const isOffline = $derived(networkState.isOffline);
	const queuedCount = $derived(networkState.queuedCount);
	const hasQueuedActions = $derived(queuedCount > 0);
</script>

<!--
	Offline Indicator Component

	Shows when the user is offline with:
	- Visual indicator (red pill with icon)
	- Optional queued actions count badge
	- Accessible announcements
	- Auto-hides when back online
-->

{#if mounted && isOffline}
	<div
		class={cn(
			positionClasses[position],
			'flex items-center',
			sizes.container,
			'rounded-full',
			'bg-destructive/90 text-destructive-foreground',
			'border border-destructive/20',
			'shadow-lg backdrop-blur-sm',
			'animate-slide-in-up',
			'pb-safe pl-safe',
			className
		)}
		role="status"
		aria-live="polite"
		aria-label={hasQueuedActions ? `Offline. ${queuedCount} action${queuedCount === 1 ? '' : 's'} queued.` : 'Offline'}
	>
		<!-- Offline icon (cloud with slash) -->
		<svg
			class={cn(sizes.icon, 'flex-shrink-0')}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M18.364 5.636a9 9 0 010 12.728m0 0l-12.728-12.728m12.728 12.728L5.636 5.636"
			/>
		</svg>

		<!-- Offline text -->
		<span class={cn(sizes.text, 'font-medium')}>Offline</span>

		<!-- Queued actions badge -->
		{#if showQueueCount && hasQueuedActions}
			<span
				class={cn(
					sizes.badge,
					'flex items-center justify-center',
					'rounded-full',
					'bg-destructive-foreground text-destructive',
					'font-semibold',
					'ml-1'
				)}
				aria-label={`${queuedCount} queued`}
			>
				{queuedCount > 99 ? '99+' : queuedCount}
			</span>
		{/if}
	</div>
{/if}
