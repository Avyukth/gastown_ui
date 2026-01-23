/**
 * Error thrown when pagination parameters are invalid.
 */
export class PaginationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PaginationError';
	}
}

/**
 * Response structure for paginated data.
 */
export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	hasMore: boolean;
}

/**
 * Parameters for pagination requests.
 */
export interface PaginationParams {
	page: number;
	pageSize?: number;
	filters?: Record<string, unknown>;
}

/**
 * Result of pagination calculation.
 */
export interface PaginationCalcResult {
	totalPages: number;
	startIndex: number;
	endIndex: number;
	hasMore: boolean;
}

const DEFAULT_PAGE_SIZE = 50;

/**
 * Paginates an array of items.
 */
export function paginate<T>(items: T[], params: PaginationParams): PaginatedResponse<T> {
	const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

	if (params.page <= 0) {
		throw new PaginationError('Page number must be positive');
	}
	if (pageSize <= 0) {
		throw new PaginationError('Page size must be positive');
	}

	const totalItems = items.length;
	const calc = calculatePagination(totalItems, params.page, pageSize);

	return {
		data: items.slice(calc.startIndex, calc.endIndex),
		page: params.page,
		pageSize,
		totalItems,
		totalPages: calc.totalPages,
		hasMore: calc.hasMore
	};
}

/**
 * Calculates pagination values.
 */
export function calculatePagination(
	totalItems: number,
	page: number,
	pageSize: number
): PaginationCalcResult {
	if (totalItems < 0) {
		throw new PaginationError('Total items cannot be negative');
	}
	if (page <= 0) {
		throw new PaginationError('Page number must be positive');
	}
	if (pageSize <= 0) {
		throw new PaginationError('Page size must be positive');
	}

	const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
	const startIndex = (page - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, totalItems);
	const hasMore = page < totalPages;

	return {
		totalPages,
		startIndex,
		endIndex,
		hasMore
	};
}
