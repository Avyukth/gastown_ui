<script lang="ts">
	/**
	 * SwipeableTabs Component
	 *
	 * Mobile-first tab navigation with swipe gesture support.
	 * Features smooth transitions, animated indicators, and accessibility support.
	 *
	 * @example
	 * <SwipeableTabs
	 *   tabs={[
	 *     { id: 'agents', label: 'Agents', icon: Bot },
	 *     { id: 'flows', label: 'Flows', icon: FlaskConical },
	 *   ]}
	 *   bind:activeTab
	 * >
	 *   {#snippet content(tabId)}
	 *     {#if tabId === 'agents'}
	 *       <AgentsList />
	 *     {/if}
	 *   {/snippet}
	 * </SwipeableTabs>
	 */
	import { tv } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import { browser } from '$app/environment';
	import type { Snippet, ComponentType } from 'svelte';

	const swipeableTabs = tv({
		slots: {
			container: 'relative overflow-hidden',
			header: 'relative panel-glass border-b border-border',
			tabList: 'flex items-center overflow-x-auto scrollbar-none',
			tabButton: [
				'relative flex items-center justify-center gap-2 px-4 py-3',
				'min-w-[80px] flex-1 md:flex-none',
				'text-sm font-medium whitespace-nowrap',
				'transition-colors duration-200',
				'touch-target-interactive focus-ring'
			].join(' '),
			indicator: [
				'absolute bottom-0 h-0.5 bg-primary rounded-full',
				'transition-all duration-300 ease-out'
			].join(' '),
			panelContainer: 'relative touch-pan-y overflow-hidden',
			panelTrack: 'flex transition-transform duration-300 ease-out will-change-transform',
			panel: 'w-full flex-shrink-0'
		},
		variants: {
			tabState: {
				active: { tabButton: 'text-primary' },
				inactive: { tabButton: 'text-muted-foreground hover:text-foreground' }
			},
			swiping: {
				true: { panelTrack: 'transition-none' },
				false: {}
			}
		},
		defaultVariants: {
			tabState: 'inactive',
			swiping: false
		}
	});

	interface Tab {
		id: string;
		label: string;
		icon?: ComponentType;
		badge?: number | string;
		disabled?: boolean;
	}

	interface Props {
		/** Array of tab definitions */
		tabs: Tab[];
		/** Currently active tab ID */
		activeTab?: string;
		/** Swipe threshold in pixels (default: 50) */
		swipeThreshold?: number;
		/** Minimum swipe velocity to trigger change (px/ms, default: 0.3) */
		velocityThreshold?: number;
		/** Additional CSS classes */
		class?: string;
		/** Content snippet - receives current tab ID */
		content?: Snippet<[string]>;
		/** Callback when tab changes */
		onTabChange?: (tabId: string) => void;
	}

	let {
		tabs = [],
		activeTab = $bindable(tabs[0]?.id ?? ''),
		swipeThreshold = 50,
		velocityThreshold = 0.3,
		class: className,
		content,
		onTabChange
	}: Props = $props();

	// Styles
	const styles = swipeableTabs();

	// State
	let containerEl: HTMLDivElement;
	let tabListEl: HTMLDivElement;
	let startX = $state(0);
	let startY = $state(0);
	let startTime = $state(0);
	let currentX = $state(0);
	let isSwiping = $state(false);
	let swipeDirection = $state<'horizontal' | 'vertical' | null>(null);
	let indicatorStyle = $state({ left: 0, width: 0 });

	// Computed
	const activeIndex = $derived(tabs.findIndex(t => t.id === activeTab));
	const translateX = $derived(isSwiping ? currentX : 0);

	// Update indicator position when active tab changes
	$effect(() => {
		if (browser && tabListEl) {
			updateIndicator();
		}
	});

	function updateIndicator() {
		const activeButton = tabListEl?.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
		if (activeButton) {
			indicatorStyle = {
				left: activeButton.offsetLeft,
				width: activeButton.offsetWidth
			};
		}
	}

	function setActiveTab(tabId: string) {
		if (tabId === activeTab) return;

		const tab = tabs.find(t => t.id === tabId);
		if (tab?.disabled) return;

		activeTab = tabId;
		triggerHaptic();
		onTabChange?.(tabId);
	}

	function handlePointerDown(e: PointerEvent) {
		// Only handle touch/pen, not mouse (mouse users have tabs)
		if (e.pointerType === 'mouse') return;

		startX = e.clientX;
		startY = e.clientY;
		startTime = Date.now();
		currentX = 0;
		isSwiping = true;
		swipeDirection = null;
		(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isSwiping) return;

		const deltaX = e.clientX - startX;
		const deltaY = e.clientY - startY;

		// Determine direction on first significant movement
		if (!swipeDirection && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
			swipeDirection = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
		}

		// Only handle horizontal swipes
		if (swipeDirection !== 'horizontal') {
			return;
		}

		e.preventDefault();

		// Calculate bounded translation
		const maxLeft = activeIndex === 0 ? 50 : Infinity;
		const maxRight = activeIndex === tabs.length - 1 ? -50 : -Infinity;

		// Apply resistance at edges
		let boundedDelta = deltaX;
		if ((deltaX > 0 && activeIndex === 0) || (deltaX < 0 && activeIndex === tabs.length - 1)) {
			boundedDelta = deltaX * 0.3; // Resistance factor
		}

		currentX = Math.max(maxRight, Math.min(maxLeft, boundedDelta));
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isSwiping) return;

		const deltaX = currentX;
		const deltaTime = Date.now() - startTime;
		const velocity = Math.abs(deltaX) / deltaTime;

		// Determine if we should change tabs
		const shouldChange = Math.abs(deltaX) > swipeThreshold || velocity > velocityThreshold;

		if (shouldChange && swipeDirection === 'horizontal') {
			if (deltaX > 0 && activeIndex > 0) {
				// Swiped right - go to previous tab
				setActiveTab(tabs[activeIndex - 1].id);
			} else if (deltaX < 0 && activeIndex < tabs.length - 1) {
				// Swiped left - go to next tab
				setActiveTab(tabs[activeIndex + 1].id);
			}
		}

		// Reset state
		isSwiping = false;
		currentX = 0;
		swipeDirection = null;
	}

	function handleKeyDown(e: KeyboardEvent) {
		let newIndex = activeIndex;

		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				newIndex = Math.max(0, activeIndex - 1);
				break;
			case 'ArrowRight':
				e.preventDefault();
				newIndex = Math.min(tabs.length - 1, activeIndex + 1);
				break;
			case 'Home':
				e.preventDefault();
				newIndex = 0;
				break;
			case 'End':
				e.preventDefault();
				newIndex = tabs.length - 1;
				break;
			default:
				return;
		}

		// Skip disabled tabs
		while (tabs[newIndex]?.disabled && newIndex !== activeIndex) {
			newIndex += e.key === 'ArrowLeft' ? -1 : 1;
			if (newIndex < 0 || newIndex >= tabs.length) {
				newIndex = activeIndex;
				break;
			}
		}

		if (newIndex !== activeIndex && !tabs[newIndex]?.disabled) {
			setActiveTab(tabs[newIndex].id);
			// Focus the new tab button
			const newButton = tabListEl?.querySelector(`[data-tab-id="${tabs[newIndex].id}"]`) as HTMLElement;
			newButton?.focus();
		}
	}

	function triggerHaptic() {
		if (browser && 'vibrate' in navigator) {
			navigator.vibrate(10);
		}
	}

	// Scroll active tab into view
	$effect(() => {
		if (browser && tabListEl && activeTab) {
			const activeButton = tabListEl.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
			if (activeButton) {
				activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
			}
		}
	});
