<script lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import type { ToastType } from '$lib/stores';

	/**
	 * Toast variant definitions using tailwind-variants
	 */
	const toastVariants = tv({
		slots: {
			container: [
				'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
				'border backdrop-blur-sm',
				'animate-slide-in-down',
				'min-w-[280px] max-w-[400px]'
			],
			icon: 'w-5 h-5 flex-shrink-0',
			content: 'flex-1 text-sm font-medium',
			dismiss: [
				'p-1 rounded-md transition-colors',
				'hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
				'touch-target-interactive'
			]
		},
		variants: {
			type: {
				info: {
					container: 'bg-info/90 text-info-foreground border-info/20',
					icon: 'text-info-foreground'
				},
				success: {
					container: 'bg-success/90 text-success-foreground border-success/20',
					icon: 'text-success-foreground'
				},
				warning: {
					container: 'bg-warning/90 text-warning-foreground border-warning/20',
					icon: 'text-warning-foreground'
				},
				error: {
					container: 'bg-destructive/90 text-destructive-foreground border-destructive/20',
					icon: 'text-destructive-foreground'
				}
			}
		},
		defaultVariants: {
			type: 'info'
		}
	});

	type ToastVariants = VariantProps<typeof toastVariants>;

	interface Props {
		id: string;
		type?: ToastType;
		message: string;
		dismissible?: boolean;
		onDismiss?: (id: string) => void;
		class?: string;
	}

	let {
		id,
		type = 'info',
		message,
		dismissible = true,
		onDismiss,
		class: className = ''
	}: Props = $props();

	// Make variants reactive to type changes
	const styles = $derived(toastVariants({ type }));

	function handleDismiss() {
		onDismiss?.(id);
	}

	// Icon paths for each type
	const icons: Record<ToastType, string> = {
		info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
		success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
		warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
		error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
	};
</script>

<div
	class={cn(styles.container(), className)}
	role="alert"
	aria-live={type === 'error' ? 'assertive' : 'polite'}
>
	<svg
		class={styles.icon()}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
	>
		<path stroke-linecap="round" stroke-linejoin="round" d={icons[type ?? 'info']} />
	</svg>

	<span class={styles.content()}>{message}</span>

	{#if dismissible}
		<button
			type="button"
			class={styles.dismiss()}
			onclick={handleDismiss}
			aria-label="Dismiss notification"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	{/if}
</div>
