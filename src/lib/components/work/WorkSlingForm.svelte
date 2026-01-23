<script lang="ts">
	import { cn } from '$lib/utils';
	import { hapticMedium, hapticSuccess, hapticError } from '$lib/utils/haptics';
	import { Target, ChevronDown } from 'lucide-svelte';
	import { workSlingFormVariants } from './variants';
	import { slingSchema, type SlingFormData } from './schemas';
	import type { LocalIssue, Rig } from './types';

	interface Props {
		issues: LocalIssue[];
		rigs: Rig[];
		class?: string;
		onsubmit?: (data: SlingFormData) => Promise<{ success: boolean; message: string }>;
	}

	let {
		issues,
		rigs,
		class: className = '',
		onsubmit
	}: Props = $props();

	const styles = workSlingFormVariants();

	// Form state
	let slingIssue = $state('');
	let slingRig = $state('');
	let slingSubmitting = $state(false);
	let slingMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let slingErrors = $state<Record<string, string>>({});

	async function handleSling(e: Event) {
		e.preventDefault();
		slingMessage = null;
		slingErrors = {};

		const result = slingSchema.safeParse({
			issue: slingIssue,
			rig: slingRig
		});

		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			slingErrors = Object.fromEntries(
				Object.entries(fieldErrors).map(([key, errors]) => [key, errors?.[0] || ''])
			);
			hapticError();
			return;
		}

		slingSubmitting = true;
		hapticMedium();

		try {
			const response = await onsubmit?.(result.data);
			if (response?.success) {
				hapticSuccess();
				slingMessage = { type: 'success', text: response.message };
				slingIssue = '';
				slingRig = '';
			} else {
				hapticError();
				slingMessage = { type: 'error', text: response?.message || 'Failed to sling work' };
			}
		} catch (error) {
			hapticError();
			slingMessage = { type: 'error', text: error instanceof Error ? error.message : 'Failed to sling work' };
		} finally {
			slingSubmitting = false;
		}
	}
</script>

<section class={cn(styles.container(), className)}>
	<h2 class={styles.title()}>
		<Target class="w-5 h-5 text-foreground" strokeWidth={2} />
		Sling Work
	</h2>

	<form onsubmit={handleSling} class={styles.form()}>
		<div class={styles.fieldGroup()}>
			<label for="sling-issue" class={styles.label()}>
				<span>Issue</span>
				<span class={styles.required()}>*</span>
				<span class={styles.hint()}>(required)</span>
			</label>
			<div class={styles.selectWrapper()}>
				<select
					id="sling-issue"
					bind:value={slingIssue}
					required
					class={cn(styles.select(), slingErrors.issue ? 'border-destructive' : '')}
				>
					<option value="">Select an issue...</option>
					{#each issues as issue}
						<option value={issue.id}>
							{issue.id}: {issue.title}
						</option>
					{/each}
				</select>
				<ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" strokeWidth={2} />
			</div>
			{#if slingErrors.issue}
				<p class={styles.errorText()}>{slingErrors.issue}</p>
			{/if}
		</div>

		<div class={styles.fieldGroup()}>
			<label for="sling-rig" class={styles.label()}>
				<span>Target Rig</span>
				<span class={styles.required()}>*</span>
				<span class={styles.hint()}>(required)</span>
			</label>
			<div class={styles.selectWrapper()}>
				<select
					id="sling-rig"
					bind:value={slingRig}
					required
					class={cn(styles.select(), slingErrors.rig ? 'border-destructive' : '')}
				>
					<option value="">Select a rig...</option>
					{#each rigs as rig}
						<option value={rig.name}>{rig.name}</option>
					{/each}
				</select>
				<ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" strokeWidth={2} />
			</div>
			{#if slingErrors.rig}
				<p class={styles.errorText()}>{slingErrors.rig}</p>
			{/if}
		</div>

		{#if slingMessage}
			<div class={cn(styles.message(), slingMessage.type === 'success' ? 'bg-status-online/10 text-status-online' : 'bg-status-offline/10 text-status-offline')}>
				{slingMessage.text}
			</div>
		{/if}

		<button
			type="submit"
			disabled={slingSubmitting || !slingIssue || !slingRig}
			class={styles.submitButton()}
		>
			{slingSubmitting ? 'Slinging...' : 'Sling Work'}
		</button>
	</form>
</section>
