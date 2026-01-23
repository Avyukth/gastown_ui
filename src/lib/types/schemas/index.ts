/**
 * Schema Module Index
 *
 * Re-exports all domain-specific Zod schemas for convenient importing.
 *
 * @example
 * ```typescript
 * import { BdBeadSchema, GtMailMessageSchema } from '$lib/types/schemas';
 * ```
 *
 * @module schemas
 */

// Bead schemas
export {
	BdBeadStorageStatusSchema,
	BdBeadDisplayStatusSchema,
	BdBeadStatusSchema,
	BdBeadSchema,
	type BdBeadInferred
} from './bead.schema';

// Mail schemas
export {
	GtMailPrioritySchema,
	GtMailTypeSchema,
	GtMailDeliverySchema,
	GtMailMessageSchema,
	type GtMailMessageInferred
} from './mail.schema';

// Agent schemas
export {
	PolecatStateSchema,
	AgentDisplayStatusSchema,
	CleanupStatusSchema,
	GtAgentStatusSchema,
	GtAgentHealthSchema,
	GtHookInfoSchema,
	GtAgentSummarySchema,
	GtAgentSchema,
	type GtAgentInferred
} from './agent.schema';

// Convoy schemas
export {
	GtConvoyWorkStatusSchema,
	GtConvoyStatusSchema,
	GtTrackedIssueSchema,
	GtConvoyListItemSchema,
	GtConvoySchema,
	type GtConvoyInferred
} from './convoy.schema';

// Refinery schemas
export {
	GtMergeQueueStatusSchema,
	GtMergeQueueCloseReasonSchema,
	GtMergeQueueFailureTypeSchema,
	GtCIStatusSchema,
	GtMergeableStatusSchema,
	GtMergeQueueItemSchema,
	type GtMergeQueueItemInferred
} from './refinery.schema';
