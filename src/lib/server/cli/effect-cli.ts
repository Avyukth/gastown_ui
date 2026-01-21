/**
 * Effect.ts CLI Execution Layer - Typed errors, retry, circuit breaker, streaming
 * Architecture Decision: Replace Promise-based CLI execution with Effect.ts
 *
 * Features:
 * - Compile-time error tracking (know what can fail)
 * - Built-in retry with exponential backoff
 * - Circuit breaker per command family prevents hammering
 * - Dependency injection for testability
 * - Composable operations
 */

import { execFile, type ExecFileException } from 'node:child_process';
import { Effect, Schedule, pipe, Duration } from 'effect';
import type { ZodSchema } from 'zod';
import {
	CLIError,
	ParseError,
	TimeoutError,
	SpawnError,
	SchemaError,
	generateRequestId,
	type EffectCLIError
} from './effect-errors';
import {
	makeCircuitBreaker,
	createCircuitBreakerSync,
	type EffectCircuitBreaker,
	type CircuitBreakerConfig,
	DEFAULT_CIRCUIT_CONFIG
} from './effect-circuit-breaker';
import type { CLICommand } from './contracts';

export interface EffectCLIConfig {
	readonly defaultTimeout: Duration.Duration;
	readonly maxRetries: number;
	readonly retryBaseDelay: Duration.Duration;
	readonly circuitBreaker: CircuitBreakerConfig;
}

export const DEFAULT_EFFECT_CLI_CONFIG: EffectCLIConfig = {
	defaultTimeout: Duration.seconds(30),
	maxRetries: 3,
	retryBaseDelay: Duration.millis(100),
	circuitBreaker: DEFAULT_CIRCUIT_CONFIG
};

export interface EffectCLIResult<T> {
	readonly data: T;
	readonly duration: number;
	readonly command: string;
	readonly requestId: string;
}

interface RunProcessOptions {
	readonly command: string;
	readonly args: string[];
	readonly timeout: Duration.Duration;
	readonly cwd?: string;
	readonly requestId: string;
}

/**
 * Run a process and return an Effect with typed errors
 */
function runProcessEffect(
	options: RunProcessOptions
): Effect.Effect<string, CLIError | TimeoutError | SpawnError> {
	const { command, args, timeout, cwd, requestId } = options;
	const timeoutMs = Duration.toMillis(timeout);
	const fullCommand = `${command} ${args.join(' ')}`;

	return Effect.async<string, CLIError | TimeoutError | SpawnError>((resume) => {
		const child = execFile(
			command,
			args,
			{
				timeout: timeoutMs,
				maxBuffer: 10 * 1024 * 1024,
				cwd,
				env: process.env
			},
			(error: ExecFileException | null, stdout: string, stderr: string) => {
				if (error) {
					const isTimeout = error.killed || error.message.includes('ETIMEDOUT');

					if (isTimeout) {
						resume(
							Effect.fail(
								new TimeoutError({
									command: fullCommand,
									timeout: timeoutMs,
									requestId
								})
							)
						);
						return;
					}

					resume(
						Effect.fail(
							new CLIError({
								command: fullCommand,
								exitCode: typeof error.code === 'number' ? error.code : -1,
								stderr: stderr || error.message,
								requestId
							})
						)
					);
					return;
				}

				resume(Effect.succeed(stdout));
			}
		);

		child.on('error', (err: Error) => {
			resume(
				Effect.fail(
					new SpawnError({
						command: fullCommand,
						cause: err.message,
						requestId
					})
				)
			);
		});
	});
}

/**
 * Parse JSON output from CLI, returning typed ParseError on failure
 */
function parseJsonOutput<T>(
	raw: string,
	requestId: string
): Effect.Effect<T, ParseError> {
	return Effect.try({
		try: () => JSON.parse(raw) as T,
		catch: (error) =>
			new ParseError({
				message: error instanceof Error ? error.message : 'Unknown parse error',
				raw,
				requestId
			})
	});
}

/**
 * Validate output against a Zod schema
 */
function validateOutput<T>(
	data: unknown,
	schema: ZodSchema<T>,
	command: string,
	requestId: string
): Effect.Effect<T, SchemaError> {
	return Effect.try({
		try: () => {
			const result = schema.safeParse(data);
			if (!result.success) {
				throw result.error;
			}
			return result.data;
		},
		catch: (error) => {
			const zodError = error as { issues?: Array<{ message: string; path: Array<string | number> }> };
			return new SchemaError({
				command,
				issues: zodError.issues?.map((i) => ({
					message: i.message,
					path: i.path,
					code: 'custom' as const
				})) ?? [],
				requestId
			});
		}
	});
}

