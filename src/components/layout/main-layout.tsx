import { Outlet, useLocation } from "react-router-dom";
import { routes } from "@/constants/routes";
import Sidebar from "./sidebar/sidebar";
import TabBar from "./tab-bar/tab-bar";
import TopBar from "./top-bar/top-bar";
import WalletArea from "../wallet-area/wallet-area";
import cn from "@/utils/classnames";

export default function MainLayout() {
  const { pathname } = useLocation();

  const routeEntries = Object.values(routes);
  const pageName = routeEntries.find((r) => r.path === pathname)?.name ?? "n/a";

  return (
    <div
      className={cn(
        "flex w-screen h-dvh overflow-hidden",
        "bg-white xl:bg-primary",
        "pt-[94px] xl:pt-4",
      )}
    >
      <TopBar />
      <Sidebar />
      <TabBar />

      <main
        className={cn(
          "size-full bg-white overflow-hidden pl-7",
          "pb-20 xl:pb-0",
          "rounded-tl-2xl xl:rounded-tl-4xl",
          "mt-8",
        )}
      >
        <div className={cn("flex w-full bg-primary rounded-tl-4xl", "h-[50px] xl:h-[90px]")}>
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
          <div className="hidden xl:block">
            <WalletArea />
          </div>
        </div>

        <div className="size-full overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
