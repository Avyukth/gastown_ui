/**
 * Svelte Action: use:swipe
 * Attach swipe gesture detection to any element
 *
 * Usage:
 * <div use:swipe={{onswipe: (e) => {...}, minDistance: 50}}>
 *   Content
 * </div>
 */

import { createSwipeDetector, type SwipeEvent, type SwipeOptions } from '$lib/utils/gestures';

interface SwipeActionParams extends SwipeOptions {
	onswipe?: (event: SwipeEvent) => void;
	onswipeleft?: (event: SwipeEvent) => void;
	onswiperight?: (event: SwipeEvent) => void;
	onswipeup?: (event: SwipeEvent) => void;
	onswipedown?: (event: SwipeEvent) => void;
}

export function swipe(element: HTMLElement, params: SwipeActionParams = {}) {
	const { onswipe, onswipeleft, onswiperight, onswipeup, onswipedown, ...options } = params;

	const unsubscribe = createSwipeDetector(
		element,
		(event: SwipeEvent) => {
			// Call generic handler
			onswipe?.(event);

			// Call direction-specific handlers
			switch (event.direction) {
				case 'left':
					onswipeleft?.(event);
					break;
				case 'right':
					onswiperight?.(event);
					break;
				case 'up':
					onswipeup?.(event);
					break;
				case 'down':
					onswipedown?.(event);
					break;
			}
		},
		options
	);

	return {
		destroy() {
			unsubscribe();
		},
		update(newParams: SwipeActionParams) {
			// Cleanup old listeners
			unsubscribe();

			// Create new ones with updated params
			const { onswipe: _onswipe, onswipeleft: _onswipeleft, onswiperight: _onswiperight, onswipeup: _onswipeup, onswipedown: _onswipedown, ...newOptions } = newParams;

			return createSwipeDetector(
				element,
				(event: SwipeEvent) => {
					_onswipe?.(event);
					switch (event.direction) {
						case 'left':
							_onswipeleft?.(event);
							break;
						case 'right':
							_onswiperight?.(event);
							break;
						case 'up':
							_onswipeup?.(event);
							break;
						case 'down':
							_onswipedown?.(event);
							break;
					}
				},
				newOptions
			);
		}
	};
}
