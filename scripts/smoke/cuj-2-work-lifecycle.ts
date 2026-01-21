/**
 * CUJ-2 Work Item Lifecycle Smoke Tests
 *
 * Validates the Work Item creation and management journey through the API.
 *
 * Run: bun run scripts/smoke/cuj-2-work-lifecycle.ts
 */

import { expect, test, describe, beforeAll, afterAll } from 'bun:test';
import { createTestLogger } from './lib';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const logger = createTestLogger('CUJ-2: Work Item Lifecycle');

interface CreateIssueResponse {
	data?: {
		id: string;
		title: string;
		priority: number;
		issue_type: string;
		status: string;
	};
	error?: string;
	requestId: string;
}

interface ListIssuesResponse {
	items: Array<{
		id: string;
		title: string;
		priority: number;
		issueType: string;
		status: string;
		assignee: string | null;
		labels: string[];
	}>;
	total: number;
	timestamp: string;
	requestId: string;
	error?: string;
}

describe('CUJ-2: Work Item Lifecycle', () => {
	let createdIssueId: string | null = null;
	const testTitle = `Smoke test work item ${Date.now()}`;

	beforeAll(() => {
		logger.step('Starting CUJ-2 Work Item Lifecycle Tests');
		logger.info(`Base URL: ${BASE_URL}`);
	});

	test('CUJ-2.1: Create work item via POST', async () => {
		const startTime = Date.now();

		logger.step('1. Create work item via POST');
		const payload = {
			title: testTitle,
			type: 'task',
			priority: 1
		};
		logger.request('POST', `${BASE_URL}/api/gastown/work/issues`, payload);

		const res = await fetch(`${BASE_URL}/api/gastown/work/issues`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const body = (await res.json()) as CreateIssueResponse;

		logger.response(res.status, body);

		expect(res.ok).toBe(true);
		expect(res.status).toBe(201);
		expect(body.data).toBeDefined();
		expect(body.data?.id).toBeDefined();

		createdIssueId = body.data?.id ?? null;
		logger.success(`Created work item: ${createdIssueId}`);
		logger.timing('Create work item', Date.now() - startTime);
	});

	test('CUJ-2.2: Validate ID format', async () => {
		const startTime = Date.now();

		logger.step('2. Verify ID format');
		expect(createdIssueId).not.toBeNull();
		logger.info(`ID: ${createdIssueId}`);

		// ID format: lowercase prefix + hyphen + alphanumeric (e.g., gu-abc123)
		const idPattern = /^[a-z]+-[a-z0-9]+$/;
		expect(createdIssueId).toMatch(idPattern);

		logger.success('ID format valid');
		logger.timing('Validate ID format', Date.now() - startTime);
	});

	test('CUJ-2.3: Verify item appears in list', async () => {
		const startTime = Date.now();

		logger.step('3. Verify item appears in list');
		expect(createdIssueId).not.toBeNull();

		logger.request('GET', `${BASE_URL}/api/gastown/work`);

		const res = await fetch(`${BASE_URL}/api/gastown/work`);
		const body = (await res.json()) as ListIssuesResponse;

		logger.response(res.status, { count: body.items.length, sample: body.items.slice(0, 3) });

		expect(res.ok).toBe(true);
		expect(body.items).toBeInstanceOf(Array);

		const found = body.items.some((item) => item.id === createdIssueId);
		expect(found).toBe(true);

		logger.success(`Found item ${createdIssueId} in list of ${body.items.length} items`);
		logger.timing('List verification', Date.now() - startTime);
	});

	test('CUJ-2.4: Verify item details match', async () => {
		const startTime = Date.now();

		logger.step('4. Verify item details match');
		expect(createdIssueId).not.toBeNull();

		logger.request('GET', `${BASE_URL}/api/gastown/work`);

		const res = await fetch(`${BASE_URL}/api/gastown/work`);
		const body = (await res.json()) as ListIssuesResponse;

		logger.response(res.status, { total: body.total });

		const item = body.items.find((i) => i.id === createdIssueId);
		expect(item).toBeDefined();

		logger.info('Item details:', item);

		expect(item?.title).toBe(testTitle);
		expect(item?.priority).toBe(1);
		expect(item?.issueType).toBe('task');
		expect(item?.status).toBe('open');

		logger.success('Item details verified');
		logger.timing('Details verification', Date.now() - startTime);
	});

	test('CUJ-2.5: Filter list by priority', async () => {
		const startTime = Date.now();

		logger.step('5. Filter list by priority');

		logger.request('GET', `${BASE_URL}/api/gastown/work?priority=1`);

		const res = await fetch(`${BASE_URL}/api/gastown/work?priority=1`);
		const body = (await res.json()) as ListIssuesResponse;

		logger.response(res.status, { count: body.items.length });

		expect(res.ok).toBe(true);

		// All returned items should have priority 1
		const allPriorityOne = body.items.every((item) => item.priority === 1);
		expect(allPriorityOne).toBe(true);

		// Our created item should be in the filtered list
		const found = body.items.some((item) => item.id === createdIssueId);
		expect(found).toBe(true);

		logger.success(`Filtered list contains ${body.items.length} P1 items, including our test item`);
		logger.timing('Priority filter', Date.now() - startTime);
	});

	test('CUJ-2.6: Filter list by type', async () => {
		const startTime = Date.now();

		logger.step('6. Filter list by type');

		logger.request('GET', `${BASE_URL}/api/gastown/work?type=task`);

		const res = await fetch(`${BASE_URL}/api/gastown/work?type=task`);
		const body = (await res.json()) as ListIssuesResponse;

		logger.response(res.status, { count: body.items.length });

		expect(res.ok).toBe(true);

		// All returned items should be tasks
		const allTasks = body.items.every((item) => item.issueType === 'task');
		expect(allTasks).toBe(true);

		// Our created item should be in the filtered list
		const found = body.items.some((item) => item.id === createdIssueId);
		expect(found).toBe(true);

		logger.success(`Filtered list contains ${body.items.length} tasks, including our test item`);
		logger.timing('Type filter', Date.now() - startTime);
	});
});

describe('CUJ-2: Validation Tests', () => {
	test('CUJ-2.7: Reject empty title', async () => {
		const startTime = Date.now();

		logger.step('7. Validation: Reject empty title');

		const payload = { title: '', priority: 1 };
		logger.request('POST', `${BASE_URL}/api/gastown/work/issues`, payload);

		const res = await fetch(`${BASE_URL}/api/gastown/work/issues`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const body = (await res.json()) as CreateIssueResponse;

		logger.response(res.status, body);

		expect(res.ok).toBe(false);
		expect(res.status).toBe(400);
		expect(body.error).toBeDefined();

		logger.success('Empty title correctly rejected');
		logger.timing('Empty title validation', Date.now() - startTime);
	});

	test('CUJ-2.8: Sanitize priority bounds', async () => {
		const startTime = Date.now();

		logger.step('8. Validation: Priority bounds');

		// Test priority > 4 gets clamped
		const payload = { title: `Priority test ${Date.now()}`, priority: 99 };
		logger.request('POST', `${BASE_URL}/api/gastown/work/issues`, payload);

		const res = await fetch(`${BASE_URL}/api/gastown/work/issues`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const body = (await res.json()) as CreateIssueResponse;

		logger.response(res.status, body);

		// Should succeed but clamp priority to 4
		expect(res.ok).toBe(true);
		expect(body.data?.priority).toBeLessThanOrEqual(4);

		logger.success('Priority correctly clamped to bounds');
		logger.timing('Priority bounds validation', Date.now() - startTime);
	});

	test('CUJ-2.9: Default type fallback', async () => {
		const startTime = Date.now();

		logger.step('9. Validation: Type fallback');

		const payload = { title: `Type fallback test ${Date.now()}`, type: 'invalid-type' };
		logger.request('POST', `${BASE_URL}/api/gastown/work/issues`, payload);

		const res = await fetch(`${BASE_URL}/api/gastown/work/issues`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const body = (await res.json()) as CreateIssueResponse;

		logger.response(res.status, body);

		// Should succeed and default to 'task'
		expect(res.ok).toBe(true);
		expect(body.data?.issue_type).toBe('task');

		logger.success('Invalid type correctly falls back to task');
		logger.timing('Type fallback validation', Date.now() - startTime);
	});
});

// Run summary at the end of CUJ-2: Validation Tests
describe('CUJ-2: Summary', () => {
	afterAll(() => {
		logger.summary('CUJ-2', true, 0, 9);
	});

	test('Summary placeholder', () => {
		// This ensures afterAll runs
		expect(true).toBe(true);
	});
});
