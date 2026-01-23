/**
 * Priority conversion utilities
 *
 * Converts between bead integer priorities (0-4) and mail string priorities.
 * Centralizes priority formatting to eliminate inconsistent inline conversions.
 */

export type BeadPriority = 0 | 1 | 2 | 3 | 4;
export type MailPriority = 'urgent' | 'high' | 'normal' | 'low';

const BEAD_TO_MAIL: Record<BeadPriority, MailPriority> = {
	0: 'urgent',
	1: 'high',
	2: 'normal',
	3: 'low',
	4: 'low'
};

const MAIL_TO_BEAD: Record<MailPriority, BeadPriority> = {
	urgent: 0,
	high: 1,
	normal: 2,
	low: 3
};

const PRIORITY_DISPLAY: Record<BeadPriority, string> = {
	0: 'P0 Urgent',
	1: 'P1 High',
	2: 'P2 Normal',
	3: 'P3 Low',
	4: 'P4 Backlog'
};

const PRIORITY_SHORT: Record<BeadPriority, string> = {
	0: 'P0',
	1: 'P1',
	2: 'P2',
	3: 'P3',
	4: 'P4'
};

const VALID_MAIL_PRIORITIES = new Set<string>(['urgent', 'high', 'normal', 'low']);

export function isValidBeadPriority(value: number): value is BeadPriority {
	return Number.isInteger(value) && value >= 0 && value <= 4;
}

export function isValidMailPriority(value: string): value is MailPriority {
	return VALID_MAIL_PRIORITIES.has(value);
}

export function beadPriorityToMail(priority: BeadPriority): MailPriority {
	if (!isValidBeadPriority(priority)) {
		throw new Error(`Invalid bead priority: ${priority}`);
	}
	return BEAD_TO_MAIL[priority];
}

export function mailPriorityToBead(priority: MailPriority): BeadPriority {
	if (!isValidMailPriority(priority)) {
		throw new Error(`Invalid mail priority: ${priority}`);
	}
	return MAIL_TO_BEAD[priority];
}

export function formatPriorityDisplay(priority: BeadPriority): string {
	if (!isValidBeadPriority(priority)) {
		throw new Error(`Invalid bead priority: ${priority}`);
	}
	return PRIORITY_DISPLAY[priority];
}

export function formatPriorityShort(priority: BeadPriority): string {
	if (!isValidBeadPriority(priority)) {
		throw new Error(`Invalid bead priority: ${priority}`);
	}
	return PRIORITY_SHORT[priority];
}
