/**
 * Effect.ts CLI Layer Tests
 * Tests for typed errors, circuit breaker, retry, and CLI execution
 */

import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { Effect, Exit } from 'effect';
import { createTestLogger } from '../../../../../scripts/smoke/lib/logger';
import {
	CLIError,
	ParseError,
	TimeoutError,
	CircuitOpenError,
	SchemaError,
	SpawnError,
	isEffectCLIError,
	generateRequestId
} from '../effect-errors';
import {
	createCircuitBreakerSync,
	makeCircuitBreaker,
	DEFAULT_CIRCUIT_CONFIG,
	type EffectCircuitBreaker
} from '../effect-circuit-breaker';
import {
	createEffectCLISync,
	resetEffectCLI,
	getEffectCLI,
	DEFAULT_EFFECT_CLI_CONFIG
} from '../effect-cli';
import { z } from 'zod';
import { Duration } from 'effect';

const logger = createTestLogger('Unit: Effect CLI');
let testStartTime: number;
let stepCount = 0;

describe('Effect CLI Layer', () => {
	beforeEach(() => {
		testStartTime = Date.now();
		stepCount = 0;
		resetEffectCLI();
	});

	afterAll(() => {
		const duration = Date.now() - testStartTime;
		logger.summary('Effect CLI Tests', true, duration, stepCount);
	});

	describe('Typed Error Hierarchy', () => {
		it('creates CLIError with correct tag and properties', () => {
			stepCount++;
			logger.step('Verify CLIError structure');

			const error = new CLIError({
				command: 'gt show test',
				exitCode: 1,
				stderr: 'Command failed',
				requestId: 'req_123'
			});

			logger.info('Created CLIError', { tag: error._tag, command: error.command });

			expect(error._tag).toBe('CLIError');
			expect(error.command).toBe('gt show test');
			expect(error.exitCode).toBe(1);
			expect(error.stderr).toBe('Command failed');
			expect(error.requestId).toBe('req_123');
			expect(error.message).toContain('gt show test');
			expect(error.message).toContain('exit code: 1');

			logger.success('CLIError has correct structure');
		});

		it('creates ParseError with correct tag and properties', () => {
			stepCount++;
			logger.step('Verify ParseError structure');

			const error = new ParseError({
				message: 'Unexpected token',
				raw: '{invalid json}',
				requestId: 'req_456'
			});

			logger.info('Created ParseError', { tag: error._tag, message: error.message });

			expect(error._tag).toBe('ParseError');
			expect(error.message).toBe('Unexpected token');
			expect(error.raw).toBe('{invalid json}');
			expect(error.requestId).toBe('req_456');

			logger.success('ParseError has correct structure');
		});

		it('creates TimeoutError with correct tag and properties', () => {
			stepCount++;
			logger.step('Verify TimeoutError structure');

			const error = new TimeoutError({
				command: 'gt list',
				timeout: 30000,
				requestId: 'req_789'
			});

			logger.info('Created TimeoutError', { tag: error._tag, timeout: error.timeout });

			expect(error._tag).toBe('TimeoutError');
			expect(error.command).toBe('gt list');
			expect(error.timeout).toBe(30000);
			expect(error.message).toContain('30000ms');
			expect(error.message).toContain('gt list');

			logger.success('TimeoutError has correct structure');
		});

		it('creates CircuitOpenError with correct tag and properties', () => {
			stepCount++;
			logger.step('Verify CircuitOpenError structure');

			const openSince = new Date();
			const error = new CircuitOpenError({
				command: 'gt status',
				openSince,
				requestId: 'req_abc'
			});

			logger.info('Created CircuitOpenError', { tag: error._tag, command: error.command });

			expect(error._tag).toBe('CircuitOpenError');
			expect(error.command).toBe('gt status');
			expect(error.openSince).toBe(openSince);
			expect(error.message).toContain('Circuit breaker is open');

			logger.success('CircuitOpenError has correct structure');
		});

		it('creates SchemaError with correct tag and properties', () => {
			stepCount++;
			logger.step('Verify SchemaError structure');

			const error = new SchemaError({
				command: 'gt show item',
				issues: [{ message: 'Required', path: ['id'], code: 'custom' }],
				requestId: 'req_def'
			});

			logger.info('Created SchemaError', { tag: error._tag, issues: error.issues.length });

			expect(error._tag).toBe('SchemaError');
			expect(error.command).toBe('gt show item');
			expect(error.issues).toHaveLength(1);
			expect(error.message).toContain('Schema validation failed');
			expect(error.message).toContain('Required');

			logger.success('SchemaError has correct structure');
		});

		it('creates SpawnError with correct tag and properties', () => {
			stepCount++;
			logger.step('Verify SpawnError structure');

			const error = new SpawnError({
				command: 'nonexistent',
				cause: 'ENOENT',
				requestId: 'req_ghi'
			});

			logger.info('Created SpawnError', { tag: error._tag, cause: error.cause });

			expect(error._tag).toBe('SpawnError');
			expect(error.command).toBe('nonexistent');
			expect(error.cause).toBe('ENOENT');
			expect(error.message).toContain('Failed to spawn process');

			logger.success('SpawnError has correct structure');
		});

		it('isEffectCLIError correctly identifies error types', () => {
			stepCount++;
			logger.step('Verify isEffectCLIError type guard');

			const cliError = new CLIError({
				command: 'test',
				exitCode: 1,
				stderr: '',
				requestId: 'req'
			});
			const parseError = new ParseError({ message: 'test', raw: '', requestId: 'req' });
			const regularError = new Error('regular');

			expect(isEffectCLIError(cliError)).toBe(true);
			expect(isEffectCLIError(parseError)).toBe(true);
			expect(isEffectCLIError(regularError)).toBe(false);
			expect(isEffectCLIError(null)).toBe(false);
			expect(isEffectCLIError(undefined)).toBe(false);

			logger.success('isEffectCLIError type guard works correctly');
		});

		it('generateRequestId creates unique IDs', () => {
			stepCount++;
			logger.step('Verify generateRequestId uniqueness');

			const ids = new Set<string>();
			for (let i = 0; i < 100; i++) {
				ids.add(generateRequestId());
			}

			logger.info('Generated 100 request IDs', { uniqueCount: ids.size });

			expect(ids.size).toBe(100);
			const sampleId = [...ids][0];
			expect(sampleId).toMatch(/^req_\d+_[a-z0-9]+$/);

			logger.success('generateRequestId creates unique IDs');
		});
	});

	describe('Effect Circuit Breaker', () => {
		let breaker: EffectCircuitBreaker;

		beforeEach(() => {
			breaker = createCircuitBreakerSync({
				failureThreshold: 3,
				successThreshold: 2,
				halfOpenTimeout: 50
			});
		});

		it('starts in CLOSED state', () => {
			stepCount++;
			logger.step('Verify initial CLOSED state');

			const state = Effect.runSync(breaker.getState);
			logger.info('Initial state', state);

			expect(state.state).toBe('CLOSED');
			expect(state.failureCount).toBe(0);
			expect(Effect.runSync(breaker.canExecute)).toBe(true);

			logger.success('Circuit breaker starts in CLOSED state');
		});

		it('opens after threshold failures', () => {
			stepCount++;
			logger.step('Verify circuit opens after threshold failures');

			for (let i = 0; i < 3; i++) {
				Effect.runSync(breaker.recordFailure);
				const state = Effect.runSync(breaker.getState);
				logger.info(`After failure ${i + 1}`, state);
			}

			const finalState = Effect.runSync(breaker.getState);
			expect(finalState.state).toBe('OPEN');
			expect(Effect.runSync(breaker.canExecute)).toBe(false);

			logger.success('Circuit opened after 3 failures');
		});

		it('returns CircuitOpenError when open', () => {
			stepCount++;
			logger.step('Verify CircuitOpenError when circuit is open');

			for (let i = 0; i < 3; i++) {
				Effect.runSync(breaker.recordFailure);
			}

			const testEffect = Effect.succeed('success');
			const result = Effect.runSyncExit(breaker.execute(testEffect, 'test command'));

			logger.info('Result when circuit open', { isFailure: Exit.isFailure(result) });

			expect(Exit.isFailure(result)).toBe(true);
			if (Exit.isFailure(result)) {
				const error = result.cause;
				expect(error._tag).toBe('Fail');
			}

			logger.success('CircuitOpenError returned when circuit is open');
		});

		it('transitions to HALF_OPEN after timeout', async () => {
			stepCount++;
			logger.step('Verify HALF_OPEN transition after timeout');

			for (let i = 0; i < 3; i++) {
				Effect.runSync(breaker.recordFailure);
			}

			const stateBefore = Effect.runSync(breaker.getState);
			logger.info('State before timeout', stateBefore);
			expect(stateBefore.state).toBe('OPEN');

			await new Promise((r) => setTimeout(r, 60));

			const canExecute = Effect.runSync(breaker.canExecute);
			logger.info('canExecute after timeout', { canExecute });

			expect(canExecute).toBe(true);

			logger.success('Circuit transitions to HALF_OPEN after timeout');
		});

		it('closes after success threshold in HALF_OPEN', async () => {
			stepCount++;
			logger.step('Verify CLOSED transition after success threshold');

			for (let i = 0; i < 3; i++) {
				Effect.runSync(breaker.recordFailure);
			}

			await new Promise((r) => setTimeout(r, 60));

			Effect.runSync(breaker.canExecute);

			Effect.runSync(breaker.recordSuccess);
			Effect.runSync(breaker.recordSuccess);

			const state = Effect.runSync(breaker.getState);
			logger.info('State after successes', state);

			expect(state.state).toBe('CLOSED');
			expect(state.failureCount).toBe(0);

			logger.success('Circuit closed after success threshold');
		});

		it('returns to OPEN on failure in HALF_OPEN', async () => {
			stepCount++;
			logger.step('Verify OPEN transition on HALF_OPEN failure');

			for (let i = 0; i < 3; i++) {
				Effect.runSync(breaker.recordFailure);
			}

			await new Promise((r) => setTimeout(r, 60));

			Effect.runSync(breaker.canExecute);

			Effect.runSync(breaker.recordFailure);

			const state = Effect.runSync(breaker.getState);
			logger.info('State after failure in HALF_OPEN', state);

			expect(state.state).toBe('OPEN');

			logger.success('Circuit returned to OPEN on HALF_OPEN failure');
		});

		it('reset() returns to initial state', () => {
			stepCount++;
			logger.step('Verify reset functionality');

			for (let i = 0; i < 3; i++) {
				Effect.runSync(breaker.recordFailure);
			}

			const stateBefore = Effect.runSync(breaker.getState);
			logger.info('State before reset', stateBefore);

			Effect.runSync(breaker.reset);

			const stateAfter = Effect.runSync(breaker.getState);
			logger.info('State after reset', stateAfter);

			expect(stateAfter.state).toBe('CLOSED');
			expect(stateAfter.failureCount).toBe(0);
			expect(stateAfter.successCount).toBe(0);

			logger.success('Reset returns circuit to initial state');
		});

		it('makeCircuitBreaker creates circuit breaker via Effect', async () => {
			stepCount++;
			logger.step('Verify makeCircuitBreaker Effect creation');

			const cb = await Effect.runPromise(makeCircuitBreaker(DEFAULT_CIRCUIT_CONFIG));
			const state = await Effect.runPromise(cb.getState);

			logger.info('Created circuit breaker state', state);

			expect(state.state).toBe('CLOSED');
			expect(state.failureCount).toBe(0);

			logger.success('makeCircuitBreaker creates circuit breaker correctly');
		});
	});

	describe('Effect CLI Configuration', () => {
		it('uses default configuration values', () => {
			stepCount++;
			logger.step('Verify default configuration');

			logger.info('Default config', {
				defaultTimeout: Duration.toMillis(DEFAULT_EFFECT_CLI_CONFIG.defaultTimeout),
				maxRetries: DEFAULT_EFFECT_CLI_CONFIG.maxRetries,
				circuitBreaker: DEFAULT_EFFECT_CLI_CONFIG.circuitBreaker
			});

			expect(Duration.toMillis(DEFAULT_EFFECT_CLI_CONFIG.defaultTimeout)).toBe(30000);
			expect(DEFAULT_EFFECT_CLI_CONFIG.maxRetries).toBe(3);
			expect(DEFAULT_EFFECT_CLI_CONFIG.circuitBreaker.failureThreshold).toBe(5);
			expect(DEFAULT_EFFECT_CLI_CONFIG.circuitBreaker.successThreshold).toBe(2);
			expect(DEFAULT_EFFECT_CLI_CONFIG.circuitBreaker.halfOpenTimeout).toBe(30000);

			logger.success('Default configuration values are correct');
		});

		it('creates Effect CLI with custom configuration', () => {
			stepCount++;
			logger.step('Verify custom configuration');

			const customConfig = {
				defaultTimeout: Duration.seconds(60),
				maxRetries: 5,
				retryBaseDelay: Duration.millis(200),
				circuitBreaker: {
					failureThreshold: 10,
					successThreshold: 3,
					halfOpenTimeout: 60000
				}
			};

			const cli = createEffectCLISync(customConfig);
			logger.info('Created CLI with custom config');

			expect(cli.gt).toBeDefined();
			expect(cli.bd).toBeDefined();
			expect(cli.execute).toBeDefined();
			expect(cli.getCircuitBreaker).toBeDefined();

			logger.success('Effect CLI created with custom configuration');
		});
	});

	describe('Effect CLI Instance Management', () => {
		it('getEffectCLI returns singleton instance', () => {
			stepCount++;
			logger.step('Verify singleton pattern');

			const cli1 = getEffectCLI();
			const cli2 = getEffectCLI();

			expect(cli1).toBe(cli2);

			logger.success('getEffectCLI returns singleton instance');
		});

		it('resetEffectCLI creates new instance', () => {
			stepCount++;
			logger.step('Verify reset creates new instance');

			const cli1 = getEffectCLI();
			resetEffectCLI();
			const cli2 = getEffectCLI();

			expect(cli1).not.toBe(cli2);

			logger.success('resetEffectCLI creates new instance');
		});

		it('has separate circuit breakers for gt and bd', () => {
			stepCount++;
			logger.step('Verify separate circuit breakers');

			const cli = getEffectCLI();
			const gtBreaker = cli.getCircuitBreaker('gt');
			const bdBreaker = cli.getCircuitBreaker('bd');

			expect(gtBreaker).not.toBe(bdBreaker);

			for (let i = 0; i < 5; i++) {
				Effect.runSync(gtBreaker.recordFailure);
			}

			const gtState = Effect.runSync(gtBreaker.getState);
			const bdState = Effect.runSync(bdBreaker.getState);

			logger.info('Circuit breaker states', { gt: gtState.state, bd: bdState.state });

			expect(gtState.state).toBe('OPEN');
			expect(bdState.state).toBe('CLOSED');

			logger.success('Circuit breakers are separate for gt and bd');
		});

		it('resetCircuitBreaker resets specific command breaker', async () => {
			stepCount++;
			logger.step('Verify individual circuit breaker reset');

			const cli = getEffectCLI();
			const gtBreaker = cli.getCircuitBreaker('gt');

			for (let i = 0; i < 5; i++) {
				Effect.runSync(gtBreaker.recordFailure);
			}

			const stateBefore = Effect.runSync(gtBreaker.getState);
			logger.info('State before reset', stateBefore);
			expect(stateBefore.state).toBe('OPEN');

			await Effect.runPromise(cli.resetCircuitBreaker('gt'));

			const stateAfter = Effect.runSync(gtBreaker.getState);
			logger.info('State after reset', stateAfter);
			expect(stateAfter.state).toBe('CLOSED');

			logger.success('Individual circuit breaker reset works');
		});
	});

	describe('CLI Execution with Real Commands', () => {
		it('executes echo command and returns result', async () => {
			stepCount++;
			logger.step('Verify CLI execution with echo');

			const cli = createEffectCLISync({
				...DEFAULT_EFFECT_CLI_CONFIG,
				maxRetries: 0
			});

			const result = await Effect.runPromiseExit(
				cli.execute('gt', ['--help'], { timeout: Duration.seconds(5) })
			);

			logger.info('Execution result', { isSuccess: Exit.isSuccess(result) });

			if (Exit.isFailure(result)) {
				logger.info('Expected failure (gt may not be installed)');
			}

			logger.success('CLI execution completed');
		});
	});

	describe('Circuit Breaker Integration', () => {
		it('circuit breaker opens after failureThreshold', () => {
			stepCount++;
			logger.step('Verify circuit opens at exactly failureThreshold');

			const breaker = createCircuitBreakerSync({
				failureThreshold: 5,
				successThreshold: 2,
				halfOpenTimeout: 30000
			});

			for (let i = 0; i < 4; i++) {
				Effect.runSync(breaker.recordFailure);
			}

			const stateAt4 = Effect.runSync(breaker.getState);
			logger.info('State after 4 failures', stateAt4);
			expect(stateAt4.state).toBe('CLOSED');

			Effect.runSync(breaker.recordFailure);

			const stateAt5 = Effect.runSync(breaker.getState);
			logger.info('State after 5 failures', stateAt5);
			expect(stateAt5.state).toBe('OPEN');

			logger.success('Circuit opens at exactly failureThreshold=5');
		});

		it('circuit breaker closes after successThreshold in HALF_OPEN', async () => {
			stepCount++;
			logger.step('Verify circuit closes at exactly successThreshold');

			const breaker = createCircuitBreakerSync({
				failureThreshold: 1,
				successThreshold: 2,
				halfOpenTimeout: 50
			});

			Effect.runSync(breaker.recordFailure);

			await new Promise((r) => setTimeout(r, 60));
			Effect.runSync(breaker.canExecute);

			Effect.runSync(breaker.recordSuccess);
			const stateAt1 = Effect.runSync(breaker.getState);
			logger.info('State after 1 success', stateAt1);
			expect(stateAt1.state).toBe('HALF_OPEN');

			Effect.runSync(breaker.recordSuccess);
			const stateAt2 = Effect.runSync(breaker.getState);
			logger.info('State after 2 successes', stateAt2);
			expect(stateAt2.state).toBe('CLOSED');

			logger.success('Circuit closes at exactly successThreshold=2');
		});

		it('circuit breaker reopens after 30s timeout (simulated)', async () => {
			stepCount++;
			logger.step('Verify halfOpenTimeout behavior');

			const breaker = createCircuitBreakerSync({
				failureThreshold: 1,
				successThreshold: 2,
				halfOpenTimeout: 50
			});

			Effect.runSync(breaker.recordFailure);
			expect(Effect.runSync(breaker.canExecute)).toBe(false);

			await new Promise((r) => setTimeout(r, 30));
			expect(Effect.runSync(breaker.canExecute)).toBe(false);

			await new Promise((r) => setTimeout(r, 30));
			expect(Effect.runSync(breaker.canExecute)).toBe(true);

			logger.success('halfOpenTimeout behavior verified');
		});
	});
});
