const createHttpError = require("http-errors");
const config = require("../config/config");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");

// ───────── Binance Pay ─────────
// Doc: https://developers.binance.com/docs/binance-pay/api-order-create-v3

const buildBinanceHeaders = (bodyString) => {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex").slice(0, 32);
  const payload = `${timestamp}\n${nonce}\n${bodyString}\n`;
  const signature = crypto
    .createHmac("sha512", config.binancePaySecretKey || "")
    .update(payload)
    .digest("hex")
    .toUpperCase();

  return {
    "Content-Type": "application/json",
    "BinancePay-Timestamp": timestamp,
    "BinancePay-Nonce": nonce,
    "BinancePay-Certificate-SN": config.binancePayApiKey || "",
    "BinancePay-Signature": signature,
  };
};

const createBinanceOrder = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    if (!amount || Number(amount) <= 0) {
      return next(createHttpError(400, "Monto inválido"));
    }

    // Convertir Bs → USDT (configurable). Binance Pay no acepta BOB.
    const usdtAmount = Number(
      (Number(amount) / config.binancePayFxRate).toFixed(2)
    );

    const merchantTradeNo = `C5${Date.now()}${crypto
      .randomBytes(4)
      .toString("hex")}`.slice(0, 32);

    const body = {
      env: { terminalType: "WEB" },
      merchantTradeNo,
      orderAmount: usdtAmount,
      currency: config.binancePayCurrency,
      goods: {
        goodsType: "02",
        goodsCategory: "Z000",
        referenceGoodsId: merchantTradeNo,
        goodsName: description || "Pedido Cafeteria 5",
      },
    };

    // Modo desarrollo: si no hay credenciales, devolvemos un QR simulado
    // (apunta a la billetera Binance del comercio mediante un identificador
    // genérico) para poder probar el flujo end-to-end sin claves reales.
    if (!config.binancePayApiKey || !config.binancePaySecretKey) {
      const fakeQrPayload = `binancepay://demo?merchantTradeNo=${merchantTradeNo}&amount=${usdtAmount}&currency=USDT`;
      const qrcodeLink = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
        fakeQrPayload
      )}`;
      return res.status(200).json({
        success: true,
        mock: true,
        order: {
          merchantTradeNo,
          orderAmount: usdtAmount,
          currency: "USDT",
          qrContent: fakeQrPayload,
          qrcodeLink,
          checkoutUrl: qrcodeLink,
          prepayId: `MOCK_${merchantTradeNo}`,
          expireTime: Date.now() + 10 * 60 * 1000,
        },
      });
    }

    const bodyString = JSON.stringify(body);
    const url = `${config.binancePayBaseUrl}/binancepay/openapi/v3/order`;
    const response = await fetch(url, {
      method: "POST",
      headers: buildBinanceHeaders(bodyString),
      body: bodyString,
    });
    const data = await response.json();

    if (data.status !== "SUCCESS") {
      console.error("Binance Pay error:", data);
      return next(
        createHttpError(502, data.errorMessage || "Binance Pay rechazó la orden")
      );
    }

    return res.status(200).json({
      success: true,
      order: {
        merchantTradeNo,
        orderAmount: usdtAmount,
        currency: "USDT",
        qrContent: data.data.qrContent,
        qrcodeLink: data.data.qrcodeLink,
        checkoutUrl: data.data.checkoutUrl,
        prepayId: data.data.prepayId,
        expireTime: data.data.expireTime,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const queryBinanceOrder = async (req, res, next) => {
  try {
    const { merchantTradeNo } = req.body;
    if (!merchantTradeNo) {
      return next(createHttpError(400, "merchantTradeNo requerido"));
    }

    if (!config.binancePayApiKey || !config.binancePaySecretKey) {
      // Mock: marca como pagada después de 5 segundos del tradeNo timestamp
      const ts = Number(merchantTradeNo.slice(2, 15));
      const paid = !Number.isNaN(ts) && Date.now() - ts > 5000;
      return res.json({
        success: true,
        mock: true,
        status: paid ? "PAID" : "INITIAL",
      });
    }

    const body = JSON.stringify({ merchantTradeNo });
    const url = `${config.binancePayBaseUrl}/binancepay/openapi/v2/order/query`;
    const response = await fetch(url, {
      method: "POST",
      headers: buildBinanceHeaders(body),
      body,
    });
    const data = await response.json();
    return res.json({
      success: data.status === "SUCCESS",
      status: data.data?.status || "UNKNOWN",
      raw: data,
    });
  } catch (error) {
    next(error);
  }
};

const binanceWebhook = async (req, res, next) => {
  try {
    // En producción: verificar firma con la clave pública de Binance Pay.
    const event = req.body;
    if (event && event.bizType === "PAY" && event.bizStatus === "PAY_SUCCESS") {
      const data =
        typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      await new Payment({
        paymentId: data.transactionId || data.merchantTradeNo,
        orderId: data.merchantTradeNo,
        amount: data.totalFee || data.orderAmount,
        currency: data.currency,
        status: "captured",
        method: "binance_pay",
        createdAt: new Date(),
      }).save();
    }
    res.json({ returnCode: "SUCCESS", returnMessage: null });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBinanceOrder,
  queryBinanceOrder,
  binanceWebhook,
};
