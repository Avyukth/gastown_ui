/**
 * Process Supervisor - Safe, observable CLI execution
 * Architecture Decision: D0.5 - No-shell execution with spawn/execFile
 *
 * Features:
 * - Uses execFile (no shell) for security
 * - Configurable timeouts per command
 * - Concurrency limiting
 * - Circuit breaker for failure protection
 * - Request deduplication
 * - Process tracking with cleanup on destroy
 */

import { execFile, type ChildProcess } from 'node:child_process';
import type { CLIResult, CLICommandConfig, ProcessSupervisorConfig } from './contracts';
import { DEFAULT_CONFIG } from './contracts';
import { ConcurrencyLimiter } from './concurrency-limiter';
import { CircuitBreaker } from './circuit-breaker';

export class ProcessSupervisor {
	private readonly config: ProcessSupervisorConfig;
	private readonly limiter: ConcurrencyLimiter;
	private readonly circuitBreaker: CircuitBreaker;
	private readonly activeProcesses: Map<string, ChildProcess> = new Map();
	private totalSpawned = 0;
	private destroyed = false;

	constructor(config: Partial<ProcessSupervisorConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.limiter = new ConcurrencyLimiter(this.config.maxConcurrency);
		this.circuitBreaker = new CircuitBreaker(
			this.config.circuitBreakerThreshold,
			this.config.circuitBreakerResetTime
		);
	}

	async execute<T = unknown>(commandConfig: CLICommandConfig): Promise<CLIResult<T>> {
		if (this.destroyed) {
			return {
				success: false,
				data: null,
				error: 'Process supervisor has been destroyed',
				exitCode: -1,
				duration: 0,
				command: this.formatCommand(commandConfig)
			};
		}

		if (!this.circuitBreaker.canExecute()) {
			return {
				success: false,
				data: null,
				error: 'Circuit breaker is open - CLI is unavailable',
				exitCode: -1,
				duration: 0,
				command: this.formatCommand(commandConfig)
			};
		}

		return this.limiter.execute(commandConfig, (cfg) =>
			this.executeCommand<T>(cfg)
		) as Promise<CLIResult<T>>;
	}

	private executeCommand<T>(config: CLICommandConfig): Promise<CLIResult<T>> {
		return new Promise((resolve) => {
			const startTime = Date.now();
			const timeout = config.timeout ?? this.config.defaultTimeout;
			const command = this.formatCommand(config);
			const processId = crypto.randomUUID();

			this.totalSpawned++;

			const child = execFile(
				config.command,
				config.args,
				{
					timeout,
					maxBuffer: 10 * 1024 * 1024,
					cwd: config.cwd,
					env: process.env
				},
				(error, stdout, stderr) => {
					this.activeProcesses.delete(processId);
					const duration = Date.now() - startTime;

					if (error) {
						this.circuitBreaker.recordFailure();

						const isTimeout = error.killed || error.message.includes('ETIMEDOUT');
						const wasKilled = error.killed;
						const errorMessage = wasKilled
							? 'Process was killed'
							: isTimeout
								? `Command timed out after ${timeout}ms`
								: stderr || error.message;

						resolve({
							success: false,
							data: null,
							error: errorMessage,
							exitCode: typeof error.code === 'number' ? error.code : -1,
							duration,
							command
						});
						return;
					}

					this.circuitBreaker.recordSuccess();

					let data: T | null = null;
					try {
						data = JSON.parse(stdout) as T;
					} catch {
						data = stdout as unknown as T;
					}

					resolve({
						success: true,
						data,
						error: null,
						exitCode: 0,
						duration,
						command
					});
				}
			);

			this.activeProcesses.set(processId, child);

			child.on('error', (err) => {
				this.activeProcesses.delete(processId);
				this.circuitBreaker.recordFailure();
				resolve({
					success: false,
					data: null,
					error: `Failed to spawn process: ${err.message}`,
					exitCode: -1,
					duration: Date.now() - startTime,
					command
				});
			});
		});
	}

	private formatCommand(config: CLICommandConfig): string {
		return `${config.command} ${config.args.join(' ')}`;
	}

	gt<T = unknown>(args: string[], options: Partial<CLICommandConfig> = {}): Promise<CLIResult<T>> {
		return this.execute<T>({
			command: 'gt',
			args,
			...options
		});
	}

	bd<T = unknown>(args: string[], options: Partial<CLICommandConfig> = {}): Promise<CLIResult<T>> {
		return this.execute<T>({
			command: 'bd',
			args,
			...options
		});
	}

	getStats(): {
		queue: { queued: number; active: number; maxConcurrency: number };
		circuitBreaker: ReturnType<CircuitBreaker['getStats']>;
	} {
		return {
			queue: this.limiter.getStats(),
			circuitBreaker: this.circuitBreaker.getStats()
		};
	}

	resetCircuitBreaker(): void {
		this.circuitBreaker.reset();
	}

	getProcessStats(): { activeProcesses: number; totalSpawned: number } {
		return {
			activeProcesses: this.activeProcesses.size,
			totalSpawned: this.totalSpawned
		};
	}

	destroy(): void {
		this.destroyed = true;
		for (const [id, process] of this.activeProcesses) {
			process.kill('SIGKILL');
			this.activeProcesses.delete(id);
		}
		this.limiter.clear();
	}

	isDestroyed(): boolean {
		return this.destroyed;
	}
}

let globalSupervisor: ProcessSupervisor | null = null;

export function getProcessSupervisor(config?: Partial<ProcessSupervisorConfig>): ProcessSupervisor {
	if (!globalSupervisor) {
		globalSupervisor = new ProcessSupervisor(config);
	}
	return globalSupervisor;
}

export function resetProcessSupervisor(): void {
	globalSupervisor = null;
}
