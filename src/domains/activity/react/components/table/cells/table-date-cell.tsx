import { format, parseISO } from "date-fns";
import CellLayout from "./cell-layout";

interface Props {
  date: string;
}

const DATE_DISPLAY_FORMAT = "dd/MM/yy";

export default function TableDateCell({ date }: Props) {
  const parsed = parseISO(date);
  const formatted = format(parsed, DATE_DISPLAY_FORMAT);

  return <CellLayout type="td">{formatted}</CellLayout>;
}
