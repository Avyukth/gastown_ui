/**
 * Error thrown when version parsing or comparison fails.
 */
export class SWVersionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SWVersionError';
	}
}

/**
 * Semantic version components.
 */
export interface SemVer {
	major: number;
	minor: number;
	patch: number;
}

/**
 * Configuration for service worker version checking.
 */
export interface SWVersionConfig {
	currentVersion: string;
	criticalVersions: string[];
}

/**
 * Result of cache update check.
 */
export type CacheUpdateResult = 'up-to-date' | 'update-available' | 'critical-update' | 'major-update';

/**
 * Parses a semantic version string into components.
 */
export function parseSemVer(version: string): SemVer {
	if (version === '') {
		throw new SWVersionError('Version string cannot be empty');
	}

	const parts = version.split('.');
	if (parts.length !== 3) {
		throw new SWVersionError('Invalid version format');
	}

	const major = parseInt(parts[0], 10);
	if (isNaN(major) || major < 0) {
		throw new SWVersionError('Invalid major version');
	}

	const minor = parseInt(parts[1], 10);
	if (isNaN(minor) || minor < 0) {
		throw new SWVersionError('Invalid minor version');
	}

	const patch = parseInt(parts[2], 10);
	if (isNaN(patch) || patch < 0) {
		throw new SWVersionError('Invalid patch version');
	}

	return { major, minor, patch };
}

/**
 * Compares two version strings.
 * Returns positive if v1 > v2, negative if v1 < v2, 0 if equal.
 */
export function compareVersions(v1: string, v2: string): number {
	const semVer1 = parseSemVer(v1);
	const semVer2 = parseSemVer(v2);

	if (semVer1.major !== semVer2.major) {
		return semVer1.major - semVer2.major;
	}
	if (semVer1.minor !== semVer2.minor) {
		return semVer1.minor - semVer2.minor;
	}
	return semVer1.patch - semVer2.patch;
}

/**
 * Checks for updates by comparing cached version against current.
 */
export function checkForUpdate(cachedVersion: string, config: SWVersionConfig): CacheUpdateResult {
	const comparison = compareVersions(config.currentVersion, cachedVersion);

	if (comparison <= 0) {
		return 'up-to-date';
	}

	const cachedSemVer = parseSemVer(cachedVersion);
	const currentSemVer = parseSemVer(config.currentVersion);

	// Check for critical versions between cached and current
	for (const criticalVersion of config.criticalVersions) {
		const criticalComparison = compareVersions(criticalVersion, cachedVersion);
		const criticalVsCurrent = compareVersions(criticalVersion, config.currentVersion);

		if (criticalComparison > 0 && criticalVsCurrent <= 0) {
			return 'critical-update';
		}
	}

	// Check for major version bump
	if (currentSemVer.major > cachedSemVer.major) {
		return 'major-update';
	}

	return 'update-available';
}

/**
 * Determines if update should force reload.
 */
export function shouldForceReload(updateResult: CacheUpdateResult): boolean {
	return updateResult === 'critical-update' || updateResult === 'major-update';
}

/**
 * Determines if cache should be cleared for update.
 */
export function shouldClearCache(updateResult: CacheUpdateResult): boolean {
	return updateResult === 'major-update' || updateResult === 'critical-update';
}
