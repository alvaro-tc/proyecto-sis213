import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCategory, updateCategory } from "../../https";
import { enqueueSnackbar } from "notistack";

const EMOJI_SUGGESTIONS = ["🍲", "☕", "🥤", "🍰", "🍔", "🍕", "🥗", "🍣", "🍦", "🍪", "🥐", "🍩"];
const COLOR_PRESETS = [
  "#b45309", "#d97706", "#f6b100", "#65a30d",
  "#0d9488", "#0369a1", "#7c3aed", "#be185d",
  "#dc2626", "#78716c", "#431407", "#1c1917",
];

const CategoryModal = ({ setIsCategoryModalOpen, dataToEdit }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    bgColor: "#b45309",
    icon: "🍲",
  });

  useEffect(() => {
    if (dataToEdit) {
      setFormData({
        name: dataToEdit.name,
        bgColor: dataToEdit.bgColor,
        icon: dataToEdit.icon,
      });
    }
  }, [dataToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dataToEdit) {
      updateMutation.mutate({ categoryId: dataToEdit._id, ...formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const addMutation = useMutation({
    mutationFn: (reqData) => addCategory(reqData),
    onSuccess: (res) => {
      setIsCategoryModalOpen(false);
      enqueueSnackbar(res.data.message, { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) =>
      enqueueSnackbar(error.response?.data?.message || "Error", { variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: (reqData) => updateCategory(reqData),
    onSuccess: (res) => {
      setIsCategoryModalOpen(false);
      enqueueSnackbar(res.data.message, { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) =>
      enqueueSnackbar(error.response?.data?.message || "Error", { variant: "error" }),
  });

  const isEditing = !!dataToEdit;
  const inputBase =
    "w-full rounded-lg p-3 bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-theme-accent transition";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-theme-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-theme-border"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-theme-border">
          <div>
            <h2 className="text-theme-text text-lg font-semibold">
              {isEditing ? "Editar categoría" : "Nueva categoría"}
            </h2>
            <p className="text-theme-muted text-xs mt-0.5">
              {isEditing
                ? "Actualiza el nombre, ícono o color"
                : "Define cómo agrupar tus productos"}
            </p>
          </div>
          <button
            onClick={() => setIsCategoryModalOpen(false)}
            className="text-theme-muted hover:text-theme-text hover:bg-theme-elevated p-1.5 rounded-md transition"
          >
            <IoMdClose size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="px-6 py-5 space-y-5 overflow-y-auto">
            {/* Vista previa */}
            <div className="flex items-center justify-center">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-md border border-theme-border transition-colors"
                style={{ backgroundColor: formData.bgColor }}
              >
                <span className="drop-shadow-sm">{formData.icon || "❓"}</span>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-theme-text mb-1.5 text-sm font-medium">
                Nombre de la categoría
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej. Bebidas calientes"
                className={inputBase}
                required
              />
            </div>

            {/* Ícono */}
            <div>
              <label className="block text-theme-text mb-1.5 text-sm font-medium">
                Ícono (emoji)
              </label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                maxLength={4}
                className={`${inputBase} text-center text-2xl`}
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {EMOJI_SUGGESTIONS.map((e) => (
                  <button
                    type="button"
                    key={e}
                    onClick={() => setFormData((p) => ({ ...p, icon: e }))}
                    className={`w-9 h-9 rounded-md text-lg flex items-center justify-center transition border ${
                      formData.icon === e
                        ? "bg-theme-elevated border-theme-accent"
                        : "bg-theme-base border-theme-border hover:bg-theme-elevated"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-theme-text mb-1.5 text-sm font-medium">
                Color de fondo
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="bgColor"
                  value={formData.bgColor}
                  onChange={handleInputChange}
                  className="w-14 h-11 rounded-lg p-1 bg-theme-base border border-theme-border cursor-pointer"
                  required
                />
                <input
                  type="text"
                  value={formData.bgColor}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, bgColor: e.target.value }))
                  }
                  pattern="^#([A-Fa-f0-9]{6})$"
                  className={`${inputBase} flex-1 uppercase`}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setFormData((p) => ({ ...p, bgColor: color }))}
                    className={`w-7 h-7 rounded-full border-2 transition ${
                      formData.bgColor.toLowerCase() === color.toLowerCase()
                        ? "border-theme-accent scale-110"
                        : "border-theme-border hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-theme-border bg-theme-surface flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-4 py-2.5 rounded-lg text-theme-text hover:bg-theme-elevated text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-theme-brand text-theme-brand-fg text-sm font-semibold hover:opacity-90 transition shadow-sm"
            >
              {isEditing ? "Guardar cambios" : "Crear categoría"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CategoryModal;
