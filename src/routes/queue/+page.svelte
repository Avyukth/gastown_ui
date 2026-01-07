<script lang="ts">
	import { QueueLayout } from '$lib/components';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Transform items to add status indicator based on statusType
	const queueItems = $derived(
		data.items.map((item) => ({
			...item,
			status: formatStatus(item.status ?? 'pending', item.statusType)
		}))
	);

	/**
	 * Format status with color indicator
	 * Green circle = ready, Yellow circle = pending, Red circle = conflict
	 */
	function formatStatus(status: string, statusType: string): string {
		const indicator =
			statusType === 'ready' ? '\u{1F7E2}' : statusType === 'conflict' ? '\u{1F534}' : '\u{1F7E1}';
		return `${indicator} ${status}`;
	}
</script>

<QueueLayout title="Merge Queue" items={queueItems}>
	{#snippet actions()}
		{#if data.error}
			<span class="text-sm text-destructive">{data.error}</span>
		{:else if data.items.length === 0}
			<span class="text-sm text-muted-foreground">Queue empty</span>
		{/if}
	{/snippet}
</QueueLayout>
