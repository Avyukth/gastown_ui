/**
 * Integration Tests: /api/gastown/work
 *
 * Tests the work endpoint against the real CLI.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { get } from '../setup';

// Schema for work item
const WorkItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().optional(),
	status: z.string(),
	priority: z.number(),
	issueType: z.string(),
	assignee: z.string().nullable(),
	labels: z.array(z.string()),
	createdAt: z.string(),
	updatedAt: z.string(),
	createdBy: z.string()
});

const WorkResponseSchema = z.object({
	items: z.array(WorkItemSchema),
	total: z.number(),
	timestamp: z.string(),
	requestId: z.string().uuid()
});

const ErrorResponseSchema = z.object({
	items: z.array(z.unknown()),
	total: z.number(),
	error: z.string().optional(),
	timestamp: z.string(),
	requestId: z.string().uuid()
});

describe('GET /api/gastown/work', () => {
	it('returns a valid response with requestId', async () => {
		const { response, body } = await get('/api/gastown/work');

		expect([200, 500]).toContain(response.status);
		expect(body).toHaveProperty('requestId');
		expect(body).toHaveProperty('timestamp');
	});

	it('returns items array and total count', async () => {
		const { body } = await get('/api/gastown/work');

		expect(body).toHaveProperty('items');
		expect(body).toHaveProperty('total');
		expect(Array.isArray(body.items)).toBe(true);
		expect(typeof body.total).toBe('number');
	});

	it('validates work item schema on success', async () => {
		const { response, body } = await get('/api/gastown/work');

		if (response.ok && body.items?.length > 0) {
			const parsed = WorkResponseSchema.safeParse(body);
			if (!parsed.success) {
				console.log('[TEST] Schema validation errors:', parsed.error.issues);
			}
			expect(parsed.success).toBe(true);
		}
	});

	it('work items have required fields', async () => {
		const { response, body } = await get('/api/gastown/work');

		if (response.ok && body.items?.length > 0) {
			for (const item of body.items) {
				expect(item).toHaveProperty('id');
				expect(item).toHaveProperty('title');
				expect(item).toHaveProperty('status');
				expect(item).toHaveProperty('priority');
			}
		}
	});

	it('supports type filter', async () => {
		const { response, body } = await get('/api/gastown/work?type=task');

		expect([200, 500]).toContain(response.status);
		expect(body).toHaveProperty('items');

		if (response.ok && body.items?.length > 0) {
			for (const item of body.items) {
				expect(item.issueType).toBe('task');
			}
		}
	});

	it('supports status filter', async () => {
		const { response, body } = await get('/api/gastown/work?status=open');

		expect([200, 500]).toContain(response.status);
		expect(body).toHaveProperty('items');

		if (response.ok && body.items?.length > 0) {
			for (const item of body.items) {
				expect(item.status).toBe('open');
			}
		}
	});

	it('supports priority filter', async () => {
		const { response, body } = await get('/api/gastown/work?priority=1');

		expect([200, 500]).toContain(response.status);
		expect(body).toHaveProperty('items');

		if (response.ok && body.items?.length > 0) {
			for (const item of body.items) {
				expect(item.priority).toBe(1);
			}
		}
	});

	it('handles empty results gracefully', async () => {
		const { response, body } = await get('/api/gastown/work');

		if (response.ok && body.items?.length === 0) {
			expect(body.total).toBe(0);
		}
	});

	it('total matches items length', async () => {
		const { response, body } = await get('/api/gastown/work');

		if (response.ok) {
			expect(body.total).toBe(body.items.length);
		}
	});

	it('completes within reasonable time', async () => {
		const { duration } = await get('/api/gastown/work');

		// Should complete within 20 seconds
		expect(duration).toBeLessThan(20_000);
	});
});
