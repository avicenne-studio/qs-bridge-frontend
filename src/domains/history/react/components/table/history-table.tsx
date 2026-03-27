import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/table/data-table";
import OrderStatusCell from "@/components/table/cells/order-status-cell";
import TableAddressCell from "@/components/table/cells/table-address-cell";
import TableDateCell from "@/components/table/cells/table-date-cell";
import BasicCell from "@/components/table/cells/basic-cell";
import CellLayout from "@/components/table/cells/cell-layout";
import Button from "@/components/core/buttons/button/button";
import type { HistoryRow } from "@/domains/history/history.types";
import { MOCKED_HISTORY_DATA } from "@/domains/history/history.constants";
import { useModalStore } from "@/stores/modal-store";
import { ModalType } from "@/types/modal";

const PAGE_SIZE = 5;

function OverrideActionCell({ row }: { row: HistoryRow }) {
  const { openModal } = useModalStore();

  const canOverride = !!row.nonce && row.networkOut !== undefined;

  return (
    <CellLayout type="td">
      {canOverride && (
        <Button
          variant="default"
          size="small"
          label="Override"
          action={() =>
            openModal(ModalType.overrideOrder, { nonce: row.nonce!, networkOut: row.networkOut! })
          }
        />
      )}
    </CellLayout>
  );
}

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
  {
    id: "actions",
    enableSorting: false,
    header: () => "",
    cell: ({ row }) => <OverrideActionCell row={row.original} />,
  },
];

interface Props {
  data: HistoryRow[];
}

export default function HistoryTable({ data = MOCKED_HISTORY_DATA }: Props) {
  return <DataTable data={data} columns={columns} pageSize={PAGE_SIZE} />;
}