/**
 * Create retry schedule with exponential backoff and jitter
 */
function createRetrySchedule(config: EffectCLIConfig) {
	return pipe(
		Schedule.exponential(config.retryBaseDelay),
		Schedule.jittered,
		Schedule.compose(Schedule.recurs(config.maxRetries))
	);
}

/**
 * Log CLI errors for observability
 */
function logCliError(error: EffectCLIError): Effect.Effect<void> {
	return Effect.sync(() => {
		console.error(`[CLI Error] ${error._tag}: ${error.requestId}`, {
			tag: error._tag,
			requestId: error.requestId,
			details: error
		});
	});
}

export interface EffectCLI {
	readonly gt: <T = unknown>(
		args: string[],
		options?: { timeout?: Duration.Duration; schema?: ZodSchema<T>; cwd?: string }
	) => Effect.Effect<EffectCLIResult<T>, EffectCLIError>;

	readonly bd: <T = unknown>(
		args: string[],
		options?: { timeout?: Duration.Duration; schema?: ZodSchema<T>; cwd?: string }
	) => Effect.Effect<EffectCLIResult<T>, EffectCLIError>;

	readonly execute: <T = unknown>(
		command: CLICommand,
		args: string[],
		options?: { timeout?: Duration.Duration; schema?: ZodSchema<T>; cwd?: string }
	) => Effect.Effect<EffectCLIResult<T>, EffectCLIError>;

	readonly getCircuitBreaker: (command: CLICommand) => EffectCircuitBreaker;
	readonly resetCircuitBreaker: (command: CLICommand) => Effect.Effect<void>;
}

/**
 * Create an Effect-based CLI executor with circuit breaker per command family
 */
export function makeEffectCLI(
	config: EffectCLIConfig = DEFAULT_EFFECT_CLI_CONFIG
): Effect.Effect<EffectCLI> {
	return pipe(
		Effect.all({
			gtCircuitBreaker: makeCircuitBreaker(config.circuitBreaker),
			bdCircuitBreaker: makeCircuitBreaker(config.circuitBreaker)
		}),
		Effect.map(({ gtCircuitBreaker, bdCircuitBreaker }) => {
			const circuitBreakers: Record<CLICommand, EffectCircuitBreaker> = {
				gt: gtCircuitBreaker,
				bd: bdCircuitBreaker
			};

			const execute = <T = unknown>(
				command: CLICommand,
				args: string[],
				options: { timeout?: Duration.Duration; schema?: ZodSchema<T>; cwd?: string } = {}
			): Effect.Effect<EffectCLIResult<T>, EffectCLIError> => {
				const requestId = generateRequestId();
				const startTime = Date.now();
				const timeout = options.timeout ?? config.defaultTimeout;
				const fullCommand = `${command} ${args.join(' ')}`;
				const circuitBreaker = circuitBreakers[command];

				const processEffect = runProcessEffect({
					command,
					args,
					timeout,
					cwd: options.cwd,
					requestId
				});

				const withParsing = pipe(
					processEffect,
					Effect.flatMap((stdout) => {
						if (options.schema) {
							return pipe(
								parseJsonOutput<unknown>(stdout, requestId),
								Effect.flatMap((data) =>
									validateOutput(data, options.schema!, fullCommand, requestId)
								)
							);
						}
						return parseJsonOutput<T>(stdout, requestId);
					})
				);

				const withRetry = pipe(
					withParsing,
					Effect.retry(createRetrySchedule(config)),
					Effect.tapError(logCliError)
				);

				const withCircuitBreaker = circuitBreaker.execute(withRetry, fullCommand);

				return pipe(
					withCircuitBreaker,
					Effect.map(
						(data): EffectCLIResult<T> => ({
							data,
							duration: Date.now() - startTime,
							command: fullCommand,
							requestId
						})
					)
				);
			};

			const gt = <T = unknown>(
				args: string[],
				options?: { timeout?: Duration.Duration; schema?: ZodSchema<T>; cwd?: string }
			) => execute<T>('gt', args, options);

			const bd = <T = unknown>(
				args: string[],
				options?: { timeout?: Duration.Duration; schema?: ZodSchema<T>; cwd?: string }
			) => execute<T>('bd', args, options);

			const getCircuitBreaker = (command: CLICommand) => circuitBreakers[command];

			const resetCircuitBreaker = (command: CLICommand) =>
				circuitBreakers[command].reset;

			return {
				gt,
				bd,
				execute,
				getCircuitBreaker,
				resetCircuitBreaker
			};
		})
	);
}

