/**
 * Agent Reboot API Endpoint
 *
 * POST /api/gastown/agents/[id]/reboot
 * Restarts an agent by sending a restart signal via gt CLI.
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

/** Check if writes are enabled */
function isWriteEnabled(): boolean {
	const enableWrites = process.env.GASTOWN_ENABLE_WRITES;
	return enableWrites === 'true';
}

export const POST: RequestHandler = async ({ params }) => {
	const { id } = params;
	const requestId = randomUUID();

	// Validate agent ID format
	if (!id || !/^[a-zA-Z0-9/_-]+$/.test(id)) {
		return json({ error: 'Invalid agent ID format', requestId }, { status: 400 });
	}

	// Check if in demo mode
	if (isDemoMode()) {
		return json(
			{
				success: true,
				message: `Demo mode: Agent "${id}" would be rebooted`,
				demo: true,
				requestId
			},
			{ status: 200 }
		);
	}

	// Check if writes are enabled
	if (!isWriteEnabled()) {
		return json(
			{
				error: 'Write operations are disabled. Set GASTOWN_ENABLE_WRITES=true to enable.',
				requestId
			},
			{ status: 403 }
		);
	}

	const supervisor = getProcessSupervisor();

	// Try different restart commands based on agent type
	// For polecats: gt polecat restart <name>
	// For other agents: gt <role> restart (e.g., gt witness restart)

	// First, try to determine the agent type from status
	const statusResult = await supervisor.gt<{
		agents?: Array<{ name: string; role: string; address: string }>;
		rigs?: Array<{
			name: string;
			agents?: Array<{ name: string; role: string; address: string }>;
		}>;
	}>(['status', '--json'], { timeout: 10_000 });

	if (!statusResult.success || !statusResult.data) {
		return json(
			{
				error: 'Failed to fetch agent status',
				requestId
			},
			{ status: 500 }
		);
	}

	// Find the agent and its role
	let agentRole: string | null = null;
	let agentName: string = id;

	// Check top-level agents
	const topAgents = statusResult.data.agents || [];
	for (const agent of topAgents) {
		if (agent.name === id || agent.address === id) {
			agentRole = agent.role;
			agentName = agent.name;
			break;
		}
	}

	// Check rig agents if not found
	if (!agentRole && statusResult.data.rigs) {
		for (const rig of statusResult.data.rigs) {
			for (const agent of rig.agents || []) {
				if (agent.name === id || agent.address === id || `${rig.name}/${agent.name}` === id) {
					agentRole = agent.role;
					agentName = agent.name;
					break;
				}
			}
			if (agentRole) break;
		}
	}

	if (!agentRole) {
		return json(
			{
				error: `Agent "${id}" not found`,
				requestId
			},
			{ status: 404 }
		);
	}

	// Execute the appropriate restart command
	let restartArgs: string[];
	switch (agentRole) {
		case 'polecat':
		case 'crew':
			restartArgs = ['polecat', 'restart', agentName];
			break;
		case 'witness':
			restartArgs = ['witness', 'restart'];
			break;
		case 'refinery':
			restartArgs = ['refinery', 'restart'];
			break;
		case 'coordinator':
		case 'health-check':
			// Mayor and Deacon don't have direct restart commands
			// They need to be stopped and started
			return json(
				{
					error: `Cannot restart ${agentRole} agent. Use gt ${agentRole} stop && gt ${agentRole} start`,
					requestId
				},
				{ status: 400 }
			);
		default:
			// Try generic restart
			restartArgs = [agentRole, 'restart'];
	}

	const result = await supervisor.gt<string>(restartArgs, {
		timeout: 30_000
	});

	if (!result.success) {
		console.error(`Failed to restart agent ${id}:`, result.error);
		return json(
			{
				error: result.error || `Failed to restart agent "${id}"`,
				requestId
			},
			{ status: 500 }
		);
	}

	return json({
		success: true,
		message: `Agent "${agentName}" (${agentRole}) restart initiated`,
		requestId
	});
};
