/**
 * Work Components Validation Schemas
 *
 * Zod schemas for validating work-related forms.
 */
import { z } from 'zod';

/**
 * Issue validation schema
 */
export const issueSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters'),
	type: z.enum(['task', 'bug', 'feature', 'epic']),
	priority: z.number().min(0).max(4)
});

export type IssueFormData = z.infer<typeof issueSchema>;

/**
 * Convoy validation schema
 */
export const convoySchema = z.object({
	name: z.string().min(3, 'Convoy name must be at least 3 characters'),
	issues: z.array(z.string()).min(1, 'Select at least one issue')
});

export type ConvoyFormData = z.infer<typeof convoySchema>;

/**
 * Sling validation schema
 */
export const slingSchema = z.object({
	issue: z.string().min(1, 'Issue is required'),
	rig: z.string().min(1, 'Rig is required')
});

export type SlingFormData = z.infer<typeof slingSchema>;
