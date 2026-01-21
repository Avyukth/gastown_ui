import { getProcessSupervisor } from '$lib/server/cli';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/** Check if demo mode is enabled */
function isDemoMode(): boolean {
	const demoMode = process.env.GASTOWN_DEMO_MODE;
	return demoMode !== 'false';
}

/** Get the beads working directory */
function getBdCwd(): string | undefined {
	return process.env.GASTOWN_BD_CWD || process.env.GASTOWN_TOWN_ROOT;
}

interface DecisionOption {
	label: string;
	value: string;
}

export interface Escalation {
	id: string;
	title: string;
	description: string;
	severity: Severity;
	category: string;
	timestamp: string;
	createdBy: string;
	updatedAt: string;
	status: string;
	isDecision: boolean;
	question?: string;
	options?: DecisionOption[];
	labels?: string[];
}

interface BeadsIssue {
	id: string;
	title: string;
	description?: string;
	status: string;
	priority: number;
	issue_type: string;
	created_at: string;
	created_by: string;
	updated_at: string;
	labels?: string[];
}

/**
 * Map priority (0-4) to severity level
 */
function mapPriorityToSeverity(priority: number): Severity {
	switch (priority) {
		case 0:
			return 'CRITICAL';
		case 1:
			return 'HIGH';
		case 2:
			return 'MEDIUM';
		default:
			return 'LOW';
	}
}

/**
 * Extract category from title or description
 */
function extractCategory(title: string): string {
	const bracketMatch = title.match(/^\[([^\]]+)\]/);
	if (bracketMatch) {
		return bracketMatch[1];
	}

	const colonMatch = title.match(/^([^:]+):/);
	if (colonMatch && colonMatch[1].length < 20) {
		return colonMatch[1].trim();
	}

	const lowerTitle = title.toLowerCase();
	if (lowerTitle.includes('decision')) return 'Decision';
	if (lowerTitle.includes('conflict')) return 'Merge Conflict';
	if (lowerTitle.includes('blocked')) return 'Blocked';
	if (lowerTitle.includes('failure') || lowerTitle.includes('failed')) return 'Failure';
	if (lowerTitle.includes('timeout')) return 'Timeout';

	return 'General';
}

/**
 * Parse decision options from description
 */
function parseDecision(description?: string): {
	isDecision: boolean;
	question?: string;
	options?: DecisionOption[];
} {
	if (!description) return { isDecision: false };

	const questionMatch = description.match(/(?:Question|Decision):\s*(.+?)(?:\n|$)/i);
	const optionsMatch = description.match(/Options?:\s*\n((?:\s*-\s*.+\n?)+)/i);

	if (!questionMatch || !optionsMatch) {
		return { isDecision: false };
	}

	const question = questionMatch[1].trim();
	const optionsText = optionsMatch[1];
	const options: DecisionOption[] = [];

	const optionLines = optionsText.split('\n').filter((line) => line.trim().startsWith('-'));
	for (const line of optionLines) {
		const optionMatch = line.match(/-\s*([^:]+)(?::\s*(.+))?/);
		if (optionMatch) {
			options.push({
				label: optionMatch[1].trim(),
				value: optionMatch[2]?.trim() || optionMatch[1].trim()
			});
		}
	}

	if (options.length === 0) {
		return { isDecision: false };
	}

	return { isDecision: true, question, options };
}

/**
 * Clean title by removing category prefix
 */
function cleanTitle(title: string): string {
	return title.replace(/^\[[^\]]+\]\s*/, '').replace(/^[^:]+:\s*/, '');
}

/**
 * Generate demo escalation for a given ID
 */
function getDemoEscalation(id: string): Escalation | null {
	const demoEscalations: Record<string, Escalation> = {
		'esc-demo-1': {
			id: 'esc-demo-1',
			title: 'Merge conflict in authentication module',
			description: 'Branch polecat/rictus-auth has conflicts with main. Manual resolution required.\n\nConflicting files:\n- src/lib/auth/jwt.ts\n- src/routes/api/auth/login/+server.ts',
			severity: 'HIGH',
			category: 'Merge Conflict',
			timestamp: new Date(Date.now() - 3600000).toISOString(),
			createdBy: 'gastown_ui/refinery',
			updatedAt: new Date(Date.now() - 1800000).toISOString(),
			status: 'open',
			isDecision: false,
			labels: ['escalation', 'merge-conflict']
		},
		'esc-demo-2': {
			id: 'esc-demo-2',
			title: 'Decision required: API versioning strategy',
			description: 'Question: How should we handle API versioning?\nOptions:\n- URL path: /api/v1/users\n- Header: Accept-Version: v1\n- Query param: /api/users?version=1',
			severity: 'MEDIUM',
			category: 'Decision',
			timestamp: new Date(Date.now() - 7200000).toISOString(),
			createdBy: 'gastown_ui/polecats/furiosa',
			updatedAt: new Date(Date.now() - 7200000).toISOString(),
			status: 'open',
			isDecision: true,
			question: 'How should we handle API versioning?',
			options: [
				{ label: 'URL path', value: '/api/v1/users' },
				{ label: 'Header', value: 'Accept-Version: v1' },
				{ label: 'Query param', value: '/api/users?version=1' }
			],
			labels: ['escalation', 'decision']
		}
	};

	return demoEscalations[id] || null;
}

export const load: PageServerLoad = async ({ params }) => {
	// In demo mode, return demo escalation
	if (isDemoMode()) {
		const escalation = getDemoEscalation(params.id);
		if (escalation) {
			return { escalation, error: null, dataSource: 'demo' as const };
		}
		// Generate generic demo escalation for unknown IDs
		return {
			escalation: {
				id: params.id,
				title: `Demo Escalation ${params.id}`,
				description: 'This is a demo escalation. Enable production mode to see real data.',
				severity: 'LOW' as Severity,
				category: 'General',
				timestamp: new Date().toISOString(),
				createdBy: 'demo',
				updatedAt: new Date().toISOString(),
				status: 'open',
				isDecision: false,
				labels: ['escalation', 'demo']
			},
			error: null,
			dataSource: 'demo' as const
		};
	}

	try {
		// Use async ProcessSupervisor instead of blocking execSync
		const supervisor = getProcessSupervisor();
		const bdCwd = getBdCwd();
		const result = await supervisor.bd<BeadsIssue>(['show', params.id, '--json'], {
			timeout: 10000,
			cwd: bdCwd
		});

		if (!result.success || !result.data) {
			throw new Error(result.error || 'Failed to fetch escalation');
		}

		const issue: BeadsIssue = result.data;
		const decision = parseDecision(issue.description);

		const escalation: Escalation = {
			id: issue.id,
			title: cleanTitle(issue.title),
			description: issue.description || '',
			severity: mapPriorityToSeverity(issue.priority),
			category: extractCategory(issue.title),
			timestamp: issue.created_at,
			createdBy: issue.created_by,
			updatedAt: issue.updated_at,
			status: issue.status,
			labels: issue.labels,
			...decision
		};

		return {
			escalation,
			error: null,
			dataSource: 'live' as const
		};
	} catch (err) {
		const errorMessage =
			err instanceof Error ? err.message : 'Unknown error fetching escalation';

		// Check if it's a "not found" error
		if (errorMessage.includes('no issue found') || errorMessage.includes('not found')) {
			throw error(404, {
				message: `Escalation ${params.id} not found`
			});
		}

		throw error(500, {
			message: errorMessage
		});
	}
};
