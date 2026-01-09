<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	import { GripHorizontal } from 'lucide-svelte';

	interface Props {
		listWidth?: number; // Initial list width percentage (default 30)
		minListWidth?: number; // Minimum list width in px (default 200)
		minContentWidth?: number; // Minimum content width in px (default 400)
		storageKey?: string; // localStorage key for persisting widths (default 'split-view-widths')
		class?: string;
		listClass?: string;
		contentClass?: string;
		list?: Snippet; // Snippet for list panel
		content?: Snippet; // Snippet for content panel
		children?: Snippet; // Fallback snippet
	}

	let {
		listWidth = 30,
		minListWidth = 200,
		minContentWidth = 400,
		storageKey = 'split-view-widths',
		class: className = '',
		listClass = '',
		contentClass = '',
		list: listSlot,
		content: contentSlot,
		children
	}: Props = $props();

	let containerRef = $state<HTMLDivElement>();
	let dividerRef = $state<HTMLDivElement>();
	let isResizing = $state(false);
	let currentListWidth = $state(listWidth);
	let isMobile = $state(false);

	// Load saved width from localStorage on mount
	onMount(() => {
		const saved = localStorage.getItem(storageKey);
		if (saved) {
			const parsed = parseInt(saved, 10);
			if (!isNaN(parsed) && parsed > 0) {
				currentListWidth = Math.min(parsed, 70); // Cap at 70%
			}
		}

		// Check if mobile
		const checkMobile = () => {
			isMobile = window.innerWidth < 1024;
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	});

	function startResize(e: MouseEvent) {
		if (isMobile) return;
		isResizing = true;
		e.preventDefault();
	}

	function stopResize() {
		isResizing = false;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isResizing || !containerRef) return;

		const container = containerRef.getBoundingClientRect();
		const newListWidth = e.clientX - container.left;
		const containerWidth = container.width;
		const newListWidthPercent = (newListWidth / containerWidth) * 100;

		// Apply constraints
		const listWidthPx = (newListWidthPercent / 100) * containerWidth;
		const contentWidthPx = containerWidth - listWidthPx;

		if (listWidthPx >= minListWidth && contentWidthPx >= minContentWidth) {
			currentListWidth = newListWidthPercent;
			// Save to localStorage
			localStorage.setItem(storageKey, Math.round(newListWidthPercent).toString());
		}
	}
</script>

<svelte:document onmousemove={handleMouseMove} onmouseup={stopResize} />

<div
	bind:this={containerRef}
	class={cn(
		'flex h-full w-full overflow-hidden',
		isMobile ? 'flex-col' : 'flex-row',
		className
	)}
>
	<!-- List Panel -->
	<div
		class={cn(
			'overflow-y-auto overflow-x-hidden border-border',
			isMobile ? 'w-full border-b' : 'border-r',
			listClass
		)}
		style={isMobile ? undefined : `width: ${currentListWidth}%`}
	>
		{#if listSlot}
			{@render listSlot()}
		{:else if children}
			{@render children()}
		{/if}
	</div>

	<!-- Draggable Divider (desktop only) -->
	{#if !isMobile}
		<div
			bind:this={dividerRef}
			class={cn(
				'w-1 bg-border cursor-col-resize transition-colors duration-200 hover:bg-primary/50 active:bg-primary',
				isResizing && 'bg-primary'
			)}
			onmousedown={startResize}
			role="separator"
			tabindex="0"
			aria-label="Resize split view"
			aria-valuenow={Math.round(currentListWidth)}
			aria-valuemin={20}
			aria-valuemax={70}
		>
			<div class="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity">
				<GripHorizontal class="w-4 h-4 text-primary" strokeWidth={2} />
			</div>
		</div>
	{/if}

	<!-- Content Panel -->
	<div
		class={cn(
			'overflow-y-auto overflow-x-hidden flex-1',
			contentClass
		)}
		style={isMobile ? undefined : `width: ${100 - currentListWidth}%`}
	>
		{#if contentSlot}
			{@render contentSlot()}
		{/if}
	</div>
</div>

<style>
	:global(body.resizing) {
		user-select: none;
	}
</style>
