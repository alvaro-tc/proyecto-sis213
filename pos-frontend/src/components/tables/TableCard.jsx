import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaEdit, FaTrash, FaUserCircle, FaUsers } from "react-icons/fa";
import { MdDoorFront, MdLockOpen, MdOpenInNew } from "react-icons/md";

import { updateTable as updateTableHttp, deleteTable as deleteTableHttp } from "../../https";
import { updateTable } from "../../redux/slices/customerSlice";
import { getAvatarName } from "../../utils";
import { ConfirmDialog } from "../ui";

const STATUS_STYLES = {
  Available: {
    label: "Libre",
    pill: "bg-green-500/15 text-green-500",
    ring: "ring-green-500/40",
  },
  Booked: {
    label: "En Uso",
    pill: "bg-theme-brand/15 text-theme-brand",
    ring: "ring-theme-brand/40",
  },
};

const TableCard = ({ table, role, onEdit }) => {
  const { _id: id, tableNo: name, status, seats, bgColor, currentOrder } = table;
  const initials = currentOrder?.customerDetails?.name;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAdmin = role === "admin";
  const isWaiter = role === "waiter";
  const isBarista = role === "barista";
  const isBooked = status === "Booked";
  const color = bgColor || "var(--color-accent)";
  const styles = STATUS_STYLES[status] || STATUS_STYLES.Available;

  const [confirmRelease, setConfirmRelease] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const releaseMutation = useMutation({
    mutationFn: () => updateTableHttp({ tableId: id, status: "Available", orderId: null }),
    onSuccess: () => {
      enqueueSnackbar("Mesa liberada", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
      setConfirmRelease(false);
    },
    onError: () => enqueueSnackbar("No se pudo liberar la mesa", { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTableHttp(id),
    onSuccess: () => {
      enqueueSnackbar("Mesa eliminada", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
      setConfirmDelete(false);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "No se pudo eliminar";
      enqueueSnackbar(msg, { variant: "error" });
    },
  });

  const handleOpenMenu = () => {
    if (isBooked || isBarista) return;
    dispatch(updateTable({ table: { tableId: id, tableNo: name } }));
    navigate(`/menu`);
  };

  const handleRelease = (e) => {
    e.stopPropagation();
    setConfirmRelease(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (isBooked) {
      enqueueSnackbar("Libera la mesa antes de eliminarla", { variant: "warning" });
      return;
    }
    setConfirmDelete(true);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(table);
  };

  return (
    <>
    <div
      className={`group relative w-full bg-theme-card rounded-2xl overflow-hidden border border-theme-border shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-theme-brand/60 ring-1 ring-transparent ${styles.ring}`}
    >
      <div className="h-2 w-full" style={{ backgroundColor: color }} />

      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleEdit}
            title="Editar mesa"
            className="bg-theme-elevated text-theme-text hover:bg-theme-brand hover:text-theme-brand-fg rounded-md p-1.5"
          >
            <FaEdit size={12} />
          </button>
          <button
            onClick={handleDelete}
            title="Eliminar mesa"
            disabled={deleteMutation.isPending}
            className="bg-theme-elevated text-red-500 hover:bg-red-500 hover:text-white rounded-md p-1.5 disabled:opacity-50"
          >
            <FaTrash size={12} />
          </button>
        </div>
      )}

      <div className="p-4 flex flex-col items-center text-center">
        <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${styles.pill}`}>
          {styles.label}
        </span>

        <div className="mt-5 mb-2">
          {isBooked ? (
            <div className="w-16 h-16 rounded-full bg-theme-brand text-theme-brand-fg flex items-center justify-center shadow-inner border-4 border-theme-brand/30">
              <span className="text-xl font-black">{getAvatarName(initials) || "?"}</span>
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-inner"
              style={{ backgroundColor: color, color: "#111" }}
            >
              <span className="text-2xl font-black">{name}</span>
            </div>
          )}
        </div>

        <h2 className="text-theme-text text-lg font-bold mt-1">Mesa {name}</h2>
        <p className="text-theme-muted text-xs font-medium mt-1 flex items-center justify-center gap-1.5">
          <FaUsers className="text-theme-accent" /> {seats} asientos
        </p>

        {isBooked && initials && (
          <p className="text-theme-muted text-[11px] font-semibold mt-2 flex items-center gap-1 max-w-full px-2">
            <FaUserCircle className="text-theme-accent shrink-0" />
            <span className="truncate">{initials}</span>
          </p>
        )}

        <div className="mt-3 w-full flex flex-col gap-2">
          {!isBooked && !isBarista && (
            <button
              onClick={handleOpenMenu}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-theme-brand text-theme-brand-fg rounded-lg py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <MdDoorFront className="text-base" /> Abrir mesa
            </button>
          )}

          {isBooked && !isBarista && (
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/orders");
                }}
                className="inline-flex items-center justify-center gap-1 bg-theme-elevated text-theme-text rounded-lg py-2 text-xs font-semibold hover:bg-theme-surface transition-colors"
              >
                <MdOpenInNew /> Pedido
              </button>
              <button
                onClick={handleRelease}
                disabled={releaseMutation.isPending}
                className="inline-flex items-center justify-center gap-1 bg-green-500/15 text-green-500 rounded-lg py-2 text-xs font-semibold hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50"
              >
                <MdLockOpen /> Liberar
              </button>
            </div>
          )}

          {isBarista && (
            <span className="text-[11px] text-theme-muted italic">Solo consulta</span>
          )}
        </div>
      </div>
    </div>

    <ConfirmDialog
      isOpen={confirmRelease}
      onClose={() => setConfirmRelease(false)}
      onConfirm={() => releaseMutation.mutate()}
      isLoading={releaseMutation.isPending}
      title={`¿Liberar la Mesa ${name}?`}
      description="La mesa volverá a estar disponible y se desvinculará del pedido actual."
      confirmLabel="Liberar mesa"
      variant="success"
    />

    <ConfirmDialog
      isOpen={confirmDelete}
      onClose={() => setConfirmDelete(false)}
      onConfirm={() => deleteMutation.mutate()}
      isLoading={deleteMutation.isPending}
      title={`¿Eliminar la Mesa ${name}?`}
      description="Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      variant="danger"
    />
    </>
  );
};

export default TableCard;