</script>

<div
	bind:this={containerEl}
	class={cn(styles.container(), className)}
	role="region"
	aria-label="Tabbed content"
>
	<!-- Tab header -->
	<header class={styles.header()}>
		<div
			bind:this={tabListEl}
			class={styles.tabList()}
			role="tablist"
			aria-orientation="horizontal"
			tabindex="-1"
			onkeydown={handleKeyDown}
		>
			{#each tabs as tab, index (tab.id)}
				{@const isActive = tab.id === activeTab}
				<button
					type="button"
					role="tab"
					id="tab-{tab.id}"
					data-tab-id={tab.id}
					class={cn(swipeableTabs({ tabState: isActive ? 'active' : 'inactive' }).tabButton())}
					aria-selected={isActive}
					aria-controls="panel-{tab.id}"
					aria-disabled={tab.disabled}
					tabindex={isActive ? 0 : -1}
					disabled={tab.disabled}
					onclick={() => setActiveTab(tab.id)}
				>
					{#if tab.icon}
						<span class="w-5 h-5 flex items-center justify-center" aria-hidden="true">
							<tab.icon size={18} strokeWidth={2} />
						</span>
					{/if}
					<span>{tab.label}</span>
					{#if tab.badge}
						<span
							class="min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold text-white bg-destructive rounded-full flex items-center justify-center"
							aria-label="{tab.badge} items"
						>
							{typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
						</span>
					{/if}
				</button>
			{/each}

			<!-- Animated indicator -->
			<div
				class={styles.indicator()}
				style="left: {indicatorStyle.left}px; width: {indicatorStyle.width}px;"
				aria-hidden="true"
			></div>
		</div>
	</header>

	<!-- Tab panels with swipe support -->
	<div
		class={styles.panelContainer()}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
	>
		<div
			class={cn(swipeableTabs({ swiping: isSwiping }).panelTrack())}
			style="transform: translateX(calc({-activeIndex * 100}% + {translateX}px));"
		>
			{#each tabs as tab (tab.id)}
				{@const isActive = tab.id === activeTab}
				<div
					id="panel-{tab.id}"
					role="tabpanel"
					aria-labelledby="tab-{tab.id}"
					class={styles.panel()}
					tabindex={isActive ? 0 : -1}
					hidden={!isActive && !isSwiping}
				>
					{#if content}
						{@render content(tab.id)}
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* Hide scrollbar for tab list */
	.scrollbar-none {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-none::-webkit-scrollbar {
		display: none;
	}
</style>
