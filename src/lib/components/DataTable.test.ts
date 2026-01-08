/**
 * DataTable Component Tests
 *
 * Tests for DataTable rendering, sorting, selection, and accessibility.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import DataTable from './DataTable.svelte';

// Sample data for tests
interface TestRow extends Record<string, unknown> {
	id: string;
	name: string;
	status: string;
	priority: number;
}

const testData: TestRow[] = [
	{ id: '1', name: 'Task A', status: 'active', priority: 1 },
	{ id: '2', name: 'Task B', status: 'pending', priority: 2 },
	{ id: '3', name: 'Task C', status: 'complete', priority: 3 }
];

const testColumns = [
	{ key: 'id' as const, header: 'ID' },
	{ key: 'name' as const, header: 'Name' },
	{ key: 'status' as const, header: 'Status' }
];

describe('DataTable', () => {
	describe('Rendering', () => {
		it('renders a table with correct structure', () => {
			render(DataTable, {
				props: { columns: testColumns, data: testData }
			});
			expect(screen.getByRole('region')).toBeInTheDocument();
			expect(screen.getByRole('table')).toBeInTheDocument();
		});

		it('renders column headers', () => {
			render(DataTable, {
				props: { columns: testColumns, data: testData }
			});
			expect(screen.getByText('ID')).toBeInTheDocument();
			expect(screen.getByText('Name')).toBeInTheDocument();
			expect(screen.getByText('Status')).toBeInTheDocument();
		});

		it('renders data rows', () => {
			render(DataTable, {
				props: { columns: testColumns, data: testData }
			});
			expect(screen.getByText('Task A')).toBeInTheDocument();
			expect(screen.getByText('Task B')).toBeInTheDocument();
			expect(screen.getByText('Task C')).toBeInTheDocument();
		});

		it('renders em-dash for null/undefined values', () => {
			const dataWithNull = [{ id: '1', name: null, status: 'active' }];
			const columns = [
				{ key: 'id', header: 'ID' },
				{ key: 'name', header: 'Name' }
			];
			render(DataTable, {
				props: { columns, data: dataWithNull as unknown as TestRow[] }
			});
			expect(screen.getByText('—')).toBeInTheDocument();
		});
	});

	describe('Empty State', () => {
		it('shows default empty message when no data', () => {
			render(DataTable, {
				props: { columns: testColumns, data: [] }
			});
			expect(screen.getByText('No data available')).toBeInTheDocument();
		});

		it('shows custom empty message', () => {
			render(DataTable, {
				props: {
					columns: testColumns,
					data: [],
					emptyMessage: 'No tasks found'
				}
			});
			expect(screen.getByText('No tasks found')).toBeInTheDocument();
		});
	});

	describe('Loading State', () => {
		it('shows skeleton rows when loading', () => {
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					loading: true,
					loadingRows: 3
				}
			});
			// Should not show data rows when loading
			expect(screen.queryByText('Task A')).not.toBeInTheDocument();
		});

		it('sets aria-busy when loading', () => {
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					loading: true
				}
			});
			expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
		});
	});

	describe('Sorting', () => {
		it('shows sort icons for sortable columns', () => {
			const sortableColumns = [
				{ key: 'id' as const, header: 'ID', sortable: true },
				{ key: 'name' as const, header: 'Name', sortable: true }
			];
			render(DataTable, {
				props: {
					columns: sortableColumns,
					data: testData,
					onSort: vi.fn()
				}
			});
			// Should have buttons for sortable headers
			const buttons = screen.getAllByRole('button');
			expect(buttons.length).toBeGreaterThan(0);
		});

		it('calls onSort when clicking sortable column', async () => {
			const onSort = vi.fn();
			const sortableColumns = [
				{ key: 'name' as const, header: 'Name', sortable: true }
			];
			render(DataTable, {
				props: {
					columns: sortableColumns,
					data: testData,
					onSort
				}
			});
			const sortButton = screen.getByRole('button', { name: /name/i });
			await fireEvent.click(sortButton);
			expect(onSort).toHaveBeenCalledWith('name', 'asc');
		});

		it('toggles sort direction when clicking same column', async () => {
			const onSort = vi.fn();
			const sortableColumns = [
				{ key: 'name' as const, header: 'Name', sortable: true }
			];
			render(DataTable, {
				props: {
					columns: sortableColumns,
					data: testData,
					sortKey: 'name',
					sortDirection: 'asc',
					onSort
				}
			});
			const sortButton = screen.getByRole('button', { name: /name/i });
			await fireEvent.click(sortButton);
			expect(onSort).toHaveBeenCalledWith('name', 'desc');
		});

		it('sets aria-sort on sorted column', () => {
			const sortableColumns = [
				{ key: 'name' as const, header: 'Name', sortable: true }
			];
			render(DataTable, {
				props: {
					columns: sortableColumns,
					data: testData,
					sortKey: 'name',
					sortDirection: 'asc',
					onSort: vi.fn()
				}
			});
			const header = screen.getByRole('columnheader', { name: /name/i });
			expect(header).toHaveAttribute('aria-sort', 'ascending');
		});
	});

	describe('Selection', () => {
		it('shows selection checkboxes when selectable', () => {
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					selectable: true,
					onSelect: vi.fn()
				}
			});
			// Header checkbox + 3 row checkboxes
			const buttons = screen.getAllByRole('button');
			expect(buttons.length).toBe(4);
		});

		it('calls onSelect when toggling row selection', async () => {
			const onSelect = vi.fn();
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					selectable: true,
					keyField: 'id',
					selectedKeys: new Set(),
					onSelect
				}
			});
			const rowCheckboxes = screen.getAllByRole('button', { name: /select row/i });
			await fireEvent.click(rowCheckboxes[0]);
			expect(onSelect).toHaveBeenCalled();
			const selectedSet = onSelect.mock.calls[0][0];
			expect(selectedSet.has('1')).toBe(true);
		});

		it('calls onSelect when clicking select all', async () => {
			const onSelect = vi.fn();
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					selectable: true,
					keyField: 'id',
					selectedKeys: new Set(),
					onSelect
				}
			});
			const selectAllButton = screen.getByRole('button', { name: /select all/i });
			await fireEvent.click(selectAllButton);
			expect(onSelect).toHaveBeenCalled();
			const selectedSet = onSelect.mock.calls[0][0];
			expect(selectedSet.size).toBe(3);
		});

		it('deselects all when all are selected', async () => {
			const onSelect = vi.fn();
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					selectable: true,
					keyField: 'id',
					selectedKeys: new Set(['1', '2', '3']),
					onSelect
				}
			});
			const deselectAllButton = screen.getByRole('button', { name: /deselect all/i });
			await fireEvent.click(deselectAllButton);
			expect(onSelect).toHaveBeenCalled();
			const selectedSet = onSelect.mock.calls[0][0];
			expect(selectedSet.size).toBe(0);
		});

		it('applies selected row styling', () => {
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					selectable: true,
					keyField: 'id',
					selectedKeys: new Set(['1']),
					onSelect: vi.fn()
				}
			});
			const rows = screen.getAllByRole('row');
			// First data row (index 1, since 0 is header) should have selection styling
			expect(rows[1]).toHaveClass('bg-primary/5');
		});

		it('sets aria-selected on selected rows', () => {
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					selectable: true,
					keyField: 'id',
					selectedKeys: new Set(['1']),
					onSelect: vi.fn()
				}
			});
			const rows = screen.getAllByRole('row');
			expect(rows[1]).toHaveAttribute('aria-selected', 'true');
			expect(rows[2]).toHaveAttribute('aria-selected', 'false');
		});
	});

	describe('Variants', () => {
		it('applies striped variant', () => {
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					variant: 'striped'
				}
			});
			const rows = screen.getAllByRole('row');
			// Data rows should have striped styling
			expect(rows[1]).toHaveClass('even:bg-muted/20');
		});

		it('applies bordered variant', () => {
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					variant: 'bordered'
				}
			});
			const cells = screen.getAllByRole('cell');
			expect(cells[0]).toHaveClass('border-x');
		});
	});

	describe('Sizes', () => {
		it('applies small size', () => {
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					size: 'sm'
				}
			});
			const cells = screen.getAllByRole('cell');
			expect(cells[0]).toHaveClass('px-3');
			expect(cells[0]).toHaveClass('py-2');
		});

		it('applies large size', () => {
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					size: 'lg'
				}
			});
			const cells = screen.getAllByRole('cell');
			expect(cells[0]).toHaveClass('px-6');
			expect(cells[0]).toHaveClass('py-4');
		});
	});

	describe('Column Alignment', () => {
		it('applies right alignment', () => {
			const alignedColumns = [
				{ key: 'id' as const, header: 'ID', align: 'right' as const }
			];
			render(DataTable, {
				props: {
					columns: alignedColumns,
					data: testData
				}
			});
			const cells = screen.getAllByRole('cell');
			expect(cells[0]).toHaveClass('text-right');
		});

		it('applies center alignment', () => {
			const alignedColumns = [
				{ key: 'status' as const, header: 'Status', align: 'center' as const }
			];
			render(DataTable, {
				props: {
					columns: alignedColumns,
					data: testData
				}
			});
			const cells = screen.getAllByRole('cell');
			expect(cells[0]).toHaveClass('text-center');
		});
	});

	describe('Accessibility', () => {
		it('has accessible region with label', () => {
			render(DataTable, {
				props: { columns: testColumns, data: testData }
			});
			const region = screen.getByRole('region');
			expect(region).toHaveAttribute('aria-label', 'Data table');
		});

		it('has scope="col" on header cells', () => {
			render(DataTable, {
				props: { columns: testColumns, data: testData }
			});
			const headers = screen.getAllByRole('columnheader');
			headers.forEach((header) => {
				expect(header).toHaveAttribute('scope', 'col');
			});
		});

		it('supports keyboard navigation for sorting', async () => {
			const onSort = vi.fn();
			const sortableColumns = [
				{ key: 'name' as const, header: 'Name', sortable: true }
			];
			render(DataTable, {
				props: {
					columns: sortableColumns,
					data: testData,
					onSort
				}
			});
			const sortButton = screen.getByRole('button', { name: /name/i });
			await fireEvent.keyDown(sortButton, { key: 'Enter' });
			expect(onSort).toHaveBeenCalled();
		});

		it('supports space key for sorting', async () => {
			const onSort = vi.fn();
			const sortableColumns = [
				{ key: 'name' as const, header: 'Name', sortable: true }
			];
			render(DataTable, {
				props: {
					columns: sortableColumns,
					data: testData,
					onSort
				}
			});
			const sortButton = screen.getByRole('button', { name: /name/i });
			await fireEvent.keyDown(sortButton, { key: ' ' });
			expect(onSort).toHaveBeenCalled();
		});
	});

	describe('Custom Classes', () => {
		it('accepts custom class names', () => {
			render(DataTable, {
				props: {
					columns: testColumns,
					data: testData,
					class: 'my-custom-class'
				}
			});
			const region = screen.getByRole('region');
			expect(region).toHaveClass('my-custom-class');
		});
	});
});
