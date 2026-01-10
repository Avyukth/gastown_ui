<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import { X, MoreHorizontal } from 'lucide-svelte';
	/**
	 * Navigation item type - exported for use in other components
	 */
	export interface NavItem {
		id: string;
		label: string;
		href?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon?: any;
		badge?: number | string;
	}

	/**
	 * Navigation item variant definitions
	 * Dark industrial aesthetic with animated states
	 * Touch targets: ≥44x44px for accessibility
	 */
	const navItemVariants = tv({
		base: [
			'flex flex-col items-center justify-center gap-1',
			'min-w-[56px] min-h-[48px] py-2.5 px-2',
			'transition-all duration-fast ease-out-expo',
			'active:scale-95 active:transition-none',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
		],
		variants: {
			active: {
				true: [
					'text-primary',
					'[&_.nav-icon]:scale-100 [&_.nav-icon]:opacity-100'
				],
				false: [
					'text-muted-foreground hover:text-foreground',
					'[&_.nav-icon]:scale-90 [&_.nav-icon]:opacity-60',
					'hover:[&_.nav-icon]:scale-95 hover:[&_.nav-icon]:opacity-80'
				]
			}
		},
		defaultVariants: {
			active: false
		}
	});

	interface Props {
		items?: NavItem[];
		activeId?: string;
		maxVisible?: number;
		class?: string;
	}

	let {
		items = [],
		activeId = '',
		maxVisible = 5,
		class: className = ''
	}: Props = $props();

	// State for overflow menu
	let showOverflow = $state(false);

	// Split items into visible and overflow
	const visibleItems = $derived(items.slice(0, maxVisible - 1));
	const overflowItems = $derived(items.slice(maxVisible - 1));
	const hasOverflow = $derived(items.length > maxVisible);

	// Check if active item is in overflow
	const activeInOverflow = $derived(overflowItems.some(item => item.id === activeId));

	// Get active item index for animated underline positioning
	const displayItems = $derived(hasOverflow ? [...visibleItems, { id: '__more__', label: 'More' }] : items);
	const activeIndex = $derived(() => {
		if (activeInOverflow || showOverflow) {
			// More button is active
			return displayItems.length - 1;
		}
		return displayItems.findIndex(item => item.id === activeId);
	});

	// Calculate underline offset based on active index
	const underlineOffset = $derived(() => {
		const idx = activeIndex();
		if (idx < 0) return 0;
		const itemWidth = 100 / displayItems.length;
		return idx * itemWidth + itemWidth / 2;
	});

	// Trigger haptic feedback where supported
	function triggerHaptic() {
		if ('vibrate' in navigator) {
			navigator.vibrate(10);
		}
	}

	function toggleOverflow() {
		triggerHaptic();
		showOverflow = !showOverflow;
	}

	function closeOverflow() {
		showOverflow = false;
	}

	// Handle keyboard navigation
	function handleMenuKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeOverflow();
		}
	}

	// Handle swipe gesture to close overflow menu
	let touchStartY = $state(0);

	function handleTouchStart(event: TouchEvent) {
		touchStartY = event.touches[0].clientY;
	}

	function handleTouchEnd(event: TouchEvent) {
		if (!showOverflow) return;
		const touchEndY = event.changedTouches[0].clientY;
		const diff = touchEndY - touchStartY;
		// Close if swiped down more than 100px
		if (diff > 100) {
			closeOverflow();
		}
	}
</script>

