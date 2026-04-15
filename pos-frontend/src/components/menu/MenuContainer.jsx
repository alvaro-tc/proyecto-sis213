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

    const {name, price} = item;
    const newObj = { id: new Date(), name, pricePerQuantity: price, quantity: itemCount, price: price * itemCount };

    dispatch(addItems(newObj));
    setItemCount(0);
  }


  if(isCatLoading || isDishLoading) return <div className="text-white flex justify-center py-10">Cargando menú...</div>;

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
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
                  {menu.icon} {menu.name}
                </h1>
                {selected?.id === menu.id && (
                  <GrRadialSelected className="text-white" size={20} />
                )}
              </div>
              <p className="text-[#ababab] text-sm font-semibold">
                {menu.items.length} Artículos
              </p>
            </div>
          );
        })}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:px-10 py-4 w-full">
        {selected?.items?.map((item) => {
          return (
            <div
              key={item._id}
              className="flex flex-col items-start justify-between p-4 rounded-lg h-[150px] cursor-pointer hover:bg-[#2a2a2a] bg-[#1a1a1a]"
            >
              <div className="flex items-start justify-between w-full">
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
                  {item.name}
                </h1>
                <button onClick={() => handleAddToCart(item)} className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg"><FaShoppingCart size={20} /></button>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-[#f5f5f5] text-xl font-bold">
                  Bs {item.price}
                </p>
                <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg gap-6 w-[50%]">
                  <button
                    onClick={() => decrement(item._id)}
                    className="text-yellow-500 text-2xl"
                  >
                    &minus;
                  </button>
                  <span className="text-white">
                    {itemId == item._id ? itemCount : "0"}
                  </span>
                  <button
                    onClick={() => increment(item._id)}
                    className="text-yellow-500 text-2xl"
                  >
                    &#43;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MenuContainer;
