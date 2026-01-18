/**
 * Concurrency Limiter - Prevents resource exhaustion from CLI calls
 * Architecture Decision: D0.3 - CLI Operations Concurrency (Sequential with queue)
 *
 * Features:
 * - Configurable max concurrent requests (default 4)
 * - In-flight request deduplication
 * - FIFO queue for pending requests
 */

import type { CLIResult, CLICommandConfig, QueuedRequest } from './contracts';
import { DEFAULT_CONFIG } from './contracts';

export class ConcurrencyLimiter {
	private queue: QueuedRequest[] = [];
	private inFlight: Map<string, Promise<CLIResult>> = new Map();
	private activeCount = 0;
	private readonly maxConcurrency: number;

	constructor(maxConcurrency: number = DEFAULT_CONFIG.maxConcurrency) {
		this.maxConcurrency = maxConcurrency;
	}

	private getDedupeKey(config: CLICommandConfig): string {
		return `${config.command}:${config.args.join(':')}`;
	}

	async execute(
		config: CLICommandConfig,
		executor: (config: CLICommandConfig) => Promise<CLIResult>
	): Promise<CLIResult> {
		if (config.dedupe !== false) {
			const key = this.getDedupeKey(config);
			const existing = this.inFlight.get(key);
			if (existing) {
				return existing;
			}
		}

		return new Promise((resolve, reject) => {
			const request: QueuedRequest = {
				id: crypto.randomUUID(),
				config,
				resolve,
				reject,
				enqueuedAt: Date.now()
			};

			this.queue.push(request);
			this.processQueue(executor);
		});
	}

	private async processQueue(
		executor: (config: CLICommandConfig) => Promise<CLIResult>
	): Promise<void> {
		while (this.queue.length > 0 && this.activeCount < this.maxConcurrency) {
			const request = this.queue.shift();
			if (!request) continue;

			this.activeCount++;
			const key = this.getDedupeKey(request.config);

			const promise = executor(request.config)
				.then((result) => {
					request.resolve(result);
					return result;
				})
				.catch((error) => {
					request.reject(error);
					throw error;
				})
				.finally(() => {
					this.activeCount--;
					this.inFlight.delete(key);
					this.processQueue(executor);
				});

			if (request.config.dedupe !== false) {
				this.inFlight.set(key, promise);
			}
		}
	}

	getStats(): { queued: number; active: number; maxConcurrency: number } {
		return {
			queued: this.queue.length,
			active: this.activeCount,
			maxConcurrency: this.maxConcurrency
		};
	}

	clear(): void {
		for (const request of this.queue) {
			request.reject(new Error('Queue cleared'));
		}
		this.queue = [];
		this.inFlight.clear();
	}
}
