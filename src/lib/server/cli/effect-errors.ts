/**
 * Effect.ts CLI Error Hierarchy - Typed errors for CLI operations
 * Architecture Decision: Replace Promise-based CLI execution with Effect.ts
 *
 * Benefits:
 * - Compile-time error tracking (know what can fail)
 * - Pattern matching on error types
 * - Composable error handling
 */

import { Data } from 'effect';
import type { ZodIssue } from 'zod';

/**
 * CLI execution error - command failed with non-zero exit code
 */
export class CLIError extends Data.TaggedError('CLIError')<{
	readonly command: string;
	readonly exitCode: number;
	readonly stderr: string;
	readonly requestId: string;
}> {
	get message(): string {
		return `CLI command failed: ${this.command} (exit code: ${this.exitCode})`;
	}
}

/**
 * Parse error - failed to parse CLI output
 */
export class ParseError extends Data.TaggedError('ParseError')<{
	readonly message: string;
	readonly raw: string;
	readonly requestId: string;
}> {}

/**
 * Timeout error - command exceeded time limit
 */
export class TimeoutError extends Data.TaggedError('TimeoutError')<{
	readonly command: string;
	readonly timeout: number;
	readonly requestId: string;
}> {
	get message(): string {
		return `Command timed out after ${this.timeout}ms: ${this.command}`;
	}
}

/**
 * Circuit open error - circuit breaker is preventing execution
 */
export class CircuitOpenError extends Data.TaggedError('CircuitOpenError')<{
	readonly command: string;
	readonly openSince: Date;
	readonly requestId: string;
}> {
	get message(): string {
		return `Circuit breaker is open for command: ${this.command}`;
	}
}

/**
 * Schema validation error - output failed schema validation
 */
export class SchemaError extends Data.TaggedError('SchemaError')<{
	readonly command: string;
	readonly issues: ZodIssue[];
	readonly requestId: string;
}> {
	get message(): string {
		const issueMessages = this.issues.map((i) => i.message).join('; ');
		return `Schema validation failed for ${this.command}: ${issueMessages}`;
	}
}

/**
 * Spawn error - failed to start the process
 */
export class SpawnError extends Data.TaggedError('SpawnError')<{
	readonly command: string;
	readonly cause: string;
	readonly requestId: string;
}> {
	get message(): string {
		return `Failed to spawn process: ${this.command} - ${this.cause}`;
	}
}

/**
 * Union type of all CLI errors for exhaustive pattern matching
 */
export type EffectCLIError =
	| CLIError
	| ParseError
	| TimeoutError
	| CircuitOpenError
	| SchemaError
	| SpawnError;

/**
 * Type guard to check if an error is an EffectCLIError
 */
export function isEffectCLIError(error: unknown): error is EffectCLIError {
	return (
		error instanceof CLIError ||
		error instanceof ParseError ||
		error instanceof TimeoutError ||
		error instanceof CircuitOpenError ||
		error instanceof SchemaError ||
		error instanceof SpawnError
	);
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
	return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
