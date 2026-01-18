import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker } from '../circuit-breaker';

describe('CircuitBreaker', () => {
	let breaker: CircuitBreaker;

	beforeEach(() => {
		breaker = new CircuitBreaker(3, 1000);
	});

	it('starts in CLOSED state', () => {
		expect(breaker.getState()).toBe('CLOSED');
		expect(breaker.canExecute()).toBe(true);
	});

	it('stays CLOSED after a few failures', () => {
		breaker.recordFailure();
		breaker.recordFailure();
		expect(breaker.getState()).toBe('CLOSED');
		expect(breaker.canExecute()).toBe(true);
	});

	it('opens after threshold failures', () => {
		breaker.recordFailure();
		breaker.recordFailure();
		breaker.recordFailure();
		expect(breaker.getState()).toBe('OPEN');
		expect(breaker.canExecute()).toBe(false);
	});

	it('resets failure count on success', () => {
		breaker.recordFailure();
		breaker.recordFailure();
		breaker.recordSuccess();
		expect(breaker.getStats().failureCount).toBe(0);
	});

	it('transitions to HALF_OPEN after reset time', async () => {
		breaker = new CircuitBreaker(1, 50);
		breaker.recordFailure();
		expect(breaker.getState()).toBe('OPEN');
		expect(breaker.canExecute()).toBe(false);

		await new Promise((r) => setTimeout(r, 60));

		expect(breaker.canExecute()).toBe(true);
		expect(breaker.getState()).toBe('HALF_OPEN');
	});

	it('returns to OPEN on failure in HALF_OPEN', async () => {
		breaker = new CircuitBreaker(1, 50);
		breaker.recordFailure();
		await new Promise((r) => setTimeout(r, 60));
		breaker.canExecute();
		expect(breaker.getState()).toBe('HALF_OPEN');

		breaker.recordFailure();
		expect(breaker.getState()).toBe('OPEN');
	});

	it('returns to CLOSED after successful HALF_OPEN requests', async () => {
		breaker = new CircuitBreaker(1, 50);
		breaker.recordFailure();
		await new Promise((r) => setTimeout(r, 60));
		breaker.canExecute();

		breaker.recordSuccess();
		breaker.recordSuccess();
		expect(breaker.getState()).toBe('CLOSED');
	});

	it('reset() returns to CLOSED state', () => {
		breaker.recordFailure();
		breaker.recordFailure();
		breaker.recordFailure();
		expect(breaker.getState()).toBe('OPEN');

		breaker.reset();
		expect(breaker.getState()).toBe('CLOSED');
		expect(breaker.getStats().failureCount).toBe(0);
	});
});
