import { describe, it, expect } from 'vitest';
import {
	parseSemVer,
	compareVersions,
	checkForUpdate,
	shouldForceReload,
	shouldClearCache,
	SWVersionError,
	type SWVersionConfig,
	type CacheUpdateResult,
	type SemVer
} from '../index';

describe('SemVer interface', () => {
	it('has correct structure with major, minor, patch', () => {
		const version: SemVer = {
			major: 1,
			minor: 2,
			patch: 3
		};

		expect(version).toEqual({
			major: 1,
			minor: 2,
			patch: 3
		});
	});
});

describe('SWVersionConfig interface', () => {
	it('has correct structure with currentVersion and criticalVersions', () => {
		const config: SWVersionConfig = {
			currentVersion: '2.0.0',
			criticalVersions: ['1.5.0', '1.9.0']
		};

		expect(config).toEqual({
			currentVersion: '2.0.0',
			criticalVersions: ['1.5.0', '1.9.0']
		});
	});

	it('works with empty criticalVersions array', () => {
		const config: SWVersionConfig = {
			currentVersion: '1.0.0',
			criticalVersions: []
		};

		expect(config.criticalVersions).toEqual([]);
	});
});

describe('CacheUpdateResult type', () => {
	it('accepts up-to-date value', () => {
		const result: CacheUpdateResult = 'up-to-date';
		expect(result).toBe('up-to-date');
	});

	it('accepts update-available value', () => {
		const result: CacheUpdateResult = 'update-available';
		expect(result).toBe('update-available');
	});

	it('accepts critical-update value', () => {
		const result: CacheUpdateResult = 'critical-update';
		expect(result).toBe('critical-update');
	});

	it('accepts major-update value', () => {
		const result: CacheUpdateResult = 'major-update';
		expect(result).toBe('major-update');
	});
});

describe('parseSemVer', () => {
	it('parses valid version string "1.2.3"', () => {
		const result = parseSemVer('1.2.3');

		expect(result).toEqual({
			major: 1,
			minor: 2,
			patch: 3
		});
	});

	it('parses version with zeros "0.0.0"', () => {
		const result = parseSemVer('0.0.0');

		expect(result).toEqual({
			major: 0,
			minor: 0,
			patch: 0
		});
	});

	it('parses version with large numbers', () => {
		const result = parseSemVer('10.20.30');

		expect(result).toEqual({
			major: 10,
			minor: 20,
			patch: 30
		});
	});

	it('throws SWVersionError on empty string', () => {
		expect(() => parseSemVer('')).toThrow(SWVersionError);
		expect(() => parseSemVer('')).toThrow('Version string cannot be empty');
	});

	it('throws SWVersionError on invalid format - missing parts', () => {
		expect(() => parseSemVer('1.2')).toThrow(SWVersionError);
		expect(() => parseSemVer('1.2')).toThrow('Invalid version format');
	});

	it('throws SWVersionError on invalid format - too many parts', () => {
		expect(() => parseSemVer('1.2.3.4')).toThrow(SWVersionError);
		expect(() => parseSemVer('1.2.3.4')).toThrow('Invalid version format');
	});

	it('throws SWVersionError on non-numeric major version', () => {
		expect(() => parseSemVer('a.2.3')).toThrow(SWVersionError);
		expect(() => parseSemVer('a.2.3')).toThrow('Invalid major version');
	});

	it('throws SWVersionError on non-numeric minor version', () => {
		expect(() => parseSemVer('1.b.3')).toThrow(SWVersionError);
		expect(() => parseSemVer('1.b.3')).toThrow('Invalid minor version');
	});

	it('throws SWVersionError on non-numeric patch version', () => {
		expect(() => parseSemVer('1.2.c')).toThrow(SWVersionError);
		expect(() => parseSemVer('1.2.c')).toThrow('Invalid patch version');
	});

	it('throws SWVersionError on negative major version', () => {
		expect(() => parseSemVer('-1.2.3')).toThrow(SWVersionError);
		expect(() => parseSemVer('-1.2.3')).toThrow('Invalid major version');
	});

	it('throws SWVersionError on negative minor version', () => {
		expect(() => parseSemVer('1.-2.3')).toThrow(SWVersionError);
		expect(() => parseSemVer('1.-2.3')).toThrow('Invalid minor version');
	});

	it('throws SWVersionError on negative patch version', () => {
		expect(() => parseSemVer('1.2.-3')).toThrow(SWVersionError);
		expect(() => parseSemVer('1.2.-3')).toThrow('Invalid patch version');
	});

	it('handles version with leading v prefix', () => {
		expect(() => parseSemVer('v1.2.3')).toThrow(SWVersionError);
		expect(() => parseSemVer('v1.2.3')).toThrow('Invalid major version');
	});
});