/**
 * Create an Effect CLI synchronously (for simple use cases)
 */
export function createEffectCLISync(
	config: EffectCLIConfig = DEFAULT_EFFECT_CLI_CONFIG
): EffectCLI {
	const gtCircuitBreaker = createCircuitBreakerSync(config.circuitBreaker);
	const bdCircuitBreaker = createCircuitBreakerSync(config.circuitBreaker);

	const circuitBreakers: Record<CLICommand, EffectCircuitBreaker> = {
		gt: gtCircuitBreaker,
		bd: bdCircuitBreaker
	};

	const execute = <T = unknown>(
		command: CLICommand,
		args: string[],
		options: { timeout?: Duration.Duration; schema?: ZodSchema<T>; cwd?: string } = {}
	): Effect.Effect<EffectCLIResult<T>, EffectCLIError> => {
		const requestId = generateRequestId();
		const startTime = Date.now();
		const timeout = options.timeout ?? config.defaultTimeout;
		const fullCommand = `${command} ${args.join(' ')}`;
		const circuitBreaker = circuitBreakers[command];

		const processEffect = runProcessEffect({
			command,
			args,
			timeout,
			cwd: options.cwd,
			requestId
		});

		const withParsing = pipe(
			processEffect,
			Effect.flatMap((stdout) => {
				if (options.schema) {
					return pipe(
						parseJsonOutput<unknown>(stdout, requestId),
						Effect.flatMap((data) =>
							validateOutput(data, options.schema!, fullCommand, requestId)
						)
					);
				}
				return parseJsonOutput<T>(stdout, requestId);
			})
		);

		const withRetry = pipe(
			withParsing,
			Effect.retry(createRetrySchedule(config)),
			Effect.tapError(logCliError)
		);

		const withCircuitBreaker = circuitBreaker.execute(withRetry, fullCommand);

		return pipe(
			withCircuitBreaker,
			Effect.map(
				(data): EffectCLIResult<T> => ({
					data,
					duration: Date.now() - startTime,
					command: fullCommand,
					requestId
				})
			)
		);
	};

	const gt = <T = unknown>(
		args: string[],
		options?: { timeout?: Duration.Duration; schema?: ZodSchema<T>; cwd?: string }
	) => execute<T>('gt', args, options);

	const bd = <T = unknown>(
		args: string[],
		options?: { timeout?: Duration.Duration; schema?: ZodSchema<T>; cwd?: string }
	) => execute<T>('bd', args, options);

	const getCircuitBreaker = (command: CLICommand) => circuitBreakers[command];

	const resetCircuitBreaker = (command: CLICommand) => circuitBreakers[command].reset;

	return {
		gt,
		bd,
		execute,
		getCircuitBreaker,
		resetCircuitBreaker
	};
}

let globalEffectCLI: EffectCLI | null = null;

/**
 * Get or create the global Effect CLI instance
 */
export function getEffectCLI(config?: EffectCLIConfig): EffectCLI {
	if (!globalEffectCLI) {
		globalEffectCLI = createEffectCLISync(config);
	}
	return globalEffectCLI;
}

/**
 * Reset the global Effect CLI instance (for testing)
 */
export function resetEffectCLI(): void {
	globalEffectCLI = null;
}

/**
 * Convenience function: execute gt command and run the Effect
 */
export function execGt<T = unknown>(
	args: string[],
	options?: { timeout?: Duration.Duration; schema?: ZodSchema<T>; cwd?: string }
): Effect.Effect<EffectCLIResult<T>, EffectCLIError> {
	return getEffectCLI().gt(args, options);
}

/**
 * Convenience function: execute bd command and run the Effect
 */
export function execBd<T = unknown>(
	args: string[],
	options?: { timeout?: Duration.Duration; schema?: ZodSchema<T>; cwd?: string }
): Effect.Effect<EffectCLIResult<T>, EffectCLIError> {
	return getEffectCLI().bd(args, options);
}
