import { describe, it, expect } from 'vitest';
import {
	parseCliJson,
	parseSingleFromArray,
	parseArray,
	parseSingleBead,
	parseBeadList,
	parseSingleConvoy,
	parseConvoyList,
	parseSingleMail,
	parseMailList,
	isNotFound,
	hasData,
	unwrapOrThrow,
	unwrapOr
} from '../parse';
import { z } from 'zod';

// =============================================================================
// Test Data
// =============================================================================

const validBead = {
	id: 'gu-test',
	title: 'Test Bead',
	description: 'A test bead',
	status: 'open',
	priority: 1,
	issue_type: 'task',
	assignee: null,
	created_at: '2026-01-20T00:00:00Z',
	created_by: 'testuser',
	updated_at: '2026-01-20T00:00:00Z',
	labels: ['test'],
	ephemeral: false,
	parent_id: null
};

const validConvoy = {
	id: 'convoy-test',
	title: 'Test Convoy',
	status: 'open',
	work_status: 'active',
	progress: '50%',
	completed: 5,
	total: 10,
	created_at: '2026-01-20T00:00:00Z',
	updated_at: '2026-01-20T00:00:00Z',
	tracked_issues: []
};

const validMail = {
	id: 'mail-test',
	from: 'sender@test.com',
	to: 'receiver@test.com',
	subject: 'Test Mail',
	body: 'Test body',
	timestamp: '2026-01-20T00:00:00Z',
	read: false,
	priority: 'normal',
	type: 'notification',
	delivery: 'queue',
	thread_id: null,
	reply_to: null,
	pinned: false,
	wisp: false
};

// =============================================================================
// Generic Parsing Tests
// =============================================================================

describe('parseCliJson', () => {
	const TestSchema = z.object({
		id: z.string(),
		value: z.number()
	});

	it('parses valid JSON with schema', () => {
		const json = JSON.stringify({ id: 'test', value: 42 });
		const result = parseCliJson(TestSchema, json);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ id: 'test', value: 42 });
		}
	});

	it('returns error for invalid JSON syntax', () => {
		const result = parseCliJson(TestSchema, '{ invalid }');

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain('JSON parse error');
		}
	});

	it('returns error for schema validation failure', () => {
		const json = JSON.stringify({ id: 'test', value: 'not a number' });
		const result = parseCliJson(TestSchema, json);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain('Validation failed');
		}
	});
});

describe('parseSingleFromArray', () => {
	const ItemSchema = z.object({ id: z.string() });

	it('extracts first element from single-item array', () => {
		const json = JSON.stringify([{ id: 'first' }]);
		const result = parseSingleFromArray(ItemSchema, json);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ id: 'first' });
		}
	});

	it('extracts first element from multi-item array', () => {
		const json = JSON.stringify([{ id: 'first' }, { id: 'second' }]);
		const result = parseSingleFromArray(ItemSchema, json);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ id: 'first' });
		}
	});

	it('returns null for empty array (not found)', () => {
		const json = JSON.stringify([]);
		const result = parseSingleFromArray(ItemSchema, json);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toBeNull();
		}
	});

	it('returns error for non-array input', () => {
		const json = JSON.stringify({ id: 'not-array' });
		const result = parseSingleFromArray(ItemSchema, json);

		expect(result.success).toBe(false);
	});
});

describe('parseArray', () => {
	const ItemSchema = z.object({ id: z.string() });

	it('parses array of items', () => {
		const json = JSON.stringify([{ id: 'a' }, { id: 'b' }]);
		const result = parseArray(ItemSchema, json);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toHaveLength(2);
			expect(result.data[0].id).toBe('a');
			expect(result.data[1].id).toBe('b');
		}
	});

	it('returns empty array for empty input', () => {
		const json = JSON.stringify([]);
		const result = parseArray(ItemSchema, json);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual([]);
		}
	});

	it('returns error if any item fails validation', () => {
		const json = JSON.stringify([{ id: 'valid' }, { invalid: true }]);
		const result = parseArray(ItemSchema, json);

		expect(result.success).toBe(false);
	});
});

// =============================================================================
// Bead Parsing Tests
// =============================================================================

