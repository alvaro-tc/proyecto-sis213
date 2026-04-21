import React, { useEffect, useRef } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { removeItem } from "../../redux/slices/cartSlice";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart);
  const scrolLRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if(scrolLRef.current){
      scrolLRef.current.scrollTo({
        top: scrolLRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  },[cartData]);

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  }

  return (
    <div className="px-4 py-2 flex flex-col lg:flex-1 h-[400px] lg:h-auto overflow-hidden">
      <h1 className="text-lg text-theme-text font-semibold tracking-wide">
        Detalles de Pedido
      </h1>
      <div className="mt-4 overflow-y-scroll scrollbar-hide flex-1" ref={scrolLRef} >
        {cartData.length === 0 ? (
          <p className="text-theme-muted text-sm flex justify-center items-center h-full min-h-[300px]">Su carrito está vacío. ¡Comience a agregar artículos!</p>
        ) : cartData.map((item) => {
          return (
            <div className="bg-theme-base rounded-lg px-4 py-4 mb-2">
              <div className="flex items-center justify-between">
                <h1 className="text-theme-muted font-semibold tracling-wide text-md">
                  {item.name}
                </h1>
                <p className="text-theme-muted font-semibold">x{item.quantity}</p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <RiDeleteBin2Fill
                    onClick={() => handleRemove(item.id)}
                    className="text-theme-muted cursor-pointer"
                    size={20}
                  />
                  <FaNotesMedical
                    className="text-theme-muted cursor-pointer"
                    size={20}
                  />
                </div>
                <p className="text-theme-text text-md font-bold">Bs {item.price}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartInfo;
