/**
 * Work Components Variants
 *
 * Tailwind-variants definitions for work components styling.
 */
import { tv } from 'tailwind-variants';

/**
 * WorkFilters variant definitions
 */
export const workFiltersVariants = tv({
	slots: {
		container: 'panel-glass p-4 mx-auto max-w-lg space-y-4',
		section: '',
		label: 'text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block',
		chipGroup: 'flex flex-wrap gap-2',
		chip: 'px-3 py-1.5 text-xs font-medium rounded-full transition-colors touch-target',
		sortContainer: 'flex items-center justify-between pt-2 border-t border-border',
		sortLabel: 'text-xs font-medium text-muted-foreground',
		sortSelect: [
			'px-2 py-1 text-xs bg-muted text-foreground rounded border border-border',
			'appearance-none pr-6 cursor-pointer',
			'focus:outline-none focus:ring-2 focus:ring-ring'
		].join(' '),
		sortButton: [
			'flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground',
			'hover:text-foreground rounded hover:bg-muted/50 transition-colors touch-target'
		].join(' ')
	},
	variants: {
		chipActive: {
			true: { chip: 'bg-primary text-primary-foreground' },
			false: { chip: 'bg-muted text-muted-foreground hover:bg-muted/80' }
		}
	},
	defaultVariants: {
		chipActive: false
	}
});

/**
 * WorkList variant definitions
 */
export const workListVariants = tv({
	slots: {
		container: 'panel-glass p-4 mx-auto max-w-lg',
		header: 'flex items-center justify-between mb-4',
		title: 'text-lg font-semibold text-foreground flex items-center gap-2',
		list: 'space-y-3'
	},
	variants: {},
	defaultVariants: {}
});

/**
 * WorkCreateForm variant definitions
 */
export const workCreateFormVariants = tv({
	slots: {
		container: 'panel-glass p-6 mx-auto max-w-lg',
		title: 'text-lg font-semibold text-foreground mb-6 flex items-center gap-2',
		form: 'space-y-4',
		fieldGroup: '',
		label: 'block text-sm font-medium text-foreground mb-2',
		required: 'text-destructive font-semibold',
		hint: 'text-xs text-muted-foreground ml-1',
		input: [
			'w-full px-3 py-2 bg-input border border-border rounded-lg',
			'text-foreground placeholder:text-muted-foreground',
			'focus:outline-none focus:ring-2 focus:ring-ring'
		].join(' '),
		select: [
			'w-full px-3 py-2 bg-input border border-border rounded-lg',
			'text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
			'appearance-none pr-10'
		].join(' '),
		selectWrapper: 'relative',
		errorText: 'text-sm text-destructive mt-1',
		message: 'p-3 rounded-lg text-sm',
		submitButton: [
			'w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-lg',
			'hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed',
			'transition-colors touch-target'
		].join(' ')
	},
	variants: {
		messageType: {
			success: { message: 'bg-status-online/10 text-status-online' },
			error: { message: 'bg-status-offline/10 text-status-offline' }
		},
		hasError: {
			true: { input: 'border-destructive' },
			false: {}
		}
	},
	defaultVariants: {
		messageType: 'success',
		hasError: false
	}
});

/**
 * WorkSlingForm variant definitions
 */
export const workSlingFormVariants = tv({
	slots: {
		container: 'panel-glass p-6 mx-auto max-w-lg',
		title: 'text-lg font-semibold text-foreground mb-6 flex items-center gap-2',
		form: 'space-y-4',
		fieldGroup: '',
		label: 'block text-sm font-medium text-foreground mb-2',
		required: 'text-destructive font-semibold',
		hint: 'text-xs text-muted-foreground ml-1',
		selectWrapper: 'relative',
		select: [
			'w-full px-3 py-2 bg-input border border-border rounded-lg',
			'text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
			'appearance-none pr-10'
		].join(' '),
		errorText: 'text-sm text-destructive mt-1',
		message: 'p-3 rounded-lg text-sm',
		submitButton: [
			'w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-lg',
			'hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed',
			'transition-colors touch-target'
		].join(' ')
	},
	variants: {
		messageType: {
			success: { message: 'bg-status-online/10 text-status-online' },
			error: { message: 'bg-status-offline/10 text-status-offline' }
		},
		hasError: {
			true: { select: 'border-destructive' },
			false: {}
		}
	},
	defaultVariants: {
		messageType: 'success',
		hasError: false
	}
});