describe('parseSingleBead', () => {
	it('parses single bead from array', () => {
		const json = JSON.stringify([validBead]);
		const result = parseSingleBead(json);

		expect(result.success).toBe(true);
		if (result.success && result.data) {
			expect(result.data.id).toBe('gu-test');
			expect(result.data.title).toBe('Test Bead');
		}
	});

	it('returns null for empty array', () => {
		const result = parseSingleBead('[]');

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toBeNull();
		}
	});
});

describe('parseBeadList', () => {
	it('parses bead list', () => {
		const beads = [validBead, { ...validBead, id: 'gu-test2' }];
		const json = JSON.stringify(beads);
		const result = parseBeadList(json);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toHaveLength(2);
		}
	});

	it('returns empty array for empty input', () => {
		const result = parseBeadList('[]');

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual([]);
		}
	});
});

// =============================================================================
// Convoy Parsing Tests
// =============================================================================

describe('parseSingleConvoy', () => {
	it('parses single convoy from array', () => {
		const json = JSON.stringify([validConvoy]);
		const result = parseSingleConvoy(json);

		expect(result.success).toBe(true);
		if (result.success && result.data) {
			expect(result.data.id).toBe('convoy-test');
		}
	});

	it('returns null for empty array', () => {
		const result = parseSingleConvoy('[]');

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toBeNull();
		}
	});
});

describe('parseConvoyList', () => {
	it('parses convoy list', () => {
		const convoys = [validConvoy, { ...validConvoy, id: 'convoy-2' }];
		const json = JSON.stringify(convoys);
		const result = parseConvoyList(json);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toHaveLength(2);
		}
	});
});

// =============================================================================
// Mail Parsing Tests
// =============================================================================

describe('parseSingleMail', () => {
	it('parses single mail from array', () => {
		const json = JSON.stringify([validMail]);
		const result = parseSingleMail(json);

		expect(result.success).toBe(true);
		if (result.success && result.data) {
			expect(result.data.id).toBe('mail-test');
			expect(result.data.subject).toBe('Test Mail');
		}
	});

	it('returns null for empty array', () => {
		const result = parseSingleMail('[]');

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toBeNull();
		}
	});
});

describe('parseMailList', () => {
	it('parses mail list', () => {
		const mails = [validMail, { ...validMail, id: 'mail-2' }];
		const json = JSON.stringify(mails);
		const result = parseMailList(json);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toHaveLength(2);
		}
	});
});

// =============================================================================
// Utility Function Tests
// =============================================================================

describe('isNotFound', () => {
	it('returns true for successful null result', () => {
		const result = { success: true as const, data: null } as const;
		expect(isNotFound(result)).toBe(true);
	});

	it('returns false for successful non-null result', () => {
		const result = { success: true as const, data: { id: 'test' } } as const;
		expect(isNotFound(result)).toBe(false);
	});

	it('returns false for error result', () => {
		const result = { success: false as const, error: 'test error' } as const;
		expect(isNotFound(result)).toBe(false);
	});
});

describe('hasData', () => {
	it('returns true for successful non-null result', () => {
		const result = { success: true as const, data: { id: 'test' } } as const;
		expect(hasData(result)).toBe(true);
	});

	it('returns false for successful null result', () => {
		const result = { success: true as const, data: null } as const;
		expect(hasData(result)).toBe(false);
	});

	it('returns false for error result', () => {
		const result = { success: false as const, error: 'test error' } as const;
		expect(hasData(result)).toBe(false);
	});
});

describe('unwrapOrThrow', () => {
	it('returns data on success', () => {
		const result = { success: true as const, data: { id: 'test' } } as const;
		expect(unwrapOrThrow(result)).toEqual({ id: 'test' });
	});

	it('throws on error', () => {
		const result = { success: false as const, error: 'test error' } as const;
		expect(() => unwrapOrThrow(result)).toThrow('test error');
	});
});

describe('unwrapOr', () => {
	it('returns data on success', () => {
		const result = { success: true as const, data: { id: 'test' } } as const;
		expect(unwrapOr(result, { id: 'default' })).toEqual({ id: 'test' });
	});

	it('returns default on error', () => {
		const result = { success: false as const, error: 'test error' } as const;
		expect(unwrapOr(result, { id: 'default' })).toEqual({ id: 'default' });
	});
});
