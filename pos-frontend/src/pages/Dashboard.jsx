import React, { useState, useEffect } from "react";
import { MdTableBar, MdCategory } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Modal from "../components/dashboard/Modal";
import CategoryModal from "../components/dashboard/CategoryModal";
import DishModal from "../components/dashboard/DishModal";
import TableList from "../components/dashboard/TableList";
import CategoryList from "../components/dashboard/CategoryList";
import DishList from "../components/dashboard/DishList";
import EmployeeList from "../components/dashboard/EmployeeList";
import EmployeeModal from "../components/dashboard/EmployeeModal";

const tabs = ["Métricas", "Pedidos", "Mesas", "Categorías", "Platos", "Empleados"];

const Dashboard = () => {

  useEffect(() => {
    document.title = "POS | Panel de Administrador"
  }, [])

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Métricas");

  // State to hold data for editing
  const [dataToEdit, setDataToEdit] = useState(null);

  const handleOpenModal = (action, data = null) => {
    setDataToEdit(data);
    if (action === "table") setIsTableModalOpen(true);
    if (action === "category") setIsCategoryModalOpen(true);
    if (action === "dishes") setIsDishModalOpen(true);
    if (action === "employee") setIsEmployeeModalOpen(true);
  };

  return (
    <div className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="container mx-auto flex items-center py-8 px-6 md:px-4">
        <div className="flex flex-wrap items-center gap-3">
          {tabs.map((tab) => {
            return (
              <button
                key={tab}
                className={`
                px-8 py-3 rounded-lg text-[#f5f5f5] font-semibold text-md flex items-center gap-2 ${
                  activeTab === tab
                    ? "bg-[#262626]"
                    : "bg-[#1a1a1a] hover:bg-[#262626]"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "Métricas" && <Metrics />}
      {activeTab === "Pedidos" && <RecentOrders />}
      {activeTab === "Mesas" && <TableList onEdit={(t) => handleOpenModal('table', t)} onAdd={() => handleOpenModal('table')} />}
      {activeTab === "Categorías" && <CategoryList onEdit={(c) => handleOpenModal('category', c)} onAdd={() => handleOpenModal('category')} />}
      {activeTab === "Platos" && <DishList onEdit={(d) => handleOpenModal('dishes', d)} onAdd={() => handleOpenModal('dishes')} />}
      {activeTab === "Empleados" && <EmployeeList onAdd={() => handleOpenModal('employee')} />}

      {isTableModalOpen && <Modal setIsTableModalOpen={setIsTableModalOpen} dataToEdit={dataToEdit} />}
      {isCategoryModalOpen && <CategoryModal setIsCategoryModalOpen={setIsCategoryModalOpen} dataToEdit={dataToEdit} />}
      {isDishModalOpen && <DishModal setIsDishModalOpen={setIsDishModalOpen} dataToEdit={dataToEdit} />}
      {isEmployeeModalOpen && <EmployeeModal setIsEmployeeModalOpen={setIsEmployeeModalOpen} />}
    </div>
  );
};

export default Dashboard;
