import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// GT_ROOT for accessing molecules from the orchestrator level
const GT_ROOT = '/Users/amrit/Documents/Projects/Rust/mouchak/gastown_exp';

export interface PourRequest {
	proto: string;
	vars?: Record<string, string>;
	assignee?: string;
	dryRun?: boolean;
}

export interface PourResponse {
	success: boolean;
	molId?: string;
	output?: string;
	error?: string;
}

/** POST: Pour a proto into a persistent molecule */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body: PourRequest = await request.json();
		const { proto, vars, assignee, dryRun } = body;

		if (!proto) {
			return json({ success: false, error: 'Proto name required' }, { status: 400 });
		}

		// Build command
		let cmd = `bd mol pour ${proto}`;

		if (vars && Object.keys(vars).length > 0) {
			for (const [key, value] of Object.entries(vars)) {
				cmd += ` --var ${key}=${value}`;
			}
		}

		if (assignee) {
			cmd += ` --assignee=${assignee}`;
		}

		if (dryRun) {
			cmd += ' --dry-run';
		}

		cmd += ' --json';

		const { stdout, stderr } = await execAsync(cmd, {
			cwd: GT_ROOT
		});

		// Parse output to extract mol ID
		try {
			const output = JSON.parse(stdout);
			return json({
				success: true,
				molId: output.id || output.mol_id,
				output: stdout
			});
		} catch {
			// Try to extract mol ID from text output
			const match = stdout.match(/([a-z]+-[a-z0-9]+)/);
			return json({
				success: true,
				molId: match ? match[1] : undefined,
				output: stdout
			});
		}
	} catch (error) {
		console.error('Failed to pour mol:', error);

		const errorMessage = error instanceof Error ? error.message : 'Failed to pour molecule';

		// Check for specific errors
		if (errorMessage.includes('not found')) {
			return json({ success: false, error: 'Proto not found' }, { status: 404 });
		}

		if (errorMessage.includes('missing required variable')) {
			return json({ success: false, error: errorMessage }, { status: 400 });
		}

		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};
