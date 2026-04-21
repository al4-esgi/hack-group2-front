import { Navigate, Outlet } from "react-router";
import { AppRoutes } from "../constants/routes.constant";
import { useAuthStore } from "../stores/auth.store";

export default function ProtectedLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={AppRoutes.LOGIN} replace />;
  }

  return <Outlet />
}
