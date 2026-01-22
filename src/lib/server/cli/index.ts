/**
 * CLI Foundation Layer - Safe, observable CLI execution
 *
 * Architecture Decisions:
 * - D0.3: CLI Operations Concurrency (Sequential with queue)
 * - D0.5: Process Supervisor Pattern
 * - D0.6: Capabilities Probe + CLI Contracts
 * - Effect.ts CLI Execution Layer (typed errors, retry, circuit breaker)
 */

export * from './contracts';
export * from './parse';
export * from './process-supervisor';
export * from './concurrency-limiter';
export * from './circuit-breaker';
export * from './capabilities';
export * from './validation';

// Effect.ts CLI Layer - explicit exports to avoid conflicts
export {
	CLIError,
	ParseError as EffectParseError,
	TimeoutError as EffectTimeoutError,
	CircuitOpenError,
	SchemaError,
	SpawnError,
	type EffectCLIError,
	isEffectCLIError,
	generateRequestId
} from './effect-errors';

export {
	// CircuitState already exported from circuit-breaker.ts
	type CircuitBreakerConfig,
	DEFAULT_CIRCUIT_CONFIG,
	type EffectCircuitBreaker,
	makeCircuitBreaker,
	createCircuitBreakerSync
} from './effect-circuit-breaker';

export * from './effect-cli';
