import { type ErrorCategory, CATEGORY_ICONS } from './categories';

export interface KnownBug {
	id: string;
	pattern: RegExp | string;
	category: ErrorCategory;
	userMessage: string;
	workaround: string;
	ticketUrl?: string;
	addedInVersion?: string;
}

export const KNOWN_BUGS: KnownBug[] = [
	{
		id: 'mail-inbox-daemon',
		pattern: /gt mail inbox.*daemon.*not running/i,
		category: 'KNOWN_BUG',
		userMessage: 'Mail inbox unavailable (daemon not running)',
		workaround: "Run 'gt start' to start the daemon, then retry."
	},
	{
		id: 'rig-add-timeout',
		pattern: /gt rig add.*timed out|clone.*timeout/i,
		category: 'TIMEOUT',
		userMessage: 'Rig add timed out (large repository)',
		workaround: 'Try again - large repos can take several minutes.'
	},
	{
		id: 'beads-database-locked',
		pattern: /database.*locked|SQLITE_BUSY/i,
		category: 'KNOWN_BUG',
		userMessage: 'Database is locked by another process',
		workaround: 'Wait a moment and retry. If persistent, restart the daemon.'
	},
	{
		id: 'network-unreachable',
		pattern: /network.*unreachable|ECONNREFUSED|ETIMEDOUT/i,
		category: 'NETWORK',
		userMessage: 'Network connection failed',
		workaround: 'Check your internet connection and try again.'
	},
	{
		id: 'json-parse-error',
		pattern: /unexpected token|JSON.*parse|invalid JSON/i,
		category: 'PARSE_ERROR',
		userMessage: 'Invalid response from CLI',
		workaround: 'This may be a CLI version mismatch. Check gt --version.'
	},
	{
		id: 'auth-expired',
		pattern: /authentication.*expired|401|not authorized/i,
		category: 'AUTH',
		userMessage: 'Authentication required',
		workaround: 'Sign in again to continue.'
	},
	{
		id: 'git-not-found',
		pattern: /git.*not found|command not found.*git/i,
		category: 'CLI_ERROR',
		userMessage: 'Git is not installed or not in PATH',
		workaround: 'Install git and ensure it is available in your PATH.'
	},
	{
		id: 'permission-denied',
		pattern: /permission denied|EACCES/i,
		category: 'CLI_ERROR',
		userMessage: 'Permission denied',
		workaround: 'Check file permissions or run with appropriate privileges.'
	}
];

export function identifyKnownBug(errorMessage: string): KnownBug | null {
	for (const bug of KNOWN_BUGS) {
		const pattern = typeof bug.pattern === 'string' ? new RegExp(bug.pattern, 'i') : bug.pattern;

		if (pattern.test(errorMessage)) {
			return bug;
		}
	}
	return null;
}

export interface ErrorCategoryInfo {
	category: ErrorCategory;
	defaultMessage: string;
	suggestedAction: string;
	icon: string;
}

export function getErrorCategory(error: Error | string): ErrorCategoryInfo {
	const message = typeof error === 'string' ? error : error.message;
	const bug = identifyKnownBug(message);

	if (bug) {
		return {
			category: bug.category,
			defaultMessage: bug.userMessage,
			suggestedAction: bug.workaround,
			icon: CATEGORY_ICONS[bug.category]
		};
	}

	if (/timeout/i.test(message)) {
		return {
			category: 'TIMEOUT',
			defaultMessage: 'Request timed out',
			suggestedAction: 'Try again in a moment',
			icon: CATEGORY_ICONS.TIMEOUT
		};
	}

	if (/network|ECONNREFUSED|ETIMEDOUT|fetch failed/i.test(message)) {
		return {
			category: 'NETWORK',
			defaultMessage: 'Network error',
			suggestedAction: 'Check your connection and try again',
			icon: CATEGORY_ICONS.NETWORK
		};
	}

	if (/unauthorized|401|403|forbidden/i.test(message)) {
		return {
			category: 'AUTH',
			defaultMessage: 'Authentication required',
			suggestedAction: 'Sign in to continue',
			icon: CATEGORY_ICONS.AUTH
		};
	}

	if (/parse|JSON|syntax/i.test(message)) {
		return {
			category: 'PARSE_ERROR',
			defaultMessage: 'Failed to parse response',
			suggestedAction: 'Try again or report this issue',
			icon: CATEGORY_ICONS.PARSE_ERROR
		};
	}

	return {
		category: 'UNKNOWN',
		defaultMessage: 'Something went wrong',
		suggestedAction: 'Please try again',
		icon: CATEGORY_ICONS.UNKNOWN
	};
}

export function isRecoverable(category: ErrorCategory): boolean {
	return category !== 'AUTH';
}
