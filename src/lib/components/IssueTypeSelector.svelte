<script lang="ts" module>
	import { tv } from 'tailwind-variants';

	/**
	 * Issue Type Selector - Radio button group with icons
	 * 
	 * Styles:
	 * - Hover: background-color #F3F4F6 (muted/50)
	 * - Selected: 4px orange (#F97316) left border with light orange background
	 * - Icons: Lucide icons with type-specific colors
	 * - Card grouped with subtle border
	 */
	export const issueTypeSelectorVariants = tv({
		slots: {
			container: [
				'border border-border rounded-lg p-3',
				'bg-muted/10'
			],
			label: [
				'text-sm font-medium text-foreground mb-3',
				'block'
			],
			group: [
				'space-y-2'
			],
			item: [
				'flex items-center gap-3',
				'p-3 rounded-lg',
				'cursor-pointer',
				'transition-all duration-200',
				'border-l-4 border-l-transparent',
				'hover:bg-muted/50'
			],
			itemSelected: [
				'bg-orange-50 dark:bg-orange-950/30',
				'border-l-primary'
			],
			input: [
				'w-4 h-4',
				'rounded-full',
				'cursor-pointer',
				'accent-primary'
			],
			icon: [
				'w-5 h-5',
				'flex-shrink-0'
			],
			content: [
				'flex-1 min-w-0'
			],
			title: [
				'text-sm font-medium text-foreground',
				'block'
			],
			description: [
				'text-xs text-muted-foreground',
				'block mt-0.5'
			]
		}
	});

	export interface IssueTypeOption {
		value: string;
		label: string;
		description?: string;
		icon?: any; // Lucide component
		color?: string; // CSS color class
	}

	// Type-specific icon colors
	export const typeColors: Record<string, string> = {
		task: 'text-blue-500 dark:text-blue-400',
		bug: 'text-red-500 dark:text-red-400',
		feature: 'text-green-500 dark:text-green-400',
		epic: 'text-purple-500 dark:text-purple-400'
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		options: IssueTypeOption[];
		value: string;
		onchange?: (value: string) => void;
		label?: string;
		class?: string;
	}

	let { 
		options, 
		value = $bindable(), 
		onchange,
		label = 'Type',
		class: className = '' 
	}: Props = $props();

	const styles = $derived(issueTypeSelectorVariants());

	function handleChange(newValue: string) {
		value = newValue;
		onchange?.(newValue);
	}

	// Get icon color for a type value
	function getIconColor(typeValue: string): string {
		return typeColors[typeValue] || 'text-muted-foreground';
	}
</script>

<div class={cn(styles.container(), className)}>
	{#if label}
		<span id="issue-type-label" class={styles.label()}>
			{label}
		</span>
	{/if}

	<div class={styles.group()} aria-labelledby={label ? "issue-type-label" : undefined} role="radiogroup">
		{#each options as option (option.value)}
			<label 
				class={cn(
					styles.item(),
					value === option.value && styles.itemSelected()
				)}
			>
				<input 
					type="radio" 
					name="issue-type" 
					value={option.value}
					checked={value === option.value}
					onchange={() => handleChange(option.value)}
					class={styles.input()}
					aria-label={option.label}
				/>
				
				{#if option.icon}
					<span 
						class={cn(styles.icon(), getIconColor(option.value))} 
						aria-hidden="true"
					>
						<option.icon strokeWidth={2} />
					</span>
				{/if}
				
				<div class={styles.content()}>
					<span class={styles.title()}>
						{option.label}
					</span>
					{#if option.description}
						<span class={styles.description()}>
							{option.description}
						</span>
					{/if}
				</div>
			</label>
		{/each}
	</div>
</div>
