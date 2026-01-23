/**
 * Tests for CLI capabilities detection
 * Validates CLI availability, version checking, and compatibility
 */

import { describe, it, expect } from 'vitest';
import {
	checkVersionCompatibility,
	getInstallInstructions,
	getUpgradeInstructions,
	MIN_GT_VERSION,
	MIN_BD_VERSION
} from '../capabilities';

describe('checkVersionCompatibility', () => {
	it('returns compatible for versions above minimum', () => {
		const result = checkVersionCompatibility('0.4.0', '0.50.0');
		expect(result.compatible).toBe(true);
		expect(result.gtCompatible).toBe(true);
		expect(result.bdCompatible).toBe(true);
	});

	it('returns compatible for exact minimum versions', () => {
		const result = checkVersionCompatibility(MIN_GT_VERSION, MIN_BD_VERSION);
		expect(result.compatible).toBe(true);
	});

	it('returns incompatible for gt below minimum', () => {
		const result = checkVersionCompatibility('0.2.0', '0.50.0');
		expect(result.compatible).toBe(false);
		expect(result.gtCompatible).toBe(false);
		expect(result.bdCompatible).toBe(true);
	});

	it('returns incompatible for bd below minimum', () => {
		const result = checkVersionCompatibility('0.4.0', '0.40.0');
		expect(result.compatible).toBe(false);
		expect(result.gtCompatible).toBe(true);
		expect(result.bdCompatible).toBe(false);
	});

	it('handles null versions gracefully', () => {
		const result = checkVersionCompatibility(null, '0.50.0');
		expect(result.gtCompatible).toBe(false);
		expect(result.bdCompatible).toBe(true);
	});
});

describe('getInstallInstructions', () => {
	it('returns gt install instructions when gt missing', () => {
		const instructions = getInstallInstructions({ gtMissing: true, bdMissing: false });
		expect(instructions).toContain('gt');
		expect(instructions).toContain('cargo install');
	});

	it('returns bd install instructions when bd missing', () => {
		const instructions = getInstallInstructions({ gtMissing: false, bdMissing: true });
		expect(instructions).toContain('bd');
	});

	it('returns both instructions when both missing', () => {
		const instructions = getInstallInstructions({ gtMissing: true, bdMissing: true });
		expect(instructions).toContain('gt');
		expect(instructions).toContain('bd');
	});
});

describe('getUpgradeInstructions', () => {
	it('returns gt upgrade instructions when gt outdated', () => {
		const instructions = getUpgradeInstructions({ gtOutdated: true, bdOutdated: false });
		expect(instructions).toContain('gt');
		expect(instructions).toContain(MIN_GT_VERSION);
	});

	it('returns bd upgrade instructions when bd outdated', () => {
		const instructions = getUpgradeInstructions({ gtOutdated: false, bdOutdated: true });
		expect(instructions).toContain('bd');
		expect(instructions).toContain(MIN_BD_VERSION);
	});
});

describe('MIN versions', () => {
	it('exports minimum version constants', () => {
		expect(MIN_GT_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
		expect(MIN_BD_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
	});
});
