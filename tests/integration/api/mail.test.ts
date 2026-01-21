/**
 * Integration Tests: /api/gastown/mail
 *
 * Tests the mail endpoint against the real CLI.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { get } from '../setup';

// Schema for mail message
const MailMessageSchema = z.object({
	id: z.string(),
	from: z.string(),
	subject: z.string(),
	body: z.string(),
	timestamp: z.string(),
	read: z.boolean(),
	priority: z.string(),
	messageType: z.string(),
	threadId: z.string()
});

const MailResponseSchema = z.object({
	messages: z.array(MailMessageSchema),
	unreadCount: z.number(),
	error: z.string().nullable(),
	fetchedAt: z.string(),
	requestId: z.string().uuid()
});

const ErrorResponseSchema = z.object({
	messages: z.array(z.unknown()),
	unreadCount: z.number(),
	error: z.string(),
	fetchedAt: z.string(),
	requestId: z.string().uuid()
});

describe('GET /api/gastown/mail', () => {
	it('returns a valid response with requestId', async () => {
		const { response, body } = await get('/api/gastown/mail');

		expect([200, 500]).toContain(response.status);
		expect(body).toHaveProperty('requestId');
		expect(body).toHaveProperty('fetchedAt');
	});

	it('returns messages array and unreadCount', async () => {
		const { body } = await get('/api/gastown/mail');

		expect(body).toHaveProperty('messages');
		expect(body).toHaveProperty('unreadCount');
		expect(Array.isArray(body.messages)).toBe(true);
		expect(typeof body.unreadCount).toBe('number');
	});

	it('validates mail schema on success', async () => {
		const { response, body } = await get('/api/gastown/mail');

		if (response.ok && body.messages?.length > 0) {
			const parsed = MailResponseSchema.safeParse(body);
			if (!parsed.success) {
				console.log('[TEST] Schema validation errors:', parsed.error.issues);
			}
			expect(parsed.success).toBe(true);
		}
	});

	it('messages have required fields', async () => {
		const { response, body } = await get('/api/gastown/mail');

		if (response.ok && body.messages?.length > 0) {
			for (const message of body.messages) {
				expect(message).toHaveProperty('id');
				expect(message).toHaveProperty('from');
				expect(message).toHaveProperty('subject');
				expect(message).toHaveProperty('timestamp');
				expect(message).toHaveProperty('read');
			}
		}
	});

	it('messages have valid priority values', async () => {
		const { response, body } = await get('/api/gastown/mail');

		if (response.ok && body.messages?.length > 0) {
			const validPriorities = ['low', 'normal', 'high'];
			for (const message of body.messages) {
				expect(validPriorities).toContain(message.priority);
			}
		}
	});

	it('unreadCount matches unread messages', async () => {
		const { response, body } = await get('/api/gastown/mail');

		if (response.ok && body.messages?.length > 0) {
			const actualUnread = body.messages.filter(
				(m: { read: boolean }) => !m.read
			).length;
			expect(body.unreadCount).toBe(actualUnread);
		}
	});

	it('messages are sorted by timestamp (newest first)', async () => {
		const { response, body } = await get('/api/gastown/mail');

		if (response.ok && body.messages?.length > 1) {
			for (let i = 1; i < body.messages.length; i++) {
				const prev = new Date(body.messages[i - 1].timestamp).getTime();
				const curr = new Date(body.messages[i].timestamp).getTime();
				expect(prev).toBeGreaterThanOrEqual(curr);
			}
		}
	});

	it('handles empty inbox gracefully', async () => {
		const { response, body } = await get('/api/gastown/mail');

		if (response.ok && body.messages?.length === 0) {
			expect(body.unreadCount).toBe(0);
		}
	});

	it('returns fetchedAt in ISO format', async () => {
		const { body } = await get('/api/gastown/mail');

		if (body.fetchedAt) {
			const date = new Date(body.fetchedAt);
			expect(date.toISOString()).toBeTruthy();
		}
	});

	it('completes within reasonable time', async () => {
		const { duration } = await get('/api/gastown/mail');

		// Should complete within 15 seconds
		expect(duration).toBeLessThan(15_000);
	});
});
