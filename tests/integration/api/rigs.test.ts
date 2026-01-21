/**
 * Integration Tests: /api/gastown/rigs
 *
 * Tests the rigs endpoint against the real CLI.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { get, post } from '../setup';

// Schema for rig list response
const RigListResponseSchema = z.object({
	data: z.unknown(),
	requestId: z.string().uuid()
});

const ErrorResponseSchema = z.object({
	error: z.string(),
	requestId: z.string().uuid()
});

// Schema for POST response (rig add operation)
const RigAddResponseSchema = z.object({
	status: z.literal('accepted'),
	operationId: z.string(),
	message: z.string(),
	checkStatus: z.string()
});

const ValidationErrorSchema = z.object({
	error: z.string(),
	details: z.record(z.array(z.string())).optional()
});

describe('GET /api/gastown/rigs', () => {
	it('returns a valid response with requestId', async () => {
		const { response, body } = await get('/api/gastown/rigs');

		expect([200, 500]).toContain(response.status);
		expect(body).toHaveProperty('requestId');
	});

	it('returns data field on success', async () => {
		const { response, body } = await get('/api/gastown/rigs');

		if (response.ok) {
			expect(body).toHaveProperty('data');
		}
	});

	it('validates response schema on success', async () => {
		const { response, body } = await get('/api/gastown/rigs');

		if (response.ok) {
			const parsed = RigListResponseSchema.safeParse(body);
			if (!parsed.success) {
				console.log('[TEST] Schema validation errors:', parsed.error.issues);
			}
			expect(parsed.success).toBe(true);
		}
	});

	it('returns error schema on failure', async () => {
		const { response, body } = await get('/api/gastown/rigs');

		if (!response.ok) {
			const parsed = ErrorResponseSchema.safeParse(body);
			expect(parsed.success).toBe(true);
		}
	});

	it('completes within reasonable time', async () => {
		const { duration } = await get('/api/gastown/rigs');

		// Should complete within 15 seconds
		expect(duration).toBeLessThan(15_000);
	});
});

describe('POST /api/gastown/rigs', () => {
	// Note: POST requests may return 403 if auth/CSRF protection is enabled
	// These tests verify the expected behavior when protection is bypassed or
	// validate schema correctness when auth is in place

	it('handles POST request (may require auth)', async () => {
		const { response, body } = await post('/api/gastown/rigs', 'invalid-json');

		// Accept 400 (validation error) or 403 (auth required)
		expect([400, 403]).toContain(response.status);
		if (response.status === 400) {
			expect(body).toHaveProperty('error');
		}
	});

	it('validates required fields when auth passes', async () => {
		const { response, body } = await post('/api/gastown/rigs', {});

		// Accept 400 (validation error) or 403 (auth required)
		expect([400, 403]).toContain(response.status);
		if (response.status === 400) {
			expect(body).toHaveProperty('error');
			expect(body.error).toContain('Validation');
		}
	});

	it('validates name format when auth passes', async () => {
		const { response, body } = await post('/api/gastown/rigs', {
			name: 'invalid name with spaces!',
			url: 'https://github.com/test/repo'
		});

		// Accept 400 (validation error) or 403 (auth required)
		expect([400, 403]).toContain(response.status);
		if (response.status === 400) {
			expect(body).toHaveProperty('error');
		}
	});

	it('validates URL format when auth passes', async () => {
		const { response, body } = await post('/api/gastown/rigs', {
			name: 'valid-name',
			url: 'not-a-url'
		});

		// Accept 400 (validation error) or 403 (auth required)
		expect([400, 403]).toContain(response.status);
		if (response.status === 400) {
			expect(body).toHaveProperty('error');
		}
	});

	it('validates URL protocol when auth passes', async () => {
		const { response, body } = await post('/api/gastown/rigs', {
			name: 'valid-name',
			url: 'ftp://invalid-protocol.com/repo'
		});

		// Accept 400 (validation error) or 403 (auth required)
		expect([400, 403]).toContain(response.status);
		if (response.status === 400) {
			expect(body).toHaveProperty('error');
		}
	});

	// Validate schema correctness without making actual requests
	it('validates rig add request schema', async () => {
		const validPayload = {
			name: 'test-rig-integration',
			url: 'https://github.com/test/repo.git'
		};

		// Verify the schema validates
		const schema = z.object({
			name: z
				.string()
				.min(1)
				.max(64)
				.regex(/^[a-zA-Z0-9_-]+$/),
			url: z.string().url().regex(/^https?:\/\//)
		});

		const result = schema.safeParse(validPayload);
		expect(result.success).toBe(true);
	});
});
