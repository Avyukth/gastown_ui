<script lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';
	import { cn } from '$lib/utils';

	/**
	 * ShimmerText variant definitions using tailwind-variants
	 */
	const shimmerTextVariants = tv({
		base: 'inline-block bg-clip-text text-transparent bg-[length:200%_100%]',
		variants: {
			shimmer: {
				true: 'bg-gradient-to-r from-accent via-accent/50 to-accent animate-shimmer',
				false: 'bg-gradient-to-r from-foreground to-foreground'
			},
			size: {
				sm: 'text-sm',
				md: 'text-base',
				lg: 'text-lg',
				xl: 'text-xl',
				'2xl': 'text-2xl',
				'3xl': 'text-3xl'
			}
		},
		defaultVariants: {
			shimmer: true,
			size: 'md'
		}
	});

	/**
	 * Props type derived from variant definitions
	 */
	export type ShimmerTextProps = VariantProps<typeof shimmerTextVariants> & {
		text: string;
		class?: string;
	};

	// Component props
	let {
		text,
		shimmer = true,
		size = 'md',
		class: className = ''
	}: ShimmerTextProps = $props();
</script>

<span class={cn(shimmerTextVariants({ shimmer, size }), className)}>
	{text}
</span>
