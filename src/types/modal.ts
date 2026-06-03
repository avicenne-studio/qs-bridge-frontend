import type { ComponentProps } from "react";
import type OverrideOrderModal from "@/components/modals/override-order-modal";
import type OverrideInboundModal from "@/components/modals/override-inbound-modal";

export const ModalType = {
  overrideOrder: "overrideOrder",
  overrideInboundOrder: "overrideInboundOrder",
} as const;

export type ModalType = (typeof ModalType)[keyof typeof ModalType];

export type ModalComponentType<T extends ModalType> = T extends "overrideOrder"
  ? typeof OverrideOrderModal
  : T extends "overrideInboundOrder"
    ? typeof OverrideInboundModal
    : never;

export type ModalData<T extends ModalType> = ComponentProps<ModalComponentType<T>>;

export interface ModalState<T extends ModalType | undefined> {
  type: T;
  data?: T extends undefined ? undefined : ModalData<NonNullable<T>>;
}
