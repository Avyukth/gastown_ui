import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	GtStatusSchema,
	GtOverseerSchema,
	GtAgentSummarySchema,
	GtRigInfoSchema,
	GtHookInfoSchema,
	BdBeadSchema,
	BdBeadStatusSchema,
	GtConvoySchema,
	GtConvoyStatusSchema,
	GtConvoyWorkStatusSchema,
	GtTrackedIssueSchema,
	GtMailMessageSchema,
	GtMailPrioritySchema,
	GtMailTypeSchema,
	GtMailDeliverySchema,
	parseCliOutput,
	parseCliOutputOrThrow
} from '../contracts';

// =============================================================================
// Fixture Loading
// =============================================================================

const fixturesDir = join(__dirname, 'fixtures');

function loadFixture(filename: string): string {
	return readFileSync(join(fixturesDir, filename), 'utf-8');
}

// =============================================================================
// Test Data
// =============================================================================

let statusFixture: string;
let beadFixture: string;
let convoyFixture: string;
let mailFixture: string;
let unicodeBeadFixture: string;

beforeAll(() => {
	statusFixture = loadFixture('gt-status.json');
	beadFixture = loadFixture('bd-bead.json');
	convoyFixture = loadFixture('gt-convoy.json');
	mailFixture = loadFixture('gt-mail.json');
	unicodeBeadFixture = loadFixture('unicode-bead.json');
});

// =============================================================================
// Valid Input Tests
// =============================================================================

describe('CLI Contracts - Valid Inputs', () => {
	describe('GtStatusSchema', () => {
		it('parses valid status JSON from fixture', () => {
			const result = GtStatusSchema.safeParse(JSON.parse(statusFixture));
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.name).toBe('gastown');
				expect(result.data.overseer.name).toBe('Dev User');
				expect(result.data.rigs).toHaveLength(1);
				expect(result.data.agents).toHaveLength(2);
			}
		});

		it('accepts minimal valid status', () => {
			const minimal = {
				name: 'test',
				location: '/path',
				overseer: {
					name: 'User',
					email: 'user@example.com',
					username: 'user',
					source: 'git',
					unread_mail: 0
				},
				agents: [],
				rigs: []
			};
			const result = GtStatusSchema.safeParse(minimal);
			expect(result.success).toBe(true);
		});
	});

	describe('BdBeadSchema', () => {
		it('parses valid work item JSON from fixture', () => {
			const result = BdBeadSchema.safeParse(JSON.parse(beadFixture));
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.id).toBe('gu-amx');
				expect(result.data.title).toBe('Implement user authentication');
				expect(result.data.status).toBe('in_progress');
				expect(result.data.labels).toContain('auth');
			}
		});

		it('accepts all valid bead statuses', () => {
			const statuses = ['open', 'in_progress', 'closed', 'hooked'] as const;
			for (const status of statuses) {
				const result = BdBeadStatusSchema.safeParse(status);
				expect(result.success, `Status "${status}" should be valid`).toBe(true);
			}
		});
	});

	describe('GtConvoySchema', () => {
		it('parses valid convoy JSON from fixture', () => {
			const result = GtConvoySchema.safeParse(JSON.parse(convoyFixture));
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.id).toBe('convoy-001');
				expect(result.data.status).toBe('open');
				expect(result.data.work_status).toBe('active');
				expect(result.data.tracked_issues).toHaveLength(3);
			}
		});

		it('accepts all valid convoy statuses', () => {
			const result1 = GtConvoyStatusSchema.safeParse('open');
			const result2 = GtConvoyStatusSchema.safeParse('closed');
			expect(result1.success).toBe(true);
			expect(result2.success).toBe(true);
		});

		it('accepts all valid work statuses', () => {
			const statuses = ['complete', 'active', 'stale', 'stuck', 'waiting'] as const;
			for (const status of statuses) {
				const result = GtConvoyWorkStatusSchema.safeParse(status);
				expect(result.success, `Work status "${status}" should be valid`).toBe(true);
			}
		});
	});

	describe('GtMailMessageSchema', () => {
		it('parses valid mail JSON from fixture', () => {
			const result = GtMailMessageSchema.safeParse(JSON.parse(mailFixture));
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.id).toBe('mail-xyz789');
				expect(result.data.priority).toBe('high');
				expect(result.data.type).toBe('task');
				expect(result.data.read).toBe(false);
			}
		});

		it('accepts all valid mail priorities', () => {
			const priorities = ['low', 'normal', 'high', 'urgent'] as const;
			for (const priority of priorities) {
				const result = GtMailPrioritySchema.safeParse(priority);
				expect(result.success, `Priority "${priority}" should be valid`).toBe(true);
			}
		});

		it('accepts all valid mail types', () => {
			const types = ['task', 'scavenge', 'notification', 'reply'] as const;
			for (const type of types) {
				const result = GtMailTypeSchema.safeParse(type);
				expect(result.success, `Type "${type}" should be valid`).toBe(true);
			}
		});

		it('accepts all valid delivery modes', () => {
			const modes = ['queue', 'interrupt'] as const;
			for (const mode of modes) {
				const result = GtMailDeliverySchema.safeParse(mode);
				expect(result.success, `Delivery mode "${mode}" should be valid`).toBe(true);
			}
		});
	});

	describe('Extra fields (passthrough)', () => {
		it('allows extra fields in status', () => {
			const statusWithExtras = {
				...JSON.parse(statusFixture),
				extra_field: 'should be preserved',
				another_extra: 123
			};
			const result = GtStatusSchema.safeParse(statusWithExtras);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.extra_field).toBe('should be preserved');
				expect(result.data.another_extra).toBe(123);
			}
		});

		it('allows extra fields in bead', () => {
			const beadWithExtras = {
				...JSON.parse(beadFixture),
				custom_metadata: { key: 'value' }
			};
			const result = BdBeadSchema.safeParse(beadWithExtras);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.custom_metadata).toEqual({ key: 'value' });
			}
		});

		it('allows extra fields in nested objects', () => {
			const status = JSON.parse(statusFixture);
			status.overseer.extra_overseer_field = 'test';
			status.rigs[0].extra_rig_field = 42;
			const result = GtStatusSchema.safeParse(status);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.overseer.extra_overseer_field).toBe('test');
				expect(result.data.rigs[0].extra_rig_field).toBe(42);
			}
		});
	});
});

