import { configureStore } from "@reduxjs/toolkit";
import customerSlice from "./slices/customerSlice"
import cartSlice from "./slices/cartSlice";
import userSlice from "./slices/userSlice";
import menuSlice from "./slices/menuSlice";

const store = configureStore({
    reducer: {
        customer: customerSlice,
        cart : cartSlice,
        user : userSlice,
        menu : menuSlice
    },

    devTools: import.meta.env.NODE_ENV !== "production",
});

export default store;
