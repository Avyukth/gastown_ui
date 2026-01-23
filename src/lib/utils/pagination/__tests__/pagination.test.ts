import { describe, it, expect } from 'vitest';
import {
	paginate,
	calculatePagination,
	type PaginatedResponse,
	type PaginationParams,
	PaginationError
} from '../index';

describe('PaginatedResponse interface', () => {
	it('has correct structure with all required fields', () => {
		const response: PaginatedResponse<string> = {
			data: ['item1', 'item2'],
			page: 1,
			pageSize: 50,
			totalItems: 100,
			totalPages: 2,
			hasMore: true
		};

		expect(response).toEqual({
			data: ['item1', 'item2'],
			page: 1,
			pageSize: 50,
			totalItems: 100,
			totalPages: 2,
			hasMore: true
		});
	});

	it('works with complex generic types', () => {
		type User = { id: number; name: string };
		const response: PaginatedResponse<User> = {
			data: [{ id: 1, name: 'Alice' }],
			page: 1,
			pageSize: 50,
			totalItems: 1,
			totalPages: 1,
			hasMore: false
		};

		expect(response.data[0]).toEqual({ id: 1, name: 'Alice' });
	});
});

describe('PaginationParams interface', () => {
	it('has correct structure with page and pageSize', () => {
		const params: PaginationParams = {
			page: 2,
			pageSize: 25
		};

		expect(params).toEqual({ page: 2, pageSize: 25 });
	});

	it('supports optional filters', () => {
		const params: PaginationParams = {
			page: 1,
			pageSize: 50,
			filters: { status: 'active', type: 'user' }
		};

		expect(params.filters).toEqual({ status: 'active', type: 'user' });
	});

	it('uses default page size of 50 when not specified', () => {
		const params: PaginationParams = { page: 1 };

		expect(params.pageSize).toBeUndefined();
	});
});

describe('paginate', () => {
	const testData = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

	it('returns first page with correct items', () => {
		const result = paginate(testData, { page: 1, pageSize: 3 });

		expect(result).toEqual({
			data: ['a', 'b', 'c'],
			page: 1,
			pageSize: 3,
			totalItems: 10,
			totalPages: 4,
			hasMore: true
		});
	});

	it('returns middle page with correct items', () => {
		const result = paginate(testData, { page: 2, pageSize: 3 });

		expect(result).toEqual({
			data: ['d', 'e', 'f'],
			page: 2,
			pageSize: 3,
			totalItems: 10,
			totalPages: 4,
			hasMore: true
		});
	});

	it('returns last page with hasMore false', () => {
		const result = paginate(testData, { page: 4, pageSize: 3 });

		expect(result).toEqual({
			data: ['j'],
			page: 4,
			pageSize: 3,
			totalItems: 10,
			totalPages: 4,
			hasMore: false
		});
	});

	it('uses default pageSize of 50', () => {
		const result = paginate(testData, { page: 1 });

		expect(result.pageSize).toBe(50);
		expect(result.data).toEqual(testData);
		expect(result.hasMore).toBe(false);
	});

	it('handles empty array', () => {
		const result = paginate([], { page: 1, pageSize: 10 });

		expect(result).toEqual({
			data: [],
			page: 1,
			pageSize: 10,
			totalItems: 0,
			totalPages: 0,
			hasMore: false
		});
	});

	it('returns empty data for page beyond range', () => {
		const result = paginate(testData, { page: 100, pageSize: 5 });

		expect(result).toEqual({
			data: [],
			page: 100,
			pageSize: 5,
			totalItems: 10,
			totalPages: 2,
			hasMore: false
		});
	});

	it('throws PaginationError on negative page number', () => {
		expect(() => paginate(testData, { page: -1, pageSize: 5 })).toThrow(PaginationError);
		expect(() => paginate(testData, { page: -1, pageSize: 5 })).toThrow(
			'Page number must be positive'
		);
	});

	it('throws PaginationError on zero page number', () => {
		expect(() => paginate(testData, { page: 0, pageSize: 5 })).toThrow(PaginationError);
		expect(() => paginate(testData, { page: 0, pageSize: 5 })).toThrow(
			'Page number must be positive'
		);
	});

	it('throws PaginationError on negative pageSize', () => {
		expect(() => paginate(testData, { page: 1, pageSize: -5 })).toThrow(PaginationError);
		expect(() => paginate(testData, { page: 1, pageSize: -5 })).toThrow(
			'Page size must be positive'
		);
	});

	it('throws PaginationError on zero pageSize', () => {
		expect(() => paginate(testData, { page: 1, pageSize: 0 })).toThrow(PaginationError);
		expect(() => paginate(testData, { page: 1, pageSize: 0 })).toThrow(
			'Page size must be positive'
		);
	});

	// Boundary cases
	it('handles exactly pageSize items (one full page)', () => {
		const data = ['a', 'b', 'c', 'd', 'e'];
		const result = paginate(data, { page: 1, pageSize: 5 });

		expect(result).toEqual({
			data: ['a', 'b', 'c', 'd', 'e'],
			page: 1,
			pageSize: 5,
			totalItems: 5,
			totalPages: 1,
			hasMore: false
		});
	});

	it('handles one more than pageSize items', () => {
		const data = ['a', 'b', 'c', 'd', 'e', 'f'];
		const result = paginate(data, { page: 1, pageSize: 5 });

		expect(result).toEqual({
			data: ['a', 'b', 'c', 'd', 'e'],
			page: 1,
			pageSize: 5,
			totalItems: 6,
			totalPages: 2,
			hasMore: true
		});
	});

	it('handles one less than pageSize items', () => {
		const data = ['a', 'b', 'c', 'd'];
		const result = paginate(data, { page: 1, pageSize: 5 });

		expect(result).toEqual({
			data: ['a', 'b', 'c', 'd'],
			page: 1,
			pageSize: 5,
			totalItems: 4,
			totalPages: 1,
			hasMore: false
		});
	});

	it('handles single item array', () => {
		const result = paginate(['only'], { page: 1, pageSize: 50 });

		expect(result).toEqual({
			data: ['only'],
			page: 1,
			pageSize: 50,
			totalItems: 1,
			totalPages: 1,
			hasMore: false
		});
	});

	it('works with complex object types', () => {
		type Item = { id: number; value: string };
		const items: Item[] = [
			{ id: 1, value: 'first' },
			{ id: 2, value: 'second' },
			{ id: 3, value: 'third' }
		];

		const result = paginate(items, { page: 1, pageSize: 2 });

		expect(result.data).toEqual([
			{ id: 1, value: 'first' },
			{ id: 2, value: 'second' }
		]);
		expect(result.hasMore).toBe(true);
	});
});

