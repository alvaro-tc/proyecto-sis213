import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  MdTableBar,
  MdSpaceDashboard,
  MdRestaurantMenu,
  MdCategory,
  MdGroups,
  MdInsights,
} from "react-icons/md";

import BottomNav from "../components/shared/BottomNav";
import HomeBentoOverview from "../components/dashboard-bento/HomeBentoOverview";
import WaiterOverview from "../components/home/WaiterOverview";

import Metrics from "../components/dashboard/Metrics";
import TableList from "../components/dashboard/TableList";
import CategoryList from "../components/dashboard/CategoryList";
import DishList from "../components/dashboard/DishList";
import EmployeeList from "../components/dashboard/EmployeeList";
import Modal from "../components/dashboard/Modal";
import CategoryModal from "../components/dashboard/CategoryModal";
import DishModal from "../components/dashboard/DishModal";
import EmployeeModal from "../components/dashboard/EmployeeModal";

import { EmptyState } from "../components/ui";

const ADMIN_TABS = [
  { id: "inicio",     label: "Inicio",     icon: MdSpaceDashboard },
  { id: "metricas",   label: "Métricas",   icon: MdInsights },
  { id: "mesas",      label: "Mesas",      icon: MdTableBar },
  { id: "categorias", label: "Categorías", icon: MdCategory },
  { id: "productos",  label: "Productos",  icon: MdRestaurantMenu },
  { id: "empleados",  label: "Empleados",  icon: MdGroups },
];

const Home = () => {
  const location = useLocation();
  const { role } = useSelector((s) => s.user);
  const isAdmin = role?.toLowerCase() === "admin";

  const tabs = useMemo(
    () => (isAdmin ? ADMIN_TABS : ADMIN_TABS.slice(0, 1)),
    [isAdmin]
  );

  const [activeTab, setActiveTab] = useState(() => {
    const requested = new URLSearchParams(location.search).get("tab");
    return tabs.some((t) => t.id === requested) ? requested : "inicio";
  });

  const [tableModal, setTableModal] = useState(null);
  const [categoryModal, setCategoryModal] = useState(null);
  const [dishModal, setDishModal] = useState(null);
  const [employeeModal, setEmployeeModal] = useState(false);

  useEffect(() => {
    const label = tabs.find((t) => t.id === activeTab)?.label || "Inicio";
    document.title = `POS | ${label}`;
  }, [activeTab, tabs]);

  return (
    <section className="bg-theme-base h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      {tabs.length > 1 && (
        <div className="px-4 md:px-8 pt-4 border-b border-theme-border bg-theme-base">
          <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide pb-3">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === id
                    ? "bg-theme-brand text-theme-brand-fg shadow-sm"
                    : "bg-theme-surface text-theme-muted hover:text-theme-text hover:bg-theme-elevated"
                }`}
              >
                <Icon className="text-base" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 md:pb-8">
        {activeTab === "inicio" && (
          <React.Suspense fallback={<div className="p-6 text-theme-muted">Cargando…</div>}>
            {isAdmin ? <HomeBentoOverview /> : <WaiterOverview />}
          </React.Suspense>
        )}

        {activeTab === "metricas" && isAdmin && <Metrics />}
        {activeTab === "mesas" && isAdmin && (
          <TableList
            onEdit={(t) => setTableModal(t)}
            onAdd={() => setTableModal({})}
          />
        )}
        {activeTab === "categorias" && isAdmin && (
          <CategoryList
            onEdit={(c) => setCategoryModal(c)}
            onAdd={() => setCategoryModal({})}
          />
        )}
        {activeTab === "productos" && isAdmin && (
          <DishList
            onEdit={(d) => setDishModal(d)}
            onAdd={() => setDishModal({})}
          />
        )}
        {activeTab === "empleados" && isAdmin && (
          <EmployeeList onAdd={() => setEmployeeModal(true)} />
        )}

        {!tabs.some((t) => t.id === activeTab) && (
          <EmptyState title="Sección no disponible" description="Selecciona una pestaña." />
        )}
      </div>

      {tableModal && (
        <Modal
          setIsTableModalOpen={() => setTableModal(null)}
          dataToEdit={tableModal._id ? tableModal : null}
        />
      )}
      {categoryModal && (
        <CategoryModal
          setIsCategoryModalOpen={() => setCategoryModal(null)}
          dataToEdit={categoryModal._id ? categoryModal : null}
        />
      )}
      {dishModal && (
        <DishModal
          setIsDishModalOpen={() => setDishModal(null)}
          dataToEdit={dishModal._id ? dishModal : null}
        />
      )}
      {employeeModal && (
        <EmployeeModal setIsEmployeeModalOpen={setEmployeeModal} />
      )}

      <BottomNav />
    </section>
  );
};

export default Home;
