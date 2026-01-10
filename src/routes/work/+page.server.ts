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
		const { stdout } = await execAsync('gt rig list');
		// Parse the output format:
		// Rigs in /home/eclipze/gt:
		//
		//   ui_gastown
		//     Polecats: 2  Crew: 2
		//     Agents: [refinery witness mayor]
		const lines = stdout.trim().split('\n');
		const rigs: Rig[] = [];

		for (const line of lines) {
			// Rig names are indented with 2 spaces and not indented further
			const trimmed = line.trim();
			// Skip empty lines and lines that start with "Rigs in" or contain stats (Polecats, Crew, Agents)
			if (trimmed && !trimmed.startsWith('Rigs') && !trimmed.includes('Polecats:') && !trimmed.includes('Agents:')) {
				rigs.push({ name: trimmed });
			}
		}

		return rigs;
	} catch {
		// Return empty array if gt rig list fails
		return [];
	}
}
