import { lazy } from "react";
import type { RouteObject } from "react-router";
import { AppRoutes } from "../constants/routes.constant";

const Home = lazy(() => import("../screens/Home.screen"));

const commonRoutes: RouteObject[] = [
  {
    path: AppRoutes.HOME,
    Component: Home,
  },
];

export default commonRoutes;
