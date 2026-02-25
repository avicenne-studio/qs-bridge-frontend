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
import OrderStatusCell from "./cells/order-status-cell";
import TableAddressCell from "./cells/table-address-cell";
import TableDateCell from "./cells/table-date-cell";
import BasicCell from "./cells/basic-cell";
import PaginationButton from "./pagination-button";
import type { ActivityRow } from "@/domains/activity/activity.types";
import { MOCKED_TABLE_DATA } from "@/domains/activity/activity.constants";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getHeadCellSortDirection, getHeadCellSortTitle } from "./table.utils";

const PAGE_SIZE = 5;

const columns: ColumnDef<ActivityRow>[] = [
  {
    accessorKey: "status",
    header: () => "Status",
    cell: ({ row }) => <OrderStatusCell status={row.original.status} />,
  },
  {
    accessorKey: "orderId",
    header: () => "Order ID",
    cell: ({ row }) => <BasicCell>{row.original.orderId}</BasicCell>,
  },
  {
    accessorKey: "direction",
    header: () => "Direction",
    cell: ({ row }) => <BasicCell>{row.original.direction}</BasicCell>,
  },
  {
    accessorKey: "from",
    header: () => "From",
    cell: ({ row }) => <TableAddressCell address={row.original.from} />,
  },
  {
    accessorKey: "to",
    header: () => "To",
    cell: ({ row }) => <TableAddressCell address={row.original.to} />,
  },
  {
    accessorKey: "amount",
    header: () => "Amount",
    cell: ({ row }) => <BasicCell>{row.original.amount}</BasicCell>,
  },
  {
    accessorKey: "date",
    header: () => "Date",
    cell: ({ row }) => <TableDateCell date={row.original.date} />,
  },
];

export default function ActivityTable() {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    //Todo: get data from backend
    data: MOCKED_TABLE_DATA,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Todo: when sorting via backend, remove getSortedRowModel()
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: PAGE_SIZE } },
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <>
      <section className="w-full overflow-x-auto">
        <table className="table-fixed border-collapse min-w-[1050px] w-full">
          {/* colgroup: set column widths */}
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
