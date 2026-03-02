import cn from "@/utils/classnames";
import { DayPicker, getDefaultClassNames, UI } from "react-day-picker";
import "react-day-picker/style.css";

interface Props {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

const defaultClassNames = getDefaultClassNames();

export function Calendar({ selected, onSelect }: Props) {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      navLayout="around"
      classNames={{
        root: cn(defaultClassNames[UI.Root], "bg-white text-primary"),
        today: "border-amber-500",
        selected: "bg-highlight border-highlight text-primary rounded-lg",
        chevron: "fill-primary",
      }}
    />
  );
}
