import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import appRouter from "./routes/router";
import { StaleTimes } from "./constants/query.constant";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: StaleTimes.FIVE_MINUTES,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <RouterProvider router={appRouter} />
      </Suspense>
    </QueryClientProvider>
  </StrictMode>,
);
