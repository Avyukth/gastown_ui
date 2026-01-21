import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
	checkRateLimit,
	getClientId,
	resetClientRateLimit,
	clearAllRateLimits,
	getRateLimitStats,
	cleanupExpiredEntries
} from '../rate-limit';
import { createTestLogger } from '../../../../scripts/smoke/lib/logger';

const logger = createTestLogger('Unit: Rate Limit');
let testStartTime: number;
let stepCount = 0;

describe('RateLimit', () => {
	beforeEach(() => {
		clearAllRateLimits();
		testStartTime = Date.now();
		stepCount = 0;
	});

	afterAll(() => {
		const duration = Date.now() - testStartTime;
		logger.summary('RateLimit Tests', true, duration, stepCount);
	});

	describe('checkRateLimit', () => {
		it('allows requests within limit', () => {
			stepCount++;
			logger.step('Verify requests allowed within limit');

			const clientId = 'test-client-1';
			const path = '/api/gastown/status';
			const method = 'GET';

			logger.info('Testing rate limit', { clientId, path, method });

			// First request should be allowed
			const result1 = checkRateLimit(clientId, path, method);
			logger.info('First request result', result1);

			expect(result1.allowed).toBe(true);
			expect(result1.remaining).toBeDefined();
			expect(result1.remaining).toBeGreaterThanOrEqual(0);

			logger.success('Request within limit is allowed');
		});

		it('blocks requests exceeding limit', () => {
			stepCount++;
			logger.step('Verify requests blocked when exceeding limit');

			const clientId = 'test-client-2';
			const path = '/api/gastown/status';
			const method = 'GET';

			logger.info('Exceeding rate limit for GET:/api/gastown/status (limit: 10/1000ms)');

			// Exhaust the limit (status endpoint has 10 requests/1000ms)
			for (let i = 0; i < 10; i++) {
				const result = checkRateLimit(clientId, path, method);
				logger.info(`Request ${i + 1}/10`, { allowed: result.allowed, remaining: result.remaining });
				expect(result.allowed).toBe(true);
			}

			// 11th request should be blocked
			const blocked = checkRateLimit(clientId, path, method);
			logger.info('11th request (should be blocked)', blocked);

			expect(blocked.allowed).toBe(false);
			expect(blocked.retryAfter).toBeDefined();
			expect(blocked.retryAfter).toBeGreaterThan(0);
			expect(blocked.remaining).toBe(0);

			logger.success('Requests exceeding limit are blocked with retryAfter');
		});

		it('uses different limits for different endpoints', () => {
			stepCount++;
			logger.step('Verify per-endpoint rate limits');

			const clientId = 'test-client-3';

			// Status endpoint: 10 requests
			logger.info('Testing status endpoint (limit: 10)');
			for (let i = 0; i < 10; i++) {
				const result = checkRateLimit(clientId, '/api/gastown/status', 'GET');
				expect(result.allowed).toBe(true);
			}
			const statusBlocked = checkRateLimit(clientId, '/api/gastown/status', 'GET');
			expect(statusBlocked.allowed).toBe(false);
			logger.info('Status endpoint blocked after 10 requests');

			// General gastown endpoint: 20 requests (wildcard match)
			logger.info('Testing general gastown endpoint (limit: 20)');
			for (let i = 0; i < 20; i++) {
				const result = checkRateLimit(clientId, '/api/gastown/agents', 'GET');
				expect(result.allowed).toBe(true);
			}
			const agentsBlocked = checkRateLimit(clientId, '/api/gastown/agents', 'GET');
			expect(agentsBlocked.allowed).toBe(false);
			logger.info('General gastown endpoint blocked after 20 requests');

			logger.success('Different endpoints have independent rate limits');
		});

		it('tracks different clients independently', () => {
			stepCount++;
			logger.step('Verify independent client tracking');

			const path = '/api/gastown/status';
			const method = 'GET';

			logger.info('Exhausting limit for client-a');
			// Exhaust limit for client-a
			for (let i = 0; i < 10; i++) {
				checkRateLimit('client-a', path, method);
			}
			const clientABlocked = checkRateLimit('client-a', path, method);
			expect(clientABlocked.allowed).toBe(false);

			logger.info('Checking client-b is still allowed');
			// client-b should still be allowed
			const clientBResult = checkRateLimit('client-b', path, method);
			expect(clientBResult.allowed).toBe(true);
			logger.info('Client-b result', clientBResult);

			logger.success('Clients tracked independently');
		});

		it('resets after window expires', async () => {
			stepCount++;
			logger.step('Verify rate limit reset after window expires');

			const clientId = 'test-client-4';
			// Use default endpoint with 1000ms window for testing
			const path = '/api/other/endpoint';
			const method = 'GET';

			logger.info('Exhausting limit (50 requests in 1000ms window)');
			// Exhaust the default limit (50 requests/1000ms)
			for (let i = 0; i < 50; i++) {
				checkRateLimit(clientId, path, method);
			}

			const blocked = checkRateLimit(clientId, path, method);
			expect(blocked.allowed).toBe(false);
			logger.info('Request blocked', { retryAfter: blocked.retryAfter });

			// Wait for window to reset (slightly more than 1 second)
			logger.info('Waiting for window reset (1100ms)...');
			await new Promise((r) => setTimeout(r, 1100));

			const afterReset = checkRateLimit(clientId, path, method);
			logger.info('After window reset', afterReset);

			expect(afterReset.allowed).toBe(true);
			logger.success('Rate limit resets after window expires');
		});

		it('matches wildcard patterns correctly', () => {
			stepCount++;
			logger.step('Verify wildcard pattern matching');

			const clientId = 'test-client-5';

			// POST:/api/gastown/work/* should match work/issues, work/convoys, etc.
			logger.info('Testing POST:/api/gastown/work/* wildcard (limit: 10/10000ms)');

			const paths = ['/api/gastown/work/issues', '/api/gastown/work/convoys'];

			for (const path of paths) {
				const result = checkRateLimit(clientId, path, 'POST');
				logger.info(`Testing ${path}`, { allowed: result.allowed });
				expect(result.allowed).toBe(true);
			}

			// But POST:/api/gastown/work/sling has its own specific limit (5/5000ms)
			logger.info('Testing POST:/api/gastown/work/sling (specific limit: 5/5000ms)');
			for (let i = 0; i < 5; i++) {
				const result = checkRateLimit(clientId, '/api/gastown/work/sling', 'POST');
				expect(result.allowed).toBe(true);
			}
			const slingBlocked = checkRateLimit(clientId, '/api/gastown/work/sling', 'POST');
			expect(slingBlocked.allowed).toBe(false);
			logger.info('Sling endpoint blocked after 5 requests');

			logger.success('Wildcard patterns match correctly with specific overrides');
		});
	});

	describe('getClientId', () => {
		it('extracts IP from X-Forwarded-For header', () => {
			stepCount++;
			logger.step('Verify X-Forwarded-For extraction');

			const request = new Request('http://localhost/test', {
				headers: {
					'x-forwarded-for': '192.168.1.1, 10.0.0.1'
				}
			});

			const clientId = getClientId(request);
			logger.info('Extracted client ID', { clientId });

			expect(clientId).toBe('192.168.1.1');
			logger.success('X-Forwarded-For first IP extracted correctly');
		});

		it('uses X-Real-IP as fallback', () => {
			stepCount++;
			logger.step('Verify X-Real-IP fallback');

			const request = new Request('http://localhost/test', {
				headers: {
					'x-real-ip': '10.0.0.5'
				}
			});

			const clientId = getClientId(request);
			logger.info('Extracted client ID', { clientId });

			expect(clientId).toBe('10.0.0.5');
			logger.success('X-Real-IP fallback works correctly');
		});

		it('returns unknown-client when no headers present', () => {
			stepCount++;
			logger.step('Verify fallback when no headers');

			const request = new Request('http://localhost/test');

			const clientId = getClientId(request);
			logger.info('Extracted client ID', { clientId });

			expect(clientId).toBe('unknown-client');
			logger.success('Fallback to unknown-client works');
		});
	});

	describe('resetClientRateLimit', () => {
		it('resets rate limit for specific client', () => {
			stepCount++;
			logger.step('Verify client-specific rate limit reset');

			const clientId = 'test-client-reset';
			const path = '/api/gastown/status';
			const method = 'GET';

			// Exhaust limit
			logger.info('Exhausting limit for client');
			for (let i = 0; i < 10; i++) {
				checkRateLimit(clientId, path, method);
			}
			expect(checkRateLimit(clientId, path, method).allowed).toBe(false);

			// Reset
			logger.info('Resetting client rate limit');
			resetClientRateLimit(clientId);

			// Should be allowed again
			const afterReset = checkRateLimit(clientId, path, method);
			logger.info('After reset', afterReset);

			expect(afterReset.allowed).toBe(true);
			logger.success('Client-specific reset works');
		});
	});

	describe('getRateLimitStats', () => {
		it('returns stats for tracked client', () => {
			stepCount++;
			logger.step('Verify rate limit stats retrieval');

			const clientId = 'test-client-stats';
			const path = '/api/gastown/status';
			const method = 'GET';

			// Make some requests
			checkRateLimit(clientId, path, method);
			checkRateLimit(clientId, path, method);
			checkRateLimit(clientId, path, method);

			const stats = getRateLimitStats(clientId);
			logger.info('Stats', { hasStats: !!stats, size: stats?.size });

			expect(stats).toBeDefined();
			expect(stats?.size).toBeGreaterThan(0);

			const key = `${method}:${path}`;
			const endpointStats = stats?.get(key);
			logger.info('Endpoint stats', endpointStats);

			expect(endpointStats?.count).toBe(3);
			expect(endpointStats?.resetAt).toBeGreaterThan(Date.now());

			logger.success('Stats retrieval works correctly');
		});

		it('returns undefined for unknown client', () => {
			stepCount++;
			logger.step('Verify undefined for unknown client');

			const stats = getRateLimitStats('nonexistent-client');
			logger.info('Stats for unknown client', { stats });

			expect(stats).toBeUndefined();
			logger.success('Returns undefined for unknown client');
		});
	});

	describe('cleanupExpiredEntries', () => {
		it('removes expired entries', async () => {
			stepCount++;
			logger.step('Verify expired entry cleanup');

			const clientId = 'test-client-cleanup';
			const path = '/api/other/endpoint';
			const method = 'GET';

			// Make a request
			checkRateLimit(clientId, path, method);

			const statsBefore = getRateLimitStats(clientId);
			logger.info('Stats before wait', { size: statsBefore?.size });
			expect(statsBefore?.size).toBe(1);

			// Wait for window to expire
			logger.info('Waiting for window to expire (1100ms)...');
			await new Promise((r) => setTimeout(r, 1100));

			// Cleanup
			const cleaned = cleanupExpiredEntries();
			logger.info('Cleanup result', { cleaned });

			expect(cleaned).toBeGreaterThan(0);

			// Stats should be cleared
			const statsAfter = getRateLimitStats(clientId);
			logger.info('Stats after cleanup', { stats: statsAfter });

			// Client map should be removed if empty
			expect(statsAfter).toBeUndefined();
			logger.success('Expired entries cleaned up correctly');
		});
	});

	describe('Edge Cases', () => {
		it('handles concurrent requests correctly', () => {
			stepCount++;
			logger.step('Verify concurrent request handling');

			const clientId = 'test-concurrent';
			const path = '/api/gastown/status';
			const method = 'GET';

			logger.info('Simulating 15 concurrent requests (limit: 10)');

			// Simulate rapid concurrent requests
			const results = Array.from({ length: 15 }, () => checkRateLimit(clientId, path, method));

			const allowed = results.filter((r) => r.allowed).length;
			const blocked = results.filter((r) => !r.allowed).length;

			logger.info('Results', { allowed, blocked });

			expect(allowed).toBe(10);
			expect(blocked).toBe(5);
			logger.success('Concurrent requests handled correctly');
		});

		it('handles empty path', () => {
			stepCount++;
			logger.step('Verify handling of empty path');

			const result = checkRateLimit('test-client', '', 'GET');
			logger.info('Result for empty path', result);

			// Should use default limit
			expect(result.allowed).toBe(true);
			logger.success('Empty path uses default limit');
		});

		it('handles unusual methods', () => {
			stepCount++;
			logger.step('Verify handling of unusual HTTP methods');

			const clientId = 'test-methods';
			const path = '/api/test';

			const methods = ['OPTIONS', 'PATCH', 'HEAD', 'DELETE'];

			for (const method of methods) {
				const result = checkRateLimit(clientId, path, method);
				logger.info(`${method} request`, { allowed: result.allowed });
				expect(result.allowed).toBe(true);
			}

			logger.success('Unusual HTTP methods handled correctly');
		});
	});
});
