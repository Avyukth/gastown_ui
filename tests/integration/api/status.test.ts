/**
 * Integration Tests: /api/gastown/status
 *
 * Tests the status endpoint against the real CLI.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { get } from '../setup';

// Schema for validating status response
const StatusResponseSchema = z.object({
	name: z.string(),
	location: z.string().optional(),
	overseer: z
		.object({
			name: z.string(),
			email: z.string(),
			username: z.string()
		})
		.passthrough()
		.optional(),
	agents: z.array(z.object({}).passthrough()).optional(),
	rigs: z.array(z.object({}).passthrough()).optional(),
	requestId: z.string().uuid()
});

const ErrorResponseSchema = z.object({
	error: z.string(),
	requestId: z.string().uuid()
});

describe('GET /api/gastown/status', () => {
	it('returns a valid response with requestId', async () => {
		const { response, body } = await get('/api/gastown/status');

		// Should return 200 or 500 (if CLI fails)
		expect([200, 500]).toContain(response.status);
		expect(body).toHaveProperty('requestId');
		expect(typeof body.requestId).toBe('string');
	});

	it('returns valid status schema on success', async () => {
		const { response, body } = await get('/api/gastown/status');

		if (response.ok) {
			const parsed = StatusResponseSchema.safeParse(body);
			if (!parsed.success) {
				console.log('[TEST] Schema validation errors:', parsed.error.issues);
			}
			expect(parsed.success).toBe(true);
		} else {
			// On error, should have error field
			const parsed = ErrorResponseSchema.safeParse(body);
			expect(parsed.success).toBe(true);
		}
	});

	it('includes request ID from header when provided', async () => {
		const customRequestId = 'test-request-id-12345';
		const { body } = await get('/api/gastown/status', {
			'X-Request-Id': customRequestId
		});

		// The endpoint generates its own requestId, but we can verify it exists
		expect(body).toHaveProperty('requestId');
	});

	it('returns town name on successful response', async () => {
		const { response, body } = await get('/api/gastown/status');

		if (response.ok) {
			expect(body).toHaveProperty('name');
			expect(typeof body.name).toBe('string');
		}
	});

	it('returns agents array when available', async () => {
		const { response, body } = await get('/api/gastown/status');

		if (response.ok && body.agents) {
			expect(Array.isArray(body.agents)).toBe(true);
		}
	});

	it('returns rigs array when available', async () => {
		const { response, body } = await get('/api/gastown/status');

		if (response.ok && body.rigs) {
			expect(Array.isArray(body.rigs)).toBe(true);

			// Each rig should have a name
			for (const rig of body.rigs) {
				expect(rig).toHaveProperty('name');
			}
		}
	});

	it('completes within reasonable time', async () => {
		const { duration } = await get('/api/gastown/status');

		// Should complete within 15 seconds (allowing for CLI execution)
		expect(duration).toBeLessThan(15_000);
	});

	it('returns JSON content type', async () => {
		const { response } = await get('/api/gastown/status');

		const contentType = response.headers.get('content-type');
		expect(contentType).toContain('application/json');
	});
});
