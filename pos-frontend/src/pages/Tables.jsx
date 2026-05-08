import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "../https";
import { LoadingState, EmptyState } from "../components/ui";
import { MdTableBar, MdEventSeat, MdLockOpen } from "react-icons/md";

const STATUS_FILTERS = [
  { id: "all", label: "Todas" },
  { id: "available", label: "Libres" },
  { id: "booked", label: "En Uso" },
];

const Tables = () => {
  const [status, setStatus] = useState("all");
  const role = useSelector((state) => state.user.role);

  useEffect(() => {
    document.title = "POS | Mesas";
  }, []);

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    placeholderData: keepPreviousData,
  });

  const tablesArray = resData?.data?.data || [];

  const stats = useMemo(() => {
    const total = tablesArray.length;
    const booked = tablesArray.filter((t) => t.status === "Booked").length;
    return { total, booked, available: total - booked };
  }, [tablesArray]);

  const filteredTables = tablesArray.filter((table) => {
    if (status === "all") return true;
    if (status === "available") return table.status === "Available";
    if (status === "booked") return table.status === "Booked";
    return false;
  });

  return (
    <section className="bg-theme-base h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex flex-col gap-4 px-4 sm:px-10 lg:px-16 py-4 border-b border-theme-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="flex flex-col">
              <h1 className="text-theme-text text-2xl font-bold tracking-wider">
                Mesas
              </h1>
              <p className="text-theme-muted text-xs">
                Gestiona el estado de las mesas en tiempo real
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-2 bg-theme-card border border-theme-border rounded-xl px-3 py-2">
              <MdTableBar className="text-theme-accent text-base" />
              <div className="flex flex-col leading-tight">
                <span className="text-theme-muted text-[10px] uppercase tracking-wider">Total</span>
                <span className="text-theme-text font-bold text-sm">{stats.total}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-theme-card border border-theme-border rounded-xl px-3 py-2">
              <MdLockOpen className="text-green-500 text-base" />
              <div className="flex flex-col leading-tight">
                <span className="text-theme-muted text-[10px] uppercase tracking-wider">Libres</span>
                <span className="text-theme-text font-bold text-sm">{stats.available}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-theme-card border border-theme-border rounded-xl px-3 py-2">
              <MdEventSeat className="text-theme-brand text-base" />
              <div className="flex flex-col leading-tight">
                <span className="text-theme-muted text-[10px] uppercase tracking-wider">En uso</span>
                <span className="text-theme-text font-bold text-sm">{stats.booked}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {STATUS_FILTERS.map((s) => {
            const isActive = status === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStatus(s.id)}
                className={`shrink-0 transition-all duration-200 px-5 py-2 rounded-full font-semibold text-sm ${
                  isActive
                    ? "bg-theme-brand text-theme-brand-fg shadow-md"
                    : "text-theme-muted hover:text-theme-text bg-theme-card border border-theme-border hover:border-theme-brand/40"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        {isLoading ? (
          <LoadingState label="Cargando mesas…" />
        ) : isError ? (
          <EmptyState
            icon={MdTableBar}
            title="No se pudieron cargar las mesas"
            description="Revisa tu conexión y reintenta recargando la página."
          />
        ) : filteredTables.length === 0 ? (
          <EmptyState
            icon={MdTableBar}
            title="Sin mesas en este filtro"
            description="Cambia de filtro para ver más mesas."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4 sm:px-10 md:px-16 py-4 items-start content-start">
            {filteredTables.map((table) => (
              <TableCard key={table._id} table={table} role={role} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;
