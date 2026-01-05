import { error } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import type { PageServerLoad } from './$types';

const execAsync = promisify(exec);

// Get Gas Town root directory
// Priority: GT_TOWN_ROOT env var > derive from process.cwd()
function getGtRoot(): string {
	if (process.env.GT_TOWN_ROOT) {
		return process.env.GT_TOWN_ROOT;
	}

	// Server runs from project root (rictus).
	// Path: gastown_exp/gastown_ui/polecats/rictus
	// Town root (gastown_exp) is 3 levels up from project root
	const cwd = process.cwd();
	return resolve(cwd, '..', '..', '..');
}

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
	agents: GtAgent[];
}

interface GtStatus {
	name: string;
	agents: GtAgent[];
	rigs: GtRig[];
}

export interface AgentData {
	id: string;
	name: string;
	address: string;
	session: string;
	role: string;
	status: 'running' | 'idle' | 'error';
	hasWork: boolean;
	unreadMail: number;
	firstSubject?: string;
	rig?: string;
	recentOutput?: string;
}

/**
 * Map URL ID to agent lookup
 * ID formats:
 * - hq-mayor → infrastructure agent (session matches directly)
 * - gastown_ui-witness → rig agent (rig-role)
 * - gastown_ui-polecat-furiosa → polecat (rig-polecat-name)
 */
function findAgent(status: GtStatus, urlId: string): { agent: GtAgent; rig?: string } | null {
	// Check infrastructure agents (hq-* prefix)
	for (const agent of status.agents) {
		if (agent.session === urlId) {
			return { agent };
		}
	}

	// Parse rig-based IDs
	const parts = urlId.split('-');
	if (parts.length < 2) return null;

	// Check for polecat format: rig-polecat-name
	if (parts.length >= 3 && parts[1] === 'polecat') {
		const rigName = parts[0];
		const polecatName = parts.slice(2).join('-');

		for (const rig of status.rigs) {
			if (rig.name === rigName) {
				const agent = rig.agents.find(
					(a) => a.role === 'polecat' && a.name === polecatName
				);
				if (agent) return { agent, rig: rigName };
			}
		}
		return null;
	}

	// Check for rig agent format: rig-role
	const rigName = parts[0];
	const roleName = parts.slice(1).join('-');

	for (const rig of status.rigs) {
		if (rig.name === rigName) {
			const agent = rig.agents.find((a) => a.name === roleName || a.role === roleName);
			if (agent) return { agent, rig: rigName };
		}
	}

	return null;
}

function mapStatus(agent: GtAgent): 'running' | 'idle' | 'error' {
	if (agent.state === 'dead' || agent.state === 'error') return 'error';
	if (agent.running && agent.has_work) return 'running';
	return 'idle';
}

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const gtRoot = getGtRoot();

	try {
		// Get status from gt
		const { stdout: statusJson } = await execAsync('gt status --json', {
			cwd: gtRoot
		});

		const status: GtStatus = JSON.parse(statusJson);
		const result = findAgent(status, id);

		if (!result) {
			error(404, { message: `Agent not found: ${id}` });
		}

		const { agent, rig } = result;

		// Try to get recent output from gt peek
		let recentOutput: string | undefined;
		try {
			const peekTarget = rig ? `${rig}/${agent.name}` : agent.address;
			const { stdout } = await execAsync(`gt peek ${peekTarget} 2>/dev/null`, {
				cwd: gtRoot,
				timeout: 5000
			});
			// Limit output size
			recentOutput = stdout.slice(0, 4000);
		} catch {
			// gt peek may fail if session doesn't exist, that's OK
		}

		const agentData: AgentData = {
			id,
			name: agent.name,
			address: agent.address,
			session: agent.session,
			role: agent.role,
			status: mapStatus(agent),
			hasWork: agent.has_work,
			unreadMail: agent.unread_mail,
			firstSubject: agent.first_subject,
			rig,
			recentOutput
		};

		return { agent: agentData };
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		console.error('Failed to load agent data:', err);
		error(500, { message: 'Failed to load agent data' });
	}
};
