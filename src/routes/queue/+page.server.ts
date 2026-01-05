/**
 * Queue Page Server Load
 *
 * Fetches merge queue data from beads system.
 * Falls back to empty array if command fails.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { PageServerLoad } from './$types';

const execAsync = promisify(exec);

interface BeadItem {
	id: string;
	title: string;
	type: string;
	status: string;
	priority: number;
	assignee?: string;
	created?: string;
	updated?: string;
}

interface QueueItem {
	id: string;
	title: string;
	priority: 0 | 1 | 2 | 3 | 4;
	assignee?: string;
	status?: string;
	statusType: 'ready' | 'pending' | 'conflict';
}

/**
 * Determine status type for color coding
 */
function getStatusType(item: BeadItem): 'ready' | 'pending' | 'conflict' {
	const status = item.status?.toLowerCase() ?? '';

	if (status.includes('conflict') || status.includes('fail') || status.includes('error')) {
		return 'conflict';
	}

	if (status.includes('ready') || status.includes('merged') || status.includes('complete')) {
		return 'ready';
	}

	return 'pending';
}

/**
 * Transform bead item to queue item
 */
function transformToQueueItem(item: BeadItem): QueueItem {
	const priority = Math.min(Math.max(item.priority ?? 2, 0), 4) as 0 | 1 | 2 | 3 | 4;

	return {
		id: item.id,
		title: item.title,
		priority,
		assignee: item.assignee,
		status: item.status ?? 'pending',
		statusType: getStatusType(item)
	};
}

export const load: PageServerLoad = async () => {
	try {
		// Fetch merge requests from beads
		const { stdout } = await execAsync('bd list --type=merge_request --status=open --json', {
			timeout: 5000
		});

		const beadItems: BeadItem[] = JSON.parse(stdout);
		const queueItems = beadItems.map(transformToQueueItem);

		return {
			items: queueItems,
			error: null,
			fetchedAt: new Date().toISOString()
		};
	} catch (err) {
		console.error('Failed to fetch merge queue:', err);

		return {
			items: [],
			error: 'Failed to fetch merge queue data',
			fetchedAt: new Date().toISOString()
		};
	}
};
