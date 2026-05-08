import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDishes, deleteDish, getCategories } from "../../https";
import { enqueueSnackbar } from "notistack";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { MdInventory2, MdRestaurantMenu, MdWarningAmber } from "react-icons/md";
import { ConfirmDialog } from "../ui";

const DishList = ({ onEdit, onAdd }) => {
  const queryClient = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ["dishes"], queryFn: getDishes });
  const { data: catRes } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const dishes = res?.data?.data || [];
  const categories = catRes?.data?.data || [];

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [target, setTarget] = useState(null);

  const delMutation = useMutation({
    mutationFn: (id) => deleteDish(id),
    onSuccess: () => {
      enqueueSnackbar("Producto eliminado", { variant: "success" });
      queryClient.invalidateQueries(["dishes"]);
      setTarget(null);
    },
    onError: () => enqueueSnackbar("Error al eliminar", { variant: "error" }),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dishes.filter((d) => {
      const matchesSearch =
        !q ||
        d.name?.toLowerCase().includes(q) ||
        d.type?.toLowerCase().includes(q) ||
        d.category?.name?.toLowerCase().includes(q);
      const matchesCat = catFilter === "all" || d.category?._id === catFilter;
      return matchesSearch && matchesCat;
    });
  }, [dishes, search, catFilter]);

  if (isLoading)
    return <div className="text-theme-muted p-6 text-center">Cargando productos...</div>;

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-theme-text text-xl font-semibold flex items-center gap-2">
            <MdRestaurantMenu className="text-theme-accent" size={24} />
            Productos
          </h2>
          <p className="text-theme-muted text-sm mt-0.5">
            {dishes.length} producto{dishes.length === 1 ? "" : "s"} registrado
            {dishes.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="bg-theme-brand hover:opacity-90 transition px-4 py-2.5 rounded-lg text-theme-brand-fg font-semibold text-sm flex items-center gap-2 shadow-sm"
        >
          <FaPlus size={12} /> Nuevo producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted"
            size={14}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, tipo o categoría..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-theme-surface border border-theme-border text-theme-text text-sm placeholder:text-theme-muted focus:outline-none focus:border-theme-accent transition"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-theme-surface border border-theme-border text-theme-text text-sm focus:outline-none focus:border-theme-accent transition min-w-[180px]"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid de tarjetas */}
      {filtered.length === 0 ? (
        <div className="bg-theme-surface border border-dashed border-theme-border rounded-xl p-10 text-center">
          <MdRestaurantMenu className="mx-auto text-theme-muted mb-2" size={40} />
          <p className="text-theme-text font-medium">
            {dishes.length === 0
              ? "Aún no hay productos registrados"
              : "Ningún producto coincide con la búsqueda"}
          </p>
          <p className="text-theme-muted text-sm mt-1">
            {dishes.length === 0
              ? "Crea tu primer producto para comenzar."
              : "Prueba con otros términos o cambia el filtro."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d) => {
            const sinInsumos = !d.insumosRequeridos || d.insumosRequeridos.length === 0;
            return (
              <div
                key={d._id}
                className="group bg-theme-card border border-theme-border rounded-xl overflow-hidden hover:border-theme-accent transition flex flex-col"
              >
                {/* Cabecera de la tarjeta */}
                <div className="p-4 border-b border-theme-border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-theme-text font-semibold truncate" title={d.name}>
                        {d.name}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        {d.category ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-theme-elevated text-theme-text">
                            <span>{d.category.icon}</span>
                            <span>{d.category.name}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                            <MdWarningAmber size={12} /> Sin categoría
                          </span>
                        )}
                        {d.type && (
                          <span className="text-xs text-theme-muted">{d.type}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-theme-accent font-bold text-lg leading-none">
                        Bs {d.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insumos */}
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-theme-muted mb-2">
                    <MdInventory2 size={14} />
                    <span>Insumos por unidad</span>
                  </div>
                  {sinInsumos ? (
                    <p className="text-xs text-theme-muted italic">
                      Sin insumos asignados
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {d.insumosRequeridos.slice(0, 4).map((ir, i) => (
                        <li
                          key={i}
                          className="text-xs text-theme-text flex items-center justify-between gap-2"
                        >
                          <span className="truncate">{ir.insumo?.nombre || "?"}</span>
                          <span className="text-theme-muted shrink-0">
                            {ir.cantidad} {ir.insumo?.unidad || ""}
                          </span>
                        </li>
                      ))}
                      {d.insumosRequeridos.length > 4 && (
                        <li className="text-xs text-theme-muted">
                          +{d.insumosRequeridos.length - 4} más
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Acciones */}
                <div className="px-4 py-3 bg-theme-surface border-t border-theme-border flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(d)}
                    className="flex items-center gap-1.5 text-xs font-medium text-theme-text bg-theme-elevated hover:bg-theme-card px-3 py-1.5 rounded-md transition"
                  >
                    <FaEdit size={12} /> Editar
                  </button>
                  <button
                    onClick={() => setTarget(d)}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition"
                  >
                    <FaTrash size={12} /> Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={() => target && delMutation.mutate(target._id)}
        isLoading={delMutation.isPending}
        title={`¿Eliminar "${target?.name || "este producto"}"?`}
        description="Se removerá del menú. Los pedidos pasados no se verán afectados."
        confirmLabel="Eliminar producto"
        variant="danger"
      />
    </div>
  );
};

export default DishList;
