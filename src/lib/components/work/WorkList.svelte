<script lang="ts">
	import { cn } from '$lib/utils';
	import { ClipboardList } from 'lucide-svelte';
	import { SkeletonCard, ErrorState, EmptyState, WorkItemCard, type WorkItem } from '$lib/components';
	import { workListVariants } from './variants';

	interface Props {
		items: WorkItem[];
		isLoading?: boolean;
		error?: string | null;
		hasItems?: boolean;
		expandedItemId?: string | null;
		class?: string;
		onexpand?: (id: string) => void;
		onclearfilters?: () => void;
		onscrolltoform?: () => void;
	}

	let {
		items,
		isLoading = false,
		error = null,
		hasItems = true,
		expandedItemId = null,
		class: className = '',
		onexpand,
		onclearfilters,
		onscrolltoform
	}: Props = $props();

	const styles = workListVariants();
</script>

<section class={cn(styles.container(), className)}>
	<div class={styles.header()}>
		<h2 class={styles.title()}>
			<ClipboardList class="w-5 h-5 text-foreground" strokeWidth={2} />
			Items ({items.length})
		</h2>
	</div>

	{#if isLoading}
		<SkeletonCard type="work" count={4} />
	{:else if error}
		<ErrorState
			title="Failed to load issues"
			message={error}
			onRetry={() => window.location.reload()}
			showRetryButton={true}
			compact={true}
		/>
	{:else if !hasItems}
		<EmptyState
			title="No work items"
			description="Create your first issue to get started"
			actionLabel="Create Issue"
			onaction={onscrolltoform}
			size="sm"
		/>
	{:else if items.length === 0}
		<EmptyState
			title="No matches"
			description="No items match your current filters"
			actionLabel="Clear Filters"
			onaction={onclearfilters}
			size="sm"
		/>
	{:else}
		<div class={styles.list()}>
			{#each items as item (item.id)}
				<WorkItemCard
					{item}
					expanded={expandedItemId === item.id}
					onexpand={onexpand}
				/>
			{/each}
		</div>
	{/if}
</section>
