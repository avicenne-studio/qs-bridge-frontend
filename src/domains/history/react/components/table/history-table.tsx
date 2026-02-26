import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/table/data-table";
import OrderStatusCell from "@/components/table/cells/order-status-cell";
import TableAddressCell from "@/components/table/cells/table-address-cell";
import TableDateCell from "@/components/table/cells/table-date-cell";
import BasicCell from "@/components/table/cells/basic-cell";
import type { HistoryRow } from "@/domains/history/history.types";
import { MOCKED_HISTORY_DATA } from "@/domains/history/history.constants";

const PAGE_SIZE = 5;

const columns: ColumnDef<HistoryRow>[] = [
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

interface Props {
  data: HistoryRow[];
}

export default function HistoryTable({ data = MOCKED_HISTORY_DATA }: Props) {
  return <DataTable data={data} columns={columns} pageSize={PAGE_SIZE} />;
}
