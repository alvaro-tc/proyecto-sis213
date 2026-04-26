import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import { tables } from "../constants";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "../https";
import { enqueueSnackbar } from "notistack";

const Tables = () => {
  const [status, setStatus] = useState("all");

    useEffect(() => {
      document.title = "POS | Mesas"
    }, [])

  const { data: resData, isError } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      return await getTables();
    },
    placeholderData: keepPreviousData,
  });

  if(isError) {
    enqueueSnackbar("¡Algo salió mal!", { variant: "error" })
  }

  const tablesArray = resData?.data?.data || [];
  const filteredTables = tablesArray.filter((table) => {
    if (status === "all") return true;
    if (status === "booked" && table.status === "Booked") return true;
    return false;
  });

  return (
    <section className="bg-theme-base h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10 lg:px-16 py-4 gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-theme-text text-2xl font-bold tracking-wider">
            Mesas
          </h1>
        </div>
        <div className="flex items-center justify-around gap-3">
          <button
            onClick={() => setStatus("all")}
            className={`transition-all duration-200 px-5 py-2 rounded-full font-semibold text-sm md:text-base ${
              status === "all" ? "bg-[#f6b100] text-gray-900 shadow-md" : "text-theme-muted hover:text-theme-text hover:bg-theme-elevated"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setStatus("booked")}
            className={`transition-all duration-200 px-5 py-2 rounded-full font-semibold text-sm md:text-base ${
              status === "booked" ? "bg-[#f6b100] text-gray-900 shadow-md" : "text-theme-muted hover:text-theme-text hover:bg-theme-elevated"
            }`}
          >
            En Uso
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4 sm:px-10 md:px-16 py-4 flex-1 overflow-y-auto scrollbar-hide pb-24 items-start content-start">
        {filteredTables.map((table) => {
          return (
            <TableCard
              key={table._id}
              id={table._id}
              name={table.tableNo}
              status={table.status}
              initials={table?.currentOrder?.customerDetails.name}
              seats={table.seats}
              bgColor={table.bgColor || "#262626"}
            />
          );
        })}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;