// =============================================================================
// Invalid Input Tests
// =============================================================================

describe('CLI Contracts - Invalid Inputs', () => {
	describe('Missing required fields', () => {
		it('rejects status without name', () => {
			const invalid = {
				location: '/path',
				overseer: {
					name: 'User',
					email: 'user@example.com',
					username: 'user',
					source: 'git',
					unread_mail: 0
				},
				agents: [],
				rigs: []
			};
			const result = GtStatusSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it('rejects status without overseer', () => {
			const invalid = {
				name: 'test',
				location: '/path',
				agents: [],
				rigs: []
			};
			const result = GtStatusSchema.safeParse(invalid);
			expect(result.success).toBe(false);
		});

		it('rejects bead without id', () => {
			const bead = JSON.parse(beadFixture);
			delete bead.id;
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(false);
		});

		it('rejects bead without title', () => {
			const bead = JSON.parse(beadFixture);
			delete bead.title;
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(false);
		});

		it('rejects convoy without tracked_issues', () => {
			const convoy = JSON.parse(convoyFixture);
			delete convoy.tracked_issues;
			const result = GtConvoySchema.safeParse(convoy);
			expect(result.success).toBe(false);
		});

		it('rejects mail without subject', () => {
			const mail = JSON.parse(mailFixture);
			delete mail.subject;
			const result = GtMailMessageSchema.safeParse(mail);
			expect(result.success).toBe(false);
		});
	});

	describe('Wrong types', () => {
		it('rejects string for unread_mail count', () => {
			const status = JSON.parse(statusFixture);
			status.overseer.unread_mail = 'three';
			const result = GtStatusSchema.safeParse(status);
			expect(result.success).toBe(false);
		});

		it('rejects number for running boolean', () => {
			const status = JSON.parse(statusFixture);
			status.agents[0].running = 1;
			const result = GtStatusSchema.safeParse(status);
			expect(result.success).toBe(false);
		});

		it('rejects string for priority number', () => {
			const bead = JSON.parse(beadFixture);
			bead.priority = 'high';
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(false);
		});

		it('rejects object for labels array', () => {
			const bead = JSON.parse(beadFixture);
			bead.labels = { tag: 'auth' };
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(false);
		});

		it('rejects string for completed count', () => {
			const convoy = JSON.parse(convoyFixture);
			convoy.completed = '5';
			const result = GtConvoySchema.safeParse(convoy);
			expect(result.success).toBe(false);
		});

		it('rejects number for read boolean', () => {
			const mail = JSON.parse(mailFixture);
			mail.read = 0;
			const result = GtMailMessageSchema.safeParse(mail);
			expect(result.success).toBe(false);
		});
	});

	describe('Invalid enum values', () => {
		it('rejects invalid bead status', () => {
			const bead = JSON.parse(beadFixture);
			bead.status = 'pending';
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(false);
		});

		it('rejects invalid convoy status', () => {
			const convoy = JSON.parse(convoyFixture);
			convoy.status = 'active';
			const result = GtConvoySchema.safeParse(convoy);
			expect(result.success).toBe(false);
		});

		it('rejects invalid work status', () => {
			const convoy = JSON.parse(convoyFixture);
			convoy.work_status = 'pending';
			const result = GtConvoySchema.safeParse(convoy);
			expect(result.success).toBe(false);
		});

		it('rejects invalid mail priority', () => {
			const mail = JSON.parse(mailFixture);
			mail.priority = 'critical';
			const result = GtMailMessageSchema.safeParse(mail);
			expect(result.success).toBe(false);
		});

		it('rejects invalid mail type', () => {
			const mail = JSON.parse(mailFixture);
			mail.type = 'alert';
			const result = GtMailMessageSchema.safeParse(mail);
			expect(result.success).toBe(false);
		});

		it('rejects invalid delivery mode', () => {
			const mail = JSON.parse(mailFixture);
			mail.delivery = 'immediate';
			const result = GtMailMessageSchema.safeParse(mail);
			expect(result.success).toBe(false);
		});
	});

	describe('Out of range values', () => {
		it('rejects negative unread_mail', () => {
			const status = JSON.parse(statusFixture);
			status.overseer.unread_mail = -1;
			const result = GtStatusSchema.safeParse(status);
			expect(result.success).toBe(false);
		});

		it('rejects priority above 4', () => {
			const bead = JSON.parse(beadFixture);
			bead.priority = 5;
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(false);
		});

		it('rejects negative priority', () => {
			const bead = JSON.parse(beadFixture);
			bead.priority = -1;
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(false);
		});

		it('rejects non-integer priority', () => {
			const bead = JSON.parse(beadFixture);
			bead.priority = 1.5;
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(false);
		});
	});

	describe('Detailed error messages', () => {
		it('provides path in error for nested field', () => {
			const status = JSON.parse(statusFixture);
			status.overseer.unread_mail = 'invalid';
			const result = GtStatusSchema.safeParse(status);
			expect(result.success).toBe(false);
			if (!result.success) {
				const paths = result.error.issues.map((i) => i.path.join('.'));
				expect(paths.some((p) => p.includes('overseer'))).toBe(true);
			}
		});

		it('provides clear message for invalid enum', () => {
			const result = BdBeadStatusSchema.safeParse('invalid_status');
			expect(result.success).toBe(false);
			if (!result.success) {
				const message = result.error.issues[0].message;
				expect(message).toBeDefined();
				expect(message.length).toBeGreaterThan(0);
			}
		});

		it('provides path for array element errors', () => {
			const status = JSON.parse(statusFixture);
			status.agents[0].running = 'yes';
			const result = GtStatusSchema.safeParse(status);
			expect(result.success).toBe(false);
			if (!result.success) {
				const paths = result.error.issues.map((i) => i.path.join('.'));
				expect(paths.some((p) => p.includes('agents') && p.includes('0'))).toBe(true);
			}
		});
	});
});

// =============================================================================
// Edge Case Tests
// =============================================================================

describe('CLI Contracts - Edge Cases', () => {
	describe('Empty arrays', () => {
		it('allows empty agents array', () => {
			const status = JSON.parse(statusFixture);
			status.agents = [];
			const result = GtStatusSchema.safeParse(status);
			expect(result.success).toBe(true);
		});

		it('allows empty rigs array', () => {
			const status = JSON.parse(statusFixture);
			status.rigs = [];
			const result = GtStatusSchema.safeParse(status);
			expect(result.success).toBe(true);
		});

		it('allows empty labels array', () => {
			const bead = JSON.parse(beadFixture);
			bead.labels = [];
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(true);
		});

		it('allows empty tracked_issues array', () => {
			const convoy = JSON.parse(convoyFixture);
			convoy.tracked_issues = [];
			const result = GtConvoySchema.safeParse(convoy);
			expect(result.success).toBe(true);
		});

		it('allows empty children array', () => {
			const bead = JSON.parse(beadFixture);
			bead.children = [];
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(true);
		});
	});

	describe('Null values', () => {
		it('allows null crews array', () => {
			const status = JSON.parse(statusFixture);
			expect(status.rigs[0].crews).toBeNull();
			const result = GtStatusSchema.safeParse(status);
			expect(result.success).toBe(true);
		});

		it('allows null assignee', () => {
			const bead = JSON.parse(beadFixture);
			bead.assignee = null;
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(true);
		});

		it('allows null parent_id', () => {
			const bead = JSON.parse(beadFixture);
			bead.parent_id = null;
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(true);
		});

		it('allows null reply_to', () => {
			const mail = JSON.parse(mailFixture);
			mail.reply_to = null;
			const result = GtMailMessageSchema.safeParse(mail);
			expect(result.success).toBe(true);
		});

		it('allows null thread_id', () => {
			const mail = JSON.parse(mailFixture);
			mail.thread_id = null;
			const result = GtMailMessageSchema.safeParse(mail);
			expect(result.success).toBe(true);
		});
	});

	describe('Unicode strings', () => {
		it('handles unicode in bead title', () => {
			const result = BdBeadSchema.safeParse(JSON.parse(unicodeBeadFixture));
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.title).toContain('国际化');
				expect(result.data.title).toContain('🌍');
			}
		});

		it('handles unicode in description', () => {
			const result = BdBeadSchema.safeParse(JSON.parse(unicodeBeadFixture));
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.description).toContain('日本語');
				expect(result.data.description).toContain('العربية');
			}
		});

		it('handles unicode in labels', () => {
			const result = BdBeadSchema.safeParse(JSON.parse(unicodeBeadFixture));
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.labels).toContain('国際化');
				expect(result.data.labels).toContain('🌍');
			}
		});

		it('handles unicode in created_by', () => {
			const result = BdBeadSchema.safeParse(JSON.parse(unicodeBeadFixture));
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.created_by).toBe('田中太郎');
			}
		});

		it('handles emoji in strings', () => {
			const mail = JSON.parse(mailFixture);
			mail.subject = '🚀 Launch day! 🎉';
			mail.body = 'Emoji test: 💯 ✅ ❌ ⚠️';
			const result = GtMailMessageSchema.safeParse(mail);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.subject).toBe('🚀 Launch day! 🎉');
			}
		});
	});

	describe('Optional fields', () => {
		it('allows missing state in agent', () => {
			const status = JSON.parse(statusFixture);
			delete status.agents[0].state;
			const result = GtStatusSchema.safeParse(status);
			expect(result.success).toBe(true);
		});

		it('allows missing first_subject in agent', () => {
			const status = JSON.parse(statusFixture);
			delete status.agents[0].first_subject;
			const result = GtStatusSchema.safeParse(status);
			expect(result.success).toBe(true);
		});

		it('allows missing summary in status', () => {
			const status = JSON.parse(statusFixture);
			delete status.summary;
			const result = GtStatusSchema.safeParse(status);
			expect(result.success).toBe(true);
		});

		it('allows missing description in convoy', () => {
			const convoy = JSON.parse(convoyFixture);
			delete convoy.description;
			const result = GtConvoySchema.safeParse(convoy);
			expect(result.success).toBe(true);
		});

		it('allows missing children in bead', () => {
			const bead = JSON.parse(beadFixture);
			delete bead.children;
			const result = BdBeadSchema.safeParse(bead);
			expect(result.success).toBe(true);
		});
	});
});

