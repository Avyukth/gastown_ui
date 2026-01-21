/**
 * Integration Tests: /api/gastown/queue
 *
 * Tests the merge queue endpoint against the real CLI.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { get } from '../setup';

// Schema for queue item
const QueueItemSchema = z.object({
	id: z.string(),
	branch: z.string(),
	rig: z.string(),
	status: z.string(),
	position: z.number(),
	worker: z.string().optional(),
	createdAt: z.string()
});

const QueueResponseSchema = z.object({
	items: z.array(QueueItemSchema),
	queueLength: z.number(),
	timestamp: z.string(),
	requestId: z.string().uuid()
});

const ErrorResponseSchema = z.object({
	items: z.array(z.unknown()),
	queueLength: z.number(),
	error: z.string(),
	timestamp: z.string(),
	requestId: z.string().uuid()
});

describe('GET /api/gastown/queue', () => {
	it('returns a valid response with requestId', async () => {
		const { response, body } = await get('/api/gastown/queue');

		expect([200, 500]).toContain(response.status);
		expect(body).toHaveProperty('requestId');
		expect(body).toHaveProperty('timestamp');
	});

	it('returns items array and queueLength', async () => {
		const { body } = await get('/api/gastown/queue');

		expect(body).toHaveProperty('items');
		expect(body).toHaveProperty('queueLength');
		expect(Array.isArray(body.items)).toBe(true);
		expect(typeof body.queueLength).toBe('number');
	});

	it('validates queue schema on success', async () => {
		const { response, body } = await get('/api/gastown/queue');

		if (response.ok && body.items?.length > 0) {
			const parsed = QueueResponseSchema.safeParse(body);
			if (!parsed.success) {
				console.log('[TEST] Schema validation errors:', parsed.error.issues);
			}
			expect(parsed.success).toBe(true);
		}
	});

	it('queue items have required fields', async () => {
		const { response, body } = await get('/api/gastown/queue');

		if (response.ok && body.items?.length > 0) {
			for (const item of body.items) {
				expect(item).toHaveProperty('id');
				expect(item).toHaveProperty('branch');
				expect(item).toHaveProperty('rig');
				expect(item).toHaveProperty('status');
				expect(item).toHaveProperty('position');
			}
		}
	});

	it('items are sorted by position', async () => {
		const { response, body } = await get('/api/gastown/queue');

		if (response.ok && body.items?.length > 1) {
			for (let i = 1; i < body.items.length; i++) {
				expect(body.items[i].position).toBeGreaterThanOrEqual(
					body.items[i - 1].position
				);
			}
		}
	});

	it('supports rig filter', async () => {
		// First get all items to find a rig name
		const { response, body } = await get('/api/gastown/queue');

		if (response.ok && body.items?.length > 0) {
			const rigName = body.items[0].rig;
			const { body: filteredBody } = await get(
				`/api/gastown/queue?rig=${rigName}`
			);

			if (filteredBody.items?.length > 0) {
				for (const item of filteredBody.items) {
					expect(item.rig).toBe(rigName);
				}
			}
		}
	});

	it('queueLength matches items length', async () => {
		const { response, body } = await get('/api/gastown/queue');

		if (response.ok) {
			expect(body.queueLength).toBe(body.items.length);
		}
	});

	it('handles empty queue gracefully', async () => {
		const { response, body } = await get('/api/gastown/queue');

		if (response.ok && body.items?.length === 0) {
			expect(body.queueLength).toBe(0);
		}
	});

	it('returns error schema on failure', async () => {
		const { response, body } = await get('/api/gastown/queue');

		if (!response.ok) {
			const parsed = ErrorResponseSchema.safeParse(body);
			expect(parsed.success).toBe(true);
		}
	});

	it('completes within reasonable time', async () => {
		const { duration } = await get('/api/gastown/queue');

		// Should complete within 20 seconds (may need to fetch multiple rigs)
		expect(duration).toBeLessThan(20_000);
	});
});
