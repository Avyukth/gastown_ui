import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';
import { identifyKnownBug } from '$lib/errors/known-bugs';

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
	const requestId = randomUUID();
	const supervisor = getProcessSupervisor();

	try {
		const body: CookRequest = await request.json();
		const { formula, mode, vars, dryRun, persist, prefix } = body;

		if (!formula) {
			return json({ success: false, error: 'Formula name required' }, { status: 400 });
		}

		// Build args array (shell injection safe)
		const args: string[] = ['cook', formula];

		if (mode) {
			args.push(`--mode=${mode}`);
		}

		if (vars && Object.keys(vars).length > 0) {
			for (const [key, value] of Object.entries(vars)) {
				args.push('--var', `${key}=${value}`);
			}
		}

		if (dryRun) {
			args.push('--dry-run');
		}

		if (persist) {
			args.push('--persist');
		}

		if (prefix) {
			args.push(`--prefix=${prefix}`);
		}

		args.push('--json');

		const result = await supervisor.bd<unknown>(args, { cwd: GT_ROOT });

		if (!result.success) {
			const errorMessage = result.error || 'Failed to cook formula';
			const knownBug = identifyKnownBug(errorMessage);

			console.error(`[${requestId}] Failed to cook formula:`, errorMessage);

			if (errorMessage.includes('not found')) {
				return json(
					{
						success: false,
						error: knownBug?.userMessage || 'Formula not found'
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

		return json({
			success: true,
			output: result.data,
			protoId: persist ? formula : undefined
		});
	} catch (error) {
		console.error(`[${requestId}] Failed to cook formula:`, error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to cook formula';
		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};