// =============================================================================
// Parse Helper Tests
// =============================================================================

describe('CLI Contracts - Parse Helpers', () => {
	describe('parseCliOutput', () => {
		it('returns success with data for valid JSON', () => {
			const result = parseCliOutput(GtStatusSchema, statusFixture);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.name).toBe('gastown');
			}
		});

		it('returns error for invalid JSON syntax', () => {
			const result = parseCliOutput(GtStatusSchema, '{ invalid json }');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain('JSON parse error');
			}
		});

		it('returns error for schema validation failure', () => {
			const invalidJson = JSON.stringify({ name: 'test' });
			const result = parseCliOutput(GtStatusSchema, invalidJson);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain('Validation failed');
			}
		});

		it('includes field path in validation error', () => {
			const invalidStatus = { ...JSON.parse(statusFixture) };
			invalidStatus.overseer.unread_mail = 'not a number';
			const result = parseCliOutput(GtStatusSchema, JSON.stringify(invalidStatus));
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain('overseer');
			}
		});
	});

	describe('parseCliOutputOrThrow', () => {
		it('returns data for valid JSON', () => {
			const data = parseCliOutputOrThrow(BdBeadSchema, beadFixture);
			expect(data.id).toBe('gu-amx');
			expect(data.title).toBe('Implement user authentication');
		});

		it('throws for invalid JSON syntax', () => {
			expect(() => parseCliOutputOrThrow(BdBeadSchema, 'not json')).toThrow('JSON parse error');
		});

		it('throws for schema validation failure', () => {
			const invalidJson = JSON.stringify({ id: 'test' });
			expect(() => parseCliOutputOrThrow(BdBeadSchema, invalidJson)).toThrow('Validation failed');
		});

		it('includes field path in thrown error', () => {
			const invalidBead = { ...JSON.parse(beadFixture), priority: 'high' };
			expect(() => parseCliOutputOrThrow(BdBeadSchema, JSON.stringify(invalidBead))).toThrow('priority');
		});
	});
});

