import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

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
	const { name } = params;

	if (!name) {
		return json({ error: 'Formula name required' }, { status: 400 });
	}

	try {
		const { stdout } = await execAsync(`bd formula show ${name} --json`, {
			cwd: GT_ROOT
		});
		const formula: FormulaDetail = JSON.parse(stdout);
		return json(formula);
	} catch (error) {
		console.error(`Failed to fetch formula ${name}:`, error);

		if (error instanceof Error && error.message.includes('not found')) {
			return json({ error: `Formula "${name}" not found` }, { status: 404 });
		}

		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch formula' },
			{ status: 500 }
		);
	}
};
