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
 */

import { execFile } from 'node:child_process';
import type { CLIResult, CLICommandConfig, ProcessSupervisorConfig } from './contracts';
import { DEFAULT_CONFIG } from './contracts';
import { ConcurrencyLimiter } from './concurrency-limiter';
import { CircuitBreaker } from './circuit-breaker';

export class ProcessSupervisor {
	private readonly config: ProcessSupervisorConfig;
	private readonly limiter: ConcurrencyLimiter;
	private readonly circuitBreaker: CircuitBreaker;

	constructor(config: Partial<ProcessSupervisorConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.limiter = new ConcurrencyLimiter(this.config.maxConcurrency);
		this.circuitBreaker = new CircuitBreaker(
			this.config.circuitBreakerThreshold,
			this.config.circuitBreakerResetTime
		);
	}

	async execute<T = unknown>(commandConfig: CLICommandConfig): Promise<CLIResult<T>> {
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
					const duration = Date.now() - startTime;

					if (error) {
						this.circuitBreaker.recordFailure();

						const isTimeout = error.killed || error.message.includes('ETIMEDOUT');
						const errorMessage = isTimeout
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

			child.on('error', (err) => {
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
