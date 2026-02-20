import { Outlet, useLocation } from "react-router-dom";
import { routes } from "@/constants/routes";
import Sidebar from "./sidebar/sidebar";
import TabBar from "./tab-bar/tab-bar";
import WalletArea from "../wallet-area/wallet-area";

export default function MainLayout() {
  const { pathname } = useLocation();

  const routeEntries = Object.values(routes);
  const pageName = routeEntries.find((r) => r.path === pathname)?.name ?? "n/a";

  return (
    <div className="flex w-screen pt-4 h-dvh overflow-hidden bg-primary">
      <Sidebar />
      <TabBar />
      <main className="size-full bg-white rounded-tl-4xl overflow-hidden pl-7 pb-20 xl:pb-0">
        <div className="flex w-full h-[90px] bg-primary rounded-tl-4xl">
          <span className="text-primary bg-white text-3xl font-semibold flex items-center pr-7 w-full rounded-tr-4xl">
            {pageName}
          </span>
          <WalletArea />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
