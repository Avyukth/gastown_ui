/**
 * Capabilities API Endpoint
 *
 * Returns CLI version and feature flags.
 * Used by UI to determine available functionality.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { probeCapabilities, getProcessSupervisor } from '$lib/server/cli';

export const GET: RequestHandler = async ({ url }) => {
	const forceRefresh = url.searchParams.get('refresh') === 'true';

	const capabilities = await probeCapabilities(forceRefresh);
	const supervisor = getProcessSupervisor();
	const stats = supervisor.getStats();

	return json({
		...capabilities,
		supervisor: {
			queueStats: stats.queue,
			circuitBreaker: stats.circuitBreaker
		},
		probedAt: new Date().toISOString()
	});
};
