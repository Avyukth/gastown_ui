/**
 * Stats Page Server Load
 *
 * Fetches real statistics from Gas Town CLI commands when available.
 * Falls back to generated placeholder data in demo mode or when CLI is unavailable.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { PageServerLoad } from './$types';

const execFileAsync = promisify(execFile);

export interface AgentStats {
	id: string;
	name: string;
	role: string;
	tasksCompleted: number;
	avgResponseTime: number;
	lastActive: string;
}

export interface ConvoyStats {
	id: string;
	name: string;
	completionTime: number; // minutes
	tasksCompleted: number;
	agent: string;
}

export interface IssueCloser {
	name: string;
	closed: number;
	avgTimeToClose: number; // hours
}

export interface DailyActivity {
	date: string;
	label: string;
	active: number;
	idle: number;
	completed: number;
}

export interface HourlyVolume {
	hour: number;
	label: string;
	messages: number;
}

export interface StatsData {
	summary: {
		totalAgents: number;
		activeAgents: number;
		idleAgents: number;
		deadAgents: number;
		totalRigs: number;
		totalConvoys: number;
		activeConvoys: number;
		completedConvoys: number;
		totalIssues: number;
		openIssues: number;
		closedIssues: number;
		messagesToday: number;
	};
	health: {
		uptime: number; // percentage
		avgResponseTime: number; // ms
		errorRate: number; // percentage
	};
	charts: {
		dailyActivity: DailyActivity[];
		issueCompletion: { completed: number; open: number; rate: number };
		hourlyVolume: HourlyVolume[];
	};
	leaderboards: {
		mostActiveAgents: AgentStats[];
		fastestConvoys: ConvoyStats[];
		topIssueClosers: IssueCloser[];
	};
	performanceVerification: {
		status: 'verified' | 'warning' | 'failed';
		score: number; // percentage
		lastVerified: string;
		nextScheduled: string;
		checks: Array<{
			id: string;
			name: string;
			target: string;
			current: string;
			status: 'pass' | 'warn' | 'fail';
			confidence: number; // percentage
			note?: string;
		}>;
	};
	filters: {
		rigs: string[];
		timeRange: string;
	};
	timestamp: string;
	dataSource: 'live' | 'demo';
}

/** CLI timeout in ms */
const CLI_TIMEOUT = 10000;

/** Check if demo mode is enabled */
function isDemoMode(): boolean {
	const demoMode = process.env.GASTOWN_DEMO_MODE;
	return demoMode !== 'false';
}

/** Get the Gas Town working directory */
function getGtCwd(): string | undefined {
	return process.env.GASTOWN_TOWN_ROOT;
}

/** Get the beads working directory */
function getBdCwd(): string | undefined {
	return process.env.GASTOWN_BD_CWD;
}

/** CLI response types from gt status --json */
interface GtStatusAgent {
	name: string;
	address: string;
	session?: string;
	role: string;
	running: boolean;
	has_work: boolean;
	state?: string;
	unread_mail?: number;
}

interface GtStatusRig {
	name: string;
	polecats: string[];
	polecat_count: number;
	crews: string[] | null;
	crew_count: number;
	has_witness: boolean;
	has_refinery: boolean;
	agents: GtStatusAgent[];
}

interface GtStatus {
	name: string;
	location: string;
	rigs: GtStatusRig[];
	agents?: GtStatusAgent[];
}

/** CLI response types from bd list --json */
interface BdBead {
	id: string;
	title: string;
	status: string;
	issue_type?: string;
	priority?: number;
	created_at: string;
	closed_at?: string;
	assignee?: string;
}

/** CLI response types from gt convoy list --json */
interface GtConvoy {
	id: string;
	name: string;
	status: string;
	created_at: string;
	completed_at?: string;
	assignee?: string;
	children?: string[];
}

/**
 * Execute a CLI command safely
 */
async function execCli(
	command: string,
	args: string[],
	cwd?: string
): Promise<string | null> {
	try {
		const { stdout } = await execFileAsync(command, args, {
			timeout: CLI_TIMEOUT,
			cwd,
			env: process.env
		});
		return stdout;
	} catch {
		return null;
	}
}

/**
 * Fetch real data from CLI commands
 */
