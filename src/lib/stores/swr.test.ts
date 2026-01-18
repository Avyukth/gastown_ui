/**
 * SWR Cache Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createSWRCache, CACHE_KEYS, CACHE_TTLS } from './swr';

describe('SWRCache', () => {
	let cache: ReturnType<typeof createSWRCache>;

	beforeEach(() => {
		vi.useFakeTimers();
		cache = createSWRCache();
	});

	afterEach(() => {
		cache.destroy();
		vi.useRealTimers();
	});

	describe('basic operations', () => {
		it('sets and gets cache entries', () => {
			cache.set('test', { foo: 'bar' });

			const entry = cache.get<{ foo: string }>('test');
			expect(entry).not.toBeNull();
			expect(entry?.data).toEqual({ foo: 'bar' });
		});

		it('returns null for non-existent keys', () => {
			const entry = cache.get('non-existent');
			expect(entry).toBeNull();
		});

		it('deletes entries', () => {
			cache.set('test', { foo: 'bar' });
			expect(cache.has('test')).toBe(true);

			cache.delete('test');
			expect(cache.has('test')).toBe(false);
		});

		it('clears all entries', () => {
			cache.set('a', 1);
			cache.set('b', 2);
			cache.set('c', 3);

			expect(cache.size()).toBe(3);

			cache.clear();
			expect(cache.size()).toBe(0);
		});
	});

	describe('TTL behavior', () => {
		it('marks entries as stale after staleTime', () => {
			cache.set('test', 'value', { staleTime: 5000 });

			expect(cache.isStale('test')).toBe(false);

			vi.advanceTimersByTime(5001);

			expect(cache.isStale('test')).toBe(true);
		});

		it('removes entries after cacheTime expires', () => {
			cache.set('test', 'value', { staleTime: 1000, cacheTime: 5000 });

			expect(cache.has('test')).toBe(true);

			vi.advanceTimersByTime(5001);

			expect(cache.has('test')).toBe(false);
		});
	});

	describe('SWR pattern', () => {
		it('returns cached data for fresh entries', async () => {
			const fetcher = vi.fn().mockResolvedValue('fresh-data');

			cache.set('test', 'cached-data', { staleTime: 10000 });

			const result = await cache.swr({
				key: 'test',
				fetcher,
				staleTime: 10000
			});

			expect(result).toBe('cached-data');
			expect(fetcher).not.toHaveBeenCalled();
		});

		it('fetches data for missing entries', async () => {
			const fetcher = vi.fn().mockResolvedValue('new-data');

			const result = await cache.swr({
				key: 'missing',
				fetcher
			});

			expect(result).toBe('new-data');
			expect(fetcher).toHaveBeenCalledOnce();
		});

		it('returns stale data while revalidating', async () => {
			const fetcher = vi.fn().mockResolvedValue('revalidated-data');

			cache.set('test', 'stale-data', { staleTime: 0 });
			vi.advanceTimersByTime(1);

			const result = await cache.swr({
				key: 'test',
				fetcher,
				staleTime: 5000
			});

			expect(result).toBe('stale-data');
		});

		it('deduplicates concurrent requests', async () => {
			let resolveFirst: (value: string) => void;
			const fetcher = vi.fn().mockImplementation(
				() =>
					new Promise<string>((resolve) => {
						resolveFirst = resolve;
					})
			);

			const promise1 = cache.swr({ key: 'dedup', fetcher });
			const promise2 = cache.swr({ key: 'dedup', fetcher });

			resolveFirst!('data');

			const [result1, result2] = await Promise.all([promise1, promise2]);

			expect(result1).toBe('data');
			expect(result2).toBe('data');
			expect(fetcher).toHaveBeenCalledOnce();
		});
	});

	describe('subscriptions', () => {
		it('notifies subscribers on set', () => {
			const subscriber = vi.fn();

			cache.subscribe('test', subscriber);
			cache.set('test', 'value');

			expect(subscriber).toHaveBeenCalled();
			const entry = subscriber.mock.calls[subscriber.mock.calls.length - 1][0];
			expect(entry?.data).toBe('value');
		});

		it('notifies subscribers on delete', () => {
			const subscriber = vi.fn();

			cache.set('test', 'value');
			cache.subscribe('test', subscriber);
			cache.delete('test');

			expect(subscriber.mock.calls[subscriber.mock.calls.length - 1][0]).toBeNull();
		});

		it('allows unsubscribing', () => {
			const subscriber = vi.fn();

			const unsubscribe = cache.subscribe('test', subscriber);
			unsubscribe();

			cache.set('test', 'value');

			expect(subscriber).toHaveBeenCalledTimes(0);
		});
	});

	describe('invalidation', () => {
		it('invalidates a single key', () => {
			cache.set('test', 'value', { staleTime: 10000 });

			expect(cache.isStale('test')).toBe(false);

			cache.invalidate('test');

			expect(cache.isStale('test')).toBe(true);
		});

		it('invalidates by pattern', () => {
			cache.set('work:1', 'a', { staleTime: 10000 });
			cache.set('work:2', 'b', { staleTime: 10000 });
			cache.set('convoy:1', 'c', { staleTime: 10000 });

			const invalidated = cache.invalidatePattern(/^work:/);

			expect(invalidated).toEqual(['work:1', 'work:2']);
			expect(cache.isStale('work:1')).toBe(true);
			expect(cache.isStale('work:2')).toBe(true);
			expect(cache.isStale('convoy:1')).toBe(false);
		});

		it('invalidates all entries', () => {
			cache.set('a', 1, { staleTime: 10000 });
			cache.set('b', 2, { staleTime: 10000 });

			cache.invalidateAll();

			expect(cache.isStale('a')).toBe(true);
			expect(cache.isStale('b')).toBe(true);
		});

		it('triggers invalidation callbacks', () => {
			const callback = vi.fn();

			cache.onInvalidate(callback);
			cache.set('test', 'value');
			cache.invalidate('test');

			expect(callback).toHaveBeenCalledWith(['test']);
		});
	});

	describe('dependencies', () => {
		it('invalidates dependent keys', () => {
			cache.set('work', [], { staleTime: 10000 });
			cache.set('convoys', [], { staleTime: 10000 });

			cache.addDependency('convoys', 'work');

			expect(cache.isStale('convoys')).toBe(false);

			cache.invalidate('work');

			expect(cache.isStale('work')).toBe(true);
			expect(cache.isStale('convoys')).toBe(true);
		});
	});

	describe('max entries enforcement', () => {
		it('evicts oldest entries when limit reached', () => {
			const smallCache = createSWRCache({ maxEntries: 3 });

			smallCache.set('a', 1);
			vi.advanceTimersByTime(10);
			smallCache.set('b', 2);
			vi.advanceTimersByTime(10);
			smallCache.set('c', 3);
			vi.advanceTimersByTime(10);
			smallCache.set('d', 4);

			expect(smallCache.size()).toBeLessThanOrEqual(3);
			expect(smallCache.has('a')).toBe(false);
			expect(smallCache.has('d')).toBe(true);

			smallCache.destroy();
		});
	});

	describe('CACHE_KEYS', () => {
		it('generates correct work item keys', () => {
			expect(CACHE_KEYS.WORK_ITEM('abc-123')).toBe('work:abc-123');
		});

		it('generates correct convoy keys', () => {
			expect(CACHE_KEYS.CONVOY('convoy-1')).toBe('convoy:convoy-1');
		});

		it('generates correct agent keys', () => {
			expect(CACHE_KEYS.AGENT('furiosa')).toBe('agent:furiosa');
		});
	});

	describe('CACHE_TTLS', () => {
		it('has correct realtime TTLs', () => {
			expect(CACHE_TTLS.REALTIME.staleTime).toBe(2000);
			expect(CACHE_TTLS.REALTIME.cacheTime).toBe(30000);
		});

		it('has correct fast TTLs', () => {
			expect(CACHE_TTLS.FAST.staleTime).toBe(5000);
			expect(CACHE_TTLS.FAST.cacheTime).toBe(60000);
		});
	});
});
