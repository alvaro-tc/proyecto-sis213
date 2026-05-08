import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  Home,
  Auth,
  Orders,
  Tables,
  Menu,
  Barista,
  Insumos,
  Landing,
  NotFound,
  Customer,
} from "./pages";
import Header from "./components/shared/Header";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";

const ROUTES_WITHOUT_HEADER = ["/", "/auth", "/cliente"];

function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();
  const { isAuth, role } = useSelector((state) => state.user);

  if (isLoading) return <FullScreenLoader />;

  const normalizedRole = role?.toLowerCase();
  const isBarista = isAuth && normalizedRole === "barista";
  const isCustomer = isAuth && normalizedRole === "customer";
  const hideHeader =
    ROUTES_WITHOUT_HEADER.includes(location.pathname) ||
    location.pathname.startsWith("/cliente") ||
    isBarista ||
    isCustomer;

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/auth"
          element={
            isAuth ? (
              <Navigate
                to={normalizedRole === "customer" ? "/cliente" : "/home"}
              />
            ) : (
              <Auth />
            )
          }
        />
        <Route
          path="/cliente"
          element={
            <ProtectedRoutes allowedRoles={["customer"]}>
              <Customer />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoutes allowedRoles={["admin", "waiter"]}>
              <Home />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoutes allowedRoles={["admin", "waiter"]}>
              <Orders />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoutes allowedRoles={["admin", "waiter"]}>
              <Tables />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoutes allowedRoles={["admin", "waiter"]}>
              <Menu />
            </ProtectedRoutes>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/home?tab=metricas" replace />} />
        <Route
          path="/barista"
          element={
            <ProtectedRoutes allowedRoles={["barista", "admin"]}>
              <Barista />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/insumos"
          element={
            <ProtectedRoutes allowedRoles={["admin", "waiter"]}>
              <Insumos />
            </ProtectedRoutes>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function ProtectedRoutes({ children, allowedRoles }) {
  const { isAuth, role } = useSelector((state) => state.user);
  const normalizedRole = role?.toLowerCase();

  if (!isAuth) {
    return <Navigate to="/auth" />;
  }

  if (allowedRoles && normalizedRole && !allowedRoles.includes(normalizedRole)) {
    if (normalizedRole === "barista") return <Navigate to="/barista" />;
    if (normalizedRole === "customer") return <Navigate to="/cliente" />;
    return <Navigate to="/home" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
