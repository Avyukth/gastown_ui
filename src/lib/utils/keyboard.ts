/**
 * Keyboard Shortcuts Utilities
 * 
 * Provides keyboard shortcut handling for the application
 * Supports Cmd/Ctrl+K for search, Cmd+J for inbox, etc.
 */

export interface Shortcut {
	keys: string[]; // e.g., ['cmd', 'k'] or ['ctrl', 'k']
	description: string;
	action: () => void;
	category: 'navigation' | 'action' | 'system';
	platforms?: ('mac' | 'windows' | 'linux')[];
}

export class KeyboardShortcutManager {
	private shortcuts: Map<string, Shortcut> = new Map();
	private isInputFocused = false;
	private helpOpen = false;

	constructor() {
		if (typeof window !== 'undefined') {
			document.addEventListener('keydown', this.handleKeyDown.bind(this));
			document.addEventListener('focus', this.updateInputFocus.bind(this), true);
			document.addEventListener('blur', this.updateInputFocus.bind(this), true);
		}
	}

	/**
	 * Register a keyboard shortcut
	 */
	register(id: string, shortcut: Shortcut) {
		this.shortcuts.set(id, shortcut);
	}

	/**
	 * Unregister a keyboard shortcut
	 */
	unregister(id: string) {
		this.shortcuts.delete(id);
	}

	/**
	 * Get all registered shortcuts
	 */
	getShortcuts(): Array<[string, Shortcut]> {
		return Array.from(this.shortcuts.entries());
	}

	/**
	 * Get shortcuts by category
	 */
	getShortcutsByCategory(category: 'navigation' | 'action' | 'system'): Array<[string, Shortcut]> {
		return Array.from(this.shortcuts.entries()).filter(
			([_, shortcut]) => shortcut.category === category
		);
	}

	/**
	 * Format shortcut keys for display
	 */
	formatShortcut(keys: string[]): string {
		const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
		return keys
			.map((key) => {
				if (key === 'cmd') return isMac ? '⌘' : 'Ctrl';
				if (key === 'ctrl') return isMac ? '⌘' : 'Ctrl';
				if (key === 'shift') return isMac ? '⇧' : 'Shift';
				if (key === 'alt') return isMac ? '⌥' : 'Alt';
				return key.charAt(0).toUpperCase() + key.slice(1);
			})
			.join(isMac ? '' : '+');
	}

	/**
	 * Check if current platform supports shortcut
	 */
	private isPlatformSupported(shortcut: Shortcut): boolean {
		if (!shortcut.platforms || shortcut.platforms.length === 0) return true;

		const isMac = /Mac/.test(navigator.platform);
		const isWindows = /Win/.test(navigator.platform);
		const isLinux = /Linux/.test(navigator.platform);

		const currentPlatform = isMac ? 'mac' : isWindows ? 'windows' : isLinux ? 'linux' : null;
		return currentPlatform ? shortcut.platforms.includes(currentPlatform as any) : true;
	}

	/**
	 * Get the appropriate modifier key name for the platform
	 */
	private getModifierKey(): string {
		return /Mac/.test(navigator.platform) ? 'metaKey' : 'ctrlKey';
	}

	/**
	 * Match a key sequence against a shortcut
	 */
	private matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
		const isMac = /Mac/.test(navigator.platform);

		// Check each key combination
		for (let i = 0; i < shortcut.keys.length - 1; i += 1) {
			const key = shortcut.keys[i];
			if (key === 'cmd' || key === 'ctrl') {
				if (!event.metaKey && !event.ctrlKey) return false;
			} else if (key === 'shift') {
				if (!event.shiftKey) return false;
			} else if (key === 'alt') {
				if (!event.altKey) return false;
			}
		}

		// Check the final key
		const finalKey = shortcut.keys[shortcut.keys.length - 1].toLowerCase();
		return event.key.toLowerCase() === finalKey;
	}

	/**
	 * Handle keydown event
	 */
	private handleKeyDown(event: KeyboardEvent) {
		// Skip if help is open or input is focused
		if (this.helpOpen || this.isInputFocused) {
			// Allow Escape to close help
			if (event.key === 'Escape' && this.helpOpen) {
				this.helpOpen = false;
				event.preventDefault();
				return;
			}
			return;
		}

		// Iterate through shortcuts
		for (const [id, shortcut] of this.shortcuts.entries()) {
			if (!this.isPlatformSupported(shortcut)) continue;

			if (this.matchesShortcut(event, shortcut)) {
				event.preventDefault();
				shortcut.action();
				return;
			}
		}

		// Handle Cmd+? for help
		if (event.key === '?' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			this.helpOpen = !this.helpOpen;
			// Dispatch custom event for help toggle
			window.dispatchEvent(new CustomEvent('keyboard-help-toggle', { detail: { open: this.helpOpen } }));
		}
	}

	/**
	 * Update input focus state
	 */
	private updateInputFocus(event: FocusEvent) {
		const target = event.target as HTMLElement;
		this.isInputFocused = 
			target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement ||
			target instanceof HTMLSelectElement ||
			(target && target.contentEditable === 'true');
	}

	/**
	 * Destroy the manager and remove listeners
	 */
	destroy() {
		if (typeof window !== 'undefined') {
			document.removeEventListener('keydown', this.handleKeyDown.bind(this));
			document.removeEventListener('focus', this.updateInputFocus.bind(this), true);
			document.removeEventListener('blur', this.updateInputFocus.bind(this), true);
		}
	}
}

// Export singleton instance
export let keyboardManager: KeyboardShortcutManager;

export function initializeKeyboardShortcuts() {
	if (typeof window !== 'undefined' && !keyboardManager) {
		keyboardManager = new KeyboardShortcutManager();
	}
	return keyboardManager;
}
