/**
 * Preload utilities for code splitting optimization
 *
 * Provides functions to preload route chunks on hover/focus for faster navigation.
 * SvelteKit handles route preloading via data-sveltekit-preload-data="hover" on body,
 * but this module provides finer control for component-level preloading.
 */

type PreloadTarget = 'hover' | 'focus' | 'both';

interface PreloadOptions {
	/** When to trigger preload: hover, focus, or both */
	trigger?: PreloadTarget;
	/** Delay before preloading (ms) - helps avoid unnecessary preloads on quick mouseovers */
	delay?: number;
}

const preloadedModules = new Set<string>();

/**
 * Preload a module by path
 * Uses Vite's dynamic import with eager preloading
 */
export async function preloadModule(modulePath: string): Promise<void> {
	if (preloadedModules.has(modulePath)) return;

	try {
		// Mark as preloaded immediately to avoid duplicate requests
		preloadedModules.add(modulePath);

		// Use link preload for optimal browser handling
		const link = document.createElement('link');
		link.rel = 'modulepreload';
		link.href = modulePath;
		document.head.appendChild(link);
	} catch {
		// Remove from set if preload failed so it can be retried
		preloadedModules.delete(modulePath);
	}
}

/**
 * Create a preload action for use with Svelte's use: directive
 *
 * @example
 * <a href="/agents" use:preloadAction={{ modules: ['/src/routes/agents/+page.svelte'] }}>
 *   Agents
 * </a>
 */
export function preloadAction(
	node: HTMLElement,
	options: { modules: string[]; trigger?: PreloadTarget; delay?: number }
) {
	const { modules, trigger = 'both', delay = 100 } = options;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const doPreload = () => {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			modules.forEach((mod) => preloadModule(mod));
		}, delay);
	};

	const cancelPreload = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	if (trigger === 'hover' || trigger === 'both') {
		node.addEventListener('mouseenter', doPreload);
		node.addEventListener('mouseleave', cancelPreload);
	}

	if (trigger === 'focus' || trigger === 'both') {
		node.addEventListener('focus', doPreload);
		node.addEventListener('blur', cancelPreload);
	}

	return {
		destroy() {
			cancelPreload();
			node.removeEventListener('mouseenter', doPreload);
			node.removeEventListener('mouseleave', cancelPreload);
			node.removeEventListener('focus', doPreload);
			node.removeEventListener('blur', cancelPreload);
		}
	};
}

/**
 * Preload component chunks for a route
 * Call this to eagerly load route components before navigation
 */
export function preloadRoute(route: string): void {
	// SvelteKit's preloadData is the preferred method when available
	if (typeof window !== 'undefined' && '__sveltekit_preload_data' in window) {
		// @ts-expect-error - SvelteKit internal
		window.__sveltekit_preload_data(route);
	}
}

/**
 * Check if a module has been preloaded
 */
export function isPreloaded(modulePath: string): boolean {
	return preloadedModules.has(modulePath);
}

/**
 * Clear preload cache (useful for testing)
 */
export function clearPreloadCache(): void {
	preloadedModules.clear();
}
