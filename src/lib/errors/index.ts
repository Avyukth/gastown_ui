export {
	type ErrorCategory,
	CATEGORY_ICONS,
	CATEGORY_HTTP_STATUS,
	mapCategoryToStatus
} from './categories';

export {
	type KnownBug,
	type ErrorCategoryInfo,
	KNOWN_BUGS,
	identifyKnownBug,
	getErrorCategory,
	isRecoverable
} from './known-bugs';

export interface ApiErrorResponse {
	error: {
		code: string;
		message: string;
		category: ErrorCategory;
		details?: {
			stderr?: string;
			command?: string;
		};
		recoverable: boolean;
		suggestedAction: string;
		knownBug?: string;
	};
}

import { json, type RequestEvent } from '@sveltejs/kit';
import { identifyKnownBug, getErrorCategory, isRecoverable } from './known-bugs';
import { mapCategoryToStatus, type ErrorCategory } from './categories';

export function createApiErrorResponse(
	error: Error | string,
	details?: { stderr?: string; command?: string }
): Response {
	const message = typeof error === 'string' ? error : error.message;
	const bug = identifyKnownBug(message);
	const category = getErrorCategory(error);

	return json(
		{
			error: {
				code: bug?.id ?? 'UNKNOWN',
				message: category.defaultMessage,
				category: category.category,
				details,
				recoverable: isRecoverable(category.category),
				suggestedAction: category.suggestedAction,
				knownBug: bug?.id
			}
		} satisfies ApiErrorResponse,
		{ status: mapCategoryToStatus(category.category) }
	);
}
