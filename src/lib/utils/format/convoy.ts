/**
 * Convoy status derivation utilities
 *
 * Convoy storage status is 'open' | 'closed' (same as beads).
 * Work status is DERIVED from tracked issues, not stored.
 */

export type ConvoyStorageStatus = 'open' | 'closed';

export type ConvoyWorkStatus = 'active' | 'stale' | 'stuck' | 'waiting' | 'complete';

export const CONVOY_WORK_STATUSES: readonly ConvoyWorkStatus[] = [
	'active',
	'stale',
	'stuck',
	'waiting',
	'complete'
] as const;

export const CONVOY_STALENESS_THRESHOLD_HOURS = 24;

const VALID_STORAGE_STATUSES = new Set<string>(['open', 'closed']);
const VALID_WORK_STATUSES = new Set<string>(CONVOY_WORK_STATUSES);

export interface TrackedIssue {
	id: string;
	status: 'open' | 'closed';
	assignee?: string;
	isStuck?: boolean;
}

export interface DeriveConvoyStatusInput {
	trackedIssues: TrackedIssue[];
	updatedAt: string;
	stalenessThresholdHours?: number;
}

export function isValidConvoyStorageStatus(value: string): value is ConvoyStorageStatus {
	return VALID_STORAGE_STATUSES.has(value);
}

export function isValidConvoyWorkStatus(value: string): value is ConvoyWorkStatus {
	return VALID_WORK_STATUSES.has(value);
}

export function deriveConvoyWorkStatus(input: DeriveConvoyStatusInput): ConvoyWorkStatus {
	const { trackedIssues, updatedAt, stalenessThresholdHours = CONVOY_STALENESS_THRESHOLD_HOURS } =
		input;

	if (trackedIssues.length === 0) {
		return 'waiting';
	}

	const allClosed = trackedIssues.every((issue) => issue.status === 'closed');
	if (allClosed) {
		return 'complete';
	}

	const hasStuck = trackedIssues.some((issue) => issue.isStuck === true);
	if (hasStuck) {
		return 'stuck';
	}

	const hasAssignee = trackedIssues.some((issue) => issue.assignee);
	if (hasAssignee) {
		return 'active';
	}

	const lastUpdate = new Date(updatedAt);
	const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);

	if (hoursSinceUpdate > stalenessThresholdHours) {
		return 'stale';
	}

	return 'active';
}
