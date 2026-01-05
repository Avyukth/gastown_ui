import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/** GET: List all open issues */
export const GET: RequestHandler = async () => {
	try {
		const { stdout } = await execAsync('bd list --status=open --json');
		const issues = JSON.parse(stdout);
		return json(issues);
	} catch (error) {
		// bd list might return empty
		if (error instanceof Error && error.message.includes('no issues')) {
			return json([]);
		}
		console.error('Failed to fetch issues:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch issues' },
			{ status: 500 }
		);
	}
};

/** POST: Create a new issue */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { title, type = 'task', priority = 2 } = body;

		if (!title || typeof title !== 'string' || title.trim().length === 0) {
			return json({ error: 'Title is required' }, { status: 400 });
		}

		// Sanitize inputs to prevent command injection
		const sanitizedTitle = title.replace(/['"\\$`]/g, '');
		const validTypes = ['task', 'bug', 'feature', 'epic'];
		const sanitizedType = validTypes.includes(type) ? type : 'task';
		const sanitizedPriority = Math.max(0, Math.min(4, parseInt(String(priority), 10) || 2));

		const cmd = `bd create --title="${sanitizedTitle}" --type=${sanitizedType} --priority=${sanitizedPriority} --json`;
		const { stdout } = await execAsync(cmd);

		const result = JSON.parse(stdout);
		return json(result, { status: 201 });
	} catch (error) {
		console.error('Failed to create issue:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to create issue' },
			{ status: 500 }
		);
	}
};
