import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCategory, updateCategory } from "../../https";
import { enqueueSnackbar } from "notistack";

const CategoryModal = ({ setIsCategoryModalOpen, dataToEdit }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    bgColor: "#b73e3e",
    icon: "🍲"
  });

  useEffect(() => {
    if (dataToEdit) {
      setFormData({
        name: dataToEdit.name,
        bgColor: dataToEdit.bgColor,
        icon: dataToEdit.icon
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
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Error", { variant: "error" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (reqData) => updateCategory(reqData),
    onSuccess: (res) => {
      setIsCategoryModalOpen(false);
      enqueueSnackbar(res.data.message, { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Error", { variant: "error" });
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-[#262626] p-6 rounded-lg shadow-lg w-96"
      >
        <div className="flex justify-between item-center mb-4">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">
            {dataToEdit ? "Editar Categoría" : "Añadir Categoría"}
          </h2>
          <button onClick={() => setIsCategoryModalOpen(false)} className="text-[#f5f5f5] hover:text-red-500">
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">Nombre</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none" required />
          </div>
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">Color de Fondo (Hex)</label>
            <input type="color" name="bgColor" value={formData.bgColor} onChange={handleInputChange} className="w-full h-12 rounded-lg p-1 bg-[#1f1f1f] text-white focus:outline-none cursor-pointer" required />
          </div>
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">Icono (Emoji)</label>
            <input type="text" name="icon" value={formData.icon} onChange={handleInputChange} className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none" required />
          </div>
          <button type="submit" className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold">
            {dataToEdit ? "Guardar Cambios" : "Añadir Categoría"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CategoryModal;