async function fetchRealStats(
	timeRange: string,
	rigFilter: string | null
): Promise<StatsData | null> {
	const gtCwd = getGtCwd();
	const bdCwd = getBdCwd();

	// Try to fetch gt status
	const statusOutput = await execCli('gt', ['status', '--json'], gtCwd);
	if (!statusOutput) {
		return null; // CLI not available
	}

	let status: GtStatus;
	try {
		status = JSON.parse(statusOutput);
	} catch {
		return null;
	}

	// Fetch beads list
	const beadsOutput = await execCli('bd', ['list', '--json', '--all'], bdCwd);
	let beads: BdBead[] = [];
	if (beadsOutput) {
		try {
			beads = JSON.parse(beadsOutput);
		} catch {
			// Continue without beads data
		}
	}

	// Fetch convoy list
	const convoyOutput = await execCli('gt', ['convoy', 'list', '--json', '--all'], gtCwd);
	let convoys: GtConvoy[] = [];
	if (convoyOutput) {
		try {
			convoys = JSON.parse(convoyOutput);
		} catch {
			// Continue without convoy data
		}
	}

	// Aggregate agent stats
	const allAgents: GtStatusAgent[] = [
		...(status.agents || []),
		...status.rigs.flatMap((rig) => rig.agents || [])
	];

	const rigs = status.rigs.filter(
		(rig) => !rigFilter || rig.name === rigFilter
	);
	const rigNames = status.rigs.map((rig) => rig.name);

	// Count agent states
	const runningAgents = allAgents.filter((a) => a.running);
	const idleAgents = allAgents.filter((a) => a.running && !a.has_work);
	const deadAgents = allAgents.filter((a) => !a.running);

	// Count issues by status
	const openIssues = beads.filter((b) => b.status === 'open' || b.status === 'in_progress');
	const closedIssues = beads.filter((b) => b.status === 'closed');

	// Count convoys by status
	const activeConvoys = convoys.filter((c) => c.status === 'open' || c.status === 'in_progress');
	const completedConvoys = convoys.filter((c) => c.status === 'closed' || c.status === 'completed');

	// Build agent leaderboard from actual agent data
	const agentLeaderboard: AgentStats[] = allAgents
		.slice(0, 10)
		.map((agent) => ({
			id: agent.address || agent.name,
			name: agent.name.charAt(0).toUpperCase() + agent.name.slice(1),
			role: agent.role,
			tasksCompleted: 0, // Would need trail data to compute
			avgResponseTime: 0,
			lastActive: agent.running ? (agent.has_work ? 'now' : 'idle') : 'offline'
		}));

	// Build convoy leaderboard from actual convoy data
	const convoyLeaderboard: ConvoyStats[] = completedConvoys
		.slice(0, 5)
		.map((convoy) => {
			const created = new Date(convoy.created_at);
			const completed = convoy.completed_at ? new Date(convoy.completed_at) : new Date();
			const completionTime = Math.round((completed.getTime() - created.getTime()) / 60000);
			return {
				id: convoy.id,
				name: convoy.name,
				completionTime,
				tasksCompleted: convoy.children?.length || 0,
				agent: convoy.assignee || 'unassigned'
			};
		});

	// Build issue closer leaderboard from beads data
	const closerCounts = new Map<string, { count: number; totalTime: number }>();
	for (const bead of closedIssues) {
		const closer = bead.assignee || 'unassigned';
		const existing = closerCounts.get(closer) || { count: 0, totalTime: 0 };
		existing.count++;
		if (bead.closed_at) {
			const created = new Date(bead.created_at);
			const closed = new Date(bead.closed_at);
			existing.totalTime += (closed.getTime() - created.getTime()) / 3600000; // hours
		}
		closerCounts.set(closer, existing);
	}

	const issueCloserLeaderboard: IssueCloser[] = Array.from(closerCounts.entries())
		.map(([name, data]) => ({
			name: name.charAt(0).toUpperCase() + name.slice(1),
			closed: data.count,
			avgTimeToClose: data.count > 0 ? Math.round(data.totalTime / data.count * 10) / 10 : 0
		}))
		.sort((a, b) => b.closed - a.closed)
		.slice(0, 5);

	// Generate daily activity from beads created/closed dates
	const today = new Date();
	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const days = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
	const dailyActivity: DailyActivity[] = [];

	for (let i = Math.min(days, 7) - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().split('T')[0];

		// Count beads created/closed on this day
		const createdOnDay = beads.filter((b) => b.created_at.startsWith(dateStr));
		const closedOnDay = beads.filter((b) => b.closed_at?.startsWith(dateStr));

		dailyActivity.push({
			date: dateStr,
			label: dayNames[date.getDay()],
			active: runningAgents.length,
			idle: idleAgents.length,
			completed: closedOnDay.length
		});
	}

	// Generate hourly volume (placeholder - would need message logs)
	const hourlyVolume: HourlyVolume[] = [];
	for (let h = 0; h < 24; h++) {
		const label = h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
		hourlyVolume.push({
			hour: h,
			label,
			messages: 0 // Would need mail/message logs to compute
		});
	}

	// Performance verification (system health)
	const now = new Date();
	const performanceChecks: StatsData['performanceVerification']['checks'] = [
		{
			id: 'agents-running',
			name: 'Agent health',
			target: '>= 80%',
			current: `${Math.round((runningAgents.length / Math.max(allAgents.length, 1)) * 100)}%`,
			status: runningAgents.length >= allAgents.length * 0.8 ? 'pass' : runningAgents.length >= allAgents.length * 0.5 ? 'warn' : 'fail',
			confidence: 95,
			note: `${runningAgents.length}/${allAgents.length} running`
		},
		{
			id: 'issue-resolution',
			name: 'Issue resolution rate',
			target: '>= 70%',
			current: `${Math.round((closedIssues.length / Math.max(beads.length, 1)) * 100)}%`,
			status: closedIssues.length >= beads.length * 0.7 ? 'pass' : closedIssues.length >= beads.length * 0.5 ? 'warn' : 'fail',
			confidence: 90,
			note: `${closedIssues.length}/${beads.length} resolved`
		},
		{
			id: 'convoy-completion',
			name: 'Convoy completion',
			target: '>= 60%',
			current: `${Math.round((completedConvoys.length / Math.max(convoys.length, 1)) * 100)}%`,
			status: completedConvoys.length >= convoys.length * 0.6 ? 'pass' : completedConvoys.length >= convoys.length * 0.4 ? 'warn' : 'fail',
			confidence: 85,
			note: `${completedConvoys.length}/${convoys.length} completed`
		}
	];

	const performanceStatus = performanceChecks.some((c) => c.status === 'fail')
		? 'failed'
		: performanceChecks.some((c) => c.status === 'warn')
			? 'warning'
			: 'verified';

	const performanceScore = Math.round(
		performanceChecks.reduce((acc, c) => acc + c.confidence, 0) / performanceChecks.length
	);

	return {
		summary: {
			totalAgents: allAgents.length,
			activeAgents: runningAgents.length,
			idleAgents: idleAgents.length,
			deadAgents: deadAgents.length,
			totalRigs: rigs.length,
			totalConvoys: convoys.length,
			activeConvoys: activeConvoys.length,
			completedConvoys: completedConvoys.length,
			totalIssues: beads.length,
			openIssues: openIssues.length,
			closedIssues: closedIssues.length,
			messagesToday: 0 // Would need mail logs
		},
		health: {
			uptime: Math.round((runningAgents.length / Math.max(allAgents.length, 1)) * 100),
			avgResponseTime: 0, // Would need timing data
			errorRate: Math.round((deadAgents.length / Math.max(allAgents.length, 1)) * 100)
		},
		charts: {
			dailyActivity,
			issueCompletion: {
				completed: closedIssues.length,
				open: openIssues.length,
				rate: Math.round((closedIssues.length / Math.max(beads.length, 1)) * 100)
			},
			hourlyVolume
		},
		leaderboards: {
			mostActiveAgents: agentLeaderboard,
			fastestConvoys: convoyLeaderboard,
			topIssueClosers: issueCloserLeaderboard
		},
		performanceVerification: {
			status: performanceStatus,
			score: performanceScore,
			lastVerified: now.toISOString(),
			nextScheduled: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
			checks: performanceChecks
		},
		filters: {
			rigs: rigNames,
			timeRange
		},
		timestamp: now.toISOString(),
		dataSource: 'live'
	};
}

