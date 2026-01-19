import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';

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
	requestId?: string;
}

// Validate proto/assignee name
function isValidName(name: string): boolean {
	return /^[a-zA-Z0-9_/-]+$/.test(name);
}

// Validate variable key/value
function isValidVar(key: string, value: string): boolean {
	return /^[a-zA-Z0-9_-]+$/.test(key) && !/[;&|`$]/.test(value);
}

/** POST: Pour a proto into a persistent molecule */
export const POST: RequestHandler = async ({ request }) => {
	const requestId = randomUUID();
	const supervisor = getProcessSupervisor();

	try {
		const body: PourRequest = await request.json();
		const { proto, vars, assignee, dryRun } = body;

		if (!proto) {
			return json({ success: false, error: 'Proto name required', requestId }, { status: 400 });
		}

		if (!isValidName(proto)) {
			return json({ success: false, error: 'Invalid proto name', requestId }, { status: 400 });
		}

		// Build args array (safe from injection)
		const args: string[] = ['mol', 'pour', proto];

		if (vars && Object.keys(vars).length > 0) {
			for (const [key, value] of Object.entries(vars)) {
				if (!isValidVar(key, value)) {
					return json({ success: false, error: `Invalid variable: ${key}`, requestId }, { status: 400 });
				}
				args.push('--var', `${key}=${value}`);
			}
		}

		if (assignee && isValidName(assignee)) {
			args.push(`--assignee=${assignee}`);
		}

		if (dryRun) {
			args.push('--dry-run');
		}

		args.push('--json');

		const result = await supervisor.bd<{ id?: string; mol_id?: string }>(args, { cwd: GT_ROOT });

		if (!result.success) {
			const errorMessage = result.error || 'Failed to pour molecule';

			if (errorMessage.includes('not found')) {
				return json({ success: false, error: 'Proto not found', requestId }, { status: 404 });
			}

			if (errorMessage.includes('missing required variable')) {
				return json({ success: false, error: errorMessage, requestId }, { status: 400 });
			}

			return json({ success: false, error: errorMessage, requestId }, { status: 500 });
		}

		const output = result.data;
		return json({
			success: true,
			molId: output?.id || output?.mol_id,
			requestId
		});
	} catch (error) {
		console.error('Failed to pour mol:', error);

		const errorMessage = error instanceof Error ? error.message : 'Failed to pour molecule';

		if (errorMessage.includes('not found')) {
			return json({ success: false, error: 'Proto not found', requestId }, { status: 404 });
		}

		if (errorMessage.includes('missing required variable')) {
			return json({ success: false, error: errorMessage, requestId }, { status: 400 });
		}

		return json({ success: false, error: errorMessage, requestId }, { status: 500 });
	}
};
