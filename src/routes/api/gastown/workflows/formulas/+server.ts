import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';
import { identifyKnownBug } from '$lib/errors/known-bugs';

// GT_ROOT for accessing formulas from the orchestrator level
const GT_ROOT = '/Users/amrit/Documents/Projects/Rust/mouchak/gastown_exp';

export interface Formula {
	name: string;
	type: string;
	description: string;
	source: string;
	steps: number;
	vars: number;
}

/** GET: List available formulas */
export const GET: RequestHandler = async () => {
	const requestId = randomUUID();
	const supervisor = getProcessSupervisor();

	const result = await supervisor.bd<Formula[]>(['formula', 'list', '--json'], { cwd: GT_ROOT });

	if (!result.success) {
		const errorMessage = result.error || 'Failed to fetch formulas';

		// bd formula list returns null/empty when no formulas
		if (errorMessage.includes('null') || errorMessage.includes('No formulas')) {
			return json([]);
		}

		const knownBug = identifyKnownBug(errorMessage);
		console.error(`[${requestId}] Failed to fetch formulas:`, errorMessage);

		return json(
			{ error: knownBug?.userMessage || errorMessage },
			{ status: 500 }
		);
	}

	// Handle null/empty data as empty array
	if (!result.data || (Array.isArray(result.data) && result.data.length === 0)) {
		return json([]);
	}

	return json(result.data);
};
