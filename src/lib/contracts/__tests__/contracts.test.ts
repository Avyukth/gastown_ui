/**
 * Tests for canonical gastown contract modules
 *
 * These contracts define the source of truth for domain types:
 * - Storage vs Display status patterns
 * - Validation functions
 * - Constants for valid values
 */

import { describe, it, expect } from 'vitest';

// =============================================================================
// Bead Contract Tests
// =============================================================================

import {
	BEAD_STORAGE_STATUSES,
	BEAD_DISPLAY_STATUSES,
	isValidBeadStorageStatus,
	isValidBeadDisplayStatus,
	type BeadStorageStatus,
	type BeadDisplayStatus
} from '../bead';

describe('bead contract', () => {
	describe('BEAD_STORAGE_STATUSES', () => {
		it('contains only open and closed', () => {
			expect(BEAD_STORAGE_STATUSES).toContain('open');
			expect(BEAD_STORAGE_STATUSES).toContain('closed');
			expect(BEAD_STORAGE_STATUSES).toHaveLength(2);
		});
	});

	describe('BEAD_DISPLAY_STATUSES', () => {
		it('contains all five display statuses', () => {
			expect(BEAD_DISPLAY_STATUSES).toContain('open');
			expect(BEAD_DISPLAY_STATUSES).toContain('in_progress');
			expect(BEAD_DISPLAY_STATUSES).toContain('blocked');
			expect(BEAD_DISPLAY_STATUSES).toContain('hooked');
			expect(BEAD_DISPLAY_STATUSES).toContain('closed');
			expect(BEAD_DISPLAY_STATUSES).toHaveLength(5);
		});
	});

	describe('isValidBeadStorageStatus', () => {
		it('returns true for open', () => {
			expect(isValidBeadStorageStatus('open')).toBe(true);
		});

		it('returns true for closed', () => {
			expect(isValidBeadStorageStatus('closed')).toBe(true);
		});

		it('returns false for display-only statuses', () => {
			expect(isValidBeadStorageStatus('in_progress')).toBe(false);
			expect(isValidBeadStorageStatus('blocked')).toBe(false);
			expect(isValidBeadStorageStatus('hooked')).toBe(false);
		});

		it('returns false for invalid strings', () => {
			expect(isValidBeadStorageStatus('invalid')).toBe(false);
			expect(isValidBeadStorageStatus('')).toBe(false);
		});
	});

	describe('isValidBeadDisplayStatus', () => {
		it('returns true for all display statuses', () => {
			expect(isValidBeadDisplayStatus('open')).toBe(true);
			expect(isValidBeadDisplayStatus('in_progress')).toBe(true);
			expect(isValidBeadDisplayStatus('blocked')).toBe(true);
			expect(isValidBeadDisplayStatus('hooked')).toBe(true);
			expect(isValidBeadDisplayStatus('closed')).toBe(true);
		});

		it('returns false for invalid strings', () => {
			expect(isValidBeadDisplayStatus('invalid')).toBe(false);
			expect(isValidBeadDisplayStatus('')).toBe(false);
		});
	});
});

// =============================================================================
// Mail Contract Tests
// =============================================================================

import {
	MAIL_PRIORITIES,
	MAIL_TYPES,
	MAIL_DELIVERY_MODES,
	isValidMailPriority,
	isValidMailType,
	isValidMailDelivery,
	isValidMailAddress,
	type MailPriority,
	type MailType,
	type MailDelivery
} from '../mail';

