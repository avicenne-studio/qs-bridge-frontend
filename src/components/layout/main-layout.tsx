import { Outlet, useLocation } from "react-router-dom";
import { routes } from "@/constants/routes";
import Sidebar from "./sidebar/sidebar";
import TabBar from "./tab-bar/tab-bar";
import TopBar from "./top-bar/top-bar";
import WalletArea from "../wallet-area/wallet-area";
import { BridgeHealthProvider } from "@/providers/BridgeHealthProvider";
import cn from "@/utils/classnames";

export default function MainLayout() {
  const { pathname } = useLocation();

  const routeEntries = Object.values(routes);
  const pageName = routeEntries.find((r) => r.path === pathname)?.name ?? "n/a";

  return (
    <BridgeHealthProvider>
      <div
        className={cn(
          "flex w-screen h-dvh relative bg-primary",
          "xl:pt-4",
          "overflow-auto xl:overflow-hidden",
          "flex-col xl:flex-row",
        )}
      >
        <TopBar />
        <Sidebar />
        <TabBar />

        <main
          className={cn(
            "flex flex-col size-full bg-white overflow-hidden",
            "pb-20 xl:pb-0",
            "rounded-tl-2xl xl:rounded-tl-4xl",
            "mt-8",
            "pl-4 xl:pl-7",
          )}
        >
          <div
            className={cn("flex shrink-0 w-full bg-primary rounded-tl-4xl", "h-[50px] xl:h-[90px]")}
          >
            <span
              className={cn(
                "text-primary bg-white font-semibold flex items-center pr-7 uppercase",
                "w-fit xl:w-full",
                "text-base xl:text-3xl",
                "rounded-tr-2xl xl:rounded-tr-4xl",
              )}
            >
              {pageName}
            </span>
            <WalletArea />
          </div>

          <div className={cn("flex-1 min-h-0 overflow-auto bg-white", "pr-4 xl:pr-7")}>
            <Outlet />
          </div>
        </main>
      </div>
    </BridgeHealthProvider>
  );
}
