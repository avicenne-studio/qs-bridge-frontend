import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import HeadCell from "./cells/head-cell";
import PaginationButton from "./pagination-button";
import { getHeadCellSortDirection, getHeadCellSortTitle } from "./table.utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  pageSize?: number;
}

export default function DataTable<TData>({ data, columns, pageSize = 10 }: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Todo: when sorting via backend, remove getSortedRowModel()
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize } },
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <>
      <section className="w-full overflow-x-auto">
        <table className="table-fixed border-collapse min-w-[1050px] w-full">
          <colgroup>
            {columns.map((_, i) => (
              <col
                key={i}
                style={{ width: `${100 / columns.length}%` }}
                className="min-w-[150px]"
              />
            ))}
          </colgroup>

          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) =>
                  header.isPlaceholder ? null : (
                    <HeadCell
                      key={header.id}
                      canSort={header.column.getCanSort()}
                      sortDirection={getHeadCellSortDirection(header)}
                      onSort={header.column.getToggleSortingHandler()}
                      title={getHeadCellSortTitle(header)}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </HeadCell>
                  ),
                )}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="odd:bg-[#F5FBFB] rounded-lg overflow-hidden">
                {row
                  .getVisibleCells()
                  .map((cell) => flexRender(cell.column.columnDef.cell, cell.getContext()))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="flex w-full py-4 justify-center items-center gap-4">
        <div className="flex items-center gap-2">
          <PaginationButton
            action={() => table.setPageIndex(0)}
            disabled={table.getState().pagination.pageIndex === 0}
            Icon={ChevronsLeft}
          />
          <PaginationButton
            action={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            Icon={ChevronLeft}
          />
        </div>

        <span className="text-xs font-medium text-primary">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>

        <div className="flex items-center gap-2">
          <PaginationButton
            action={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            Icon={ChevronRight}
          />
          <PaginationButton
            action={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
            Icon={ChevronsRight}
          />
        </div>
      </div>
    </>
  );
}
