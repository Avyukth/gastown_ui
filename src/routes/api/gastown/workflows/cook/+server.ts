import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';

/** Get the beads working directory from environment variables */
function getBdCwd(): string | undefined {
	return process.env.GASTOWN_BD_CWD || process.env.GASTOWN_TOWN_ROOT;
}

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
	requestId?: string;
}

// Validate formula name to prevent injection
function isValidFormula(formula: string): boolean {
	return /^[a-zA-Z0-9_-]+$/.test(formula);
}

// Validate variable key/value
function isValidVar(key: string, value: string): boolean {
	return /^[a-zA-Z0-9_-]+$/.test(key) && !/[;&|`$]/.test(value);
}

/** POST: Cook a formula into a proto */
export const POST: RequestHandler = async ({ request }) => {
	const requestId = randomUUID();
	const supervisor = getProcessSupervisor();

	try {
		const body: CookRequest = await request.json();
		const { formula, mode, vars, dryRun, persist, prefix } = body;

		if (!formula) {
			return json({ success: false, error: 'Formula name required', requestId }, { status: 400 });
		}

		if (!isValidFormula(formula)) {
			return json({ success: false, error: 'Invalid formula name', requestId }, { status: 400 });
		}

		// Build args array (safe from injection)
		const args: string[] = ['cook', formula];

		if (mode && (mode === 'compile' || mode === 'runtime')) {
			args.push(`--mode=${mode}`);
		}

		if (vars && Object.keys(vars).length > 0) {
			for (const [key, value] of Object.entries(vars)) {
				if (!isValidVar(key, value)) {
					return json({ success: false, error: `Invalid variable: ${key}`, requestId }, { status: 400 });
				}
				args.push('--var', `${key}=${value}`);
			}
		}

		if (dryRun) {
			args.push('--dry-run');
		}

		if (persist) {
			args.push('--persist');
		}

		if (prefix && isValidFormula(prefix)) {
			args.push(`--prefix=${prefix}`);
		}

		args.push('--json');

		const result = await supervisor.bd<unknown>(args, { cwd: getBdCwd() });

		if (!result.success) {
			const errorMessage = result.error || 'Failed to cook formula';

			if (errorMessage.includes('not found')) {
				return json({ success: false, error: 'Formula not found', requestId }, { status: 404 });
			}

			if (errorMessage.includes('missing required variable')) {
				return json({ success: false, error: errorMessage, requestId }, { status: 400 });
			}

			return json({ success: false, error: errorMessage, requestId }, { status: 500 });
		}

		return json({
			success: true,
			output: result.data,
			protoId: persist ? formula : undefined,
			requestId
		});
	} catch (error) {
		console.error('Failed to cook formula:', error);

		const errorMessage = error instanceof Error ? error.message : 'Failed to cook formula';

		if (errorMessage.includes('not found')) {
			return json({ success: false, error: 'Formula not found', requestId }, { status: 404 });
		}

		if (errorMessage.includes('missing required variable')) {
			return json({ success: false, error: errorMessage, requestId }, { status: 400 });
		}

		return json({ success: false, error: errorMessage, requestId }, { status: 500 });
	}
};
