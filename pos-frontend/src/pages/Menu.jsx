import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector } from "react-redux";

const Menu = () => {

    useEffect(() => {
      document.title = "POS | Menú"
    }, [])

  const customerData = useSelector((state) => state.customer);

  return (
    <section className="bg-theme-base h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide flex flex-col lg:flex-row gap-3 pb-24">
      {/* Left Div */}
      <div className="flex-1 lg:flex-[3] flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 py-4">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-theme-text text-xl sm:text-2xl font-bold tracking-wider">
              Menú
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-theme-card border border-theme-border rounded-xl px-3 py-2">
            <MdRestaurantMenu className="text-theme-accent text-2xl sm:text-3xl shrink-0" />
            <div className="flex flex-col items-start min-w-0">
              <h1 className="text-sm text-theme-text font-semibold tracking-wide truncate max-w-[160px] sm:max-w-none">
                {customerData.customerName || "Nombre del Cliente"}
              </h1>
              <p className="text-xs text-theme-muted font-medium">
                {customerData.orderType === "takeaway" ? "Para Llevar" : `Mesa : ${customerData.table?.tableNo || "N/A"}`}
              </p>
            </div>
          </div>
        </div>

        <MenuContainer />
      </div>
      {/* Right Div */}
      <div className="flex-1 lg:flex-[1] flex flex-col bg-theme-surface mt-4 mx-3 lg:mx-0 lg:mr-3 rounded-lg pt-2 lg:overflow-hidden">
        {/* Customer Info */}
        <CustomerInfo />
        <hr className="border-theme-border border-t-2" />
        {/* Cart Items */}
        <CartInfo />
        <hr className="border-theme-border border-t-2" />
        {/* Bills */}
        <Bill />
      </div>

      <BottomNav />
    </section>
  );
};

export default Menu;
