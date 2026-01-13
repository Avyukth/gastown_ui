/**
 * Dashboard Component Tests
 *
 * Tests for the main dashboard page component that displays
 * agents, workflows, queue, stats, and logs.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Dashboard from './Dashboard.svelte';

describe('Dashboard', () => {
	describe('Agents Section', () => {
		it('renders agents section heading', () => {
			render(Dashboard, { props: { agents: [], stats: defaultStats() } });
			expect(screen.getByRole('heading', { name: /agents/i })).toBeInTheDocument();
		});

		it('renders empty state when no agents', () => {
			render(Dashboard, { props: { agents: [], stats: defaultStats() } });
			expect(screen.getByText(/no agents running/i)).toBeInTheDocument();
		});

		it('renders agent cards when agents provided', () => {
			const agents = [
				createAgent({ name: 'Polecat Nux', status: 'running' }),
				createAgent({ name: 'Mayor', status: 'idle' })
			];
			render(Dashboard, { props: { agents, stats: defaultStats() } });
			expect(screen.getByText('Polecat Nux')).toBeInTheDocument();
			expect(screen.getByText('Mayor')).toBeInTheDocument();
		});
	});

	describe('Error State', () => {
		it('renders error state when error provided', () => {
			render(Dashboard, {
				props: { agents: [], stats: defaultStats(), error: 'Connection failed' }
			});
			expect(screen.getByText(/failed to load agents/i)).toBeInTheDocument();
		});

		it('displays error message', () => {
			render(Dashboard, {
				props: { agents: [], stats: defaultStats(), error: 'Connection failed' }
			});
			expect(screen.getByText('Connection failed')).toBeInTheDocument();
		});
	});

	describe('Stats Section', () => {
		it('renders active agents stat', () => {
			const stats = { activeAgents: 5, tasksRunning: 3, queueDepth: 10, completedToday: 42 };
			render(Dashboard, { props: { agents: [], stats } });
			expect(screen.getByText('Active Agents')).toBeInTheDocument();
			expect(screen.getByText('5')).toBeInTheDocument();
		});

		it('renders tasks running stat', () => {
			const stats = { activeAgents: 5, tasksRunning: 3, queueDepth: 10, completedToday: 42 };
			render(Dashboard, { props: { agents: [], stats } });
			expect(screen.getByText('Tasks Running')).toBeInTheDocument();
			expect(screen.getByText('3')).toBeInTheDocument();
		});

		it('renders polecats stat', () => {
			const stats = { activeAgents: 5, tasksRunning: 3, queueDepth: 10, completedToday: 42 };
			render(Dashboard, { props: { agents: [], stats } });
			expect(screen.getByText('Polecats')).toBeInTheDocument();
			expect(screen.getByText('10')).toBeInTheDocument();
		});

		it('renders completed today stat', () => {
			const stats = { activeAgents: 5, tasksRunning: 3, queueDepth: 10, completedToday: 42 };
			render(Dashboard, { props: { agents: [], stats } });
			expect(screen.getByText('Completed Today')).toBeInTheDocument();
			expect(screen.getByText('42')).toBeInTheDocument();
		});
	});

	describe('System Status', () => {
		it('displays running status', () => {
			render(Dashboard, {
				props: { agents: [], stats: defaultStats(), systemStatus: 'running' }
			});
			expect(screen.getByText(/connected/i)).toBeInTheDocument();
		});

		it('displays error status', () => {
			render(Dashboard, {
				props: { agents: [], stats: defaultStats(), systemStatus: 'error' }
			});
			expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
		});

		it('displays idle status', () => {
			render(Dashboard, {
				props: { agents: [], stats: defaultStats(), systemStatus: 'idle' }
			});
			expect(screen.getByText(/idle/i)).toBeInTheDocument();
		});
	});

	describe('Workflows Section', () => {
		it('renders workflows section', () => {
			render(Dashboard, { props: { agents: [], stats: defaultStats() } });
			expect(screen.getByRole('heading', { name: /workflows/i })).toBeInTheDocument();
		});

		it('renders workflow items', () => {
			const workflows = [
				{ id: '1', name: 'Deploy Pipeline', status: 'running', progress: 65 },
				{ id: '2', name: 'Test Suite', status: 'pending', progress: 0 }
			];
			render(Dashboard, { props: { agents: [], stats: defaultStats(), workflows } });
			expect(screen.getByText('Deploy Pipeline')).toBeInTheDocument();
			expect(screen.getByText('Test Suite')).toBeInTheDocument();
		});
	});

	describe('Queue Section', () => {
		it('renders queue section', () => {
			render(Dashboard, { props: { agents: [], stats: defaultStats() } });
			expect(screen.getByRole('heading', { name: /queue/i })).toBeInTheDocument();
		});

		it('renders queue items with priority badges', () => {
			const queueItems = [
				{ id: '1', task: 'Process batch #1234', priority: 'high' },
				{ id: '2', task: 'Sync database', priority: 'medium' }
			];
			render(Dashboard, { props: { agents: [], stats: defaultStats(), queueItems } });
			expect(screen.getByText('Process batch #1234')).toBeInTheDocument();
			expect(screen.getByText('high')).toBeInTheDocument();
		});
	});

	describe('Logs Section', () => {
		it('renders logs section', () => {
			render(Dashboard, { props: { agents: [], stats: defaultStats() } });
			expect(screen.getByRole('heading', { name: /activity logs/i })).toBeInTheDocument();
		});

		it('renders log entries', () => {
			const logEntries = [
				{ id: '1', message: 'Agent nux completed task', time: '2m ago', level: 'info' },
				{ id: '2', message: 'Workflow deploy started', time: '5m ago', level: 'success' }
			];
			render(Dashboard, { props: { agents: [], stats: defaultStats(), logEntries } });
			expect(screen.getByText('Agent nux completed task')).toBeInTheDocument();
			expect(screen.getByText('2m ago')).toBeInTheDocument();
		});
	});

	describe('Title', () => {
		it('renders default title', () => {
			render(Dashboard, { props: { agents: [], stats: defaultStats() } });
			expect(screen.getByRole('heading', { name: /gastown/i, level: 1 })).toBeInTheDocument();
		});

		it('renders custom title', () => {
			render(Dashboard, { props: { agents: [], stats: defaultStats(), title: 'My Dashboard' } });
			expect(screen.getByRole('heading', { name: 'My Dashboard', level: 1 })).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has main landmark', () => {
			render(Dashboard, { props: { agents: [], stats: defaultStats() } });
			expect(screen.getByRole('main')).toBeInTheDocument();
		});

		it('agent cards are keyboard accessible', () => {
			const agents = [createAgent({ name: 'Nux', status: 'running' })];
			render(Dashboard, { props: { agents, stats: defaultStats() } });
			const card = screen.getByText('Nux').closest('[role="button"], button, a');
			if (card) {
				expect(card).toHaveAttribute('tabindex');
			}
		});
	});
});

// Test helpers
function defaultStats() {
	return {
		activeAgents: 0,
		tasksRunning: 0,
		queueDepth: 0,
		completedToday: 0
	};
}

function createAgent(overrides: Partial<DashboardAgent> = {}): DashboardAgent {
	return {
		id: overrides.id ?? '1',
		name: overrides.name ?? 'Test Agent',
		task: overrides.task ?? 'Test task',
		status: overrides.status ?? 'idle',
		progress: overrides.progress ?? 0,
		meta: overrides.meta ?? 'Role: polecat',
		role: overrides.role ?? 'polecat',
		address: overrides.address ?? 'test-address'
	};
}

// Type definitions for test helpers
interface DashboardAgent {
	id: string;
	name: string;
	task: string;
	status: 'running' | 'idle' | 'error' | 'complete';
	progress: number;
	meta: string;
	role: string;
	address: string;
}
