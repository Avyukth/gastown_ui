/**
 * Bead Zod Validation Schemas
 *
 * Runtime validation schemas for bead-related types. These schemas
 * use passthrough() for forward compatibility with evolving CLI output.
 *
 * @module bead-schemas
 */

import { z } from 'zod';

// =============================================================================
// Bead Schemas
// =============================================================================

/**
 * Bead STORAGE status - what gastown actually returns
 * Only 'open' or 'closed' - other statuses are DERIVED for UI display
 */
export const BdBeadStorageStatusSchema = z.enum(['open', 'closed']);

/**
 * Bead DISPLAY status - for UI presentation (derived from storage + context)
 */
export const BdBeadDisplayStatusSchema = z.enum([
	'open',
	'in_progress',
	'blocked',
	'closed',
	'hooked'
]);

/**
 * @deprecated Use BdBeadStorageStatusSchema for API validation
 * Accepts both storage AND display values for backward compatibility
 */
export const BdBeadStatusSchema = z.enum([
	'open',
	'in_progress',
	'blocked',
	'closed',
	'hooked'
]);

/** Bead schema */
export const BdBeadSchema = z
	.object({
		id: z.string(),
		title: z.string(),
		description: z.string(),
		status: BdBeadStatusSchema,
		priority: z.number(),
		issue_type: z.string(),
		assignee: z.string().optional(),
		created_at: z.string(),
		created_by: z.string(),
		updated_at: z.string(),
		labels: z.array(z.string()).optional(),
		ephemeral: z.boolean().optional(),
		parent_id: z.string().optional(),
		children: z.array(z.string()).optional(),
		dependency_count: z.number().optional(),
		dependent_count: z.number().optional()
	})
	.passthrough();

// =============================================================================
// Type Inference Helpers
// =============================================================================

/** Infer TypeScript types from Zod schemas */
export type BdBeadInferred = z.infer<typeof BdBeadSchema>;
