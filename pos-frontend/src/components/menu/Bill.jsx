import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTotalPrice } from "../../redux/slices/cartSlice";
import {
  addOrder,
  createBinancePayOrder,
  updateTable,
} from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";
import BinancePayModal from "./BinancePayModal";

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
  const [binanceOrder, setBinanceOrder] = useState(null);

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
    table: customerData.table.tableId,
    paymentMethod: paymentMethod,
    ...extraPaymentData,
  });

  const handlePlaceOrder = async () => {
    if (!customerData.table?.tableId) {
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

    if (paymentMethod === "Binance") {
      try {
        const { data } = await createBinancePayOrder({
          amount: totalPriceWithTax.toFixed(2),
          description: `Pedido mesa ${customerData.table?.tableNo || ""}`,
        });
        setBinanceOrder(data.order);
      } catch (error) {
        console.log(error);
        enqueueSnackbar("No se pudo generar el QR de Binance Pay", {
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

      const tableData = {
        status: "Booked",
        orderId: data._id,
        tableId: data.table,
      };

      tableUpdateMutation.mutate(tableData);

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
          onClick={() => setPaymentMethod(paymentMethod === "Binance" ? undefined : "Binance")}
          className={`px-3 sm:px-4 py-2.5 w-full rounded-lg font-semibold text-sm border flex items-center justify-center gap-2 transition-colors ${
            paymentMethod === "Binance"
              ? "bg-theme-brand text-theme-brand-fg border-theme-brand"
              : "bg-theme-base text-theme-muted border-theme-border hover:border-theme-brand/40"
          }`}
        >
          <span className="grid h-5 w-5 place-items-center rounded bg-yellow-400 text-black text-xs font-bold">
            B
          </span>
          Binance
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

      {binanceOrder && (
        <BinancePayModal
          binanceOrder={binanceOrder}
          totalBs={totalPriceWithTax}
          onClose={() => setBinanceOrder(null)}
          onPaid={(order) => {
            enqueueSnackbar("¡Pago Binance recibido!", { variant: "success" });
            const orderData = buildOrderData({
              paymentData: {
                binance_merchant_trade_no: order.merchantTradeNo,
                binance_prepay_id: order.prepayId,
                binance_amount: order.orderAmount,
                binance_currency: order.currency,
              },
            });
            setBinanceOrder(null);
            setTimeout(() => orderMutation.mutate(orderData), 800);
          }}
        />
      )}
    </>
  );
};

export default Bill;
