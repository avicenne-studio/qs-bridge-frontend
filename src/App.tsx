import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import ActivityPage from "@/domains/activity/react/activity.page";
import HistoryPage from "@/domains/history/react/history.page";
import { routes } from "@/constants/routes";
import MainLayout from "@/components/layout/main-layout";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to={routes.activity.path} replace />} />
        <Route path={routes.bridge.path} element={<Home />} />
        <Route path={routes.history.path} element={<HistoryPage />} />
        <Route path={routes.activity.path} element={<ActivityPage />} />
      </Route>
    </Routes>
  );
}
