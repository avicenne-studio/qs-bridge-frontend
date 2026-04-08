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

export type ServerPagination = {
  page: number;
  limit: number;
  total: number;
};

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  pageSize?: number;
  serverPagination?: ServerPagination;
  onPageChange?: (page: number) => void;
}

export default function DataTable<TData>({
  data,
  columns,
  pageSize = 10,
  serverPagination,
  onPageChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const isServerSide = !!serverPagination;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(isServerSide
      ? {
          manualPagination: true,
          manualSorting: true,
          pageCount: Math.ceil(serverPagination.total / serverPagination.limit),
          state: {
            pagination: {
              pageIndex: serverPagination.page - 1,
              pageSize: serverPagination.limit,
            },
          },
          enableSorting: false,
        }
      : {
          getSortedRowModel: getSortedRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          initialState: { pagination: { pageIndex: 0, pageSize } },
          state: { sorting },
          onSortingChange: setSorting,
        }),
  });

  const currentPage = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  function goToPage(pageIndex: number) {
    if (isServerSide && onPageChange) {
      onPageChange(pageIndex + 1);
    } else {
      table.setPageIndex(pageIndex);
    }
  }

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

      {pageCount > 0 && (
        <div className="flex w-full py-4 justify-center items-center gap-4">
          <div className="flex items-center gap-2">
            <PaginationButton
              action={() => goToPage(0)}
              disabled={currentPage === 0}
              Icon={ChevronsLeft}
            />
            <PaginationButton
              action={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              Icon={ChevronLeft}
            />
          </div>

          <span className="text-xs font-medium text-primary">
            Page {currentPage + 1} of {pageCount}
          </span>

          <div className="flex items-center gap-2">
            <PaginationButton
              action={() => goToPage(currentPage + 1)}
              disabled={currentPage >= pageCount - 1}
              Icon={ChevronRight}
            />
            <PaginationButton
              action={() => goToPage(pageCount - 1)}
              disabled={currentPage >= pageCount - 1}
              Icon={ChevronsRight}
            />
          </div>
        </div>
      )}
    </>
  );
}
