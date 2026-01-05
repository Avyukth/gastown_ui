import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

const execAsync = promisify(exec);

interface AgentConfig {
	name: string;
	command: string;
	args: string;
	type: string;
	is_custom: boolean;
}

interface PatrolControl {
	id: string;
	title: string;
	description: string;
	state: 'active' | 'muted' | 'unknown';
	muteReason?: string;
}

interface SettingsData {
	agents: AgentConfig[];
	defaultAgent: string;
	patrols: PatrolControl[];
	error: string | null;
}

async function getAgentList(): Promise<AgentConfig[]> {
	try {
		const { stdout } = await execAsync('gt config agent list --json');
		return JSON.parse(stdout);
	} catch {
		return [];
	}
}

async function getDefaultAgent(): Promise<string> {
	try {
		const { stdout } = await execAsync('gt config default-agent');
		// Output is "Default agent: claude"
		const match = stdout.match(/Default agent:\s*(\S+)/);
		return match?.[1] ?? 'claude';
	} catch {
		return 'claude';
	}
}

interface PatrolBead {
	id: string;
	title: string;
	description: string;
	labels?: string[];
}

async function getPatrolControls(): Promise<PatrolControl[]> {
	try {
		// Fetch patrol molecules
		const { stdout } = await execAsync('bd list --type=molecule --json --limit=0');
		const molecules: PatrolBead[] = JSON.parse(stdout);

		// Filter to patrol molecules only
		const patrolMolecules = molecules.filter((m) => m.title.toLowerCase().includes('patrol'));

		// Get state for each patrol
		const patrols: PatrolControl[] = await Promise.all(
			patrolMolecules.map(async (mol) => {
				let state: 'active' | 'muted' | 'unknown' = 'unknown';
				let muteReason: string | undefined;

				// Check labels for patrol state
				if (mol.labels) {
					if (mol.labels.includes('patrol:muted')) {
						state = 'muted';
					} else if (mol.labels.includes('patrol:active')) {
						state = 'active';
					}
				}

				// If no label found, try to query state directly
				if (state === 'unknown') {
					try {
						const { stdout: stateOut } = await execAsync(`bd state ${mol.id} patrol`);
						const stateValue = stateOut.trim();
						if (stateValue === 'muted') {
							state = 'muted';
						} else if (stateValue === 'active' || stateValue === '') {
							state = 'active';
						}
					} catch {
						// No state set, default to active
						state = 'active';
					}
				}

				// Try to get mute reason from comments if muted
				if (state === 'muted') {
					try {
						const { stdout: commentsOut } = await execAsync(
							`bd comments ${mol.id} --json --limit=5`
						);
						const comments = JSON.parse(commentsOut);
						// Find most recent state change comment
						const stateComment = comments.find(
							(c: { body: string }) =>
								c.body.includes('patrol=muted') || c.body.includes('State change:')
						);
						if (stateComment) {
							const reasonMatch = stateComment.body.match(/Reason:\s*(.+)/i);
							muteReason = reasonMatch?.[1] || 'No reason provided';
						}
					} catch {
						// Ignore comment fetch errors
					}
				}

				return {
					id: mol.id,
					title: mol.title,
					description: mol.description,
					state,
					muteReason
				};
			})
		);

		return patrols;
	} catch {
		return [];
	}
}

export const load: PageServerLoad = async (): Promise<SettingsData> => {
	try {
		const [agents, defaultAgent, patrols] = await Promise.all([
			getAgentList(),
			getDefaultAgent(),
			getPatrolControls()
		]);

		return {
			agents,
			defaultAgent,
			patrols,
			error: null
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to load settings';
		return {
			agents: [],
			defaultAgent: 'claude',
			patrols: [],
			error: message
		};
	}
};

export const actions: Actions = {
	setDefaultAgent: async ({ request }) => {
		const data = await request.formData();
		const agent = data.get('agent');

		if (!agent || typeof agent !== 'string') {
			return fail(400, { error: 'Agent name is required' });
		}

		try {
			await execAsync(`gt config default-agent ${agent}`);
			return { success: true };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to set default agent';
			return fail(500, { error: message });
		}
	},

	addAgent: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		const command = data.get('command');

		if (!name || typeof name !== 'string' || !command || typeof command !== 'string') {
			return fail(400, { error: 'Agent name and command are required' });
		}

		try {
			await execAsync(`gt config agent set "${name}" "${command}"`);
			return { success: true };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to add agent';
			return fail(500, { error: message });
		}
	},

	removeAgent: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');

		if (!name || typeof name !== 'string') {
			return fail(400, { error: 'Agent name is required' });
		}

		try {
			await execAsync(`gt config agent remove "${name}"`);
			return { success: true };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to remove agent';
			return fail(500, { error: message });
		}
	},

	mutePatrol: async ({ request }) => {
		const data = await request.formData();
		const patrolId = data.get('patrolId');
		const reason = data.get('reason');

		if (!patrolId || typeof patrolId !== 'string') {
			return fail(400, { error: 'Patrol ID is required' });
		}

		const reasonStr = reason && typeof reason === 'string' ? reason : 'Muted via UI';

		try {
			// Escape quotes in reason
			const escapedReason = reasonStr.replace(/"/g, '\\"');
			await execAsync(`bd set-state ${patrolId} patrol=muted --reason "${escapedReason}"`);
			return { success: true, action: 'mute' };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to mute patrol';
			return fail(500, { error: message });
		}
	},

	unmutePatrol: async ({ request }) => {
		const data = await request.formData();
		const patrolId = data.get('patrolId');

		if (!patrolId || typeof patrolId !== 'string') {
			return fail(400, { error: 'Patrol ID is required' });
		}

		try {
			await execAsync(`bd set-state ${patrolId} patrol=active --reason "Unmuted via UI"`);
			return { success: true, action: 'unmute' };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to unmute patrol';
			return fail(500, { error: message });
		}
	}
};
