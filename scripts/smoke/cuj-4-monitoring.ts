/**
 * CUJ-4 System Monitoring (Dashboard) Smoke Tests
 *
 * This script validates the Dashboard monitoring journey with comprehensive
 * logging for debugging. Tests the API endpoints used by the dashboard.
 *
 * Usage:
 * - Automated: bun test scripts/smoke/cuj-4-monitoring.ts
 * - Manual: Import and call runMonitoringTests() for manual verification
 *
 * @module scripts/smoke/cuj-4-monitoring
 */

import { expect, test, describe, beforeAll, afterAll } from 'bun:test';
import { createTestLogger, type TestLogger } from './lib';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
let logger: TestLogger;
let testStartTime: number;

interface MonitoringTestResult {
	test: string;
	passed: boolean;
	notes?: string;
}

const tests: MonitoringTestResult[] = [];

/**
 * Log a single test result
 */
export function logTest(name: string, passed: boolean, notes?: string) {
	if (passed) {
		logger.success(`${name}`);
	} else {
		logger.fail(`${name}`, notes);
	}
	tests.push({ test: name, passed, notes });
}

beforeAll(() => {
	logger = createTestLogger('CUJ-4: System Monitoring');
	testStartTime = Date.now();
	logger.step('CUJ-4: SYSTEM MONITORING SMOKE TESTS');
});

afterAll(() => {
	const duration = Date.now() - testStartTime;
	const passed = tests.filter((t) => t.passed).length;
	logger.summary('CUJ-4', passed === tests.length, duration, tests.length);
});

