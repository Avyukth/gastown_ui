/**
 * Capabilities Probe - CLI version detection and feature flags
 * Architecture Decision: D0.6 - Capabilities Probe + CLI Contracts
 *
 * Detects:
 * - CLI version (gt --version, bd --version)
 * - Available features based on version
 * - CLI availability
 */

import type { CapabilitiesResult } from './contracts';
import { getProcessSupervisor } from './process-supervisor';

let cachedCapabilities: CapabilitiesResult | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000;

export async function probeCapabilities(forceRefresh = false): Promise<CapabilitiesResult> {
	const now = Date.now();
	if (!forceRefresh && cachedCapabilities && now - cacheTime < CACHE_TTL) {
		return cachedCapabilities;
	}

	const supervisor = getProcessSupervisor();

	const [gtResult, bdResult] = await Promise.all([
		supervisor.gt<string>(['--version'], { timeout: 5000, dedupe: true }),
		supervisor.bd<string>(['--version'], { timeout: 5000, dedupe: true })
	]);

	const gtVersion = gtResult.success ? parseVersion(String(gtResult.data)) : null;
	const bdVersion = bdResult.success ? parseVersion(String(bdResult.data)) : null;

	const available = gtResult.success || bdResult.success;

	const features = {
		jsonOutput: true,
		mail: gtVersion !== null,
		work: bdVersion !== null,
		convoys: bdVersion !== null,
		workflows: gtVersion !== null && compareVersions(gtVersion, '0.2.0') >= 0
	};

	const error = !available
		? 'CLI tools are not available: ' +
			[gtResult.error, bdResult.error].filter(Boolean).join('; ')
		: null;

	cachedCapabilities = {
		gtVersion,
		bdVersion,
		features,
		available,
		error
	};
	cacheTime = now;

	return cachedCapabilities;
}

function parseVersion(output: string): string | null {
	const match = output.match(/(\d+\.\d+\.\d+)/);
	return match ? match[1] : null;
}

function compareVersions(a: string, b: string): number {
	const aParts = a.split('.').map(Number);
	const bParts = b.split('.').map(Number);

	for (let i = 0; i < 3; i++) {
		const diff = (aParts[i] || 0) - (bParts[i] || 0);
		if (diff !== 0) return diff;
	}
	return 0;
}

export function clearCapabilitiesCache(): void {
	cachedCapabilities = null;
	cacheTime = 0;
}
