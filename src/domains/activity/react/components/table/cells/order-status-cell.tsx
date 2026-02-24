import type { OrderStatus } from "@/domains/activity/activity.types";
import cn from "@/utils/classnames";
import CellLayout from "./cell-layout";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "text-[#7d5a00] border-[#7d5a00] bg-warning-100",
  },
  "in-progress": {
    label: "In progress",
    className: "text-[#646cff] border-[#646cff] bg-primary-100",
  },
  "ready-for-relay": {
    label: "Ready for relay",
    className: "text-[#007d0f] border-[#007d0f] bg-success-100",
  },
  failed: {
    label: "Failed",
    className: "text-[#7d0000] border-[#7d0000] bg-error-100",
  },
  finalized: {
    label: "Finalized",
    className: "text-[#007d0f] border-[#007d0f] bg-success-100",
  },
};

interface Props {
  status: OrderStatus;
}

export default function OrderStatusCell({ status }: Props) {
  const { label, className } = STATUS_CONFIG[status];

  return (
    <CellLayout type="td">
      <span className={cn("text-xs font-normal py-0.5 px-1.5 rounded-md", className)}>{label}</span>
    </CellLayout>
  );
}
