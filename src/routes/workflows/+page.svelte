<script lang="ts">
	import { WorkflowLayout } from '$lib/components';

	// Mock workflow steps - matching Step interface
	const steps: Array<{
		id: string;
		name: string;
		status: 'pending' | 'running' | 'complete' | 'error';
		description?: string;
	}> = [
		{
			id: 'step-1',
			name: 'inbox-check',
			status: 'complete',
			description: 'Check mail and escalations'
		},
		{
			id: 'step-2',
			name: 'queue-scan',
			status: 'complete',
			description: 'Identify polecat branches waiting'
		},
		{
			id: 'step-3',
			name: 'process-branch',
			status: 'running',
			description: 'Rebase on current main'
		},
		{
			id: 'step-4',
			name: 'run-tests',
			status: 'pending',
			description: 'Run test suite'
		},
		{
			id: 'step-5',
			name: 'handle-failures',
			status: 'pending',
			description: 'Verification gate'
		},
		{
			id: 'step-6',
			name: 'merge-push',
			status: 'pending',
			description: 'Merge and push to main'
		}
	];
</script>

<WorkflowLayout title="Refinery Patrol" {steps} currentStep={2}>
	<svelte:fragment slot="details">
		<h3 class="font-medium text-foreground mb-2">Current Step: process-branch</h3>
		<p class="text-sm text-muted-foreground">
			Rebasing branch <code class="font-mono text-primary">polecat/nux-ga-6vy</code> on current main.
			This step may require conflict resolution.
		</p>
	</svelte:fragment>
</WorkflowLayout>
