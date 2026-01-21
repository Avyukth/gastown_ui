/**
 * Integration Tests: /api/gastown/work
 *
 * Tests the work endpoint with mocked CLI (Process Supervisor).
 * Verifies filtering, empty results, and error handling.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CLIResult } from '$lib/server/cli/contracts';

// Mock the process supervisor module
const mockGt = vi.fn();
const mockBd = vi.fn();

vi.mock('$lib/server/cli', () => ({
	getProcessSupervisor: vi.fn(() => ({
		gt: mockGt,
		bd: mockBd
	}))
}));

// Import after mocking
import { GET } from '../work/+server';

// Helper to create request event
function createRequestEvent(url: string) {
	const urlObj = new URL(url, 'http://localhost');
	return {
		request: new Request(urlObj),
		locals: {},
		params: {},
		url: urlObj,
		platform: undefined,
		cookies: {} as any,
		fetch: fetch,
		getClientAddress: () => '127.0.0.1',
		setHeaders: vi.fn(),
		isDataRequest: false,
		isSubRequest: false,
		route: { id: '/api/gastown/work' }
	};
}

// Sample bead data matching BdBead interface
const mockBeads = [
	{
		id: 'gu-001',
		title: 'Implement feature X',
		description: 'Add the feature',
		status: 'open',
		priority: 1,
		issue_type: 'task',
		assignee: 'polecat-1',
		labels: ['frontend'],
		created_at: '2026-01-20T10:00:00Z',
		updated_at: '2026-01-20T12:00:00Z',
		created_by: 'human'
	},
	{
		id: 'gu-002',
		title: 'Fix bug Y',
		description: 'Fix the bug',
		status: 'in_progress',
		priority: 2,
		issue_type: 'bug',
		assignee: 'polecat-2',
		labels: ['backend', 'urgent'],
		created_at: '2026-01-19T08:00:00Z',
		updated_at: '2026-01-20T14:00:00Z',
		created_by: 'witness'
	}
];

describe('GET /api/gastown/work', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('Success Cases', () => {
		it('returns work items with expected structure', async () => {
			mockBd.mockResolvedValueOnce({
				success: true,
				data: mockBeads,
				error: null,
				exitCode: 0,
				duration: 100,
				command: 'bd list --json'
			});

			const response = await GET(createRequestEvent('/api/gastown/work'));

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.items).toHaveLength(2);
			expect(data.total).toBe(2);
			expect(data.timestamp).toBeDefined();
			expect(data.requestId).toBeDefined();

			// Verify transformed structure (snake_case -> camelCase)
			expect(data.items[0].id).toBe('gu-001');
			expect(data.items[0].type).toBe('task');
			expect(data.items[0].createdAt).toBe('2026-01-20T10:00:00Z');
			expect(data.items[0].createdBy).toBe('human');
		});

		it('calls bd with correct base arguments', async () => {
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [],
				error: null,
				exitCode: 0,
				duration: 50,
				command: 'bd list --json'
			});

			await GET(createRequestEvent('/api/gastown/work'));

			expect(mockBd).toHaveBeenCalledTimes(1);
			expect(mockBd).toHaveBeenCalledWith(['list', '--json'], { timeout: 15_000 });
		});
	});

	describe('Filtering', () => {
		it('filters by type', async () => {
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [mockBeads[1]],
				error: null,
				exitCode: 0,
				duration: 50,
				command: 'bd list --json --type=bug'
			});

			await GET(createRequestEvent('/api/gastown/work?type=bug'));

			expect(mockBd).toHaveBeenCalledWith(['list', '--json', '--type=bug'], { timeout: 15_000 });
		});

		it('filters by status', async () => {
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [mockBeads[0]],
				error: null,
				exitCode: 0,
				duration: 50,
				command: 'bd list --json --status=open'
			});

			await GET(createRequestEvent('/api/gastown/work?status=open'));

			expect(mockBd).toHaveBeenCalledWith(['list', '--json', '--status=open'], { timeout: 15_000 });
		});

		it('filters by priority', async () => {
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [mockBeads[0]],
				error: null,
				exitCode: 0,
				duration: 50,
				command: 'bd list --json --priority=1'
			});

			await GET(createRequestEvent('/api/gastown/work?priority=1'));

			expect(mockBd).toHaveBeenCalledWith(['list', '--json', '--priority=1'], { timeout: 15_000 });
		});

		it('filters by assignee', async () => {
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [mockBeads[0]],
				error: null,
				exitCode: 0,
				duration: 50,
				command: 'bd list --json --assignee=polecat-1'
			});

			await GET(createRequestEvent('/api/gastown/work?assignee=polecat-1'));

			expect(mockBd).toHaveBeenCalledWith(['list', '--json', '--assignee=polecat-1'], {
				timeout: 15_000
			});
		});

		it('filters by labels (multiple)', async () => {
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [mockBeads[1]],
				error: null,
				exitCode: 0,
				duration: 50,
				command: 'bd list --json --label=backend --label=urgent'
			});

			await GET(createRequestEvent('/api/gastown/work?labels=backend,urgent'));

			expect(mockBd).toHaveBeenCalledWith(
				['list', '--json', '--label=backend', '--label=urgent'],
				{ timeout: 15_000 }
			);
		});

		it('combines multiple filters', async () => {
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [],
				error: null,
				exitCode: 0,
				duration: 50,
				command: 'bd list --json --type=bug --status=open --priority=1'
			});

			await GET(createRequestEvent('/api/gastown/work?type=bug&status=open&priority=1'));

			expect(mockBd).toHaveBeenCalledWith(
				['list', '--json', '--type=bug', '--status=open', '--priority=1'],
				{ timeout: 15_000 }
			);
		});

		it('ignores invalid filter values', async () => {
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [],
				error: null,
				exitCode: 0,
				duration: 50,
				command: 'bd list --json'
			});

			// Invalid type with special chars, invalid priority
			await GET(createRequestEvent('/api/gastown/work?type=<script>&priority=invalid'));

			// Should only include base args since filters are invalid
			expect(mockBd).toHaveBeenCalledWith(['list', '--json'], { timeout: 15_000 });
		});
	});

	describe('Empty Results', () => {
		it('returns empty array when no beads found', async () => {
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [],
				error: null,
				exitCode: 0,
				duration: 50,
				command: 'bd list --json'
			});

			const response = await GET(createRequestEvent('/api/gastown/work'));

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.items).toEqual([]);
			expect(data.total).toBe(0);
			expect(data.requestId).toBeDefined();
		});

		it('handles "no issues" error as empty result', async () => {
			mockBd.mockResolvedValueOnce({
				success: false,
				data: null,
				error: 'no issues matching criteria',
				exitCode: 1,
				duration: 50,
				command: 'bd list --json'
			});

			const response = await GET(createRequestEvent('/api/gastown/work'));

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.items).toEqual([]);
			expect(data.total).toBe(0);
			expect(data.requestId).toBeDefined();
			expect(data.error).toBeUndefined();
		});

		it('handles "no beads" error as empty result', async () => {
			mockBd.mockResolvedValueOnce({
				success: false,
				data: null,
				error: 'no beads found',
				exitCode: 1,
				duration: 50,
				command: 'bd list --json'
			});

			const response = await GET(createRequestEvent('/api/gastown/work'));

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.items).toEqual([]);
			expect(data.total).toBe(0);
		});
	});

	describe('Error Handling', () => {
		it('returns 500 when CLI returns other errors', async () => {
			mockBd.mockResolvedValueOnce({
				success: false,
				data: null,
				error: 'Database connection failed',
				exitCode: 1,
				duration: 100,
				command: 'bd list --json'
			});

			const response = await GET(createRequestEvent('/api/gastown/work'));

			expect(response.status).toBe(500);

			const data = await response.json();
			expect(data.error).toBe('Database connection failed');
			expect(data.items).toEqual([]);
			expect(data.total).toBe(0);
			expect(data.requestId).toBeDefined();
		});

		it('returns 500 when CLI throws exception', async () => {
			mockBd.mockRejectedValueOnce(new Error('CLI process timed out'));

			const response = await GET(createRequestEvent('/api/gastown/work'));

			expect(response.status).toBe(500);

			const data = await response.json();
			expect(data.error).toBe('CLI process timed out');
			expect(data.items).toEqual([]);
			expect(data.total).toBe(0);
			expect(data.requestId).toBeDefined();
		});

		it('handles non-Error exceptions gracefully', async () => {
			mockBd.mockRejectedValueOnce('Unknown string error');

			const response = await GET(createRequestEvent('/api/gastown/work'));

			expect(response.status).toBe(500);

			const data = await response.json();
			expect(data.error).toBe('Unknown error');
			expect(data.requestId).toBeDefined();
		});

		it('includes requestId in all error responses', async () => {
			mockBd.mockResolvedValueOnce({
				success: false,
				data: null,
				error: 'Some error',
				exitCode: 1,
				duration: 10,
				command: 'bd list --json'
			});

			const response = await GET(createRequestEvent('/api/gastown/work'));

			const data = await response.json();
			expect(data.requestId).toBeDefined();
			expect(data.requestId).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
			);
		});
	});

	describe('Data Transformation', () => {
		it('transforms snake_case to camelCase', async () => {
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [mockBeads[0]],
				error: null,
				exitCode: 0,
				duration: 50,
				command: 'bd list --json'
			});

			const response = await GET(createRequestEvent('/api/gastown/work'));
			const data = await response.json();

			const item = data.items[0];
			expect(item.type).toBe('task');
			expect(item.createdAt).toBe('2026-01-20T10:00:00Z');
			expect(item.updatedAt).toBe('2026-01-20T12:00:00Z');
			expect(item.createdBy).toBe('human');
			// Verify snake_case fields are not present
			expect(item.issue_type).toBeUndefined();
			expect(item.created_at).toBeUndefined();
		});

		it('handles null assignee', async () => {
			const beadWithNullAssignee = { ...mockBeads[0], assignee: undefined };
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [beadWithNullAssignee],
				error: null,
				exitCode: 0,
				duration: 50,
				command: 'bd list --json'
			});

			const response = await GET(createRequestEvent('/api/gastown/work'));
			const data = await response.json();

			expect(data.items[0].assignee).toBeNull();
		});

		it('handles missing labels', async () => {
			const beadWithNoLabels = { ...mockBeads[0], labels: undefined };
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [beadWithNoLabels],
				error: null,
				exitCode: 0,
				duration: 50,
				command: 'bd list --json'
			});

			const response = await GET(createRequestEvent('/api/gastown/work'));
			const data = await response.json();

			expect(data.items[0].labels).toEqual([]);
		});
	});

	describe('Mock Isolation', () => {
		it('mocks are reset between tests - first test', async () => {
			mockBd.mockResolvedValueOnce({
				success: true,
				data: [{ ...mockBeads[0], title: 'First test' }],
				error: null,
				exitCode: 0,
				duration: 10,
				command: 'bd list --json'
			});

			const response = await GET(createRequestEvent('/api/gastown/work'));
			const data = await response.json();

			expect(data.items[0].title).toBe('First test');
			expect(mockBd).toHaveBeenCalledTimes(1);
		});

		it('mocks are reset between tests - second test', async () => {
			// Verify previous mock doesn't leak
			expect(mockBd).toHaveBeenCalledTimes(0);

			mockBd.mockResolvedValueOnce({
				success: true,
				data: [{ ...mockBeads[0], title: 'Second test' }],
				error: null,
				exitCode: 0,
				duration: 10,
				command: 'bd list --json'
			});

			const response = await GET(createRequestEvent('/api/gastown/work'));
			const data = await response.json();

			expect(data.items[0].title).toBe('Second test');
		});
	});
});
