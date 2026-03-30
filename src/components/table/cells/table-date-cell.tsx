import { formatDistanceToNow, parseISO, format } from "date-fns";
import Tooltip from "@/components/ui/tooltip";
import CellLayout from "./cell-layout";

interface Props {
  date: string;
}

export default function TableDateCell({ date }: Props) {
  // Hub stores UTC timestamps without timezone suffix — append Z if missing
  const normalized = date.endsWith("Z") || date.includes("+") ? date : `${date}Z`;
  const parsed = parseISO(normalized);
  const ago = formatDistanceToNow(parsed, { addSuffix: true });
  const full = format(parsed, "dd/MM/yyyy HH:mm");

  return (
    <CellLayout type="td">
      <Tooltip content={full}>
        <span className="cursor-default">{ago}</span>
      </Tooltip>
    </CellLayout>
  );
}
