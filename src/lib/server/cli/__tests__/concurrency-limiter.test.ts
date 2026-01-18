import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConcurrencyLimiter } from '../concurrency-limiter';
import type { CLIResult, CLICommandConfig } from '../contracts';

function createMockResult(data: string): CLIResult {
	return {
		success: true,
		data,
		error: null,
		exitCode: 0,
		duration: 10,
		command: 'test'
	};
}

describe('ConcurrencyLimiter', () => {
	let limiter: ConcurrencyLimiter;

	beforeEach(() => {
		limiter = new ConcurrencyLimiter(2);
	});

	it('executes requests immediately when under limit', async () => {
		const executor = vi.fn().mockResolvedValue(createMockResult('ok'));
		const config: CLICommandConfig = { command: 'gt', args: ['status'] };

		const result = await limiter.execute(config, executor);

		expect(executor).toHaveBeenCalledTimes(1);
		expect(result.data).toBe('ok');
	});

	it('queues requests when at limit', async () => {
		const calls: number[] = [];
		const executor = vi.fn().mockImplementation(async () => {
			const callNum = calls.length + 1;
			calls.push(callNum);
			await new Promise((r) => setTimeout(r, 50));
			return createMockResult(`call-${callNum}`);
		});

		const config: CLICommandConfig = { command: 'gt', args: ['status'] };

		const promises = [
			limiter.execute({ ...config, args: ['1'] }, executor),
			limiter.execute({ ...config, args: ['2'] }, executor),
			limiter.execute({ ...config, args: ['3'] }, executor)
		];

		await new Promise((r) => setTimeout(r, 10));
		expect(limiter.getStats().active).toBe(2);
		expect(limiter.getStats().queued).toBe(1);

		await Promise.all(promises);
		expect(executor).toHaveBeenCalledTimes(3);
	});

	it('deduplicates identical requests by default', async () => {
		let resolveFirst: (r: CLIResult) => void;
		const firstPromise = new Promise<CLIResult>((r) => {
			resolveFirst = r;
		});

		const executor = vi.fn().mockReturnValue(firstPromise);
		const config: CLICommandConfig = { command: 'gt', args: ['status'] };

		const p1 = limiter.execute(config, executor);
		const p2 = limiter.execute(config, executor);

		expect(executor).toHaveBeenCalledTimes(1);

		resolveFirst!(createMockResult('deduped'));
		const [r1, r2] = await Promise.all([p1, p2]);

		expect(r1.data).toBe('deduped');
		expect(r2.data).toBe('deduped');
	});

	it('does not dedupe when dedupe: false', async () => {
		const executor = vi.fn().mockResolvedValue(createMockResult('ok'));
		const config: CLICommandConfig = { command: 'gt', args: ['status'], dedupe: false };

		await Promise.all([limiter.execute(config, executor), limiter.execute(config, executor)]);

		expect(executor).toHaveBeenCalledTimes(2);
	});

	it('reports correct stats', async () => {
		const executor = vi.fn().mockImplementation(async () => {
			await new Promise((r) => setTimeout(r, 100));
			return createMockResult('ok');
		});

		const config: CLICommandConfig = { command: 'gt', args: ['status'], dedupe: false };

		limiter.execute(config, executor);
		limiter.execute(config, executor);
		limiter.execute(config, executor);

		await new Promise((r) => setTimeout(r, 10));
		const stats = limiter.getStats();

		expect(stats.active).toBe(2);
		expect(stats.queued).toBe(1);
		expect(stats.maxConcurrency).toBe(2);
	});

	it('clear() rejects pending requests', async () => {
		const executor = vi.fn().mockImplementation(async () => {
			await new Promise((r) => setTimeout(r, 200));
			return createMockResult('ok');
		});

		const config: CLICommandConfig = { command: 'gt', args: ['status'], dedupe: false };

		limiter.execute(config, executor);
		limiter.execute(config, executor);
		const pending = limiter.execute(config, executor);

		await new Promise((r) => setTimeout(r, 10));
		limiter.clear();

		await expect(pending).rejects.toThrow('Queue cleared');
	});
});
