import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaCoffee, FaShoppingBag, FaTrash } from "react-icons/fa";
import { LuLogOut, LuSun, LuMoon, LuMinus, LuPlus, LuMapPin, LuPackage, LuClock } from "react-icons/lu";
import {
  addOrder,
  confirmOrderPayment,
  createYapePayment,
  getCategories,
  getDishes,
  getMyOrders,
  getTables,
  logout,
} from "../https";
import { removeUser } from "../redux/slices/userSlice";
import { useTheme } from "../context/ThemeContext";
import YapePayModal from "../components/menu/YapePayModal";

const STATUS_STEPS = [
  { id: "In Progress", label: "Recibido", icon: LuClock },
  { id: "Preparing", label: "Preparando", icon: FaCoffee },
  { id: "Ready", label: "Listo", icon: FaShoppingBag },
  { id: "Completed", label: "Entregado", icon: LuPackage },
];

const stepIndex = (status) => {
  const i = STATUS_STEPS.findIndex((s) => s.id === status);
  return i >= 0 ? i : 0;
};

const Customer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark, toggleTheme } = useTheme();
  const user = useSelector((s) => s.user);

  useEffect(() => {
    document.title = "Cafeteria 5 | Mi pedido";
  }, []);

  // Data
  const { data: catRes } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: dishRes } = useQuery({ queryKey: ["dishes"], queryFn: getDishes });
  const { data: tableRes } = useQuery({ queryKey: ["tables"], queryFn: getTables });
  const { data: myOrdersRes } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
    refetchInterval: 8000,
  });

  const categories = catRes?.data?.data || [];
  const dishes = dishRes?.data?.data || [];
  const tables = tableRes?.data?.data || [];
  const myOrders = myOrdersRes?.data?.data || [];

  const [selectedCat, setSelectedCat] = useState(null);
  useEffect(() => {
    if (!selectedCat && categories.length) setSelectedCat(categories[0]._id);
  }, [categories, selectedCat]);

  const visibleDishes = useMemo(
    () =>
      dishes.filter(
        (d) => (d.category && (d.category._id || d.category)) === selectedCat
      ),
    [dishes, selectedCat]
  );

  // Cart
  const [cart, setCart] = useState([]); // [{dishId, name, price, qty}]
  const [orderType, setOrderType] = useState("dine-in"); // dine-in | takeaway
  const [tableId, setTableId] = useState("");

  const addToCart = (dish) => {
    setCart((curr) => {
      const i = curr.findIndex((it) => it.dishId === dish._id);
      if (i >= 0) {
        const copy = [...curr];
        copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
        return copy;
      }
      return [...curr, { dishId: dish._id, name: dish.name, price: dish.price, qty: 1 }];
    });
  };
  const dec = (dishId) =>
    setCart((curr) =>
      curr
        .map((it) => (it.dishId === dishId ? { ...it, qty: it.qty - 1 } : it))
        .filter((it) => it.qty > 0)
    );
  const inc = (dishId) =>
    setCart((curr) =>
      curr.map((it) => (it.dishId === dishId ? { ...it, qty: it.qty + 1 } : it))
    );
  const removeFromCart = (dishId) =>
    setCart((curr) => curr.filter((it) => it.dishId !== dishId));

  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {}
    dispatch(removeUser());
    navigate("/auth");
  };

  // Pago Yape + creación de pedido
  const [yapePayment, setYapePayment] = useState(null);
  const [creatingPayment, setCreatingPayment] = useState(false);

  const placeOrderMutation = useMutation({
    mutationFn: (data) => addOrder(data),
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (data) => confirmOrderPayment(data),
  });

  const startCheckout = async () => {
    if (cart.length === 0) {
      enqueueSnackbar("Agrega al menos un producto.", { variant: "warning" });
      return;
    }
    if (orderType === "dine-in" && !tableId) {
      enqueueSnackbar("Selecciona la mesa donde estás sentado.", {
        variant: "warning",
      });
      return;
    }
    setCreatingPayment(true);
    try {
      const desc =
        orderType === "dine-in"
          ? `Mesa ${user.name?.split(" ")[0] || ""}`
          : `Llevar ${user.name?.split(" ")[0] || ""}`;
      const { data } = await createYapePayment({
        amount: Number(total.toFixed(2)),
        description: desc,
        expires_in: 600,
      });
      setYapePayment(data.payment);
    } catch (e) {
      enqueueSnackbar("No se pudo iniciar el pago con Yape.", {
        variant: "error",
      });
    } finally {
      setCreatingPayment(false);
    }
  };

  const onPaid = async (p) => {
    try {
      const orderPayload = {
        customerDetails: {
          name: user.name,
          phone: String(user.phone || "00000000"),
          guests: 1,
        },
        orderStatus: "In Progress",
        bills: { total, tax: 0, totalWithTax: total },
        items: cart.map((it) => ({
          id: `${Date.now()}-${it.dishId}`,
          dishId: it.dishId,
          name: it.name,
          pricePerQuantity: it.price,
          quantity: it.qty,
          price: it.price * it.qty,
        })),
        table: orderType === "dine-in" ? tableId : null,
        orderType,
        paymentMethod: "Yape",
        paymentStatus: "pending",
        paymentData: {
          yape_payment_id: p.payment_id,
          yape_code: p.code,
          yape_amount: p.amount,
          yape_paid_at: p.paid_at,
        },
      };
      const orderRes = await placeOrderMutation.mutateAsync(orderPayload);
      const created = orderRes.data?.data;

      const confirm = await confirmPaymentMutation.mutateAsync({
        orderId: created._id,
        yapePaymentId: p.payment_id,
      });

      if (confirm.data?.paid) {
        enqueueSnackbar("¡Pago confirmado! Tu pedido está en preparación.", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(
          "Pedido recibido. Esperando confirmación de pago…",
          { variant: "info" }
        );
      }

      setCart([]);
      setTableId("");
      setYapePayment(null);
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    } catch (err) {
      enqueueSnackbar(
        "Hubo un problema registrando el pedido. Contacta al personal.",
        { variant: "error" }
      );
    }
  };

  const activeOrders = myOrders.filter(
    (o) => o.orderStatus !== "Completed" && o.orderStatus !== "Cancelled"
  );
  const pastOrders = myOrders.filter(
    (o) => o.orderStatus === "Completed" || o.orderStatus === "Cancelled"
  );

  return (
    <div className="min-h-screen bg-theme-base text-theme-text">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-theme-border bg-theme-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-theme-brand-fg shadow"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-brand), var(--color-accent))",
              }}
            >
              <FaCoffee />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-theme-muted">
                Cafeteria 5
              </p>
              <p className="text-sm font-semibold">Hola, {user.name?.split(" ")[0] || "cliente"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="cambiar tema"
              className="grid h-9 w-9 place-items-center rounded-full border border-theme-border bg-theme-base/60 text-theme-text hover:bg-theme-elevated"
            >
              {isDark ? <LuSun size={16} /> : <LuMoon size={16} />}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-base/60 px-3 py-1.5 text-xs font-medium text-theme-muted hover:bg-theme-elevated hover:text-theme-text"
            >
              <LuLogOut size={14} />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-10">
        {/* Menu */}
        <section className="lg:col-span-8">
          <ActiveOrdersTracker orders={activeOrders} />

          <div className="mb-4 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Nuestro menú
              </h1>
              <p className="mt-1 text-sm text-theme-muted">
                Elige tus favoritos y arma tu pedido. ✨
              </p>
            </div>
          </div>

          {/* Categorías */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((c) => {
              const active = c._id === selectedCat;
              return (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setSelectedCat(c._id)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-theme-brand bg-theme-brand text-theme-brand-fg"
                      : "border-theme-border bg-theme-card text-theme-muted hover:text-theme-text"
                  }`}
                >
                  {c.icon} {c.name}
                </button>
              );
            })}
          </div>

          {/* Platos */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleDishes.length === 0 && (
              <p className="col-span-full text-sm text-theme-muted">
                No hay productos en esta categoría.
              </p>
            )}
            {visibleDishes.map((d) => (
              <article
                key={d._id}
                className="flex flex-col rounded-2xl border border-theme-border bg-theme-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex-1">
                  <h3 className="text-base font-semibold leading-snug">{d.name}</h3>
                  <p className="mt-1 text-lg font-bold text-theme-brand">
                    Bs {Number(d.price).toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToCart(d)}
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-theme-brand px-3 py-2 text-sm font-semibold text-theme-brand-fg hover:opacity-90"
                >
                  <LuPlus size={16} /> Agregar
                </button>
              </article>
            ))}
          </div>

          {pastOrders.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3 text-lg font-semibold">Historial</h2>
              <ul className="space-y-2">
                {pastOrders.slice(0, 8).map((o) => (
                  <li
                    key={o._id}
                    className="flex items-center justify-between rounded-xl border border-theme-border bg-theme-card px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {o.orderType === "takeaway" ? "Para llevar" : `Mesa ${o.table?.tableNo ?? "—"}`}
                      </p>
                      <p className="text-xs text-theme-muted">
                        {new Date(o.orderDate).toLocaleString("es-BO")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        Bs {Number(o.bills?.totalWithTax || 0).toFixed(2)}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          o.orderStatus === "Completed"
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                      >
                        {o.orderStatus === "Completed" ? "Entregado" : "Cancelado"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>

        {/* Cart */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-theme-border bg-theme-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Tu pedido</h2>

            {/* Mode toggle */}
            <div className="mt-4 grid grid-cols-2 rounded-xl border border-theme-border bg-theme-base p-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => setOrderType("dine-in")}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 transition-colors ${
                  orderType === "dine-in"
                    ? "bg-theme-brand text-theme-brand-fg shadow-sm"
                    : "text-theme-muted hover:text-theme-text"
                }`}
              >
                <LuMapPin size={14} /> En mesa
              </button>
              <button
                type="button"
                onClick={() => setOrderType("takeaway")}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 transition-colors ${
                  orderType === "takeaway"
                    ? "bg-theme-brand text-theme-brand-fg shadow-sm"
                    : "text-theme-muted hover:text-theme-text"
                }`}
              >
                <LuPackage size={14} /> Para llevar
              </button>
            </div>

            {orderType === "dine-in" && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-theme-muted">
                  Mesa donde estás sentado
                </label>
                <select
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-theme-border bg-theme-base px-3 py-2 text-sm text-theme-text focus:border-theme-brand focus:outline-none"
                >
                  <option value="">Selecciona una mesa…</option>
                  {tables.map((t) => (
                    <option key={t._id} value={t._id}>
                      Mesa {t.tableNo} ({t.seats} asientos)
                      {t.status === "Booked" ? " · ocupada" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {orderType === "takeaway" && (
              <p className="mt-3 rounded-lg border border-theme-border bg-theme-base/60 px-3 py-2 text-xs text-theme-muted">
                Te avisaremos cuando esté listo. Pasa a recogerlo a la barra. ☕
              </p>
            )}

            {/* Items */}
            <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {cart.length === 0 && (
                <p className="rounded-lg border border-dashed border-theme-border px-4 py-6 text-center text-sm text-theme-muted">
                  Tu carrito está vacío. Agrega algo del menú.
                </p>
              )}
              {cart.map((it) => (
                <div
                  key={it.dishId}
                  className="flex items-center gap-3 rounded-lg border border-theme-border bg-theme-base px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-theme-muted">
                      Bs {it.price.toFixed(2)} · Subtotal Bs {(it.price * it.qty).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => dec(it.dishId)}
                      className="grid h-7 w-7 place-items-center rounded-md border border-theme-border text-theme-muted hover:text-theme-text"
                      aria-label="quitar"
                    >
                      <LuMinus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold tabular-nums">
                      {it.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => inc(it.dishId)}
                      className="grid h-7 w-7 place-items-center rounded-md border border-theme-border text-theme-muted hover:text-theme-text"
                      aria-label="agregar"
                    >
                      <LuPlus size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(it.dishId)}
                      className="ml-1 grid h-7 w-7 place-items-center rounded-md text-red-500 hover:bg-red-500/10"
                      aria-label="eliminar"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-theme-border pt-3 text-sm">
              <span className="text-theme-muted">Total</span>
              <span className="text-lg font-bold">Bs {total.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={startCheckout}
              disabled={creatingPayment || cart.length === 0}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-theme-brand px-4 py-3 text-base font-semibold text-theme-brand-fg shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="grid h-6 w-6 place-items-center rounded bg-violet-600 text-xs font-bold text-white">
                Y
              </span>
              {creatingPayment ? "Generando QR…" : "Pagar con Yape"}
            </button>
            <p className="mt-2 text-center text-[11px] text-theme-muted">
              Pago 100% online · QR Yape Bolivia
            </p>
          </div>
        </aside>
      </main>

      {yapePayment && (
        <YapePayModal
          yapePayment={yapePayment}
          totalBs={total}
          onClose={() => setYapePayment(null)}
          onPaid={onPaid}
        />
      )}
    </div>
  );
};

const ActiveOrdersTracker = ({ orders }) => {
  if (!orders || orders.length === 0) return null;
  return (
    <section className="mb-8 space-y-3">
      <h2 className="text-lg font-semibold">Tus pedidos activos</h2>
      {orders.map((o) => {
        const idx = stepIndex(o.orderStatus);
        const paid = o.paymentStatus === "paid";
        return (
          <div
            key={o._id}
            className="rounded-2xl border border-theme-border bg-theme-card p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-theme-muted">
                  Pedido · {new Date(o.orderDate).toLocaleString("es-BO")}
                </p>
                <p className="mt-1 font-medium">
                  {o.orderType === "takeaway"
                    ? "Para llevar"
                    : `Mesa ${o.table?.tableNo ?? "—"}`}{" "}
                  · Bs {Number(o.bills?.totalWithTax || 0).toFixed(2)}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  paid
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-amber-500/15 text-amber-500"
                }`}
              >
                {paid ? "Pagado ✓" : "Pago pendiente"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {STATUS_STEPS.map((s, i) => {
                const reached = i <= idx;
                const Icon = s.icon;
                return (
                  <div key={s.id} className="flex flex-col items-center text-center">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-full border-2 transition-colors ${
                        reached
                          ? "border-theme-brand bg-theme-brand text-theme-brand-fg"
                          : "border-theme-border bg-theme-base text-theme-muted"
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <span
                      className={`mt-1.5 text-[11px] font-medium ${
                        reached ? "text-theme-text" : "text-theme-muted"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <ul className="mt-4 divide-y divide-theme-border text-sm">
              {(o.items || []).map((it, idx2) => (
                <li
                  key={`${it.dishId || it.name}-${idx2}`}
                  className="flex justify-between py-1.5"
                >
                  <span className="text-theme-muted">
                    {it.quantity}× {it.name}
                  </span>
                  <span className="font-medium">
                    Bs {Number(it.price).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
};

export default Customer;
