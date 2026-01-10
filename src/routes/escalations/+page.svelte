<script lang="ts">
	import { cn } from '$lib/utils';
	import { GridPattern } from '$lib/components';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

	const severityConfig: Record<
		Severity,
		{ bg: string; text: string; badge: string; border: string; icon: string }
	> = {
		CRITICAL: {
			bg: 'bg-destructive/10',
			text: 'text-destructive',
			badge: 'bg-destructive text-destructive-foreground',
			border: 'border-destructive/30',
			icon: '!!'
		},
		HIGH: {
			bg: 'bg-warning/10',
			text: 'text-warning',
			badge: 'bg-warning text-warning-foreground',
			border: 'border-warning/30',
			icon: '!'
		},
		MEDIUM: {
			bg: 'bg-status-pending/10',
			text: 'text-status-pending',
			badge: 'bg-status-pending text-black',
			border: 'border-status-pending/30',
			icon: '?'
		},
		LOW: {
			bg: 'bg-muted/20',
			text: 'text-muted-foreground',
			badge: 'bg-muted text-muted-foreground',
			border: 'border-muted',
			icon: '-'
		}
	};

	function formatTimestamp(isoString: string): string {
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getBeadUrl(id: string): string {
		return `bd://show/${id}`;
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10 flex flex-col min-h-screen">
		<!-- Header -->
		<header class="sticky top-0 z-50 panel-glass px-4 h-[72px] relative">
			<div class="container h-full flex items-center justify-between lg:pr-44">
				<div class="flex items-center gap-3">
					<div class="w-1.5 h-8 bg-primary rounded-sm shadow-glow shrink-0" aria-hidden="true"></div>
					<div>
						<h1 class="text-2xl font-display font-semibold text-foreground">Escalations</h1>
						<p class="text-sm text-muted-foreground">
							{data.counts.total} pending {data.counts.total === 1 ? 'escalation' : 'escalations'}
						</p>
					</div>
				</div>

				<!-- Severity counts -->
				<div class="flex items-center gap-2">
					{#if data.counts.critical > 0}
						<span
							class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive"
						>
							{data.counts.critical} CRITICAL
						</span>
					{/if}
					{#if data.counts.high > 0}
						<span
							class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning"
						>
							{data.counts.high} HIGH
						</span>
					{/if}
					{#if data.counts.medium > 0}
						<span
							class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-status-pending/20 text-status-pending"
						>
							{data.counts.medium} MED
						</span>
					{/if}
				</div>
			</div>
			<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true"></div>
		</header>

		<!-- Main content -->
		<main class="flex-1 container py-6">
			{#if data.error}
				<div class="panel-glass p-8 text-center">
					<p class="font-medium text-destructive">Error loading escalations</p>
					<p class="text-sm text-muted-foreground mt-2">{data.error}</p>
				</div>
			{:else if data.escalations.length === 0}
				<div class="panel-glass p-12 text-center">
					<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
						<span class="text-2xl text-success">OK</span>
					</div>
					<p class="font-medium text-foreground">No escalations pending</p>
					<p class="text-sm text-muted-foreground mt-2">
						All clear! Escalations will appear here when they need attention.
					</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each data.escalations as escalation, i}
						{@const config = severityConfig[escalation.severity]}
						<article
							class={cn(
								'panel-glass overflow-hidden animate-blur-fade-up',
								config.border,
								'border-l-4'
							)}
							style="animation-delay: {i * 50}ms"
						>
							<div class="p-4">
								<!-- Header row -->
								<div class="flex items-start justify-between gap-4 mb-3">
									<div class="flex items-center gap-3">
										<!-- Severity badge -->
										<span
											class={cn(
												'inline-flex items-center justify-center w-8 h-8 rounded-lg font-mono font-bold text-sm',
												config.badge
											)}
										>
											{config.icon}
										</span>

										<div>
											<h2 class="font-medium text-foreground">{escalation.title}</h2>
											<div class="flex items-center gap-2 mt-0.5">
												<span
													class={cn(
														'text-xs font-medium px-1.5 py-0.5 rounded',
														config.bg,
														config.text
													)}
												>
													{escalation.severity}
												</span>
												<span class="text-xs text-muted-foreground">{escalation.category}</span>
											</div>
										</div>
									</div>

									<!-- Timestamp and ID -->
									<div class="text-right text-sm">
										<p class="text-muted-foreground">{formatTimestamp(escalation.timestamp)}</p>
										<a
											href={getBeadUrl(escalation.id)}
											class="text-xs font-mono text-primary hover:underline"
										>
											{escalation.id}
										</a>
									</div>
								</div>

								<!-- Description -->
								{#if escalation.description && !escalation.isDecision}
									<p class="text-sm text-muted-foreground mb-3 line-clamp-2">
										{escalation.description}
									</p>
								{/if}

								<!-- Decision section -->
								{#if escalation.isDecision && escalation.question}
									<div class={cn('mt-4 p-4 rounded-lg', config.bg)}>
										<p class="font-medium text-foreground mb-3">
											{escalation.question}
										</p>

										{#if escalation.options && escalation.options.length > 0}
											<div class="space-y-2">
												{#each escalation.options as option, optIdx}
													<button
														type="button"
														class={cn(
															'w-full text-left px-4 py-3 rounded-lg border transition-colors',
															'bg-background/80 border-border',
															'hover:border-primary hover:bg-primary/5',
															'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
														)}
													>
														<span class="text-sm font-medium text-foreground">
															{optIdx + 1}. {option.label}
														</span>
														{#if option.value !== option.label}
															<p class="text-xs text-muted-foreground mt-1">{option.value}</p>
														{/if}
													</button>
												{/each}
											</div>
										{/if}
									</div>
								{/if}

								<!-- Footer -->
								<div class="flex items-center justify-between mt-4 pt-3 border-t border-border">
									<span class="text-xs text-muted-foreground">
										Created by {escalation.createdBy}
									</span>

									<a
										href={getBeadUrl(escalation.id)}
										class={cn(
											'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
											'bg-primary/10 text-primary hover:bg-primary/20'
										)}
									>
										<span>Resolve</span>
										<span aria-hidden="true">&rarr;</span>
									</a>
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</main>
	</div>
</div>
