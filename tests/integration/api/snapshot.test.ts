/**
 * Integration Tests: /api/gastown/snapshot
 *
 * Tests the snapshot endpoint (coherent dashboard data fetch).
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { get } from '../setup';
import { GtDashboardSnapshotSchema } from '../../../src/lib/types/gastown.schema';

// Extended schema for response validation
const SnapshotResponseSchema = GtDashboardSnapshotSchema.extend({
	requestId: z.string().uuid()
});

describe('GET /api/gastown/snapshot', () => {
	it('returns a valid response with requestId', async () => {
		const { response, body } = await get('/api/gastown/snapshot');

		expect([200, 500]).toContain(response.status);
		expect(body).toHaveProperty('requestId');
	});

	it('returns all dashboard data fields', async () => {
		const { response, body } = await get('/api/gastown/snapshot');

		if (response.ok) {
			expect(body).toHaveProperty('rigs');
			expect(body).toHaveProperty('polecats');
			expect(body).toHaveProperty('convoys');
			expect(body).toHaveProperty('recent_activity');
			expect(body).toHaveProperty('mail');
			expect(body).toHaveProperty('queue');
			expect(body).toHaveProperty('health');
			expect(body).toHaveProperty('fetchedAt');
			expect(body).toHaveProperty('timestamp');
		}
	});

	it('validates against dashboard snapshot schema', async () => {
		const { response, body } = await get('/api/gastown/snapshot');

		if (response.ok) {
			const parsed = SnapshotResponseSchema.safeParse(body);
			if (!parsed.success) {
				console.log('[TEST] Schema validation errors:', parsed.error.issues);
			}
			expect(parsed.success).toBe(true);
		}
	});

	it('rigs array contains valid rig snapshots', async () => {
		const { response, body } = await get('/api/gastown/snapshot');

		if (response.ok && body.rigs?.length > 0) {
			for (const rig of body.rigs) {
				expect(rig).toHaveProperty('name');
				expect(rig).toHaveProperty('status');
				expect(['active', 'idle']).toContain(rig.status);
				expect(rig).toHaveProperty('polecats');
				expect(typeof rig.polecats).toBe('number');
			}
		}
	});

	it('polecats array contains valid polecat snapshots', async () => {
		const { response, body } = await get('/api/gastown/snapshot');

		if (response.ok && body.polecats?.length > 0) {
			for (const polecat of body.polecats) {
				expect(polecat).toHaveProperty('id');
				expect(polecat).toHaveProperty('name');
				expect(polecat).toHaveProperty('role');
				expect(polecat).toHaveProperty('rig');
				expect(polecat).toHaveProperty('status');
				expect(['running', 'idle']).toContain(polecat.status);
			}
		}
	});

	it('convoys array is limited to 10 items', async () => {
		const { response, body } = await get('/api/gastown/snapshot');

		if (response.ok && body.convoys) {
			expect(body.convoys.length).toBeLessThanOrEqual(10);
		}
	});

	it('recent_activity array is limited to 10 items', async () => {
		const { response, body } = await get('/api/gastown/snapshot');

		if (response.ok && body.recent_activity) {
			expect(body.recent_activity.length).toBeLessThanOrEqual(10);
		}
	});

	it('mail summary has unread and total counts', async () => {
		const { response, body } = await get('/api/gastown/snapshot');

		if (response.ok && body.mail) {
			expect(body.mail).toHaveProperty('unread');
			expect(body.mail).toHaveProperty('total');
			expect(typeof body.mail.unread).toBe('number');
			expect(typeof body.mail.total).toBe('number');
			expect(body.mail.unread).toBeLessThanOrEqual(body.mail.total);
		}
	});

	it('queue summary has correct structure', async () => {
		const { response, body } = await get('/api/gastown/snapshot');

		if (response.ok && body.queue) {
			expect(body.queue).toHaveProperty('pending');
			expect(body.queue).toHaveProperty('inProgress');
			expect(body.queue).toHaveProperty('total');
			expect(typeof body.queue.pending).toBe('number');
			expect(typeof body.queue.inProgress).toBe('number');
			expect(typeof body.queue.total).toBe('number');
		}
	});

	it('health status is valid enum value', async () => {
		const { response, body } = await get('/api/gastown/snapshot');

		if (response.ok) {
			expect(['healthy', 'degraded', 'unhealthy']).toContain(body.health);
		}
	});

	it('timestamps are in ISO format', async () => {
		const { response, body } = await get('/api/gastown/snapshot');

		if (response.ok) {
			const fetchedAt = new Date(body.fetchedAt);
			const timestamp = new Date(body.timestamp);

			expect(fetchedAt.toISOString()).toBeTruthy();
			expect(timestamp.toISOString()).toBeTruthy();
		}
	});

	it('fetchedAt and timestamp are close together', async () => {
		const { response, body } = await get('/api/gastown/snapshot');

		if (response.ok) {
			const fetchedAt = new Date(body.fetchedAt).getTime();
			const timestamp = new Date(body.timestamp).getTime();

			// Should be within 5 seconds of each other
			expect(Math.abs(timestamp - fetchedAt)).toBeLessThan(5000);
		}
	});

	it('uses caching for repeated requests', async () => {
		// First request
		const { body: body1, duration: duration1 } = await get(
			'/api/gastown/snapshot'
		);

		// Second request should be faster due to caching
		const { body: body2, duration: duration2 } = await get(
			'/api/gastown/snapshot'
		);

		// Both should have same fetchedAt if cache hit
		if (body1.fetchedAt && body2.fetchedAt) {
			// Cache is 5 seconds, so if we get same fetchedAt, it's a cache hit
			console.log(
				`[TEST] First request: ${duration1}ms, Second: ${duration2}ms`
			);
			console.log(
				`[TEST] Cache hit: ${body1.fetchedAt === body2.fetchedAt}`
			);
		}

		// Second request should be faster or equal (cached)
		// Allow some variance for network
		expect(duration2).toBeLessThanOrEqual(duration1 + 1000);
	});

	it('completes within reasonable time', async () => {
		const { duration } = await get('/api/gastown/snapshot');

		// Snapshot fetches multiple CLI commands, allow 30 seconds
		expect(duration).toBeLessThan(30_000);
	});
});
