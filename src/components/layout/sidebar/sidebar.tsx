import { NavLink } from "react-router-dom";
import { History, Plus, Radio, SendToBack } from "lucide-react";
import { routes } from "@/constants/routes";
import QubicBridgeLogomark from "@/components/core/assets/qubic-bridge-logomark";
import StatusSection from "./components/status/status-section";
import SidebarLink from "./components/sidebar-link";
import Button from "@/components/core/buttons/button";

const navItems = [
  { path: routes.activity.path, name: routes.activity.name, Icon: Radio },
  { path: routes.bridge.path, name: routes.bridge.name, Icon: SendToBack },
  { path: routes.history.path, name: routes.history.name, Icon: History },
] as const;

export default function Sidebar() {
  return (
    <aside className="flex w-[300px] h-full shrink-0 flex-col bg-white">
      <NavLink
        to={routes.activity.path}
        className="flex h-[90px] items-center justify-center shrink-0 bg-primary"
      >
        <QubicBridgeLogomark />
      </NavLink>

      <div className="flex flex-1 flex-col px-6 py-10 justify-between gap-6 bg-primary rounded-br-3xl">
        <nav className="flex flex-col gap-1">
          {navItems.map(({ path, name, Icon }) => (
            <SidebarLink key={path} path={path} name={name} Icon={Icon} />
          ))}
        </nav>
        <Button
          variant="default"
          label="Start new bridge"
          icon={<Plus size={16} />}
          path={routes.bridge.path}
          isInternalLink
          isFullWidth
        />
      </div>
      <div className="flex w-full h-fit bg-primary">
        <StatusSection />
      </div>
    </aside>
  );
}
