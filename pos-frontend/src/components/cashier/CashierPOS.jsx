import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
  MdCoffee,
  MdPerson,
  MdPhone,
  MdTableBar,
  MdDeleteOutline,
  MdCheckCircle,
  MdShoppingBag,
  MdSearch,
  MdPersonOff,
  MdClose,
  MdHistory,
} from "react-icons/md";
import { FiShoppingCart, FiGrid } from "react-icons/fi";

import { addItems, removeItem, removeAllItems, getTotalPrice } from "../../redux/slices/cartSlice";
import { setCustomer, removeCustomer, updateTable } from "../../redux/slices/customerSlice";
import {
  getCategories,
  getDishes,
  addOrder,
  updateTable as updateTableApi,
  createYapePayment,
  searchOrderCustomers,
} from "../../https/index";
import Invoice from "../invoice/Invoice";
import YapePayModal from "../menu/YapePayModal";

/* ─── tiny helpers ─── */
const now = () => {
  const d = new Date();
  return d.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
};

const todayStr = () =>
  new Date().toLocaleDateString("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

/* ─── CashierPOS ─── */
const CashierPOS = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { name: staffName } = useSelector((s) => s.user);
  const cartData = useSelector((s) => s.cart);
  const customerData = useSelector((s) => s.customer);
  const total = useSelector(getTotalPrice);

  /* ── server data ── */
  const { data: catRes, isLoading: isCatLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const { data: dishRes, isLoading: isDishLoading } = useQuery({
    queryKey: ["dishes"],
    queryFn: getDishes,
  });

  const categories = catRes?.data?.data || [];
  const dishes = dishRes?.data?.data || [];
  const menus = categories.map((c) => ({
    id: c._id,
    name: c.name,
    icon: c.icon,
    bgColor: c.bgColor,
    items: dishes.filter(
      (d) => d.category && (d.category._id === c._id || d.category === c._id)
    ),
  }));

  /* ── local ui state ── */
  const [selectedCatId, setSelectedCatId] = useState(null);
  const selectedCat = menus.find((m) => m.id === selectedCatId) || null;
  const [mobileTab, setMobileTab] = useState("menu"); // "menu" | "order"
  const [time, setTime] = useState(now());

  // Customer form (inline, no modal)
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState("takeaway");
  const [customerSet, setCustomerSet] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  // Customer search / autocomplete
  const [customerQuery, setCustomerQuery] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const { data: custRes } = useQuery({
    queryKey: ["customers-search", customerQuery],
    queryFn: () => searchOrderCustomers(customerQuery),
    enabled: !customerSet,
    staleTime: 30_000,
  });
  const suggestions = custRes?.data?.data || [];

  // Payment
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [yapePayment, setYapePayment] = useState(null);

  // QR generation countdown — la ETA real viene del orquestador en la respuesta
  // de createYapePayment, pero usamos 90s como default mientras se solicita.
  const [qrGenerating, setQrGenerating] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(0);
  const [qrEstimateS, setQrEstimateS] = useState(90);
  const countdownRef = useRef(null);

  // Product qty per product (key = dishId)
  const [quantities, setQuantities] = useState({});

  const cartRef = useRef(null);

  /* ── clock ── */
  useEffect(() => {
    const id = setInterval(() => setTime(now()), 30_000);
    return () => clearInterval(id);
  }, []);

  /* ── el orquestador devuelve la ETA en cada solicitud, no preguntamos antes ── */

  /* ── keep selected category fresh ── */
  useEffect(() => {
    if (menus.length > 0 && (!selectedCatId || !menus.some((m) => m.id === selectedCatId))) {
      setSelectedCatId(menus[0].id);
    }
  }, [menus.length, selectedCatId]);

  /* ── scroll cart to bottom on new item ── */
  useEffect(() => {
    cartRef.current?.scrollTo({ top: cartRef.current.scrollHeight, behavior: "smooth" });
  }, [cartData.length]);

  /* ── qty helpers ── */
  const getQty = (id) => quantities[id] || 0;
  const inc = (id) => setQuantities((q) => ({ ...q, [id]: Math.min((q[id] || 0) + 1, 9) }));
  const dec = (id) => setQuantities((q) => ({ ...q, [id]: Math.max((q[id] || 0) - 1, 0) }));

  const handleAddToCart = (item) => {
    const qty = getQty(item._id);
    if (qty === 0) return;
    dispatch(
      addItems({
        id: Date.now(),
        dishId: item._id,
        name: item.name,
        pricePerQuantity: item.price,
        quantity: qty,
        price: item.price * qty,
      })
    );
    setQuantities((q) => ({ ...q, [item._id]: 0 }));
    setMobileTab("order");
  };

  /* ── set customer ── */
  const handleSetCustomer = () => {
    if (!customerName.trim()) {
      enqueueSnackbar("Ingresa el nombre del cliente.", { variant: "warning" });
      return;
    }
    dispatch(
      setCustomer({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        guests: 1,
        orderType,
      })
    );
    setCustomerSet(true);
    setAnonymous(false);
    setShowSuggest(false);
  };

  const handlePickAnonymous = () => {
    dispatch(
      setCustomer({
        name: "Cliente",
        phone: "",
        guests: 1,
        orderType,
      })
    );
    setCustomerSet(true);
    setAnonymous(true);
    setShowSuggest(false);
  };

  const handlePickSuggestion = (c) => {
    setCustomerName(c.name || "");
    setCustomerPhone(c.phone || "");
    setShowSuggest(false);
    dispatch(
      setCustomer({
        name: (c.name || "Cliente").trim(),
        phone: (c.phone || "").trim(),
        guests: 1,
        orderType,
      })
    );
    setCustomerSet(true);
    setAnonymous(false);
  };

  const handleResetCustomer = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerQuery("");
    setOrderType("takeaway");
    setCustomerSet(false);
    setAnonymous(false);
    dispatch(removeCustomer());
    dispatch(removeAllItems());
    setPaymentMethod(null);
    setQuantities({});
  };

  /* ── order mutations ── */
  const buildOrderData = (extra = {}) => ({
    customerDetails: {
      name: customerData.customerName,
      phone: customerData.customerPhone,
      guests: customerData.guests,
    },
    orderStatus: "In Progress",
    bills: { total, tax: 0, totalWithTax: total },
    items: cartData,
    table: customerData.table?.tableId || null,
    orderType: customerData.orderType || "takeaway",
    paymentMethod,
    ...extra,
  });

  const orderMutation = useMutation({
    mutationFn: (data) => addOrder(data),
    onSuccess: (res) => {
      const data = res.data?.data;
      setOrderInfo(data);
      if (data?.table) {
        tableUpdateMutation.mutate({
          status: "Booked",
          orderId: data._id,
          tableId: data.table,
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      }
      enqueueSnackbar("¡Pedido enviado a cocina!", { variant: "success" });
      if (paymentMethod) {
        setShowInvoice(true);
      } else {
        handleResetCustomer();
      }
    },
    onError: () => enqueueSnackbar("No se pudo crear el pedido.", { variant: "error" }),
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (data) => updateTableApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const handlePlaceOrder = async () => {
    if (!customerSet) {
      enqueueSnackbar("Completa los datos del cliente primero.", { variant: "warning" });
      return;
    }
    if (cartData.length === 0) {
      enqueueSnackbar("Agrega al menos un artículo.", { variant: "warning" });
      return;
    }
    if (paymentMethod === "Yape") {
      setQrGenerating(true);
      setQrCountdown(qrEstimateS);
      countdownRef.current = setInterval(
        () => setQrCountdown((c) => (c > 0 ? c - 1 : 0)),
        1000
      );
      try {
        const { data } = await createYapePayment({
          amount: Number(total.toFixed(2)),
          description: `${customerData.customerName || "Cliente"}`,
          expires_in: 600,
        });
        // El orquestador responde inmediato con la ETA real — el modal hace
        // polling y mostrara el QR cuando este listo.
        const p = data.payment;
        if (p?.estimated_seconds) {
          setQrCountdown(Math.ceil(p.estimated_seconds));
          setQrEstimateS(Math.ceil(p.estimated_seconds));
        }
        setYapePayment(p);
      } catch {
        enqueueSnackbar("No se pudo generar el QR.", { variant: "error" });
      } finally {
        clearInterval(countdownRef.current);
        setQrGenerating(false);
      }
      return;
    }
    orderMutation.mutate(buildOrderData());
  };

  /* ──────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────── */
  const isLoadingCatalog = isCatLoading || isDishLoading;

  return (
    <div className="flex flex-col h-full bg-theme-base text-theme-text">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-theme-surface border-b border-theme-border shrink-0">
        <div className="flex items-center gap-2">
          <MdCoffee className="text-theme-brand text-2xl" />
          <span className="text-theme-text font-bold text-lg tracking-tight hidden sm:block">
            Punto de Venta
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-theme-muted font-medium">
          <span className="hidden md:block capitalize">{todayStr()}</span>
          <span className="font-mono text-theme-accent">{time}</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            {staffName}
          </span>
        </div>
      </div>

      {/* ── Mobile tabs ── */}
      <div className="md:hidden flex border-b border-theme-border bg-theme-surface shrink-0">
        <button
          onClick={() => setMobileTab("menu")}
          className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === "menu"
              ? "text-theme-brand border-b-2 border-theme-brand"
              : "text-theme-muted"
          }`}
        >
          <FiGrid size={16} /> Menú
        </button>
        <button
          onClick={() => setMobileTab("order")}
          className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors relative ${
            mobileTab === "order"
              ? "text-theme-brand border-b-2 border-theme-brand"
              : "text-theme-muted"
          }`}
        >
          <FiShoppingCart size={16} /> Pedido
          {cartData.length > 0 && (
            <span className="absolute right-4 top-2 bg-theme-brand text-theme-brand-fg text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartData.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ────── LEFT: catalog ────── */}
        <div
          className={`flex flex-col flex-1 min-w-0 overflow-hidden ${
            mobileTab !== "menu" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Category chips */}
          <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 border-b border-theme-border bg-theme-base">
            {isLoadingCatalog ? (
              <span className="text-xs text-theme-muted animate-pulse">Cargando categorías…</span>
            ) : (
              menus.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedCatId(m.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                    selectedCat?.id === m.id
                      ? "bg-theme-brand text-theme-brand-fg shadow-md scale-[1.03]"
                      : "bg-theme-surface text-theme-muted hover:text-theme-text hover:bg-theme-elevated border border-theme-border"
                  }`}
                >
                  {m.icon && <span>{m.icon}</span>}
                  {m.name}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      selectedCat?.id === m.id
                        ? "bg-white/20 text-white"
                        : "bg-theme-elevated text-theme-muted"
                    }`}
                  >
                    {m.items.length}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-24 md:pb-4">
            {isLoadingCatalog ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-36 rounded-xl bg-theme-surface border border-theme-border animate-pulse"
                  />
                ))}
              </div>
            ) : !selectedCat || selectedCat.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-theme-muted">
                <MdShoppingBag size={40} className="mb-2 opacity-30" />
                <p className="text-sm">Sin productos en esta categoría</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {selectedCat.items.map((item) => {
                  const qty = getQty(item._id);
                  return (
                    <div
                      key={item._id}
                      className="flex flex-col justify-between rounded-xl border border-theme-border bg-theme-card p-3.5 hover:border-theme-brand/50 transition-all shadow-sm"
                    >
                      <div>
                        <p className="text-theme-text font-semibold text-sm leading-snug line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-theme-brand font-bold text-base mt-1">
                          Bs {item.price}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {/* qty stepper */}
                        <div className="flex items-center bg-theme-surface border border-theme-border rounded-lg overflow-hidden flex-1">
                          <button
                            onClick={() => dec(item._id)}
                            disabled={qty === 0}
                            className="w-8 h-8 flex items-center justify-center text-theme-brand font-bold text-lg disabled:opacity-30 hover:bg-theme-elevated transition-colors"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center text-theme-text font-semibold text-sm tabular-nums select-none">
                            {qty}
                          </span>
                          <button
                            onClick={() => inc(item._id)}
                            disabled={qty >= 9}
                            className="w-8 h-8 flex items-center justify-center text-theme-brand font-bold text-lg disabled:opacity-30 hover:bg-theme-elevated transition-colors"
                          >
                            +
                          </button>
                        </div>
                        {/* add button */}
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={qty === 0}
                          className="h-8 w-8 flex items-center justify-center bg-theme-brand text-theme-brand-fg rounded-lg disabled:opacity-30 hover:opacity-90 active:scale-95 transition-all"
                          aria-label="Agregar"
                        >
                          <FiShoppingCart size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ────── RIGHT: order panel ────── */}
        <div
          className={`w-full md:w-[340px] lg:w-[380px] shrink-0 flex flex-col border-l border-theme-border bg-theme-surface overflow-hidden ${
            mobileTab !== "order" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Customer form / info */}
          <div className="px-4 pt-4 pb-3 border-b border-theme-border shrink-0">
            {!customerSet ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-theme-muted uppercase tracking-wider font-semibold">
                    Cliente
                  </p>
                  <button
                    onClick={handlePickAnonymous}
                    className="text-[10px] flex items-center gap-1 text-theme-muted hover:text-theme-brand font-semibold uppercase tracking-wide transition-colors"
                    title="Vender sin registrar cliente"
                  >
                    <MdPersonOff size={12} /> Anónimo
                  </button>
                </div>

                {/* Search bar with suggestions */}
                <div className="relative">
                  <div className="flex items-center gap-2 bg-theme-base border border-theme-border rounded-lg px-3 py-2 focus-within:border-theme-brand/60 transition-colors">
                    <MdSearch className="text-theme-muted shrink-0" size={16} />
                    <input
                      type="text"
                      value={customerQuery}
                      onChange={(e) => {
                        setCustomerQuery(e.target.value);
                        setShowSuggest(true);
                      }}
                      onFocus={() => setShowSuggest(true)}
                      placeholder="Buscar cliente por nombre o teléfono"
                      className="flex-1 bg-transparent text-theme-text text-sm outline-none placeholder-theme-muted/60"
                    />
                    {customerQuery && (
                      <button
                        onClick={() => {
                          setCustomerQuery("");
                          setShowSuggest(false);
                        }}
                        className="text-theme-muted hover:text-theme-text"
                      >
                        <MdClose size={14} />
                      </button>
                    )}
                  </div>

                  {showSuggest && suggestions.length > 0 && (
                    <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg border border-theme-border bg-theme-elevated shadow-xl scrollbar-hide">
                      <div className="px-3 py-1.5 text-[10px] text-theme-muted uppercase tracking-wider font-semibold flex items-center gap-1 border-b border-theme-border bg-theme-surface">
                        <MdHistory size={11} /> Clientes recientes
                      </div>
                      {suggestions.map((c, i) => (
                        <button
                          key={`${c.phone || ""}-${c.name}-${i}`}
                          onClick={() => handlePickSuggestion(c)}
                          className="w-full text-left px-3 py-2 hover:bg-theme-brand/10 transition-colors border-b border-theme-border/50 last:border-0"
                        >
                          <p className="text-theme-text text-sm font-semibold leading-tight">
                            {c.name}
                          </p>
                          <p className="text-theme-muted text-xs mt-0.5 flex items-center gap-2">
                            {c.phone ? <span>📞 {c.phone}</span> : <span className="italic">sin teléfono</span>}
                            <span>·</span>
                            <span>{c.orders} pedido{c.orders !== 1 ? "s" : ""}</span>
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="flex items-center gap-2 bg-theme-base border border-theme-border rounded-lg px-3 py-2">
                  <MdPerson className="text-theme-muted shrink-0" size={16} />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSetCustomer()}
                    placeholder="Nombre del cliente nuevo"
                    className="flex-1 bg-transparent text-theme-text text-sm outline-none placeholder-theme-muted/60"
                  />
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 bg-theme-base border border-theme-border rounded-lg px-3 py-2">
                  <MdPhone className="text-theme-muted shrink-0" size={16} />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Teléfono (opcional)"
                    className="flex-1 bg-transparent text-theme-text text-sm outline-none placeholder-theme-muted/60"
                  />
                </div>

                {/* Order type */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderType("takeaway")}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                      orderType === "takeaway"
                        ? "bg-theme-brand text-theme-brand-fg border-theme-brand"
                        : "bg-theme-base border-theme-border text-theme-muted hover:border-theme-brand/40"
                    }`}
                  >
                    <MdShoppingBag size={14} /> Para llevar
                  </button>
                  <button
                    onClick={() => setOrderType("dine-in")}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                      orderType === "dine-in"
                        ? "bg-theme-brand text-theme-brand-fg border-theme-brand"
                        : "bg-theme-base border-theme-border text-theme-muted hover:border-theme-brand/40"
                    }`}
                  >
                    <MdTableBar size={14} /> Mesa
                  </button>
                </div>

                <button
                  onClick={handleSetCustomer}
                  className="w-full py-2.5 rounded-lg bg-theme-elevated hover:bg-theme-brand hover:text-theme-brand-fg text-theme-text text-sm font-semibold transition-colors border border-theme-border"
                >
                  Confirmar cliente
                </button>
              </div>
            ) : (
              /* Customer confirmed — show summary bar */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${anonymous ? "bg-theme-elevated text-theme-muted" : "bg-theme-brand/20 text-theme-brand"}`}>
                    {anonymous ? <MdPersonOff size={18} /> : (customerData.customerName?.[0]?.toUpperCase() || "?")}
                  </div>
                  <div>
                    <p className="text-theme-text font-semibold text-sm leading-tight">
                      {anonymous ? "Venta sin cliente" : customerData.customerName}
                    </p>
                    <p className="text-theme-muted text-xs">
                      {customerData.orderType === "takeaway" ? "Para llevar" : "Mesa"}
                      {customerData.customerPhone && ` · ${customerData.customerPhone}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResetCustomer}
                  className="text-theme-muted hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
                  title="Cancelar pedido"
                >
                  <MdDeleteOutline size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-2 min-h-0" ref={cartRef}>
            {cartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-theme-muted py-8">
                <FiShoppingCart size={36} className="mb-2 opacity-25" />
                <p className="text-xs text-center">El carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {cartData.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-theme-card rounded-lg px-3 py-2.5 border border-theme-border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-theme-text text-sm font-semibold truncate">
                        {item.name}
                      </p>
                      <p className="text-theme-muted text-xs mt-0.5">
                        x{item.quantity} · Bs {item.pricePerQuantity} c/u
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <p className="text-theme-brand font-bold text-sm">
                        Bs {item.price.toFixed(2)}
                      </p>
                      <button
                        onClick={() => dispatch(removeItem(item.id))}
                        className="text-theme-muted hover:text-red-400 transition-colors p-1 rounded"
                      >
                        <MdDeleteOutline size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals + payment + action */}
          <div className="border-t border-theme-border px-4 pt-3 pb-4 shrink-0 space-y-3 bg-theme-surface">
            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-theme-muted">
                <span>Subtotal ({cartData.length} art.)</span>
                <span>Bs {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-theme-text text-base">
                <span>Total</span>
                <span className="text-theme-brand text-lg">Bs {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p className="text-[10px] text-theme-muted uppercase tracking-widest font-semibold mb-1.5">
                Método de pago (opcional)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod(paymentMethod === "Cash" ? null : "Cash")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                    paymentMethod === "Cash"
                      ? "bg-theme-brand text-theme-brand-fg border-theme-brand shadow-sm"
                      : "bg-theme-base border-theme-border text-theme-muted hover:border-theme-brand/40"
                  }`}
                >
                  Efectivo
                </button>
                <button
                  onClick={() =>
                    setPaymentMethod(paymentMethod === "Yape" ? null : "Yape")
                  }
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                    paymentMethod === "Yape"
                      ? "bg-theme-brand text-theme-brand-fg border-theme-brand shadow-sm"
                      : "bg-theme-base border-theme-border text-theme-muted hover:border-theme-brand/40"
                  }`}
                >
                  <span className="grid h-4 w-4 place-items-center rounded bg-emerald-700 text-white text-[8px] font-bold">
                    MSC
                  </span>
                  Mercantil
                </button>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={orderMutation.isPending || qrGenerating || cartData.length === 0 || !customerSet}
              className="w-full py-3.5 rounded-xl bg-theme-brand hover:opacity-90 active:scale-[0.98] text-theme-brand-fg font-bold text-base shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {qrGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  {qrCountdown > 0 ? `Generando QR… ${qrCountdown}s` : "Generando QR… espera"}
                </span>
              ) : orderMutation.isPending ? (
                <span className="animate-pulse">Enviando…</span>
              ) : (
                <>
                  <MdCheckCircle size={20} />
                  {paymentMethod ? "Realizar Pedido" : "Enviar a Cocina"}
                </>
              )}
            </button>

            {(!customerSet || cartData.length === 0) && (
              <p className="text-center text-[10px] text-theme-muted/70">
                {!customerSet
                  ? "Confirma los datos del cliente para continuar"
                  : "Agrega productos al pedido"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showInvoice && (
        <Invoice
          orderInfo={orderInfo}
          setShowInvoice={(v) => {
            setShowInvoice(v);
            if (!v) handleResetCustomer();
          }}
        />
      )}
      {yapePayment && (
        <YapePayModal
          yapePayment={yapePayment}
          totalBs={total}
          onClose={() => setYapePayment(null)}
          onPaid={(p) => {
            enqueueSnackbar("¡Pago Mercantil recibido!", { variant: "success" });
            setYapePayment(null);
            setTimeout(
              () =>
                orderMutation.mutate(
                  buildOrderData({
                    paymentStatus: "paid",
                    paymentData: {
                      yape_payment_id: p.payment_id,
                      yape_code: p.code,
                      yape_amount: p.amount,
                      yape_paid_at: p.paid_at,
                    },
                  })
                ),
              600
            );
          }}
        />
      )}
    </div>
  );
};

export default CashierPOS;
