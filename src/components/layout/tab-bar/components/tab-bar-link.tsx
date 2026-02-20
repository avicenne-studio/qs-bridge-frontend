import cn from "@/utils/classnames";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

interface Props {
  path: string;
  name: string;
  Icon: LucideIcon;
}

export default function TabBarLink({ path, name, Icon }: Props) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          "flex w-10 shrink-0 flex-col items-center justify-center gap-1 transition-colors",
          isActive ? "text-highlight" : "text-white",
        )
      }
    >
      <Icon size={20} className="shrink-0" aria-hidden />
      <span className="text-[10px] leading-none">{name}</span>
    </NavLink>
  );
}
