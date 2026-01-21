/**
 * CLI Contracts - Type-safe definitions for Gas Town CLI commands
 * Architecture Decision: D0.6 - CLI Contracts
 *
 * This module provides:
 * 1. TypeScript interfaces for CLI input configuration
 * 2. Zod schemas for runtime validation of CLI output
 */

import { z } from 'zod';

export type CLICommand = 'gt' | 'bd';

export interface CLIResult<T = unknown> {
	success: boolean;
	data: T | null;
	error: string | null;
	exitCode: number;
	duration: number;
	command: string;
}

export interface CLICommandConfig {
	command: CLICommand;
	args: string[];
	timeout?: number;
	cwd?: string;
	dedupe?: boolean;
}

export interface ProcessSupervisorConfig {
	defaultTimeout: number;
	maxConcurrency: number;
	circuitBreakerThreshold: number;
	circuitBreakerResetTime: number;
}

export const DEFAULT_CONFIG: ProcessSupervisorConfig = {
	defaultTimeout: 30_000,
	maxConcurrency: 4,
	circuitBreakerThreshold: 5,
	circuitBreakerResetTime: 60_000
};

export interface CapabilitiesResult {
	gtVersion: string | null;
	bdVersion: string | null;
	features: {
		jsonOutput: boolean;
		mail: boolean;
		work: boolean;
		convoys: boolean;
		workflows: boolean;
	};
	available: boolean;
	error: string | null;
}

export interface QueuedRequest {
	id: string;
	config: CLICommandConfig;
	resolve: (result: CLIResult) => void;
	reject: (error: Error) => void;
	enqueuedAt: number;
}

// =============================================================================
// CLI Output Schemas (Zod)
// =============================================================================

/**
 * Overseer (human user) information from `gt status --json`
 */
export const GtOverseerSchema = z
	.object({
		name: z.string(),
		email: z.string(),
		username: z.string(),
		source: z.string(),
		unread_mail: z.number().int().min(0)
	})
	.passthrough();

export type GtOverseer = z.infer<typeof GtOverseerSchema>;

/**
 * Hook information for a rig
 */
export const GtHookInfoSchema = z
	.object({
		agent: z.string(),
		role: z.string(),
		has_work: z.boolean()
	})
	.passthrough();

export type GtHookInfo = z.infer<typeof GtHookInfoSchema>;

/**
 * Agent summary in status response
 */
export const GtAgentSummarySchema = z
	.object({
		name: z.string(),
		address: z.string(),
		session: z.string(),
		role: z.string(),
		running: z.boolean(),
		has_work: z.boolean(),
		state: z.string().optional(),
		unread_mail: z.number().int().min(0),
		first_subject: z.string().optional()
	})
	.passthrough();

export type GtAgentSummary = z.infer<typeof GtAgentSummarySchema>;

/**
 * Rig info with agents and hooks from `gt status --json`
 */
export const GtRigInfoSchema = z
	.object({
		name: z.string(),
		polecats: z.array(z.string()),
		polecat_count: z.number().int().min(0),
		crews: z.array(z.string()).nullable(),
		crew_count: z.number().int().min(0),
		has_witness: z.boolean(),
		has_refinery: z.boolean(),
		hooks: z.array(GtHookInfoSchema),
		agents: z.array(GtAgentSummarySchema)
	})
	.passthrough();

export type GtRigInfo = z.infer<typeof GtRigInfoSchema>;

/**
 * Summary statistics from `gt status --json`
 */
export const GtStatusSummarySchema = z
	.object({
		rig_count: z.number().int().min(0),
		polecat_count: z.number().int().min(0),
		crew_count: z.number().int().min(0),
		witness_count: z.number().int().min(0),
		refinery_count: z.number().int().min(0),
		active_agents: z.number().int().min(0)
	})
	.passthrough();

export type GtStatusSummary = z.infer<typeof GtStatusSummarySchema>;

/**
 * Overall Gas Town status response from `gt status --json`
 */
export const GtStatusSchema = z
	.object({
		name: z.string(),
		location: z.string(),
		overseer: GtOverseerSchema,
		agents: z.array(GtAgentSummarySchema),
		rigs: z.array(GtRigInfoSchema),
		summary: GtStatusSummarySchema.optional()
	})
	.passthrough();

export type GtStatus = z.infer<typeof GtStatusSchema>;

/**
 * Bead status values
 */
export const BdBeadStatusSchema = z.enum(['open', 'in_progress', 'closed', 'hooked']);

export type BdBeadStatus = z.infer<typeof BdBeadStatusSchema>;

/**
 * Bead (work item) from `bd list --json` or `bd show --json`
 */
