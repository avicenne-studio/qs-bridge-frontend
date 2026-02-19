import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/sidebar";

export default function MainLayout() {
  return (
    <div className="flex w-screen pt-4 h-dvh overflow-hidden">
      <Sidebar />
      <main className="size-full bg-primary">
        <Outlet />
      </main>
    </div>
  );
}
