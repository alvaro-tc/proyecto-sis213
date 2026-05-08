require("dotenv").config();

const config = Object.freeze({
    port: process.env.PORT || 3000,
    databaseURI: process.env.MONGODB_URI || "mongodb://localhost:27017/pos-db",
    nodeEnv : process.env.NODE_ENV || "development",
    accessTokenSecret: process.env.JWT_SECRET,
    binancePayApiKey: process.env.BINANCE_PAY_API_KEY,
    binancePaySecretKey: process.env.BINANCE_PAY_SECRET_KEY,
    binancePayBaseUrl: process.env.BINANCE_PAY_BASE_URL || "https://bpay.binanceapi.com",
    binancePayCurrency: process.env.BINANCE_PAY_CURRENCY || "USDT",
    binancePayFxRate: Number(process.env.BINANCE_PAY_FX_RATE_BS_TO_USDT || 6.96)
});

module.exports = config;