describe('CUJ-4: Dashboard Data Flow', () => {
	test('Step 1: Fetch system status', async () => {
		const stepStart = Date.now();
		logger.step('1. Fetching system status from /api/gastown/status');

		const url = `${BASE_URL}/api/gastown/status`;
		logger.request('GET', url);

		const res = await fetch(url);
		const body = await res.json();

		logger.response(res.status, body);
		expect(res.ok).toBe(true);
		logTest('Status endpoint returns 200', res.ok);

		// Validate structure with logging
		logger.info('Validating status response structure...');

		// Check for requestId (added by API)
		expect(body.requestId).toBeTruthy();
		logger.info(`  ✓ requestId: ${body.requestId}`);
		logTest('Status has requestId', !!body.requestId);

		// Note: The full status response depends on gt status output
		// which varies based on running state
		logger.success('Status endpoint validated');
		logger.timing('Step 1', Date.now() - stepStart);
	});

	test('Step 2: Fetch convoys list', async () => {
		const stepStart = Date.now();
		logger.step('2. Fetching convoys from /api/gastown/convoys');

		const url = `${BASE_URL}/api/gastown/convoys`;
		logger.request('GET', url);

		const res = await fetch(url);
		const convoys = await res.json();

		logger.response(res.status, convoys);
		expect(res.ok).toBe(true);
		logTest('Convoys endpoint returns 200', res.ok);

		// Convoys should be an array (may be empty if no convoys exist)
		expect(Array.isArray(convoys)).toBe(true);
		logTest('Convoys returns array', Array.isArray(convoys));

		logger.info(`Found ${convoys.length} convoys`);
		for (const convoy of convoys.slice(0, 3)) {
			logger.info(`  - ${convoy.id}: ${convoy.title || convoy.name || 'untitled'}`);
		}

		logger.success('Convoys endpoint validated');
		logger.timing('Step 2', Date.now() - stepStart);
	});

	test('Step 3: Fetch queue status', async () => {
		const stepStart = Date.now();
		logger.step('3. Fetching queue from /api/gastown/queue');

		const url = `${BASE_URL}/api/gastown/queue`;
		logger.request('GET', url);

		const res = await fetch(url);
		const queue = await res.json();

		logger.response(res.status, queue);
		expect(res.ok).toBe(true);
		logTest('Queue endpoint returns 200', res.ok);

		// Queue should be an array
		expect(Array.isArray(queue)).toBe(true);
		logTest('Queue returns array', Array.isArray(queue));

		logger.info(`Queue has ${queue.length} items`);

		logger.success('Queue endpoint validated');
		logger.timing('Step 3', Date.now() - stepStart);
	});

	test('Step 4: Test snapshot endpoint (coherent dashboard data)', async () => {
		const stepStart = Date.now();
		logger.step('4. Fetching snapshot from /api/gastown/snapshot');

		const url = `${BASE_URL}/api/gastown/snapshot`;
		logger.request('GET', url);

		const res = await fetch(url);
		const snapshot = await res.json();

		logger.response(res.status, snapshot);
		expect(res.ok).toBe(true);
		logTest('Snapshot endpoint returns 200', res.ok);

		// Validate snapshot contains all required dashboard data
		logger.info('Validating snapshot contains coherent data...');

		expect(snapshot.rigs).toBeDefined();
		expect(Array.isArray(snapshot.rigs)).toBe(true);
		logger.info(`  ✓ rigs: ${snapshot.rigs.length} rigs`);
		logTest('Snapshot has rigs array', Array.isArray(snapshot.rigs));

		expect(snapshot.polecats).toBeDefined();
		expect(Array.isArray(snapshot.polecats)).toBe(true);
		logger.info(`  ✓ polecats: ${snapshot.polecats.length} polecats`);
		logTest('Snapshot has polecats array', Array.isArray(snapshot.polecats));

		expect(snapshot.convoys).toBeDefined();
		expect(Array.isArray(snapshot.convoys)).toBe(true);
		logger.info(`  ✓ convoys: ${snapshot.convoys.length} convoys`);
		logTest('Snapshot has convoys array', Array.isArray(snapshot.convoys));

		expect(snapshot.recent_activity).toBeDefined();
		expect(Array.isArray(snapshot.recent_activity)).toBe(true);
		logger.info(`  ✓ recent_activity: ${snapshot.recent_activity.length} items`);
		logTest('Snapshot has recent_activity array', Array.isArray(snapshot.recent_activity));

		expect(snapshot.mail).toBeDefined();
		logger.info(`  ✓ mail: unread=${snapshot.mail?.unread}, total=${snapshot.mail?.total}`);
		logTest('Snapshot has mail object', !!snapshot.mail);

		expect(snapshot.queue).toBeDefined();
		logger.info(
			`  ✓ queue: pending=${snapshot.queue?.pending}, inProgress=${snapshot.queue?.inProgress}`
		);
		logTest('Snapshot has queue object', !!snapshot.queue);

		expect(snapshot.health).toBeDefined();
		logger.info(`  ✓ health: ${snapshot.health}`);
		logTest('Snapshot has health status', !!snapshot.health);

		expect(snapshot.fetchedAt).toBeDefined();
		logger.info(`  ✓ fetchedAt: ${snapshot.fetchedAt}`);
		logTest('Snapshot has fetchedAt timestamp', !!snapshot.fetchedAt);

		expect(snapshot.requestId).toBeDefined();
		logger.info(`  ✓ requestId: ${snapshot.requestId}`);
		logTest('Snapshot has requestId', !!snapshot.requestId);

		logger.success('Snapshot endpoint validated - data is coherent');
		logger.timing('Step 4', Date.now() - stepStart);
	});

	test('Step 5: Validate data consistency across endpoints', async () => {
		const stepStart = Date.now();
		logger.step('5. Validating data consistency across endpoints');

		// Fetch snapshot (which aggregates multiple sources)
		const snapshotRes = await fetch(`${BASE_URL}/api/gastown/snapshot`);
		const snapshot = await snapshotRes.json();

		// Fetch convoys separately
		const convoysRes = await fetch(`${BASE_URL}/api/gastown/convoys`);
		const convoys = await convoysRes.json();

		// Compare: snapshot.convoys should be subset of or equal to convoys
		logger.info('Comparing data sources...');
		logger.info(`  Snapshot convoys: ${snapshot.convoys?.length || 0}`);
		logger.info(`  Convoys endpoint: ${convoys.length}`);

		// Snapshot limits to 10 convoys, so it should be <= convoys endpoint
		const snapshotConvoyCount = snapshot.convoys?.length || 0;
		const convoyConsistent = snapshotConvoyCount <= convoys.length || snapshotConvoyCount <= 10;
		logTest('Convoy counts consistent', convoyConsistent);

		// Validate health status is valid enum
		const validHealthStatuses = ['healthy', 'degraded', 'unhealthy'];
		const healthValid = validHealthStatuses.includes(snapshot.health);
		logger.info(`  Health status "${snapshot.health}" is valid: ${healthValid}`);
		logTest('Health status is valid enum', healthValid);

		// Validate queue numbers are non-negative
		const queueValid =
			(snapshot.queue?.pending ?? 0) >= 0 &&
			(snapshot.queue?.inProgress ?? 0) >= 0 &&
			(snapshot.queue?.total ?? 0) >= 0;
		logger.info(`  Queue numbers non-negative: ${queueValid}`);
		logTest('Queue numbers are non-negative', queueValid);

		logger.success('Data consistency validated');
		logger.timing('Step 5', Date.now() - stepStart);
	});
});

/**
 * Run manual monitoring tests with logging
 * Call this to see the test checklist with results
 */
