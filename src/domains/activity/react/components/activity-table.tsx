import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/table/data-table";
import OrderStatusCell from "@/components/table/cells/order-status-cell";
import TableAddressCell from "@/components/table/cells/table-address-cell";
import TableDateCell from "@/components/table/cells/table-date-cell";
import BasicCell from "@/components/table/cells/basic-cell";
import type { ActivityRow } from "@/domains/activity/activity.types";
import { MOCKED_TABLE_DATA } from "@/domains/activity/activity.constants";

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
  // Todo: get data from backend
  return <DataTable data={MOCKED_TABLE_DATA} columns={columns} pageSize={PAGE_SIZE} />;
}
