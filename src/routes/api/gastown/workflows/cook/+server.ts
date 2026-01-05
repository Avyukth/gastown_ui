import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// GT_ROOT for accessing formulas from the orchestrator level
const GT_ROOT = '/Users/amrit/Documents/Projects/Rust/mouchak/gastown_exp';

export interface CookRequest {
	formula: string;
	mode?: 'compile' | 'runtime';
	vars?: Record<string, string>;
	dryRun?: boolean;
	persist?: boolean;
	prefix?: string;
}

export interface CookResponse {
	success: boolean;
	output?: unknown;
	protoId?: string;
	error?: string;
}

/** POST: Cook a formula into a proto */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body: CookRequest = await request.json();
		const { formula, mode, vars, dryRun, persist, prefix } = body;

		if (!formula) {
			return json({ success: false, error: 'Formula name required' }, { status: 400 });
		}

		// Build command
		let cmd = `bd cook ${formula}`;

		if (mode) {
			cmd += ` --mode=${mode}`;
		}

		if (vars && Object.keys(vars).length > 0) {
			for (const [key, value] of Object.entries(vars)) {
				cmd += ` --var ${key}=${value}`;
			}
		}

		if (dryRun) {
			cmd += ' --dry-run';
		}

		if (persist) {
			cmd += ' --persist';
		}

		if (prefix) {
			cmd += ` --prefix=${prefix}`;
		}

		cmd += ' --json';

		const { stdout, stderr } = await execAsync(cmd, {
			cwd: GT_ROOT
		});

		// Parse output
		try {
			const output = JSON.parse(stdout);
			return json({
				success: true,
				output,
				protoId: persist ? formula : undefined
			});
		} catch {
			// If not JSON, return raw output
			return json({
				success: true,
				output: stdout,
				protoId: persist ? formula : undefined
			});
		}
	} catch (error) {
		console.error('Failed to cook formula:', error);

		const errorMessage = error instanceof Error ? error.message : 'Failed to cook formula';

		// Check for specific errors
		if (errorMessage.includes('not found')) {
			return json({ success: false, error: 'Formula not found' }, { status: 404 });
		}

		if (errorMessage.includes('missing required variable')) {
			return json({ success: false, error: errorMessage }, { status: 400 });
		}

		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};
