/**
 * Mail Inbox API Endpoint
 *
 * Fetches mail inbox data from bd list command.
 * Returns messages with parsed type information.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface BdMailBead {
	id: string;
	title: string;
	description: string;
	status: string;
	priority: number;
	issue_type: string;
	assignee: string;
	created_at: string;
	created_by: string;
	updated_at: string;
	labels: string[];
	ephemeral: boolean;
}

interface MailMessage {
	id: string;
	from: string;
	subject: string;
	body: string;
	timestamp: string;
	read: boolean;
	priority: string;
	messageType: string;
	threadId: string;
}

/**
 * Parse subject line to extract message type
 * Recognizes patterns like: "POLECAT_DONE: ...", "ESCALATION: ...", "HANDOFF: ..."
 */
function parseMessageType(subject: string): string {
	const prefixMatch = subject.match(/^([A-Z_]+):/);
	if (prefixMatch) {
		return prefixMatch[1];
	}

	// Check for emoji-prefixed types
	if (subject.includes('HANDOFF')) return 'HANDOFF';
	if (subject.includes('ESCALATION')) return 'ESCALATION';
	if (subject.includes('DONE')) return 'DONE';
	if (subject.includes('ERROR')) return 'ERROR';

	return 'MESSAGE';
}

/**
 * Extract thread ID from labels
 */
function getThreadId(labels: string[]): string {
	const threadLabel = labels.find((l) => l.startsWith('thread:'));
	return threadLabel ? threadLabel.replace('thread:', '') : '';
}

/**
 * Transform bd list bead to mail message format
 */
function transformBead(bead: BdMailBead): MailMessage {
	return {
		id: bead.id,
		from: bead.created_by,
		subject: bead.title,
		body: bead.description || '',
		timestamp: bead.created_at,
		read: bead.status !== 'open', // open = unread
		priority: bead.priority === 1 ? 'high' : bead.priority === 3 ? 'low' : 'normal',
		messageType: parseMessageType(bead.title),
		threadId: getThreadId(bead.labels || [])
	};
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Get the identity query parameter (e.g., "ui_gastown/furiosa", "--human")
		const identity = url.searchParams.get('identity');

		let command = 'bd list --type=message --json';

		if (identity) {
			if (identity === '--human') {
				// For human, filter by assignee="human"
				command = 'bd list --type=message --assignee=human --json';
			} else {
				// For agents, filter by their full address as assignee
				command = `bd list --type=message --assignee="${identity}" --json`;
			}
		}

		const { stdout } = await execAsync(command, { timeout: 10000 });

		const rawBeads: BdMailBead[] = JSON.parse(stdout) || [];
		const messages = rawBeads.map(transformBead);

		// Sort: unread first, then by timestamp descending (newest first)
		messages.sort((a, b) => {
			if (a.read !== b.read) return a.read ? 1 : -1;
			return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
		});

		const unreadCount = messages.filter((m) => !m.read).length;

		return json({
			messages,
			unreadCount,
			error: null,
			fetchedAt: new Date().toISOString()
		});
	} catch (error) {
		console.error('Failed to fetch mail inbox:', error);

		return json(
			{
				messages: [],
				unreadCount: 0,
				error: error instanceof Error ? error.message : 'Failed to fetch mail inbox',
				fetchedAt: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
