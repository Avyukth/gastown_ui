/**
 * Gas Town TypeScript Data Models
 *
 * Comprehensive type definitions for all CLI output types used across
 * the Gas Town UI. These types model the JSON output from gt and bd commands.
 *
 * @module gastown-types
 */

// =============================================================================
// Status Types
// =============================================================================

/** Overall Gas Town status response from `gt status --json` */
export interface GtStatus {
	name: string;
	location: string;
	overseer: GtOverseer;
	agents: GtAgentSummary[];
	rigs: GtRigInfo[];
}

/** Overseer (human user) information */
export interface GtOverseer {
	name: string;
	email: string;
	username: string;
	source: string;
	unread_mail: number;
}

/** Daemon status information */
export interface GtDaemonStatus {
	running: boolean;
	pid?: number;
	uptime?: string;
	version: string;
}

/**
 * Polecat operational state - from gastown source (internal/polecat/types.go)
 *
 * IMPORTANT: There is NO idle state. Polecats don't wait for work.
 * They spawn, work, and get nuked. "There is no idle pool."
 *
 * - 'working': Actively processing assigned work
 * - 'done': Completed work, cleaning up (transient)
 * - 'stuck': Needs help, cannot proceed
 */
export type PolecatState = 'working' | 'done' | 'stuck';

/**
 * Agent display status - for UI rendering
 * Derived from session state, not stored
 */
export type AgentDisplayStatus =
	| 'running' // Has active tmux session, state=working
	| 'completing' // state=done, cleaning up
	| 'stuck' // state=stuck, needs help
	| 'exited'; // No session found

/**
 * Cleanup status - for worktree management
 */
export type CleanupStatus =
	| 'clean' // Safe to remove
	| 'has_uncommitted' // Uncommitted changes
	| 'has_stash' // Stashed work
	| 'has_unpushed' // Unpushed commits (CRITICAL: do not nuke)
	| 'unknown';

/**
 * @deprecated Use PolecatState for polecat state, AgentDisplayStatus for UI
 * Kept for backward compatibility. Remove 'idle' from usage.
 */
export type GtAgentStatus = 'active' | 'busy' | 'parked' | 'stuck' | 'orphaned';

/** Agent health levels */
export type GtAgentHealth = 'healthy' | 'warning' | 'critical';

/**
 * Agent role type for UI styling (color-coded borders, icons)
 * Maps to gastown agent roles from `gt status --json`
 */
export type AgentRole = 'coordinator' | 'health-check' | 'witness' | 'refinery' | 'crew';

/**
 * Type guard to check if a string is a valid AgentRole
 */
export function isAgentRole(role: string | undefined): role is AgentRole {
	if (!role) return false;
	return ['coordinator', 'health-check', 'witness', 'refinery', 'crew'].includes(role);
}

/**
 * Safely convert a string to AgentRole, returns undefined for invalid values
 */
export function toAgentRole(role: string | undefined): AgentRole | undefined {
	return isAgentRole(role) ? role : undefined;
}

/** Agent summary in status response */
export interface GtAgentSummary {
	name: string;
	address: string;
	session: string;
	role: string;
	running: boolean;
	has_work: boolean;
	state?: GtAgentStatus;
	unread_mail: number;
}

/** Detailed agent information from `gt peek` or agent detail views */
export interface GtAgent {
	name: string;
	id: string;
	status: GtAgentStatus;
	session_id: string;
	rig: string;
	worktree: string;
	branch?: string;
	last_activity: string;
	last_activity_ago: string;
	current_task?: string;
	current_molecule?: string;
	health: GtAgentHealth;
}

/** Rig summary in status response */
export interface GtRigSummary {
	name: string;
	path: string;
	agents: number;
	active: number;
	docked: boolean;
}

/** Rig info with agents and hooks */
export interface GtRigInfo {
	name: string;
	polecats: string[];
	polecat_count: number;
	crews: string[];
	crew_count: number;
	has_witness: boolean;
	has_refinery: boolean;
	hooks: GtHookInfo[];
	agents: GtAgentSummary[];
}

