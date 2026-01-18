/**
 * Beads Directory Watcher
 *
 * Monitors the .beads/ directory for changes and triggers cache invalidation.
 * Enables near-real-time updates without polling (D0.7: Watch-First Updates).
 *
 * Key Features:
 * - Watches .beads/ directory recursively
 * - Debounces rapid changes (50ms default)
 * - Maps file changes to cache invalidation
 * - Handles file creation, modification, and deletion
 * - Graceful error handling and auto-recovery
 */

import { watch, type FSWatcher } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join, basename, dirname } from 'path';
import { EventEmitter } from 'events';

export type BeadChangeType = 'create' | 'update' | 'delete';
export type BeadEntityType = 'work' | 'convoy' | 'agent' | 'mail' | 'event' | 'unknown';

export interface BeadChange {
	type: BeadChangeType;
	entityType: BeadEntityType;
	entityId?: string;
	path: string;
	timestamp: number;
}

export interface BeadsWatcherConfig {
	beadsPath: string;
	debounceMs?: number;
	recursive?: boolean;
	onError?: (error: Error) => void;
}

type ChangeCallback = (change: BeadChange) => void;

const DEFAULT_DEBOUNCE_MS = 50;

export class BeadsWatcher extends EventEmitter {
	#config: Required<BeadsWatcherConfig>;
	#watcher: FSWatcher | null = null;
	#isWatching = false;
	#debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
	#callbacks: ChangeCallback[] = [];

	constructor(config: BeadsWatcherConfig) {
		super();
		this.#config = {
			beadsPath: config.beadsPath,
			debounceMs: config.debounceMs ?? DEFAULT_DEBOUNCE_MS,
			recursive: config.recursive ?? true,
			onError: config.onError ?? console.error
		};
	}

	get isWatching(): boolean {
		return this.#isWatching;
	}

	get beadsPath(): string {
		return this.#config.beadsPath;
	}

	async start(): Promise<void> {
		if (this.#isWatching) return;

		try {
			const stats = await stat(this.#config.beadsPath);
			if (!stats.isDirectory()) {
				throw new Error(`${this.#config.beadsPath} is not a directory`);
			}
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
				console.warn(`Beads directory not found: ${this.#config.beadsPath}`);
				return;
			}
			throw err;
		}

		this.#watcher = watch(
			this.#config.beadsPath,
			{ recursive: this.#config.recursive },
			(eventType, filename) => {
				if (!filename) return;
				this.#handleChange(eventType, filename);
			}
		);

		this.#watcher.on('error', (error) => {
			this.#config.onError(error);
			this.emit('error', error);
		});

		this.#watcher.on('close', () => {
			this.#isWatching = false;
			this.emit('close');
		});

		this.#isWatching = true;
		this.emit('start');
	}

	stop(): void {
		if (!this.#isWatching || !this.#watcher) return;

		for (const timer of this.#debounceTimers.values()) {
			clearTimeout(timer);
		}
		this.#debounceTimers.clear();

		this.#watcher.close();
		this.#watcher = null;
		this.#isWatching = false;
		this.emit('stop');
	}

	onChange(callback: ChangeCallback): () => void {
		this.#callbacks.push(callback);
		return () => {
			const idx = this.#callbacks.indexOf(callback);
			if (idx > -1) {
				this.#callbacks.splice(idx, 1);
			}
		};
	}

	#handleChange(eventType: string, filename: string): void {
		const existingTimer = this.#debounceTimers.get(filename);
		if (existingTimer) {
			clearTimeout(existingTimer);
		}

		const timer = setTimeout(() => {
			this.#debounceTimers.delete(filename);
			this.#processChange(eventType, filename);
		}, this.#config.debounceMs);

		this.#debounceTimers.set(filename, timer);
	}

	async #processChange(eventType: string, filename: string): Promise<void> {
		const fullPath = join(this.#config.beadsPath, filename);
		let changeType: BeadChangeType;

		try {
			await stat(fullPath);
			changeType = eventType === 'rename' ? 'create' : 'update';
		} catch {
			changeType = 'delete';
		}

		const entityInfo = this.#parseFilename(filename);

		const change: BeadChange = {
			type: changeType,
			entityType: entityInfo.type,
			entityId: entityInfo.id,
			path: fullPath,
			timestamp: Date.now()
		};

		this.emit('change', change);

		for (const callback of this.#callbacks) {
			try {
				callback(change);
			} catch (err) {
				this.#config.onError(err instanceof Error ? err : new Error(String(err)));
			}
		}
	}

	#parseFilename(filename: string): { type: BeadEntityType; id?: string } {
		const base = basename(filename, '.json');
		const dir = dirname(filename);

		if (filename.endsWith('.events.jsonl') || dir.includes('events')) {
			return { type: 'event' };
		}

		if (dir.includes('work') || dir.includes('beads')) {
			const match = base.match(/^([a-z]{2,3}-[a-z0-9]+)$/i);
			if (match) {
				return { type: 'work', id: match[1] };
			}
		}

		if (dir.includes('convoy')) {
			return { type: 'convoy', id: base };
		}

		if (dir.includes('agent') || dir.includes('polecat')) {
			return { type: 'agent', id: base };
		}

		if (dir.includes('mail') || dir.includes('message')) {
			return { type: 'mail', id: base };
		}

		if (base.match(/^[a-z]{2,3}-[a-z0-9]+$/i)) {
			return { type: 'work', id: base };
		}

		return { type: 'unknown' };
	}
}

export function createBeadsWatcher(config: BeadsWatcherConfig): BeadsWatcher {
	return new BeadsWatcher(config);
}

export interface CacheInvalidator {
	invalidateWork: (id?: string) => void;
	invalidateConvoys: (id?: string) => void;
	invalidateAgents: (id?: string) => void;
	invalidateMail: (id?: string) => void;
	invalidateAll: () => void;
}

export function createWatcherWithCacheInvalidation(
	beadsPath: string,
	invalidator: CacheInvalidator
): BeadsWatcher {
	const watcher = new BeadsWatcher({ beadsPath });

	watcher.onChange((change) => {
		switch (change.entityType) {
			case 'work':
				invalidator.invalidateWork(change.entityId);
				invalidator.invalidateConvoys();
				break;
			case 'convoy':
				invalidator.invalidateConvoys(change.entityId);
				break;
			case 'agent':
				invalidator.invalidateAgents(change.entityId);
				break;
			case 'mail':
				invalidator.invalidateMail(change.entityId);
				break;
			case 'event':
				invalidator.invalidateAll();
				break;
			default:
				invalidator.invalidateAll();
		}
	});

	return watcher;
}

export async function listBeadsFiles(beadsPath: string): Promise<string[]> {
	const files: string[] = [];

	async function walkDir(dir: string): Promise<void> {
		try {
			const entries = await readdir(dir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = join(dir, entry.name);

				if (entry.isDirectory()) {
					await walkDir(fullPath);
				} else if (entry.isFile() && entry.name.endsWith('.json')) {
					files.push(fullPath);
				}
			}
		} catch {
			/* ignore errors */
		}
	}

	await walkDir(beadsPath);
	return files;
}