describe('compareVersions', () => {
	it('returns 0 for equal versions', () => {
		const result = compareVersions('1.2.3', '1.2.3');
		expect(result).toBe(0);
	});

	it('returns positive when first version is greater (major)', () => {
		const result = compareVersions('2.0.0', '1.0.0');
		expect(result).toBeGreaterThan(0);
	});

	it('returns negative when first version is less (major)', () => {
		const result = compareVersions('1.0.0', '2.0.0');
		expect(result).toBeLessThan(0);
	});

	it('returns positive when first version is greater (minor)', () => {
		const result = compareVersions('1.3.0', '1.2.0');
		expect(result).toBeGreaterThan(0);
	});

	it('returns negative when first version is less (minor)', () => {
		const result = compareVersions('1.2.0', '1.3.0');
		expect(result).toBeLessThan(0);
	});

	it('returns positive when first version is greater (patch)', () => {
		const result = compareVersions('1.2.4', '1.2.3');
		expect(result).toBeGreaterThan(0);
	});

	it('returns negative when first version is less (patch)', () => {
		const result = compareVersions('1.2.3', '1.2.4');
		expect(result).toBeLessThan(0);
	});

	it('compares major before minor', () => {
		const result = compareVersions('2.0.0', '1.9.9');
		expect(result).toBeGreaterThan(0);
	});

	it('compares minor before patch', () => {
		const result = compareVersions('1.2.0', '1.1.9');
		expect(result).toBeGreaterThan(0);
	});

	it('handles zeros correctly', () => {
		expect(compareVersions('0.0.0', '0.0.0')).toBe(0);
		expect(compareVersions('0.0.1', '0.0.0')).toBeGreaterThan(0);
		expect(compareVersions('0.1.0', '0.0.9')).toBeGreaterThan(0);
	});

	it('throws SWVersionError for invalid first version', () => {
		expect(() => compareVersions('invalid', '1.0.0')).toThrow(SWVersionError);
	});

	it('throws SWVersionError for invalid second version', () => {
		expect(() => compareVersions('1.0.0', 'invalid')).toThrow(SWVersionError);
	});
});