/** Hook information for a rig */
export interface GtHookInfo {
	agent: string;
	role: string;
	has_work: boolean;
}

/** Queue summary information */
export interface GtQueueSummary {
	pending: number;
	in_progress: number;
	total: number;
}

// =============================================================================
// Convoy Types
// =============================================================================

/** Convoy work status values */
export type GtConvoyWorkStatus = 'complete' | 'active' | 'stale' | 'stuck' | 'waiting';

/** Convoy status values */
export type GtConvoyStatus = 'open' | 'closed';

/** Convoy list item from `gt convoy list --json` */
export interface GtConvoyListItem {
	id: string;
	title: string;
	status: GtConvoyStatus;
	created_at: string;
}

/** Convoy (work group) full detail */
export interface GtConvoy {
	id: string;
	title: string;
	description?: string;
	status: GtConvoyStatus;
	work_status: GtConvoyWorkStatus;
	progress: string;
	completed: number;
	total: number;
	created_at: string;
	updated_at: string;
	tracked_issues: GtTrackedIssue[];
}

/** Tracked issue within a convoy */
export interface GtTrackedIssue {
	id: string;
	title: string;
	status: string;
	assignee?: string;
	priority: number;
}

// =============================================================================
// Bead Types
// =============================================================================

/**
 * Bead STORAGE status - what gastown actually stores in beads.db
 * Source of truth: internal/beads/beads.go
 *
 * IMPORTANT: Gastown only stores 'open' or 'closed'.
 * Other statuses like 'in_progress', 'blocked' are DERIVED for display.
 */
export type BdBeadStorageStatus = 'open' | 'closed';

/**
 * Bead DISPLAY status - derived for UI presentation
 *
 * Derivation rules:
 * - 'open': status=open, no active MR, no blocking deps
 * - 'in_progress': status=open, has active MR or assignee working
 * - 'blocked': status=open, has unresolved blocking dependencies
 * - 'closed': status=closed
 * - 'hooked': status=open, pinned to agent hook (special)
 */
export type BdBeadDisplayStatus = 'open' | 'in_progress' | 'blocked' | 'closed' | 'hooked';

/**
 * @deprecated Use BdBeadStorageStatus for API responses, BdBeadDisplayStatus for UI
 * Kept for backward compatibility during migration (see bd-3jc)
 */
export type BdBeadStatus = BdBeadDisplayStatus;

/** Bead (work item) from `bd list` or `bd show` */
export interface BdBead {
	id: string;
	title: string;
	description: string;
	status: BdBeadStatus;
	priority: number;
	issue_type: string;
	assignee?: string;
	created_at: string;
	created_by: string;
	updated_at: string;
	labels?: string[];
	ephemeral?: boolean;
	parent_id?: string;
	children?: string[];
	dependency_count?: number;
	dependent_count?: number;
}

// =============================================================================
// Mail Types
// =============================================================================

/** Mail priority levels */
export type GtMailPriority = 'low' | 'normal' | 'high' | 'urgent';

/** Mail message types */
export type GtMailType = 'task' | 'scavenge' | 'notification' | 'reply';

/** Mail delivery modes */
export type GtMailDelivery = 'queue' | 'interrupt';

/** Mail message from `gt mail inbox` */
export interface GtMailMessage {
	id: string;
	from: string;
	to: string;
	subject: string;
	body: string;
	timestamp: string;
	read: boolean;
	priority: GtMailPriority;
	type: GtMailType;
	delivery: GtMailDelivery;
	thread_id?: string;
	reply_to?: string;
	pinned: boolean;
	wisp: boolean;
}

// =============================================================================
// Queue Types
// =============================================================================

/**
 * MR (Merge Request) status - matches gastown internal/refinery/types.go
 *
 * Lifecycle: open → in_progress → closed
 * - open: Queued, waiting to be processed
 * - in_progress: Currently being merged/tested
 * - closed: Done (check close_reason for outcome)
 */
