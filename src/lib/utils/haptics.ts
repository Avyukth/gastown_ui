/**
 * Haptic Feedback Utility
 * Provides vibration patterns for mobile devices using the Vibration API
 * Gracefully degrades on devices without haptic support
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 */

/**
 * Check if device supports vibration
 */
export function supportsVibration(): boolean {
	if (typeof window === 'undefined') return false;
	return 'vibrate' in navigator;
}

/**
 * Light haptic feedback for normal interactions (button clicks, selections)
 * Duration: 10-20ms
 */
export function hapticLight(): void {
	if (!supportsVibration()) return;
	navigator.vibrate(15);
}

/**
 * Medium haptic feedback for significant actions (form submission)
 * Duration: 30-50ms
 */
export function hapticMedium(): void {
	if (!supportsVibration()) return;
	navigator.vibrate(40);
}

/**
 * Success pattern: two quick pulses
 * Pattern: 30ms vibrate, 20ms pause, 30ms vibrate
 */
export function hapticSuccess(): void {
	if (!supportsVibration()) return;
	navigator.vibrate([30, 20, 30]);
}

/**
 * Error pattern: three short pulses (warning)
 * Pattern: 40ms vibrate, 20ms pause, 40ms vibrate, 20ms pause, 40ms vibrate
 */
export function hapticError(): void {
	if (!supportsVibration()) return;
	navigator.vibrate([40, 20, 40, 20, 40]);
}

/**
 * Custom vibration pattern
 * @param pattern - Single number (duration in ms) or array of [vibrate, pause, vibrate, ...] durations
 */
export function hapticCustom(pattern: number | number[]): void {
	if (!supportsVibration()) return;
	navigator.vibrate(pattern);
}

/**
 * Cancel any active vibration
 */
export function hapticCancel(): void {
	if (!supportsVibration()) return;
	navigator.vibrate(0);
}