describe('calculatePagination', () => {
	it('calculates correct values for standard case', () => {
		const result = calculatePagination(100, 1, 10);

		expect(result).toEqual({
			totalPages: 10,
			startIndex: 0,
			endIndex: 10,
			hasMore: true
		});
	});

	it('calculates correct values for middle page', () => {
		const result = calculatePagination(100, 5, 10);

		expect(result).toEqual({
			totalPages: 10,
			startIndex: 40,
			endIndex: 50,
			hasMore: true
		});
	});

	it('calculates correct values for last page', () => {
		const result = calculatePagination(100, 10, 10);

		expect(result).toEqual({
			totalPages: 10,
			startIndex: 90,
			endIndex: 100,
			hasMore: false
		});
	});

	it('handles partial last page', () => {
		const result = calculatePagination(95, 10, 10);

		expect(result).toEqual({
			totalPages: 10,
			startIndex: 90,
			endIndex: 95,
			hasMore: false
		});
	});

	it('handles empty total', () => {
		const result = calculatePagination(0, 1, 10);

		expect(result).toEqual({
			totalPages: 0,
			startIndex: 0,
			endIndex: 0,
			hasMore: false
		});
	});

	it('handles page beyond total', () => {
		const result = calculatePagination(10, 5, 10);

		expect(result).toEqual({
			totalPages: 1,
			startIndex: 40,
			endIndex: 10,
			hasMore: false
		});
	});

	it('calculates correct totalPages when items divide evenly', () => {
		const result = calculatePagination(50, 1, 10);

		expect(result.totalPages).toBe(5);
	});

	it('calculates correct totalPages when items do not divide evenly', () => {
		const result = calculatePagination(51, 1, 10);

		expect(result.totalPages).toBe(6);
	});

	it('throws PaginationError for negative totalItems', () => {
		expect(() => calculatePagination(-5, 1, 10)).toThrow(PaginationError);
		expect(() => calculatePagination(-5, 1, 10)).toThrow('Total items cannot be negative');
	});

	it('throws PaginationError for negative page', () => {
		expect(() => calculatePagination(100, -1, 10)).toThrow(PaginationError);
		expect(() => calculatePagination(100, -1, 10)).toThrow('Page number must be positive');
	});

	it('throws PaginationError for zero page', () => {
		expect(() => calculatePagination(100, 0, 10)).toThrow(PaginationError);
		expect(() => calculatePagination(100, 0, 10)).toThrow('Page number must be positive');
	});

	it('throws PaginationError for negative pageSize', () => {
		expect(() => calculatePagination(100, 1, -10)).toThrow(PaginationError);
		expect(() => calculatePagination(100, 1, -10)).toThrow('Page size must be positive');
	});

	it('throws PaginationError for zero pageSize', () => {
		expect(() => calculatePagination(100, 1, 0)).toThrow(PaginationError);
		expect(() => calculatePagination(100, 1, 0)).toThrow('Page size must be positive');
	});
});

describe('PaginationError', () => {
	it('has correct name', () => {
		const err = new PaginationError('test error');
		expect(err.name).toBe('PaginationError');
	});

	it('has correct message', () => {
		const err = new PaginationError('Page number must be positive');
		expect(err.message).toBe('Page number must be positive');
	});

	it('is instanceof Error', () => {
		const err = new PaginationError('test');
		expect(err).toBeInstanceOf(Error);
		expect(err).toBeInstanceOf(PaginationError);
	});
});
