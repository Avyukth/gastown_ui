/**
 * Tests for convoy status derivation utilities
 * Convoy status is DERIVED from tracked issues, not stored
 */

import { describe, it, expect } from 'vitest';
import {
	deriveConvoyWorkStatus,
	isValidConvoyStorageStatus,
	isValidConvoyWorkStatus,
	type ConvoyStorageStatus,
	type ConvoyWorkStatus,
	type TrackedIssue,
	CONVOY_WORK_STATUSES,
	CONVOY_STALENESS_THRESHOLD_HOURS
} from './convoy';

describe('isValidConvoyStorageStatus', () => {
	it('returns true for open', () => {
		expect(isValidConvoyStorageStatus('open')).toBe(true);
	});

	it('returns true for closed', () => {
		expect(isValidConvoyStorageStatus('closed')).toBe(true);
	});

	it('returns false for active', () => {
		expect(isValidConvoyStorageStatus('active')).toBe(false);
	});

	it('returns false for invalid strings', () => {
		expect(isValidConvoyStorageStatus('stale')).toBe(false);
		expect(isValidConvoyStorageStatus('stuck')).toBe(false);
		expect(isValidConvoyStorageStatus('')).toBe(false);
	});
});

describe('isValidConvoyWorkStatus', () => {
	it('returns true for all valid work statuses', () => {
		expect(isValidConvoyWorkStatus('active')).toBe(true);
		expect(isValidConvoyWorkStatus('stale')).toBe(true);
		expect(isValidConvoyWorkStatus('stuck')).toBe(true);
		expect(isValidConvoyWorkStatus('waiting')).toBe(true);
		expect(isValidConvoyWorkStatus('complete')).toBe(true);
	});

	it('returns false for storage statuses', () => {
		expect(isValidConvoyWorkStatus('open')).toBe(false);
		expect(isValidConvoyWorkStatus('closed')).toBe(false);
	});

	it('returns false for invalid strings', () => {
		expect(isValidConvoyWorkStatus('invalid')).toBe(false);
		expect(isValidConvoyWorkStatus('')).toBe(false);
	});
});

describe('CONVOY_WORK_STATUSES', () => {
	it('includes all five work statuses', () => {
		expect(CONVOY_WORK_STATUSES).toContain('active');
		expect(CONVOY_WORK_STATUSES).toContain('stale');
		expect(CONVOY_WORK_STATUSES).toContain('stuck');
		expect(CONVOY_WORK_STATUSES).toContain('waiting');
		expect(CONVOY_WORK_STATUSES).toContain('complete');
		expect(CONVOY_WORK_STATUSES).toHaveLength(5);
	});
});

describe('CONVOY_STALENESS_THRESHOLD_HOURS', () => {
	it('defaults to 24 hours', () => {
		expect(CONVOY_STALENESS_THRESHOLD_HOURS).toBe(24);
	});
});

