import type { ColumnDef } from "@tanstack/react-table";
import DataTable, { type ServerPagination } from "@/components/table/data-table";
import OrderStatusCell from "@/components/table/cells/order-status-cell";
import OrderIdCell from "@/components/table/cells/order-id-cell";
import TableAddressCell from "@/components/table/cells/table-address-cell";
import TableDateCell from "@/components/table/cells/table-date-cell";
import BasicCell from "@/components/table/cells/basic-cell";
import type { HistoryRow } from "@/domains/history/history.types";

const columns: ColumnDef<HistoryRow>[] = [
  {
    accessorKey: "status",
    header: () => "Status",
    cell: ({ row }) => <OrderStatusCell status={row.original.status} />,
  },
  {
    accessorKey: "orderId",
    header: () => "Order ID",
    cell: ({ row }) => (
      <OrderIdCell displayId={row.original.orderId} fullId={row.original.fullOrderId} />
    ),
  },
  {
    accessorKey: "direction",
    header: () => "Direction",
    cell: ({ row }) => <BasicCell>{row.original.direction}</BasicCell>,
  },
  {
    accessorKey: "from",
    header: () => "From",
    cell: ({ row }) => (
      <TableAddressCell address={row.original.from} chain={row.original.sourceChain} />
    ),
  },
  {
    accessorKey: "to",
    header: () => "To",
    cell: ({ row }) => (
      <TableAddressCell address={row.original.to} chain={row.original.destChain} />
    ),
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

interface Props {
  data: HistoryRow[];
  pagination: ServerPagination;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function HistoryTable({ data, pagination, isLoading, onPageChange }: Props) {
  if (isLoading && data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray">
        Loading history...
      </div>
    );
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      serverPagination={pagination}
      onPageChange={onPageChange}
    />
  );
}
