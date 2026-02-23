import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import { routes } from "@/constants/routes";
import MainLayout from "@/components/layout/main-layout";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to={routes.activity.path} replace />} />
        <Route path={routes.bridge.path} element={<Home />} />
        <Route path={routes.history.path} element={<Home />} />
        <Route path={routes.activity.path} element={<Home />} />
      </Route>
    </Routes>
  );
}
