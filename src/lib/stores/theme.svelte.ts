/**
 * Theme store using Svelte 5 runes
 *
 * Manages theme state across the application with:
 * - Light, dark, and system theme modes
 * - LocalStorage persistence
 * - System preference detection
 */

import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'gastown-theme';

class ThemeStore {
	#theme = $state<Theme>('system');
	#effectiveTheme = $state<'light' | 'dark'>('dark');

	constructor() {
		if (browser) {
			this.#initialize();
		}
	}

	get theme() {
		return this.#theme;
	}

	get effectiveTheme() {
		return this.#effectiveTheme;
	}

	get isDark() {
		return this.#effectiveTheme === 'dark';
	}

	get isLight() {
		return this.#effectiveTheme === 'light';
	}

	#initialize() {
		// Load from localStorage
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		this.#theme = stored ?? 'system';

		// Calculate effective theme
		this.#updateEffectiveTheme();

		// Listen for system preference changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', () => {
			if (this.#theme === 'system') {
				this.#updateEffectiveTheme();
				this.#applyToDOM();
			}
		});

		// Apply initial theme
		this.#applyToDOM();
	}

	#updateEffectiveTheme() {
		if (this.#theme === 'system') {
			this.#effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
		} else {
			this.#effectiveTheme = this.#theme;
		}
	}

	#applyToDOM() {
		const root = document.documentElement;
		root.classList.remove('light', 'dark');
		root.classList.add(this.#effectiveTheme);
	}

	/**
	 * Set the theme
	 */
	set(newTheme: Theme) {
		this.#theme = newTheme;
		localStorage.setItem(STORAGE_KEY, newTheme);
		this.#updateEffectiveTheme();
		this.#applyToDOM();
	}

	/**
	 * Cycle through themes: dark -> light -> system -> dark
	 */
	cycle() {
		const order: Theme[] = ['dark', 'light', 'system'];
		const currentIndex = order.indexOf(this.#theme);
		const nextIndex = (currentIndex + 1) % order.length;
		this.set(order[nextIndex]);
	}

	/**
	 * Toggle between light and dark (ignoring system)
	 */
	toggle() {
		this.set(this.#effectiveTheme === 'dark' ? 'light' : 'dark');
	}
}

// Singleton instance
export const themeStore = new ThemeStore();
