import { axiosWrapper } from "./axiosWrapper";

// API Endpoints

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user");
export const logout = () => axiosWrapper.post("/api/user/logout");
export const getUsers = () => axiosWrapper.get("/api/user/all");
export const deleteUser = (userId) => axiosWrapper.delete(`/api/user/${userId}`);

// Table Endpoints
export const addTable = (data) => axiosWrapper.post("/api/table/", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);
export const deleteTable = (tableId) => axiosWrapper.delete(`/api/table/${tableId}`);

// Category Endpoints
export const addCategory = (data) => axiosWrapper.post("/api/category/", data);
export const getCategories = () => axiosWrapper.get("/api/category");
export const updateCategory = ({ categoryId, ...data }) => axiosWrapper.put(`/api/category/${categoryId}`, data);
export const deleteCategory = (categoryId) => axiosWrapper.delete(`/api/category/${categoryId}`);

// Dish Endpoints
export const addDish = (data) => axiosWrapper.post("/api/dish/", data);
export const getDishes = () => axiosWrapper.get("/api/dish");
export const updateDish = ({ dishId, ...data }) => axiosWrapper.put(`/api/dish/${dishId}`, data);
export const deleteDish = (dishId) => axiosWrapper.delete(`/api/dish/${dishId}`);

// Metric Endpoints
export const getMetrics = () => axiosWrapper.get("/api/metric");

// Payment Endpoints (orquestador api_generador_qr — MSC + ZAS con failover).
// Los nombres "Yape" se mantienen por compat historica.
export const getMscHealth = () =>
  axiosWrapper.get("/api/payment/qr/health");
export const getQrHealth = () =>
  axiosWrapper.get("/api/payment/qr/health");
export const createYapePayment = (data) =>
  axiosWrapper.post("/api/payment/qr/create", data);
export const queryYapePayment = (paymentId) =>
  axiosWrapper.get(`/api/payment/qr/${paymentId}`);
export const cancelYapePayment = (paymentId) =>
  axiosWrapper.post(`/api/payment/qr/${paymentId}/cancel`);
export const sendYapeQrToWhatsApp = (paymentId, data) =>
  axiosWrapper.post(`/api/payment/qr/${paymentId}/send-whatsapp`, data);

// Insumo Endpoints
export const addInsumo = (data) => axiosWrapper.post("/api/insumo/", data);
export const getInsumos = () => axiosWrapper.get("/api/insumo");
export const getMetricasInsumos = () => axiosWrapper.get("/api/insumo/metricas");
export const updateInsumo = ({ insumoId, ...data }) => axiosWrapper.put(`/api/insumo/${insumoId}`, data);
export const deleteInsumo = (insumoId) => axiosWrapper.delete(`/api/insumo/${insumoId}`);
export const registrarConsumo = ({ insumoId, ...data }) => axiosWrapper.post(`/api/insumo/${insumoId}/consumo`, data);
export const reponerStock = ({ insumoId, cantidad }) => axiosWrapper.post(`/api/insumo/${insumoId}/reponer`, { cantidad });

// Order Endpoints
export const addOrder = (data) => axiosWrapper.post("/api/order/", data);
export const getOrders = () => axiosWrapper.get("/api/order");
export const getMyOrders = () => axiosWrapper.get("/api/order/my");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });
export const confirmOrderPayment = ({ orderId, yapePaymentId }) =>
  axiosWrapper.post(`/api/order/${orderId}/confirm-payment`, { yapePaymentId });
export const searchOrderCustomers = (q = "") =>
  axiosWrapper.get(`/api/order/customers/search`, { params: { q } });

// WhatsApp Endpoints
export const getWhatsappStatus = () => axiosWrapper.get("/api/whatsapp/status");
export const getWhatsappQr = () => axiosWrapper.get("/api/whatsapp/qr");
export const sendWhatsappTest = (data) => axiosWrapper.post("/api/whatsapp/test", data);
export const whatsappLogout = () => axiosWrapper.post("/api/whatsapp/logout");
export const whatsappReset = () => axiosWrapper.post("/api/whatsapp/reset");
export const whatsappSwitchProvider = (provider) => axiosWrapper.post("/api/whatsapp/switch-provider", { provider });
export const getWhatsappDiag = (secret) => axiosWrapper.get(`/api/whatsapp/diag?secret=${encodeURIComponent(secret)}`);

// Groq Endpoints
export const getGroqStatus = () => axiosWrapper.get("/api/groq/status");
export const getGroqPrompt = () => axiosWrapper.get("/api/groq/prompt");
export const saveGroqPrompt = (data) =>
  axiosWrapper.put("/api/groq/prompt", typeof data === "string" ? { prompt: data } : data);
export const resetGroqPrompt = () => axiosWrapper.post("/api/groq/prompt/reset");
export const chatGroq = (data) => axiosWrapper.post("/api/groq/chat", data);
export const clearGroqHistory = (data) => axiosWrapper.post("/api/groq/history/clear", data || {});
