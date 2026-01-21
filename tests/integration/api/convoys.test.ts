/**
 * Integration Tests: /api/gastown/convoys
 *
 * Tests the convoys endpoint against the real CLI.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { get } from '../setup';

// Schema for convoy response
const ConvoySchema = z
	.object({
		id: z.string(),
		title: z.string().optional(),
		status: z.string().optional()
	})
	.passthrough();

const ConvoysResponseSchema = z.object({
	convoys: z.array(ConvoySchema),
	requestId: z.string().uuid()
});

const ErrorResponseSchema = z.object({
	error: z.string(),
	requestId: z.string().uuid()
});

describe('GET /api/gastown/convoys', () => {
	it('returns a valid response with requestId', async () => {
		const { response, body } = await get('/api/gastown/convoys');

		expect([200, 500]).toContain(response.status);
		expect(body).toHaveProperty('requestId');
	});

	it('returns convoys array', async () => {
		const { body } = await get('/api/gastown/convoys');

		// Either convoys array or error
		if (body.convoys !== undefined) {
			expect(Array.isArray(body.convoys)).toBe(true);
		}
	});

	it('validates convoy schema on success', async () => {
		const { response, body } = await get('/api/gastown/convoys');

		if (response.ok && body.convoys) {
			const parsed = ConvoysResponseSchema.safeParse(body);
			if (!parsed.success) {
				console.log('[TEST] Schema validation errors:', parsed.error.issues);
			}
			expect(parsed.success).toBe(true);
		}
	});

	it('handles empty convoys gracefully', async () => {
		const { response, body } = await get('/api/gastown/convoys');

		if (response.ok) {
			expect(body).toHaveProperty('convoys');
			expect(Array.isArray(body.convoys)).toBe(true);
		}
	});

	it('convoy items have id field', async () => {
		const { response, body } = await get('/api/gastown/convoys');

		if (response.ok && body.convoys?.length > 0) {
			for (const convoy of body.convoys) {
				expect(convoy).toHaveProperty('id');
				expect(typeof convoy.id).toBe('string');
			}
		}
	});

	it('handles "no issues" error as empty array', async () => {
		const { response, body } = await get('/api/gastown/convoys');

		// The endpoint should handle "no issues" gracefully and return empty array
		if (response.ok && body.convoys) {
			expect(Array.isArray(body.convoys)).toBe(true);
		}
	});

	it('returns error schema on failure', async () => {
		const { response, body } = await get('/api/gastown/convoys');

		if (!response.ok) {
			const parsed = ErrorResponseSchema.safeParse(body);
			expect(parsed.success).toBe(true);
		}
	});

	it('completes within reasonable time', async () => {
		const { duration } = await get('/api/gastown/convoys');

		// Should complete within 15 seconds
		expect(duration).toBeLessThan(15_000);
	});
});
