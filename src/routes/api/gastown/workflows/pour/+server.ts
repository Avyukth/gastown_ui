import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';
import { identifyKnownBug } from '$lib/errors/known-bugs';

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

interface PourOutput {
	id?: string;
	mol_id?: string;
}

/** POST: Pour a proto into a persistent molecule */
export const POST: RequestHandler = async ({ request }) => {
	const requestId = randomUUID();
	const supervisor = getProcessSupervisor();

	try {
		const body: PourRequest = await request.json();
		const { proto, vars, assignee, dryRun } = body;

		if (!proto) {
			return json({ success: false, error: 'Proto name required' }, { status: 400 });
		}

		// Build args array (shell injection safe)
		const args: string[] = ['mol', 'pour', proto];

		if (vars && Object.keys(vars).length > 0) {
			for (const [key, value] of Object.entries(vars)) {
				args.push('--var', `${key}=${value}`);
			}
		}

		if (assignee) {
			args.push(`--assignee=${assignee}`);
		}

		if (dryRun) {
			args.push('--dry-run');
		}

		args.push('--json');

		const result = await supervisor.bd<PourOutput | string>(args, { cwd: GT_ROOT });

		if (!result.success) {
			const errorMessage = result.error || 'Failed to pour molecule';
			const knownBug = identifyKnownBug(errorMessage);

			console.error(`[${requestId}] Failed to pour mol:`, errorMessage);

			if (errorMessage.includes('not found')) {
				return json(
					{
						success: false,
						error: knownBug?.userMessage || 'Proto not found'
					},
					{ status: 404 }
				);
			}

			if (errorMessage.includes('missing required variable')) {
				return json(
					{
						success: false,
						error: knownBug?.userMessage || errorMessage
					},
					{ status: 400 }
				);
			}

			return json(
				{
					success: false,
					error: knownBug?.userMessage || errorMessage
				},
				{ status: 500 }
			);
		}

		// Extract mol ID from result
		let molId: string | undefined;
		if (typeof result.data === 'object' && result.data !== null) {
			const data = result.data as PourOutput;
			molId = data.id || data.mol_id;
		} else if (typeof result.data === 'string') {
			const match = result.data.match(/([a-z]+-[a-z0-9]+)/);
			molId = match ? match[1] : undefined;
		}

		return json({
			success: true,
			molId,
			output: typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
		});
	} catch (error) {
		console.error(`[${requestId}] Failed to pour mol:`, error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to pour molecule';
		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};
