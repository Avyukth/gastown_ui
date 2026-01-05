import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/** GET: List all rigs */
export const GET: RequestHandler = async () => {
	try {
		const { stdout } = await execAsync('gt rigs --json');
		const rigs = JSON.parse(stdout);
		return json(rigs);
	} catch (error) {
		console.error('Failed to fetch rigs:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch rigs' },
			{ status: 500 }
		);
	}
};
