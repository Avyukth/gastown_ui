export type ErrorCategory =
	| 'KNOWN_BUG'
	| 'CLI_ERROR'
	| 'NETWORK'
	| 'PARSE_ERROR'
	| 'TIMEOUT'
	| 'AUTH'
	| 'UNKNOWN';

export const CATEGORY_ICONS: Record<ErrorCategory, string> = {
	KNOWN_BUG: '🐛',
	CLI_ERROR: '⚠️',
	NETWORK: '🌐',
	PARSE_ERROR: '📄',
	TIMEOUT: '⏱️',
	AUTH: '🔐',
	UNKNOWN: '❌'
};

export const CATEGORY_HTTP_STATUS: Record<ErrorCategory, number> = {
	KNOWN_BUG: 500,
	CLI_ERROR: 500,
	NETWORK: 503,
	PARSE_ERROR: 502,
	TIMEOUT: 504,
	AUTH: 401,
	UNKNOWN: 500
};

export function mapCategoryToStatus(category: ErrorCategory): number {
	return CATEGORY_HTTP_STATUS[category];
}
