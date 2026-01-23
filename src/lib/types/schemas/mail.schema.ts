/**
 * Mail Zod Validation Schemas
 *
 * Runtime validation schemas for mail-related types. These schemas
 * use passthrough() for forward compatibility with evolving CLI output.
 *
 * @module mail-schemas
 */

import { z } from 'zod';

// =============================================================================
// Mail Schemas
// =============================================================================

/** Mail priority enum */
export const GtMailPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

/** Mail type enum */
export const GtMailTypeSchema = z.enum(['task', 'scavenge', 'notification', 'reply']);

/** Mail delivery enum */
export const GtMailDeliverySchema = z.enum(['queue', 'interrupt']);

/** Mail message schema */
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
		thread_id: z.string().optional(),
		reply_to: z.string().optional(),
		pinned: z.boolean(),
		wisp: z.boolean()
	})
	.passthrough();

// =============================================================================
// Type Inference Helpers
// =============================================================================

/** Infer TypeScript types from Zod schemas */
export type GtMailMessageInferred = z.infer<typeof GtMailMessageSchema>;
