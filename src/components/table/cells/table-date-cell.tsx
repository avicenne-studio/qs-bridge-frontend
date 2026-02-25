import { format, parseISO } from "date-fns";
import CellLayout from "./cell-layout";

interface Props {
  date: string;
}

export default function TableDateCell({ date }: Props) {
  const parsed = parseISO(date);
  const formatted = format(parsed, "dd/MM/yy");

  return <CellLayout type="td">{formatted}</CellLayout>;
}
