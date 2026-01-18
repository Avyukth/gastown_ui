/**
 * Circuit Breaker - Trips on repeated CLI failures
 * Architecture Decision: D0.5 - Process Supervisor Pattern
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests fail fast
 * - HALF_OPEN: Testing if service recovered
 */

import { DEFAULT_CONFIG } from './contracts';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
	private state: CircuitState = 'CLOSED';
	private failureCount = 0;
	private lastFailureTime = 0;
	private successCount = 0;
	private readonly threshold: number;
	private readonly resetTime: number;
	private readonly halfOpenSuccessThreshold = 2;

	constructor(
		threshold: number = DEFAULT_CONFIG.circuitBreakerThreshold,
		resetTime: number = DEFAULT_CONFIG.circuitBreakerResetTime
	) {
		this.threshold = threshold;
		this.resetTime = resetTime;
	}

	canExecute(): boolean {
		if (this.state === 'CLOSED') {
			return true;
		}

		if (this.state === 'OPEN') {
			const timeSinceFailure = Date.now() - this.lastFailureTime;
			if (timeSinceFailure >= this.resetTime) {
				this.state = 'HALF_OPEN';
				this.successCount = 0;
				return true;
			}
			return false;
		}

		return true;
	}

	recordSuccess(): void {
		if (this.state === 'HALF_OPEN') {
			this.successCount++;
			if (this.successCount >= this.halfOpenSuccessThreshold) {
				this.reset();
			}
		} else if (this.state === 'CLOSED') {
			this.failureCount = 0;
		}
	}

	recordFailure(): void {
		this.failureCount++;
		this.lastFailureTime = Date.now();

		if (this.state === 'HALF_OPEN') {
			this.state = 'OPEN';
			return;
		}

		if (this.failureCount >= this.threshold) {
			this.state = 'OPEN';
		}
	}

	reset(): void {
		this.state = 'CLOSED';
		this.failureCount = 0;
		this.successCount = 0;
		this.lastFailureTime = 0;
	}

	getState(): CircuitState {
		return this.state;
	}

	getStats(): {
		state: CircuitState;
		failureCount: number;
		successCount: number;
		lastFailureTime: number;
	} {
		return {
			state: this.state,
			failureCount: this.failureCount,
			successCount: this.successCount,
			lastFailureTime: this.lastFailureTime
		};
	}
}
