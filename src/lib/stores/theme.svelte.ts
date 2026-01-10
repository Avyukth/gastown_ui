/**
 * Theme store using Svelte 5 runes
 *
 * Manages theme state across the application with:
 * - Light, dark, and system theme modes
 * - LocalStorage persistence (graceful degradation in incognito)
 * - System preference detection
 * - Screen reader announcements
 */

import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'gastown-theme';

/**
 * Safe localStorage access for incognito mode
 */
function safeGetItem(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function safeSetItem(key: string, value: string): void {
	try {
		localStorage.setItem(key, value);
	} catch {
		// Silently fail in incognito mode
	}
}

/**
 * Announce theme change to screen readers
 */
function announceThemeChange(theme: Theme, effectiveTheme: 'light' | 'dark'): void {
	if (!browser) return;

	const message = theme === 'system'
		? `Theme set to system preference (${effectiveTheme} mode)`
		: `Theme changed to ${theme} mode`;

	// Dispatch custom event for Announcer component
	window.dispatchEvent(new CustomEvent('announce', {
		detail: { message, priority: 'polite' }
	}));
}

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
		// Load from localStorage (graceful degradation for incognito)
		const stored = safeGetItem(STORAGE_KEY);
		// Validate stored value is one of allowed themes
		this.#theme = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';

		// Calculate effective theme
		this.#updateEffectiveTheme();

		// Listen for system preference changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', () => {
			if (this.#theme === 'system') {
				this.#updateEffectiveTheme();
				this.#applyToDOM();
				announceThemeChange(this.#theme, this.#effectiveTheme);
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
		safeSetItem(STORAGE_KEY, newTheme);
		this.#updateEffectiveTheme();
		this.#applyToDOM();
		announceThemeChange(newTheme, this.#effectiveTheme);
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
