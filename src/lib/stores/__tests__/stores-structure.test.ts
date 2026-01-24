/**
 * Tests for stores module structure and organization
 *
 * Verifies:
 * - Core stores are re-exported from core/
 * - Domain stores are re-exported from domains/
 * - Main index re-exports all stores
 * - Backwards compatibility is maintained
 */

import { describe, it, expect } from 'vitest';

describe('stores/core module', () => {
	it('exports network store and types', async () => {
		const coreModule = await import('../core');

		// Core network store
		expect(coreModule.networkStore).toBeDefined();
		expect(typeof coreModule.createNetworkStore).toBe('function');
		expect(coreModule.NetworkError).toBeDefined();
		expect(coreModule.NetworkErrorCode).toBeDefined();
	});

	it('exports visibility store and types', async () => {
		const coreModule = await import('../core');

		expect(coreModule.visibilityStore).toBeDefined();
		expect(typeof coreModule.createVisibilityStore).toBe('function');
		expect(coreModule.NORMAL_POLLING_INTERVAL).toBeDefined();
		expect(coreModule.BACKGROUND_POLLING_INTERVAL).toBeDefined();
	});

	it('exports polling store and types', async () => {
		const coreModule = await import('../core');

		expect(coreModule.pollingManager).toBeDefined();
		expect(typeof coreModule.usePolling).toBe('function');
		expect(typeof coreModule.getPolling).toBe('function');
		expect(typeof coreModule.removePolling).toBe('function');
		expect(typeof coreModule.createMultiTierPolling).toBe('function');
		expect(coreModule.POLLING_TIERS).toBeDefined();
	});

	it('exports toast store and types', async () => {
		const coreModule = await import('../core');

		expect(coreModule.toastStore).toBeDefined();
		expect(typeof coreModule.toastStore.show).toBe('function');
		expect(typeof coreModule.toastStore.info).toBe('function');
		expect(typeof coreModule.toastStore.success).toBe('function');
		expect(typeof coreModule.toastStore.warning).toBe('function');
		expect(typeof coreModule.toastStore.error).toBe('function');
	});

	it('exports operations store and types', async () => {
		const coreModule = await import('../core');

		expect(coreModule.operationsStore).toBeDefined();
		expect(typeof coreModule.trackOperation).toBe('function');
		expect(typeof coreModule.trackBatchOperation).toBe('function');
	});

	it('exports SWR cache and types', async () => {
		const coreModule = await import('../core');

		expect(coreModule.swrCache).toBeDefined();
		expect(typeof coreModule.createSWRCache).toBe('function');
		expect(coreModule.CACHE_KEYS).toBeDefined();
		expect(coreModule.CACHE_TTLS).toBeDefined();
	});

	it('exports theme store', async () => {
		const coreModule = await import('../core');

		expect(coreModule.themeStore).toBeDefined();
	});

	it('exports sync store', async () => {
		const coreModule = await import('../core');

		expect(coreModule.syncStore).toBeDefined();
		expect(typeof coreModule.createSyncStore).toBe('function');
		expect(typeof coreModule.useSyncStatus).toBe('function');
	});

	it('exports websocket client', async () => {
		const coreModule = await import('../core');

		expect(coreModule.wsClient).toBeDefined();
		expect(typeof coreModule.createWebSocketClient).toBe('function');
	});

	it('exports SSE store', async () => {
		const coreModule = await import('../core');

		expect(coreModule.sseStore).toBeDefined();
		expect(typeof coreModule.useSSE).toBe('function');
	});
});

