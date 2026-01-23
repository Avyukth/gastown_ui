<script lang="ts">
	import { cn } from '$lib/utils';
	import { hapticMedium, hapticSuccess, hapticError } from '$lib/utils/haptics';
	import { PenLine, ChevronDown } from 'lucide-svelte';
	import { IssueTypeSelector } from '$lib/components';
	import { workCreateFormVariants } from './variants';
	import { issueSchema, type IssueFormData } from './schemas';
	import type { IssueTypeOption } from './types';

	interface Props {
		issueTypes: IssueTypeOption[];
		priorities: { value: number; label: string }[];
		class?: string;
		onsubmit?: (data: IssueFormData) => Promise<{ success: boolean; message: string; id?: string }>;
	}

	let {
		issueTypes,
		priorities,
		class: className = '',
		onsubmit
	}: Props = $props();

	const styles = workCreateFormVariants();

	// Form state
	let issueTitle = $state('');
	let issueType = $state('task');
	let issuePriority = $state(2);
	let issueSubmitting = $state(false);
	let issueMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let issueErrors = $state<Record<string, string>>({});

	async function handleCreateIssue(e: Event) {
		e.preventDefault();
		issueMessage = null;
		issueErrors = {};

		const result = issueSchema.safeParse({
			title: issueTitle,
			type: issueType,
			priority: issuePriority
		});

		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			issueErrors = Object.fromEntries(
				Object.entries(fieldErrors).map(([key, errors]) => [key, errors?.[0] || ''])
			);
			hapticError();
			return;
		}

		issueSubmitting = true;
		hapticMedium();

		try {
			const response = await onsubmit?.(result.data);
			if (response?.success) {
				hapticSuccess();
				issueMessage = { type: 'success', text: response.message };
				issueTitle = '';
				issueType = 'task';
				issuePriority = 2;
			} else {
				hapticError();
				issueMessage = { type: 'error', text: response?.message || 'Failed to create issue' };
			}
		} catch (error) {
			hapticError();
			issueMessage = { type: 'error', text: error instanceof Error ? error.message : 'Failed to create issue' };
		} finally {
			issueSubmitting = false;
		}
	}
</script>

<section id="issue-form" class={cn(styles.container(), className)}>
	<h2 class={styles.title()}>
		<PenLine class="w-5 h-5 text-foreground" strokeWidth={2} />
		Create Issue
	</h2>

	<form onsubmit={handleCreateIssue} class={styles.form()}>
		<div class={styles.fieldGroup()}>
			<label for="issue-title" class={styles.label()}>
				<span>Title</span>
				<span class={styles.required()}>*</span>
				<span class={styles.hint()}>(required)</span>
			</label>
			<input
				id="issue-title"
				type="text"
				bind:value={issueTitle}
				required
				placeholder="Describe the task..."
				class={cn(styles.input(), issueErrors.title ? 'border-destructive' : '')}
			/>
			{#if issueErrors.title}
				<p class={styles.errorText()}>{issueErrors.title}</p>
			{/if}
		</div>

		<div class={styles.fieldGroup()}>
			<IssueTypeSelector
				options={issueTypes}
				bind:value={issueType}
				label="Type"
			/>
		</div>

		<div class={styles.fieldGroup()}>
			<label for="issue-priority" class={styles.label()}>
				<span>Priority</span>
				<span class={styles.required()}>*</span>
				<span class={styles.hint()}>(required)</span>
			</label>
			<div class={styles.selectWrapper()}>
				<select
					id="issue-priority"
					bind:value={issuePriority}
					class={styles.select()}
				>
					{#each priorities as p}
						<option value={p.value}>{p.label}</option>
					{/each}
				</select>
				<ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" strokeWidth={2} />
			</div>
		</div>

		{#if issueMessage}
			<div class={cn(styles.message(), issueMessage.type === 'success' ? 'bg-status-online/10 text-status-online' : 'bg-status-offline/10 text-status-offline')}>
				{issueMessage.text}
			</div>
		{/if}

		<button
			type="submit"
			disabled={issueSubmitting || !issueTitle.trim()}
			class={styles.submitButton()}
		>
			{issueSubmitting ? 'Creating...' : 'Create Issue'}
		</button>
	</form>
</section>
