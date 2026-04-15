import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTable, updateTable } from "../../https";
import { enqueueSnackbar } from "notistack"

const Modal = ({ setIsTableModalOpen, dataToEdit }) => {
  const queryClient = useQueryClient();
  const [tableData, setTableData] = useState({
    tableNo: "",
    seats: "",
    bgColor: "#262626"
  });

  useEffect(() => {
    if (dataToEdit) {
      setTableData({
        tableNo: dataToEdit.tableNo,
        seats: dataToEdit.seats,
        bgColor: dataToEdit.bgColor || "#262626"
      });
    }
  }, [dataToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTableData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dataToEdit) {
      updateMutation.mutate({ tableId: dataToEdit._id, ...tableData });
    } else {
      tableMutation.mutate(tableData);
    }
  };

  const handleCloseModal = () => {
    setIsTableModalOpen(false);
  };

  const tableMutation = useMutation({
    mutationFn: (reqData) => addTable(reqData),
    onSuccess: (res) => {
        setIsTableModalOpen(false);
        const { data } = res;
        enqueueSnackbar(data.message, { variant: "success" })
        queryClient.invalidateQueries(["tables"]);
    },
    onError: (error) => {
        const data = error.response?.data || {};
        enqueueSnackbar(data.message || "Error al procesar", { variant: "error" })
    }
  });

  const updateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),
    onSuccess: (res) => {
        setIsTableModalOpen(false);
        const { data } = res;
        enqueueSnackbar(data.message || "Editado con éxito", { variant: "success" })
        queryClient.invalidateQueries(["tables"]);
    },
    onError: (error) => {
        const data = error.response?.data || {};
        enqueueSnackbar(data.message || "Error al editar", { variant: "error" })
    }
  });


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#262626] p-6 rounded-lg shadow-lg w-96"
      >
        {/* Modal Header */}

        <div className="flex justify-between item-center mb-4">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">
            {dataToEdit ? "Editar Mesa" : "Añadir Mesa"}
          </h2>
          <button
            onClick={handleCloseModal}
            className="text-[#f5f5f5] hover:text-red-500"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Modal Body */}

        <form onSubmit={handleSubmit} className="space-y-4 mt-10">
          <div>
            <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
              Número de Mesa
            </label>
            <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
              <input
                type="number"
                name="tableNo"
                value={tableData.tableNo}
                onChange={handleInputChange}
                className="bg-transparent flex-1 text-white focus:outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
              Número de Asientos
            </label>
            <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
              <input
                type="number"
                name="seats"
                value={tableData.seats}
                onChange={handleInputChange}
                className="bg-transparent flex-1 text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
              Color de Perfil de Mesa
            </label>
            <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-lg p-3">
              <input
                type="color"
                name="bgColor"
                value={tableData.bgColor || "#262626"}
                onChange={handleInputChange}
                className="w-12 h-10 cursor-pointer bg-transparent border-none appearance-none p-0"
              />
              <span className="text-white font-semibold">
                {tableData.bgColor?.toUpperCase() || "#262626"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg mt-10 mb-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
          >
            {dataToEdit ? "Guardar Mesa" : "Añadir Mesa"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Modal;
