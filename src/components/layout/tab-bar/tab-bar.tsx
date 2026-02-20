import { useState } from "react";
import { History, Radio, SendToBack, Activity } from "lucide-react";
import { routes } from "@/constants/routes";
import TabBarLink from "./components/tab-bar-link";
import StatusItem from "../sidebar/components/status/status-item";
import cn from "@/utils/classnames";

const navItems = [
  { path: routes.activity.path, name: routes.activity.name, Icon: Radio },
  { path: routes.bridge.path, name: routes.bridge.name, Icon: SendToBack },
  { path: routes.history.path, name: routes.history.name, Icon: History },
];

const STATUS_ITEMS = [
  { label: "Qubic → Solana", value: "Operational" },
  { label: "Solana → Qubic", value: "Operational" },
  { label: "Oracles", value: "12/12 online" },
];

export default function TabBar() {
  const [isStatusPanelOpen, setIsStatusPanelOpen] = useState(false);

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50", "flex xl:hidden")}>
      <div
        className={cn(
          "absolute left-0 right-0 -bottom-full h-fit pb-[calc(58px*2+24px)] shrink-0 w-full bg-highlight transition-transform duration-300 ease-out rounded-t-3xl px-6 pt-6 gap-2 flex flex-col",
          isStatusPanelOpen ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!isStatusPanelOpen}
      >
        <span className="text-primary text-sm font-semibold uppercase">Status</span>
        <div className="flex flex-col gap-2">
          {STATUS_ITEMS.map(({ label, value }) => (
            <StatusItem key={label} label={label} value={value} variant="tab-bar" />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-row items-center justify-center gap-6 rounded-t-3xl bg-primary px-8 py-3 w-fit">
        {navItems.map(({ path, name, Icon }) => (
          <TabBarLink key={path} path={path} name={name} Icon={Icon} />
        ))}
      </div>

      <div className="relative z-10 flex flex-row items-center justify-center bg-primary w-full h-[58px]">
        <div
          className={cn(
            "relative flex size-full bg-white rounded-bl-3xl overflow-hidden",
            "transition-[border-radius]",
            isStatusPanelOpen
              ? "rounded-br-0 duration-125 ease"
              : "rounded-br-3xl duration-300 ease",
          )}
        >
          <div
            className={cn(
              "absolute left-0 right-0 -bottom-full min-h-[300px] w-full rounded-b-3xl bg-highlight transition-[transform, border-radius] duration-300 ease-out",
              isStatusPanelOpen ? "translate-y-0" : "translate-y-[calc(100%+24px)]",
            )}
            aria-hidden={!isStatusPanelOpen}
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-row items-center justify-center rounded-t-3xl bg-highlight px-4 py-3 w-fit">
        <button
          type="button"
          onClick={() => setIsStatusPanelOpen((open) => !open)}
          className={cn(
            "flex z-10 w-10 shrink-0 flex-col items-center justify-center transition-colors",
            isStatusPanelOpen ? "text-primary" : "text-white",
          )}
          aria-pressed={isStatusPanelOpen}
        >
          <Activity size={20} className="shrink-0" aria-hidden />
        </button>
        <span
          className={cn(
            "absolute left-0 pointer-events-none right-0 bottom-0 z-1 size-full rounded-t-3xl bg-primary",
            "ease-out transition-transform duration-300",
            isStatusPanelOpen ? "translate-y-full" : "translate-y-0",
          )}
          aria-hidden={!isStatusPanelOpen}
        />
      </div>
    </div>
  );
}
