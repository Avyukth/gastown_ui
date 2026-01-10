/**
 * Data constants for the Global Search component
 */
import {
	Home,
	Bot,
	Briefcase,
	Truck,
	ClipboardList,
	Mail,
	Bell,
	ScrollText,
	Settings,
	Users,
	Dog
} from 'lucide-svelte';
import { goto } from '$app/navigation';
import type {
	RouteItem,
	CommandItem,
	AgentItem,
	IssueItem,
	ConvoyItem,
	RecentItem,
	SearchSuggestion,
	FilterOption
} from './types';

// Navigation routes
export const routes: RouteItem[] = [
	{ path: '/', label: 'Dashboard', icon: Home },
	{ path: '/agents', label: 'Agents', icon: Bot },
	{ path: '/work', label: 'Work', icon: Briefcase },
	{ path: '/convoys', label: 'Convoys', icon: Truck },
	{ path: '/queue', label: 'Queue', icon: ClipboardList },
	{ path: '/mail', label: 'Mail', icon: Mail },
	{ path: '/escalations', label: 'Escalations', icon: Bell },
	{ path: '/logs', label: 'Logs', icon: ScrollText },
	{ path: '/settings', label: 'Settings', icon: Settings },
	{ path: '/crew', label: 'Crew', icon: Users },
	{ path: '/watchdog', label: 'Watchdog', icon: Dog }
];

// Commands (> prefix)
export const commands: CommandItem[] = [
	{
		id: 'new-issue',
		label: 'New Issue',
		description: 'Create a new issue',
		action: () => goto('/work')
	},
	{
		id: 'new-convoy',
		label: 'New Convoy',
		description: 'Create a new convoy',
		action: () => goto('/work')
	},
	{
		id: 'go-settings',
		label: 'Go to Settings',
		description: 'Open settings page',
		action: () => goto('/settings')
	},
	{
		id: 'go-mail',
		label: 'Compose Mail',
		description: 'Write a new message',
		action: () => goto('/mail/compose')
	},
	{
		id: 'refresh',
		label: 'Refresh',
		description: 'Reload current page',
		action: () => window.location.reload()
	}
];

// Mock data for search results
export const mockAgents: AgentItem[] = [
	{ id: 'mayor', name: 'Mayor', status: 'running', task: 'Coordinating work' },
	{ id: 'witness-1', name: 'Witness (gastown_ui)', status: 'running', task: 'Monitoring polecats' },
	{ id: 'refinery-1', name: 'Refinery (gastown_ui)', status: 'idle', task: 'Waiting for merges' },
	{ id: 'polecat-morsov', name: 'Polecat Morsov', status: 'running', task: 'Building features' },
	{ id: 'polecat-rictus', name: 'Polecat Rictus', status: 'idle', task: 'Awaiting work' }
];

export const mockIssues: IssueItem[] = [
	{ id: 'gt-d3a', title: 'Authentication', type: 'epic', priority: 1 },
	{ id: 'gt-2hs', title: 'UI Components', type: 'epic', priority: 2 },
	{ id: 'gt-be4', title: 'Auth Token Refresh', type: 'task', priority: 2 },
	{ id: 'gt-931', title: 'CSRF Protection', type: 'task', priority: 2 },
	{ id: 'gt-3v5', title: 'Command Palette', type: 'task', priority: 2 },
	{ id: 'hq-7vsv', title: 'Global Search', type: 'task', priority: 1 }
];

export const mockConvoys: ConvoyItem[] = [
	{ id: 'convoy-001', name: 'Auth Sprint', status: 'active', progress: 45 },
	{ id: 'convoy-002', name: 'UI Polish', status: 'active', progress: 70 },
	{ id: 'convoy-003', name: 'Mobile PWA', status: 'stale', progress: 30 }
];

// Recent items (simulated) - shown with clock icon at 60% opacity
export const recentItems: RecentItem[] = [
	{ type: 'agent', id: 'polecat-morsov', label: 'Polecat Morsov', path: '/agents/polecat-morsov' },
	{ type: 'issue', id: 'hq-7vsv', label: 'Global Search', path: '/work' },
	{ type: 'route', id: 'convoys', label: 'Convoys', path: '/convoys' }
];

// Search suggestions for empty state
export const searchSuggestions: SearchSuggestion[] = [
	{ query: 'running agents', description: 'Find active agents' },
	{ query: 'P1 issues', description: 'High priority issues' },
	{ query: '>new issue', description: 'Create a new issue' },
	{ query: 'convoy', description: 'View convoy status' }
];

// Filter options
export const filterOptions: FilterOption[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Agents', value: 'agent' },
	{ label: 'Issues', value: 'issue' },
	{ label: 'Convoys', value: 'convoy' }
];

// Group labels for result categories
export const groupLabels: Record<string, string> = {
	recent: 'Recent',
	agent: 'Agents',
	issue: 'Issues',
	convoy: 'Convoys',
	route: 'Routes',
	command: 'Commands'
};
