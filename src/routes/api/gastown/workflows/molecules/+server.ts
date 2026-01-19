import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';

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

const DEFAULT_STALE: MoleculeStatus = {
	stale_molecules: [],
	total_count: 0,
	blocking_count: 0
};

/** GET: List molecules status (stale, wisps, active) */
export const GET: RequestHandler = async () => {
	const requestId = randomUUID();
	const supervisor = getProcessSupervisor();

	try {
		// Fetch all three in parallel
		const [staleResult, wispsResult, activeResult] = await Promise.all([
			supervisor.bd<MoleculeStatus>(['mol', 'stale', '--json'], { cwd: GT_ROOT }),
			supervisor.bd<Wisp[]>(['mol', 'wisp', 'list', '--json'], { cwd: GT_ROOT }),
			supervisor.bd<MoleculesResponse['active']>(
				['list', '--type=epic', '--status=in_progress', '--json'],
				{ cwd: GT_ROOT }
			)
		]);

		// Handle stale result with fallback
		let stale: MoleculeStatus = DEFAULT_STALE;
		if (staleResult.success && staleResult.data) {
			stale = staleResult.data;
		}

		// Handle wisps result with fallback
		let wisps: Wisp[] = [];
		if (wispsResult.success && Array.isArray(wispsResult.data)) {
			wisps = wispsResult.data;
		}

		// Handle active result with fallback
		let active: MoleculesResponse['active'] = [];
		if (activeResult.success && Array.isArray(activeResult.data)) {
			active = activeResult.data;
		}

		const response: MoleculesResponse = {
			stale,
			wisps,
			active
		};

		return json(response);
	} catch (error) {
		console.error(`[${requestId}] Failed to fetch molecules:`, error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch molecules' },
			{ status: 500 }
		);
	}
};
