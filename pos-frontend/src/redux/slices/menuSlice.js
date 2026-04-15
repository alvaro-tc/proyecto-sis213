import { createSlice } from "@reduxjs/toolkit";
import { menus } from "../../constants/index";

const initialState = menus;

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const { categoryId, product } = action.payload;
      const categoryIndex = state.findIndex((cat) => cat.id === categoryId);
      if (categoryIndex !== -1) {
        state[categoryIndex].items.push(product);
      }
    },
  },
});

export const { addProduct } = menuSlice.actions;
export default menuSlice.reducer;