<!-- Overflow backdrop -->
{#if showOverflow}
	<button
		class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
		onclick={closeOverflow}
		aria-label="Close navigation menu"
	></button>
{/if}

<!-- Overflow panel with spring animation -->
{#if showOverflow}
	<div
		class="fixed bottom-16 left-0 right-0 z-50 pb-safe px-safe"
		style="animation: slideInUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
		role="menu"
		tabindex="0"
		aria-label="Additional navigation options"
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
		onkeydown={handleMenuKeydown}
	>
		<div class="bg-card/95 backdrop-blur-xl border border-border rounded-t-2xl mx-2 mb-2 p-3 max-h-[60vh] overflow-y-auto shadow-xl">
			<div class="grid grid-cols-4 gap-2" role="none">
				{#each overflowItems as item}
					{@const isActive = item.id === activeId}
					<a
						href={item.href ?? '#'}
						class={cn(navItemVariants({ active: isActive }), 'relative rounded-xl')}
						role="menuitem"
						aria-current={isActive ? 'page' : undefined}
						onclick={() => { triggerHaptic(); closeOverflow(); }}
					>
						<span class="relative">
							{#if item.icon}
								<span class="nav-icon w-6 h-6 flex items-center justify-center transition-all duration-fast" aria-hidden="true">
									<item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
								</span>
							{:else}
								<span class="nav-icon w-6 h-6 rounded-full bg-current opacity-20 transition-all duration-fast" aria-hidden="true"></span>
							{/if}
							{#if item.badge}
								<span
									class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold text-destructive-foreground bg-destructive rounded-full flex items-center justify-center shadow-sm"
									aria-label="{item.badge} notifications"
								>
									{typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
								</span>
							{/if}
						</span>
						<span class="text-label-xs uppercase tracking-wider mt-0.5">{item.label}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>
{/if}

<nav
	class={cn(
		'fixed bottom-0 left-0 right-0 z-50',
		'bg-card/90 backdrop-blur-xl',
		'border-t border-border',
		'py-2 pb-safe px-safe',
		className
	)}
	aria-label="Bottom navigation"
	style="height: calc(64px + env(safe-area-inset-bottom))"
>
	<!-- Animated underline indicator -->
	{#if activeIndex() >= 0}
		<div
			class="absolute top-0 h-0.5 w-10 bg-primary rounded-full shadow-glow-primary transition-all duration-normal ease-spring"
			style="left: calc({underlineOffset()}% - 20px)"
			aria-hidden="true"
		></div>
	{/if}

	<div class="flex items-center justify-around max-w-lg mx-auto relative">
		{#if hasOverflow}
			<!-- Show visible items + More button -->
			{#each visibleItems as item}
				{@const isActive = item.id === activeId}
				<a
					href={item.href ?? '#'}
					class={cn(navItemVariants({ active: isActive }), 'relative')}
					aria-current={isActive ? 'page' : undefined}
					onclick={triggerHaptic}
				>
					<span class="relative">
						{#if item.icon}
							<span class="nav-icon w-6 h-6 flex items-center justify-center transition-all duration-fast" aria-hidden="true">
								<item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
							</span>
						{:else}
							<span class="nav-icon w-6 h-6 rounded-full bg-current opacity-20 transition-all duration-fast" aria-hidden="true"></span>
						{/if}
						{#if item.badge}
							<span
								class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold text-destructive-foreground bg-destructive rounded-full flex items-center justify-center shadow-sm"
								aria-label="{item.badge} notifications"
							>
								{typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
							</span>
						{/if}
					</span>
					<span class="text-label-xs uppercase tracking-wider mt-0.5">{item.label}</span>
				</a>
			{/each}
			<!-- More button -->
			<button
				class={cn(navItemVariants({ active: activeInOverflow || showOverflow }), 'relative')}
				onclick={toggleOverflow}
				aria-expanded={showOverflow}
				aria-haspopup="true"
				aria-label="More navigation options"
			>
				<span class="relative">
					<span class="nav-icon w-6 h-6 flex items-center justify-center transition-all duration-fast" aria-hidden="true">
						{#if showOverflow}
							<X size={20} strokeWidth={2.5} />
						{:else}
							<MoreHorizontal size={20} strokeWidth={activeInOverflow ? 2.5 : 2} />
						{/if}
					</span>
					{#if activeInOverflow && !showOverflow}
						<span
							class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full shadow-glow-primary"
							aria-hidden="true"
						></span>
					{/if}
				</span>
				<span class="text-label-xs uppercase tracking-wider mt-0.5">More</span>
			</button>
		{:else}
			<!-- Show all items when no overflow needed -->
			{#each items as item}
				{@const isActive = item.id === activeId}
				<a
					href={item.href ?? '#'}
					class={cn(navItemVariants({ active: isActive }), 'relative')}
					aria-current={isActive ? 'page' : undefined}
					onclick={triggerHaptic}
				>
					<span class="relative">
						{#if item.icon}
							<span class="nav-icon w-6 h-6 flex items-center justify-center transition-all duration-fast" aria-hidden="true">
								<item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
							</span>
						{:else}
							<span class="nav-icon w-6 h-6 rounded-full bg-current opacity-20 transition-all duration-fast" aria-hidden="true"></span>
						{/if}
						{#if item.badge}
							<span
								class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold text-destructive-foreground bg-destructive rounded-full flex items-center justify-center shadow-sm"
								aria-label="{item.badge} notifications"
							>
								{typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
							</span>
						{/if}
					</span>
					<span class="text-label-xs uppercase tracking-wider mt-0.5">{item.label}</span>
				</a>
			{/each}
		{/if}
	</div>
</nav>

<!-- Spacer to prevent content overlap - matches nav height (64px + safe area) -->
<div class="pb-safe" style="height: calc(64px + env(safe-area-inset-bottom))" aria-hidden="true"></div>

<style>
	/* Spring animation for overflow panel */
	@keyframes slideInUp {
		from {
			opacity: 0;
			transform: translateY(100%);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Respect reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		@keyframes slideInUp {
			from { opacity: 0; }
			to { opacity: 1; }
		}
	}
</style>
