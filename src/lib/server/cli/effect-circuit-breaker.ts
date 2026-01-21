/**
 * Effect.ts Circuit Breaker - Functional circuit breaker implementation
 * Architecture Decision: Replace class-based circuit breaker with Effect patterns
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests fail fast
 * - HALF_OPEN: Testing if service recovered
 *
 * Config (from bead spec):
 * - failureThreshold: 5    - Open after 5 failures
 * - successThreshold: 2    - Close after 2 successes in half-open
 * - halfOpenTimeout: 30000 - Try again after 30s
 */

import { Effect, Ref, pipe } from 'effect';
import { CircuitOpenError, generateRequestId } from './effect-errors';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
	readonly failureThreshold: number;
	readonly successThreshold: number;
	readonly halfOpenTimeout: number;
}

export const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
	failureThreshold: 5,
	successThreshold: 2,
	halfOpenTimeout: 30_000
};

interface CircuitBreakerState {
	state: CircuitState;
	failureCount: number;
	successCount: number;
	lastFailureTime: number;
}

const initialState: CircuitBreakerState = {
	state: 'CLOSED',
	failureCount: 0,
	successCount: 0,
	lastFailureTime: 0
};

export interface EffectCircuitBreaker {
	readonly execute: <A, E, R>(
		effect: Effect.Effect<A, E, R>,
		commandName: string
	) => Effect.Effect<A, E | CircuitOpenError, R>;
	readonly recordSuccess: Effect.Effect<void>;
	readonly recordFailure: Effect.Effect<void>;
	readonly getState: Effect.Effect<CircuitBreakerState>;
	readonly reset: Effect.Effect<void>;
	readonly canExecute: Effect.Effect<boolean>;
}

/**
 * Create a new Effect-based circuit breaker
 */
export function makeCircuitBreaker(
	config: CircuitBreakerConfig = DEFAULT_CIRCUIT_CONFIG
): Effect.Effect<EffectCircuitBreaker> {
	return pipe(
		Ref.make(initialState),
		Effect.map((stateRef): EffectCircuitBreaker => {
			// canExecute checks and transitions to HALF_OPEN if timeout elapsed
			const canExecute: Effect.Effect<boolean> = pipe(
				Ref.updateAndGet(stateRef, (s) => {
					if (s.state === 'CLOSED') {
						return s;
					}

					if (s.state === 'OPEN') {
						const timeSinceFailure = Date.now() - s.lastFailureTime;
						if (timeSinceFailure >= config.halfOpenTimeout) {
							// Transition to HALF_OPEN
							return { ...s, state: 'HALF_OPEN' as const, successCount: 0 };
						}
					}

					return s;
				}),
				Effect.map((s) => s.state !== 'OPEN')
			);

			const recordSuccess: Effect.Effect<void> = Ref.update(stateRef, (s) => {
				if (s.state === 'HALF_OPEN') {
					const newSuccessCount = s.successCount + 1;
					if (newSuccessCount >= config.successThreshold) {
						return { ...initialState };
					}
					return { ...s, successCount: newSuccessCount };
				}
				if (s.state === 'CLOSED') {
					return { ...s, failureCount: 0 };
				}
				return s;
			});

			const recordFailure: Effect.Effect<void> = Ref.update(stateRef, (s) => {
				const newFailureCount = s.failureCount + 1;
				const lastFailureTime = Date.now();

				if (s.state === 'HALF_OPEN') {
					return {
						...s,
						state: 'OPEN' as const,
						failureCount: newFailureCount,
						lastFailureTime
					};
				}

				if (newFailureCount >= config.failureThreshold) {
					return {
						...s,
						state: 'OPEN' as const,
						failureCount: newFailureCount,
						lastFailureTime
					};
				}

				return { ...s, failureCount: newFailureCount, lastFailureTime };
			});

			const getState = Ref.get(stateRef);

			const reset = Ref.set(stateRef, initialState);

			const execute = <A, E, R>(
				effect: Effect.Effect<A, E, R>,
				commandName: string
			): Effect.Effect<A, E | CircuitOpenError, R> => {
				const failWithCircuitOpen = Effect.flatMap(getState, (s) =>
					Effect.fail(
						new CircuitOpenError({
							command: commandName,
							openSince: new Date(s.lastFailureTime),
							requestId: generateRequestId()
						})
					)
				);

				const executeEffect = pipe(
					effect,
					Effect.tap(() => recordSuccess),
					Effect.tapError(() => recordFailure)
				);

				return Effect.flatMap(canExecute, (allowed): Effect.Effect<A, E | CircuitOpenError, R> =>
					allowed ? executeEffect : failWithCircuitOpen
				);
			};

			return {
				execute,
				recordSuccess,
				recordFailure,
				getState,
				reset,
				canExecute
			};
		})
	);
}

/**
 * Create a circuit breaker and return it synchronously (for testing/simple use)
 * Note: This runs the Effect synchronously
 */
export function createCircuitBreakerSync(
	config: CircuitBreakerConfig = DEFAULT_CIRCUIT_CONFIG
): EffectCircuitBreaker {
	return Effect.runSync(makeCircuitBreaker(config));
}
