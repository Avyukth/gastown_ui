<script lang="ts">
	import { cn } from '$lib/utils';
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		/** Current message to announce */
		message?: string;
		/** Politeness level: polite for status updates, assertive for errors */
		politeness?: 'polite' | 'assertive';
		/** Clear message after announcement (ms), 0 to keep */
		clearAfter?: number;
		/** Additional classes */
		class?: string;
	}

	let {
		message = '',
		politeness = 'polite',
		clearAfter = 0,
		class: className = ''
	}: Props = $props();

	// Track displayed message for clearing (effect updates it when message changes)
	let displayedMessage = $state('');
	let currentPoliteness = $state<'polite' | 'assertive'>(politeness);

	// Track event-driven timeout for cleanup
	let eventTimeoutId: ReturnType<typeof setTimeout> | null = null;

	// Update displayed message when message prop changes
	$effect(() => {
		if (message) {
			displayedMessage = message;
			currentPoliteness = politeness;

			if (clearAfter > 0) {
				const timeout = setTimeout(() => {
					displayedMessage = '';
				}, clearAfter);

				return () => clearTimeout(timeout);
			}
		}
	});

	// Listen for custom 'announce' events from the window
	onMount(() => {
		function handleAnnounce(event: CustomEvent<{ message: string; priority?: 'polite' | 'assertive' }>) {
			const { message: newMessage, priority = 'polite' } = event.detail;
			if (newMessage) {
				displayedMessage = newMessage;
				currentPoliteness = priority;

				// Clear any existing timeout before setting new one
				if (eventTimeoutId) {
					clearTimeout(eventTimeoutId);
				}

				// Auto-clear after 3 seconds for event-based announcements
				eventTimeoutId = setTimeout(() => {
					displayedMessage = '';
					eventTimeoutId = null;
				}, 3000);
			}
		}

		window.addEventListener('announce', handleAnnounce as EventListener);
		return () => window.removeEventListener('announce', handleAnnounce as EventListener);
	});

	// Clean up timeout on component destroy
	onDestroy(() => {
		if (eventTimeoutId) {
			clearTimeout(eventTimeoutId);
		}
	});
</script>

<!--
	Screen reader announcer component.
	Use for dynamic status updates that should be announced to assistive technology.

	Examples:
	- Status changes: "Agent started", "Task complete"
	- Errors: "Failed to load data"
	- Progress: "Loading, 50% complete"

	Also listens for window 'announce' events:
	window.dispatchEvent(new CustomEvent('announce', { detail: { message: 'Theme changed' } }))
-->
<div
	class={cn('sr-only', className)}
	role={currentPoliteness === 'assertive' ? 'alert' : 'status'}
	aria-live={currentPoliteness}
	aria-atomic="true"
>
	{displayedMessage}
</div>
