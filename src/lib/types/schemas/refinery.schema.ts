/**
 * Refinery Zod Validation Schemas
 *
 * Runtime validation schemas for merge request and queue-related types. These schemas
 * use passthrough() for forward compatibility with evolving CLI output.
 *
 * @module refinery-schemas
 */

import { z } from 'zod';

// =============================================================================
// Queue Schemas
// =============================================================================

/**
 * MR status schema - matches gastown internal/refinery/types.go
 * Lifecycle: open -> in_progress -> closed
 */
export const GtMergeQueueStatusSchema = z.enum(['open', 'in_progress', 'closed']);

/**
 * MR close reason schema - WHY the MR was closed
 * Only relevant when status='closed'
 */
export const GtMergeQueueCloseReasonSchema = z.enum(['merged', 'rejected', 'conflict', 'superseded']);

/**
 * MR failure type schema for error handling
 */
export const GtMergeQueueFailureTypeSchema = z.enum([
	'conflict',
	'tests_fail',
	'build_fail',
	'flaky_test',
	'push_fail',
	'fetch_fail',
	'checkout_fail'
]);

/** CI status enum */
export const GtCIStatusSchema = z.enum(['pass', 'fail', 'pending']);

/** Mergeable status enum */
export const GtMergeableStatusSchema = z.enum(['ready', 'conflict', 'pending']);

/** Merge queue item schema */
export const GtMergeQueueItemSchema = z
	.object({
		id: z.string(),
		branch: z.string(),
		repo: z.string(),
		polecat: z.string(),
		rig: z.string(),
		status: GtMergeQueueStatusSchema,
		priority: z.number(),
		submitted_at: z.string(),
		ci_status: GtCIStatusSchema.optional(),
		mergeable: GtMergeableStatusSchema.optional(),
		close_reason: GtMergeQueueCloseReasonSchema.optional(),
		failure_type: GtMergeQueueFailureTypeSchema.optional()
	})
	.passthrough();

// =============================================================================
// Type Inference Helpers
// =============================================================================

/** Infer TypeScript types from Zod schemas */
export type GtMergeQueueItemInferred = z.infer<typeof GtMergeQueueItemSchema>;
