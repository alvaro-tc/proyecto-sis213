import axios from "axios";

const defaultHeader = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const axiosWrapper = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: { ...defaultHeader },
});

// Rutas que NO deben disparar redirect a /auth en 401 (ya están en pantallas públicas).
const PUBLIC_PATHS = ["/", "/auth"];
// Endpoints donde un 401 es esperado (ej. checar sesión al cargar) y no debe redirigir.
const SILENT_401_URLS = ["/api/user", "/api/user/login"];

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

axiosWrapper.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    if (status === 401) {
      const isSilentUrl = SILENT_401_URLS.some((u) => url.endsWith(u));
      const isPublicPath = PUBLIC_PATHS.includes(window.location.pathname);
      if (!isSilentUrl && !isPublicPath && typeof onUnauthorized === "function") {
        onUnauthorized();
      }
    }

    return Promise.reject(error);
  }
);
