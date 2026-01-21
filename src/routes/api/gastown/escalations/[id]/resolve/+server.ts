import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';

/** Get the beads working directory from environment variables */
function getBdCwd(): string | undefined {
	return process.env.GASTOWN_BD_CWD || process.env.GASTOWN_TOWN_ROOT;
}

export interface ResolveRequest {
	selectedOption?: number;
	resolutionNote?: string;
}

export interface ResolveResponse {
	success: boolean;
	error?: string;
	requestId?: string;
}

// Validate bead ID
function isValidId(id: string): boolean {
	return /^[a-zA-Z0-9_-]+$/.test(id);
}

/** POST: Resolve an escalation by closing the bead */
export const POST: RequestHandler = async ({ params, request }) => {
	const { id } = params;
	const requestId = randomUUID();
	const supervisor = getProcessSupervisor();

	if (!id) {
		return json({ success: false, error: 'Escalation ID required', requestId }, { status: 400 });
	}

	if (!isValidId(id)) {
		return json({ success: false, error: 'Invalid escalation ID', requestId }, { status: 400 });
	}

	try {
		const body: ResolveRequest = await request.json();
		const { selectedOption, resolutionNote } = body;

		// Build args array (safe from injection)
		const args: string[] = ['close', id];

		// Build comment text
		let comment = '';
		if (selectedOption !== undefined && selectedOption !== null) {
			comment = `Selected option: ${selectedOption}`;
			if (resolutionNote && resolutionNote.trim()) {
				comment += `\n${resolutionNote.trim()}`;
			}
		} else if (resolutionNote && resolutionNote.trim()) {
			comment = resolutionNote.trim();
		}

		if (comment) {
			args.push('--comment', comment);
		}

		const result = await supervisor.bd<unknown>(args, { cwd: getBdCwd() });

		if (!result.success) {
			const errorMessage = result.error || 'Failed to resolve escalation';

			if (errorMessage.includes('not found')) {
				return json({ success: false, error: `Escalation "${id}" not found`, requestId }, { status: 404 });
			}

			if (errorMessage.includes('already closed')) {
				return json({ success: false, error: 'Escalation is already resolved', requestId }, { status: 400 });
			}

			return json({ success: false, error: errorMessage, requestId }, { status: 500 });
		}

		return json({ success: true, requestId });
	} catch (error) {
		console.error(`Failed to resolve escalation ${id}:`, error);

		const errorMessage = error instanceof Error ? error.message : 'Failed to resolve escalation';

		if (errorMessage.includes('not found')) {
			return json({ success: false, error: `Escalation "${id}" not found`, requestId }, { status: 404 });
		}

		if (errorMessage.includes('already closed')) {
			return json({ success: false, error: 'Escalation is already resolved', requestId }, { status: 400 });
		}

		return json({ success: false, error: errorMessage, requestId }, { status: 500 });
	}
};
