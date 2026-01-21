import type { PageServerLoad } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import type { BdBead } from '$lib/types/gastown';

interface Issue {
	id: string;
	title: string;
	type: string;
	status: string;
	priority: number;
	assignee?: string;
	description?: string;
	created?: string;
	updated?: string;
}

interface Rig {
	name: string;
	path?: string;
}

export const load: PageServerLoad = async () => {
	const [issuesResult, rigsResult] = await Promise.allSettled([
		fetchIssues(),
		fetchRigs()
	]);

	return {
		issues: issuesResult.status === 'fulfilled' ? issuesResult.value : [],
		rigs: rigsResult.status === 'fulfilled' ? rigsResult.value : [],
		issuesError: issuesResult.status === 'rejected' ? String(issuesResult.reason) : null,
		rigsError: rigsResult.status === 'rejected' ? String(rigsResult.reason) : null
	};
};

async function fetchIssues(): Promise<Issue[]> {
	const supervisor = getProcessSupervisor();
	const result = await supervisor.bd<BdBead[]>(['list', '--json'], { timeout: 15_000 });

	if (!result.success) {
		const errorMessage = result.error || '';
		if (errorMessage.includes('no issues') || errorMessage.includes('no beads')) {
			return [];
		}
		throw new Error(errorMessage || 'Failed to fetch issues');
	}

	const statusMap: Record<string, Issue['status']> = {
		open: 'open',
		in_progress: 'in_progress',
		closed: 'done',
		hooked: 'in_progress',
		blocked: 'blocked',
		done: 'done'
	};
	const allowedTypes = new Set(['task', 'bug', 'feature', 'epic']);

	return (result.data || []).map((bead) => ({
		id: bead.id,
		title: bead.title,
		type: allowedTypes.has(bead.issue_type) ? bead.issue_type : 'task',
		status: statusMap[bead.status] ?? 'open',
		priority: Math.min(4, Math.max(0, bead.priority)),
		assignee: bead.assignee,
		description: bead.description,
		created: bead.created_at,
		updated: bead.updated_at
	}));
}

async function fetchRigs(): Promise<Rig[]> {
	const supervisor = getProcessSupervisor();
	const result = await supervisor.gt<Rig[]>(['rigs', '--json'], { timeout: 15_000 });

	if (!result.success) {
		return [];
	}

	return result.data || [];
}
