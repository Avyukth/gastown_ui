import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

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
	try {
		const { stdout } = await execAsync('bd formula list --json', {
			cwd: GT_ROOT
		});
		const formulas: Formula[] = JSON.parse(stdout);
		return json(formulas);
	} catch (error) {
		// bd formula list returns null/empty when no formulas
		if (
			error instanceof Error &&
			(error.message.includes('null') || error.message.includes('No formulas'))
		) {
			return json([]);
		}
		console.error('Failed to fetch formulas:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch formulas' },
			{ status: 500 }
		);
	}
};
