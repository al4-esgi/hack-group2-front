import { Navigate, Outlet } from "react-router";
import { AppRoutes } from "../constants/routes.constant";

function isAuthenticated(): boolean {
  return !!localStorage.getItem("token");
}

export default function ProtectedLayout() {
  if (!isAuthenticated()) {
    return <Navigate to={AppRoutes.LOGIN} replace />;
  }

  return <Outlet />;
}
