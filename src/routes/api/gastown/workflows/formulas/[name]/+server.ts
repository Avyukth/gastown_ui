import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';

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

// Validate formula name
function isValidName(name: string): boolean {
	return /^[a-zA-Z0-9_-]+$/.test(name);
}

/** GET: Show formula details */
export const GET: RequestHandler = async ({ params }) => {
	const { name } = params;
	const requestId = randomUUID();
	const supervisor = getProcessSupervisor();

	if (!name) {
		return json({ error: 'Formula name required', requestId }, { status: 400 });
	}

	if (!isValidName(name)) {
		return json({ error: 'Invalid formula name', requestId }, { status: 400 });
	}

	try {
		const result = await supervisor.bd<FormulaDetail>(['formula', 'show', name, '--json'], {
			cwd: GT_ROOT
		});

		if (!result.success) {
			if (result.error?.includes('not found')) {
				return json({ error: `Formula "${name}" not found`, requestId }, { status: 404 });
			}
			console.error(`Failed to fetch formula ${name}:`, result.error);
			return json(
				{ error: result.error || 'Failed to fetch formula', requestId },
				{ status: 500 }
			);
		}

		return json({ ...result.data, requestId });
	} catch (error) {
		console.error(`Failed to fetch formula ${name}:`, error);

		if (error instanceof Error && error.message.includes('not found')) {
			return json({ error: `Formula "${name}" not found`, requestId }, { status: 404 });
		}

		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch formula', requestId },
			{ status: 500 }
		);
	}
};
