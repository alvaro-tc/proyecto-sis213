import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar, MdInventory } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { useDispatch } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlice";
import { Button, Input } from "../ui";

const NAV_ITEMS = [
  { to: "/home", label: "Inicio", icon: FaHome },
  { to: "/orders", label: "Pedidos", icon: MdOutlineReorder },
  { to: "/tables", label: "Mesas", icon: MdTableBar },
  { to: "/insumos", label: "Insumos", icon: MdInventory },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const isActive = (path) => location.pathname === path;
  const blockCreate = isActive("/tables") || isActive("/menu");

  const handleCreateOrder = (type) => {
    if (!name?.trim()) return;
    dispatch(setCustomer({ name, phone, guests: type === "takeaway" ? 0 : guestCount, orderType: type }));
    setIsModalOpen(false);
    if (type === "takeaway") {
      navigate("/menu");
    } else {
      navigate("/tables");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-theme-card p-2 sm:p-3 h-16 sm:h-20 flex justify-around items-center z-50 border-t border-theme-border">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <button
          key={to}
          onClick={() => navigate(to)}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 font-bold transition-all rounded-lg sm:rounded-[20px] px-2 sm:px-4 py-2 ${
            isActive(to) ? "text-theme-text bg-theme-elevated shadow-md" : "text-theme-muted hover:text-theme-text"
          }`}
        >
          <Icon size={20} className="sm:inline sm:mr-2" />
          <span className="text-xs sm:text-sm hidden sm:inline">{label}</span>
        </button>
      ))}

      <button
        disabled={blockCreate}
        onClick={() => setIsModalOpen(true)}
        title="Crear pedido"
        aria-label="Crear pedido"
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-theme-accent text-theme-text rounded-full p-3 sm:p-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform"
      >
        <BiSolidDish size={32} className="sm:w-10 sm:h-10" />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Pedido"
      >
        <div className="space-y-3">
          <Input
            label="Nombre del Cliente"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ingrese el nombre del cliente"
            required
          />
          <Input
            label="Teléfono del Cliente"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="71234567"
          />
          <div>
            <label className="block mb-2 text-sm font-medium text-theme-muted">
              Invitados
            </label>
            <div className="flex items-center justify-between bg-theme-base px-4 py-3 rounded-lg border border-theme-border">
              <button
                type="button"
                onClick={() => setGuestCount((c) => Math.max(0, c - 1))}
                className="text-theme-accent text-2xl px-2"
                aria-label="Disminuir"
              >
                &minus;
              </button>
              <span className="text-theme-text">{guestCount} Persona(s)</span>
              <button
                type="button"
                onClick={() => setGuestCount((c) => Math.min(6, c + 1))}
                className="text-theme-accent text-2xl px-2"
                aria-label="Aumentar"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => handleCreateOrder("takeaway")}
              disabled={!name?.trim()}
              fullWidth
              size="lg"
              className="bg-theme-surface text-theme-text border border-theme-border hover:bg-theme-elevated"
            >
              Para Llevar
            </Button>
            <Button
              onClick={() => handleCreateOrder("dine-in")}
              disabled={!name?.trim()}
              fullWidth
              size="lg"
            >
              En Mesa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BottomNav;
