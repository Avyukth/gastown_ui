import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/** POST: Sling work to a rig */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { issue, rig } = body;

		if (!issue || typeof issue !== 'string') {
			return json({ error: 'Issue ID is required' }, { status: 400 });
		}

		if (!rig || typeof rig !== 'string') {
			return json({ error: 'Rig name is required' }, { status: 400 });
		}

		// Sanitize inputs to prevent command injection
		const sanitizedIssue = issue.replace(/[^a-z0-9-]/gi, '');
		const sanitizedRig = rig.replace(/[^a-z0-9-_]/gi, '');

		if (!sanitizedIssue || !sanitizedRig) {
			return json({ error: 'Invalid issue ID or rig name' }, { status: 400 });
		}

		const cmd = `gt sling ${sanitizedIssue} ${sanitizedRig}`;
		const { stdout } = await execAsync(cmd);

		return json({ success: true, message: stdout.trim() }, { status: 200 });
	} catch (error) {
		console.error('Failed to sling work:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to sling work' },
			{ status: 500 }
		);
	}
};
