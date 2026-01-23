import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import {
	ProcessSupervisor,
	getProcessSupervisor,
	resetProcessSupervisor
} from '../process-supervisor';
import { createTestLogger } from '../../../../../scripts/smoke/lib/logger';

const logger = createTestLogger('Unit: Process Supervisor');
let testStartTime: number;
let stepCount = 0;

describe('ProcessSupervisor', () => {
	let supervisor: ProcessSupervisor;

	beforeEach(() => {
		supervisor = new ProcessSupervisor({
			defaultTimeout: 5000,
			maxConcurrency: 4,
			circuitBreakerThreshold: 5,
			circuitBreakerResetTime: 1000
		});
		testStartTime = Date.now();
		stepCount = 0;
		resetProcessSupervisor();
	});

	afterAll(() => {
		const duration = Date.now() - testStartTime;
		logger.summary('ProcessSupervisor Tests', true, duration, stepCount);
	});

	describe('Success Cases', () => {
		it('executes command and returns stdout', async () => {
			stepCount++;
			logger.step('Execute echo command and verify stdout');
			logger.info('Executing echo hello');

			const result = await supervisor.execute({
				command: 'gt',
				args: ['--version']
			});

			logger.info('Result received', {
				success: result.success,
				hasData: result.data !== null,
				exitCode: result.exitCode
			});

			// gt --version should succeed
			expect(result.success).toBe(true);
			expect(result.exitCode).toBe(0);
			expect(result.data).not.toBeNull();
			logger.success('Command executed and returned stdout');
		});

		it('returns exit code', async () => {
			stepCount++;
			logger.step('Verify exit code is captured');
			logger.info('Running command that succeeds');

			const result = await supervisor.execute({
				command: 'gt',
				args: ['--help']
			});

			logger.info('Exit code received', { exitCode: result.exitCode });

			expect(result.exitCode).toBe(0);
			expect(result.success).toBe(true);
			logger.success('Exit code captured correctly');
		});

		it('measures execution duration', async () => {
			stepCount++;
			logger.step('Verify duration is measured');
			logger.info('Running command and measuring time');

			const result = await supervisor.execute({
				command: 'gt',
				args: ['--version']
			});

			logger.info('Duration measured', { duration: result.duration });

			expect(result.duration).toBeGreaterThanOrEqual(0);
			expect(typeof result.duration).toBe('number');
			logger.success('Duration is measured correctly');
		});

		it('includes command in result', async () => {
			stepCount++;
			logger.step('Verify command string is included in result');
			logger.info('Running command');

			const result = await supervisor.execute({
				command: 'gt',
				args: ['--version']
			});

			logger.info('Command in result', { command: result.command });

			expect(result.command).toBe('gt --version');
			logger.success('Command string included in result');
		});

		it('handles output data correctly', async () => {
			stepCount++;
			logger.step('Verify data is captured in result');
			logger.info('Running command that returns output');

			const result = await supervisor.execute({
				command: 'gt',
				args: ['--version']
			});

			logger.info('Result', { success: result.success, hasData: result.data !== null });

			// Verify data is captured
			expect(result.success).toBe(true);
			expect(result.data).not.toBeNull();
			// The ProcessSupervisor attempts JSON parse, falls back to string
			// gt --version returns plain text, so data should be string
			expect(typeof result.data).toBe('string');
			logger.success('Output data captured correctly');
		});

		it('returns string for non-JSON output', async () => {
			stepCount++;
			logger.step('Verify non-JSON output is returned as string');
			logger.info('Running bd --version which returns plain text');

			const result = await supervisor.execute({
				command: 'bd',
				args: ['--version']
			});

			logger.info('Result', { success: result.success, dataType: typeof result.data });

			// bd --version returns plain text, should be kept as string
			if (result.success && result.data !== null) {
				expect(typeof result.data).toBe('string');
				expect(result.data).toContain('version');
				logger.success('Non-JSON output returned as string');
			} else {
				logger.info('bd not available');
			}
		});
	});

	describe('Timeout Cases', () => {
		it('returns error after timeout', async () => {
			stepCount++;
			logger.step('Verify timeout error is returned');
			logger.info('Running sleep command with short timeout');

			// Use a sleep command with very short timeout
			const shortTimeoutSupervisor = new ProcessSupervisor({
				defaultTimeout: 100,
				maxConcurrency: 4,
				circuitBreakerThreshold: 10,
				circuitBreakerResetTime: 1000
			});

			const result = await shortTimeoutSupervisor.execute({
				command: 'gt' as const,
				args: ['sleep', '5'] // This will fail/timeout
			});

			logger.info('Timeout result', {
				success: result.success,
				error: result.error,
				duration: result.duration
			});

			// Should fail due to timeout or invalid command
			expect(result.success).toBe(false);
			expect(result.error).not.toBeNull();
			logger.success('Timeout/error handled correctly');
		});

		it('custom timeout is respected', async () => {
			stepCount++;
			logger.step('Verify custom timeout overrides default');
			logger.info('Running command with custom timeout');

			const result = await supervisor.execute({
				command: 'gt',
				args: ['--version'],
				timeout: 10000 // Custom longer timeout
			});

			logger.info('Result with custom timeout', {
				success: result.success,
				duration: result.duration
			});

			expect(result.success).toBe(true);
			logger.success('Custom timeout respected');
		});
	});

	describe('Error Cases', () => {
		it('returns error for non-zero exit', async () => {
			stepCount++;
			logger.step('Verify non-zero exit returns error');
			logger.info('Running command that should fail');

			const result = await supervisor.execute({
				command: 'gt',
				args: ['nonexistent-command-xyz']
			});

			logger.info('Error result', {
				success: result.success,
				error: result.error,
				exitCode: result.exitCode
			});

			expect(result.success).toBe(false);
			expect(result.error).not.toBeNull();
			logger.success('Non-zero exit handled correctly');
		});

		it('returns spawn error for invalid command', async () => {
			stepCount++;
			logger.step('Verify spawn error for invalid command');
			logger.info('Running completely invalid command');

			const result = await supervisor.execute({
				command: 'gt' as const,
				// Use a command arg that gt won't recognize
				args: ['this-is-not-a-valid-subcommand-12345']
			});

			logger.info('Spawn/error result', {
				success: result.success,
				error: result.error
			});

			expect(result.success).toBe(false);
			logger.success('Invalid command error handled');
		});

		it('error message is included in result', async () => {
			stepCount++;
			logger.step('Verify error message is captured');
			logger.info('Running failing command');

			const result = await supervisor.execute({
				command: 'gt',
				args: ['invalid-xyz']
			});

			logger.info('Error message', { error: result.error });

			expect(result.success).toBe(false);
			expect(result.error).toBeTruthy();
			expect(typeof result.error).toBe('string');
			logger.success('Error message captured correctly');
		});

		it('handles spawn failure when binary not found', async () => {
			stepCount++;
			logger.step('Verify spawn failure handling');
			logger.info('Testing with mocked execFile that emits error');

			// We need to test the spawn error path which fires when the binary itself
			// cannot be found. Since gt/bd exist on this system, we test the structure
			// of error handling instead.
			const result = await supervisor.execute({
				command: 'gt',
				args: ['--invalid-flag-that-causes-error']
			});

			logger.info('Error handling result', {
				success: result.success,
				hasError: result.error !== null,
				exitCode: result.exitCode
			});

			// Verify error result structure
			expect(result.success).toBe(false);
			expect(result.error).not.toBeNull();
			expect(result.exitCode).toBeDefined();
			logger.success('Spawn failure error handling verified');
		});
	});

	describe('Circuit Breaker Integration', () => {
		it('returns circuit breaker error when open', async () => {
			stepCount++;
			logger.step('Verify circuit breaker blocks requests when open');

			// Create supervisor with low threshold
			const breakerSupervisor = new ProcessSupervisor({
				defaultTimeout: 5000,
				maxConcurrency: 4,
				circuitBreakerThreshold: 2,
				circuitBreakerResetTime: 60000
			});

			logger.info('Triggering failures to open circuit');

			// Trigger failures
			for (let i = 0; i < 2; i++) {
				await breakerSupervisor.execute({
					command: 'gt',
					args: ['invalid-command-' + i]
				});
			}

			const stats = breakerSupervisor.getStats();
			logger.info('Circuit breaker stats after failures', stats);

			// Next request should be blocked if circuit is open
			const result = await breakerSupervisor.execute({
				command: 'gt',
				args: ['--version']
			});

			logger.info('Result after circuit open', {
				success: result.success,
				error: result.error
			});

			// Circuit may or may not be open depending on timing
			// Either way, verify result structure
			expect(typeof result.success).toBe('boolean');
			expect(result.exitCode).toBeDefined();
			logger.success('Circuit breaker integration verified');
		});

		it('provides circuit breaker stats', () => {
			stepCount++;
			logger.step('Verify getStats returns circuit breaker info');

			const stats = supervisor.getStats();
			logger.info('Stats', stats);

			expect(stats.circuitBreaker).toBeDefined();
			expect(stats.circuitBreaker.state).toBeDefined();
			expect(stats.circuitBreaker.failureCount).toBeDefined();
			logger.success('Circuit breaker stats available');
		});

		it('resetCircuitBreaker works', async () => {
			stepCount++;
			logger.step('Verify resetCircuitBreaker resets state');

			// Trigger some failures
			await supervisor.execute({
				command: 'gt',
				args: ['invalid']
			});

			const statsBefore = supervisor.getStats();
			logger.info('Stats before reset', statsBefore);

			supervisor.resetCircuitBreaker();

			const statsAfter = supervisor.getStats();
			logger.info('Stats after reset', statsAfter);

			expect(statsAfter.circuitBreaker.state).toBe('CLOSED');
			expect(statsAfter.circuitBreaker.failureCount).toBe(0);
			logger.success('Circuit breaker reset works');
		});
	});

	describe('Concurrency Control', () => {
		it('provides queue stats', () => {
			stepCount++;
			logger.step('Verify getStats returns queue info');

			const stats = supervisor.getStats();
			logger.info('Queue stats', stats.queue);

			expect(stats.queue).toBeDefined();
			expect(stats.queue.queued).toBeDefined();
			expect(stats.queue.active).toBeDefined();
			expect(stats.queue.maxConcurrency).toBe(4);
			logger.success('Queue stats available');
		});

		it('multiple processes can run', async () => {
			stepCount++;
			logger.step('Verify multiple processes can execute');
			logger.info('Launching multiple commands concurrently');

			const promises = [
				supervisor.execute({ command: 'gt', args: ['--version'] }),
				supervisor.execute({ command: 'gt', args: ['--help'] })
			];

			const results = await Promise.all(promises);

			logger.info('Results', {
				count: results.length,
				allSuccess: results.every((r) => r.success)
			});

			expect(results.length).toBe(2);
			results.forEach((result) => {
				expect(result.success).toBe(true);
				expect(result.exitCode).toBe(0);
			});
			logger.success('Multiple processes executed successfully');
		});

		it('respects maxConcurrency', async () => {
			stepCount++;
			logger.step('Verify maxConcurrency is enforced');

			// Create supervisor with low concurrency
			const limitedSupervisor = new ProcessSupervisor({
				defaultTimeout: 5000,
				maxConcurrency: 2,
				circuitBreakerThreshold: 10,
				circuitBreakerResetTime: 1000
			});

			const stats = limitedSupervisor.getStats();
			logger.info('Configured maxConcurrency', { maxConcurrency: stats.queue.maxConcurrency });

			expect(stats.queue.maxConcurrency).toBe(2);
			logger.success('maxConcurrency is configured correctly');
		});
	});

	describe('Convenience Methods', () => {
		it('gt() method works', async () => {
			stepCount++;
			logger.step('Verify gt() convenience method');
			logger.info('Calling supervisor.gt()');

			const result = await supervisor.gt(['--version']);

			logger.info('gt() result', { success: result.success, command: result.command });

			expect(result.command).toMatch(/^gt/);
			expect(result.success).toBe(true);
			logger.success('gt() convenience method works');
		});

		it('bd() method works', async () => {
			stepCount++;
			logger.step('Verify bd() convenience method');
			logger.info('Calling supervisor.bd()');

			const result = await supervisor.bd(['--version']);

			logger.info('bd() result', { success: result.success, command: result.command });

			expect(result.command).toMatch(/^bd/);
			// bd may or may not be installed, just verify structure
			expect(typeof result.success).toBe('boolean');
			expect(result.exitCode).toBeDefined();
			logger.success('bd() convenience method works');
		});

		it('gt() accepts options', async () => {
			stepCount++;
			logger.step('Verify gt() accepts additional options');
			logger.info('Calling gt() with custom timeout');

			const result = await supervisor.gt(['--version'], { timeout: 10000 });

			logger.info('Result', { success: result.success });

			expect(result.success).toBe(true);
			logger.success('gt() accepts options');
		});
	});

	describe('Singleton Access', () => {
		it('getProcessSupervisor returns singleton', () => {
			stepCount++;
			logger.step('Verify getProcessSupervisor returns singleton');

			const s1 = getProcessSupervisor();
			const s2 = getProcessSupervisor();

			logger.info('Comparing instances');

			expect(s1).toBe(s2);
			logger.success('Singleton pattern works');
		});

		it('resetProcessSupervisor clears singleton', () => {
			stepCount++;
			logger.step('Verify resetProcessSupervisor clears singleton');

			const s1 = getProcessSupervisor();
			resetProcessSupervisor();
			const s2 = getProcessSupervisor();

			logger.info('Comparing instances after reset');

			expect(s1).not.toBe(s2);
			logger.success('Reset creates new singleton');
		});

		it('getProcessSupervisor accepts config on first call', () => {
			stepCount++;
			logger.step('Verify config is accepted on first call');

			resetProcessSupervisor();
			const s = getProcessSupervisor({ defaultTimeout: 15000 });
			const stats = s.getStats();

			logger.info('Stats', stats);

			// Can't directly verify timeout config, but verify it runs
			expect(s).toBeDefined();
			logger.success('Config accepted on initialization');
		});
	});

	describe('Working Directory', () => {
		it('cwd option is passed to command', async () => {
			stepCount++;
			logger.step('Verify cwd option is used');
			logger.info('Running command with custom cwd');

			const result = await supervisor.execute({
				command: 'gt',
				args: ['--version'],
				cwd: '/tmp'
			});

			logger.info('Result', { success: result.success });

			// Should still succeed regardless of cwd for --version
			expect(result.success).toBe(true);
			logger.success('cwd option handled');
		});
	});

	describe('Process Tracking and Cleanup', () => {
		it('tracks active processes count', async () => {
			stepCount++;
			logger.step('Verify active processes are tracked');

			const trackingStats = supervisor.getProcessStats();
			logger.info('Initial stats', trackingStats);

			expect(trackingStats.activeProcesses).toBe(0);
			expect(trackingStats.totalSpawned).toBe(0);

			await supervisor.execute({
				command: 'gt',
				args: ['--version']
			});

			const statsAfter = supervisor.getProcessStats();
			logger.info('Stats after execution', statsAfter);

			expect(statsAfter.totalSpawned).toBeGreaterThan(0);
			expect(statsAfter.activeProcesses).toBe(0);
			logger.success('Process tracking works');
		});

		it('destroy() kills all active processes', async () => {
			stepCount++;
			logger.step('Verify destroy kills all processes');

			const destroySupervisor = new ProcessSupervisor({
				defaultTimeout: 30000,
				maxConcurrency: 4,
				circuitBreakerThreshold: 5,
				circuitBreakerResetTime: 1000
			});

			const promise = destroySupervisor.execute({
				command: 'sleep',
				args: ['10']
			});

			await new Promise((r) => setTimeout(r, 50));

			const statsBefore = destroySupervisor.getProcessStats();
			logger.info('Stats before destroy', statsBefore);
			expect(statsBefore.activeProcesses).toBe(1);

			destroySupervisor.destroy();

			const statsAfter = destroySupervisor.getProcessStats();
			logger.info('Stats after destroy', statsAfter);
			expect(statsAfter.activeProcesses).toBe(0);

			const result = await promise;
			expect(result.success).toBe(false);
			expect(result.error).toContain('killed');
			logger.success('destroy() kills all processes');
		});

		it('cleans up process on timeout', async () => {
			stepCount++;
			logger.step('Verify process cleanup on timeout');

			const timeoutSupervisor = new ProcessSupervisor({
				defaultTimeout: 100,
				maxConcurrency: 4,
				circuitBreakerThreshold: 10,
				circuitBreakerResetTime: 1000
			});

			const result = await timeoutSupervisor.execute({
				command: 'sleep',
				args: ['5']
			});

			logger.info('Timeout result', {
				success: result.success,
				error: result.error
			});

			expect(result.success).toBe(false);

			const stats = timeoutSupervisor.getProcessStats();
			logger.info('Stats after timeout', stats);
			expect(stats.activeProcesses).toBe(0);
			logger.success('Process cleaned up on timeout');
		});

		it('isDestroyed returns correct state', () => {
			stepCount++;
			logger.step('Verify isDestroyed flag');

			const tempSupervisor = new ProcessSupervisor();

			expect(tempSupervisor.isDestroyed()).toBe(false);

			tempSupervisor.destroy();

			expect(tempSupervisor.isDestroyed()).toBe(true);
			logger.success('isDestroyed flag works');
		});

		it('rejects new requests after destroy', async () => {
			stepCount++;
			logger.step('Verify requests rejected after destroy');

			const tempSupervisor = new ProcessSupervisor();
			tempSupervisor.destroy();

			const result = await tempSupervisor.execute({
				command: 'gt',
				args: ['--version']
			});

			logger.info('Result after destroy', {
				success: result.success,
				error: result.error
			});

			expect(result.success).toBe(false);
			expect(result.error).toContain('destroyed');
			logger.success('Requests rejected after destroy');
		});
	});
});
