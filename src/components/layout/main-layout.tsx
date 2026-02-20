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
      <main className="size-full bg-white rounded-tl-4xl overflow-hidden pl-7 pb-20 xl:pb-0">
        <div className="flex w-full h-[90px] bg-primary rounded-tl-4xl">
          <span className="text-primary bg-white text-3xl font-semibold flex items-center pr-7 w-full rounded-tr-4xl">
            {pageName}
          </span>
          <div className="hidden xl:block">
            <WalletArea />
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
