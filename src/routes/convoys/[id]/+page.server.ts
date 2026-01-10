import { error } from '@sveltejs/kit';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import type { PageServerLoad } from './$types';

const execAsync = promisify(exec);

function getGtRoot(): string {
	if (process.env.GT_TOWN_ROOT) {
		return process.env.GT_TOWN_ROOT;
	}
	const cwd = process.cwd();
	return resolve(cwd, '..', '..', '..');
}

type ConvoyStatus = 'active' | 'stale' | 'stuck' | 'complete';
type IssueStatus = 'open' | 'in_progress' | 'closed' | 'blocked' | 'unknown';

interface TrackedIssue {
	id: string;
	title: string;
	status: IssueStatus;
	issue_type: string;
	assignee?: string;
	dependency_type?: string;
}

interface ConvoyRaw {
	id: string;
	title: string;
	status: string;
	tracked: TrackedIssue[] | null;
	completed: number;
	total: number;
	created_at?: string;
}

export interface ConvoyDetail {
	id: string;
	title: string;
	status: ConvoyStatus;
	rawStatus: string;
	progress: number;
	completed: number;
	total: number;
	createdAt: string;
	tracked: TrackedIssue[];
	workers: string[];
}

function determineConvoyStatus(convoy: ConvoyRaw): ConvoyStatus {
	if (convoy.status === 'closed' || convoy.completed === convoy.total) {
		return 'complete';
	}

	// Handle case where tracked is null (no tracked issues)
	const tracked = convoy.tracked ?? [];
	if (tracked.length === 0) {
		return 'stale';
	}

	const hasBlocked = tracked.some((t) => t.status === 'blocked');
	if (hasBlocked) {
		return 'stuck';
	}

	const hasInProgress = tracked.some((t) => t.status === 'in_progress');
	if (hasInProgress) {
		return 'active';
	}

	const allOpen = tracked.every((t) => t.status === 'open' || t.status === 'unknown');
	if (allOpen && convoy.total > 0) {
		return 'stale';
	}

	return 'active';
}

function extractWorkers(tracked: TrackedIssue[] | null): string[] {
	const workers = new Set<string>();
	for (const issue of tracked ?? []) {
		if (issue.assignee) {
			workers.add(issue.assignee);
		}
	}
	return Array.from(workers);
}

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const gtRoot = getGtRoot();

	try {
		const { stdout } = await execAsync(`gt convoy status ${id} --json`, {
			cwd: gtRoot
		});

		const raw: ConvoyRaw = JSON.parse(stdout);

		// Try to get created_at from convoy list
		let createdAt = raw.created_at || '';
		if (!createdAt) {
			try {
				const { stdout: listJson } = await execAsync('gt convoy list --json', {
					cwd: gtRoot
				});
				const summaries = JSON.parse(listJson);
				const summary = summaries.find((s: { id: string }) => s.id === id);
				if (summary?.created_at) {
					createdAt = summary.created_at;
				}
			} catch {
				// Ignore - created_at is optional
			}
		}

		const convoy: ConvoyDetail = {
			id: raw.id,
			title: raw.title,
			status: determineConvoyStatus(raw),
			rawStatus: raw.status,
			progress: raw.total > 0 ? Math.round((raw.completed / raw.total) * 100) : 0,
			completed: raw.completed,
			total: raw.total,
			createdAt,
			tracked: raw.tracked ?? [],
			workers: extractWorkers(raw.tracked)
		};

		return { convoy, error: null };
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to fetch convoy';
		if (message.includes('not found') || message.includes('No convoy')) {
			error(404, { message: `Convoy not found: ${id}` });
		}
		error(500, { message });
	}
};
