/**
 * Integration Tests: /api/gastown/health
 *
 * Tests the health endpoint against the real CLI (gt doctor).
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { get } from '../setup';

// Schema for health check
const HealthCheckSchema = z.object({
	name: z.string(),
	status: z.enum(['pass', 'warn', 'fail']),
	message: z.string(),
	category: z.string()
});

const HealthResponseSchema = z.object({
	status: z.enum(['healthy', 'degraded', 'unhealthy']),
	checks: z.array(HealthCheckSchema),
	timestamp: z.string(),
	summary: z.object({
		total: z.number(),
		pass: z.number(),
		warn: z.number(),
		fail: z.number()
	}),
	requestId: z.string().uuid()
});

describe('GET /api/gastown/health', () => {
	it('returns a valid response with requestId', async () => {
		const { response, body } = await get('/api/gastown/health');

		// Health endpoint returns 200 (healthy/degraded) or 503 (unhealthy)
		expect([200, 503]).toContain(response.status);
		expect(body).toHaveProperty('requestId');
		expect(body).toHaveProperty('timestamp');
	});

	it('returns overall status', async () => {
		const { body } = await get('/api/gastown/health');

		expect(body).toHaveProperty('status');
		expect(['healthy', 'degraded', 'unhealthy']).toContain(body.status);
	});

	it('returns checks array', async () => {
		const { body } = await get('/api/gastown/health');

		expect(body).toHaveProperty('checks');
		expect(Array.isArray(body.checks)).toBe(true);
	});

	it('returns summary with counts', async () => {
		const { body } = await get('/api/gastown/health');

		expect(body).toHaveProperty('summary');
		expect(body.summary).toHaveProperty('total');
		expect(body.summary).toHaveProperty('pass');
		expect(body.summary).toHaveProperty('warn');
		expect(body.summary).toHaveProperty('fail');
	});

	it('validates health schema', async () => {
		const { body } = await get('/api/gastown/health');

		const parsed = HealthResponseSchema.safeParse(body);
		if (!parsed.success) {
			console.log('[TEST] Schema validation errors:', parsed.error.issues);
		}
		expect(parsed.success).toBe(true);
	});

	it('checks have required fields', async () => {
		const { body } = await get('/api/gastown/health');

		if (body.checks?.length > 0) {
			for (const check of body.checks) {
				expect(check).toHaveProperty('name');
				expect(check).toHaveProperty('status');
				expect(check).toHaveProperty('message');
				expect(check).toHaveProperty('category');
				expect(['pass', 'warn', 'fail']).toContain(check.status);
			}
		}
	});

	it('summary total matches checks length', async () => {
		const { body } = await get('/api/gastown/health');

		if (body.checks && body.summary) {
			expect(body.summary.total).toBe(body.checks.length);
		}
	});

	it('summary counts are consistent', async () => {
		const { body } = await get('/api/gastown/health');

		if (body.checks && body.summary) {
			const actualPass = body.checks.filter(
				(c: { status: string }) => c.status === 'pass'
			).length;
			const actualWarn = body.checks.filter(
				(c: { status: string }) => c.status === 'warn'
			).length;
			const actualFail = body.checks.filter(
				(c: { status: string }) => c.status === 'fail'
			).length;

			expect(body.summary.pass).toBe(actualPass);
			expect(body.summary.warn).toBe(actualWarn);
			expect(body.summary.fail).toBe(actualFail);
			expect(body.summary.total).toBe(actualPass + actualWarn + actualFail);
		}
	});

	it('returns 503 when unhealthy', async () => {
		const { response, body } = await get('/api/gastown/health');

		if (body.status === 'unhealthy') {
			expect(response.status).toBe(503);
		}
	});

	it('returns 200 when healthy or degraded', async () => {
		const { response, body } = await get('/api/gastown/health');

		if (body.status === 'healthy' || body.status === 'degraded') {
			expect(response.status).toBe(200);
		}
	});

	it('status reflects check results', async () => {
		const { body } = await get('/api/gastown/health');

		if (body.checks && body.status) {
			const hasFail = body.checks.some(
				(c: { status: string }) => c.status === 'fail'
			);
			const hasWarn = body.checks.some(
				(c: { status: string }) => c.status === 'warn'
			);

			if (hasFail) {
				expect(body.status).toBe('unhealthy');
			} else if (hasWarn) {
				expect(body.status).toBe('degraded');
			} else {
				expect(body.status).toBe('healthy');
			}
		}
	});

	it('completes within reasonable time', async () => {
		const { duration } = await get('/api/gastown/health');

		// gt doctor can take up to 30 seconds
		expect(duration).toBeLessThan(35_000);
	});
});
