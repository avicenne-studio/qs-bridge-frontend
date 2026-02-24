import {
  flexRender,
  getCoreRowModel,
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
import type { ActivityRow } from "@/domains/activity/activity.types";
import { MOCKED_TABLE_DATA } from "@/domains/activity/activity.constants";

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
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <section className="mt-8 w-full overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) =>
                header.isPlaceholder ? null : (
                  <HeadCell
                    key={header.id}
                    canSort={header.column.getCanSort()}
                    isSorted={header.column.getIsSorted()}
                    onSort={header.column.getToggleSortingHandler()}
                    title={
                      header.column.getCanSort()
                        ? header.column.getNextSortingOrder() === "asc"
                          ? "Sort by ascending order"
                          : header.column.getNextSortingOrder() === "desc"
                            ? "Sort by descending order"
                            : "Cancel sorting"
                        : undefined
                    }
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
  );
}
