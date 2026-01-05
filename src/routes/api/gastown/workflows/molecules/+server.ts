import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// GT_ROOT for accessing molecules from the orchestrator level
const GT_ROOT = '/Users/amrit/Documents/Projects/Rust/mouchak/gastown_exp';

export interface StaleMolecule {
	id: string;
	title: string;
	total_children: number;
	closed_children: number;
	blocking_count: number;
}

export interface MoleculeStatus {
	stale_molecules: StaleMolecule[];
	total_count: number;
	blocking_count: number;
}

export interface Wisp {
	id: string;
	title: string;
	formula: string;
	steps_complete: number;
	steps_total: number;
}

export interface MoleculesResponse {
	stale: MoleculeStatus;
	wisps: Wisp[];
	active: Array<{
		id: string;
		title: string;
		type: string;
		status: string;
		priority: number;
	}>;
}

/** GET: List molecules status (stale, wisps, active) */
export const GET: RequestHandler = async () => {
	try {
		// Fetch stale molecules
		const staleResult = await execAsync('bd mol stale --json', {
			cwd: GT_ROOT
		}).catch(() => ({ stdout: '{"stale_molecules":[],"total_count":0,"blocking_count":0}' }));

		// Fetch wisps (ephemeral molecules)
		const wispsResult = await execAsync('bd mol wisp list --json', {
			cwd: GT_ROOT
		}).catch(() => ({ stdout: '[]' }));

		// Fetch active molecules (epics with molecule label or in_progress status)
		const activeResult = await execAsync(
			'bd list --type=epic --status=in_progress --json',
			{ cwd: GT_ROOT }
		).catch(() => ({ stdout: '[]' }));

		const stale: MoleculeStatus = JSON.parse(staleResult.stdout || '{"stale_molecules":[],"total_count":0,"blocking_count":0}');

		let wisps: Wisp[] = [];
		try {
			const wispsData = JSON.parse(wispsResult.stdout || '[]');
			wisps = Array.isArray(wispsData) ? wispsData : [];
		} catch {
			wisps = [];
		}

		let active: MoleculesResponse['active'] = [];
		try {
			const activeData = JSON.parse(activeResult.stdout || '[]');
			active = Array.isArray(activeData) ? activeData : [];
		} catch {
			active = [];
		}

		const response: MoleculesResponse = {
			stale,
			wisps,
			active
		};

		return json(response);
	} catch (error) {
		console.error('Failed to fetch molecules:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch molecules' },
			{ status: 500 }
		);
	}
};
