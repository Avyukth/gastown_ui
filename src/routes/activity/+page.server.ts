import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { PageServerLoad } from './$types';

/** Check if demo mode is enabled */
function isDemoMode(): boolean {
	const demoMode = process.env.GASTOWN_DEMO_MODE;
	return demoMode !== 'false';
}

/** Get the town root directory from environment variables */
function getTownRoot(): string | undefined {
	return process.env.GASTOWN_TOWN_ROOT;
}

/** Get the events file path */
function getEventsFile(): string | undefined {
	const townRoot = getTownRoot();
	return townRoot ? join(townRoot, '.events.jsonl') : undefined;
}

interface GasTownEvent {
	ts: string;
	source: string;
	type: string;
	actor: string;
	payload?: Record<string, unknown>;
	visibility?: string;
}

export interface ActivityEvent {
	id: string;
	timestamp: string;
	type: string;
	actor: string;
	actorDisplay: string;
	description: string;
	payload?: Record<string, unknown>;
	icon: string;
}

/**
 * Format actor name for display
 */
function formatActor(actor: string): string {
	if (actor.includes('/polecats/')) {
		const parts = actor.split('/');
		return parts[parts.length - 1];
	}
	if (actor.includes('/witness')) {
		return 'Witness';
	}
	if (actor.includes('/refinery')) {
		return 'Refinery';
	}
	return actor.charAt(0).toUpperCase() + actor.slice(1);
}

/**
 * Get icon for event type
 */
function getEventIcon(type: string): string {
	const icons: Record<string, string> = {
		session_start: 'play',
		session_end: 'stop',
		spawn: 'rocket',
		nudge: 'bell',
		mail_sent: 'send',
		mail_received: 'inbox',
		work_started: 'play-circle',
		work_completed: 'check-circle',
		merge: 'git-merge',
		test_pass: 'check',
		test_fail: 'x',
		error: 'alert-triangle'
	};
	return icons[type] || 'activity';
}

/**
 * Build a human-readable description from event type and payload
 */
function buildDescription(event: GasTownEvent): string {
	const payload = event.payload || {};

	switch (event.type) {
		case 'session_start':
			return payload.topic ? `Session started: ${payload.topic}` : 'Session started';

		case 'session_end':
			return 'Session ended';

		case 'spawn':
			return `Spawned ${payload.polecat} in ${payload.rig}`;

		case 'nudge':
			return `Nudged ${payload.target}: ${payload.reason || 'check-in'}`;

		case 'mail_sent':
			return `Sent mail to ${payload.to}: "${payload.subject || 'no subject'}"`;

		case 'mail_received':
			return `Received mail from ${payload.from}`;

		case 'work_started':
			return `Started work on ${payload.bead || payload.issue || 'task'}`;

		case 'work_completed':
			return `Completed ${payload.bead || payload.issue || 'task'}`;

		case 'merge':
			return `Merged ${payload.branch} to main`;

		case 'test_pass':
			return `Tests passed for ${payload.branch || 'branch'}`;

		case 'test_fail':
			return `Tests failed for ${payload.branch || 'branch'}`;

		case 'error':
			return `Error: ${payload.message || payload.error || 'unknown'}`;

		default:
			const details = Object.entries(payload)
				.filter(([k]) => !['actor_pid', 'cwd', 'session_id'].includes(k))
				.slice(0, 3)
				.map(([k, v]) => `${k}=${v}`)
				.join(', ');
			return details || event.type.replace(/_/g, ' ');
	}
}

/**
 * Generate demo activity events
 */
function getDemoEvents(): ActivityEvent[] {
	const now = Date.now();
	return [
		{
			id: 'evt-1',
			timestamp: new Date(now - 300000).toISOString(),
			type: 'merge',
			actor: 'gastown_ui/refinery',
			actorDisplay: 'Refinery',
			description: 'Merged branch polecat/rictus-auth to main',
			icon: 'git-merge'
		},
		{
			id: 'evt-2',
			timestamp: new Date(now - 600000).toISOString(),
			type: 'test_pass',
			actor: 'gastown_ui/refinery',
			actorDisplay: 'Refinery',
			description: 'Tests passed for polecat/rictus-auth',
			icon: 'check'
		},
		{
			id: 'evt-3',
			timestamp: new Date(now - 900000).toISOString(),
			type: 'work_completed',
			actor: 'gastown_ui/polecats/rictus',
			actorDisplay: 'rictus',
			description: 'Completed gt-d3a Authentication',
			icon: 'check-circle'
		},
		{
			id: 'evt-4',
			timestamp: new Date(now - 1200000).toISOString(),
			type: 'spawn',
			actor: 'gastown_ui/witness',
			actorDisplay: 'Witness',
			description: 'Spawned polecat rictus in gastown_ui',
			icon: 'rocket'
		},
		{
			id: 'evt-5',
			timestamp: new Date(now - 1500000).toISOString(),
			type: 'session_start',
			actor: 'gastown_ui/witness',
			actorDisplay: 'Witness',
			description: 'Session started: patrol cycle',
			icon: 'play'
		}
	];
}

export const load: PageServerLoad = async ({ url }) => {
	const typeFilter = url.searchParams.get('type') || '';
	const actorFilter = url.searchParams.get('actor') || '';

	// In demo mode, return demo events
	if (isDemoMode()) {
		const events = getDemoEvents();
		const types = [...new Set(events.map((e) => e.type))].sort();
		const actors = [...new Set(events.map((e) => e.actorDisplay))].sort();
		return {
			events,
			types,
			actors,
			error: null,
			filters: { type: typeFilter, actor: actorFilter },
			dataSource: 'demo' as const
		};
	}

	try {
		const eventsFile = getEventsFile();

		if (!eventsFile || !existsSync(eventsFile)) {
			return {
				events: [],
				types: [],
				actors: [],
				error: null,
				filters: { type: typeFilter, actor: actorFilter },
				dataSource: 'live' as const
			};
		}

		const content = readFileSync(eventsFile, 'utf-8');
		const lines = content.split('\n').filter((line: string) => line.trim());

		const rawEvents: GasTownEvent[] = [];
		for (const line of lines) {
			try {
				rawEvents.push(JSON.parse(line));
			} catch {
				continue;
			}
		}

		// Extract unique types and actors for filters
		const types = [...new Set(rawEvents.map((e) => e.type))].sort();
		const actors = [...new Set(rawEvents.map((e) => formatActor(e.actor)))].sort();

		// Apply filters
		let filtered = rawEvents;
		if (typeFilter) {
			filtered = filtered.filter((e) => e.type === typeFilter);
		}
		if (actorFilter) {
			filtered = filtered.filter((e) => formatActor(e.actor) === actorFilter);
		}

		// Convert to activity events
		const events: ActivityEvent[] = filtered.map((event, index) => ({
			id: `evt-${index}`,
			timestamp: event.ts,
			type: event.type,
			actor: event.actor,
			actorDisplay: formatActor(event.actor),
			description: buildDescription(event),
			payload: event.payload,
			icon: getEventIcon(event.type)
		}));

		// Return most recent 100, newest first
		const recentEvents = events.reverse().slice(0, 100);

		return {
			events: recentEvents,
			types,
			actors,
			error: null,
			filters: { type: typeFilter, actor: actorFilter },
			dataSource: 'live' as const
		};
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error reading events';
		return {
			events: [],
			types: [],
			actors: [],
			error: errorMessage,
			filters: { type: typeFilter, actor: actorFilter },
			dataSource: 'live' as const
		};
	}
};