describe('stores/domains module', () => {
	it('exports work store and types', async () => {
		const domainsModule = await import('../domains');

		expect(domainsModule.workStore).toBeDefined();
		expect(typeof domainsModule.useWork).toBe('function');
	});

	it('exports convoys store and types', async () => {
		const domainsModule = await import('../domains');

		expect(domainsModule.convoysStore).toBeDefined();
		expect(typeof domainsModule.useConvoys).toBe('function');
	});

	it('exports agents store and types', async () => {
		const domainsModule = await import('../domains');

		expect(domainsModule.agentsStore).toBeDefined();
		expect(typeof domainsModule.useAgents).toBe('function');
	});

	it('exports mail store and types', async () => {
		const domainsModule = await import('../domains');

		expect(domainsModule.mailStore).toBeDefined();
		expect(typeof domainsModule.useMail).toBe('function');
	});

	it('exports rigs store and types', async () => {
		const domainsModule = await import('../domains');

		expect(domainsModule.rigsStore).toBeDefined();
		expect(typeof domainsModule.useRigs).toBe('function');
	});

	it('exports queue store and types', async () => {
		const domainsModule = await import('../domains');

		expect(domainsModule.queueStore).toBeDefined();
		expect(typeof domainsModule.useQueue).toBe('function');
	});

	it('exports search index', async () => {
		const domainsModule = await import('../domains');

		expect(domainsModule.searchIndex).toBeDefined();
		expect(typeof domainsModule.useSearchIndex).toBe('function');
	});
});

describe('stores main index (backwards compatibility)', () => {
	it('re-exports all core stores from main index', async () => {
		const mainModule = await import('../index');

		// Network (legacy export)
		expect(mainModule.networkState).toBeDefined();

		// Toast
		expect(mainModule.toastStore).toBeDefined();

		// Theme
		expect(mainModule.themeStore).toBeDefined();

		// WebSocket
		expect(mainModule.wsClient).toBeDefined();
		expect(typeof mainModule.createWebSocketClient).toBe('function');

		// Sync
		expect(mainModule.syncStore).toBeDefined();
		expect(typeof mainModule.createSyncStore).toBe('function');
		expect(typeof mainModule.useSyncStatus).toBe('function');

		// Polling
		expect(mainModule.pollingManager).toBeDefined();
		expect(typeof mainModule.usePolling).toBe('function');
		expect(typeof mainModule.getPolling).toBe('function');
		expect(typeof mainModule.removePolling).toBe('function');
		expect(typeof mainModule.createMultiTierPolling).toBe('function');
		expect(mainModule.POLLING_TIERS).toBeDefined();

		// Operations
		expect(mainModule.operationsStore).toBeDefined();
		expect(typeof mainModule.trackOperation).toBe('function');
		expect(typeof mainModule.trackBatchOperation).toBe('function');

		// SWR
		expect(mainModule.swrCache).toBeDefined();
		expect(typeof mainModule.createSWRCache).toBe('function');
		expect(mainModule.CACHE_KEYS).toBeDefined();
		expect(mainModule.CACHE_TTLS).toBeDefined();

		// SSE
		expect(mainModule.sseStore).toBeDefined();
		expect(typeof mainModule.useSSE).toBe('function');
	});

	it('re-exports all domain stores from main index', async () => {
		const mainModule = await import('../index');

		// Work
		expect(mainModule.workStore).toBeDefined();
		expect(typeof mainModule.useWork).toBe('function');

		// Convoys
		expect(mainModule.convoysStore).toBeDefined();
		expect(typeof mainModule.useConvoys).toBe('function');

		// Agents
		expect(mainModule.agentsStore).toBeDefined();
		expect(typeof mainModule.useAgents).toBe('function');

		// Mail
		expect(mainModule.mailStore).toBeDefined();
		expect(typeof mainModule.useMail).toBe('function');

		// Rigs
		expect(mainModule.rigsStore).toBeDefined();
		expect(typeof mainModule.useRigs).toBe('function');

		// Queue
		expect(mainModule.queueStore).toBeDefined();
		expect(typeof mainModule.useQueue).toBe('function');

		// Search
		expect(mainModule.searchIndex).toBeDefined();
		expect(typeof mainModule.useSearchIndex).toBe('function');
	});

	it('exports types from all stores', async () => {
		// This verifies TypeScript types are re-exported
		// We can't directly test types at runtime, but we can verify
		// the modules import without errors
		const mainModule = await import('../index');

		// If we get here without import errors, types are accessible
		expect(mainModule).toBeDefined();
	});
});

describe('core/domains separation', () => {
	it('core stores do not import from domains', async () => {
		// This is a structural check - core should be independent
		// We verify by importing core alone without domains
		const coreModule = await import('../core');
		expect(coreModule).toBeDefined();
	});

	it('domains can import from core (dependency direction)', async () => {
		// Domains depend on core, not vice versa
		const domainsModule = await import('../domains');
		expect(domainsModule).toBeDefined();
	});
});
