#!/usr/bin/env bun
/**
 * Generate LLM-friendly documentation files
 *
 * Outputs:
 *   - static/llms.txt      (~500 lines, concise index)
 *   - static/llms-full.txt (~3000 lines, comprehensive)
 *
 * Run: bun scripts/generate-llms-txt.ts
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const STATIC_DIR = join(ROOT, 'static');
const SRC_DIR = join(ROOT, 'src');

interface EndpointInfo {
	method: string;
	path: string;
	description: string;
}

interface ComponentInfo {
	name: string;
	category: string;
}

interface IssueInfo {
	id: string;
	priority: string;
	title: string;
	status: string;
}

async function getVersion(): Promise<string> {
	try {
		const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf-8'));
		return pkg.version || '1.0.0';
	} catch {
		return '1.0.0';
	}
}

async function getApiEndpoints(): Promise<EndpointInfo[]> {
	const endpoints: EndpointInfo[] = [];
	const apiDir = join(SRC_DIR, 'routes/api');

	async function scanDir(dir: string, basePath: string): Promise<void> {
		try {
			const entries = await readdir(dir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = join(dir, entry.name);

				if (entry.isDirectory()) {
					const segment = entry.name.startsWith('[') ? entry.name : entry.name;
					await scanDir(fullPath, `${basePath}/${segment}`);
				} else if (entry.name === '+server.ts') {
					const content = await readFile(fullPath, 'utf-8');
					const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

					for (const method of methods) {
						if (content.includes(`export async function ${method}`) ||
						    content.includes(`export function ${method}`) ||
						    content.includes(`export const ${method}`)) {
							endpoints.push({
								method,
								path: basePath.replace(/\[(\w+)\]/g, ':$1'),
								description: extractDescription(content, method)
							});
						}
					}
				}
			}
		} catch {
			// Directory doesn't exist
		}
	}

	await scanDir(apiDir, '/api');
	return endpoints.sort((a, b) => a.path.localeCompare(b.path));
}

function extractDescription(content: string, method: string): string {
	const methodIndex = content.indexOf(`function ${method}`);
	if (methodIndex === -1) return '';

	const before = content.slice(Math.max(0, methodIndex - 200), methodIndex);
	const commentMatch = before.match(/\/\*\*[\s\S]*?\*\/\s*$/);
	if (commentMatch) {
		const comment = commentMatch[0];
		const descMatch = comment.match(/\*\s+([^@*\n]+)/);
		return descMatch ? descMatch[1].trim() : '';
	}

	const lineMatch = before.match(/\/\/\s*(.+)\s*$/);
	return lineMatch ? lineMatch[1].trim() : '';
}

async function getComponents(): Promise<ComponentInfo[]> {
	const components: ComponentInfo[] = [];
	const componentsDir = join(SRC_DIR, 'lib/components');

	try {
		const entries = await readdir(componentsDir, { withFileTypes: true });

		for (const entry of entries) {
			if (entry.isFile() && entry.name.endsWith('.svelte')) {
				const name = entry.name.replace('.svelte', '');
				const category = categorizeComponent(name);
				components.push({ name, category });
			}
		}
	} catch {
		// Components directory doesn't exist
	}

	return components.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

function categorizeComponent(name: string): string {
	const categories: Record<string, string[]> = {
		'Core': ['Button', 'Badge', 'Input', 'Switch', 'Icon'],
		'Layout': ['Dashboard', 'DashboardLayout', 'PageHeader', 'SplitView', 'Sidebar', 'BottomNav', 'SheetNav'],
		'Status': ['StatusIndicator', 'StatusBadge', 'ProgressBar', 'CircularProgress'],
		'Loading': ['Skeleton', 'SkeletonCard', 'SkeletonGroup', 'SkeletonLoader', 'NavigationLoader'],
		'Accessibility': ['Announcer', 'LiveRegion', 'SkipLink', 'KeyboardHelpDialog', 'TouchTarget'],
		'Mobile': ['SwipeableItem', 'SwipeableTabs', 'PullToRefresh', 'OfflineIndicator', 'FloatingActionButton'],
		'Data': ['DataTable', 'ActivityFeed', 'AgentCard', 'StatsCard', 'VirtualList', 'LogEntry'],
		'Feedback': ['Toast', 'ToastContainer', 'ErrorState', 'EmptyState', 'ErrorBoundary', 'ApiError']
	};

	for (const [category, names] of Object.entries(categories)) {
		if (names.includes(name)) return category;
	}
	return 'Other';
}

async function getKnownBugs(): Promise<IssueInfo[]> {
	try {
		const output = execSync('bd list --type bug --status open', {
			cwd: ROOT,
			encoding: 'utf-8',
			timeout: 5000
		});

		return parseBeadsOutput(output);
	} catch {
		return [];
	}
}

async function getOpenTasks(): Promise<IssueInfo[]> {
	try {
		const output = execSync('bd list --type task --status open --limit 20', {
			cwd: ROOT,
			encoding: 'utf-8',
			timeout: 5000
		});

		return parseBeadsOutput(output);
	} catch {
		return [];
	}
}

function parseBeadsOutput(output: string): IssueInfo[] {
	const issues: IssueInfo[] = [];
	const lines = output.split('\n');

	for (const line of lines) {
		const match = line.match(/[○●]\s+(\S+)\s+\[(●\s+P\d|○\s+P\d)\]\s+\[(\w+)\]\s+-\s+(.+)/);
		if (match) {
			issues.push({
				id: match[1],
				priority: match[2].replace('● ', '').replace('○ ', ''),
				title: match[4].trim(),
				status: 'open'
			});
		}
	}

	return issues;
}

async function getRoutePages(): Promise<string[]> {
	const pages: string[] = [];
	const routesDir = join(SRC_DIR, 'routes');

	async function scanDir(dir: string, basePath: string): Promise<void> {
		try {
			const entries = await readdir(dir, { withFileTypes: true });

			for (const entry of entries) {
				if (entry.isDirectory() && !entry.name.startsWith('api')) {
					const segment = entry.name.startsWith('(') ? '' : entry.name;
					const newPath = segment ? `${basePath}/${segment}` : basePath;
					await scanDir(join(dir, entry.name), newPath);
				} else if (entry.name === '+page.svelte') {
					pages.push(basePath || '/');
				}
			}
		} catch {
			// Directory doesn't exist
		}
	}

	await scanDir(routesDir, '');
	return pages.sort();
}

async function generateConcise(): Promise<string> {
	const version = await getVersion();
	const endpoints = await getApiEndpoints();
	const components = await getComponents();
	const bugs = await getKnownBugs();
	const pages = await getRoutePages();

	const lines: string[] = [
		'# Gastown UI - LLM Context Index',
		`# Generated: ${new Date().toISOString()}`,
		`# Version: ${version}`,
		'',
		'## Project Overview',
		'',
		'Gastown UI is the frontend dashboard for the Gas Town orchestration system.',
		'It provides an operator console for managing AI agents, work convoys, merge',
		'queues, and system health monitoring.',
		'',
		'**Stack**: SvelteKit + Vite, Tailwind CSS, TypeScript, Bun',
		'**Target**: Mobile-first PWA with offline support',
		'',
		'## Quick Start',
		'',
		'```bash',
		'bun install',
		'bun run dev      # http://localhost:5173',
		'bun run build    # Production build',
		'bun run check    # TypeScript check',
		'```',
		'',
		'## Architecture',
		'',
		'```',
		'src/',
		'├── lib/',
		'│   ├── components/   # ' + components.length + ' Svelte 5 components',
		'│   ├── api/          # API client utilities',
		'│   ├── stores/       # Svelte stores (WebSocket, state)',
		'│   └── utils/        # Logger, keyboard, gestures',
		'├── routes/',
		'│   ├── api/          # SvelteKit API routes',
		'│   └── [pages]/      # UI pages',
		'└── static/           # Static assets, PWA manifest',
		'```',
		'',
		'## API Endpoints',
		'',
		'| Method | Path | Description |',
		'|--------|------|-------------|'
	];

	for (const ep of endpoints) {
		lines.push(`| ${ep.method} | ${ep.path} | ${ep.description || '-'} |`);
	}

	lines.push('', '## UI Pages', '', '| Route | Purpose |', '|-------|---------|');

	const pageDescriptions: Record<string, string> = {
		'/': 'Dashboard overview',
		'/agents': 'Agent list and status',
		'/convoys': 'Convoy tracking',
		'/work': 'Work management',
		'/mail': 'Notifications',
		'/queue': 'Merge queue',
		'/logs': 'System logs',
		'/health': 'System health',
		'/rigs': 'Rig management',
		'/settings': 'User settings',
		'/workflows': 'Workflow management',
		'/login': 'Authentication'
	};

	for (const page of pages) {
		const desc = pageDescriptions[page] || '-';
		lines.push(`| ${page} | ${desc} |`);
	}

	lines.push('', '## Component Library', '');

	const byCategory = components.reduce((acc, c) => {
		if (!acc[c.category]) acc[c.category] = [];
		acc[c.category].push(c.name);
		return acc;
	}, {} as Record<string, string[]>);

	for (const [category, names] of Object.entries(byCategory)) {
		lines.push(`### ${category}`);
		lines.push(names.join(', '));
		lines.push('');
	}

	if (bugs.length > 0) {
		lines.push('## Known Bugs', '', '| ID | Priority | Description |', '|----|----------|-------------|');
		for (const bug of bugs) {
			lines.push(`| ${bug.id} | ${bug.priority} | ${bug.title} |`);
		}
		lines.push('');
	}

	lines.push(
		'## Error Codes',
		'',
		'| Code | Meaning |',
		'|------|---------|',
		'| AUTH_EXPIRED | Session token expired |',
		'| AUTH_INVALID | Invalid credentials |',
		'| RATE_LIMITED | Too many requests |',
		'| UPSTREAM_TIMEOUT | Backend CLI timeout |',
		'| BEADS_ERROR | Issue tracker error |',
		'',
		'## Security Features',
		'',
		'- CSP headers (self + fonts.googleapis.com)',
		'- CSRF double-submit cookie pattern',
		'- HttpOnly auth cookies',
		'- HSTS in production',
		'',
		'## Accessibility',
		'',
		'- WCAG 2.5.5 AAA touch targets (48px min)',
		'- Safe area insets for notched devices',
		'- Screen reader live regions',
		'- prefers-reduced-motion support',
		'',
		'## Environment Variables',
		'',
		'```bash',
		'VITE_WS_URL=ws://localhost:8080/ws',
		'VITE_MOCK_API=true',
		'```',
		'',
		'## Links',
		'',
		'- Repository: https://github.com/Avyukth/gastown_ui',
		'- Full docs: /llms-full.txt'
	);

	return lines.join('\n');
}

async function generateFull(): Promise<string> {
	const version = await getVersion();
	const endpoints = await getApiEndpoints();
	const components = await getComponents();
	const bugs = await getKnownBugs();
	const tasks = await getOpenTasks();
	const pages = await getRoutePages();

	const readmeContent = await readFile(join(ROOT, 'README.md'), 'utf-8').catch(() => '');
	const agentsContent = await readFile(join(ROOT, 'AGENTS.md'), 'utf-8').catch(() => '');

	const sections: string[] = [
		'# Gastown UI - Complete Documentation',
		`# Generated: ${new Date().toISOString()}`,
		`# Version: ${version}`,
		'',
		'=' .repeat(80),
		'SECTION 1: PROJECT OVERVIEW',
		'=' .repeat(80),
		'',
		readmeContent,
		'',
		'=' .repeat(80),
		'SECTION 2: API ENDPOINTS',
		'=' .repeat(80),
		''
	];

	for (const ep of endpoints) {
		sections.push(`### ${ep.method} ${ep.path}`);
		if (ep.description) sections.push(ep.description);
		sections.push('');
	}

	sections.push(
		'=' .repeat(80),
		'SECTION 3: COMPONENTS',
		'=' .repeat(80),
		''
	);

	const byCategory = components.reduce((acc, c) => {
		if (!acc[c.category]) acc[c.category] = [];
		acc[c.category].push(c.name);
		return acc;
	}, {} as Record<string, string[]>);

	for (const [category, names] of Object.entries(byCategory)) {
		sections.push(`## ${category}`);
		for (const name of names) {
			sections.push(`- ${name}.svelte`);
		}
		sections.push('');
	}

	sections.push(
		'=' .repeat(80),
		'SECTION 4: UI PAGES',
		'=' .repeat(80),
		''
	);

	for (const page of pages) {
		sections.push(`- ${page}`);
	}

	sections.push(
		'',
		'=' .repeat(80),
		'SECTION 5: KNOWN ISSUES',
		'=' .repeat(80),
		''
	);

	if (bugs.length > 0) {
		sections.push('## Bugs');
		for (const bug of bugs) {
			sections.push(`- [${bug.id}] ${bug.priority}: ${bug.title}`);
		}
		sections.push('');
	}

	if (tasks.length > 0) {
		sections.push('## Open Tasks');
		for (const task of tasks) {
			sections.push(`- [${task.id}] ${task.priority}: ${task.title}`);
		}
		sections.push('');
	}

	if (agentsContent) {
		sections.push(
			'=' .repeat(80),
			'SECTION 6: AGENT INSTRUCTIONS',
			'=' .repeat(80),
			'',
			agentsContent
		);
	}

	sections.push(
		'',
		'=' .repeat(80),
		'END OF DOCUMENTATION',
		'=' .repeat(80)
	);

	return sections.join('\n');
}

async function main(): Promise<void> {
	console.log('Generating LLM documentation...');

	const concise = await generateConcise();
	const full = await generateFull();

	await writeFile(join(STATIC_DIR, 'llms.txt'), concise);
	await writeFile(join(STATIC_DIR, 'llms-full.txt'), full);

	const conciseStats = await stat(join(STATIC_DIR, 'llms.txt'));
	const fullStats = await stat(join(STATIC_DIR, 'llms-full.txt'));

	console.log(`✓ static/llms.txt (${(conciseStats.size / 1024).toFixed(1)}KB, ${concise.split('\n').length} lines)`);
	console.log(`✓ static/llms-full.txt (${(fullStats.size / 1024).toFixed(1)}KB, ${full.split('\n').length} lines)`);
}

main().catch((err) => {
	console.error('Error generating docs:', err);
	process.exit(1);
});
