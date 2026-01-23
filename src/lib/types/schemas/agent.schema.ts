/**
 * Agent Zod Validation Schemas
 *
 * Runtime validation schemas for agent and polecat-related types. These schemas
 * use passthrough() for forward compatibility with evolving CLI output.
 *
 * @module agent-schemas
 */

import { z } from 'zod';

// =============================================================================
// Agent State Schemas
// =============================================================================

/**
 * Polecat operational state - from gastown (internal/polecat/types.go)
 * IMPORTANT: There is NO idle state. Polecats spawn, work, and get nuked.
 */
export const PolecatStateSchema = z.enum(['working', 'done', 'stuck']);

/** Agent display status - for UI rendering */
export const AgentDisplayStatusSchema = z.enum(['running', 'completing', 'stuck', 'exited']);

/** Cleanup status - for worktree management */
export const CleanupStatusSchema = z.enum([
	'clean',
	'has_uncommitted',
	'has_stash',
	'has_unpushed',
	'unknown'
]);

/**
 * @deprecated Use PolecatStateSchema. Removed 'idle' - there is no idle state.
 */
export const GtAgentStatusSchema = z.enum([
	'active',
	'busy',
	'parked',
	'stuck',
	'orphaned'
]);

/** Agent health enum */
export const GtAgentHealthSchema = z.enum(['healthy', 'warning', 'critical']);

// =============================================================================
// Agent Object Schemas
// =============================================================================

/** Hook info schema */
export const GtHookInfoSchema = z
	.object({
		agent: z.string(),
		role: z.string(),
		has_work: z.boolean()
	})
	.passthrough();

/** Agent summary schema (in status response) */
export const GtAgentSummarySchema = z
	.object({
		name: z.string(),
		address: z.string(),
		session: z.string(),
		role: z.string(),
		running: z.boolean(),
		has_work: z.boolean(),
		state: GtAgentStatusSchema.optional(),
		unread_mail: z.number()
	})
	.passthrough();

/** Detailed agent schema */
export const GtAgentSchema = z
	.object({
		name: z.string(),
		id: z.string(),
		status: GtAgentStatusSchema,
		session_id: z.string(),
		rig: z.string(),
		worktree: z.string(),
		branch: z.string().optional(),
		last_activity: z.string(),
		last_activity_ago: z.string(),
		current_task: z.string().optional(),
		current_molecule: z.string().optional(),
		health: GtAgentHealthSchema
	})
	.passthrough();

// =============================================================================
// Type Inference Helpers
// =============================================================================

/** Infer TypeScript types from Zod schemas */
export type GtAgentInferred = z.infer<typeof GtAgentSchema>;