/**
 * Generate placeholder stats for demo mode
 */
function generateDemoStats(timeRange: string): StatsData {
	const multiplier = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

	const dailyActivity: DailyActivity[] = [];
	const today = new Date();
	const days = Math.min(multiplier, 7);
	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// Generate consistent (non-random) demo data based on date
	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);
		const seed = date.getDate() + date.getMonth() * 31;
		dailyActivity.push({
			date: date.toISOString().split('T')[0],
			label: dayNames[date.getDay()],
			active: 5 + (seed % 5),
			idle: 1 + (seed % 3),
			completed: 8 + (seed % 10)
		});
	}

	const hourlyVolume: HourlyVolume[] = [];
	for (let h = 0; h < 24; h++) {
		const label = h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
		const isWorkHour = h >= 9 && h <= 18;
		hourlyVolume.push({
			hour: h,
			label,
			messages: isWorkHour ? 25 + (h % 20) : 5 + (h % 10)
		});
	}

	const completedIssues = Math.floor(45 * multiplier / 7);
	const openIssues = 15;
	const now = new Date();

	return {
		summary: {
			totalAgents: 12,
			activeAgents: 8,
			idleAgents: 3,
			deadAgents: 1,
			totalRigs: 3,
			totalConvoys: Math.floor(25 * multiplier / 7),
			activeConvoys: 4,
			completedConvoys: Math.floor(21 * multiplier / 7),
			totalIssues: completedIssues + openIssues,
			openIssues,
			closedIssues: completedIssues,
			messagesToday: 150
		},
		health: {
			uptime: 99.7,
			avgResponseTime: 245,
			errorRate: 0.3
		},
		charts: {
			dailyActivity,
			issueCompletion: {
				completed: completedIssues,
				open: openIssues,
				rate: Math.round((completedIssues / (completedIssues + openIssues)) * 100)
			},
			hourlyVolume
		},
		leaderboards: {
			mostActiveAgents: [
				{ id: 'mayor', name: 'Mayor', role: 'coordinator', tasksCompleted: 156, avgResponseTime: 180, lastActive: '2 min ago' },
				{ id: 'deacon', name: 'Deacon', role: 'health-check', tasksCompleted: 89, avgResponseTime: 120, lastActive: '1 min ago' },
				{ id: 'rictus', name: 'Rictus', role: 'polecat', tasksCompleted: 67, avgResponseTime: 320, lastActive: 'now' },
				{ id: 'nux', name: 'Nux', role: 'polecat', tasksCompleted: 54, avgResponseTime: 280, lastActive: '5 min ago' },
				{ id: 'witness-gt', name: 'Witness', role: 'witness', tasksCompleted: 42, avgResponseTime: 150, lastActive: '3 min ago' }
			],
			fastestConvoys: [
				{ id: 'conv-1', name: 'Auth Feature', completionTime: 12, tasksCompleted: 4, agent: 'rictus' },
				{ id: 'conv-2', name: 'Bug Fix Sprint', completionTime: 18, tasksCompleted: 7, agent: 'nux' },
				{ id: 'conv-3', name: 'UI Polish', completionTime: 25, tasksCompleted: 5, agent: 'rictus' },
				{ id: 'conv-4', name: 'API Update', completionTime: 32, tasksCompleted: 3, agent: 'slit' },
				{ id: 'conv-5', name: 'Docs Refresh', completionTime: 45, tasksCompleted: 8, agent: 'nux' }
			],
			topIssueClosers: [
				{ name: 'Mayor', closed: 45, avgTimeToClose: 2.3 },
				{ name: 'Rictus', closed: 38, avgTimeToClose: 4.1 },
				{ name: 'Nux', closed: 32, avgTimeToClose: 3.8 },
				{ name: 'Deacon', closed: 28, avgTimeToClose: 1.5 },
				{ name: 'Witness', closed: 15, avgTimeToClose: 0.8 }
			]
		},
		performanceVerification: {
			status: 'warning',
			score: 82,
			lastVerified: new Date(now.getTime() - 18 * 60 * 1000).toISOString(),
			nextScheduled: new Date(now.getTime() + 42 * 60 * 1000).toISOString(),
			checks: [
				{ id: 'frame-time', name: 'Animation frame time', target: '<= 16ms', current: '15.4ms', status: 'pass', confidence: 91, note: 'smooth 60fps' },
				{ id: 'interaction', name: 'Interaction latency', target: '<= 100ms', current: '96ms', status: 'pass', confidence: 86, note: 'fast feedback' },
				{ id: 'paint-time', name: 'Paint budget', target: '<= 8ms', current: '9.1ms', status: 'warn', confidence: 63, note: 'heavy glow' },
				{ id: 'bundle-size', name: 'Bundle size (gzip)', target: '<= 250KB', current: '182KB', status: 'pass', confidence: 89, note: 'within budget' }
			]
		},
		filters: {
			rigs: ['gastown_ui', 'api_server', 'data_pipeline'],
			timeRange
		},
		timestamp: now.toISOString(),
		dataSource: 'demo'
	};
}

export const load: PageServerLoad = async ({ url }) => {
	const timeRange = url.searchParams.get('range') || '7d';
	const rig = url.searchParams.get('rig');

	try {
		// Try to fetch real stats if not in demo mode
		if (!isDemoMode()) {
			const realStats = await fetchRealStats(timeRange, rig);
			if (realStats) {
				return { stats: realStats, error: null };
			}
		}

		// Fall back to demo stats
		const stats = generateDemoStats(timeRange);
		return { stats, error: null };
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to fetch statistics';
		return {
			stats: null,
			error: message
		};
	}
};
