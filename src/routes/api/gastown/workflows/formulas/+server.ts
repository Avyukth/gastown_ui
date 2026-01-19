import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';

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

	try {
		const result = await supervisor.bd<Formula[]>(['formula', 'list', '--json'], {
			cwd: GT_ROOT
		});

		if (!result.success) {
			// bd formula list returns null/empty when no formulas
			if (
				result.error?.includes('null') ||
				result.error?.includes('No formulas')
			) {
				return json({ formulas: [], requestId });
			}
			console.error('Failed to fetch formulas:', result.error);
			return json(
				{ error: result.error || 'Failed to fetch formulas', requestId },
				{ status: 500 }
			);
		}

		return json({ formulas: result.data || [], requestId });
	} catch (error) {
		// bd formula list returns null/empty when no formulas
		if (
			error instanceof Error &&
			(error.message.includes('null') || error.message.includes('No formulas'))
		) {
			return json({ formulas: [], requestId });
		}
		console.error('Failed to fetch formulas:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch formulas', requestId },
			{ status: 500 }
		);
	}
};
