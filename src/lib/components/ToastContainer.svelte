<script lang="ts">
	import { cn } from '$lib/utils';
	import { toastStore } from '$lib/stores';
	import Toast from './Toast.svelte';

	interface Props {
		/** Position of the toast container */
		position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';
		/** Additional classes */
		class?: string;
	}

	let { position = 'bottom-right', class: className = '' }: Props = $props();

	const positionClasses: Record<NonNullable<Props['position']>, string> = {
		'top-center': 'top-4 left-1/2 -translate-x-1/2',
		'top-right': 'top-4 right-4',
		'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
		'bottom-right': 'bottom-4 right-4'
	};

	function handleDismiss(id: string) {
		toastStore.dismiss(id);
	}
</script>

{#if toastStore.toasts.length > 0}
	<div
		class={cn(
			'fixed z-50 flex flex-col gap-2 pointer-events-none',
			'pt-safe px-safe',
			positionClasses[position],
			className
		)}
		role="region"
		aria-label="Notifications"
	>
		{#each toastStore.toasts as toast (toast.id)}
			<div class="pointer-events-auto">
				<Toast
					id={toast.id}
					type={toast.type}
					message={toast.message}
					dismissible={toast.dismissible}
					onDismiss={handleDismiss}
				/>
			</div>
		{/each}
	</div>
{/if}