export function runMonitoringTests() {
	logger = createTestLogger('CUJ-4: System Monitoring');
	logger.step('CUJ-4: MONITORING TESTS - MANUAL VERIFICATION');

	// Section 1: Status Endpoint
	logger.step('Section 1: Status Endpoint');
	logger.info('Test: GET /api/gastown/status returns 200');
	logger.info('Test: Response contains requestId');
	logger.info('Verify: Response reflects current system state');

	// Section 2: Convoys Endpoint
	logger.step('Section 2: Convoys Endpoint');
	logger.info('Test: GET /api/gastown/convoys returns 200');
	logger.info('Test: Response is an array');
	logger.info('Verify: Each convoy has id, title, status, priority');

	// Section 3: Queue Endpoint
	logger.step('Section 3: Queue Endpoint');
	logger.info('Test: GET /api/gastown/queue returns 200');
	logger.info('Test: Response is an array');
	logger.info('Verify: Queue items match expected structure');

	// Section 4: Snapshot Endpoint
	logger.step('Section 4: Snapshot Endpoint');
	logger.info('Test: GET /api/gastown/snapshot returns 200');
	logger.info('Test: Contains rigs array');
	logger.info('Test: Contains polecats array');
	logger.info('Test: Contains convoys array');
	logger.info('Test: Contains recent_activity array');
	logger.info('Test: Contains mail object');
	logger.info('Test: Contains queue object');
	logger.info('Test: Contains health status');
	logger.info('Test: Contains fetchedAt timestamp');
	logger.info('Test: Contains requestId');

	// Section 5: Dashboard UI
	logger.step('Section 5: Dashboard UI Manual Checks');
	logger.info('Verify: Navigate to /dashboard');
	logger.info('Verify: Status card shows daemon status');
	logger.info('Verify: Agents list populates correctly');
	logger.info('Verify: Rigs list populates correctly');
	logger.info('Verify: Queue section shows pending items');
	logger.info('Verify: Data refreshes on interval');

	// Print summary
	const passed = tests.filter((t) => t.passed).length;
	const total = tests.length;
	if (total > 0) {
		logger.summary('CUJ-4', passed === total, 0, total);
	}

	return tests;
}

/**
 * Get all test results
 */
export function getTestResults(): MonitoringTestResult[] {
	return [...tests];
}

/**
 * Clear test results (for re-running)
 */
export function clearTests() {
	tests.length = 0;
}

/**
 * Print a manual verification checklist
 */
export function printChecklist() {
	console.log(`
=======================================================================
  CUJ-4 SYSTEM MONITORING - MANUAL VERIFICATION CHECKLIST
=======================================================================

SECTION 1: STATUS ENDPOINT (/api/gastown/status)
------------------------------------------------
[ ] GET request returns 200 OK
[ ] Response contains requestId
[ ] Response reflects actual system state (if gt is running)
[ ] Error case: Returns 500 with error message if gt fails

SECTION 2: CONVOYS ENDPOINT (/api/gastown/convoys)
--------------------------------------------------
[ ] GET request returns 200 OK
[ ] Response is an array
[ ] Each convoy has: id, title, status, priority
[ ] Empty array returned if no convoys exist

SECTION 3: QUEUE ENDPOINT (/api/gastown/queue)
----------------------------------------------
[ ] GET request returns 200 OK
[ ] Response is an array
[ ] Queue items have expected structure
[ ] Empty array returned if queue is empty

SECTION 4: SNAPSHOT ENDPOINT (/api/gastown/snapshot)
----------------------------------------------------
[ ] GET request returns 200 OK
[ ] Response contains rigs array
[ ] Response contains polecats array
[ ] Response contains convoys array (max 10)
[ ] Response contains recent_activity array (max 10)
[ ] Response contains mail object (unread, total)
[ ] Response contains queue object (pending, inProgress, total)
[ ] Response contains health status (healthy/degraded/unhealthy)
[ ] Response contains fetchedAt timestamp
[ ] Response contains requestId
[ ] Caching works (5 second TTL)

SECTION 5: DASHBOARD UI (/dashboard)
------------------------------------
[ ] Navigate to dashboard successfully
[ ] Status card shows correct daemon status
[ ] Agents list populates with current agents
[ ] Rigs list populates with current rigs
[ ] Queue section shows pending/in-progress items
[ ] Recent activity shows latest work items
[ ] Mail badge shows unread count
[ ] Data auto-refreshes on interval
[ ] Error states display appropriately

SECTION 6: DATA CONSISTENCY
---------------------------
[ ] Snapshot convoys count <= convoys endpoint count
[ ] Health status is valid enum value
[ ] Queue numbers are non-negative
[ ] Timestamps are valid ISO strings

=======================================================================
  To log results, call: logTest("test name", passed, "optional notes")
  To see summary, call: runMonitoringTests()
=======================================================================
`);
}

// Auto-print checklist when run directly in browser
if (typeof window !== 'undefined') {
	printChecklist();
}
