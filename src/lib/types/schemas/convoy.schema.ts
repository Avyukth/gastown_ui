/**
 * Convoy Zod Validation Schemas
 *
 * Runtime validation schemas for convoy-related types. These schemas
 * use passthrough() for forward compatibility with evolving CLI output.
 *
 * @module convoy-schemas
 */

import { z } from 'zod';

// =============================================================================
// Convoy Schemas
// =============================================================================

/** Convoy work status enum */
export const GtConvoyWorkStatusSchema = z.enum([
	'complete',
	'active',
	'stale',
	'stuck',
	'waiting'
]);

/** Convoy status enum */
export const GtConvoyStatusSchema = z.enum(['open', 'closed']);

/** Tracked issue schema */
export const GtTrackedIssueSchema = z
	.object({
		id: z.string(),
		title: z.string(),
		status: z.string(),
		assignee: z.string().optional(),
		priority: z.number()
	})
	.passthrough();

/** Convoy list item schema (from gt convoy list --json) */
export const GtConvoyListItemSchema = z
	.object({
		id: z.string(),
		title: z.string(),
		status: GtConvoyStatusSchema,
		created_at: z.string()
	})
	.passthrough();

/** Convoy schema (full detail) */
export const GtConvoySchema = z
	.object({
		id: z.string(),
		title: z.string(),
		description: z.string().optional(),
		status: GtConvoyStatusSchema,
		work_status: GtConvoyWorkStatusSchema,
		progress: z.string(),
		completed: z.number(),
		total: z.number(),
		created_at: z.string(),
		updated_at: z.string(),
		tracked_issues: z.array(GtTrackedIssueSchema)
	})
	.passthrough();

// =============================================================================
// Type Inference Helpers
// =============================================================================

/** Infer TypeScript types from Zod schemas */
export type GtConvoyInferred = z.infer<typeof GtConvoySchema>;
