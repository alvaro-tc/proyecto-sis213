import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlice";
import {
  addOrder,
  createBinancePayOrder,
  updateTable,
} from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";
import BinancePayModal from "./BinancePayModal";

const Bill = () => {
  const dispatch = useDispatch();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

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
    if (!paymentMethod) {
      enqueueSnackbar("¡Por favor seleccione un método de pago!", {
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
      console.log(data);

      setOrderInfo(data);

      // Update Table
      const tableData = {
        status: "Booked",
        orderId: data._id,
        tableId: data.table,
      };

      setTimeout(() => {
        tableUpdateMutation.mutate(tableData);
      }, 1500);

      enqueueSnackbar("¡Pedido Realizado!", {
        variant: "success",
      });
      setShowInvoice(true);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),
    onSuccess: (resData) => {
      console.log(resData);
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },
    onError: (error) => {
      console.log(error);
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
        <p className="text-xs text-theme-muted font-medium mt-2">Impuesto(5.25%)</p>
        <h1 className="text-theme-text text-md font-bold">Bs {tax.toFixed(2)}</h1>
      </div>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-theme-muted font-medium mt-2">
          Total con Impuesto
        </p>
        <h1 className="text-theme-text text-md font-bold">
          Bs {totalPriceWithTax.toFixed(2)}
        </h1>
      </div>
      <div className="flex items-center gap-3 px-5 mt-4">
        <button
          onClick={() => setPaymentMethod("Cash")}
          className={`bg-theme-base px-4 py-3 w-full rounded-lg text-theme-muted font-semibold ${
            paymentMethod === "Cash" ? "bg-theme-elevated" : ""
          }`}
        >
          Efectivo
        </button>
        <button
          onClick={() => setPaymentMethod("Binance")}
          className={`bg-theme-base px-4 py-3 w-full rounded-lg text-theme-muted font-semibold flex items-center justify-center gap-2 ${
            paymentMethod === "Binance" ? "bg-theme-elevated" : ""
          }`}
        >
          <span className="grid h-5 w-5 place-items-center rounded bg-yellow-400 text-black text-xs font-bold">
            B
          </span>
          Binance
        </button>
      </div>

      <div className="flex items-center gap-3 px-5 mt-4">
        <button className="bg-[#025cca] px-4 py-3 w-full rounded-lg text-white font-semibold text-lg">
          Imprimir Recibo
        </button>
        <button
          onClick={handlePlaceOrder}
          className="bg-theme-accent px-4 py-3 w-full rounded-lg text-[#1f1f1f] font-semibold text-lg"
        >
          Realizar Pedido
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
