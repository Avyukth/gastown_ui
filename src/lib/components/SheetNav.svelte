<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import type { ComponentType } from 'svelte';
	import { X } from 'lucide-svelte';

export interface SheetNavItem {
		id: string;
		label: string;
		href?: string;
		icon?: ComponentType;
		badge?: number | string;
		description?: string;
		section?: string;
	}

	const itemVariants = tv({
		slots: {
			base: [
				'group relative flex flex-col items-center justify-center gap-2',
				'rounded-2xl px-3 py-3 min-h-touch',
				'transition-all duration-fast ease-out-expo',
				'touch-target-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
			],
			iconWrap: 'relative flex h-10 w-10 items-center justify-center rounded-xl',
			label: 'text-label-xs uppercase tracking-wider text-center',
			description: 'text-xs text-muted-foreground/90 text-center line-clamp-2',
			badge: [
				'absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold',
				'bg-destructive text-destructive-foreground rounded-full',
				'flex items-center justify-center shadow-sm'
			]
		},
		variants: {
			active: {
				true: {
					base: 'bg-primary/10 text-primary border border-primary/30 shadow-glow-primary',
					iconWrap: 'bg-primary/15 text-primary',
					label: 'text-primary'
				},
				false: {
					base: 'bg-card/70 text-foreground border border-border/70 hover:border-primary/30',
					iconWrap: 'bg-muted/40 text-muted-foreground group-hover:text-foreground',
					label: 'text-muted-foreground group-hover:text-foreground'
				}
			}
		},
		defaultVariants: {
			active: false
		}
	});

	interface Props {
		open?: boolean;
		title?: string;
		subtitle?: string;
		items?: SheetNavItem[];
		activeId?: string;
		onClose?: () => void;
		onItemSelect?: (item: SheetNavItem) => void;
		class?: string;
	}

	let {
		open = false,
		title = 'Navigation',
		subtitle,
		items = [],
		activeId = '',
		onClose,
		onItemSelect,
		class: className = ''
	}: Props = $props();

	const groupedItems = $derived.by(() => {
		const groups = new Map<string, SheetNavItem[]>();
		const defaultSection = 'Destinations';

		items.forEach((item) => {
			const section = item.section || defaultSection;
			const group = groups.get(section);
			if (group) {
				group.push(item);
			} else {
				groups.set(section, [item]);
			}
		});

		return Array.from(groups.entries()).map(([section, sectionItems]) => ({
			section,
			items: sectionItems
		}));
	});

	const subtitleText = $derived(subtitle ?? (items.length ? `${items.length} destinations` : ''));

	function handleClose() {
		onClose?.();
	}

	function handleItemClick(item: SheetNavItem) {
		onItemSelect?.(item);
		onClose?.();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}
</script>

{#if open}
	<button
		class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
		onclick={handleClose}
		aria-label="Close navigation sheet"
	></button>

	<div
		class={cn('fixed inset-x-0 bottom-0 z-50 pb-safe px-safe', className)}
		role="dialog"
		aria-modal="true"
		aria-label={title}
		onkeydown={handleKeydown}
	>
		<div class="mx-2 mb-2 rounded-3xl border border-border/80 panel-glass-strong shadow-2xl animate-slide-in-up">
			<div class="relative px-4 pt-3 pb-2">
				<div class="flex items-start justify-between gap-3">
					<div class="flex items-start gap-3">
						<div class="mt-1 h-1.5 w-10 rounded-full bg-muted-foreground/30"></div>
						<div>
							<p class="text-label-xs uppercase tracking-widest text-muted-foreground">Sheet</p>
							<h2 class="text-base font-semibold text-foreground">{title}</h2>
							{#if subtitleText}
								<p class="text-xs text-muted-foreground/80">{subtitleText}</p>
							{/if}
						</div>
					</div>
					<button
						type="button"
						class="touch-target-interactive rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						onclick={handleClose}
						aria-label="Close navigation sheet"
					>
						<X class="h-5 w-5" />
					</button>
				</div>
			</div>

			<div class="px-4 pb-4">
				{#if items.length === 0}
					<div class="panel-glass rounded-2xl border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
						No destinations yet.
					</div>
				{:else}
					<div class="space-y-4">
						{#each groupedItems as group}
							<div class="space-y-2">
								<p class="text-label-xs uppercase tracking-widest text-muted-foreground/80">
									{group.section}
								</p>
								<div class="grid grid-cols-4 gap-3">
									{#each group.items as item}
										{@const isActive = item.id === activeId}
										<a
											href={item.href ?? '#'}
											class={itemVariants({ active: isActive }).base()}
											aria-current={isActive ? 'page' : undefined}
											onclick={() => handleItemClick(item)}
										>
											<span class={itemVariants({ active: isActive }).iconWrap()}>
												{#if item.icon}
													<item.icon class="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
												{:else}
													<span class="h-4 w-4 rounded-full bg-current opacity-30" aria-hidden="true"></span>
												{/if}
												{#if item.badge}
													<span class={itemVariants({ active: isActive }).badge()} aria-label="{item.badge} notifications">
														{typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
													</span>
												{/if}
											</span>
											<span class={itemVariants({ active: isActive }).label()}>{item.label}</span>
											{#if item.description}
												<span class={itemVariants({ active: isActive }).description()}>{item.description}</span>
											{/if}
										</a>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
