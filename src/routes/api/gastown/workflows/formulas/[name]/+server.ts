import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';
import { identifyKnownBug } from '$lib/errors/known-bugs';

// GT_ROOT for accessing formulas from the orchestrator level
const GT_ROOT = '/Users/amrit/Documents/Projects/Rust/mouchak/gastown_exp';

export interface FormulaDetail {
	name: string;
	type: string;
	description: string;
	phase: string;
	source: string;
	variables: Array<{
		name: string;
		default?: string;
		required: boolean;
		description?: string;
	}>;
	steps: Array<{
		id: string;
		title: string;
		type: string;
		depends_on?: string[];
	}>;
}

/** GET: Show formula details */
export const GET: RequestHandler = async ({ params }) => {
	const requestId = randomUUID();
	const { name } = params;

	if (!name) {
		return json({ error: 'Formula name required' }, { status: 400 });
	}

	const supervisor = getProcessSupervisor();
	const result = await supervisor.bd<FormulaDetail>(['formula', 'show', name, '--json'], {
		cwd: GT_ROOT
	});

	if (!result.success) {
		const errorMessage = result.error || 'Failed to fetch formula';
		const knownBug = identifyKnownBug(errorMessage);

		console.error(`[${requestId}] Failed to fetch formula ${name}:`, errorMessage);

		if (errorMessage.includes('not found')) {
			return json(
				{ error: knownBug?.userMessage || `Formula "${name}" not found` },
				{ status: 404 }
			);
		}

		return json({ error: knownBug?.userMessage || errorMessage }, { status: 500 });
	}

	return json(result.data);
};
