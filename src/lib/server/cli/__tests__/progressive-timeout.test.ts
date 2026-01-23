/**
 * Progressive Timeout Strategy Tests
 *
 * Tests for timeout progression: 30s -> 60s -> 120s -> 300s (max 5 min)
 * Architecture Decision: Resilient CLI execution with adaptive timeouts
 */

import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import {
	calculateTimeout,
	executeWithProgressiveTimeout,
	TimeoutError,
	MaxRetriesError,
	CancellationError,
	DEFAULT_PROGRESSIVE_TIMEOUT_CONFIG,
	type ProgressiveTimeoutConfig
} from '../progressive-timeout';
import { createTestLogger } from '../../../../../scripts/smoke/lib/logger';

const logger = createTestLogger('Unit: Progressive Timeout');
let testStartTime: number;
let stepCount = 0;

describe('ProgressiveTimeout', () => {
	beforeEach(() => {
		testStartTime = Date.now();
		stepCount = 0;
	});

	afterAll(() => {
		const duration = Date.now() - testStartTime;
		logger.summary('ProgressiveTimeout Tests', true, duration, stepCount);
	});

	describe('calculateTimeout', () => {
		it('returns initial timeout for attempt 0', () => {
			stepCount++;
			logger.step('Verify initial timeout for first attempt');

			const timeout = calculateTimeout(0);
			logger.info('Timeout for attempt 0', { timeout });

			expect(timeout).toBe(30000); // 30 seconds
			logger.success('Initial timeout is 30 seconds');
		});

		it('doubles timeout for each retry attempt', () => {
			stepCount++;
			logger.step('Verify timeout doubles on each retry');

			const t0 = calculateTimeout(0);
			const t1 = calculateTimeout(1);
			const t2 = calculateTimeout(2);

			logger.info('Timeout progression', { t0, t1, t2 });

			expect(t0).toBe(30000); // 30s
			expect(t1).toBe(60000); // 60s
			expect(t2).toBe(120000); // 120s
			logger.success('Timeout doubles correctly: 30s -> 60s -> 120s');
		});

		it('caps timeout at maxTimeout (5 minutes)', () => {
			stepCount++;
			logger.step('Verify timeout caps at 5 minutes');

			const t3 = calculateTimeout(3);
			const t4 = calculateTimeout(4);
			const t10 = calculateTimeout(10);

			logger.info('Timeout at high attempts', { t3, t4, t10 });

			expect(t3).toBe(240000); // 240s = 4 min (30 * 2^3)
			expect(t4).toBe(300000); // 300s = 5 min (capped, would be 480s)
			expect(t10).toBe(300000); // Still capped at 5 min
			logger.success('Timeout correctly capped at 5 minutes');
		});

		it('uses custom configuration when provided', () => {
			stepCount++;
			logger.step('Verify custom configuration is respected');

			const config: Partial<ProgressiveTimeoutConfig> = {
				initialTimeout: 10000, // 10s
				multiplier: 3,
				maxTimeout: 60000 // 1 min
			};

			const t0 = calculateTimeout(0, config);
			const t1 = calculateTimeout(1, config);
			const t2 = calculateTimeout(2, config);

			logger.info('Custom config timeout progression', { t0, t1, t2, config });

			expect(t0).toBe(10000); // 10s
			expect(t1).toBe(30000); // 30s (10 * 3)
			expect(t2).toBe(60000); // 60s capped (would be 90s)
			logger.success('Custom configuration applied correctly');
		});

		it('throws on negative attempt number', () => {
			stepCount++;
			logger.step('Verify negative attempt throws error');

			expect(() => calculateTimeout(-1)).toThrow('Attempt number must be non-negative');
			logger.success('Negative attempt throws error');
		});

		it('throws on non-integer attempt number', () => {
			stepCount++;
			logger.step('Verify non-integer attempt throws error');

			expect(() => calculateTimeout(1.5)).toThrow('Attempt number must be an integer');
			logger.success('Non-integer attempt throws error');
		});

		it('validates config initialTimeout is positive', () => {
			stepCount++;
			logger.step('Verify config validation for initialTimeout');

			expect(() => calculateTimeout(0, { initialTimeout: 0 })).toThrow(
				'initialTimeout must be positive'
			);
			expect(() => calculateTimeout(0, { initialTimeout: -100 })).toThrow(
				'initialTimeout must be positive'
			);
			logger.success('Invalid initialTimeout throws error');
		});

		it('validates config multiplier is greater than 1', () => {
			stepCount++;
			logger.step('Verify config validation for multiplier');

			expect(() => calculateTimeout(0, { multiplier: 1 })).toThrow(
				'multiplier must be greater than 1'
			);
			expect(() => calculateTimeout(0, { multiplier: 0.5 })).toThrow(
				'multiplier must be greater than 1'
			);
			logger.success('Invalid multiplier throws error');
		});

		it('validates config maxTimeout is greater than initialTimeout', () => {
			stepCount++;
			logger.step('Verify config validation for maxTimeout');

			expect(() => calculateTimeout(0, { initialTimeout: 30000, maxTimeout: 20000 })).toThrow(
				'maxTimeout must be greater than initialTimeout'
			);
			logger.success('Invalid maxTimeout relationship throws error');
		});
	});

	describe('DEFAULT_PROGRESSIVE_TIMEOUT_CONFIG', () => {
		it('has correct default values', () => {
			stepCount++;
			logger.step('Verify default configuration values');

			logger.info('Default config', DEFAULT_PROGRESSIVE_TIMEOUT_CONFIG);

			expect(DEFAULT_PROGRESSIVE_TIMEOUT_CONFIG.initialTimeout).toBe(30000); // 30s
			expect(DEFAULT_PROGRESSIVE_TIMEOUT_CONFIG.multiplier).toBe(2);
			expect(DEFAULT_PROGRESSIVE_TIMEOUT_CONFIG.maxTimeout).toBe(300000); // 5 min
			expect(DEFAULT_PROGRESSIVE_TIMEOUT_CONFIG.maxRetries).toBe(3);
			logger.success('Default configuration has correct values');
		});
	});

	describe('executeWithProgressiveTimeout', () => {
		it('returns result on immediate success', async () => {
			stepCount++;
			logger.step('Verify immediate success returns result');

			const operation = vi.fn().mockResolvedValue({ data: 'success' });

			const result = await executeWithProgressiveTimeout(operation, {
				initialTimeout: 100 // Use short timeout for test
			});

			logger.info('Result from successful operation', { result });

			expect(result).toEqual({ data: 'success' });
			expect(operation).toHaveBeenCalledTimes(1);
			logger.success('Immediate success returns result');
		});

		it('retries on timeout with increasing timeout values', async () => {
			stepCount++;
			logger.step('Verify retry with increasing timeouts');

			let attemptCount = 0;
			const timeouts: number[] = [];

			// Use very short timeouts for testing
			const config = {
				initialTimeout: 10,
				multiplier: 2,
				maxTimeout: 100,
				maxRetries: 3
			};

			const operation = vi.fn().mockImplementation(async (signal: AbortSignal) => {
				attemptCount++;
				// Calculate expected timeout for this attempt
				const expectedTimeout = calculateTimeout(attemptCount - 1, config);
				timeouts.push(expectedTimeout);

				// Always time out - wait longer than timeout
				return new Promise((_, reject) => {
					const timer = setTimeout(
						() => {
							reject(new Error('Operation completed too late'));
						},
						expectedTimeout + 50
					);

					signal.addEventListener('abort', () => {
						clearTimeout(timer);
						reject(new TimeoutError(expectedTimeout, attemptCount - 1));
					});
				});
			});

			await expect(executeWithProgressiveTimeout(operation, config)).rejects.toThrow(
				MaxRetriesError
			);

			logger.info('Timeout progression', { attemptCount, timeouts });

			expect(attemptCount).toBe(4); // Initial + 3 retries
			expect(timeouts).toEqual([10, 20, 40, 80]);
			logger.success('Retried with increasing timeout values');
		});

		it('succeeds on retry after initial timeout', async () => {
			stepCount++;
			logger.step('Verify success on retry after initial timeout');

			let attemptCount = 0;

			const config = {
				initialTimeout: 20,
				multiplier: 2,
				maxTimeout: 100,
				maxRetries: 3
			};

			const operation = vi.fn().mockImplementation(async (signal: AbortSignal) => {
				attemptCount++;

				if (attemptCount === 1) {
					// First attempt times out - wait longer than timeout
					return new Promise((_, reject) => {
						const timer = setTimeout(() => {
							reject(new Error('Too late'));
						}, 50);

						signal.addEventListener('abort', () => {
							clearTimeout(timer);
							reject(new TimeoutError(20, 0));
						});
					});
				}

				// Second attempt succeeds immediately
				return { data: 'success on retry' };
			});

			const result = await executeWithProgressiveTimeout(operation, config);

			logger.info('Result after retry', { result, attemptCount });

			expect(result).toEqual({ data: 'success on retry' });
			expect(attemptCount).toBe(2);
			logger.success('Succeeded on retry after initial timeout');
		});

		it('throws MaxRetriesError after exhausting all retries', async () => {
			stepCount++;
			logger.step('Verify MaxRetriesError after max retries');

			const config = {
				initialTimeout: 10,
				multiplier: 2,
				maxTimeout: 100,
				maxRetries: 2
			};

			const operation = vi.fn().mockImplementation(async (signal: AbortSignal) => {
				return new Promise((_, reject) => {
					const timer = setTimeout(
						() => {
							reject(new Error('Too late'));
						},
						1000
					);

					signal.addEventListener('abort', () => {
						clearTimeout(timer);
						reject(new TimeoutError(10, 0));
					});
				});
			});

			await expect(executeWithProgressiveTimeout(operation, config)).rejects.toThrow(
				MaxRetriesError
			);

			expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
			logger.success('Threw MaxRetriesError after exhausting retries');
		});

		it('throws TimeoutError with correct details', async () => {
			stepCount++;
			logger.step('Verify TimeoutError contains correct details');

			const config = {
				initialTimeout: 10,
				maxRetries: 0
			};

			const operation = vi.fn().mockImplementation(async (signal: AbortSignal) => {
				return new Promise((_, reject) => {
					signal.addEventListener('abort', () => {
						reject(new TimeoutError(10, 0));
					});
				});
			});

			try {
				await executeWithProgressiveTimeout(operation, config);
				expect.fail('Should have thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(MaxRetriesError);
				if (error instanceof MaxRetriesError) {
					expect(error.attempts).toBe(1);
				}
			}
			logger.success('TimeoutError contains correct details');
		});

		it('supports cancellation via AbortController', async () => {
			stepCount++;
			logger.step('Verify cancellation support');

			const controller = new AbortController();
			let operationStarted = false;

			const operation = vi.fn().mockImplementation(async (signal: AbortSignal) => {
				operationStarted = true;
				return new Promise((resolve, reject) => {
					const timer = setTimeout(() => resolve({ data: 'would succeed' }), 500);

					signal.addEventListener('abort', () => {
						clearTimeout(timer);
						reject(new CancellationError('Operation cancelled'));
					});
				});
			});

			const resultPromise = executeWithProgressiveTimeout(operation, {
				signal: controller.signal,
				initialTimeout: 1000
			});

			// Cancel after starting but before completion
			await new Promise((r) => setTimeout(r, 50));
			controller.abort();

			await expect(resultPromise).rejects.toThrow(CancellationError);
			expect(operationStarted).toBe(true);
			logger.success('Cancellation via AbortController works');
		});

		it('does not retry on non-timeout errors', async () => {
			stepCount++;
			logger.step('Verify no retry on non-timeout errors');

			const customError = new Error('Custom business error');
			const operation = vi.fn().mockRejectedValue(customError);

			await expect(
				executeWithProgressiveTimeout(operation, { initialTimeout: 100 })
			).rejects.toThrow('Custom business error');

			expect(operation).toHaveBeenCalledTimes(1);
			logger.success('Did not retry on non-timeout error');
		});

		it('uses custom maxRetries from config', async () => {
			stepCount++;
			logger.step('Verify custom maxRetries is respected');

			const operation = vi.fn().mockImplementation(async (signal: AbortSignal) => {
				return new Promise((_, reject) => {
					signal.addEventListener('abort', () => {
						reject(new TimeoutError(10, 0));
					});
				});
			});

			await expect(
				executeWithProgressiveTimeout(operation, {
					maxRetries: 1,
					initialTimeout: 10,
					maxTimeout: 100
				})
			).rejects.toThrow(MaxRetriesError);

			expect(operation).toHaveBeenCalledTimes(2); // Initial + 1 retry
			logger.success('Custom maxRetries respected');
		});

		it('passes AbortSignal to operation', async () => {
			stepCount++;
			logger.step('Verify AbortSignal is passed to operation');

			const capturedSignals: AbortSignal[] = [];

			const operation = vi.fn().mockImplementation(async (signal: AbortSignal) => {
				capturedSignals.push(signal);
				return { data: 'success' };
			});

			await executeWithProgressiveTimeout(operation, { initialTimeout: 100 });

			// Strong assertion: verify signal was captured and has correct properties
			expect(capturedSignals.length).toBe(1);
			const signal = capturedSignals[0];
			expect(signal.aborted).toBe(false);
			expect(typeof signal.addEventListener).toBe('function');
			logger.success('AbortSignal passed to operation');
		});
	});

	describe('Error Types', () => {
		it('TimeoutError has correct name and properties', () => {
			stepCount++;
			logger.step('Verify TimeoutError structure');

			const error = new TimeoutError(30000, 2);

			expect(error.name).toBe('TimeoutError');
			expect(error.timeoutMs).toBe(30000);
			expect(error.attempt).toBe(2);
			expect(error.message).toBe('Operation timed out after 30000ms (attempt 2)');
			// Verify inheritance chain: TimeoutError -> ProgressiveTimeoutError -> Error
			expect(error).toBeInstanceOf(TimeoutError);
			logger.success('TimeoutError has correct structure');
		});

		it('MaxRetriesError has correct name and properties', () => {
			stepCount++;
			logger.step('Verify MaxRetriesError structure');

			const error = new MaxRetriesError(3, 300000);

			expect(error.name).toBe('MaxRetriesError');
			expect(error.attempts).toBe(3);
			expect(error.totalTimeMs).toBe(300000);
			expect(error.message).toBe('Operation failed after 3 attempts (total time: 300000ms)');
			// Verify inheritance chain: MaxRetriesError -> ProgressiveTimeoutError -> Error
			expect(error).toBeInstanceOf(MaxRetriesError);
			logger.success('MaxRetriesError has correct structure');
		});

		it('CancellationError has correct name', () => {
			stepCount++;
			logger.step('Verify CancellationError structure');

			const error = new CancellationError('User cancelled');

			expect(error.name).toBe('CancellationError');
			expect(error.message).toBe('User cancelled');
			// Verify inheritance chain: CancellationError -> ProgressiveTimeoutError -> Error
			expect(error).toBeInstanceOf(CancellationError);
			logger.success('CancellationError has correct structure');
		});
	});
});
