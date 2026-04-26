import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Home, Auth, Orders, Tables, Menu, Dashboard, Barista } from "./pages";
import Header from "./components/shared/Header";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader"

function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();
  const hideHeaderRoutes = ["/auth"];
  const { isAuth, role } = useSelector(state => state.user);

  if(isLoading) return <FullScreenLoader />

  // Don't show regular Header for barista since they have their own screen
  const isBarista = isAuth && role === "barista";

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && !isBarista && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoutes allowedRoles={["admin", "waiter"]}>
              <Home />
            </ProtectedRoutes>
          }
        />
        <Route path="/auth" element={isAuth ? <Navigate to="/" /> : <Auth />} />
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes allowedRoles={["admin", "waiter"]}>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/barista"
          element={
            <ProtectedRoutes allowedRoles={["barista", "admin"]}>
              <Barista />
            </ProtectedRoutes>
          }
        />
        <Route path="*" element={<div>No Encontrado</div>} />
      </Routes>
    </>
  );
}

function ProtectedRoutes({ children, allowedRoles }) {
  const { isAuth, role } = useSelector((state) => state.user);
  
  if (!isAuth) {
    return <Navigate to="/auth" />;
  }

  // RBAC control
  if (allowedRoles && role && !allowedRoles.includes(role)) {
     if (role === "barista") {
        return <Navigate to="/barista" />
     }
     if (role === "waiter" || role === "admin") {
        return <Navigate to="/" />
     }
  }

  if (!allowedRoles && role === "barista") {
     return <Navigate to="/barista" />
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