// =============================================================================
// Component Schema Tests
// =============================================================================

describe('CLI Contracts - Component Schemas', () => {
	describe('GtOverseerSchema', () => {
		it('validates overseer independently', () => {
			const overseer = {
				name: 'Test User',
				email: 'test@example.com',
				username: 'testuser',
				source: 'git',
				unread_mail: 5
			};
			const result = GtOverseerSchema.safeParse(overseer);
			expect(result.success).toBe(true);
		});

		it('rejects overseer with missing email', () => {
			const overseer = {
				name: 'Test User',
				username: 'testuser',
				source: 'git',
				unread_mail: 0
			};
			const result = GtOverseerSchema.safeParse(overseer);
			expect(result.success).toBe(false);
		});
	});

	describe('GtAgentSummarySchema', () => {
		it('validates agent summary independently', () => {
			const agent = {
				name: 'test-agent',
				address: 'rig/polecats/test-agent',
				session: 'sess_123',
				role: 'polecat',
				running: true,
				has_work: false,
				unread_mail: 0
			};
			const result = GtAgentSummarySchema.safeParse(agent);
			expect(result.success).toBe(true);
		});
	});

	describe('GtHookInfoSchema', () => {
		it('validates hook info independently', () => {
			const hook = {
				agent: 'furiosa',
				role: 'polecat',
				has_work: true
			};
			const result = GtHookInfoSchema.safeParse(hook);
			expect(result.success).toBe(true);
		});
	});

	describe('GtRigInfoSchema', () => {
		it('validates rig info independently', () => {
			const rig = {
				name: 'testrig',
				polecats: ['agent1', 'agent2'],
				polecat_count: 2,
				crews: null,
				crew_count: 0,
				has_witness: false,
				has_refinery: false,
				hooks: [],
				agents: []
			};
			const result = GtRigInfoSchema.safeParse(rig);
			expect(result.success).toBe(true);
		});
	});

	describe('GtTrackedIssueSchema', () => {
		it('validates tracked issue independently', () => {
			const issue = {
				id: 'gu-123',
				title: 'Test issue',
				status: 'open',
				assignee: null,
				priority: 2
			};
			const result = GtTrackedIssueSchema.safeParse(issue);
			expect(result.success).toBe(true);
		});
	});
});
