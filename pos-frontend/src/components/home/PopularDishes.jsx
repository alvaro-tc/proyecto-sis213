import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getDishes } from "../../https";
import DishIcon from "../../assets/images/logo.png"; // Placeholder icon

const PopularDishes = () => {
  const { data: res } = useQuery({ queryKey: ["dishes"], queryFn: getDishes });
  const dishes = res?.data?.data || [];
  const popularDishes = dishes.slice(0, 10); // Show max 10

  return (
    <div className="mt-6 pr-6 flex-1 flex flex-col min-h-0 pb-4">
      <div className="bg-theme-surface w-full h-full flex flex-col min-h-0 rounded-lg">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-theme-text text-lg font-semibold tracking-wide">
            Especialidades de la Casa
          </h1>
          <a href="" className="text-[#025cca] text-sm font-semibold">
            Ver todos
          </a>
        </div>

        <div className="overflow-y-auto flex-1 scrollbar-hide pb-20 md:pb-4">
          {popularDishes.map((dish, i) => {
            return (
              <div
                key={dish._id}
                className="flex items-center gap-4 bg-theme-base rounded-[15px] px-6 py-4 mt-4 mx-6"
              >
                <h1 className="text-theme-text font-bold text-xl mr-4">{i + 1 < 10 ? `0${i + 1}` : i + 1}</h1>
                <div className="w-[50px] h-[50px] rounded-full bg-theme-card flex items-center justify-center text-2xl">
                    {dish.category?.icon || "🍲"}
                </div>
                <div>
                  <h1 className="text-theme-text font-semibold tracking-wide">{dish.name}</h1>
                  <p className="text-theme-text text-sm font-semibold mt-1">
                    <span className="text-theme-muted">Precio: </span>
                    Bs {dish.price.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;
