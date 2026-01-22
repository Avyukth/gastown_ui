/**
 * CLI Output Parsing Utilities
 *
 * IMPORTANT: CLI commands return ARRAYS, even for single items.
 * - `bd show <id>` returns: [{ item }] (array with one element)
 * - `bd list` returns: [{ item }, { item }, ...] (array)
 * - Empty result returns: [] (empty array, NOT null or error)
 *
 * These utilities handle array returns correctly.
 */

import { z } from 'zod';
import {
	BdBeadSchema,
	GtStatusSchema,
	GtConvoySchema,
	GtMailMessageSchema,
	type BdBead,
	type GtStatus,
	type GtConvoy,
	type GtMailMessage
} from './contracts';
import { GtMergeQueueItemSchema } from '$lib/types/gastown.schema';
import type { GtMergeQueueItem } from '$lib/types/gastown';

// =============================================================================
// Generic Parsing Utilities
// =============================================================================

export interface ParseSuccess<T> {
	success: true;
	data: T;
}

export interface ParseFailure {
	success: false;
	error: string;
}

export type ParseOutcome<T> = ParseSuccess<T> | ParseFailure;

/**
 * Parse CLI JSON output with schema validation
 * Handles both single objects and arrays
 */
export function parseCliJson<T>(
	schema: z.ZodSchema<T>,
	jsonString: string
): ParseOutcome<T> {
	try {
		const parsed = JSON.parse(jsonString);
		const result = schema.safeParse(parsed);
		if (result.success) {
			return { success: true, data: result.data };
		}
		const errorMessages = result.error.issues
			.map((e) => `${e.path.join('.')}: ${e.message}`)
			.join('; ');
		return { success: false, error: `Validation failed: ${errorMessages}` };
	} catch (e) {
		return {
			success: false,
			error: `JSON parse error: ${e instanceof Error ? e.message : String(e)}`
		};
	}
}

/**
 * Parse CLI output that returns an array, extract first element
 * Returns null if array is empty (not found)
 */
export function parseSingleFromArray<T>(
	itemSchema: z.ZodSchema<T>,
	jsonString: string
): ParseOutcome<T | null> {
	const arraySchema = z.array(itemSchema);
	const result = parseCliJson(arraySchema, jsonString);

	if (!result.success) {
		return { success: false, error: result.error };
	}

	// Empty array means not found
	if (result.data.length === 0) {
		return { success: true, data: null };
	}

	return { success: true, data: result.data[0] };
}

/**
 * Parse CLI output that returns an array
 * Returns empty array if not found
 */
export function parseArray<T>(
	itemSchema: z.ZodSchema<T>,
	jsonString: string
): ParseOutcome<T[]> {
	const arraySchema = z.array(itemSchema);
	return parseCliJson(arraySchema, jsonString);
}

// =============================================================================
// Bead-Specific Parsers
// =============================================================================

/**
 * Parse single bead from CLI output (e.g., `bd show <id>`)
 * CLI returns array even for single item queries
 */
export function parseSingleBead(jsonString: string): ParseOutcome<BdBead | null> {
	return parseSingleFromArray(BdBeadSchema, jsonString);
}

/**
 * Parse bead list from CLI output (e.g., `bd list`)
 */
export function parseBeadList(jsonString: string): ParseOutcome<BdBead[]> {
	return parseArray(BdBeadSchema, jsonString);
}

// =============================================================================
// Status-Specific Parsers
// =============================================================================

/**
 * Parse Gas Town status from CLI output (e.g., `gt status`)
 * Note: Status is typically a single object, not array
 */
export function parseGtStatus(jsonString: string): ParseOutcome<GtStatus> {
	return parseCliJson(GtStatusSchema, jsonString);
}

// =============================================================================
// Convoy-Specific Parsers
// =============================================================================

/**
 * Parse single convoy from CLI output
 */
export function parseSingleConvoy(jsonString: string): ParseOutcome<GtConvoy | null> {
	return parseSingleFromArray(GtConvoySchema, jsonString);
}

/**
 * Parse convoy list from CLI output
 */
export function parseConvoyList(jsonString: string): ParseOutcome<GtConvoy[]> {
	return parseArray(GtConvoySchema, jsonString);
}

// =============================================================================
// Mail-Specific Parsers
// =============================================================================

/**
 * Parse single mail message from CLI output
 */
export function parseSingleMail(jsonString: string): ParseOutcome<GtMailMessage | null> {
	return parseSingleFromArray(GtMailMessageSchema, jsonString);
}

/**
 * Parse mail list from CLI output (e.g., `gt mail inbox`)
 */
export function parseMailList(jsonString: string): ParseOutcome<GtMailMessage[]> {
	return parseArray(GtMailMessageSchema, jsonString);
}

// =============================================================================
// Queue-Specific Parsers
// =============================================================================

/**
 * Parse single merge queue item from CLI output
 */
export function parseSingleQueueItem(jsonString: string): ParseOutcome<GtMergeQueueItem | null> {
	return parseSingleFromArray(GtMergeQueueItemSchema, jsonString);
}

/**
 * Parse merge queue list from CLI output (e.g., `gt mq list`)
 */
export function parseQueueList(jsonString: string): ParseOutcome<GtMergeQueueItem[]> {
	return parseArray(GtMergeQueueItemSchema, jsonString);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if parse result indicates "not found" (empty array)
 */
export function isNotFound<T>(result: ParseOutcome<T | null>): result is ParseSuccess<null> {
	return result.success && result.data === null;
}

/**
 * Check if parse result is successful with data
 */
export function hasData<T>(result: ParseOutcome<T | null>): result is ParseSuccess<T> {
	return result.success && result.data !== null;
}

/**
 * Unwrap parse result or throw error
 */
export function unwrapOrThrow<T>(result: ParseOutcome<T>): T {
	if (!result.success) {
		throw new Error(result.error);
	}
	return result.data;
}

/**
 * Unwrap parse result or return default value
 */
export function unwrapOr<T>(result: ParseOutcome<T>, defaultValue: T): T {
	if (!result.success) {
		return defaultValue;
	}
	return result.data;
}