export type GtMergeQueueStatus = 'open' | 'in_progress' | 'closed';

/**
 * MR close reason - WHY the MR was closed (only relevant when status='closed')
 * Matches gastown CloseReason constants from internal/refinery/types.go
 */
export type GtMergeQueueCloseReason = 'merged' | 'rejected' | 'conflict' | 'superseded';

/**
 * MR failure type for error handling
 * Matches refinery failure categories
 */
export type GtMergeQueueFailureType =
	| 'conflict'
	| 'tests_fail'
	| 'build_fail'
	| 'flaky_test'
	| 'push_fail'
	| 'fetch_fail'
	| 'checkout_fail';

/** CI status values */
export type GtCIStatus = 'pass' | 'fail' | 'pending';

/** Mergeable status values */
export type GtMergeableStatus = 'ready' | 'conflict' | 'pending';

/** Merge queue item from `gt mq list` */
export interface GtMergeQueueItem {
	id: string;
	branch: string;
	repo: string;
	polecat: string;
	rig: string;
	status: GtMergeQueueStatus;
	priority: number;
	submitted_at: string;
	ci_status?: GtCIStatus;
	mergeable?: GtMergeableStatus;
	/** Close reason - only present when status='closed' */
	close_reason?: GtMergeQueueCloseReason;
	/** Failure type - only present on failed merges */
	failure_type?: GtMergeQueueFailureType;
}

// =============================================================================
// Workflow Types
// =============================================================================

/** Formula parameter types */
export type GtFormulaParamType = 'string' | 'number' | 'boolean';

/** Formula from `gt formula list` */
export interface GtFormula {
	name: string;
	description: string;
	category: string;
	steps: GtFormulaStep[];
	parameters?: Record<string, GtFormulaParam>;
}

/** Formula step definition */
export interface GtFormulaStep {
	id: string;
	name: string;
	description?: string;
	required: boolean;
}

/** Formula parameter definition */
export interface GtFormulaParam {
	type: GtFormulaParamType;
	required: boolean;
	default?: unknown;
	description?: string;
}

/** Molecule status values */
export type GtMoleculeStatus = 'pending' | 'running' | 'completed' | 'failed';

/** Molecule step status values */
export type GtMoleculeStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

/** Molecule (running workflow instance) */
export interface GtMolecule {
	id: string;
	formula: string;
	status: GtMoleculeStatus;
	current_step?: string;
	steps: GtMoleculeStep[];
	started_at?: string;
	completed_at?: string;
	error?: string;
	agent?: string;
}

/** Molecule step progress */
export interface GtMoleculeStep {
	id: string;
	name: string;
	status: GtMoleculeStepStatus;
	started_at?: string;
	completed_at?: string;
}

// =============================================================================
// Health Types
// =============================================================================

/** Overall health status */
export type GtOverallHealth = 'healthy' | 'warning' | 'critical';

/** Individual check status */
export type GtCheckStatus = 'pass' | 'warn' | 'fail';

/** Doctor result from `gt doctor --json` */
export interface GtDoctorResult {
	overall: GtOverallHealth;
	checks: GtHealthCheck[];
	summary: {
		passed: number;
		warned: number;
		failed: number;
		total: number;
	};
}

/** Individual health check result */
export interface GtHealthCheck {
	name: string;
	category: string;
	status: GtCheckStatus;
	message: string;
	details?: string;
}

// =============================================================================
// Rig Types
// =============================================================================

/** Rig status values */
export type GtRigStatus = 'pending' | 'cloning' | 'active' | 'parked' | 'error';

/** Detailed rig information from `gt rig show` */
export interface GtRig {
	name: string;
	path: string;
	worktree_root: string;
	branch: string;
	remote: string;
	agents: GtRigAgent[];
	config: GtRigConfig;
	docked: boolean;
	status: GtRigStatus;
}

/** Rig agent information */
export interface GtRigAgent {
	name: string;
	role: string;
	status: string;
}