describe('checkForUpdate', () => {
	it('returns up-to-date when cached equals current', () => {
		const config: SWVersionConfig = {
			currentVersion: '1.0.0',
			criticalVersions: []
		};

		const result = checkForUpdate('1.0.0', config);
		expect(result).toBe('up-to-date');
	});

	it('returns update-available for minor version bump', () => {
		const config: SWVersionConfig = {
			currentVersion: '1.1.0',
			criticalVersions: []
		};

		const result = checkForUpdate('1.0.0', config);
		expect(result).toBe('update-available');
	});

	it('returns update-available for patch version bump', () => {
		const config: SWVersionConfig = {
			currentVersion: '1.0.1',
			criticalVersions: []
		};

		const result = checkForUpdate('1.0.0', config);
		expect(result).toBe('update-available');
	});

	it('returns major-update for major version bump', () => {
		const config: SWVersionConfig = {
			currentVersion: '2.0.0',
			criticalVersions: []
		};

		const result = checkForUpdate('1.0.0', config);
		expect(result).toBe('major-update');
	});

	it('returns critical-update when critical version is between cached and current', () => {
		const config: SWVersionConfig = {
			currentVersion: '2.0.0',
			criticalVersions: ['1.5.0']
		};

		const result = checkForUpdate('1.0.0', config);
		expect(result).toBe('critical-update');
	});

	it('returns critical-update when current version is itself critical', () => {
		const config: SWVersionConfig = {
			currentVersion: '1.5.0',
			criticalVersions: ['1.5.0']
		};

		const result = checkForUpdate('1.0.0', config);
		expect(result).toBe('critical-update');
	});

	it('returns update-available when critical version is below cached (minor update)', () => {
		const config: SWVersionConfig = {
			currentVersion: '1.8.0',
			criticalVersions: ['1.0.0']
		};

		const result = checkForUpdate('1.5.0', config);
		expect(result).toBe('update-available');
	});

	it('returns major-update when critical version is below cached but major version changed', () => {
		const config: SWVersionConfig = {
			currentVersion: '2.0.0',
			criticalVersions: ['1.0.0']
		};

		const result = checkForUpdate('1.5.0', config);
		expect(result).toBe('major-update');
	});

	it('returns up-to-date when cached version is ahead of current', () => {
		const config: SWVersionConfig = {
			currentVersion: '1.0.0',
			criticalVersions: []
		};

		const result = checkForUpdate('2.0.0', config);
		expect(result).toBe('up-to-date');
	});

	it('handles multiple critical versions and picks highest priority', () => {
		const config: SWVersionConfig = {
			currentVersion: '3.0.0',
			criticalVersions: ['1.5.0', '2.5.0']
		};

		const result = checkForUpdate('1.0.0', config);
		expect(result).toBe('critical-update');
	});

	it('throws SWVersionError for invalid cached version', () => {
		const config: SWVersionConfig = {
			currentVersion: '1.0.0',
			criticalVersions: []
		};

		expect(() => checkForUpdate('invalid', config)).toThrow(SWVersionError);
	});

	it('throws SWVersionError for invalid current version in config', () => {
		const config: SWVersionConfig = {
			currentVersion: 'invalid',
			criticalVersions: []
		};

		expect(() => checkForUpdate('1.0.0', config)).toThrow(SWVersionError);
	});
});

describe('shouldForceReload', () => {
	it('returns true for critical-update', () => {
		const result = shouldForceReload('critical-update');
		expect(result).toBe(true);
	});

	it('returns true for major-update', () => {
		const result = shouldForceReload('major-update');
		expect(result).toBe(true);
	});

	it('returns false for update-available', () => {
		const result = shouldForceReload('update-available');
		expect(result).toBe(false);
	});

	it('returns false for up-to-date', () => {
		const result = shouldForceReload('up-to-date');
		expect(result).toBe(false);
	});
});

describe('shouldClearCache', () => {
	it('returns true for major-update', () => {
		const result = shouldClearCache('major-update');
		expect(result).toBe(true);
	});

	it('returns true for critical-update', () => {
		const result = shouldClearCache('critical-update');
		expect(result).toBe(true);
	});

	it('returns false for update-available', () => {
		const result = shouldClearCache('update-available');
		expect(result).toBe(false);
	});

	it('returns false for up-to-date', () => {
		const result = shouldClearCache('up-to-date');
		expect(result).toBe(false);
	});
});

describe('SWVersionError', () => {
	it('has correct name', () => {
		const err = new SWVersionError('test error');
		expect(err.name).toBe('SWVersionError');
	});

	it('has correct message', () => {
		const err = new SWVersionError('Invalid version format');
		expect(err.message).toBe('Invalid version format');
	});

	it('inherits from Error properly', () => {
		const err = new SWVersionError('test message');
		expect(err).toBeInstanceOf(SWVersionError);
		expect(err.stack).toMatch(/SWVersionError: test message/);
		expect(Object.getPrototypeOf(Object.getPrototypeOf(err))).toBe(Error.prototype);
	});
});
