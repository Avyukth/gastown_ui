import { execSync } from 'child_process';
import type { PageServerLoad } from './$types';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

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

export const load: PageServerLoad = async () => {
	try {
		// Run bd list to get escalations
		const result = execSync('bd list --status=open --label escalation --json', {
			encoding: 'utf-8',
			timeout: 10000,
			cwd: '/Users/amrit/Documents/Projects/Rust/mouchak/gastown_exp'
		});

		const issues: BeadsIssue[] = JSON.parse(result);

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
			}
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
			}
		};
	}
};
