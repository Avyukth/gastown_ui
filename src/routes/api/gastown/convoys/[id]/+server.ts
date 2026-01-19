/**
 * Convoy Detail API Endpoint
 *
 * Retrieves individual convoy details by ID including tracked issues.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';
import { identifyKnownBug, getErrorCategory } from '$lib/errors/known-bugs';

interface BdBead {
	id: string;
	title: string;
	description: string;
	status: string;
	priority: number;
	issue_type: string;
	assignee?: string;
	created_at: string;
	created_by: string;
	updated_at: string;
	labels?: string[];
	dependents?: Array<{
		id: string;
		title: string;
		status: string;
		priority: number;
		issue_type: string;
		assignee?: string;
		dependency_type: string;
	}>;
	dependencies?: Array<{
		id: string;
		title: string;
		status: string;
		priority: number;
		issue_type: string;
		assignee?: string;
		dependency_type: string;
	}>;
}

interface TrackedIssue {
	id: string;
	title: string;
	status: string;
	priority: number;
	type: string;
	assignee: string | null;
}

interface ConvoyDetail {
	id: string;
	title: string;
	description: string;
	status: string;
	priority: number;
	assignee: string | null;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	labels: string[];
	trackedIssues: TrackedIssue[];
	blockedBy: TrackedIssue[];
	progress: {
		total: number;
		completed: number;
		inProgress: number;
		blocked: number;
		percentage: number;
	};
}

function computeProgress(issues: TrackedIssue[]): ConvoyDetail['progress'] {
	const total = issues.length;
	const completed = issues.filter((i) => i.status === 'closed' || i.status === 'done').length;
	const inProgress = issues.filter((i) => i.status === 'in_progress').length;
	const blocked = issues.filter((i) => i.status === 'blocked').length;
	const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

	return { total, completed, inProgress, blocked, percentage };
}

function transformBead(bead: BdBead): ConvoyDetail {
	const trackedIssues: TrackedIssue[] = (bead.dependencies || [])
		.filter((d) => d.dependency_type === 'depends_on')
		.map((d) => ({
			id: d.id,
			title: d.title,
			status: d.status,
			priority: d.priority,
			type: d.issue_type,
			assignee: d.assignee || null
		}));

	const blockedBy: TrackedIssue[] = (bead.dependents || [])
		.filter((d) => d.dependency_type === 'blocks')
		.map((d) => ({
			id: d.id,
			title: d.title,
			status: d.status,
			priority: d.priority,
			type: d.issue_type,
			assignee: d.assignee || null
		}));

	return {
		id: bead.id,
		title: bead.title,
		description: bead.description || '',
		status: bead.status,
		priority: bead.priority,
		assignee: bead.assignee || null,
		createdAt: bead.created_at,
		updatedAt: bead.updated_at,
		createdBy: bead.created_by,
		labels: bead.labels || [],
		trackedIssues,
		blockedBy,
		progress: computeProgress(trackedIssues)
	};
}

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;
	const requestId = randomUUID();

	if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
		return json({ error: 'Invalid convoy ID' }, { status: 400 });
	}

	const supervisor = getProcessSupervisor();
	const result = await supervisor.bd<BdBead[]>(['show', id, '--json'], { timeout: 10_000 });

	if (!result.success) {
		const errorMessage = result.error || 'Unknown error';

		if (errorMessage.includes('no issue found') || errorMessage.includes('not found')) {
			return json({ error: 'Convoy not found' }, { status: 404 });
		}

		const knownBug = identifyKnownBug(errorMessage);
		if (knownBug) {
			console.error(`[${requestId}] Known issue fetching convoy ${id}:`, knownBug.userMessage);
			return json(
				{
					error: knownBug.userMessage,
					workaround: knownBug.workaround,
					category: knownBug.category
				},
				{ status: 500 }
			);
		}

		const errorInfo = getErrorCategory(errorMessage);
		console.error(`[${requestId}] Failed to fetch convoy ${id}:`, errorMessage);
		return json(
			{
				error: errorInfo.defaultMessage,
				details: errorMessage,
				category: errorInfo.category
			},
			{ status: 500 }
		);
	}

	const beads = result.data;

	if (!beads || beads.length === 0) {
		return json({ error: 'Convoy not found' }, { status: 404 });
	}

	const bead = beads[0];

	if (bead.issue_type !== 'convoy') {
		return json({ error: 'Not a convoy' }, { status: 400 });
	}

	const convoy = transformBead(bead);

	return json({
		convoy,
		fetchedAt: new Date().toISOString()
	});
};
