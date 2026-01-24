/**
 * Shared status configuration utilities for Gas Town UI
 * Consolidates duplicated status/severity configs across pages
 */

// =============================================================================
// Convoy Status
// =============================================================================

/**
 * Convoy work status - DERIVED from tracked issues, not stored.
 * Storage status is only 'open' | 'closed' per gastown contract.
 * Work status is computed by deriveConvoyWorkStatus() in format/convoy.ts
 */
export type ConvoyStatus = 'active' | 'stale' | 'stuck' | 'waiting' | 'complete';

export interface ConvoyStatusConfig {
	color: 'success' | 'warning' | 'error' | 'default';
	indicatorStatus: 'running' | 'idle' | 'error' | 'complete';
	label: string;
	borderClass: string;
	bgClass: string;
}

export const convoyStatusConfig: Record<ConvoyStatus, ConvoyStatusConfig> = {
	active: {
		color: 'success',
		indicatorStatus: 'running',
		label: 'Active',
		borderClass: 'border-success/30',
		bgClass: 'bg-success/10 text-success'
	},
	waiting: {
		color: 'default',
		indicatorStatus: 'idle',
		label: 'Waiting',
		borderClass: 'border-muted/30',
		bgClass: 'bg-muted/10 text-muted-foreground'
	},
	stale: {
		color: 'warning',
		indicatorStatus: 'idle',
		label: 'Stale',
		borderClass: 'border-warning/30',
		bgClass: 'bg-warning/10 text-warning'
	},
	stuck: {
		color: 'error',
		indicatorStatus: 'error',
		label: 'Stuck',
		borderClass: 'border-destructive/30',
		bgClass: 'bg-destructive/10 text-destructive'
	},
	complete: {
		color: 'success',
		indicatorStatus: 'complete',
		label: 'Complete',
		borderClass: 'border-success/30',
		bgClass: 'bg-success/10 text-success'
	}
};

export function getConvoyStatusConfig(status: ConvoyStatus): ConvoyStatusConfig {
	return convoyStatusConfig[status];
}

// =============================================================================
// Bead Status Derivation
// =============================================================================

import type {
	BdBeadStorageStatus,
	BdBeadDisplayStatus,
	BdBead
} from '$lib/types/gastown';

/**
 * Input for status derivation - minimal bead fields needed
 * Allows partial bead objects for flexibility
 */
export interface BeadStatusContext {
	/** Storage status from gastown ('open' | 'closed') */
	status: BdBeadStorageStatus | string;
	/** Whether bead is pinned to an agent's hook */
	hook_bead?: boolean;
	/** Count of unresolved blocking dependencies */
	blocked_by_count?: number;
	/** Assignee working on this bead */
	assignee?: string;
}

/**
 * MR (Merge Request) status - matches gastown internal/refinery/types.go
 *
 * Lifecycle: open → in_progress → closed
 * NOTE: 'merged' is a CloseReason, not a status
 */
export type MRStatus = 'open' | 'in_progress' | 'closed';

/**
 * MR close reason - WHY the MR was closed (only relevant when status='closed')
 * Matches gastown CloseReason constants
 */
export type MRCloseReason = 'merged' | 'rejected' | 'conflict' | 'superseded';

/**
 * MR failure types for error handling in UI
 * Matches refinery failure categories
 */
export type MRFailureType =
	| 'conflict'
	| 'tests_fail'
	| 'build_fail'
	| 'flaky_test'
	| 'push_fail'
	| 'fetch_fail'
	| 'checkout_fail';

/**
 * Derive display status from storage status + context
 *
 * IMPORTANT: Gastown only stores 'open' or 'closed'.
 * Display statuses like 'in_progress' and 'blocked' are DERIVED.
 *
 * Derivation rules (in order of precedence):
 * 1. status='closed' → 'closed'
 * 2. hook_bead=true → 'hooked'
 * 3. blocked_by_count > 0 → 'blocked'
 * 4. has assignee OR mrStatus='in_progress' → 'in_progress'
 * 5. default → 'open'
 *
 * @param bead - Bead or partial bead with status context
 * @param mrStatus - Optional MR status for this bead
 * @returns Derived display status for UI presentation
 */
export function deriveDisplayStatus(
	bead: BeadStatusContext | BdBead,
	mrStatus?: MRStatus
): BdBeadDisplayStatus {
	// 1. Closed beads stay closed
	if (bead.status === 'closed') {
		return 'closed';
	}

	// 2. Hooked beads show as hooked (pinned to agent hook)
	if ('hook_bead' in bead && bead.hook_bead) {
		return 'hooked';
	}

	// 3. Blocked by unresolved dependencies
	if ('blocked_by_count' in bead && bead.blocked_by_count && bead.blocked_by_count > 0) {
		return 'blocked';
	}

	// 4. Has active work (assignee or MR in progress)
	if (mrStatus === 'in_progress' || ('assignee' in bead && bead.assignee)) {
		return 'in_progress';
	}

	// 5. Default: open
	return 'open';
}

