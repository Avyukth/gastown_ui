<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		size?: 'xs' | 'sm' | 'md';
		class?: string;
	}

	let { size = 'sm', class: className = '' }: Props = $props();

	const sizeMap = {
		xs: 'w-1.5 h-1.5',
		sm: 'w-2 h-2',
		md: 'w-2.5 h-2.5'
	};
</script>

<span
	class={cn(
		'inline-block rounded-full bg-info flex-shrink-0',
		sizeMap[size],
		className
	)}
	aria-hidden="true"
></span>
