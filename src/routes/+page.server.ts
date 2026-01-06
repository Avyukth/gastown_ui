import type { PageServerLoad } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface GtAgent {
	name: string;
	address: string;
	session: string;
	role: string;
	running: boolean;
	has_work: boolean;
	state?: string;
	unread_mail: number;
	first_subject?: string;
}

interface GtRig {
	name: string;
	polecats: string[];
	polecat_count: number;
	crews: string[] | null;
	crew_count: number;
	has_witness: boolean;
	has_refinery: boolean;
	hooks: Array<{
		agent: string;
		role: string;
		has_work: boolean;
	}>;
	agents: GtAgent[];
}

interface GtStatus {
	name: string;
	location: string;
	overseer: {
		name: string;
		email: string;
		username: string;
		source: string;
		unread_mail: number;
	};
	agents: GtAgent[];
	rigs: GtRig[];
	summary: {
		rig_count: number;
		polecat_count: number;
		crew_count: number;
		witness_count: number;
		refinery_count: number;
		active_agents: number;
	};
}

type AgentStatus = 'running' | 'idle' | 'error' | 'complete';

interface DashboardAgent {
	id: string;
	name: string;
	task: string;
	status: AgentStatus;
	progress: number;
	meta: string;
	role: string;
	address: string;
}

interface DashboardStats {
	activeAgents: number;
	tasksRunning: number;
	queueDepth: number;
	completedToday: number;
}

function mapAgentStatus(agent: GtAgent): AgentStatus {
	if (agent.state === 'dead') return 'error';
	if (agent.running && agent.has_work) return 'running';
	if (agent.running) return 'idle';
	return 'idle';
}

function formatAgentName(agent: GtAgent): string {
	const name = agent.name.charAt(0).toUpperCase() + agent.name.slice(1);
	if (agent.role === 'polecat') {
		return `Polecat ${name}`;
	}
	return name;
}

function sanitizeTaskSubject(subject: string): string {
	const trimmed = subject.trim().replace(/^[^\w]+/, '');
	return trimmed.replace(/^work:\s*/i, '');
}

function getTaskDescription(agent: GtAgent): string {
	if (agent.first_subject) {
		return sanitizeTaskSubject(agent.first_subject);
	}
	if (agent.state === 'dead') {
		return 'Session ended';
	}
	if (!agent.running) {
		return 'Not running';
	}
	switch (agent.role) {
		case 'coordinator':
			return 'Coordinating cross-rig work';
		case 'health-check':
			return 'Health monitoring';
		case 'witness':
			return 'Monitoring polecat lifecycle';
		case 'refinery':
			return 'Processing merge queue';
		case 'polecat':
			return agent.has_work ? 'Working on assigned task' : 'Awaiting work assignment';
		default:
			return agent.state ?? 'Active';
	}
}

function getAgentMeta(agent: GtAgent): string {
	const parts: string[] = [];
	if (agent.unread_mail > 0) {
		parts.push(`${agent.unread_mail} unread mail`);
	}
	parts.push(`Role: ${agent.role}`);
	return parts.join(' • ');
}

function transformToAgent(agent: GtAgent): DashboardAgent {
	const status = mapAgentStatus(agent);
	return {
		id: agent.address || agent.name,
		name: formatAgentName(agent),
		task: getTaskDescription(agent),
		status,
		progress: status === 'running' ? 50 : 0, // Progress not available from gt status
		meta: getAgentMeta(agent),
		role: agent.role,
		address: agent.address
	};
}

export const load: PageServerLoad = async () => {
	try {
		const { stdout } = await execAsync('gt status --json');
		const status: GtStatus = JSON.parse(stdout);

		// Collect all agents: top-level agents + rig agents
		const allAgents: DashboardAgent[] = [];

		// Add top-level agents (mayor, deacon)
		for (const agent of status.agents) {
			allAgents.push(transformToAgent(agent));
		}

		// Add rig-level agents
		for (const rig of status.rigs) {
			for (const agent of rig.agents) {
				allAgents.push(transformToAgent(agent));
			}
		}

		// Calculate stats
		const runningAgents = allAgents.filter((a) => a.status === 'running');
		const stats: DashboardStats = {
			activeAgents: allAgents.filter((a) => a.status !== 'error').length,
			tasksRunning: runningAgents.length,
			queueDepth: status.rigs.reduce((sum, rig) => sum + rig.polecat_count, 0),
			completedToday: 0 // Would need beads integration for this
		};

		const systemStatus: 'running' | 'error' | 'idle' =
			allAgents.some((a) => a.status === 'error')
				? 'error'
				: runningAgents.length > 0
					? 'running'
					: 'idle';

		return {
			agents: allAgents,
			stats,
			systemStatus,
			townName: status.name,
			error: null
		};
	} catch (error) {
		console.error('Failed to fetch gt status:', error);
		return {
			agents: [],
			stats: {
				activeAgents: 0,
				tasksRunning: 0,
				queueDepth: 0,
				completedToday: 0
			},
			systemStatus: 'error' as const,
			townName: 'Gas Town',
			error: error instanceof Error ? error.message : 'Failed to fetch status'
		};
	}
};
