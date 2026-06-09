import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar, MdInventory } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { useDispatch } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlice";
import { Button, Input } from "../ui";

const LEFT_ITEMS = [
  { to: "/home",   label: "Inicio",   icon: FaHome },
  { to: "/orders", label: "Pedidos",  icon: MdOutlineReorder },
];
const RIGHT_ITEMS = [
  { to: "/tables",  label: "Mesas",    icon: MdTableBar },
  { to: "/insumos", label: "Insumos",  icon: MdInventory },
];

const NavBtn = ({ to, label, Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-colors min-w-0 ${
      active ? "text-theme-text" : "text-theme-muted hover:text-theme-text"
    }`}
  >
    <div className={`p-1.5 rounded-xl transition-colors ${active ? "bg-theme-elevated" : ""}`}>
      <Icon size={20} />
    </div>
    <span className="text-[10px] leading-none font-medium truncate">{label}</span>
  </button>
);

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
    navigate(type === "takeaway" ? "/menu" : "/tables");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-theme-card h-16 flex items-center z-50 border-t border-theme-border">
      {/* Left items */}
      {LEFT_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavBtn
          key={to}
          to={to}
          label={label}
          Icon={Icon}
          active={isActive(to)}
          onClick={() => navigate(to)}
        />
      ))}

      {/* Center spacer for the FAB */}
      <div className="w-14 flex-shrink-0" aria-hidden="true" />

      {/* Right items */}
      {RIGHT_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavBtn
          key={to}
          to={to}
          label={label}
          Icon={Icon}
          active={isActive(to)}
          onClick={() => navigate(to)}
        />
      ))}

      {/* FAB — centered above the bar */}
      <button
        disabled={blockCreate}
        onClick={() => setIsModalOpen(true)}
        title="Crear pedido"
        aria-label="Crear pedido"
        className="absolute left-1/2 -translate-x-1/2 -translate-y-3 bottom-full mb-0 bg-theme-accent text-theme-text rounded-full p-3 shadow-lg shadow-black/20 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-transform"
      >
        <BiSolidDish size={28} />
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
