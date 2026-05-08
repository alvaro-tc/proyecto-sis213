import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { setUnauthorizedHandler } from "./https/axiosWrapper.js";
import { removeUser } from "./redux/slices/userSlice.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: (failureCount, error) => {
        // No reintentar en 4xx (auth/validación)
        const status = error?.response?.status;
        if (status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

setUnauthorizedHandler(() => {
  store.dispatch(removeUser());
  queryClient.clear();
  enqueueSnackbar("Tu sesión expiró. Inicia sesión nuevamente.", {
    variant: "warning",
  });
  window.location.href = "/auth";
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <SnackbarProvider autoHideDuration={3000}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </SnackbarProvider>
      </Provider>
    </ThemeProvider>
  </StrictMode>
);
