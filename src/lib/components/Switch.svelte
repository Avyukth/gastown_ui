<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	/**
	 * Switch/Toggle component with smooth micro-interactions
	 *
	 * Design tokens used:
	 * - Animation: ease-spring for thumb movement, 200ms base duration
	 * - Touch target: 48px minimum for accessibility
	 * - Colors: primary for checked state, muted for unchecked
	 */
	export const switchVariants = tv({
		slots: {
			root: [
				'relative inline-flex shrink-0 cursor-pointer items-center',
				'rounded-full border-2 border-transparent',
				'transition-colors duration-normal ease-out',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'touch-target-interactive'
			],
			thumb: [
				'pointer-events-none block rounded-full bg-background shadow-md',
				'transition-transform duration-normal ease-spring',
				'ring-0'
			]
		},
		variants: {
			size: {
				sm: {
					root: 'h-5 w-9',
					thumb: 'h-4 w-4'
				},
				md: {
					root: 'h-6 w-11',
					thumb: 'h-5 w-5'
				},
				lg: {
					root: 'h-7 w-[52px] min-h-touch',
					thumb: 'h-6 w-6'
				}
			},
			checked: {
				true: {
					root: 'bg-primary',
					thumb: ''
				},
				false: {
					root: 'bg-input',
					thumb: ''
				}
			}
		},
		compoundVariants: [
			// Thumb translate positions based on size and checked state
			{ size: 'sm', checked: true, class: { thumb: 'translate-x-4' } },
			{ size: 'sm', checked: false, class: { thumb: 'translate-x-0' } },
			{ size: 'md', checked: true, class: { thumb: 'translate-x-5' } },
			{ size: 'md', checked: false, class: { thumb: 'translate-x-0' } },
			{ size: 'lg', checked: true, class: { thumb: 'translate-x-[26px]' } },
			{ size: 'lg', checked: false, class: { thumb: 'translate-x-0' } }
		],
		defaultVariants: {
			size: 'md',
			checked: false
		}
	});

	export type SwitchVariants = VariantProps<typeof switchVariants>;

	export interface SwitchProps {
		checked?: boolean;
		disabled?: boolean;
		size?: SwitchVariants['size'];
		name?: string;
		id?: string;
		class?: string;
		'aria-label'?: string;
		'aria-labelledby'?: string;
		onchange?: (checked: boolean) => void;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		checked = $bindable(false),
		disabled = false,
		size = 'md',
		name,
		id,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		onchange
	}: SwitchProps = $props();

	// Generate unique ID if not provided
	const switchId = $derived(id || `switch-${Math.random().toString(36).slice(2, 9)}`);

	// Get styles based on current state
	const styles = $derived(switchVariants({ size, checked }));

	function handleClick() {
		if (disabled) return;
		checked = !checked;
		onchange?.(checked);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			checked = !checked;
			onchange?.(checked);
		}
	}
</script>

<!--
	Switch Component

	A toggle switch with smooth spring animations for the thumb movement.
	Follows shadcn patterns with tailwind-variants.

	Example usage:
	```svelte
	<Switch bind:checked={darkMode} aria-label="Toggle dark mode" />
	<Switch checked={true} size="lg" disabled />
	```
-->

<button
	type="button"
	role="switch"
	id={switchId}
	{name}
	{disabled}
	aria-checked={checked}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	class={cn(styles.root(), className)}
	onclick={handleClick}
	onkeydown={handleKeyDown}
>
	<span class={styles.thumb()} aria-hidden="true"></span>
</button>
