import type { PropsWithChildren } from "react";
import CellLayout from "./cell-layout";

export default function BasicCell({ children }: PropsWithChildren) {
  return <CellLayout type="td">{children}</CellLayout>;
}
