import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMetrics } from "../../https";

const Metrics = () => {
  const { data: res, isLoading } = useQuery({ queryKey: ["metrics"], queryFn: getMetrics });
  const md = res?.data?.data || {};

  if (isLoading) return <div className="text-theme-text p-6">Cargando métricas...</div>;

  const metricsData = [
    { title: "Ingresos", value: `Bs ${md.totalRevenue || 0}`, percentage: "+0%", color: "#025cca", isIncrease: true },
    { title: "Pedidos Totales", value: md.totalOrders || 0, percentage: "+0%", color: "#02ca3a", isIncrease: true },
    { title: "Clientes (Roles)", value: md.totalCustomers || 0, percentage: "+0%", color: "#f6b100", isIncrease: true },
    { title: "Mesas Ocupadas", value: md.bookedTables || 0, percentage: "-0%", color: "#be3e3f", isIncrease: false },
  ];

  const itemsData = [
    { title: "Categorías Totales", value: md.totalCategories || 0, percentage: "+0%", color: "#5b45b0", isIncrease: true },
    { title: "Platos Totales", value: md.totalDishes || 0, percentage: "+0%", color: "#285430", isIncrease: true },
    { title: "Mesas Totales", value: md.totalTables || 0, color: "#7f167f"}
  ];

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-theme-text text-xl">
            Rendimiento General
          </h2>
          <p className="text-sm text-theme-muted">
            Resumen de las métricas clave del sistema y su rendimiento actual.
          </p>
        </div>
        <button className="flex items-center gap-1 px-4 py-2 rounded-md text-theme-text bg-theme-surface">
          Último 1 Mes
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {metricsData.map((metric, index) => {
          return (
            <div
              key={index}
              className="shadow-sm rounded-lg p-4"
              style={{ backgroundColor: metric.color }}
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-xs text-theme-text">
                  {metric.title}
                </p>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    style={{ color: metric.isIncrease ? "#f5f5f5" : "red" }}
                  >
                    <path
                      d={metric.isIncrease ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                    />
                  </svg>
                  <p
                    className="font-medium text-xs"
                    style={{ color: metric.isIncrease ? "#f5f5f5" : "red" }}
                  >
                    {metric.percentage}
                  </p>
                </div>
              </div>
              <p className="mt-1 font-semibold text-2xl text-theme-text">
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col justify-between mt-12">
        <div>
          <h2 className="font-semibold text-theme-text text-xl">
            Detalles de Artículos
          </h2>
          <p className="text-sm text-theme-muted">
            Información detallada del rendimiento individual de los artículos.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4">

            {
                itemsData.map((item, index) => {
                    return (
                        <div key={index} className="shadow-sm rounded-lg p-4" style={{ backgroundColor: item.color }}>
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-xs text-theme-text">{item.title}</p>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-theme-text" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4" fill="none">
                              <path d="M5 15l7-7 7 7" />
                            </svg>
                            <p className="font-medium text-xs text-theme-text">{item.percentage}</p>
                          </div>
                        </div>
                        <p className="mt-1 font-semibold text-2xl text-theme-text">{item.value}</p>
                      </div>
                    )
                })
            }

        </div>
      </div>
    </div>
  );
};

export default Metrics;
