import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
	plugins: [
		sveltekit(),
		// Bundle analyzer - run with: ANALYZE=true npm run build
		process.env.ANALYZE === 'true' &&
			visualizer({
				filename: 'bundle-stats.html',
				open: true,
				gzipSize: true,
				brotliSize: true
			})
	].filter(Boolean),
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/tests/setup.ts'],
		alias: {
			$lib: '/src/lib',
			// Force Svelte to use browser build in tests
			svelte: 'svelte'
		},
		// Use the svelte plugin for tests to properly compile components
		deps: {
			optimizer: {
				web: {
					include: ['svelte']
				}
			}
		}
	},
	resolve: {
		conditions: ['browser']
	}
});
