/**
 * Service Worker Version Management Utilities
 *
 * Provides semantic version parsing, comparison, and update detection
 * for PWA service worker cache management.
 *
 * @module sw-version
 */

/**
 * Error thrown when version parsing or comparison fails.
 *
 * @example
 * ```typescript
 * try {
 *   parseSemVer('invalid');
 * } catch (err) {
 *   if (err instanceof SWVersionError) {
 *     console.error('Version error:', err.message);
 *   }
 * }
 * ```
 */
export class SWVersionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SWVersionError';
	}
}

/**
 * Semantic version components following SemVer 2.0.0 spec.
 *
 * @see https://semver.org/
 */
export interface SemVer {
	/** Major version - incremented for breaking changes */
	major: number;
	/** Minor version - incremented for new features (backwards compatible) */
	minor: number;
	/** Patch version - incremented for bug fixes (backwards compatible) */
	patch: number;
}

/**
 * Configuration for service worker version checking.
 */
export interface SWVersionConfig {
	/** The current application version (e.g., "2.0.0") */
	currentVersion: string;
	/**
	 * List of versions that require immediate update.
	 * If a critical version is between cached and current,
	 * the update is flagged as critical-update.
	 */
	criticalVersions: string[];
}

/**
 * Result of cache update check.
 *
 * - `up-to-date`: No update needed, cached version is current or ahead
 * - `update-available`: Minor or patch update available
 * - `critical-update`: Security or critical fix requires immediate update
 * - `major-update`: Major version change requiring cache invalidation
 */
export type CacheUpdateResult =
	| 'up-to-date'
	| 'update-available'
	| 'critical-update'
	| 'major-update';

/**
 * Validates and parses a single version component.
 *
 * @param value - The string value to parse
 * @param componentName - Name of the component for error messages
 * @returns The parsed integer value
 * @throws {SWVersionError} If the value is not a valid non-negative integer
 */
function parseVersionComponent(value: string, componentName: string): number {
	const parsed = parseInt(value, 10);
	if (isNaN(parsed) || parsed < 0) {
		throw new SWVersionError(`Invalid ${componentName} version`);
	}
	return parsed;
}

/**
 * Parses a semantic version string into its components.
 *
 * @param version - Version string in format "MAJOR.MINOR.PATCH" (e.g., "1.2.3")
 * @returns Parsed semantic version object
 * @throws {SWVersionError} If version string is empty
 * @throws {SWVersionError} If version format is invalid (not exactly 3 parts)
 * @throws {SWVersionError} If any version component is not a valid non-negative integer
 *
 * @example
 * ```typescript
 * const semver = parseSemVer('1.2.3');
 * // { major: 1, minor: 2, patch: 3 }
 *
 * parseSemVer(''); // throws SWVersionError
 * parseSemVer('1.2'); // throws SWVersionError
 * parseSemVer('v1.2.3'); // throws SWVersionError
 * ```
 */
export function parseSemVer(version: string): SemVer {
	if (version === '') {
		throw new SWVersionError('Version string cannot be empty');
	}

	const parts = version.split('.');
	if (parts.length !== 3) {
		throw new SWVersionError('Invalid version format');
	}

	return {
		major: parseVersionComponent(parts[0], 'major'),
		minor: parseVersionComponent(parts[1], 'minor'),
		patch: parseVersionComponent(parts[2], 'patch')
	};
}

/**
 * Compares two semantic version objects.
 *
 * @param a - First version
 * @param b - Second version
 * @returns Positive if a > b, negative if a < b, 0 if equal
 */
function compareSemVer(a: SemVer, b: SemVer): number {
	if (a.major !== b.major) {
		return a.major - b.major;
	}
	if (a.minor !== b.minor) {
		return a.minor - b.minor;
	}
	return a.patch - b.patch;
}

/**
 * Compares two semantic version strings.
 *
 * @param v1 - First version string (e.g., "1.0.0")
 * @param v2 - Second version string (e.g., "2.0.0")
 * @returns Positive number if v1 > v2, negative if v1 < v2, 0 if equal
 * @throws {SWVersionError} If either version string is invalid
 *
 * @example
 * ```typescript
 * compareVersions('2.0.0', '1.0.0'); // > 0 (v1 is greater)
 * compareVersions('1.0.0', '2.0.0'); // < 0 (v1 is less)
 * compareVersions('1.0.0', '1.0.0'); // === 0 (equal)
 * ```
 */
