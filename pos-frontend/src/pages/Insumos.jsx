import React, { useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  getInsumos,
  getMetricasInsumos,
  addInsumo,
  updateInsumo,
  deleteInsumo,
  registrarConsumo,
  reponerStock,
} from "../https/index";
import Modal from "../components/shared/Modal";
import {
  MdWarning,
  MdCheckCircle,
  MdError,
  MdAdd,
  MdEdit,
  MdDelete,
  MdTrendingDown,
  MdInventory,
  MdAttachMoney,
} from "react-icons/md";
import { FaBoxOpen, FaArrowDown, FaArrowUp } from "react-icons/fa";

const CATEGORIAS = ["Café", "Lácteos", "Azúcares", "Panadería", "Frutas", "Bebidas", "Limpieza", "General"];
const UNIDADES = ["kg", "g", "L", "ml", "und", "caja", "bolsa", "paquete"];

const estadoInsumo = (insumo) => {
  if (insumo.stock < insumo.stockMinimo * 0.5) return "critico";
  if (insumo.stock < insumo.stockMinimo) return "bajo";
  if (insumo.stock > insumo.stockMaximo) return "abundante";
  return "normal";
};

const estadoConfig = {
  critico: { label: "Crítico", color: "bg-red-500/20 text-red-400 border border-red-500/40", dot: "bg-red-500", bar: "bg-red-500" },
  bajo: { label: "Bajo", color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40", dot: "bg-yellow-500", bar: "bg-yellow-500" },
  normal: { label: "Normal", color: "bg-green-500/20 text-green-400 border border-green-500/40", dot: "bg-green-500", bar: "bg-green-500" },
  abundante: { label: "Abundante", color: "bg-blue-500/20 text-blue-400 border border-blue-500/40", dot: "bg-blue-400", bar: "bg-blue-400" },
};

const porcentajeStock = (insumo) => {
  const pct = (insumo.stock / insumo.stockMaximo) * 100;
  return Math.min(100, Math.max(0, pct));
};

const INSUMO_INICIAL = {
  nombre: "", unidad: "kg", stock: "", stockMinimo: "", stockMaximo: "",
  costoUnitario: "", categoria: "General", proveedor: "",
};

export default function Insumos() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalConsumo, setModalConsumo] = useState(null);
  const [modalReponer, setModalReponer] = useState(null);
  const [form, setForm] = useState(INSUMO_INICIAL);
  const [cantidadOp, setCantidadOp] = useState("");
  const [descConsumo, setDescConsumo] = useState("");

  const { data: insumosData } = useQuery({ queryKey: ["insumos"], queryFn: getInsumos });
  const { data: metricasData } = useQuery({ queryKey: ["metricas-insumos"], queryFn: getMetricasInsumos });

  const insumos = insumosData?.data?.data || [];
  const metricas = metricasData?.data?.data || null;

  const mutAddInsumo = useMutation({
    mutationFn: addInsumo,
    onSuccess: () => { queryClient.invalidateQueries(["insumos", "metricas-insumos"]); enqueueSnackbar("Insumo agregado", { variant: "success" }); setModalAgregar(false); setForm(INSUMO_INICIAL); },
    onError: (e) => enqueueSnackbar(e?.response?.data?.message || "Error al agregar", { variant: "error" }),
  });

  const mutUpdateInsumo = useMutation({
    mutationFn: updateInsumo,
    onSuccess: () => { queryClient.invalidateQueries(["insumos", "metricas-insumos"]); enqueueSnackbar("Insumo actualizado", { variant: "success" }); setModalEditar(null); },
    onError: (e) => enqueueSnackbar(e?.response?.data?.message || "Error al actualizar", { variant: "error" }),
  });

  const mutDeleteInsumo = useMutation({
    mutationFn: deleteInsumo,
    onSuccess: () => { queryClient.invalidateQueries(["insumos", "metricas-insumos"]); enqueueSnackbar("Insumo eliminado", { variant: "info" }); },
    onError: (e) => enqueueSnackbar(e?.response?.data?.message || "Error al eliminar", { variant: "error" }),
  });

  const mutConsumo = useMutation({
    mutationFn: registrarConsumo,
    onSuccess: () => { queryClient.invalidateQueries(["insumos", "metricas-insumos"]); enqueueSnackbar("Consumo registrado", { variant: "success" }); setModalConsumo(null); setCantidadOp(""); setDescConsumo(""); },
    onError: (e) => enqueueSnackbar(e?.response?.data?.message || "Error al registrar consumo", { variant: "error" }),
  });

  const mutReponer = useMutation({
    mutationFn: reponerStock,
    onSuccess: () => { queryClient.invalidateQueries(["insumos", "metricas-insumos"]); enqueueSnackbar("Stock repuesto", { variant: "success" }); setModalReponer(null); setCantidadOp(""); },
    onError: (e) => enqueueSnackbar(e?.response?.data?.message || "Error al reponer", { variant: "error" }),
  });

  const insumosFiltrados = insumos.filter((i) => {
    const estado = estadoInsumo(i);
    const matchFiltro = filtro === "todos" || estado === filtro;
    const matchBusqueda = i.nombre.toLowerCase().includes(busqueda.toLowerCase()) || i.categoria.toLowerCase().includes(busqueda.toLowerCase());
    return matchFiltro && matchBusqueda;
  });

  const abrirEditar = (insumo) => {
    setForm({ nombre: insumo.nombre, unidad: insumo.unidad, stock: insumo.stock, stockMinimo: insumo.stockMinimo, stockMaximo: insumo.stockMaximo, costoUnitario: insumo.costoUnitario, categoria: insumo.categoria, proveedor: insumo.proveedor || "" });
    setModalEditar(insumo);
  };

  const handleSubmitAgregar = () => {
    if (!form.nombre || !form.unidad || form.stock === "" || !form.stockMinimo || !form.stockMaximo || !form.costoUnitario)
      return enqueueSnackbar("Completa todos los campos obligatorios", { variant: "warning" });
    mutAddInsumo.mutate({ ...form, stock: +form.stock, stockMinimo: +form.stockMinimo, stockMaximo: +form.stockMaximo, costoUnitario: +form.costoUnitario });
  };

  const handleSubmitEditar = () => {
    if (!form.nombre || !form.unidad || form.stock === "" || !form.stockMinimo || !form.stockMaximo || !form.costoUnitario)
      return enqueueSnackbar("Completa todos los campos obligatorios", { variant: "warning" });
    mutUpdateInsumo.mutate({ insumoId: modalEditar._id, ...form, stock: +form.stock, stockMinimo: +form.stockMinimo, stockMaximo: +form.stockMaximo, costoUnitario: +form.costoUnitario });
  };

  const maxGasto = metricas?.gastosPorDia ? Math.max(...metricas.gastosPorDia.map((d) => d.gasto), 1) : 1;

  return (
    <div className="min-h-screen bg-theme-surface text-theme-text pb-24 pt-4 px-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Insumos</h1>
          <p className="text-theme-muted text-sm">Control de inventario de cafetería</p>
        </div>
        <button
          onClick={() => setModalAgregar(true)}
          className="flex items-center gap-2 bg-[#F6B100] text-black font-bold px-4 py-2 rounded-xl hover:bg-yellow-500 transition"
        >
          <MdAdd size={20} /> Agregar
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4">
        <div className="bg-theme-card rounded-2xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-theme-muted text-xs font-medium">
            <MdAttachMoney size={16} className="text-[#F6B100]" /> Gasto Hoy
          </div>
          <p className="text-2xl font-bold text-[#F6B100]">Bs {metricas?.gastoHoy?.toFixed(2) || "0.00"}</p>
        </div>
        <div className="bg-theme-card rounded-2xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-theme-muted text-xs font-medium">
            <MdInventory size={16} className="text-blue-400" /> Total Insumos
          </div>
          <p className="text-2xl font-bold text-theme-text">{metricas?.totalInsumos || 0}</p>
        </div>
        <div className="bg-theme-card rounded-2xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-theme-muted text-xs font-medium">
            <MdWarning size={16} className="text-yellow-400" /> Stock Bajo
          </div>
          <p className="text-2xl font-bold text-yellow-400">{metricas?.bajos || 0}</p>
        </div>
        <div className="bg-theme-card rounded-2xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-theme-muted text-xs font-medium">
            <MdError size={16} className="text-red-400" /> Críticos
          </div>
          <p className="text-2xl font-bold text-red-400">{metricas?.criticos || 0}</p>
        </div>
      </div>

      {/* Gasto últimos 7 días */}
      {metricas?.gastosPorDia && (
        <div className="bg-theme-card rounded-2xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-theme-muted mb-3">Gasto últimos 7 días (Bs)</h2>
          <div className="flex items-end gap-2 h-24">
            {metricas.gastosPorDia.map((dia, i) => {
              const altura = (dia.gasto / maxGasto) * 100;
              const esHoy = i === metricas.gastosPorDia.length - 1;
              return (
                <div key={dia.fecha} className="flex flex-col items-center flex-1 gap-1">
                  <span className="text-[10px] text-theme-muted font-mono">
                    {dia.gasto > 0 ? dia.gasto.toFixed(0) : ""}
                  </span>
                  <div className="w-full flex items-end" style={{ height: "60px" }}>
                    <div
                      className={`w-full rounded-t-md transition-all ${esHoy ? "bg-[#F6B100]" : "bg-theme-elevated"}`}
                      style={{ height: `${Math.max(altura, dia.gasto > 0 ? 8 : 3)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${esHoy ? "text-[#F6B100]" : "text-theme-muted"}`}>{dia.dia}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertas rápidas */}
      {metricas?.insumosEnAlerta?.length > 0 && (
        <div className="bg-theme-card rounded-2xl p-4 mb-6 border border-red-500/20">
          <h2 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <MdWarning /> Insumos que necesitan pedido
          </h2>
          <div className="flex flex-col gap-2">
            {metricas.insumosEnAlerta.map((i) => (
              <div key={i._id} className="flex items-center justify-between text-sm">
                <span className="text-theme-text font-medium">{i.nombre}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${estadoConfig[i.estado].color}`}>
                  {i.stock} {i.unidad} — {estadoConfig[i.estado].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["todos", "critico", "bajo", "normal", "abundante"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition ${
              filtro === f ? "bg-[#F6B100] text-black" : "bg-theme-elevated text-theme-muted hover:bg-theme-elevated"
            }`}
          >
            {f === "todos" ? "Todos" : estadoConfig[f]?.label}
          </button>
        ))}
      </div>

      {/* Búsqueda */}
      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar insumo o categoría..."
        className="w-full bg-theme-card text-theme-text rounded-xl px-4 py-2.5 mb-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#F6B100] placeholder:text-[#555]"
      />

      {/* Lista de insumos */}
      <div className="flex flex-col gap-3">
        {insumosFiltrados.length === 0 && (
          <div className="text-center py-12 text-[#555]">
            <FaBoxOpen size={40} className="mx-auto mb-3" />
            <p>No hay insumos{filtro !== "todos" ? " con este estado" : ""}.</p>
          </div>
        )}
        {insumosFiltrados.map((insumo) => {
          const estado = estadoInsumo(insumo);
          const cfg = estadoConfig[estado];
          const pct = porcentajeStock(insumo);
          return (
            <div key={insumo._id} className="bg-theme-card rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-theme-text text-sm">{insumo.nombre}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-theme-muted text-xs mt-0.5">{insumo.categoria} · Bs {insumo.costoUnitario}/{insumo.unidad}{insumo.proveedor ? ` · ${insumo.proveedor}` : ""}</p>
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                  <button onClick={() => abrirEditar(insumo)} className="p-1.5 rounded-lg hover:bg-theme-elevated text-theme-muted"><MdEdit size={16} /></button>
                  <button onClick={() => mutDeleteInsumo.mutate(insumo._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"><MdDelete size={16} /></button>
                </div>
              </div>

              {/* Barra de stock */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-theme-muted mb-1">
                  <span>Stock: <span className="text-theme-text font-medium">{insumo.stock} {insumo.unidad}</span></span>
                  <span>Mín: {insumo.stockMinimo} · Máx: {insumo.stockMaximo}</span>
                </div>
                <div className="h-2 bg-theme-elevated rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setModalConsumo(insumo); setCantidadOp(""); setDescConsumo(""); }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl bg-theme-base text-theme-muted hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <FaArrowDown size={12} /> Registrar Consumo
                </button>
                <button
                  onClick={() => { setModalReponer(insumo); setCantidadOp(""); }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl bg-theme-base text-theme-muted hover:text-green-400 hover:bg-green-500/10 transition"
                >
                  <FaArrowUp size={12} /> Reponer Stock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Agregar */}
      <Modal isOpen={modalAgregar} onClose={() => setModalAgregar(false)} title="Agregar Insumo">
        <FormInsumo form={form} setForm={setForm} />
        <button onClick={handleSubmitAgregar} disabled={mutAddInsumo.isPending} className="w-full bg-[#F6B100] text-black font-bold rounded-xl py-3 mt-4 hover:bg-yellow-500 disabled:opacity-50">
          {mutAddInsumo.isPending ? "Guardando..." : "Guardar Insumo"}
        </button>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={!!modalEditar} onClose={() => setModalEditar(null)} title="Editar Insumo">
        <FormInsumo form={form} setForm={setForm} />
        <button onClick={handleSubmitEditar} disabled={mutUpdateInsumo.isPending} className="w-full bg-[#F6B100] text-black font-bold rounded-xl py-3 mt-4 hover:bg-yellow-500 disabled:opacity-50">
          {mutUpdateInsumo.isPending ? "Guardando..." : "Actualizar Insumo"}
        </button>
      </Modal>

      {/* Modal Consumo */}
      <Modal isOpen={!!modalConsumo} onClose={() => setModalConsumo(null)} title={`Registrar Consumo — ${modalConsumo?.nombre}`}>
        <label className="block text-theme-muted mb-2 text-sm font-medium">Cantidad ({modalConsumo?.unidad})</label>
        <div className="flex items-center rounded-lg p-3 px-4 bg-theme-base mb-3">
          <input value={cantidadOp} onChange={(e) => setCantidadOp(e.target.value)} type="number" placeholder="Ej. 2.5" className="bg-transparent flex-1 text-theme-text focus:outline-none" />
        </div>
        <label className="block text-theme-muted mb-2 text-sm font-medium">Descripción (opcional)</label>
        <div className="flex items-center rounded-lg p-3 px-4 bg-theme-base mb-1">
          <input value={descConsumo} onChange={(e) => setDescConsumo(e.target.value)} type="text" placeholder="Ej. Turno mañana" className="bg-transparent flex-1 text-theme-text focus:outline-none" />
        </div>
        {cantidadOp && modalConsumo && (
          <p className="text-theme-muted text-xs mt-2 mb-1">
            Costo estimado: <span className="text-[#F6B100] font-semibold">Bs {(+cantidadOp * modalConsumo.costoUnitario).toFixed(2)}</span>
          </p>
        )}
        <button onClick={() => mutConsumo.mutate({ insumoId: modalConsumo._id, cantidad: +cantidadOp, descripcion: descConsumo })} disabled={mutConsumo.isPending || !cantidadOp} className="w-full bg-red-500 text-white font-bold rounded-xl py-3 mt-4 hover:bg-red-600 disabled:opacity-50">
          {mutConsumo.isPending ? "Registrando..." : "Registrar Consumo"}
        </button>
      </Modal>

      {/* Modal Reponer */}
      <Modal isOpen={!!modalReponer} onClose={() => setModalReponer(null)} title={`Reponer Stock — ${modalReponer?.nombre}`}>
        <label className="block text-theme-muted mb-2 text-sm font-medium">Cantidad a agregar ({modalReponer?.unidad})</label>
        <div className="flex items-center rounded-lg p-3 px-4 bg-theme-base mb-1">
          <input value={cantidadOp} onChange={(e) => setCantidadOp(e.target.value)} type="number" placeholder="Ej. 10" className="bg-transparent flex-1 text-theme-text focus:outline-none" />
        </div>
        {cantidadOp && modalReponer && (
          <p className="text-theme-muted text-xs mt-2 mb-1">
            Stock resultante: <span className="text-green-400 font-semibold">{(modalReponer.stock + +cantidadOp).toFixed(2)} {modalReponer.unidad}</span>
          </p>
        )}
        <button onClick={() => mutReponer.mutate({ insumoId: modalReponer._id, cantidad: +cantidadOp })} disabled={mutReponer.isPending || !cantidadOp} className="w-full bg-green-500 text-white font-bold rounded-xl py-3 mt-4 hover:bg-green-600 disabled:opacity-50">
          {mutReponer.isPending ? "Reponiendo..." : "Reponer Stock"}
        </button>
      </Modal>

      <BottomNav />
    </div>
  );
}

function FormInsumo({ form, setForm }) {
  const campo = (label, key, tipo = "text", placeholder = "") => (
    <div className="mb-3">
      <label className="block text-theme-muted mb-1.5 text-sm font-medium">{label}</label>
      <div className="flex items-center rounded-lg p-3 px-4 bg-theme-base">
        <input
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          type={tipo}
          placeholder={placeholder}
          className="bg-transparent flex-1 text-theme-text focus:outline-none text-sm"
        />
      </div>
    </div>
  );

  const select = (label, key, opciones) => (
    <div className="mb-3">
      <label className="block text-theme-muted mb-1.5 text-sm font-medium">{label}</label>
      <div className="flex items-center rounded-lg p-3 px-4 bg-theme-base">
        <select value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="bg-transparent flex-1 text-theme-text focus:outline-none text-sm">
          {opciones.map((o) => <option key={o} value={o} className="bg-theme-base">{o}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <>
      {campo("Nombre *", "nombre", "text", "Ej. Café molido")}
      <div className="grid grid-cols-2 gap-3">
        {select("Unidad *", "unidad", UNIDADES)}
        {select("Categoría", "categoria", CATEGORIAS)}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {campo("Stock actual *", "stock", "number", "0")}
        {campo("Stock mínimo *", "stockMinimo", "number", "0")}
        {campo("Stock máximo *", "stockMaximo", "number", "0")}
      </div>
      {campo("Costo por unidad (Bs) *", "costoUnitario", "number", "0.00")}
      {campo("Proveedor", "proveedor", "text", "Ej. Distribuidora XYZ")}
    </>
  );
}
