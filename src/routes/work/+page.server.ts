import type { PageServerLoad } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface Issue {
	id: string;
	title: string;
	type: string;
	status: string;
	priority: number;
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
	try {
		const { stdout } = await execAsync('bd list --status=open --json');
		return JSON.parse(stdout);
	} catch (error) {
		// bd list might return empty or error if no issues
		if (error instanceof Error && error.message.includes('no issues')) {
			return [];
		}
		throw error;
	}
}

async function fetchRigs(): Promise<Rig[]> {
	try {
		const { stdout } = await execAsync('gt rigs --json');
		return JSON.parse(stdout);
	} catch {
		// Return empty array if gt rigs fails
		return [];
	}
}
