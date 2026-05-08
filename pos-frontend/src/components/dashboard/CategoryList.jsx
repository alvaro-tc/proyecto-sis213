import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, deleteCategory } from "../../https";
import { enqueueSnackbar } from "notistack";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { ConfirmDialog } from "../ui";

const CategoryList = ({ onEdit, onAdd }) => {
  const queryClient = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const categories = res?.data?.data || [];

  const [search, setSearch] = useState("");
  const [target, setTarget] = useState(null);

  const delMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      enqueueSnackbar("Categoría eliminada", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
      setTarget(null);
    },
    onError: () => enqueueSnackbar("Error al eliminar", { variant: "error" }),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name?.toLowerCase().includes(q));
  }, [categories, search]);

  if (isLoading)
    return <div className="text-theme-muted p-6 text-center">Cargando categorías...</div>;

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-theme-text text-xl font-semibold flex items-center gap-2">
            <MdCategory className="text-theme-accent" size={24} />
            Categorías
          </h2>
          <p className="text-theme-muted text-sm mt-0.5">
            {categories.length} categoría{categories.length === 1 ? "" : "s"} registrada
            {categories.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="bg-theme-brand hover:opacity-90 transition px-4 py-2.5 rounded-lg text-theme-brand-fg font-semibold text-sm flex items-center gap-2 shadow-sm"
        >
          <FaPlus size={12} /> Nueva categoría
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative mb-5">
        <FaSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted"
          size={14}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoría..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-theme-surface border border-theme-border text-theme-text text-sm placeholder:text-theme-muted focus:outline-none focus:border-theme-accent transition"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-theme-surface border border-dashed border-theme-border rounded-xl p-10 text-center">
          <MdCategory className="mx-auto text-theme-muted mb-2" size={40} />
          <p className="text-theme-text font-medium">
            {categories.length === 0
              ? "Aún no hay categorías registradas"
              : "Ninguna categoría coincide con la búsqueda"}
          </p>
          <p className="text-theme-muted text-sm mt-1">
            {categories.length === 0
              ? "Crea tu primera categoría para organizar tus productos."
              : "Prueba con otro término."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="group bg-theme-card border border-theme-border rounded-xl overflow-hidden hover:border-theme-accent transition flex flex-col"
            >
              {/* Cabecera con color de la categoría */}
              <div
                className="h-20 flex items-center justify-center text-4xl"
                style={{ backgroundColor: c.bgColor }}
              >
                <span className="drop-shadow-sm">{c.icon}</span>
              </div>

              {/* Cuerpo */}
              <div className="p-3 flex-1 flex flex-col">
                <h3
                  className="text-theme-text font-semibold text-sm truncate"
                  title={c.name}
                >
                  {c.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="w-3 h-3 rounded-full border border-theme-border shrink-0"
                    style={{ backgroundColor: c.bgColor }}
                  />
                  <code className="text-[10px] text-theme-muted uppercase tracking-wide">
                    {c.bgColor}
                  </code>
                </div>
              </div>

              {/* Acciones */}
              <div className="px-3 py-2 bg-theme-surface border-t border-theme-border flex items-center justify-end gap-1">
                <button
                  onClick={() => onEdit(c)}
                  className="flex items-center gap-1 text-xs font-medium text-theme-text bg-theme-elevated hover:bg-theme-card px-2.5 py-1.5 rounded-md transition"
                  title="Editar"
                >
                  <FaEdit size={11} />
                </button>
                <button
                  onClick={() => setTarget(c)}
                  className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 py-1.5 rounded-md transition"
                  title="Eliminar"
                >
                  <FaTrash size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={() => target && delMutation.mutate(target._id)}
        isLoading={delMutation.isPending}
        title={`¿Eliminar la categoría "${target?.name || ""}"?`}
        description="Los productos asignados quedarán sin categoría."
        confirmLabel="Eliminar categoría"
        variant="danger"
      />
    </div>
  );
};

export default CategoryList;
