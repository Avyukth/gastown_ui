<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { enhance } from '$app/forms';
	import { GridPattern } from '$lib/components';
	import type { PageData, ActionData } from './$types';
	import type { AgentAddress } from './+page.server';
	import { ArrowLeft, Loader2, Send } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Form state - use $state with $effect to sync from form/data
	let recipient = $state('');
	let subject = $state('');
	let body = $state('');
	let showDropdown = $state(false);
	let searchQuery = $state('');
	let sending = $state(false);

	// Sync form fields from data/form on changes
	$effect(() => {
		recipient = form?.to ?? data.prefillTo ?? '';
		searchQuery = form?.to ?? data.prefillTo ?? '';
	});
	$effect(() => {
		subject = form?.subject ?? data.prefillSubject ?? '';
	});
	$effect(() => {
		body = form?.body ?? '';
	});

	// Filter addresses based on search
	let filteredAddresses = $derived(() => {
		const query = searchQuery.toLowerCase();
		if (!query) return data.addresses;
		return data.addresses.filter(
			(a) =>
				a.address.toLowerCase().includes(query) ||
				a.label.toLowerCase().includes(query) ||
				a.role.toLowerCase().includes(query)
		);
	});

	// Group addresses by rig
	let groupedAddresses = $derived(() => {
		const groups: Record<string, AgentAddress[]> = {
			'Global Agents': [],
		};

		for (const addr of filteredAddresses()) {
			if (!addr.rig) {
				groups['Global Agents'].push(addr);
			} else {
				if (!groups[addr.rig]) {
					groups[addr.rig] = [];
				}
				groups[addr.rig].push(addr);
			}
		}

		// Remove empty groups
		return Object.fromEntries(
			Object.entries(groups).filter(([, addrs]) => addrs.length > 0)
		);
	});

	/**
	 * Role badge variants
	 */
	const roleBadgeVariants = tv({
		base: 'inline-flex items-center px-1.5 py-0.5 text-2xs font-mono rounded',
		variants: {
			role: {
				coordinator: 'bg-accent/20 text-accent',
				'health-check': 'bg-info/20 text-info',
				witness: 'bg-warning/20 text-warning',
				refinery: 'bg-success/20 text-success',
				polecat: 'bg-muted text-muted-foreground',
				crew: 'bg-muted text-muted-foreground'
			}
		},
		defaultVariants: {
			role: 'polecat'
		}
	});

	/**
	 * Select an address from dropdown
	 */
	function selectAddress(address: string) {
		recipient = address;
		searchQuery = address;
		showDropdown = false;
	}

	/**
	 * Handle input focus
	 */
	function handleInputFocus() {
		showDropdown = true;
	}

	/**
	 * Handle input blur with delay for click handling
	 */
	function handleInputBlur() {
		setTimeout(() => {
			showDropdown = false;
		}, 200);
	}

	/**
	 * Update search query and recipient together
	 */
	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;
		recipient = target.value;
	}

	/**
	 * Handle keyboard navigation in dropdown
	 */
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			showDropdown = false;
		} else if (e.key === 'Enter' && showDropdown) {
			const firstMatch = Object.values(groupedAddresses())[0]?.[0];
			if (firstMatch) {
				e.preventDefault();
				selectAddress(firstMatch.address);
			}
		}
	}
</script>

<div class="relative min-h-screen bg-background">
	<GridPattern variant="dots" opacity={0.03} />

	<div class="relative z-10">
		<header class="sticky top-0 z-50 panel-glass border-b border-border px-4 py-4">
			<div class="container">
				<div class="flex items-center gap-4">
					<a
						href="/mail"
						class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft class="w-5 h-5" />
						<span class="text-sm font-medium">Back to Inbox</span>
					</a>
				</div>
			</div>
		</header>

		<main class="container py-6 animate-blur-fade-up">
			<div class="max-w-2xl mx-auto">
				<div class="panel-glass overflow-hidden">
					<!-- Header -->
					<div class="p-6 border-b border-border">
						<h1 class="text-xl font-semibold text-foreground">Compose Message</h1>
						<p class="text-sm text-muted-foreground mt-1">
							Send a message to Gas Town agents
						</p>
					</div>

					{#if data.error}
						<div class="p-4 border-b border-destructive/30 bg-destructive/10">
							<p class="text-sm text-destructive">{data.error}</p>
						</div>
					{/if}

					{#if form?.error}
						<div class="p-4 border-b border-destructive/30 bg-destructive/10">
							<p class="text-sm text-destructive">{form.error}</p>
						</div>
					{/if}

					<!-- Form -->
					<form
						method="POST"
						use:enhance={() => {
							sending = true;
							return async ({ update }) => {
								sending = false;
								await update();
							};
						}}
						class="p-6 space-y-6"
					>
						<!-- Recipient Field with Autocomplete -->
						<div class="space-y-2">
							<label for="to" class="block text-sm font-medium text-foreground">
								To
							</label>
							<div class="relative">
								<input
									type="text"
									id="to"
									name="to"
									value={searchQuery}
									oninput={handleInput}
									onfocus={handleInputFocus}
									onblur={handleInputBlur}
									onkeydown={handleKeydown}
									placeholder="Type to search agents..."
									autocomplete="off"
									class="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
								/>

								<!-- Hidden input for actual form value -->
								<input type="hidden" name="to" value={recipient} />

								<!-- Autocomplete Dropdown -->
								{#if showDropdown && Object.keys(groupedAddresses()).length > 0}
									<div
										class="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto panel-glass border border-border rounded-lg shadow-lg"
									>
										{#each Object.entries(groupedAddresses()) as [group, addresses]}
											<div class="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase bg-muted/20 sticky top-0">
												{group}
											</div>
											{#each addresses as addr}
												<button
													type="button"
													onclick={() => selectAddress(addr.address)}
													class="w-full px-4 py-2 flex items-center gap-3 hover:bg-accent/10 transition-colors text-left"
												>
													<span class={roleBadgeVariants({ role: addr.role as 'coordinator' | 'health-check' | 'witness' | 'refinery' | 'polecat' | 'crew' })}>
														{addr.role}
													</span>
													<span class="font-medium text-foreground">{addr.label}</span>
													<span class="text-sm text-muted-foreground ml-auto font-mono">
														{addr.address}
													</span>
												</button>
											{/each}
										{/each}
									</div>
								{/if}
							</div>
						</div>

						<!-- Subject Field -->
						<div class="space-y-2">
							<label for="subject" class="block text-sm font-medium text-foreground">
								Subject
							</label>
							<input
								type="text"
								id="subject"
								name="subject"
								bind:value={subject}
								placeholder="Message subject"
								class="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
							/>
						</div>

						<!-- Body Field -->
						<div class="space-y-2">
							<label for="body" class="block text-sm font-medium text-foreground">
								Message
							</label>
							<textarea
								id="body"
								name="body"
								bind:value={body}
								rows="10"
								placeholder="Write your message here (markdown supported)..."
								class="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-y font-mono text-sm"
							></textarea>
							<p class="text-xs text-muted-foreground">
								Markdown formatting is supported
							</p>
						</div>

						<!-- Actions -->
						<div class="flex items-center justify-end gap-3 pt-4 border-t border-border">
							<a
								href="/mail"
								class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								Cancel
							</a>
							<button
								type="submit"
								disabled={sending || !recipient || !subject || !body}
								class="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{#if sending}
									<Loader2 class="w-4 h-4 animate-spin" />
									Sending...
								{:else}
									<Send class="w-4 h-4" />
									Send Message
								{/if}
							</button>
						</div>
					</form>
				</div>
			</div>
		</main>
	</div>
</div>