/**
 * Check if a bead is actionable (can be worked on)
 * A bead is actionable if it's open and not blocked
 */
export function isBeadActionable(bead: BeadStatusContext | BdBead): boolean {
	const displayStatus = deriveDisplayStatus(bead);
	return displayStatus === 'open' || displayStatus === 'in_progress';
}

/**
 * Check if a bead is blocked
 */
export function isBeadBlocked(bead: BeadStatusContext | BdBead): boolean {
	return deriveDisplayStatus(bead) === 'blocked';
}

// =============================================================================
// Issue Status (Display Configuration)
// =============================================================================

export type IssueStatus = 'open' | 'in_progress' | 'blocked' | 'completed' | 'closed';

export interface IssueStatusConfig {
	indicatorStatus: 'running' | 'idle' | 'error' | 'warning' | 'complete';
	label: string;
	bgClass: string;
	borderClass: string;
}

export const issueStatusConfig: Record<IssueStatus, IssueStatusConfig> = {
	open: {
		indicatorStatus: 'warning',
		label: 'Open',
		bgClass: 'bg-warning/10 text-warning',
		borderClass: 'border-warning/30'
	},
	in_progress: {
		indicatorStatus: 'running',
		label: 'In Progress',
		bgClass: 'bg-info/10 text-info',
		borderClass: 'border-info/30'
	},
	blocked: {
		indicatorStatus: 'error',
		label: 'Blocked',
		bgClass: 'bg-destructive/10 text-destructive',
		borderClass: 'border-destructive/30'
	},
	completed: {
		indicatorStatus: 'complete',
		label: 'Completed',
		bgClass: 'bg-success/10 text-success',
		borderClass: 'border-success/30'
	},
	closed: {
		indicatorStatus: 'complete',
		label: 'Closed',
		bgClass: 'bg-muted/50 text-muted-foreground',
		borderClass: 'border-muted'
	}
};

export function getIssueStatusConfig(status: IssueStatus): IssueStatusConfig {
	return issueStatusConfig[status];
}

export function getIssueStatusBg(status: IssueStatus): string {
	return issueStatusConfig[status].bgClass;
}

export function getIssueStatusColor(status: string): string {
	switch (status) {
		case 'in_progress':
			return 'text-status-online';
		case 'closed':
			return 'text-muted-foreground';
		case 'blocked':
			return 'text-status-offline';
		case 'unknown':
			return 'text-muted-foreground/50';
		default:
			return 'text-status-idle';
	}
}

export function getIssueStatusBgSimple(status: string): string {
	switch (status) {
		case 'in_progress':
			return 'bg-success/10';
		case 'closed':
			return 'bg-muted/50';
		case 'blocked':
			return 'bg-destructive/10';
		default:
			return 'bg-warning/10';
	}
}

// =============================================================================
// Escalation Severity
// =============================================================================

export type EscalationSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface EscalationSeverityConfig {
	bg: string;
	text: string;
	badge: string;
	border: string;
	icon: string;
}

export const escalationSeverityConfig: Record<EscalationSeverity, EscalationSeverityConfig> = {
	CRITICAL: {
		bg: 'bg-destructive/10',
		text: 'text-destructive',
		badge: 'bg-destructive text-destructive-foreground',
		border: 'border-destructive/30',
		icon: '!!'
	},
	HIGH: {
		bg: 'bg-warning/10',
		text: 'text-warning',
		badge: 'bg-warning text-warning-foreground',
		border: 'border-warning/30',
		icon: '!'
	},
	MEDIUM: {
		bg: 'bg-status-pending/10',
		text: 'text-status-pending',
		badge: 'bg-status-pending text-black',
		border: 'border-status-pending/30',
		icon: '?'
	},
	LOW: {
		bg: 'bg-muted/20',
		text: 'text-muted-foreground',
		badge: 'bg-muted text-muted-foreground',
		border: 'border-muted',
		icon: '-'
	}
};

export function getEscalationSeverityConfig(severity: EscalationSeverity): EscalationSeverityConfig {
	return escalationSeverityConfig[severity];
}

// =============================================================================
// Priority Labels (for issues)
// =============================================================================

export interface PriorityConfig {
	label: string;
	class: string;
}

export const priorityLabels: Record<number, PriorityConfig> = {
	0: { label: 'P0 Critical', class: 'text-destructive bg-destructive/10' },
	1: { label: 'P1 High', class: 'text-warning bg-warning/10' },
	2: { label: 'P2 Medium', class: 'text-warning/80 bg-warning/10' },
	3: { label: 'P3 Low', class: 'text-info bg-info/10' },
	4: { label: 'P4 Backlog', class: 'text-muted-foreground bg-muted' }
};

export function getPriorityConfig(priority: number): PriorityConfig {
	return priorityLabels[priority] ?? priorityLabels[4];
}

// =============================================================================
// Utility functions
// =============================================================================

export function formatWorkerName(worker: string): string {
	const parts = worker.split('/');
	return parts[parts.length - 1];
}

export function formatAgent(agent: string): string {
	const parts = agent.split('/');
	return parts[parts.length - 1];
}
