/**
 * Vitest Configuration for Integration Tests
 *
 * Integration tests run against a real SvelteKit dev server and CLI.
 * Unlike unit tests, these DO NOT use JSDOM or mock the CLI.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/integration/**/*.test.ts'],
		globals: true,
		// Use Node environment (not jsdom) for integration tests
		environment: 'node',
		// Longer timeouts for CLI operations
		testTimeout: 30_000,
		hookTimeout: 60_000,
		// Setup file for integration tests
		setupFiles: ['./tests/integration/setup.ts'],
		// Run tests sequentially
		sequence: {
			concurrent: false
		},
		// File parallelism
		fileParallelism: false
	},
	resolve: {
		alias: {
			$lib: '/src/lib'
		}
	}
});
