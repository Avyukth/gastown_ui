/**
 * Touch Gesture Utilities
 * Provides swipe and pull-to-refresh gesture detection for mobile
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
 */

export interface SwipeEvent {
	direction: 'left' | 'right' | 'up' | 'down';
	distance: number;
	velocity: number;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	duration: number;
}

export interface SwipeOptions {
	minDistance?: number; // Minimum pixels to trigger swipe (default: 50)
	minVelocity?: number; // Minimum pixels/ms (default: 0.1)
	maxDuration?: number; // Maximum ms to complete swipe (default: 300)
}

/**
 * Create a swipe gesture detector
 * Returns a function to attach to an element, and cleanup function
 */
export function createSwipeDetector(
	element: HTMLElement,
	onSwipe: (event: SwipeEvent) => void,
	options: SwipeOptions = {}
) {
	const {
		minDistance = 50,
		minVelocity = 0.1,
		maxDuration = 300
	} = options;

	let startX = 0;
	let startY = 0;
	let startTime = 0;

	function handleTouchStart(e: TouchEvent) {
		const touch = e.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
		startTime = Date.now();
	}

	function handleTouchEnd(e: TouchEvent) {
		const touch = e.changedTouches[0];
		const endX = touch.clientX;
		const endY = touch.clientY;
		const endTime = Date.now();

		const distX = endX - startX;
		const distY = endY - startY;
		const duration = endTime - startTime;

		// Calculate which direction moved most
		const absDistX = Math.abs(distX);
		const absDistY = Math.abs(distY);

		// If movement is too small or took too long, ignore
		if (duration > maxDuration) return;

		// Determine if horizontal or vertical swipe
		if (absDistX > absDistY && absDistX > minDistance) {
			// Horizontal swipe
			const velocity = absDistX / duration;
			if (velocity >= minVelocity) {
				const direction = distX > 0 ? 'right' : 'left';
				onSwipe({
					direction: direction as 'left' | 'right',
					distance: absDistX,
					velocity,
					startX,
					startY,
					endX,
					endY,
					duration
				});
			}
		} else if (absDistY > absDistX && absDistY > minDistance) {
			// Vertical swipe
			const velocity = absDistY / duration;
			if (velocity >= minVelocity) {
				const direction = distY > 0 ? 'down' : 'up';
				onSwipe({
					direction: direction as 'up' | 'down',
					distance: absDistY,
					velocity,
					startX,
					startY,
					endX,
					endY,
					duration
				});
			}
		}
	}

	// Attach listeners
	element.addEventListener('touchstart', handleTouchStart, false);
	element.addEventListener('touchend', handleTouchEnd, false);

	// Return cleanup function
	return () => {
		element.removeEventListener('touchstart', handleTouchStart);
		element.removeEventListener('touchend', handleTouchEnd);
	};
}

/**
 * Create a pull-to-refresh detector
 * Triggers when user scrolls down from top of scrollable element
 */
export function createPullToRefreshDetector(
	element: HTMLElement,
	onRefresh: () => void | Promise<void>,
	options: { minDistance?: number } = {}
) {
	const { minDistance = 60 } = options;

	let startY = 0;
	let isPulling = false;
	let refreshTriggered = false;

	function handleTouchStart(e: TouchEvent) {
		// Only start tracking if scrolled to top
		if (element.scrollTop === 0) {
			startY = e.touches[0].clientY;
			isPulling = true;
			refreshTriggered = false;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isPulling) return;

		const currentY = e.touches[0].clientY;
		const distance = currentY - startY;

		// Show visual feedback as user pulls
		if (distance > 0) {
			const pullPercent = Math.min(distance / minDistance, 1);
			element.style.setProperty('--pull-distance', `${distance}px`);
			element.style.setProperty('--pull-percent', `${pullPercent}`);
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		if (!isPulling) return;

		const currentY = e.changedTouches[0].clientY;
		const distance = currentY - startY;

		// Clear visual feedback
		element.style.removeProperty('--pull-distance');
		element.style.removeProperty('--pull-percent');

		if (distance > minDistance) {
			if (!refreshTriggered) {
				refreshTriggered = true;
				onRefresh();
			}
		}

		isPulling = false;
		startY = 0;
	}

	// Attach listeners with passive: false to allow preventDefault
	element.addEventListener('touchstart', handleTouchStart, { passive: true });
	element.addEventListener('touchmove', handleTouchMove, { passive: true });
	element.addEventListener('touchend', handleTouchEnd, { passive: true });

	// Return cleanup function
	return () => {
		element.removeEventListener('touchstart', handleTouchStart);
		element.removeEventListener('touchmove', handleTouchMove);
		element.removeEventListener('touchend', handleTouchEnd);
	};
}
