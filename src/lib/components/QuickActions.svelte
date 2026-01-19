<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components';
	import { Plus, ClipboardList, HeartPulse } from 'lucide-svelte';

	interface Props {
		onAddRig: () => void;
		onNewWork: () => void;
		onRunDoctor: () => void | Promise<void>;
		doctorRunning?: boolean;
		class?: string;
	}

	let {
		onAddRig,
		onNewWork,
		onRunDoctor,
		doctorRunning = false,
		class: className = ''
	}: Props = $props();
</script>

<div class={cn('grid grid-cols-1 md:grid-cols-3 gap-3', className)}>
	<Button variant="primary" fullWidth onclick={onAddRig} data-testid="quick-action-add-rig">
		{#snippet iconLeft()}
			<Plus class="w-4 h-4" />
		{/snippet}
		Add Rig
	</Button>

	<Button variant="outline" fullWidth onclick={onNewWork} data-testid="quick-action-new-work">
		{#snippet iconLeft()}
			<ClipboardList class="w-4 h-4" />
		{/snippet}
		New Work Item
	</Button>

	<Button variant="secondary" fullWidth onclick={onRunDoctor} loading={doctorRunning} data-testid="quick-action-run-doctor">
		{#snippet iconLeft()}
			<HeartPulse class="w-4 h-4" />
		{/snippet}
		Run Doctor
	</Button>
</div>
