/**
 * Agent Logs API Endpoint
 *
 * GET /api/gastown/agents/[id]/logs
 * Fetches recent logs/trail for an agent via gt trail command.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProcessSupervisor } from '$lib/server/cli';
import { randomUUID } from 'node:crypto';

/** Check if demo mode is enabled */
function isDemoMode(): boolean {
	const demoMode = process.env.GASTOWN_DEMO_MODE;
	return demoMode !== 'false';
}

interface TrailEntry {
	timestamp: string;
	agent: string;
	action: string;
	details?: string;
	bead_id?: string;
}

interface AgentLog {
	timestamp: string;
	level: 'info' | 'warn' | 'error' | 'debug';
	message: string;
	details?: string;
	beadId?: string;
}

/**
 * Generate demo logs for an agent
 */
function generateDemoLogs(agentId: string): AgentLog[] {
	const now = Date.now();
	const logs: AgentLog[] = [];

	const actions = [
		{ action: 'Session started', level: 'info' as const },
		{ action: 'Checking hook for work', level: 'debug' as const },
		{ action: 'Found patrol wisp on hook', level: 'info' as const },
		{ action: 'Beginning patrol cycle', level: 'info' as const },
		{ action: 'Inbox check: 0 messages', level: 'debug' as const },
		{ action: 'Queue scan: 2 branches ready', level: 'info' as const },
		{ action: 'Processing branch: feature/auth', level: 'info' as const },
		{ action: 'Rebase successful', level: 'info' as const },
		{ action: 'Running tests...', level: 'info' as const },
		{ action: 'Tests passed: 42/42', level: 'info' as const },
		{ action: 'Merged to main', level: 'info' as const },
		{ action: 'Patrol cycle complete', level: 'info' as const }
	];

	for (let i = 0; i < actions.length; i++) {
		const entry = actions[i];
		logs.push({
			timestamp: new Date(now - (actions.length - i) * 30000).toISOString(),
			level: entry.level,
			message: entry.action,
			details: `Agent: ${agentId}`
		});
	}

	return logs.reverse();
}

export const GET: RequestHandler = async ({ params, url }) => {
	const { id } = params;
	const requestId = randomUUID();
	const limit = parseInt(url.searchParams.get('limit') || '50', 10);

	// Validate agent ID format
	if (!id || !/^[a-zA-Z0-9/_-]+$/.test(id)) {
		return json({ error: 'Invalid agent ID format', requestId }, { status: 400 });
	}

	// Check if in demo mode
	if (isDemoMode()) {
		const logs = generateDemoLogs(id);
		return json({
			logs,
			agent: id,
			count: logs.length,
			demo: true,
			fetchedAt: new Date().toISOString(),
			requestId
		});
	}

	const supervisor = getProcessSupervisor();

	// Try to fetch trail for the agent
	// gt trail --json --agent <id> --limit <n>
	const result = await supervisor.gt<TrailEntry[]>(
		['trail', '--json', '--agent', id, '--limit', String(limit)],
		{ timeout: 15_000 }
	);

	if (!result.success) {
		// If trail command fails, try to get any available logs
		console.error(`Failed to fetch logs for agent ${id}:`, result.error);

		// Return empty logs rather than error - trail might not be available
		return json({
			logs: [],
			agent: id,
			count: 0,
			error: result.error || 'No logs available',
			fetchedAt: new Date().toISOString(),
			requestId
		});
	}

	const trail = result.data || [];

	// Transform trail entries to log format
	const logs: AgentLog[] = trail.map((entry) => ({
		timestamp: entry.timestamp,
		level: 'info' as const,
		message: entry.action,
		details: entry.details,
		beadId: entry.bead_id
	}));

	return json({
		logs,
		agent: id,
		count: logs.length,
		fetchedAt: new Date().toISOString(),
		requestId
	});
};
