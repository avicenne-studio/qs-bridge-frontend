import { Routes, Route, Navigate } from "react-router-dom";
import BridgePage from "@/domains/bridge/react/bridge.page";
import ActivityPage from "@/domains/activity/react/activity.page";
import HistoryPage from "@/domains/history/react/history.page";
import { routes } from "@/constants/routes";
import MainLayout from "@/components/layout/main-layout";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to={routes.activity.path} replace />} />
        <Route path={routes.bridge.path} element={<BridgePage />} />
        <Route path={routes.history.path} element={<HistoryPage />} />
        <Route path={routes.activity.path} element={<ActivityPage />} />
      </Route>
    </Routes>
  );
}
