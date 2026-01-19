<script lang="ts">
	import { cn } from '$lib/utils';
	import { StatusBadge } from '$lib/components';
	import { Server, Users, Mail, GitBranch } from 'lucide-svelte';

	interface Props {
		rigs: number;
		agents: number;
		mail: number;
		queue: number;
		class?: string;
	}

	let { rigs, agents, mail, queue, class: className = '' }: Props = $props();

	const cards = $derived([
		{ id: 'rigs', label: 'Rigs', value: rigs, icon: Server },
		{ id: 'agents', label: 'Agents', value: agents, icon: Users },
		{ id: 'mail', label: 'Unread Mail', value: mail, icon: Mail },
		{ id: 'queue', label: 'Merge Queue', value: queue, icon: GitBranch }
	]);
</script>

<div class={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
	{#each cards as card}
		{@const Icon = card.icon}
		<div
			class="panel-glass p-4 rounded-xl border border-border/60 flex items-center justify-between"
			data-testid={`card-${card.id}`}
		>
			<div>
				<p class="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
				<p class="text-2xl font-semibold text-foreground mt-2">{card.value}</p>
			</div>
			<div class="flex flex-col items-end gap-2">
				<Icon class="w-5 h-5 text-muted-foreground" aria-hidden="true" />
				<StatusBadge
					status={card.value > 0 ? 'running' : 'idle'}
					label={card.value > 0 ? 'Active' : 'Idle'}
					size="sm"
				/>
			</div>
		</div>
	{/each}
</div>