/** Rig configuration */
export interface GtRigConfig {
	main_branch: string;
	work_branch_prefix: string;
	auto_merge: boolean;
	require_review: boolean;
}

// =============================================================================
// Feed Types
// =============================================================================

/** Feed item types */
export type GtFeedItemType = 'agent_status' | 'merge' | 'mail' | 'convoy' | 'error' | 'system';

/** Feed item severity levels */
export type GtFeedSeverity = 'info' | 'warning' | 'error';

/** Feed item from activity stream */
export interface GtFeedItem {
	id: string;
	type: GtFeedItemType;
	timestamp: string;
	title: string;
	description?: string;
	agent?: string;
	rig?: string;
	severity: GtFeedSeverity;
}

// =============================================================================
// Sling Types
// =============================================================================

/** Sling target status */
export type GtSlingTargetStatus = 'idle' | 'busy' | 'parked';

/** Sling target for work assignment */
export interface SlingTarget {
	rig: string;
	agent: string;
	status: GtSlingTargetStatus;
	display: string;
}

// =============================================================================
// Snapshot Types (Composite)
// =============================================================================

/** Freshness metadata for cached responses */
export interface GtFreshness {
	fetchedAt: string;
	ttlMs: number;
}

/** Composite snapshot from `/api/gastown/snapshot` */
export interface GtSnapshot {
	status: GtStatus;
	mailCount: number;
	queueCount: number;
	recentActivity: GtFeedItem[];
	freshness: GtFreshness;
}

// =============================================================================
// Dashboard Snapshot Types (Coherent Data Fetch)
// =============================================================================

/** Rig snapshot status values */
export type RigSnapshotStatus = 'active' | 'idle';

/** Rig snapshot for dashboard */
export interface RigSnapshot {
	name: string;
	status: RigSnapshotStatus;
	polecats: number;
	has_witness: boolean;
	has_refinery: boolean;
	active_work: number;
}

/**
 * Polecat snapshot status - for dashboard display
 *
 * @deprecated Use PolecatState for actual state. There is NO 'idle' state.
 * 'running' maps to 'working', 'exited' for no session
 */
export type PolecatSnapshotStatus = 'running' | 'exited';

/** Polecat snapshot for dashboard */
export interface PolecatSnapshot {
	id: string;
	name: string;
	role: string;
	rig: string;
	status: PolecatSnapshotStatus;
	has_work: boolean;
	task?: string;
}

/** Convoy snapshot for dashboard */
export interface ConvoySnapshot {
	id: string;
	title: string;
	status: string;
	priority: number;
	issue_count?: number;
}

/** Activity snapshot for dashboard */
export interface ActivitySnapshot {
	id: string;
	title: string;
	type: string;
	status: string;
	updated_at: string;
}

/** Mail summary for dashboard */
export interface MailSummary {
	unread: number;
	total: number;
}

/** Dashboard queue summary */
export interface DashboardQueueSummary {
	pending: number;
	inProgress: number;
	total: number;
}

/** Dashboard health status values */
export type DashboardHealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/** Dashboard snapshot (coherent data fetch response) */
export interface GtDashboardSnapshot {
	rigs: RigSnapshot[];
	polecats: PolecatSnapshot[];
	convoys: ConvoySnapshot[];
	recent_activity: ActivitySnapshot[];
	mail: MailSummary;
	queue: DashboardQueueSummary;
	health: DashboardHealthStatus;
	fetchedAt: string;
	timestamp: string;
	requestId: string;
}

// =============================================================================
// API Error Types
// =============================================================================

/** Error categories for structured error handling */
export type ErrorCategory =
	| 'cli_error'
	| 'network_error'
	| 'timeout_error'
	| 'validation_error'
	| 'not_found'
	| 'unknown';

/** Structured API error response */
export interface ApiErrorResponse {
	error: {
		code: string;
		message: string;
		category: ErrorCategory;
		retryable: boolean;
		details?: Record<string, unknown>;
	};
}
