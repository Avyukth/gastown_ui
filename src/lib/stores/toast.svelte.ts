/**
 * Toast notification store using Svelte 5 runes
 *
 * Manages toast notifications with:
 * - Multiple toast types (info, success, warning, error)
 * - Auto-dismiss with configurable duration
 * - Queue management with max visible limit
 */

export type ToastType = 'default' | 'info' | 'success' | 'warning' | 'error';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration: number;
	dismissible: boolean;
	timestamp: number;
}

export interface ToastOptions {
	type?: ToastType;
	duration?: number;
	dismissible?: boolean;
}

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 3;

class ToastStore {
	#toasts = $state<Toast[]>([]);
	#timeouts = new Map<string, ReturnType<typeof setTimeout>>();

	get toasts() {
		return this.#toasts;
	}

	get count() {
		return this.#toasts.length;
	}

	/**
	 * Show a toast notification
	 */
	show(message: string, options: ToastOptions = {}) {
		const toast: Toast = {
			id: crypto.randomUUID(),
			message,
			type: options.type ?? 'default',
			duration: options.duration ?? DEFAULT_DURATION,
			dismissible: options.dismissible ?? true,
			timestamp: Date.now()
		};

		// Remove oldest if at max
		if (this.#toasts.length >= MAX_TOASTS) {
			const oldest = this.#toasts[0];
			this.dismiss(oldest.id);
		}

		this.#toasts = [...this.#toasts, toast];

		// Auto-dismiss after duration
		if (toast.duration > 0) {
			const timeout = setTimeout(() => {
				this.dismiss(toast.id);
			}, toast.duration);
			this.#timeouts.set(toast.id, timeout);
		}

		return toast.id;
	}

	/**
	 * Convenience methods for different toast types
	 */
	info(message: string, options: Omit<ToastOptions, 'type'> = {}) {
		return this.show(message, { ...options, type: 'info' });
	}

	success(message: string, options: Omit<ToastOptions, 'type'> = {}) {
		return this.show(message, { ...options, type: 'success' });
	}

	warning(message: string, options: Omit<ToastOptions, 'type'> = {}) {
		return this.show(message, { ...options, type: 'warning' });
	}

	error(message: string, options: Omit<ToastOptions, 'type'> = {}) {
		return this.show(message, { ...options, type: 'error' });
	}

	/**
	 * Dismiss a specific toast
	 */
	dismiss(id: string) {
		// Clear timeout if exists
		const timeout = this.#timeouts.get(id);
		if (timeout) {
			clearTimeout(timeout);
			this.#timeouts.delete(id);
		}

		this.#toasts = this.#toasts.filter((t) => t.id !== id);
	}

	/**
	 * Dismiss all toasts
	 */
	dismissAll() {
		// Clear all timeouts
		for (const timeout of this.#timeouts.values()) {
			clearTimeout(timeout);
		}
		this.#timeouts.clear();

		this.#toasts = [];
	}
}

// Singleton instance
export const toastStore = new ToastStore();