export const BdBeadSchema = z
	.object({
		id: z.string(),
		title: z.string(),
		description: z.string(),
		status: BdBeadStatusSchema,
		priority: z.number().int().min(0).max(4),
		issue_type: z.string(),
		assignee: z.string().nullable().optional(),
		created_at: z.string(),
		created_by: z.string(),
		updated_at: z.string(),
		labels: z.array(z.string()),
		ephemeral: z.boolean(),
		parent_id: z.string().nullable().optional(),
		children: z.array(z.string()).optional()
	})
	.passthrough();

export type BdBead = z.infer<typeof BdBeadSchema>;

/**
 * Convoy work status values
 */
export const GtConvoyWorkStatusSchema = z.enum(['complete', 'active', 'stale', 'stuck', 'waiting']);

export type GtConvoyWorkStatus = z.infer<typeof GtConvoyWorkStatusSchema>;

/**
 * Convoy status values
 */
export const GtConvoyStatusSchema = z.enum(['open', 'closed']);

export type GtConvoyStatus = z.infer<typeof GtConvoyStatusSchema>;

/**
 * Tracked issue within a convoy
 */
export const GtTrackedIssueSchema = z
	.object({
		id: z.string(),
		title: z.string(),
		status: z.string(),
		assignee: z.string().nullable().optional(),
		priority: z.number().int().min(0).max(4)
	})
	.passthrough();

export type GtTrackedIssue = z.infer<typeof GtTrackedIssueSchema>;

/**
 * Convoy (work group) from `gt convoy list --json`
 */
export const GtConvoySchema = z
	.object({
		id: z.string(),
		title: z.string(),
		description: z.string().optional(),
		status: GtConvoyStatusSchema,
		work_status: GtConvoyWorkStatusSchema,
		progress: z.string(),
		completed: z.number().int().min(0),
		total: z.number().int().min(0),
		created_at: z.string(),
		updated_at: z.string(),
		tracked_issues: z.array(GtTrackedIssueSchema)
	})
	.passthrough();

export type GtConvoy = z.infer<typeof GtConvoySchema>;

/**
 * Mail priority levels
 */
export const GtMailPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

export type GtMailPriority = z.infer<typeof GtMailPrioritySchema>;

/**
 * Mail message types
 */
export const GtMailTypeSchema = z.enum(['task', 'scavenge', 'notification', 'reply']);

export type GtMailType = z.infer<typeof GtMailTypeSchema>;

/**
 * Mail delivery modes
 */
export const GtMailDeliverySchema = z.enum(['queue', 'interrupt']);

export type GtMailDelivery = z.infer<typeof GtMailDeliverySchema>;

/**
 * Mail message from `gt mail inbox --json`
 */
export const GtMailMessageSchema = z
	.object({
		id: z.string(),
		from: z.string(),
		to: z.string(),
		subject: z.string(),
		body: z.string(),
		timestamp: z.string(),
		read: z.boolean(),
		priority: GtMailPrioritySchema,
		type: GtMailTypeSchema,
		delivery: GtMailDeliverySchema,
		thread_id: z.string().nullable().optional(),
		reply_to: z.string().nullable().optional(),
		pinned: z.boolean(),
		wisp: z.boolean()
	})
	.passthrough();

export type GtMailMessage = z.infer<typeof GtMailMessageSchema>;

// =============================================================================
// Validation Helpers for CLI Output
// =============================================================================

/**
 * Safely parse CLI JSON output with schema validation
 * @param schema - Zod schema to validate against
 * @param jsonString - Raw JSON string from CLI output
 * @returns Validated data or error
 */
export function parseCliOutput<T>(
	schema: z.ZodSchema<T>,
	jsonString: string
): { success: true; data: T } | { success: false; error: string } {
	try {
		const parsed = JSON.parse(jsonString);
		const result = schema.safeParse(parsed);
		if (result.success) {
			return { success: true, data: result.data };
		}
		const errorMessages = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
		return { success: false, error: `Validation failed: ${errorMessages}` };
	} catch (e) {
		return { success: false, error: `JSON parse error: ${e instanceof Error ? e.message : String(e)}` };
	}
}

/**
 * Parse CLI output and throw on failure
 * @param schema - Zod schema to validate against
 * @param jsonString - Raw JSON string from CLI output
 * @throws Error with detailed message if parsing or validation fails
 */
export function parseCliOutputOrThrow<T>(schema: z.ZodSchema<T>, jsonString: string): T {
	const result = parseCliOutput(schema, jsonString);
	if (result.success === false) {
		throw new Error(result.error);
	}
	return result.data;
}
