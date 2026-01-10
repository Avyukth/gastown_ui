<script lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	/**
	 * Input component following shadcn patterns with tailwind-variants.
	 * Supports icon prefix, password visibility toggle, validation states,
	 * and file input variant.
	 */
	const inputVariants = tv({
		slots: {
			wrapper: 'relative w-full',
			label: 'block text-sm font-medium text-foreground mb-1.5',
			container: [
				'relative flex items-center w-full min-h-touch',
				'bg-background border border-input rounded-md',
				'transition-colors duration-150',
				'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
			],
			input: [
				'flex h-10 w-full bg-transparent text-foreground placeholder:text-muted-foreground',
				'text-sm',
				'px-3 py-2',
				'focus-visible:outline-none',
				'disabled:cursor-not-allowed disabled:opacity-50',
				// File input styling
				'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground'
			],
			iconWrapper: 'flex items-center justify-center text-muted-foreground pl-3',
			actionWrapper: 'flex items-center justify-center pr-2',
			helperText: 'text-xs text-muted-foreground mt-1.5',
			cornerAccent: [
				'absolute w-2 h-2 border-primary',
				'pointer-events-none opacity-0 transition-opacity duration-200'
			]
		},
		variants: {
			variant: {
				default: {
					container: ''
				},
				ghost: {
					container: 'bg-transparent border-transparent hover:bg-muted/50'
				}
			},
			size: {
				sm: {
					input: 'h-9 px-2.5 text-xs',
					iconWrapper: 'pl-2.5',
					label: 'text-xs'
				},
				md: {
					input: 'h-10 px-3 text-sm',
					iconWrapper: 'pl-3'
				},
				lg: {
					input: 'h-12 px-4 text-base',
					iconWrapper: 'pl-4',
					label: 'text-base'
				}
			},
			validationState: {
				default: {},
				error: {
					container: 'border-destructive focus-within:ring-destructive',
					helperText: 'text-destructive'
				},
				success: {
					container: 'border-status-online focus-within:ring-status-online',
					helperText: 'text-status-online'
				}
			},
			hasIcon: {
				true: {
					input: 'pl-0'
				},
				false: {}
			},
			showCornerAccents: {
				true: {
					cornerAccent: 'opacity-100'
				},
				false: {}
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'md',
			validationState: 'default',
			hasIcon: false,
			showCornerAccents: false
		}
	});

	type InputVariantProps = VariantProps<typeof inputVariants>;

	interface Props extends InputVariantProps {
		// Core props
		type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'file';
		value?: string;
		placeholder?: string;
		name?: string;
		id?: string;

		// Labels and helper text
		label?: string;
		helperText?: string;
		errorMessage?: string;

		// States
		disabled?: boolean;
		required?: boolean;
		readonly?: boolean;

		// Features
		showPasswordToggle?: boolean;
		showCornerAccents?: boolean;

		// Styling
		class?: string;
		inputClass?: string;

		// Validation
		minlength?: number;
		maxlength?: number;
		pattern?: string;

		// Events
		onchange?: (e: Event) => void;
		oninput?: (e: Event) => void;
		onfocus?: (e: FocusEvent) => void;
		onblur?: (e: FocusEvent) => void;

		// Slots
		icon?: Snippet;
		action?: Snippet;
	}

	let {
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		name,
		id,
		label,
		helperText,
		errorMessage,
		disabled = false,
		required = false,
		readonly = false,
		showPasswordToggle = false,
		showCornerAccents = false,
		variant = 'default',
		size = 'md',
		validationState = 'default',
		class: className = '',
		inputClass = '',
		minlength,
		maxlength,
		pattern,
		onchange,
		oninput,
		onfocus,
		onblur,
		icon,
		action,
		...restProps
	}: Props = $props();

	// State for password visibility
	let showPassword = $state(false);

	// Determine if we have an icon snippet
	const hasIcon = $derived(!!icon);

	// Computed input type (for password toggle)
	const computedType = $derived(
		type === 'password' && showPassword ? 'text' : type
	);

	// Computed validation state (error takes precedence)
	const computedValidationState = $derived(errorMessage ? 'error' : validationState);

	// Computed helper text (error message takes precedence)
	const computedHelperText = $derived(errorMessage || helperText);

	// Generate unique ID if not provided
	const inputId = $derived(id || `input-${Math.random().toString(36).slice(2, 9)}`);

	// Get variant classes
	const styles = $derived(inputVariants({
		variant,
		size,
		validationState: computedValidationState,
		hasIcon,
		showCornerAccents
	}));

	// Focus state for corner accent animation
	let isFocused = $state(false);

	function handleFocus(e: FocusEvent) {
		isFocused = true;
		onfocus?.(e);
	}

	function handleBlur(e: FocusEvent) {
		isFocused = false;
		onblur?.(e);
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

</script>

<div class={cn(styles.wrapper(), className)}>
	{#if label}
		<label for={inputId} class={styles.label()}>
			{label}
			{#if required}
				<span class="text-destructive ml-0.5">*</span>
			{/if}
		</label>
	{/if}

	<div
		class={cn(
			styles.container(),
			isFocused && showCornerAccents && 'shadow-sm'
		)}
	>
		<!-- Corner accents (industrial decoration) -->
		{#if showCornerAccents}
			<!-- Top-left corner -->
			<span
				class={cn(
					styles.cornerAccent(),
					'top-0 left-0 border-t-2 border-l-2 rounded-tl-lg',
					isFocused && 'opacity-100'
				)}
				aria-hidden="true"
			></span>
			<!-- Top-right corner -->
			<span
				class={cn(
					styles.cornerAccent(),
					'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
					isFocused && 'opacity-100'
				)}
				aria-hidden="true"
			></span>
			<!-- Bottom-left corner -->
			<span
				class={cn(
					styles.cornerAccent(),
					'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg',
					isFocused && 'opacity-100'
				)}
				aria-hidden="true"
			></span>
			<!-- Bottom-right corner -->
			<span
				class={cn(
					styles.cornerAccent(),
					'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
					isFocused && 'opacity-100'
				)}
				aria-hidden="true"
			></span>
		{/if}

		<!-- Icon prefix -->
		{#if icon}
			<div class={styles.iconWrapper()}>
				{@render icon()}
			</div>
		{/if}

		<input
			{...restProps}
			type={computedType}
			bind:value
			{placeholder}
			{name}
			id={inputId}
			{disabled}
			{required}
			{readonly}
			{minlength}
			{maxlength}
			{pattern}
			class={cn(styles.input(), inputClass)}
			aria-invalid={computedValidationState === 'error'}
			aria-describedby={computedHelperText ? `${inputId}-helper` : undefined}
			onfocus={handleFocus}
			onblur={handleBlur}
			{onchange}
			{oninput}
		/>

		<!-- Action area (password toggle, custom actions) -->
		<div class={styles.actionWrapper()}>
			{#if type === 'password' && showPasswordToggle}
				<button
					type="button"
					class={cn(
						'p-1.5 rounded-md text-muted-foreground',
						'hover:text-foreground hover:bg-muted/50',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
						'transition-colors duration-150'
					)}
					onclick={togglePasswordVisibility}
					aria-label={showPassword ? 'Hide password' : 'Show password'}
					tabindex={-1}
				>
					{#if showPassword}
						<!-- Eye off icon -->
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
						</svg>
					{:else}
						<!-- Eye icon -->
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
					{/if}
				</button>
			{/if}
			{@render action?.()}
		</div>
	</div>

	{#if computedHelperText}
		<p id={`${inputId}-helper`} class={styles.helperText()}>
			{computedHelperText}
		</p>
	{/if}
</div>
