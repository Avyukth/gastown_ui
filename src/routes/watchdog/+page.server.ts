import { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { promisify } from 'node:util';
import type { PageServerLoad } from './$types';

const execAsync = promisify(exec);

type Freshness = 'fresh' | 'stale' | 'very-stale' | 'unknown';

interface HeartbeatData {
	timestamp: string;
	agent: string;
	status: string;
	message?: string;
}

interface TierStatus {
	name: string;
	description: string;
	running: boolean;
	lastHeartbeat: string | null;
	freshness: Freshness;
	details: string;
}

interface WatchdogData {
	timestamp: string;
	tiers: {
		daemon: TierStatus;
		boot: TierStatus;
		deacon: TierStatus;
	};
	chainHealthy: boolean;
	summary: string;
}

interface GtAgent {
	name: string;
	address: string;
	session?: string;
	role: string;
	running: boolean;
	has_work: boolean;
	state?: string;
	unread_mail?: number;
}

interface GtStatus {
	name: string;
	agents: GtAgent[];
	rigs: unknown[];
	summary: {
		rig_count: number;
		polecat_count: number;
		active_hooks: number;
	};
}

function calculateFreshness(timestamp: string | null): Freshness {
	if (!timestamp) return 'unknown';

	const heartbeatTime = new Date(timestamp).getTime();
	const now = Date.now();
	const ageMinutes = (now - heartbeatTime) / (1000 * 60);

	if (ageMinutes < 5) return 'fresh';
	if (ageMinutes < 15) return 'stale';
	return 'very-stale';
}

function formatTimeSince(timestamp: string | null): string {
	if (!timestamp) return 'Never';

	const heartbeatTime = new Date(timestamp).getTime();
	const now = Date.now();
	const ageMinutes = Math.floor((now - heartbeatTime) / (1000 * 60));

	if (ageMinutes < 1) return 'Just now';
	if (ageMinutes === 1) return '1 minute ago';
	if (ageMinutes < 60) return `${ageMinutes} minutes ago`;

	const hours = Math.floor(ageMinutes / 60);
	if (hours === 1) return '1 hour ago';
	return `${hours} hours ago`;
}

async function readHeartbeat(): Promise<HeartbeatData | null> {
	try {
		const home = process.env.HOME || homedir();
		const heartbeatPath = `${home}/gt/deacon/heartbeat.json`;
		const content = await readFile(heartbeatPath, 'utf-8');
		return JSON.parse(content);
	} catch {
		return null;
	}
}

async function readBootStatus(): Promise<{ timestamp: string; status: string } | null> {
	try {
		const home = process.env.HOME || homedir();
		const bootPath = `${home}/gt/boot/status.json`;
		const content = await readFile(bootPath, 'utf-8');
		return JSON.parse(content);
	} catch {
		return null;
	}
}

export const load: PageServerLoad = async () => {
	try {
		// Run gt status to check if daemon is responsive
		const daemonStart = Date.now();
		const { stdout } = await execAsync('gt status --json', { timeout: 10000 });
		const daemonResponseTime = Date.now() - daemonStart;
		const data: GtStatus = JSON.parse(stdout);

		// Read heartbeat files
		const deaconHeartbeat = await readHeartbeat();
		const bootStatus = await readBootStatus();

		// Find mayor (boot/triage) and deacon agents
		const mayor = data.agents.find((a) => a.role === 'coordinator');
		const deacon = data.agents.find((a) => a.role === 'health-check');

		// Daemon tier - Go process
		const daemonTier: TierStatus = {
			name: 'Daemon',
			description: 'Go process (gt daemon)',
			running: true, // If we got here, daemon is running
			lastHeartbeat: new Date().toISOString(),
			freshness: 'fresh',
			details: `Response time: ${daemonResponseTime}ms`
		};

		// Boot tier - AI triage (mayor)
		const bootTimestamp = bootStatus?.timestamp || (mayor?.running ? new Date().toISOString() : null);
		const bootTier: TierStatus = {
			name: 'Boot',
			description: 'AI triage (mayor)',
			running: mayor?.running ?? false,
			lastHeartbeat: bootTimestamp,
			freshness: mayor?.running ? 'fresh' : calculateFreshness(bootTimestamp),
			details: mayor ? (mayor.running ? 'Active coordinator' : 'Coordinator offline') : 'Mayor not found'
		};

		// Deacon tier - AI patrol
		const deaconTimestamp = deaconHeartbeat?.timestamp || null;
		const deaconTier: TierStatus = {
			name: 'Deacon',
			description: 'AI patrol (health-check)',
			running: deacon?.running ?? false,
			lastHeartbeat: deaconTimestamp,
			freshness: calculateFreshness(deaconTimestamp),
			details: deaconHeartbeat?.message || (deacon?.running ? 'Patrol active' : 'Patrol inactive')
		};

		// Determine chain health
		const chainHealthy = daemonTier.running && bootTier.running &&
			(deaconTier.running || deaconTier.freshness !== 'very-stale');

		// Generate summary
		let summary: string;
		if (chainHealthy) {
			summary = 'Watchdog chain operational';
		} else if (!daemonTier.running) {
			summary = 'Daemon offline - system unmonitored';
		} else if (!bootTier.running) {
			summary = 'Boot/triage offline - startup issues may go undetected';
		} else {
			summary = 'Deacon patrol stale - health checks may be delayed';
		}

		const watchdogData: WatchdogData = {
			timestamp: new Date().toISOString(),
			tiers: {
				daemon: daemonTier,
				boot: bootTier,
				deacon: deaconTier
			},
			chainHealthy,
			summary
		};

		return { watchdog: watchdogData, error: null };
	} catch (err) {
		// Daemon not responding
		const watchdogData: WatchdogData = {
			timestamp: new Date().toISOString(),
			tiers: {
				daemon: {
					name: 'Daemon',
					description: 'Go process (gt daemon)',
					running: false,
					lastHeartbeat: null,
					freshness: 'unknown',
					details: 'Failed to reach daemon'
				},
				boot: {
					name: 'Boot',
					description: 'AI triage (mayor)',
					running: false,
					lastHeartbeat: null,
					freshness: 'unknown',
					details: 'Cannot determine - daemon offline'
				},
				deacon: {
					name: 'Deacon',
					description: 'AI patrol (health-check)',
					running: false,
					lastHeartbeat: null,
					freshness: 'unknown',
					details: 'Cannot determine - daemon offline'
				}
			},
			chainHealthy: false,
			summary: 'Watchdog chain broken - daemon not responding'
		};

		const message = err instanceof Error ? err.message : 'Failed to reach daemon';
		return {
			watchdog: watchdogData,
			error: message
		};
	}
};
