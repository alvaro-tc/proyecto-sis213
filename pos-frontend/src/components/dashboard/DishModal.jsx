import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { MdAdd, MdDelete } from "react-icons/md";
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
    if (dataToEdit) {
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
      setFormData((prev) => ({ ...prev, category: categories[0]._id }));
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
    if (dataToEdit) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-theme-card p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-theme-text text-xl font-semibold">
            {dataToEdit ? "Editar Producto" : "Añadir Producto"}
          </h2>
          <button onClick={() => setIsDishModalOpen(false)} className="text-theme-text hover:text-red-500">
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-theme-muted mb-2 text-sm font-medium">Nombre</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-lg p-3 bg-theme-base text-theme-text focus:outline-none" required />
          </div>
          <div>
            <label className="block text-theme-muted mb-2 text-sm font-medium">Precio (Bs)</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full rounded-lg p-3 bg-theme-base text-theme-text focus:outline-none" required />
          </div>
          <div>
            <label className="block text-theme-muted mb-2 text-sm font-medium">Categoría</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full rounded-lg p-3 bg-theme-base text-theme-text focus:outline-none" required>
              <option value="" disabled>Selecciona una categoría</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-theme-muted mb-2 text-sm font-medium">Tipo</label>
            <input type="text" name="type" value={formData.type} onChange={handleInputChange} className="w-full rounded-lg p-3 bg-theme-base text-theme-text focus:outline-none" required />
          </div>

          {/* Insumos requeridos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-theme-muted text-sm font-medium">
                Insumos que consume
                <span className="text-[#555] ml-1 text-xs">(por unidad vendida)</span>
              </label>
              <button
                type="button"
                onClick={agregarInsumo}
                disabled={insumos.length === 0}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-theme-base text-[#F6B100] rounded-lg hover:bg-theme-elevated disabled:opacity-40"
              >
                <MdAdd size={14} /> Agregar
              </button>
            </div>

            {insumos.length === 0 && (
              <p className="text-[#555] text-xs">No hay insumos registrados. Agrégalos desde la sección Insumos.</p>
            )}

            {insumosRequeridos.length === 0 && insumos.length > 0 && (
              <p className="text-[#555] text-xs">Sin insumos asignados. El inventario no se descontará automáticamente.</p>
            )}

            <div className="flex flex-col gap-2 mt-1">
              {insumosRequeridos.map((ir, idx) => {
                const insumoInfo = insumos.find((i) => i._id === ir.insumo);
                return (
                  <div key={idx} className="flex items-center gap-2 bg-theme-base rounded-lg p-2">
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
                      className="w-20 bg-theme-card text-theme-text text-sm rounded px-2 py-1 focus:outline-none text-right"
                      placeholder="Cant."
                    />
                    <span className="text-[#555] text-xs w-8 shrink-0">
                      {insumoInfo?.unidad || ""}
                    </span>
                    <button type="button" onClick={() => eliminarInsumo(idx)} className="text-red-400 hover:text-red-300 shrink-0">
                      <MdDelete size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" className="w-full rounded-lg mt-4 py-3 text-lg bg-yellow-400 text-gray-900 font-bold">
            {dataToEdit ? "Guardar Cambios" : "Añadir Producto"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default DishModal;