describe('mail contract', () => {
	describe('MAIL_PRIORITIES', () => {
		it('contains all four priority levels', () => {
			expect(MAIL_PRIORITIES).toContain('urgent');
			expect(MAIL_PRIORITIES).toContain('high');
			expect(MAIL_PRIORITIES).toContain('normal');
			expect(MAIL_PRIORITIES).toContain('low');
			expect(MAIL_PRIORITIES).toHaveLength(4);
		});
	});

	describe('MAIL_TYPES', () => {
		it('contains all message types', () => {
			expect(MAIL_TYPES).toContain('task');
			expect(MAIL_TYPES).toContain('scavenge');
			expect(MAIL_TYPES).toContain('notification');
			expect(MAIL_TYPES).toContain('reply');
			expect(MAIL_TYPES).toHaveLength(4);
		});
	});

	describe('MAIL_DELIVERY_MODES', () => {
		it('contains queue and interrupt', () => {
			expect(MAIL_DELIVERY_MODES).toContain('queue');
			expect(MAIL_DELIVERY_MODES).toContain('interrupt');
			expect(MAIL_DELIVERY_MODES).toHaveLength(2);
		});
	});

	describe('isValidMailPriority', () => {
		it('returns true for valid priorities', () => {
			expect(isValidMailPriority('urgent')).toBe(true);
			expect(isValidMailPriority('high')).toBe(true);
			expect(isValidMailPriority('normal')).toBe(true);
			expect(isValidMailPriority('low')).toBe(true);
		});

		it('returns false for invalid priorities', () => {
			expect(isValidMailPriority('critical')).toBe(false);
			expect(isValidMailPriority('')).toBe(false);
		});
	});

	describe('isValidMailType', () => {
		it('returns true for valid types', () => {
			expect(isValidMailType('task')).toBe(true);
			expect(isValidMailType('scavenge')).toBe(true);
			expect(isValidMailType('notification')).toBe(true);
			expect(isValidMailType('reply')).toBe(true);
		});

		it('returns false for invalid types', () => {
			expect(isValidMailType('email')).toBe(false);
			expect(isValidMailType('')).toBe(false);
		});
	});

	describe('isValidMailDelivery', () => {
		it('returns true for queue', () => {
			expect(isValidMailDelivery('queue')).toBe(true);
		});

		it('returns true for interrupt', () => {
			expect(isValidMailDelivery('interrupt')).toBe(true);
		});

		it('returns false for invalid modes', () => {
			expect(isValidMailDelivery('immediate')).toBe(false);
			expect(isValidMailDelivery('')).toBe(false);
		});
	});

	describe('isValidMailAddress', () => {
		it('returns true for overseer', () => {
			expect(isValidMailAddress('overseer')).toBe(true);
		});

		it('returns true for town-level agents', () => {
			expect(isValidMailAddress('mayor/')).toBe(true);
			expect(isValidMailAddress('witness/')).toBe(true);
			expect(isValidMailAddress('deacon/')).toBe(true);
		});

		it('returns true for rig/agent addresses', () => {
			expect(isValidMailAddress('gastownui/furiosa')).toBe(true);
			expect(isValidMailAddress('gastownui/refinery')).toBe(true);
		});

		it('returns false for empty string', () => {
			expect(isValidMailAddress('')).toBe(false);
		});
	});
});

// =============================================================================
// Polecat Contract Tests
// =============================================================================

import {
	POLECAT_STATES,
	POLECAT_DISPLAY_STATUSES,
	isValidPolecatState,
	isValidPolecatDisplayStatus,
	polecatStateToDisplayStatus,
	type PolecatState,
	type PolecatDisplayStatus
} from '../polecat';

describe('polecat contract', () => {
	describe('POLECAT_STATES', () => {
		it('contains working, done, stuck (NO idle)', () => {
			expect(POLECAT_STATES).toContain('working');
			expect(POLECAT_STATES).toContain('done');
			expect(POLECAT_STATES).toContain('stuck');
			expect(POLECAT_STATES).toHaveLength(3);
		});

		it('does NOT contain idle', () => {
			expect(POLECAT_STATES).not.toContain('idle');
		});
	});

	describe('POLECAT_DISPLAY_STATUSES', () => {
		it('contains running, completing, stuck, exited', () => {
			expect(POLECAT_DISPLAY_STATUSES).toContain('running');
			expect(POLECAT_DISPLAY_STATUSES).toContain('completing');
			expect(POLECAT_DISPLAY_STATUSES).toContain('stuck');
			expect(POLECAT_DISPLAY_STATUSES).toContain('exited');
			expect(POLECAT_DISPLAY_STATUSES).toHaveLength(4);
		});
	});

	describe('isValidPolecatState', () => {
		it('returns true for valid states', () => {
			expect(isValidPolecatState('working')).toBe(true);
			expect(isValidPolecatState('done')).toBe(true);
			expect(isValidPolecatState('stuck')).toBe(true);
		});

		it('returns false for idle (deprecated)', () => {
			expect(isValidPolecatState('idle')).toBe(false);
		});

		it('returns false for invalid states', () => {
			expect(isValidPolecatState('invalid')).toBe(false);
			expect(isValidPolecatState('')).toBe(false);
		});
	});

	describe('isValidPolecatDisplayStatus', () => {
		it('returns true for all display statuses', () => {
			expect(isValidPolecatDisplayStatus('running')).toBe(true);
			expect(isValidPolecatDisplayStatus('completing')).toBe(true);
			expect(isValidPolecatDisplayStatus('stuck')).toBe(true);
			expect(isValidPolecatDisplayStatus('exited')).toBe(true);
		});

		it('returns false for invalid statuses', () => {
			expect(isValidPolecatDisplayStatus('idle')).toBe(false);
			expect(isValidPolecatDisplayStatus('')).toBe(false);
		});
	});

	describe('polecatStateToDisplayStatus', () => {
		it('maps working to running', () => {
			expect(polecatStateToDisplayStatus('working')).toBe('running');
		});

		it('maps done to completing', () => {
			expect(polecatStateToDisplayStatus('done')).toBe('completing');
		});

		it('maps stuck to stuck', () => {
			expect(polecatStateToDisplayStatus('stuck')).toBe('stuck');
		});

		it('throws for invalid state', () => {
			expect(() => polecatStateToDisplayStatus('idle' as PolecatState)).toThrow(
				'Invalid polecat state: idle'
			);
		});
	});
});

