/**
 * Integration Test Setup
 *
 * Configuration and helpers for integration tests that run against
 * the real SvelteKit dev server and CLI.
 *
 * Prerequisites:
 * 1. Dev server running: bun run dev
 * 2. Gas Town initialized: gt init / bd init
 * 3. gt daemon running: gt up
 */

import { beforeAll, afterAll } from 'vitest';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/** Base URL for the dev server */
export const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

/** Test timeout for CLI operations (ms) */
export const CLI_TIMEOUT = 15_000;

/** Test timeout for API requests (ms) */
export const API_TIMEOUT = 10_000;

/**
 * Detailed logging wrapper for fetch requests
 */
export interface FetchResult<T = unknown> {
	response: Response;
	body: T;
	duration: number;
	url: string;
	method: string;
}

/**
 * Fetch with detailed logging for debugging
 */
export async function fetchWithLogging<T = unknown>(
	url: string,
	options: RequestInit = {}
): Promise<FetchResult<T>> {
	const method = options.method || 'GET';
	const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

	console.log(`\n[TEST] ${method} ${fullUrl}`);
	if (options.headers) {
		console.log(`[TEST] Headers: ${JSON.stringify(options.headers)}`);
	}
	if (options.body) {
		console.log(`[TEST] Body: ${String(options.body).slice(0, 500)}`);
	}

	const start = Date.now();
	const response = await fetch(fullUrl, {
		...options,
		signal: AbortSignal.timeout(API_TIMEOUT)
	});
	const duration = Date.now() - start;

	const text = await response.text();
	console.log(`[TEST] ${response.status} ${response.statusText} (${duration}ms)`);
	console.log(`[TEST] Body: ${text.slice(0, 1000)}${text.length > 1000 ? '...' : ''}`);

	let body: T;
	try {
		body = JSON.parse(text) as T;
	} catch {
		body = text as unknown as T;
	}

	return {
		response,
		body,
		duration,
		url: fullUrl,
		method
	};
}

/**
 * GET request with logging
 */
export async function get<T = unknown>(
	path: string,
	headers: Record<string, string> = {}
): Promise<FetchResult<T>> {
	return fetchWithLogging<T>(path, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			...headers
		}
	});
}

/**
 * POST request with logging
 */
export async function post<T = unknown>(
	path: string,
	body: unknown,
	headers: Record<string, string> = {}
): Promise<FetchResult<T>> {
	return fetchWithLogging<T>(path, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...headers
		},
		body: JSON.stringify(body)
	});
}

/**
 * Check if a process is running
 */
export async function isProcessRunning(processName: string): Promise<boolean> {
	try {
		const { stdout } = await execAsync(`pgrep -f "${processName}"`);
		return stdout.trim().length > 0;
	} catch {
		return false;
	}
}

/**
 * Wait for the dev server to be ready
 */
export async function waitForServer(
	maxAttempts = 30,
	delayMs = 1000
): Promise<boolean> {
	for (let i = 0; i < maxAttempts; i++) {
		try {
			const response = await fetch(`${BASE_URL}/api/gastown/health`, {
				signal: AbortSignal.timeout(5000)
			});
			if (response.ok || response.status === 503) {
				console.log(`[TEST] Server ready after ${i + 1} attempts`);
				return true;
			}
		} catch {
			// Server not ready yet
		}
		await new Promise((resolve) => setTimeout(resolve, delayMs));
	}
	return false;
}

/**
 * Check CLI prerequisites
 */
export async function checkCLI(): Promise<{ gt: boolean; bd: boolean }> {
	const results = { gt: false, bd: false };

	try {
		await execAsync('gt --version', { timeout: 5000 });
		results.gt = true;
	} catch {
		console.warn('[TEST] WARNING: gt CLI not available');
	}

	try {
		await execAsync('bd --version', { timeout: 5000 });
		results.bd = true;
	} catch {
		console.warn('[TEST] WARNING: bd CLI not available');
	}

	return results;
}

/**
 * Check if Gas Town daemon is running
 */
export async function isDaemonRunning(): Promise<boolean> {
	try {
		const { stdout } = await execAsync('gt status --json', { timeout: 10000 });
		const status = JSON.parse(stdout);
		return status && typeof status === 'object';
	} catch {
		return false;
	}
}

// Global setup - run once before all tests
beforeAll(async () => {
	console.log('\n═══════════════════════════════════════════════════════════════');
	console.log('  🧪 INTEGRATION TESTS STARTING');
	console.log('═══════════════════════════════════════════════════════════════\n');

	// Check CLI availability
	const cli = await checkCLI();
	if (!cli.gt || !cli.bd) {
		console.warn('[TEST] Some CLI tools are not available - tests may be limited');
	}

	// Check if daemon is running
	const daemonRunning = await isDaemonRunning();
	if (!daemonRunning) {
		console.warn('[TEST] WARNING: Gas Town daemon may not be running');
		console.warn('[TEST] Run "gt up" to start the daemon for full test coverage');
	}

	// Wait for dev server
	console.log(`[TEST] Checking dev server at ${BASE_URL}...`);
	const serverReady = await waitForServer(10, 500);
	if (!serverReady) {
		console.warn('[TEST] WARNING: Dev server may not be running');
		console.warn('[TEST] Run "bun run dev" to start the server');
	}

	console.log('[TEST] Setup complete\n');
});

// Global teardown - run once after all tests
afterAll(() => {
	console.log('\n═══════════════════════════════════════════════════════════════');
	console.log('  ✅ INTEGRATION TESTS COMPLETE');
	console.log('═══════════════════════════════════════════════════════════════\n');
});
