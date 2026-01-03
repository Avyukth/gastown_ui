<script lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';
	import { cn } from '$lib/utils';

	/**
	 * Skeleton loading variant definitions using tailwind-variants
	 */
	const skeletonVariants = tv({
		base: 'bg-muted animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] motion-reduce:animate-none motion-reduce:bg-muted/80',
		variants: {
			type: {
				text: 'h-4 rounded',
				title: 'h-6 rounded',
				subtitle: 'h-5 rounded',
				avatar: 'h-10 w-10 rounded-full',
				'avatar-sm': 'h-8 w-8 rounded-full',
				'avatar-lg': 'h-12 w-12 rounded-full',
				card: 'h-32 rounded-lg',
				button: 'h-10 rounded-md',
				badge: 'h-5 w-16 rounded-full'
			},
			width: {
				full: 'w-full',
				'3/4': 'w-3/4',
				'2/3': 'w-2/3',
				'1/2': 'w-1/2',
				'1/3': 'w-1/3',
				'1/4': 'w-1/4',
				auto: 'w-auto'
			}
		},
		defaultVariants: {
			type: 'text',
			width: 'full'
		}
	});

	/**
	 * Props type derived from variant definitions
	 */
	type SkeletonProps = VariantProps<typeof skeletonVariants> & {
		class?: string;
		label?: string;
	};

	// Component props
	let {
		type = 'text',
		width = 'full',
		class: className = '',
		label = 'Loading...'
	}: SkeletonProps = $props();
</script>

<div
	class={cn(skeletonVariants({ type, width }), className)}
	role="status"
	aria-label={label}
	aria-busy="true"
></div>
