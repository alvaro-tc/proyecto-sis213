import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDish, updateDish, getCategories } from "../../https";
import { enqueueSnackbar } from "notistack";

const DishModal = ({ setIsDishModalOpen, dataToEdit }) => {
  const queryClient = useQueryClient();
  const { data: catRes } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const categories = catRes?.data?.data || [];

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    type: "General"
  });

  useEffect(() => {
    if (dataToEdit) {
      setFormData({
        name: dataToEdit.name,
        price: dataToEdit.price,
        category: dataToEdit.category?._id || dataToEdit.category,
        type: dataToEdit.type || "General"
      });
    } else if (categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0]._id }));
    }
  }, [dataToEdit, categories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category) return enqueueSnackbar("Seleccione una categoría", { variant: "error" });
    const submission = { ...formData, price: Number(formData.price) };
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
    onError: (error) => enqueueSnackbar(error.response?.data?.message || "Error", { variant: "error" })
  });

  const updateMutation = useMutation({
    mutationFn: (reqData) => updateDish(reqData),
    onSuccess: (res) => {
      setIsDishModalOpen(false);
      enqueueSnackbar(res.data.message, { variant: "success" });
      queryClient.invalidateQueries(["dishes"]);
    },
    onError: (error) => enqueueSnackbar(error.response?.data?.message || "Error", { variant: "error" })
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="bg-[#262626] p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between item-center mb-4">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">{dataToEdit ? "Editar Plato" : "Añadir Plato"}</h2>
          <button onClick={() => setIsDishModalOpen(false)} className="text-[#f5f5f5] hover:text-red-500"><IoMdClose size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">Nombre</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none" required />
          </div>
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">Precio (Bs)</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none" required />
          </div>
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">Categoría</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none" required>
              <option value="" disabled>Selecciona una categoría</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">Tipo</label>
            <input type="text" name="type" value={formData.type} onChange={handleInputChange} className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white focus:outline-none" required />
          </div>
          <button type="submit" className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold">
            {dataToEdit ? "Guardar Cambios" : "Añadir Plato"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default DishModal;
