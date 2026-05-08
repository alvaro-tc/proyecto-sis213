import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { MdAdd, MdDelete, MdInventory2, MdInfoOutline } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDish, updateDish, getCategories, getInsumos } from "../../https";
import { enqueueSnackbar } from "notistack";

const DishModal = ({ setIsDishModalOpen, dataToEdit }) => {
  const queryClient = useQueryClient();
  const { data: catRes } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: insumoRes } = useQuery({ queryKey: ["insumos"], queryFn: getInsumos });
  const categories = catRes?.data?.data || [];
  const insumos = insumoRes?.data?.data || [];

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    type: "General",
  });
  const [insumosRequeridos, setInsumosRequeridos] = useState([]);

  useEffect(() => {
    if (dataToEdit && dataToEdit._id) {
      setFormData({
        name: dataToEdit.name,
        price: dataToEdit.price,
        category: dataToEdit.category?._id || dataToEdit.category,
        type: dataToEdit.type || "General",
      });
      setInsumosRequeridos(
        (dataToEdit.insumosRequeridos || []).map((ir) => ({
          insumo: ir.insumo?._id || ir.insumo,
          cantidad: ir.cantidad,
        }))
      );
    } else if (categories.length > 0) {
      setFormData((prev) => ({ ...prev, category: prev.category || categories[0]._id }));
    }
  }, [dataToEdit, categories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const agregarInsumo = () => {
    if (insumos.length === 0) return;
    setInsumosRequeridos((prev) => [...prev, { insumo: insumos[0]._id, cantidad: 1 }]);
  };

  const actualizarInsumo = (index, field, value) => {
    setInsumosRequeridos((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const eliminarInsumo = (index) => {
    setInsumosRequeridos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category) return enqueueSnackbar("Seleccione una categoría", { variant: "error" });
    const submission = {
      ...formData,
      price: Number(formData.price),
      insumosRequeridos: insumosRequeridos.map((ir) => ({
        insumo: ir.insumo,
        cantidad: Number(ir.cantidad),
      })),
    };
    if (dataToEdit && dataToEdit._id) {
      updateMutation.mutate({ dishId: dataToEdit._id, ...submission });
    } else {
      addMutation.mutate(submission);
    }
  };

  const addMutation = useMutation({
    mutationFn: (reqData) => addDish(reqData),
    onSuccess: (res) => {
      setIsDishModalOpen(false);
      enqueueSnackbar(res.data.message, { variant: "success" });
      queryClient.invalidateQueries(["dishes"]);
    },
    onError: (error) => enqueueSnackbar(error.response?.data?.message || "Error", { variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: (reqData) => updateDish(reqData),
    onSuccess: (res) => {
      setIsDishModalOpen(false);
      enqueueSnackbar(res.data.message, { variant: "success" });
      queryClient.invalidateQueries(["dishes"]);
    },
    onError: (error) => enqueueSnackbar(error.response?.data?.message || "Error", { variant: "error" }),
  });

  const isEditing = !!(dataToEdit && dataToEdit._id);
  const inputBase =
    "w-full rounded-lg p-3 bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-theme-accent transition";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-theme-card rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-theme-border"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-theme-border">
          <div>
            <h2 className="text-theme-text text-lg font-semibold">
              {isEditing ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p className="text-theme-muted text-xs mt-0.5">
              {isEditing
                ? "Actualiza los datos del producto"
                : "Completa la información para registrar un producto"}
            </p>
          </div>
          <button
            onClick={() => setIsDishModalOpen(false)}
            className="text-theme-muted hover:text-theme-text hover:bg-theme-elevated p-1.5 rounded-md transition"
          >
            <IoMdClose size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="px-6 py-5 space-y-5 overflow-y-auto">
            {/* Información básica */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-theme-muted mb-3">
                Información básica
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-theme-text mb-1.5 text-sm font-medium">
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej. Cappuccino mediano"
                    className={inputBase}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-theme-text mb-1.5 text-sm font-medium">
                      Precio (Bs)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={inputBase}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-theme-text mb-1.5 text-sm font-medium">
                      Tipo
                    </label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      placeholder="Ej. Bebida caliente"
                      className={inputBase}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-theme-text mb-1.5 text-sm font-medium">
                    Categoría
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={inputBase}
                    required
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Insumos */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-theme-muted flex items-center gap-1.5">
                    <MdInventory2 size={14} /> Insumos consumidos
                  </h3>
                  <p className="text-theme-muted text-xs mt-0.5">
                    Se descontarán del inventario por cada unidad vendida
                  </p>
                </div>
                <button
                  type="button"
                  onClick={agregarInsumo}
                  disabled={insumos.length === 0}
                  className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-theme-elevated text-theme-accent rounded-md hover:bg-theme-surface transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <MdAdd size={14} /> Agregar
                </button>
              </div>

              {insumos.length === 0 ? (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-theme-base border border-theme-border">
                  <MdInfoOutline className="text-theme-accent shrink-0 mt-0.5" size={16} />
                  <p className="text-theme-muted text-xs">
                    No hay insumos registrados. Agrégalos desde la sección Insumos para
                    descontar inventario automáticamente.
                  </p>
                </div>
              ) : insumosRequeridos.length === 0 ? (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-theme-base border border-dashed border-theme-border">
                  <MdInfoOutline className="text-theme-muted shrink-0 mt-0.5" size={16} />
                  <p className="text-theme-muted text-xs">
                    Sin insumos asignados. El inventario no se descontará al vender este
                    producto.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {insumosRequeridos.map((ir, idx) => {
                    const insumoInfo = insumos.find((i) => i._id === ir.insumo);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-theme-base border border-theme-border rounded-lg p-2"
                      >
                        <select
                          value={ir.insumo}
                          onChange={(e) => actualizarInsumo(idx, "insumo", e.target.value)}
                          className="flex-1 bg-transparent text-theme-text text-sm focus:outline-none"
                        >
                          {insumos.map((i) => (
                            <option key={i._id} value={i._id} className="bg-theme-base">
                              {i.nombre} ({i.unidad})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={ir.cantidad}
                          min="0"
                          step="0.01"
                          onChange={(e) => actualizarInsumo(idx, "cantidad", e.target.value)}
                          className="w-20 bg-theme-card border border-theme-border text-theme-text text-sm rounded px-2 py-1 focus:outline-none focus:border-theme-accent text-right"
                          placeholder="Cant."
                        />
                        <span className="text-theme-muted text-xs w-10 shrink-0">
                          {insumoInfo?.unidad || ""}
                        </span>
                        <button
                          type="button"
                          onClick={() => eliminarInsumo(idx)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded shrink-0 transition"
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-theme-border bg-theme-surface flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDishModalOpen(false)}
              className="px-4 py-2.5 rounded-lg text-theme-text hover:bg-theme-elevated text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-theme-brand text-theme-brand-fg text-sm font-semibold hover:opacity-90 transition shadow-sm"
            >
              {isEditing ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DishModal;
