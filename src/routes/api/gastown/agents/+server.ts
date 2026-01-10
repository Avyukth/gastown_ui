import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface GtPolecat {
	rig: string;
	name: string;
	state: string;
	session_running: boolean;
}

interface Agent {
	id: string;
	name: string;
	displayName: string;
	type: 'human' | 'witness' | 'refinery' | 'polecat' | 'crew';
	rig?: string;
	state?: string;
	sessionRunning?: boolean;
}

/**
 * Get display name from agent address
 * Extracts the last part of the address and capitalizes it
 */
function getDisplayName(address: string): string {
	const parts = address.split('/');
	if (parts.length === 0) return address;

	const last = parts[parts.length - 1];
	if (last === 'human') return 'Human Overseer';
	if (last === 'witness') return 'Witness';
	if (last === 'refinery') return 'Refinery';

	// Capitalize first letter
	return last.charAt(0).toUpperCase() + last.slice(1);
}

/** GET: List all agents (human, witness, refinery, polecats, crew) */
export const GET: RequestHandler = async () => {
	try {
		const agents: Agent[] = [];

		// 1. Add Human Overseer at the top (always present)
		agents.push({
			id: 'human',
			name: 'human',
			displayName: 'Human Overseer',
			type: 'human'
		});

		// 2. Get rigs
		const { stdout: rigsOutput } = await execAsync('gt rigs --json', {
			timeout: 5000
		});
		const rigs: string[] = JSON.parse(rigsOutput);

		for (const rig of rigs) {
			// 3. Add Witness for each rig
			agents.push({
				id: `${rig}/witness`,
				name: 'witness',
				displayName: getDisplayName(`${rig}/witness`),
				type: 'witness',
				rig
			});

			// 4. Add Refinery for each rig
			agents.push({
				id: `${rig}/refinery`,
				name: 'refinery',
				displayName: getDisplayName(`${rig}/refinery`),
				type: 'refinery',
				rig
			});

			// 5. Get polecats for this rig
			try {
				const { stdout: polecatsOutput } = await execAsync(`gt polecat list ${rig} --json`, {
					timeout: 5000
				});
				const polecats: GtPolecat[] = JSON.parse(polecatsOutput);

				for (const polecat of polecats) {
					agents.push({
						id: `${rig}/${polecat.name}`,
						name: polecat.name,
						displayName: getDisplayName(`${rig}/${polecat.name}`),
						type: 'polecat',
						rig,
						state: polecat.state,
						sessionRunning: polecat.session_running
					});
				}
			} catch (e) {
				// If no polecats or error, continue
				console.debug(`No polecats found for rig ${rig}:`, e);
			}
		}

		return json(agents);
	} catch (error) {
		console.error('Failed to fetch agents:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch agents' },
			{ status: 500 }
		);
	}
};