describe('deriveConvoyWorkStatus', () => {
	const now = Date.now();
	const recentDate = new Date(now - 1000 * 60 * 60).toISOString(); // 1 hour ago
	const staleDate = new Date(now - 1000 * 60 * 60 * 48).toISOString(); // 48 hours ago

	describe('empty tracked issues', () => {
		it('returns waiting when no tracked issues', () => {
			expect(deriveConvoyWorkStatus({ trackedIssues: [], updatedAt: recentDate })).toBe('waiting');
		});

		it('returns waiting with empty array', () => {
			expect(deriveConvoyWorkStatus({ trackedIssues: [], updatedAt: staleDate })).toBe('waiting');
		});
	});

	describe('complete convoy', () => {
		it('returns complete when all issues closed', () => {
			const trackedIssues: TrackedIssue[] = [
				{ id: 'bd-1', status: 'closed' },
				{ id: 'bd-2', status: 'closed' }
			];
			expect(deriveConvoyWorkStatus({ trackedIssues, updatedAt: recentDate })).toBe('complete');
		});

		it('returns complete when single issue closed', () => {
			const trackedIssues: TrackedIssue[] = [{ id: 'bd-1', status: 'closed' }];
			expect(deriveConvoyWorkStatus({ trackedIssues, updatedAt: recentDate })).toBe('complete');
		});
	});

	describe('stuck convoy', () => {
		it('returns stuck when any issue is stuck', () => {
			const trackedIssues: TrackedIssue[] = [
				{ id: 'bd-1', status: 'open', isStuck: true },
				{ id: 'bd-2', status: 'open' }
			];
			expect(deriveConvoyWorkStatus({ trackedIssues, updatedAt: recentDate })).toBe('stuck');
		});

		it('stuck takes priority over stale', () => {
			const trackedIssues: TrackedIssue[] = [{ id: 'bd-1', status: 'open', isStuck: true }];
			expect(deriveConvoyWorkStatus({ trackedIssues, updatedAt: staleDate })).toBe('stuck');
		});
	});

	describe('active convoy', () => {
		it('returns active when any issue has assignee', () => {
			const trackedIssues: TrackedIssue[] = [
				{ id: 'bd-1', status: 'open', assignee: 'furiosa' },
				{ id: 'bd-2', status: 'open' }
			];
			expect(deriveConvoyWorkStatus({ trackedIssues, updatedAt: recentDate })).toBe('active');
		});

		it('returns active when recently updated with open issues', () => {
			const trackedIssues: TrackedIssue[] = [{ id: 'bd-1', status: 'open' }];
			expect(deriveConvoyWorkStatus({ trackedIssues, updatedAt: recentDate })).toBe('active');
		});
	});

	describe('stale convoy', () => {
		it('returns stale when no activity for over 24 hours', () => {
			const trackedIssues: TrackedIssue[] = [{ id: 'bd-1', status: 'open' }];
			expect(deriveConvoyWorkStatus({ trackedIssues, updatedAt: staleDate })).toBe('stale');
		});

		it('returns stale for old convoy without assignees', () => {
			const trackedIssues: TrackedIssue[] = [
				{ id: 'bd-1', status: 'open' },
				{ id: 'bd-2', status: 'open' }
			];
			expect(deriveConvoyWorkStatus({ trackedIssues, updatedAt: staleDate })).toBe('stale');
		});
	});

	describe('custom staleness threshold', () => {
		it('respects custom threshold', () => {
			const fourHoursAgo = new Date(now - 1000 * 60 * 60 * 4).toISOString();
			const trackedIssues: TrackedIssue[] = [{ id: 'bd-1', status: 'open' }];

			expect(
				deriveConvoyWorkStatus({ trackedIssues, updatedAt: fourHoursAgo, stalenessThresholdHours: 2 })
			).toBe('stale');

			expect(
				deriveConvoyWorkStatus({ trackedIssues, updatedAt: fourHoursAgo, stalenessThresholdHours: 8 })
			).toBe('active');
		});
	});

	describe('priority order', () => {
		it('complete > stuck (closed beats stuck)', () => {
			const trackedIssues: TrackedIssue[] = [
				{ id: 'bd-1', status: 'closed' },
				{ id: 'bd-2', status: 'closed' }
			];
			expect(deriveConvoyWorkStatus({ trackedIssues, updatedAt: staleDate })).toBe('complete');
		});

		it('stuck > stale', () => {
			const trackedIssues: TrackedIssue[] = [{ id: 'bd-1', status: 'open', isStuck: true }];
			expect(deriveConvoyWorkStatus({ trackedIssues, updatedAt: staleDate })).toBe('stuck');
		});

		it('active with assignee > stale', () => {
			const trackedIssues: TrackedIssue[] = [
				{ id: 'bd-1', status: 'open', assignee: 'nux' }
			];
			expect(deriveConvoyWorkStatus({ trackedIssues, updatedAt: staleDate })).toBe('active');
		});
	});
});
