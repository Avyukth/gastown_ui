import { describe, it, expect } from 'vitest';
import {
	identifyKnownBug,
	getErrorCategory,
	isRecoverable,
	KNOWN_BUGS,
	type KnownBug
} from '../known-bugs';
import { mapCategoryToStatus, type ErrorCategory } from '../categories';

describe('identifyKnownBug', () => {
	it('returns null for unknown errors', () => {
		expect(identifyKnownBug('some random error')).toBeNull();
	});

	it('identifies mail inbox daemon error', () => {
		const bug = identifyKnownBug('gt mail inbox failed: daemon not running');
		expect(bug?.id).toBe('mail-inbox-daemon');
		expect(bug?.category).toBe('KNOWN_BUG');
	});

	it('identifies rig add timeout', () => {
		const bug = identifyKnownBug('gt rig add failed: operation timed out');
		expect(bug?.id).toBe('rig-add-timeout');
		expect(bug?.category).toBe('TIMEOUT');
	});

	it('identifies clone timeout variant', () => {
		const bug = identifyKnownBug('clone timeout after 60s');
		expect(bug?.id).toBe('rig-add-timeout');
	});

	it('identifies database locked error', () => {
		const bug = identifyKnownBug('SQLITE_BUSY: database is locked');
		expect(bug?.id).toBe('beads-database-locked');
	});

	it('identifies network unreachable', () => {
		const bug = identifyKnownBug('ECONNREFUSED');
		expect(bug?.id).toBe('network-unreachable');
		expect(bug?.category).toBe('NETWORK');
	});

	it('identifies ETIMEDOUT as network error', () => {
		const bug = identifyKnownBug('connect ETIMEDOUT');
		expect(bug?.id).toBe('network-unreachable');
	});

	it('identifies JSON parse error', () => {
		const bug = identifyKnownBug('Unexpected token < in JSON at position 0');
		expect(bug?.id).toBe('json-parse-error');
		expect(bug?.category).toBe('PARSE_ERROR');
	});

	it('identifies auth expired', () => {
		const bug = identifyKnownBug('Error 401: not authorized');
		expect(bug?.id).toBe('auth-expired');
		expect(bug?.category).toBe('AUTH');
	});

	it('identifies git not found', () => {
		const bug = identifyKnownBug('command not found: git');
		expect(bug?.id).toBe('git-not-found');
		expect(bug?.category).toBe('CLI_ERROR');
	});

	it('identifies permission denied', () => {
		const bug = identifyKnownBug('EACCES: permission denied');
		expect(bug?.id).toBe('permission-denied');
	});

	it('is case insensitive', () => {
		expect(identifyKnownBug('DATABASE LOCKED')).not.toBeNull();
		expect(identifyKnownBug('sqlite_busy')).not.toBeNull();
	});
});

describe('getErrorCategory', () => {
	it('returns known bug info when matched', () => {
		const result = getErrorCategory('SQLITE_BUSY: database is locked');
		expect(result.category).toBe('KNOWN_BUG');
		expect(result.defaultMessage).toBe('Database is locked by another process');
		expect(result.suggestedAction).toContain('Wait a moment');
		expect(result.icon).toBe('🐛');
	});

	it('categorizes timeout errors', () => {
		const result = getErrorCategory('operation timeout');
		expect(result.category).toBe('TIMEOUT');
		expect(result.icon).toBe('⏱️');
	});

	it('categorizes network errors', () => {
		const result = getErrorCategory('fetch failed');
		expect(result.category).toBe('NETWORK');
	});

	it('categorizes auth errors', () => {
		const result = getErrorCategory('403 forbidden');
		expect(result.category).toBe('AUTH');
	});

	it('categorizes parse errors', () => {
		const result = getErrorCategory('syntax error in response');
		expect(result.category).toBe('PARSE_ERROR');
	});

	it('returns UNKNOWN for unmatched errors', () => {
		const result = getErrorCategory('something completely random');
		expect(result.category).toBe('UNKNOWN');
		expect(result.defaultMessage).toBe('Something went wrong');
	});

	it('handles Error objects', () => {
		const error = new Error('SQLITE_BUSY');
		const result = getErrorCategory(error);
		expect(result.category).toBe('KNOWN_BUG');
	});
});

describe('isRecoverable', () => {
	it('returns false for AUTH errors', () => {
		expect(isRecoverable('AUTH')).toBe(false);
	});

	it('returns true for other categories', () => {
		const categories: ErrorCategory[] = [
			'KNOWN_BUG',
			'CLI_ERROR',
			'NETWORK',
			'PARSE_ERROR',
			'TIMEOUT',
			'UNKNOWN'
		];
		for (const cat of categories) {
			expect(isRecoverable(cat)).toBe(true);
		}
	});
});

describe('mapCategoryToStatus', () => {
	it('maps NETWORK to 503', () => {
		expect(mapCategoryToStatus('NETWORK')).toBe(503);
	});

	it('maps TIMEOUT to 504', () => {
		expect(mapCategoryToStatus('TIMEOUT')).toBe(504);
	});

	it('maps AUTH to 401', () => {
		expect(mapCategoryToStatus('AUTH')).toBe(401);
	});

	it('maps PARSE_ERROR to 502', () => {
		expect(mapCategoryToStatus('PARSE_ERROR')).toBe(502);
	});

	it('maps others to 500', () => {
		expect(mapCategoryToStatus('KNOWN_BUG')).toBe(500);
		expect(mapCategoryToStatus('CLI_ERROR')).toBe(500);
		expect(mapCategoryToStatus('UNKNOWN')).toBe(500);
	});
});

describe('KNOWN_BUGS registry', () => {
	it('has at least 6 entries', () => {
		expect(KNOWN_BUGS.length).toBeGreaterThanOrEqual(6);
	});

	it('all entries have required fields', () => {
		for (const bug of KNOWN_BUGS) {
			expect(bug.id).toBeTruthy();
			expect(bug.pattern).toBeTruthy();
			expect(bug.category).toBeTruthy();
			expect(bug.userMessage).toBeTruthy();
			expect(bug.workaround).toBeTruthy();
		}
	});

	it('all ids are unique', () => {
		const ids = KNOWN_BUGS.map((b) => b.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});
