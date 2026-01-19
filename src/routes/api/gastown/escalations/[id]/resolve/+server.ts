import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';
import { identifyKnownBug, getErrorCategory } from '$lib/errors/known-bugs';

export interface ResolveRequest {
	selectedOption?: number;
	resolutionNote?: string;
}

export interface ResolveResponse {
	success: boolean;
	error?: string;
}

/** POST: Resolve an escalation by closing the bead */
export const POST: RequestHandler = async ({ params, request }) => {
	const { id } = params;
	const requestId = randomUUID();

	if (!id) {
		return json({ success: false, error: 'Escalation ID required' }, { status: 400 });
	}

	const body: ResolveRequest = await request.json();
	const { selectedOption, resolutionNote } = body;

	let comment: string | undefined;

	if (selectedOption !== undefined && selectedOption !== null) {
		const optionNote = `Selected option: ${selectedOption}`;
		comment = resolutionNote?.trim() ? `${optionNote}\n${resolutionNote}` : optionNote;
	} else if (resolutionNote?.trim()) {
		comment = resolutionNote;
	}

	const args = ['close', id];
	if (comment) {
		args.push('--comment', comment);
	}

	const supervisor = getProcessSupervisor();
	const result = await supervisor.bd(args);

	if (!result.success) {
		const errorMessage = result.error || 'Failed to resolve escalation';

		if (errorMessage.includes('not found')) {
			return json({ success: false, error: `Escalation "${id}" not found` }, { status: 404 });
		}

		if (errorMessage.includes('already closed')) {
			return json({ success: false, error: 'Escalation is already resolved' }, { status: 400 });
		}

		const knownBug = identifyKnownBug(errorMessage);
		if (knownBug) {
			console.error(`[${requestId}] Known issue resolving escalation ${id}:`, knownBug.userMessage);
			return json(
				{
					success: false,
					error: knownBug.userMessage,
					workaround: knownBug.workaround,
					category: knownBug.category
				},
				{ status: 500 }
			);
		}

		const errorInfo = getErrorCategory(errorMessage);
		console.error(`[${requestId}] Failed to resolve escalation ${id}:`, errorMessage);
		return json(
			{
				success: false,
				error: errorInfo.defaultMessage,
				details: errorMessage,
				category: errorInfo.category
			},
			{ status: 500 }
		);
	}

	return json({ success: true });
};
