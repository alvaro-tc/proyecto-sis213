import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { addItems } from "../../redux/slices/cartSlice";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getDishes } from "../../https";


const MenuContainer = () => {
  const { data: catRes, isLoading: isCatLoading } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: dishRes, isLoading: isDishLoading } = useQuery({ queryKey: ["dishes"], queryFn: getDishes });

  const categories = catRes?.data?.data || [];
  const dishes = dishRes?.data?.data || [];

  const menus = categories.map(c => ({
    id: c._id,
    name: c.name,
    icon: c.icon,
    bgColor: c.bgColor,
    items: dishes.filter(d => d.category && (d.category._id === c._id || d.category === c._id))
  }));

  const [selected, setSelected] = useState(menus[0] || null);
  const [itemCount, setItemCount] = useState(0);
  const [itemId, setItemId] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    // Keep selected up to date if menus changes
    if (menus.length > 0 && !selected) {
      setSelected(menus[0]);
    } else if (selected) {
      const updatedSelected = menus.find((m) => m.id === selected.id) || menus[0];
      if (updatedSelected && updatedSelected.id !== selected.id) {
          setSelected(updatedSelected);
      }
    }
  }, [menus, selected]);

  const increment = (id) => {
    setItemId(id);
    if (itemCount >= 4) return;
    setItemCount((prev) => prev + 1);
  };

  const decrement = (id) => {
    setItemId(id);
    if (itemCount <= 0) return;
    setItemCount((prev) => prev - 1);
  };

  const handleAddToCart = (item) => {
    if(itemCount === 0) return;

    const {_id, name, price} = item;
    const newObj = { id: new Date(), dishId: _id, name, pricePerQuantity: price, quantity: itemCount, price: price * itemCount };

    dispatch(addItems(newObj));
    setItemCount(0);
  }


  if(isCatLoading || isDishLoading) return <div className="text-theme-text flex justify-center py-10">Cargando menú...</div>;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:px-10 py-4 w-full">
        {menus.map((menu) => {
          return (
            <div
              key={menu.id}
              className="flex flex-col items-start justify-between p-4 rounded-lg h-[100px] cursor-pointer"
              style={{ backgroundColor: menu.bgColor }}
              onClick={() => {
                setSelected(menu);
                setItemId(0);
                setItemCount(0);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <h1 className="text-white text-lg font-semibold">
                  {menu.icon} {menu.name}
                </h1>
                {selected?.id === menu.id && (
                  <GrRadialSelected className="text-white" size={20} />
                )}
              </div>
              <p className="text-white/70 text-sm font-semibold">
                {menu.items.length} Artículos
              </p>
            </div>
          );
        })}
      </div>

      <hr className="border-theme-border border-t-2 mt-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-10 py-4 w-full">
        {selected?.items?.map((item) => {
          const currentQty = itemId === item._id ? itemCount : 0;
          return (
            <div
              key={item._id}
              className="flex flex-col p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-brand/40 transition-colors shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <h1 className="text-theme-text text-base sm:text-lg font-semibold leading-snug line-clamp-2">
                  {item.name}
                </h1>
                <p className="text-theme-brand text-lg sm:text-xl font-bold mt-1">
                  Bs {item.price}
                </p>
              </div>

              <div className="mt-3 flex items-stretch gap-2">
                <div className="flex items-center justify-between bg-theme-base border border-theme-border rounded-lg px-2 flex-1 min-w-0">
                  <button
                    onClick={() => decrement(item._id)}
                    aria-label="Disminuir"
                    className="text-theme-brand text-2xl font-bold w-8 h-10 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30"
                    disabled={currentQty === 0}
                  >
                    &minus;
                  </button>
                  <span className="text-theme-text font-semibold tabular-nums select-none">
                    {currentQty}
                  </span>
                  <button
                    onClick={() => increment(item._id)}
                    aria-label="Aumentar"
                    className="text-theme-brand text-2xl font-bold w-8 h-10 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30"
                    disabled={currentQty >= 4}
                  >
                    &#43;
                  </button>
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={currentQty === 0}
                  className="flex items-center justify-center gap-2 bg-theme-brand text-theme-brand-fg font-semibold rounded-lg px-3 sm:px-4 h-10 shrink-0 hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Agregar al carrito"
                >
                  <FaShoppingCart size={16} />
                  <span className="hidden sm:inline text-sm">Agregar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MenuContainer;
