import cn from "@/utils/classnames";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

interface Props {
  path: string;
  name: string;
  Icon: LucideIcon;
}

export default function SidebarLink({ path, name, Icon }: Props) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-lg px-4 py-3 text-base leading-none transition-colors",
          isActive ? "bg-white text-primary" : "text-white hover:text-highlight",
        )
      }
    >
      <Icon size={16} className="shrink-0" aria-hidden />
      {name}
    </NavLink>
  );
}
