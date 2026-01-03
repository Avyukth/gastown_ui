<script lang="ts">
	/**
	 * SwipeableItem Component
	 *
	 * Touch-enabled swipeable list item with reveal actions.
	 * Supports swipe left for action buttons, swipe right for alternative action.
	 * Includes keyboard alternatives for accessibility.
	 *
	 * @example
	 * <SwipeableItem
	 *   onSwipeLeft={() => handleDelete()}
	 *   onSwipeRight={() => handleArchive()}
	 * >
	 *   <span>Item content</span>
	 *   {#snippet leftActions()}
	 *     <button>Delete</button>
	 *   {/snippet}
	 * </SwipeableItem>
	 */
	import { tv, type VariantProps } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	const swipeableItem = tv({
		slots: {
			container: 'relative overflow-hidden touch-pan-y select-none',
			content: 'relative bg-background transition-transform duration-200 ease-out will-change-transform',
			actionsLeft: 'absolute inset-y-0 right-0 flex items-center justify-end bg-destructive/90',
			actionsRight: 'absolute inset-y-0 left-0 flex items-center justify-start bg-success/90',
			actionButton: 'flex items-center justify-center px-4 h-full text-white font-medium transition-opacity'
		},
		variants: {
			variant: {
				default: { container: '' },
				bordered: { container: 'border-b border-border' },
				card: { container: 'rounded-lg shadow-sm' }
			},
			state: {
				idle: { content: '' },
				swiping: { content: 'transition-none' },
				revealed: { content: '' }
			}
		},
		defaultVariants: {
			variant: 'default',
			state: 'idle'
		}
	});

	type SwipeableItemVariants = VariantProps<typeof swipeableItem>;

	interface SwipeableItemProps {
		/** Variant style */
		variant?: SwipeableItemVariants['variant'];
		/** Callback when swiped left past threshold */
		onSwipeLeft?: () => void;
		/** Callback when swiped right past threshold */
		onSwipeRight?: () => void;
		/** Threshold in pixels before action commits (default: 80) */
		threshold?: number;
		/** Maximum reveal distance in pixels (default: 100) */
		maxReveal?: number;
		/** Disable swipe gestures */
		disabled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Content to display */
		children?: Snippet;
		/** Actions revealed on swipe left */
		leftActions?: Snippet;
		/** Actions revealed on swipe right */
		rightActions?: Snippet;
	}

	let {
		variant = 'default',
		onSwipeLeft,
		onSwipeRight,
		threshold = 80,
		maxReveal = 100,
		disabled = false,
		class: className,
		children,
		leftActions,
		rightActions
	}: SwipeableItemProps = $props();

	// State
	let translateX = $state(0);
	let startX = $state(0);
	let startY = $state(0);
	let isSwiping = $state(false);
	let direction = $state<'left' | 'right' | null>(null);
	let isRevealed = $state(false);
	let containerEl: HTMLDivElement;

	// Computed
	const currentState = $derived<SwipeableItemVariants['state']>(
		isSwiping ? 'swiping' : isRevealed ? 'revealed' : 'idle'
	);
	const styles = $derived(swipeableItem({ variant, state: currentState }));

	function handlePointerDown(e: PointerEvent) {
		if (disabled) return;
		startX = e.clientX;
		startY = e.clientY;
		isSwiping = true;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isSwiping || disabled) return;

		const deltaX = e.clientX - startX;
		const deltaY = e.clientY - startY;

		// If vertical scroll is dominant, cancel swipe
		if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
			resetSwipe();
			return;
		}

		// Determine direction
		if (!direction && Math.abs(deltaX) > 10) {
			direction = deltaX < 0 ? 'left' : 'right';
		}

		// Calculate bounded translation
		if (direction === 'left' && leftActions) {
			translateX = Math.max(-maxReveal, Math.min(0, deltaX));
		} else if (direction === 'right' && rightActions) {
			translateX = Math.min(maxReveal, Math.max(0, deltaX));
		}
	}

	function handlePointerUp() {
		if (!isSwiping) return;

		const absTranslate = Math.abs(translateX);

		if (absTranslate >= threshold) {
			// Commit action
			if (direction === 'left' && onSwipeLeft) {
				translateX = -maxReveal;
				isRevealed = true;
				onSwipeLeft();
			} else if (direction === 'right' && onSwipeRight) {
				translateX = maxReveal;
				isRevealed = true;
				onSwipeRight();
			} else {
				resetSwipe();
			}
		} else {
			resetSwipe();
		}

		isSwiping = false;
		direction = null;
	}

	function resetSwipe() {
		translateX = 0;
		isSwiping = false;
		direction = null;
		isRevealed = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;

		switch (e.key) {
			case 'ArrowLeft':
				if (leftActions && onSwipeLeft) {
					e.preventDefault();
					translateX = -maxReveal;
					isRevealed = true;
					onSwipeLeft();
				}
				break;
			case 'ArrowRight':
				if (rightActions && onSwipeRight) {
					e.preventDefault();
					translateX = maxReveal;
					isRevealed = true;
					onSwipeRight();
				}
				break;
			case 'Escape':
				e.preventDefault();
				resetSwipe();
				break;
		}
	}

	// Close on outside click
	function handleClickOutside(e: MouseEvent) {
		if (isRevealed && containerEl && !containerEl.contains(e.target as Node)) {
			resetSwipe();
		}
	}

	$effect(() => {
		if (isRevealed) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div
	bind:this={containerEl}
	class={cn(styles.container(), className)}
	role="listitem"
	tabindex={disabled ? -1 : 0}
	aria-label="Swipeable item. Use arrow keys to reveal actions, Escape to close."
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
	onkeydown={handleKeyDown}
>
	<!-- Right actions (revealed on swipe right) -->
	{#if rightActions}
		<div
			class={styles.actionsRight()}
			style="width: {maxReveal}px; opacity: {Math.min(1, translateX / threshold)}"
			aria-hidden={translateX <= 0}
		>
			{@render rightActions()}
		</div>
	{/if}

	<!-- Left actions (revealed on swipe left) -->
	{#if leftActions}
		<div
			class={styles.actionsLeft()}
			style="width: {maxReveal}px; opacity: {Math.min(1, Math.abs(translateX) / threshold)}"
			aria-hidden={translateX >= 0}
		>
			{@render leftActions()}
		</div>
	{/if}

	<!-- Main content -->
	<div class={styles.content()} style="transform: translateX({translateX}px)">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
