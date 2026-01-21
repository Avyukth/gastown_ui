import { getProcessSupervisor } from '$lib/server/cli';
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
	isDecision: boolean;
	question?: string;
	options?: DecisionOption[];
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
 * Format: "[CATEGORY] Title" or "Category: Title"
 */
function extractCategory(title: string, description?: string): string {
	// Check for [CATEGORY] format
	const bracketMatch = title.match(/^\[([^\]]+)\]/);
	if (bracketMatch) {
		return bracketMatch[1];
	}

	// Check for "Category: " format
	const colonMatch = title.match(/^([^:]+):/);
	if (colonMatch && colonMatch[1].length < 20) {
		return colonMatch[1].trim();
	}

	// Default based on issue type keywords
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
 * Format:
 * Question: What should we do?
 * Options:
 * - Option A: Description of A
 * - Option B: Description of B
 */
function parseDecision(description?: string): {
	isDecision: boolean;
	question?: string;
	options?: DecisionOption[];
} {
	if (!description) return { isDecision: false };

	// Check for decision markers
	const questionMatch = description.match(/(?:Question|Decision):\s*(.+?)(?:\n|$)/i);
	const optionsMatch = description.match(/Options?:\s*\n((?:\s*-\s*.+\n?)+)/i);

	if (!questionMatch || !optionsMatch) {
		return { isDecision: false };
	}

	const question = questionMatch[1].trim();
	const optionsText = optionsMatch[1];
	const options: DecisionOption[] = [];

	// Parse each option line
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
 * Generate demo escalations for demo mode
 */
function getDemoEscalations(): Escalation[] {
	return [
		{
			id: 'esc-demo-1',
			title: 'Merge conflict in authentication module',
			description: 'Branch polecat/rictus-auth has conflicts with main. Manual resolution required.',
			severity: 'HIGH',
			category: 'Merge Conflict',
			timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
			createdBy: 'gastown_ui/refinery',
			isDecision: false
		},
		{
			id: 'esc-demo-2',
			title: 'Decision required: API versioning strategy',
			description: 'Question: How should we handle API versioning?\nOptions:\n- URL path: /api/v1/users\n- Header: Accept-Version: v1\n- Query param: /api/users?version=1',
			severity: 'MEDIUM',
			category: 'Decision',
			timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
			createdBy: 'gastown_ui/polecats/furiosa',
			isDecision: true,
			question: 'How should we handle API versioning?',
			options: [
				{ label: 'URL path', value: '/api/v1/users' },
				{ label: 'Header', value: 'Accept-Version: v1' },
				{ label: 'Query param', value: '/api/users?version=1' }
			]
		}
	];
}

export const load: PageServerLoad = async () => {
	// In demo mode, return demo escalations directly
	if (isDemoMode()) {
		const escalations = getDemoEscalations();
		return {
			escalations,
			error: null,
			counts: {
				critical: escalations.filter((e) => e.severity === 'CRITICAL').length,
				high: escalations.filter((e) => e.severity === 'HIGH').length,
				medium: escalations.filter((e) => e.severity === 'MEDIUM').length,
				low: escalations.filter((e) => e.severity === 'LOW').length,
				total: escalations.length
			},
			dataSource: 'demo' as const
		};
	}

	try {
		// Run bd list to get escalations using async ProcessSupervisor
		const supervisor = getProcessSupervisor();
		const bdCwd = getBdCwd();
		const result = await supervisor.bd<BeadsIssue[]>(
			['list', '--status=open', '--label', 'escalation', '--json'],
			{
				timeout: 10000,
				cwd: bdCwd
			}
		);

		if (!result.success || !result.data) {
			throw new Error(result.error || 'Failed to fetch escalations');
		}

		const issues: BeadsIssue[] = result.data;

		// Transform to escalation format
		const escalations: Escalation[] = issues.map((issue) => {
			const decision = parseDecision(issue.description);

			return {
				id: issue.id,
				title: cleanTitle(issue.title),
				description: issue.description || '',
				severity: mapPriorityToSeverity(issue.priority),
				category: extractCategory(issue.title, issue.description),
				timestamp: issue.created_at,
				createdBy: issue.created_by,
				...decision
			};
		});

		// Sort by severity (CRITICAL first, then HIGH, MEDIUM, LOW)
		const severityOrder: Record<Severity, number> = {
			CRITICAL: 0,
			HIGH: 1,
			MEDIUM: 2,
			LOW: 3
		};

		escalations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

		return {
			escalations,
			error: null,
			counts: {
				critical: escalations.filter((e) => e.severity === 'CRITICAL').length,
				high: escalations.filter((e) => e.severity === 'HIGH').length,
				medium: escalations.filter((e) => e.severity === 'MEDIUM').length,
				low: escalations.filter((e) => e.severity === 'LOW').length,
				total: escalations.length
			},
			dataSource: 'live' as const
		};
	} catch (err) {
		const errorMessage =
			err instanceof Error ? err.message : 'Unknown error fetching escalations';

		return {
			escalations: [],
			error: errorMessage,
			counts: {
				critical: 0,
				high: 0,
				medium: 0,
				low: 0,
				total: 0
			},
			dataSource: 'live' as const
		};
	}
};
