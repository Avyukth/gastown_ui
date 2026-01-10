<script lang="ts">
	/**
	 * ThemeToggle Component
	 *
	 * Compact theme toggle for sidebar footer.
	 * Cycles through: dark -> light -> system
	 */
	import { themeStore } from '$lib/stores';
	import { cn } from '$lib/utils';
	import { Moon, Sun, Monitor } from 'lucide-svelte';

	interface Props {
		collapsed?: boolean;
		class?: string;
	}

	let { collapsed = false, class: className = '' }: Props = $props();

	// Get the appropriate icon based on current theme
	const themeIcon = $derived.by(() => {
		switch (themeStore.theme) {
			case 'dark':
				return Moon;
			case 'light':
				return Sun;
			case 'system':
				return Monitor;
			default:
				return Moon;
		}
	});

	// Get label for screen readers and tooltips
	const themeLabel = $derived.by(() => {
		switch (themeStore.theme) {
			case 'dark':
				return 'Dark theme';
			case 'light':
				return 'Light theme';
			case 'system':
				return 'System theme';
			default:
				return 'Theme';
		}
	});

	function handleClick() {
		themeStore.cycle();
	}
</script>

<button
	type="button"
	onclick={handleClick}
	class={cn(
		'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
		'text-muted-foreground hover:text-foreground hover:bg-muted/50',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
		collapsed && 'justify-center px-2',
		className
	)}
	aria-label={`Current: ${themeLabel}. Click to change theme.`}
	title={themeLabel}
>
	<span class="w-6 h-6 flex items-center justify-center" aria-hidden="true">
		<svelte:component this={themeIcon} size={20} strokeWidth={2} />
	</span>
	{#if !collapsed}
		<span class="text-sm font-medium">{themeLabel}</span>
	{/if}
</button>
