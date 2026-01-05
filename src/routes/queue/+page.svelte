<script lang="ts">
	import { QueueLayout } from '$lib/components';

	// Mock queue items - matching QueueItem interface
	const queueItems: Array<{
		id: string;
		title: string;
		priority: 0 | 1 | 2 | 3 | 4;
		assignee?: string;
		status?: string;
	}> = [
		{
			id: 'mr-1',
			title: 'Code Splitting Implementation',
			priority: 2,
			assignee: 'Nux',
			status: 'polecat/nux-ga-6vy • pending'
		},
		{
			id: 'mr-2',
			title: 'Authentication Flow',
			priority: 1,
			assignee: 'Rux',
			status: 'polecat/rux-feature-auth • testing'
		},
		{
			id: 'mr-3',
			title: 'Critical Bug Fix',
			priority: 0,
			assignee: 'Vux',
			status: 'polecat/vux-hotfix • ready'
		},
		{
			id: 'mr-4',
			title: 'Documentation Update',
			priority: 3,
			assignee: 'Lux',
			status: 'polecat/lux-docs • pending'
		}
	];
</script>

<QueueLayout title="Merge Queue" items={queueItems} />
