import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export const GET: RequestHandler = async () => {
	try {
		const { stdout } = await execAsync('bd list --type=convoy --status=open --json');
		const convoys = JSON.parse(stdout);
		return json(convoys);
	} catch (error) {
		// bd list might return empty or fail if no convoys exist
		if (error instanceof Error && error.message.includes('no issues')) {
			return json([]);
		}
		console.error('Failed to fetch convoys:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch convoys' },
			{ status: 500 }
		);
	}
};
