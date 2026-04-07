import { formatDistanceToNow, parseISO, format } from "date-fns";
import Tooltip from "@/components/ui/tooltip";
import CellLayout from "./cell-layout";

interface Props {
  date: string;
}

export default function TableDateCell({ date }: Props) {
  const parsed = parseISO(date);
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