// =============================================================================
// Refinery Contract Tests
// =============================================================================

import {
	MR_STATUSES,
	MR_CLOSE_REASONS,
	MR_FAILURE_TYPES,
	isValidMRStatus,
	isValidMRCloseReason,
	isValidMRFailureType,
	type MRStatus,
	type MRCloseReason,
	type MRFailureType
} from '../refinery';

describe('refinery contract', () => {
	describe('MR_STATUSES', () => {
		it('contains open, in_progress, closed', () => {
			expect(MR_STATUSES).toContain('open');
			expect(MR_STATUSES).toContain('in_progress');
			expect(MR_STATUSES).toContain('closed');
			expect(MR_STATUSES).toHaveLength(3);
		});
	});

	describe('MR_CLOSE_REASONS', () => {
		it('contains merged, rejected, conflict, superseded', () => {
			expect(MR_CLOSE_REASONS).toContain('merged');
			expect(MR_CLOSE_REASONS).toContain('rejected');
			expect(MR_CLOSE_REASONS).toContain('conflict');
			expect(MR_CLOSE_REASONS).toContain('superseded');
			expect(MR_CLOSE_REASONS).toHaveLength(4);
		});
	});

	describe('MR_FAILURE_TYPES', () => {
		it('contains all failure types', () => {
			expect(MR_FAILURE_TYPES).toContain('conflict');
			expect(MR_FAILURE_TYPES).toContain('tests_fail');
			expect(MR_FAILURE_TYPES).toContain('build_fail');
			expect(MR_FAILURE_TYPES).toContain('flaky_test');
			expect(MR_FAILURE_TYPES).toContain('push_fail');
			expect(MR_FAILURE_TYPES).toContain('fetch_fail');
			expect(MR_FAILURE_TYPES).toContain('checkout_fail');
			expect(MR_FAILURE_TYPES).toHaveLength(7);
		});
	});

	describe('isValidMRStatus', () => {
		it('returns true for valid statuses', () => {
			expect(isValidMRStatus('open')).toBe(true);
			expect(isValidMRStatus('in_progress')).toBe(true);
			expect(isValidMRStatus('closed')).toBe(true);
		});

		it('returns false for merged (its a close reason, not status)', () => {
			expect(isValidMRStatus('merged')).toBe(false);
		});

		it('returns false for invalid statuses', () => {
			expect(isValidMRStatus('invalid')).toBe(false);
			expect(isValidMRStatus('')).toBe(false);
		});
	});

	describe('isValidMRCloseReason', () => {
		it('returns true for valid close reasons', () => {
			expect(isValidMRCloseReason('merged')).toBe(true);
			expect(isValidMRCloseReason('rejected')).toBe(true);
			expect(isValidMRCloseReason('conflict')).toBe(true);
			expect(isValidMRCloseReason('superseded')).toBe(true);
		});

		it('returns false for invalid reasons', () => {
			expect(isValidMRCloseReason('cancelled')).toBe(false);
			expect(isValidMRCloseReason('')).toBe(false);
		});
	});

	describe('isValidMRFailureType', () => {
		it('returns true for all failure types', () => {
			expect(isValidMRFailureType('conflict')).toBe(true);
			expect(isValidMRFailureType('tests_fail')).toBe(true);
			expect(isValidMRFailureType('build_fail')).toBe(true);
			expect(isValidMRFailureType('flaky_test')).toBe(true);
			expect(isValidMRFailureType('push_fail')).toBe(true);
			expect(isValidMRFailureType('fetch_fail')).toBe(true);
			expect(isValidMRFailureType('checkout_fail')).toBe(true);
		});

		it('returns false for invalid types', () => {
			expect(isValidMRFailureType('timeout')).toBe(false);
			expect(isValidMRFailureType('')).toBe(false);
		});
	});
});

