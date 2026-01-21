/**
 * Integration Tests: /api/gastown/agents
 *
 * Tests the agents endpoint against the real CLI.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { get } from '../setup';

// Schema for agent response
const AgentSchema = z.object({
	name: z.string(),
	type: z.string(),
	status: z.enum(['running', 'idle', 'offline']),
	rig: z.string().nullable(),
	hasWork: z.boolean(),
	unreadMail: z.number(),
	address: z.string()
});

const AgentsResponseSchema = z.object({
	agents: z.array(AgentSchema),
	timestamp: z.string(),
	requestId: z.string().uuid()
});

const ErrorResponseSchema = z.object({
	error: z.string(),
	agents: z.array(z.unknown()),
	timestamp: z.string(),
	requestId: z.string().uuid()
});

describe('GET /api/gastown/agents', () => {
	it('returns a valid response with requestId', async () => {
		const { response, body } = await get('/api/gastown/agents');

		expect([200, 500]).toContain(response.status);
		expect(body).toHaveProperty('requestId');
		expect(body).toHaveProperty('timestamp');
	});

	it('returns agents array', async () => {
		const { body } = await get('/api/gastown/agents');

		expect(body).toHaveProperty('agents');
		expect(Array.isArray(body.agents)).toBe(true);
	});

	it('validates agent schema on success', async () => {
		const { response, body } = await get('/api/gastown/agents');

		if (response.ok && body.agents?.length > 0) {
			const parsed = AgentsResponseSchema.safeParse(body);
			if (!parsed.success) {
				console.log('[TEST] Schema validation errors:', parsed.error.issues);
			}
			expect(parsed.success).toBe(true);
		}
	});

	it('each agent has required fields', async () => {
		const { response, body } = await get('/api/gastown/agents');

		if (response.ok && body.agents?.length > 0) {
			for (const agent of body.agents) {
				expect(agent).toHaveProperty('name');
				expect(agent).toHaveProperty('type');
				expect(agent).toHaveProperty('status');
				expect(agent).toHaveProperty('address');
				expect(['running', 'idle', 'offline']).toContain(agent.status);
			}
		}
	});

	it('agents have valid status values', async () => {
		const { response, body } = await get('/api/gastown/agents');

		if (response.ok && body.agents?.length > 0) {
			const validStatuses = ['running', 'idle', 'offline'];
			for (const agent of body.agents) {
				expect(validStatuses).toContain(agent.status);
			}
		}
	});

	it('returns timestamp in ISO format', async () => {
		const { body } = await get('/api/gastown/agents');

		if (body.timestamp) {
			const date = new Date(body.timestamp);
			expect(date.toISOString()).toBeTruthy();
		}
	});

	it('handles error gracefully', async () => {
		const { response, body } = await get('/api/gastown/agents');

		if (!response.ok) {
			const parsed = ErrorResponseSchema.safeParse(body);
			expect(parsed.success).toBe(true);
			// Should still return empty agents array on error
			expect(body.agents).toEqual([]);
		}
	});

	it('completes within reasonable time', async () => {
		const { duration } = await get('/api/gastown/agents');

		// Should complete within 20 seconds (allowing for CLI execution)
		expect(duration).toBeLessThan(20_000);
	});
});
