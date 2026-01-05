import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export const GET: RequestHandler = async () => {
	try {
		const { stdout } = await execAsync('gt status --json');
		const status = JSON.parse(stdout);
		return json(status);
	} catch (error) {
		console.error('Failed to fetch gt status:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch status' },
			{ status: 500 }
		);
	}
};
