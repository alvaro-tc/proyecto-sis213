import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTotalPrice } from "../../redux/slices/cartSlice";
import {
  addOrder,
  createYapePayment,
  sendYapeQrToWhatsApp,
  updateTable,
} from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";
import YapePayModal from "./YapePayModal";

const Bill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const tax = 0;
  const totalPriceWithTax = total;

  const [paymentMethod, setPaymentMethod] = useState();
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState();
  const [yapePayment, setYapePayment] = useState(null);

  const buildOrderData = (extraPaymentData = {}) => ({
    customerDetails: {
      name: customerData.customerName,
      phone: customerData.customerPhone,
      guests: customerData.guests,
    },
    orderStatus: "In Progress",
    bills: {
      total: total,
      tax: tax,
      totalWithTax: totalPriceWithTax,
    },
    items: cartData,
    table: customerData.table?.tableId || null,
    orderType: customerData.orderType || "dine-in",
    paymentMethod: paymentMethod,
    ...extraPaymentData,
  });

  const handlePlaceOrder = async () => {
    if (customerData.orderType !== "takeaway" && !customerData.table?.tableId) {
      enqueueSnackbar("Selecciona una mesa antes de enviar el pedido.", {
        variant: "warning",
      });
      return;
    }
    if (cartData.length === 0) {
      enqueueSnackbar("Agrega al menos un artículo al pedido.", {
        variant: "warning",
      });
      return;
    }

    if (paymentMethod === "Yape") {
      try {
        const { data } = await createYapePayment({
          amount: Number(totalPriceWithTax.toFixed(2)),
          description: `Mesa ${customerData.table?.tableNo || "T"}`,
          expires_in: 600,
        });
        setYapePayment(data.payment);

        // Enviar QR al WhatsApp del cliente antes de confirmar el pedido
        if (customerData.customerPhone && data.payment?.payment_id) {
          sendYapeQrToWhatsApp(data.payment.payment_id, {
            phone: customerData.customerPhone,
            customerName: customerData.customerName || undefined,
          })
            .then(() => {
              enqueueSnackbar("QR de Yape enviado a tu WhatsApp", { variant: "info" });
            })
            .catch(() => {
              enqueueSnackbar("QR listo, pero no se pudo enviar por WhatsApp", {
                variant: "warning",
              });
            });
        }
      } catch (error) {
        console.log(error);
        enqueueSnackbar("No se pudo generar el QR de Yape", {
          variant: "error",
        });
      }
      return;
    }

    orderMutation.mutate(buildOrderData());
  };

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;
      setOrderInfo(data);

      if (data.table) {
        const tableData = {
          status: "Booked",
          orderId: data._id,
          tableId: data.table,
        };
        tableUpdateMutation.mutate(tableData);
      } else {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      }

      enqueueSnackbar("¡Pedido enviado a cocina!", { variant: "success" });

      if (paymentMethod) {
        setShowInvoice(true);
      } else {
        dispatch(removeCustomer());
        dispatch(removeAllItems());
        navigate("/home");
      }
    },
    onError: () => {
      enqueueSnackbar("No se pudo crear el pedido. Intenta de nuevo.", {
        variant: "error",
      });
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      enqueueSnackbar("Pedido creado pero no se pudo actualizar la mesa.", {
        variant: "warning",
      });
    },
  });

  return (
    <>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-theme-muted font-medium mt-2">
          Artículos({cartData.length})
        </p>
        <h1 className="text-theme-text text-md font-bold">
          Bs {total.toFixed(2)}
        </h1>
      </div>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-theme-muted font-medium mt-2">
          Total
        </p>
        <h1 className="text-theme-text text-md font-bold">
          Bs {totalPriceWithTax.toFixed(2)}
        </h1>
      </div>
      <p className="text-[11px] text-theme-muted px-5 mt-4 uppercase tracking-wider font-semibold">
        Pago (opcional — se puede cobrar al entregar)
      </p>
      <div className="flex items-center gap-2 sm:gap-3 px-5 mt-2">
        <button
          onClick={() => setPaymentMethod(paymentMethod === "Cash" ? undefined : "Cash")}
          className={`px-3 sm:px-4 py-2.5 w-full rounded-lg font-semibold text-sm border transition-colors ${
            paymentMethod === "Cash"
              ? "bg-theme-brand text-theme-brand-fg border-theme-brand"
              : "bg-theme-base text-theme-muted border-theme-border hover:border-theme-brand/40"
          }`}
        >
          Efectivo
        </button>
        <button
          onClick={() => setPaymentMethod(paymentMethod === "Yape" ? undefined : "Yape")}
          className={`px-3 sm:px-4 py-2.5 w-full rounded-lg font-semibold text-sm border flex items-center justify-center gap-2 transition-colors ${
            paymentMethod === "Yape"
              ? "bg-theme-brand text-theme-brand-fg border-theme-brand"
              : "bg-theme-base text-theme-muted border-theme-border hover:border-theme-brand/40"
          }`}
        >
          <span className="grid h-5 w-5 place-items-center rounded bg-violet-600 text-white text-xs font-bold">
            Y
          </span>
          Yape
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 px-5 mt-4">
        <button
          onClick={handlePlaceOrder}
          disabled={orderMutation.isPending || cartData.length === 0}
          className="bg-theme-brand hover:opacity-90 px-4 py-3 w-full rounded-lg text-theme-brand-fg font-bold text-base sm:text-lg shadow-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {orderMutation.isPending
            ? "Enviando…"
            : paymentMethod
            ? "Realizar Pedido"
            : "Enviar a Cocina"}
        </button>
      </div>

      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}

      {yapePayment && (
        <YapePayModal
          yapePayment={yapePayment}
          onClose={() => setYapePayment(null)}
          onPaid={(p) => {
            enqueueSnackbar("¡Pago Yape recibido!", { variant: "success" });
            const orderData = buildOrderData({
              paymentStatus: "paid",
              paymentData: {
                yape_payment_id: p.payment_id,
                yape_code: p.code,
                yape_amount: p.amount,
                yape_paid_at: p.paid_at,
              },
            });
            setYapePayment(null);
            setTimeout(() => orderMutation.mutate(orderData), 600);
          }}
        />
      )}
    </>
  );
};

export default Bill;
