import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/** POST: Create a new convoy */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { name, issues } = body;

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return json({ error: 'Convoy name is required' }, { status: 400 });
		}

		if (!issues || !Array.isArray(issues) || issues.length === 0) {
			return json({ error: 'At least one issue is required' }, { status: 400 });
		}

		// Sanitize inputs to prevent command injection
		const sanitizedName = name.replace(/['"\\$`]/g, '');
		const sanitizedIssues = issues
			.filter((id): id is string => typeof id === 'string' && /^[a-z0-9-]+$/i.test(id))
			.join(' ');

		if (!sanitizedIssues) {
			return json({ error: 'Invalid issue IDs' }, { status: 400 });
		}

		const cmd = `gt convoy create "${sanitizedName}" ${sanitizedIssues}`;
		const { stdout } = await execAsync(cmd);

		return json({ success: true, message: stdout.trim() }, { status: 201 });
	} catch (error) {
		console.error('Failed to create convoy:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to create convoy' },
			{ status: 500 }
		);
	}
};