export function compareVersions(v1: string, v2: string): number {
	const semVer1 = parseSemVer(v1);
	const semVer2 = parseSemVer(v2);
	return compareSemVer(semVer1, semVer2);
}

/**
 * Checks if any critical version exists between cached and current versions.
 *
 * @param cachedVersion - The cached version
 * @param currentVersion - The current version
 * @param criticalVersions - List of critical version strings
 * @returns True if a critical version is between cached and current
 */
function hasCriticalVersionInRange(
	cachedVersion: string,
	currentVersion: string,
	criticalVersions: readonly string[]
): boolean {
	for (const criticalVersion of criticalVersions) {
		const isAboveCached = compareVersions(criticalVersion, cachedVersion) > 0;
		const isAtOrBelowCurrent = compareVersions(criticalVersion, currentVersion) <= 0;

		if (isAboveCached && isAtOrBelowCurrent) {
			return true;
		}
	}
	return false;
}

/**
 * Checks for updates by comparing cached version against current configuration.
 *
 * The function determines the appropriate update type based on:
 * 1. Whether any critical version exists between cached and current
 * 2. Whether the major version has changed
 * 3. Whether any minor/patch changes exist
 *
 * @param cachedVersion - The version currently cached in the service worker
 * @param config - Configuration containing current version and critical versions
 * @returns The type of update available
 * @throws {SWVersionError} If any version string is invalid
 *
 * @example
 * ```typescript
 * const config = {
 *   currentVersion: '2.0.0',
 *   criticalVersions: ['1.5.0']
 * };
 *
 * checkForUpdate('1.0.0', config); // 'critical-update' (1.5.0 is critical)
 * checkForUpdate('1.6.0', config); // 'major-update' (major version changed)
 * checkForUpdate('2.0.0', config); // 'up-to-date'
 * ```
 */
export function checkForUpdate(
	cachedVersion: string,
	config: SWVersionConfig
): CacheUpdateResult {
	const comparison = compareVersions(config.currentVersion, cachedVersion);

	// Cached version is at or ahead of current
	if (comparison <= 0) {
		return 'up-to-date';
	}

	// Check for critical versions between cached and current
	if (hasCriticalVersionInRange(cachedVersion, config.currentVersion, config.criticalVersions)) {
		return 'critical-update';
	}

	// Check for major version bump
	const cachedSemVer = parseSemVer(cachedVersion);
	const currentSemVer = parseSemVer(config.currentVersion);

	if (currentSemVer.major > cachedSemVer.major) {
		return 'major-update';
	}

	return 'update-available';
}

/**
 * Determines if the update type requires forcing a page reload.
 *
 * Critical and major updates should force reload to ensure the user
 * gets the latest version with security fixes or breaking changes.
 *
 * @param updateResult - The result from checkForUpdate
 * @returns True if the page should be force-reloaded
 *
 * @example
 * ```typescript
 * shouldForceReload('critical-update'); // true
 * shouldForceReload('major-update'); // true
 * shouldForceReload('update-available'); // false
 * shouldForceReload('up-to-date'); // false
 * ```
 */
export function shouldForceReload(updateResult: CacheUpdateResult): boolean {
	return updateResult === 'critical-update' || updateResult === 'major-update';
}

/**
 * Determines if the cache should be cleared for the given update type.
 *
 * Major updates and critical updates should clear the cache to ensure
 * no stale assets interfere with the new version.
 *
 * @param updateResult - The result from checkForUpdate
 * @returns True if the service worker cache should be cleared
 *
 * @example
 * ```typescript
 * shouldClearCache('major-update'); // true
 * shouldClearCache('critical-update'); // true
 * shouldClearCache('update-available'); // false
 * shouldClearCache('up-to-date'); // false
 * ```
 */
export function shouldClearCache(updateResult: CacheUpdateResult): boolean {
	return updateResult === 'major-update' || updateResult === 'critical-update';
}
