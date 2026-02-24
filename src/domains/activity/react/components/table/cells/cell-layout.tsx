import type { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  type: "td" | "th";
}

export default function CellLayout({ children, type }: Props) {
  const cellClasses = "py-3 text-sm text-primary first:pl-3 last:pr-3";
  return type === "td" ? (
    <td className={cellClasses}>{children}</td>
  ) : (
    <th className={cellClasses}>{children}</th>
  );
}