// =============================================================================
// Convoy Contract Tests
// =============================================================================

import {
	CONVOY_STORAGE_STATUSES,
	CONVOY_WORK_STATUSES,
	isValidConvoyStorageStatus,
	isValidConvoyWorkStatus,
	type ConvoyStorageStatus,
	type ConvoyWorkStatus
} from '../convoy';

describe('convoy contract', () => {
	describe('CONVOY_STORAGE_STATUSES', () => {
		it('contains only open and closed', () => {
			expect(CONVOY_STORAGE_STATUSES).toContain('open');
			expect(CONVOY_STORAGE_STATUSES).toContain('closed');
			expect(CONVOY_STORAGE_STATUSES).toHaveLength(2);
		});
	});

	describe('CONVOY_WORK_STATUSES', () => {
		it('contains all five work statuses', () => {
			expect(CONVOY_WORK_STATUSES).toContain('active');
			expect(CONVOY_WORK_STATUSES).toContain('stale');
			expect(CONVOY_WORK_STATUSES).toContain('stuck');
			expect(CONVOY_WORK_STATUSES).toContain('waiting');
			expect(CONVOY_WORK_STATUSES).toContain('complete');
			expect(CONVOY_WORK_STATUSES).toHaveLength(5);
		});
	});

	describe('isValidConvoyStorageStatus', () => {
		it('returns true for open', () => {
			expect(isValidConvoyStorageStatus('open')).toBe(true);
		});

		it('returns true for closed', () => {
			expect(isValidConvoyStorageStatus('closed')).toBe(true);
		});

		it('returns false for work statuses', () => {
			expect(isValidConvoyStorageStatus('active')).toBe(false);
			expect(isValidConvoyStorageStatus('stale')).toBe(false);
		});

		it('returns false for invalid strings', () => {
			expect(isValidConvoyStorageStatus('invalid')).toBe(false);
			expect(isValidConvoyStorageStatus('')).toBe(false);
		});
	});

	describe('isValidConvoyWorkStatus', () => {
		it('returns true for all work statuses', () => {
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
});

// =============================================================================
// Barrel Export Tests
// =============================================================================

import * as contracts from '../index';

describe('contracts barrel export', () => {
	it('exports bead contract', () => {
		expect(contracts.BEAD_STORAGE_STATUSES).toBeDefined();
		expect(contracts.BEAD_DISPLAY_STATUSES).toBeDefined();
		expect(contracts.isValidBeadStorageStatus).toBeDefined();
		expect(contracts.isValidBeadDisplayStatus).toBeDefined();
	});

	it('exports mail contract', () => {
		expect(contracts.MAIL_PRIORITIES).toBeDefined();
		expect(contracts.MAIL_TYPES).toBeDefined();
		expect(contracts.MAIL_DELIVERY_MODES).toBeDefined();
		expect(contracts.isValidMailPriority).toBeDefined();
		expect(contracts.isValidMailType).toBeDefined();
		expect(contracts.isValidMailDelivery).toBeDefined();
		expect(contracts.isValidMailAddress).toBeDefined();
	});

	it('exports polecat contract', () => {
		expect(contracts.POLECAT_STATES).toBeDefined();
		expect(contracts.POLECAT_DISPLAY_STATUSES).toBeDefined();
		expect(contracts.isValidPolecatState).toBeDefined();
		expect(contracts.isValidPolecatDisplayStatus).toBeDefined();
		expect(contracts.polecatStateToDisplayStatus).toBeDefined();
	});

	it('exports refinery contract', () => {
		expect(contracts.MR_STATUSES).toBeDefined();
		expect(contracts.MR_CLOSE_REASONS).toBeDefined();
		expect(contracts.MR_FAILURE_TYPES).toBeDefined();
		expect(contracts.isValidMRStatus).toBeDefined();
		expect(contracts.isValidMRCloseReason).toBeDefined();
		expect(contracts.isValidMRFailureType).toBeDefined();
	});

	it('exports convoy contract', () => {
		expect(contracts.CONVOY_STORAGE_STATUSES).toBeDefined();
		expect(contracts.CONVOY_WORK_STATUSES).toBeDefined();
		expect(contracts.isValidConvoyStorageStatus).toBeDefined();
		expect(contracts.isValidConvoyWorkStatus).toBeDefined();
	});
});
